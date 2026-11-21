# Test 2 · Harbour Jackpot · landing page

Live: https://harbour-jackpot.vercel.app (English) · https://harbour-jackpot.vercel.app/mt/ (Maltese)

## Setup

Needs Node 20 or later. There are no dependencies to install.

## Build

    npm run build      # writes dist/index.html (English) and dist/mt/index.html (Maltese)
    npm run preview    # builds, then serves dist/ at http://localhost:8080

All copy, the jackpot, the draw date and the results live in `content.json`. Edit it and run the build again.

## Deploying

`dist/` is plain static files, so any static host works.

- **Vercel (used for the live link):** `vercel.json` sets the build command (`npm run build`) and the output folder (`dist`). Deploy with `npx vercel deploy --prod`, or connect the GitHub repo in Vercel so every push to `main` goes live and every pull request gets a preview link.
- **Other hosts (Netlify, Cloudflare Pages):** build command `npm run build`, output folder `dist`.
- **Traditional server:** run the build in CI and copy `dist/` to the web root (for example with `rsync`). Use long cache times for `assets/` and short ones for the HTML.

`vercel.json` also sends an `X-Robots-Tag: noindex` header, so this demo of a fictional gambling brand stays out of search results. That header is why Lighthouse SEO shows 66. Remove it for a real launch.
