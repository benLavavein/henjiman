const destination = 'bendanielhayden@gmail.com';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(message, status) {
  return Response.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function handleContact(request, env) {
  if (!env.TURNSTILE_SECRET || !env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_EMAIL_API_TOKEN || !env.CONTACT_FROM_EMAIL) {
    return reply('The contact form is temporarily unavailable. Please email me directly.', 503);
  }

  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return reply('This submission could not be accepted.', 403);
  }

  if (Number(request.headers.get('Content-Length')) > 16_384) {
    return reply('The message is too long.', 413);
  }

  let fields;
  try {
    fields = await request.formData();
  } catch {
    return reply('Please check your message and try again.', 400);
  }

  const name = fields.get('name');
  const email = fields.get('email');
  const message = fields.get('message');
  const token = fields.get('cf-turnstile-response');
  if (fields.get('website')) return reply('Thanks for your message.', 200);
  if (typeof name !== 'string' || !name.trim() || name.length > 100 ||
      typeof email !== 'string' || email.length > 254 || !emailPattern.test(email) ||
      typeof message !== 'string' || !message.trim() || message.length > 5000) {
    return reply('Please complete all fields with a valid email address.', 400);
  }
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return reply('Please complete the security check and try again.', 400);
  }

  let verification;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('Turnstile verification failed');
    verification = await response.json();
  } catch {
    return reply('The security check is unavailable. Please try again.', 502);
  }
  const hostname = new URL(request.url).hostname;
  const localTest = (hostname === 'localhost' || hostname === '127.0.0.1') &&
    env.TURNSTILE_SECRET === '1x0000000000000000000000000000000AA' &&
    verification.metadata?.result_with_testing_key === true;
  if (!verification.success || (!localTest && (verification.action !== 'contact' || verification.hostname !== hostname))) {
    return reply('The security check expired or failed. Please try again.', 403);
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: destination,
        from: env.CONTACT_FROM_EMAIL,
        reply_to: email,
        subject: 'New message from henjiman.com',
        text: `Name: ${name.trim()}\nEmail: ${email}\n\n${message.trim()}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json();
    const accepted = result.result?.delivered?.includes(destination) || result.result?.queued?.includes(destination);
    if (!response.ok || !result.success || !accepted || result.result?.permanent_bounces?.length || result.result?.suppressed_recipients?.length) {
      console.error('Contact email delivery failed', result.errors || response.status);
      return reply('I could not send your message. Please email me directly.', 502);
    }
  } catch (error) {
    console.error('Contact email delivery failed', error);
    return reply('I could not send your message. Please email me directly.', 502);
  }

  return reply('Thanks for reaching out. I’ll get back to you soon.', 200);
}
