# Harbour Jackpot · coded hero (Test 1)

The homepage hero from the banner set, built in HTML and CSS. All text is live HTML. The image is the banner artwork from Figma (background, luzzu and wave) with every text layer removed.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The hero markup |
| `hero.css` | Styles, mobile first, one breakpoint at 768px |
| `assets/hero-mobile-750` / `-450` (`.avif`, `.webp`) | Artwork for the 750 × 1000 slot, at 750 and 450px wide |
| `assets/hero-desktop-1920` / `-1280` (`.avif`, `.webp`) | Artwork for the 1920 × 600 slot, at 1920 and 1280px wide |
| `assets/harbourplay-logo.svg` | Harbour Play logo |

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Decisions

- **Live text, not baked in.** The jackpot, draw time, button and compliance line are HTML, so they're readable by screen readers, search engines and AI tools, and easy to update or translate.
- **Art direction with `<picture>` and `srcset`.** Mobile gets the 3:4 banner artwork, desktop the 16:5 one, each at two widths so phones and laptops download only what they need. AVIF first, WebP fallback. `width` and `height` are set on every source to prevent layout shift.
- **Tiny artwork.** Flat vector art compresses well: 10.2 KB for mobile (750px AVIF) and 9.0 KB for desktop (1920px AVIF), far under the 150 KB hero limit. Between 768 and 1330px the hero is taller than 16:5, so the artwork is cropped from the left and the boat stays in view.
- **Loads first.** The artwork has `fetchpriority="high"` and isn't lazy-loaded, because the hero is the first thing on the page.
- **Pressable button.** The Buy ticket button follows the Figma CTA component: idle has a hard Ink shadow (2px, 4px); on hover or press the pill moves 2px right and 4px down into the shadow. Transforms only, so nothing else on the page moves, and the motion is skipped with `prefers-reduced-motion`.
- **One heading.** The `<h1>` reads "Starting jackpot €1,000,000 Harbour Jackpot Saturdays at 21:00". The draw time uses `<time datetime="21:00">`.
- **Safe zone.** On desktop the text stays inside the central 1200px. The boat sits outside it, so cropping on narrow screens loses nothing important.
- **Maltese ready.** Alata and Inter both include Ħ ħ Ġ ġ Ż ż, and the layout wraps rather than clips if the copy gets longer.

## Accessibility (WCAG 2.2 AA)

| Check | Result |
| --- | --- |
| Button text on yellow | 10.6:1 |
| Light-blue subline on the brightest part of the artwork | 5.3:1 on mobile; 4.1:1 on desktop, where it is large text (needs 3:1) |
| Small print over the wave | 9.5:1 or more |
| Compliance text on navy | 10.7:1 |
| Button size | 48px tall |
| Keyboard focus | 3px white outline on the button and the T&Cs link |
| Decorative artwork | `alt=""` |

## Artwork

Exported straight from the Figma banners (Hero desktop · 1920x600 and Hero mobile · 750x1000) with the logo, text, button and compliance line removed, then converted to AVIF and WebP. To update it, edit the banner in Figma and export again without the text layers, keeping the same file names.

## Next (Test 2)

This hero becomes the top of the landing page. The jackpot and draw time will come from the content file, and a countdown to the next draw will sit under the button.

## Credits

- Fonts: [Alata](https://fonts.google.com/specimen/Alata) and [Inter](https://fonts.google.com/specimen/Inter), Google Fonts (SIL Open Font License). The landing page self-hosts them; this standalone hero loads them from Google for simplicity.
- AI use: the HTML/CSS and the boat cut-outs were drafted with Claude. [Add what you checked and changed yourself.]
