# Henjiman

A personal developer site built with Astro and Tailwind CSS.

## Local development

```sh
npm install
npm run dev
```

Build the production site with `npm run build` and preview it locally with `npm run preview`.

## Contact form on Cloudflare Workers

The static contact page submits to the `henjiman` Worker at `/api/contact`. The Worker serves the Astro build from `dist`, validates Turnstile, and sends a plain-text email through Cloudflare Email Service. Workers Builds should use `npm run build` as its build command and `npx wrangler deploy` as its deploy command. The Worker can deploy without secrets, but the form will not send until these values are configured:

| Name | Type | Value |
| --- | --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Build variable | Public sitekey for a Turnstile widget allowing `henjiman.com` and `www.henjiman.com` |
| `TURNSTILE_SECRET` | Encrypted secret | Secret key for that widget |
| `CLOUDFLARE_ACCOUNT_ID` | Variable | Cloudflare account ID |
| `CLOUDFLARE_EMAIL_API_TOKEN` | Encrypted secret | API token scoped to this account with `Email Sending: Edit` permission |
| `CONTACT_FROM_EMAIL` | Variable | Sender on an Email Routing or Email Sending domain in the account, such as `contact@henjiman.com` |

The destination, `bendanielhayden@gmail.com`, must be verified in Cloudflare Email Routing > Destination Addresses. First deploy the Worker script from this repository. A static-assets-only Worker cannot accept runtime secrets. After that deployment, set `TURNSTILE_SECRET` and `CLOUDFLARE_EMAIL_API_TOKEN` as encrypted runtime secrets and `CLOUDFLARE_ACCOUNT_ID` and `CONTACT_FROM_EMAIL` as runtime variables under Workers & Pages > `henjiman` > Settings > Variables and Secrets. Set `PUBLIC_TURNSTILE_SITE_KEY` separately under Settings > Build > Build Variables and Secrets, then redeploy so Astro can embed the sitekey in the generated page. Cloudflare Email Routing alone is enough to send to a verified destination address, provided the sender is on a routing domain in the account.

Create a Turnstile widget in the Cloudflare dashboard with `henjiman.com` and `www.henjiman.com` as allowed hostnames. The Worker validates the token, action, and hostname before sending. For local form testing, build with `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build`, put the matching test secret (`1x0000000000000000000000000000000AA`) and the email API values in an ignored `.dev.vars` file, then run `npx wrangler dev`. Local test keys are accepted only on localhost; do not use them in production.
