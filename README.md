#Test 2 · Harbour Jackpot · landing page

## Setup and build

Needs Node 20 or later. There are no dependencies to install.

## Deploying

Deployed on vercel.

## Accessibility (WCAG 2.2 AA)

- One `<h1>`, headings in order, a skip link, landmarks (`header`, `main`, `footer`, labelled sections).
- Prize tiers are a real `<table>` with a caption and `scope` on header cells.
- FAQ uses `<details>`/`<summary>`, so it works with keyboard and screen readers without JavaScript.
- The countdown is hidden from screen readers (it would announce every second). The draw date is plain text next to it instead.
- Contrast: lowest text pair is 6.45:1 (grey text on the light blue safer gambling block). Button text on yellow is 10.6:1.
- Touch targets are 44px or more. Inline links inside sentences are exempt under WCAG 2.5.8.
- Visible focus outlines everywhere, white on dark backgrounds.
- No motion except a short colour transition, which is off for `prefers-reduced-motion`.
