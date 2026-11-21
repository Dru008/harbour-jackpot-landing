# Harbour Jackpot · landing page (Test 2)

Campaign landing page for Harbour Jackpot, the fictional weekly draw from Harbour Play. Hand-coded HTML, CSS and a little JavaScript, built to static files from one content file. No frameworks and no page builders.

## Setup and build

Needs Node 20 or later. There are no dependencies to install.

```bash
npm run build      # writes dist/index.html (English) and dist/mt/index.html (Maltese)
npm run preview    # builds, then serves dist/ at http://localhost:8080
```

## Editing content

Everything marketing changes week to week lives in **`content.json`**:

| What | Where in `content.json` |
| --- | --- |
| Jackpot amount | `draw.jackpot` |
| Next draw date and time | `draw.nextDraw` (ISO date with Malta offset, e.g. `2026-11-21T21:00:00+01:00`) |
| Ticket price | `draw.ticketPrice` |
| Latest results | `results.numbers`, `results.harbourBall`, `results.date` |
| Prize tiers and odds | `prizes` |
| FAQ | `en.faq.items` |
| All page copy | `en` (English) and `mt` (Maltese) |

Edit the file, run `npm run build`, deploy `dist/`. If the date in the file has passed, the countdown moves on to the next Saturday automatically, so the page never shows a countdown to a draw that's already happened.

In WordPress, the same fields would be ACF fields on a "Campaign" options page (jackpot, draw date, results, a repeater for FAQ and prizes), rendered by the theme in the same markup.

## Project structure

```
content.json       Content and copy (EN + MT)
build.mjs          Renders content.json into static HTML
src/styles.css     All styles, mobile first
src/countdown.js   Countdown and mobile sticky buy bar (progressive enhancement)
src/assets/        Logo and hero artwork (AVIF + WebP)
dist/              Build output (not committed)
test1-hero/        Test 1: the homepage hero coded on its own (see its README)
```

## Deploying

`dist/` is plain static files, so any static host works. On Netlify, Vercel or Cloudflare Pages: build command `npm run build`, output directory `dist`. `vercel.json` already sets this for Vercel, and sends an `X-Robots-Tag: noindex` header so this demo of a fictional gambling brand stays out of search results. The HTML itself is fully indexable, as a real launch would be. Each push to `main` deploys to production, and each pull request gets a preview URL for review before it goes live.

On a traditional server: run the build in CI and copy `dist/` to the web root (for example with `rsync`), with long cache headers on `assets/` and short ones on the HTML.

## Decisions

- **Static HTML from a content file.** Search engines read the jackpot, draw time, prizes, results and FAQ as plain text, with no JavaScript needed. Only the live countdown and the sticky bar use JavaScript.
- **Structured data.** `FAQPage` for the FAQ and `Event` for the next draw (date, €3 price, 18+), so search results can pick up the draw time correctly.
- **Mobile first.** 72% of traffic is mobile. On phones a sticky "Buy ticket" bar appears once the hero button scrolls away. It hides again over the safer gambling block and the footer, so the page never pushes a sale next to the support content.
- **Clear prize odds.** Odds are shown for every tier, plus the overall odds (1 in 19.2), so players can make an informed choice. On small screens "Harbour Ball" is shortened to "HB" visually, while screen readers still hear the full label.
- **Maltese.** `/mt/` is built from the same template, with `hreflang` links between the two. The FAQ answers aren't translated yet, so that block keeps `lang="en"` on the Maltese page and screen readers pronounce it correctly. Maltese dates are formatted by hand in the countdown, because some browsers ship without Maltese date names.

## Accessibility (WCAG 2.2 AA)

- One `<h1>`, headings in order, a skip link, landmarks (`header`, `main`, `footer`, labelled sections).
- Prize tiers are a real `<table>` with a caption and `scope` on header cells.
- FAQ uses `<details>`/`<summary>`, so it works with keyboard and screen readers without JavaScript.
- The countdown is hidden from screen readers (it would announce every second). The draw date is plain text next to it instead.
- Contrast: lowest text pair is 6.45:1 (grey text on the light blue safer gambling block). Button text on yellow is 10.6:1.
- Touch targets are 44px or more. Inline links inside sentences are exempt under WCAG 2.5.8.
- Visible focus outlines everywhere, white on dark backgrounds.
- No motion except a short colour transition, which is off for `prefers-reduced-motion`.

## Performance

Mobile targets from the brief: LCP under 2.5s, CLS under 0.1, INP under 200ms.

- The hero artwork is the Figma banner artwork (glow, luzzu and wave) with the text removed: 10.2 KB on mobile and 9.0 KB on desktop (AVIF), served at two widths each with `srcset`, not lazy-loaded, with `fetchpriority="high"`. All hero text is live HTML.
- Every image has `width` and `height`; the countdown renders placeholder digits at full size, so nothing shifts when it starts.
- One CSS file, one small deferred script, no frameworks. Total page weight: 104 KiB.
- Fonts are self-hosted variable WOFF2 files, split into Latin and Latin Extended so the Maltese letters only download on pages that use them. The two Latin files are preloaded.

### Lighthouse (mobile, live site)

Full report: [`reports/lighthouse-mobile.report.html`](reports/lighthouse-mobile.report.html) (open it in a browser). Run on https://harbour-jackpot.vercel.app/ with Lighthouse's default mobile emulation and simulated slow 4G.

| Metric | Result | Target |
| --- | --- | --- |
| Performance | 100 | |
| Accessibility | 100 | |
| Best practices | 100 | |
| SEO | 66, see below | |
| Largest Contentful Paint | 1.6 s | under 2.5 s |
| Cumulative Layout Shift | 0 | under 0.1 |
| Total Blocking Time | 0 ms | (lab stand-in for INP, target under 200 ms) |

**SEO 66 is deliberate.** The only failing audit is "Page is blocked from indexing", caused by the `X-Robots-Tag: noindex` header in `vercel.json`, which keeps this fictional gambling brand out of search results. Every other SEO audit passes (title, meta description, canonical, `hreflang`, link text, crawlable links, structured data). Remove the header and the score is 100.

The first run scored 92 for performance with a 3.2 s LCP: the Google Fonts stylesheet blocked rendering for about 950 ms. Self-hosting and preloading the fonts brought LCP down to 1.5 s.

## Placeholder content

- Helpline number `8000 1234` is fictional.
- Results and winner counts are made up for the mockup.

## Credits

- Fonts: [Alata](https://fonts.google.com/specimen/Alata) and [Inter](https://fonts.google.com/specimen/Inter), SIL Open Font License, self-hosted from Google Fonts.
- Luzzu illustration and Harbour Play logo: my own, from the Figma banner file.
