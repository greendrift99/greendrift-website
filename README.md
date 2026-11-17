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
