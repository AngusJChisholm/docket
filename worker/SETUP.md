# Switching on "Send my plan" emails

Until this is set up, "Send my plan" downloads the PDFs instead. About 20 minutes, all free except the domain.

## 1. Buy a domain
Buy something like `getdocket.com.au` (a .com.au needs an ABN) or `getdocket.com`. Any registrar works; Cloudflare Registrar is the cheapest and makes step 2 easier.

## 2. Resend (sends the emails)
1. Sign up at resend.com.
2. **Domains > Add domain**, enter your domain.
3. Add the DNS records Resend shows you at your domain registrar. Wait for it to say **Verified**.
4. **API Keys > Create API key** (Sending access). Copy it somewhere safe.

## 3. Cloudflare Worker (the bit of code that talks to Resend)
1. Sign up at dash.cloudflare.com.
2. **Workers & Pages > Create > Create Worker**. Name it `docket-mailer`, click **Deploy**.
3. Click **Edit code**, delete what's there, paste in everything from `worker/worker.js`, then **Deploy**.
4. Go to the worker's **Settings > Variables and secrets** and add:
   - `RESEND_API_KEY` (type **Secret**): your Resend key
   - `FROM_EMAIL`: `Docket <plans@yourdomain>`
   - `ALLOWED_ORIGIN`: `https://angusjchisholm.github.io` (add your own domain later, comma separated)
   - `SITE_URL`: `https://angusjchisholm.github.io/docket/plan.html`
5. Copy the worker's address (like `https://docket-mailer.yourname.workers.dev`).

## 4. Connect the site
In `js/config.js`, set `emailEndpoint` to the worker address, then push. Test it by sending a plan to yourself.

## Keeping it safe
The worker only accepts PDFs from your site, limits sends per person, and only lets the dinner names change in the email. If it ever gets abused, add Cloudflare Turnstile (a free "are you human" check) in front of the form.
