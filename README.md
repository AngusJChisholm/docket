# Docket

Meal kit dinners. Supermarket prices.

A static site: no build step, no framework. Open `index.html` in a browser to run it locally.

## What's where

| File | What it is |
| --- | --- |
| `index.html` | Homepage: hero, how it works, Kit Tax calculator, sample dinners, story, FAQ, sign-up |
| `plan.html` | The planner: set your week, pick dinners, get the shopping list and your docket |
| `js/data.js` | **Recipes, ingredient prices and meal-kit prices.** Edit this to change the menu or prices |
| `js/config.js` | Sign-up form endpoint and the weekly pantry-staples allowance |
| `js/planner.js`, `js/home.js` | Page logic |
| `js/pdf.js` | Builds the shopping list and recipe PDFs in the browser |
| `worker/` | The Docket mailer that emails the PDFs. Setup steps in `worker/SETUP.md` |
| `assets/css/docket.css` | All styles, built from the Docket brand colours |
| `assets/img/` | Logo, icon, favicon, ticket and social share image |

## Common updates

- **Change a price:** in `js/data.js`, find the ingredient in `ING` and change `p` (the Coles pack price) or `pk` (pack size).
- **Add a recipe:** add an entry to `R` in `js/data.js` with ingredients per serve and method steps.
- **Update meal-kit prices:** edit `KITS_DEFAULT` in `js/data.js`, and the date in the site footer.
- **Switch on plan emails:** follow `worker/SETUP.md`, then set `emailEndpoint` in `js/config.js`.
- **Switch on email sign-ups:** paste your form endpoint into `waitlistEndpoint` in `js/config.js`.

Supermarket prices are estimates while Docket is in beta. Woolworths and Aldi prices are derived from the Coles figures.
