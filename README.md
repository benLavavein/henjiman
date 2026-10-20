# Henjiman

A personal developer site built with Astro and Tailwind CSS.

## Local development

```sh
npm install
npm run dev
```

Build the production site with `npm run build` and preview it locally with `npm run preview`.

## Contact form on Cloudflare Workers

The static contact page submits to the `henjiman` Worker at `/api/contact`. The Worker serves the Astro build from `dist`, validates Turnstile, and sends a plain-text email through a Cloudflare email binding. Workers Builds should use `npm run build` as its build command and `npx wrangler deploy` as its deploy command. The Worker can deploy without secrets, but the form will not send until these runtime values are configured:

| Name | Type | Value |
| --- | --- | --- |
| `TURNSTILE_SITE_KEY` | Runtime secret | Public sitekey for a Turnstile widget allowing `henjiman.com` and `www.henjiman.com` |
| `TURNSTILE_SECRET` | Encrypted secret | Secret key for that widget |
| `CONTACT_FROM_EMAIL` | Variable | Sender on an Email Routing or Email Sending domain in the account, such as `contact@henjiman.com` |

The `CONTACT_EMAIL` binding in `wrangler.jsonc` restricts delivery to `bendanielhayden@gmail.com`, which must be verified in Cloudflare Email Routing > Destination Addresses. The sender domain must be enabled for Cloudflare email sending. A static-assets-only Worker cannot accept runtime secrets, so first deploy the Worker script from this repository. The sitekey is fetched at runtime; no build variable is needed. If the dashboard still blocks variables, set each value from the repo root with `npx wrangler secret put NAME`. Wrangler prompts for the value without putting it in the command line. All three values can be stored as Worker secrets, even though the sitekey and sender address are not sensitive. No email API token is required.

Create a Turnstile widget in the Cloudflare dashboard with `henjiman.com` and `www.henjiman.com` as allowed hostnames. The Worker validates the token, action, and hostname before sending. For local form testing, put the test sitekey (`1x00000000000000000000AA`), matching test secret (`1x0000000000000000000000000000000AA`), and `CONTACT_FROM_EMAIL` in an ignored `.dev.vars` file, then run `npm run build` and `npx wrangler dev`. Local test keys are accepted only on localhost; do not use them in production.
