// Site settings you can change without touching the rest of the code.
window.DOCKET_CONFIG = {
  // Paste your sign-up form endpoint here (for example a Formspree form URL like
  // "https://formspree.io/f/abcdwxyz"). Leave it empty and the form says sign-ups open soon.
  waitlistEndpoint: "",
  // The Docket mailer (Cloudflare Worker) URL that emails the PDFs, e.g. "https://docket-mailer.yourname.workers.dev/send".
  // Leave empty and "Send my plan" downloads the PDFs instead.
  emailEndpoint: "",
  // Weekly allowance for pantry staples (oil, salt, pepper, sugar), added to every Docket total.
  staplesPerWeek: 10
};
