import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleContact } from '../src/server/contact.js';
import { contactEmail } from '../src/server/contact-email.js';
import worker from '../src/worker.js';

const env = {
  TURNSTILE_SECRET: 'test-secret',
  CONTACT_FROM_EMAIL: 'contact@henjiman.com',
  CONTACT_EMAIL: { send: async () => ({ messageId: 'test-message-id' }) },
};

function request(fields = {}) {
  return new Request('https://henjiman.com/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://henjiman.com' },
    body: new URLSearchParams({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello Ben',
      'cf-turnstile-response': 'valid-token',
      ...fields,
    }),
  });
}

test('rejects incomplete submissions before sending', async () => {
  const response = await handleContact(request({ email: 'invalid' }), env);
  assert.equal(response.status, 400);
});

test('rejects a token with the wrong hostname', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ success: true, action: 'contact', hostname: 'other.example' });

  const response = await handleContact(request(), env);
  assert.equal(response.status, 403);
});

test('sends validated messages to the fixed destination', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  let sentMessage;
  globalThis.fetch = async () => Response.json({ success: true, action: 'contact', hostname: 'henjiman.com' });

  const response = await handleContact(request(), {
    ...env,
    CONTACT_EMAIL: { send: async (message) => { sentMessage = message; } },
  });
  assert.equal(response.status, 200);
  assert.equal(sentMessage.to, 'bendanielhayden@gmail.com');
  assert.equal(sentMessage.replyTo, 'jane@example.com');
  assert.match(sentMessage.text, /Hello Ben/);
  assert.match(sentMessage.html, /A note from Jane/);
});

test('escapes visitor content in the HTML email', () => {
  const result = contactEmail({
    name: '<Alex & Co>',
    email: 'alex@example.com',
    message: '<script>alert("hi")</script>\nNice to meet you.',
  });
  assert.match(result.html, /&lt;Alex &amp; Co&gt;/);
  assert.match(result.html, /&lt;script&gt;alert\(&quot;hi&quot;\)&lt;\/script&gt;<br>Nice to meet you\./);
  assert.doesNotMatch(result.html, /<script>/);
  assert.match(result.text, /<script>/);
});

test('does not claim a failed email was sent', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ success: true, action: 'contact', hostname: 'henjiman.com' });

  const response = await handleContact(request(), {
    ...env,
    CONTACT_EMAIL: { send: async () => { throw new Error('Sending failed'); } },
  });
  assert.equal(response.status, 502);
});

test('does not expose a Turnstile sitekey until the form is configured', async () => {
  const response = await worker.fetch(new Request('https://henjiman.com/api/contact-config'), env);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { sitekey: null });
});

test('serves the public Turnstile sitekey from Worker settings', async () => {
  const response = await worker.fetch(new Request('https://henjiman.com/api/contact-config'), {
    ...env,
    TURNSTILE_SITE_KEY: 'public-sitekey',
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { sitekey: 'public-sitekey' });
});
