import { handleContact } from './server/contact.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact-config') {
      if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
      }
      const ready = env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET && env.CONTACT_EMAIL && env.CONTACT_FROM_EMAIL;
      return Response.json(
        { sitekey: ready ? env.TURNSTILE_SITE_KEY : null },
        { status: ready ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
      }
      return handleContact(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
