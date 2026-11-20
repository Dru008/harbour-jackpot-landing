# Harbour Jackpot · coded hero (Test 1)

The homepage hero from the banner set, built in HTML and CSS. All text is live HTML. The image holds only the luzzu artwork.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The hero markup |
| `hero.css` | Styles, mobile first, one breakpoint at 768px |
| `assets/hero-boat-mobile.avif` / `.webp` | Boat artwork for the 750 × 1000 slot (750 × 550, transparent) |
| `assets/hero-boat-desktop.avif` / `.webp` | Boat artwork for the 1920 × 600 slot (540 × 600, transparent) |
| `assets/harbourplay-logo.svg` | Harbour Play logo |

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Decisions

- **Live text, not baked in.** The jackpot, draw time, button and compliance line are HTML, so they're readable by screen readers, search engines and AI tools, and easy to update or translate.
- **Art direction with `<picture>`.** Mobile gets a wide crop of the whole boat; desktop gets the bow only, at the right edge. AVIF first, WebP fallback. `width` and `height` are set on every source to prevent layout shift.
- **The boat is the only image.** The blue glow is a CSS gradient, so it costs nothing and scales to any screen. Artwork weighs 12.6 KB (mobile AVIF) and 10.3 KB (desktop AVIF).
- **Loads first.** The artwork has `fetchpriority="high"` and isn't lazy-loaded, because the hero is the first thing on the page.
- **One heading.** The `<h1>` reads "Starting jackpot €1,000,000 Harbour Jackpot Saturdays 21:00". The draw time uses `<time datetime="21:00">`.
- **Safe zone.** On desktop the text stays inside the central 1200px. The boat sits outside it, so cropping on narrow screens loses nothing important.
- **Maltese ready.** Jost and Inter both include Ħ ħ Ġ ġ Ż ż, and the layout wraps rather than clips if the copy gets longer.

## Accessibility (WCAG 2.2 AA)

| Check | Result |
| --- | --- |
| Button text on yellow | 10.6:1 |
| Light-blue text on the brightest part of the glow | 4.8:1 (glow darkened from `#0560E0` to `#0452C4` to pass) |
| Yellow jackpot on the brightest part of the glow | 4.3:1 (large text, needs 3:1) |
| Compliance text on navy | 10.7:1 |
| Button size | 48px tall |
| Keyboard focus | 3px white outline on the button and the T&Cs link |
| Decorative artwork | `alt=""` |

## Swapping in the final artwork

The current boat images were cut out of the exported banners. To replace them:

1. In Figma, hide the background and all text, then export only the boat layer as PNG at 2× (transparent).
2. Convert to AVIF and WebP (for example with [Squoosh](https://squoosh.app)).
3. Keep the same file names, and update `width` and `height` in `index.html` if the size changes.

## Next (Test 2)

This hero becomes the top of the landing page. The jackpot and draw time will come from the content file, and a countdown to the next draw will sit under the button.

## Credits

- Fonts: [Jost](https://fonts.google.com/specimen/Jost) and [Inter](https://fonts.google.com/specimen/Inter), Google Fonts (SIL Open Font License). For production I'd self-host them as subset WOFF2 files.
- AI use: the HTML/CSS and the boat cut-outs were drafted with Claude. [Add what you checked and changed yourself.]
