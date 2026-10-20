import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleContact } from '../src/server/contact.js';

const env = {
  TURNSTILE_SECRET: 'test-secret',
  CLOUDFLARE_ACCOUNT_ID: 'account-id',
  CLOUDFLARE_EMAIL_API_TOKEN: 'api-token',
  CONTACT_FROM_EMAIL: 'contact@henjiman.com',
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
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('siteverify')) {
      return Response.json({ success: true, action: 'contact', hostname: 'henjiman.com' });
    }
    sentMessage = JSON.parse(options.body);
    return Response.json({ success: true, result: { delivered: ['bendanielhayden@gmail.com'], queued: [] } });
  };

  const response = await handleContact(request(), env);
  assert.equal(response.status, 200);
  assert.equal(sentMessage.to, 'bendanielhayden@gmail.com');
  assert.equal(sentMessage.reply_to, 'jane@example.com');
  assert.match(sentMessage.text, /Hello Ben/);
});
