// Site settings you can change without touching the rest of the code.
window.DOCKET_CONFIG = {
  // Paste your sign-up form endpoint here (for example a Formspree form URL like
  // "https://formspree.io/f/abcdwxyz"). Leave it empty and the form says sign-ups open soon.
  waitlistEndpoint: "",
  // The Riversdale Fresh mailer (Cloudflare Worker) URL that emails the PDFs, e.g. "https://riversdale-fresh-mailer.yourname.workers.dev/send".
  // Leave empty and "Send my plan" downloads the PDFs instead.
  emailEndpoint: "",
  // Weekly allowance for pantry staples (oil, salt, pepper, sugar), added to every Riversdale Fresh total.
  staplesPerWeek: 10,
  // Who can see the full recipes. 'open' = everyone, no sign-up. 'email' = this week's picks free,
  // the rest free with an email. 'pro' = paid members only (needs recipeEndpoint).
  recipeAccess: 'open'
};
