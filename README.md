# Green Drift website

Responsive Green Drift marketing website, weekly rider rental request flow and investment calculator. Static pages run on Vercel; contact and investment forms use server-side Vercel Functions.

## Deploy from GitHub

Import this repository into Vercel. Use **Other** as the framework preset, `public` as the output directory and leave the build command empty. The committed `vercel.json` supplies the output directory and clean URLs. Node.js 22 is specified in `package.json`.

Configure these server-side environment variables for Production and Preview before deployment:

- `LEAD_BACKEND_URL`: `https://green-drift-mobility.knitoctet8.chatgpt.site`
- `LEAD_PROXY_KEY`: a secret matching the Green Drift backend's `LEAD_PROXY_KEY`.

Never commit secret values or use a public client-side environment-variable prefix. `.env.example` lists keys only.

The website and Vercel API functions deploy from this repository. **Existing lead records and durable storage remain in the current Green Drift backend**. The Vercel Functions securely forward the two enquiry types to that backend; they never store leads in browser storage. Keep that backend active until a separate storage migration is performed. The admin export endpoint and its credentials are not exposed by this repository.

The investor portal is a separate demo and is not included in the marketing deployment.

## Checks

Run `npm test` (no dependencies required). Tests cover the API bridge's request validation, secret handling, backend errors and success responses, plus the calculator's economics and vehicle minimums.

## Content and functionality

- Actual supplied light/dark logos and brand assets
- Fixed and 60/40 revenue-sharing calculator; editable ₹85,000 default vehicle price
- Revenue Sharing minimum 50 vehicles; Hub minimum 100
- Contact and investment enquiry capture with consent
- Weekly rider requests prepared for review and sending via WhatsApp
- Google Play Rider app link
- Animated investor journey with reduced-motion support

Investment calculations are illustrative; the site explains assumptions and does not collect investment payments. Rental prices are not publicly displayed.

Custom domains should be attached only after the Vercel deployment and forms have been verified. No DNS changes are required for the initial Vercel preview URL.

## Lead email notifications

Contact and investor enquiries are saved by the existing backend before a Resend
notification is sent to `contact@greendrift.in`. Set `RESEND_API_KEY` and
`RESEND_EMAIL_DOMAIN` through the Resend Vercel integration. The sending subdomain
is `mail.greendrift.in`; complete the DNS verification in the integration dashboard.
Emails include contact details, enquiry reference and selected investment inputs.
The visitor's email becomes Reply-To; the recipient is fixed server-side.
Temporary send failures retry once with a stable idempotency key. Saved enquiries
still succeed if email is unavailable. Check Vercel logs for `lead_email_failed`
or `lead_email_unconfigured` and recover the enquiry from the saved backend using
its reference. There is no automatic retry queue beyond the immediate retry.

## Custom EV marketplace

The storefront at `/ev-marketplace` and seller/admin/account screens use
`/api/marketplace` with Neon Postgres. Apply the additive schema with
`node --env-file=.env.local scripts/market-migrate.mjs` before deployment.
Required runtime configuration: `DATABASE_URL`, `LEAD_PROXY_KEY` (OTP HMAC key),
`RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN`. Never expose these to the browser.

Sign-in codes expire in 10 minutes, allow five verification attempts and are
consumed atomically. Session tokens are random, stored hashed and delivered only
in a Secure, HttpOnly, SameSite=Lax cookie. Writes enforce the website origin and
shared database rate limits. Admin access requires email verification as
`contact@greendrift.in`; this is checked server-side on every admin action.
Seller applications and product submissions start pending. Product edits return
to pending. Public reads require both product and seller to be approved. Review
changes are audited. Seller suspension hides all their listings immediately.

The current release supports seller-confirmed **order requests**, not prepaid
checkout. Prices and seller identity are read on the server; request keys prevent
duplicate requests. Requests do not reserve inventory. Seller statuses are
requested → accepted → dispatched → delivered, with cancellation before dispatch.
Tax/shipping totals, payment gateway, commissions, refunds/disputes and automated
seller settlements are not implemented. Seller verification is a manual admin
review, not automated KYC. Images use seller-provided HTTPS URLs, not file uploads.
No demo accounts, inventory, ratings or stock are seeded.

`npm test` checks request guards and input validation. Run
`node --env-file=.env.local scripts/market-integration.mjs` for the real database
workflow in uniquely prefixed temporary tables; it mocks email delivery, tests
OTP, approvals, isolation, order transitions and idempotency, then removes its
own tables. It does not send emails or seed production listings.
