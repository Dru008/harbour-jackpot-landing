// Builds static HTML from content.json: dist/index.html (English) and dist/mt/index.html (Maltese).
// No dependencies. Run with: node build.mjs
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const data = JSON.parse(await readFile(new URL('content.json', root), 'utf8'));
const { site, draw, prizes, results } = data;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
const euro = (n) => new Intl.NumberFormat('en-MT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const num = (n) => new Intl.NumberFormat('en-MT').format(n);
const dateFmt = (iso, locale, opts) => new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Malta', ...opts }).format(new Date(iso));

// Maltese falls back to English for anything not translated yet; those sections get lang="en".
function merge(base, over) {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over ?? {})) out[k] = merge(base[k], over[k]);
  return out;
}

function page(lang) {
  const t = lang === 'en' ? data.en : merge(data.en, data.mt);
  const isEn = lang === 'en';
  const prefix = isEn ? '' : '../';
  const url = isEn ? `${site.url}/` : `${site.url}/mt/`;
  const locale = isEn ? 'en-GB' : 'mt';
  const fallback = (key) => (!isEn && !data.mt[key]?.items && key === 'faq' ? ' lang="en"' : '');
  const vars = { brand: site.brand, operator: site.operator, regulator: site.regulator, licence: site.licence, year: site.year, phone: site.helpline };

  const nextDrawText = dateFmt(draw.nextDraw, locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const resultsDate = dateFmt(results.date, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const prizeCell = (p) => p === 'jackpot'
    ? `${esc(t.prizes.jackpot)}<span class="prize-sub">${esc(t.prizes.jackpotFrom)}</span>`
    : esc(p === 'freeTicket' ? t.prizes.freeTicket : euro(p));
  // Full label for screen readers and desktop; short "5 + HB" label on small screens
  const matchCell = (m) => `<span class="match-full">${esc(m)}</span><span class="match-short" aria-hidden="true">${esc(m.replace('Harbour Ball', 'HB'))}</span>`;

  const faqItems = data.en.faq.items; // FAQ answers are English-only for now
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }))
  };
  const eventLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${draw.name} draw`,
    startDate: draw.nextDraw,
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'VirtualLocation', url },
    organizer: { '@type': 'Organization', name: site.brand, url: site.url },
    offers: { '@type': 'Offer', price: draw.ticketPrice, priceCurrency: 'EUR', url, availability: 'https://schema.org/InStock' },
    typicalAgeRange: '18-'
  };

  const countdownUnits = ['d', 'h', 'm', 's'].map((u) => `
              <span class="countdown__unit"><span class="countdown__value" data-unit="${u}">--</span><span class="countdown__label">${esc(t.hero.units[u])}</span></span>`).join('');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(t.meta.title)}</title>
  <meta name="description" content="${esc(t.meta.description)}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${site.url}/">
  <link rel="alternate" hreflang="mt" href="${site.url}/mt/">
  <link rel="alternate" hreflang="x-default" href="${site.url}/">
  <meta name="theme-color" content="#0A2346">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(t.meta.title)}">
  <meta property="og:description" content="${esc(t.meta.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site.url}/assets/og-harbour-jackpot-1200x630.webp">
  <meta property="og:image:alt" content="Harbour Jackpot: starting jackpot €1,000,000, Saturdays at 21:00. 18+.">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">

  <link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${prefix}fonts/alata-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${prefix}fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${prefix}styles.css">
  <script src="${prefix}countdown.js" defer></script>

  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <script type="application/ld+json">${JSON.stringify(eventLd)}</script>
</head>
<body>
  <a class="skip-link" href="#main">${esc(t.skip)}</a>

  <header class="site-header">
    <div class="site-header__inner">
      <a class="site-header__logo" href="${prefix || './'}"><img src="${prefix}assets/harbourplay-logo.svg" width="185" height="76" alt="${esc(site.brand)}"></a>
      <nav class="lang-switch" aria-label="${esc(t.langSwitchLabel)}">
        <a href="${isEn ? './' : '../'}" hreflang="en" lang="en"${isEn ? ' aria-current="page"' : ''}>EN</a>
        <a href="${isEn ? 'mt/' : './'}" hreflang="mt" lang="mt"${isEn ? '' : ' aria-current="page"'}>MT</a>
      </nav>
    </div>
  </header>

  <main id="main">

    <section class="hero" aria-labelledby="hero-heading">
      <!-- Banner artwork from Figma (background, luzzu, wave) with the text removed; every word on the hero is live HTML -->
      <picture class="hero__art">
        <source media="(min-width: 768px)" type="image/avif" srcset="${prefix}assets/hero-desktop-1280.avif 1280w, ${prefix}assets/hero-desktop-1920.avif 1920w" sizes="100vw" width="1920" height="600">
        <source media="(min-width: 768px)" type="image/webp" srcset="${prefix}assets/hero-desktop-1280.webp 1280w, ${prefix}assets/hero-desktop-1920.webp 1920w" sizes="100vw" width="1920" height="600">
        <source type="image/avif" srcset="${prefix}assets/hero-mobile-450.avif 450w, ${prefix}assets/hero-mobile-750.avif 750w" sizes="100vw" width="750" height="1000">
        <img src="${prefix}assets/hero-mobile-750.webp" srcset="${prefix}assets/hero-mobile-450.webp 450w, ${prefix}assets/hero-mobile-750.webp 750w" sizes="100vw" width="750" height="1000" alt="" fetchpriority="high" decoding="async">
      </picture>

      <div class="hero__content">
        <h1 class="hero__heading" id="hero-heading">
          <span class="hero__eyebrow">${esc(t.hero.eyebrow)}</span>
          <span class="hero__jackpot">${euro(draw.jackpot)}</span>
          <span class="hero__meta">
            <span>${esc(draw.name)}</span>
            <span class="hero__divider" aria-hidden="true"></span>
            <span>${esc(t.hero.drawDay)} <time datetime="21:00">21:00</time></span>
          </span>
        </h1>

        <div class="countdown" data-draw="${draw.nextDraw}" data-drawing="${esc(t.hero.drawing)}">
          <p class="countdown__title">${esc(t.hero.nextDraw)}: <time datetime="${draw.nextDraw}">${esc(nextDrawText)}, 21:00</time></p>
          <p class="countdown__clock" aria-hidden="true">${countdownUnits}
          </p>
        </div>

        <a class="btn btn--primary hero__cta" href="#buy-ticket" id="hero-cta">${esc(t.hero.cta)}</a>
      </div>

      <p class="compliance hero__compliance">
        <span class="age-badge">18+</span>
        <span>${esc(t.compliance.line)} <a href="#terms">${esc(t.compliance.terms)}</a>.</span>
      </p>
    </section>

    <section class="section how" aria-labelledby="how-heading">
      <div class="container">
        <h2 id="how-heading">${esc(t.howToPlay.heading)}</h2>
        <p class="section__intro">${esc(t.howToPlay.intro)}</p>
        <ol class="steps">
${t.howToPlay.steps.map((s, i) => `          <li class="step">
            <span class="step__num" aria-hidden="true">${i + 1}</span>
            <h3 class="step__title">${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </li>`).join('\n')}
        </ol>
      </div>
    </section>

    <div class="section section--alt">
      <div class="container split">

        <section class="prizes" aria-labelledby="prizes-heading">
          <h2 id="prizes-heading">${esc(t.prizes.heading)}</h2>
          <p class="ball-legend" aria-hidden="true">${esc(t.prizes.ballLegend)}</p>
          <div class="table-wrap">
            <table class="prize-table">
              <caption class="visually-hidden">${esc(t.prizes.caption)}</caption>
              <thead>
                <tr>${t.prizes.cols.map((c, i) => `<th scope="col"${i ? ' class="num"' : ''}>${esc(c)}</th>`).join('')}</tr>
              </thead>
              <tbody>
${prizes.map((p, i) => `                <tr${i === 0 ? ' class="is-jackpot"' : ''}><th scope="row">${matchCell(p.match)}</th><td class="num">${prizeCell(p.prize)}</td><td class="num">${num(p.odds)}</td></tr>`).join('\n')}
              </tbody>
            </table>
          </div>
          <p class="note">${esc(fill(t.prizes.overall, { odds: data.overallOdds }))} ${esc(t.prizes.rollover)}</p>
        </section>

        <section class="results" aria-labelledby="results-heading">
          <h2 id="results-heading">${esc(t.results.heading)}</h2>
          <div class="results-card">
            <p class="results-card__date"><time datetime="${results.date}">${esc(resultsDate)}</time></p>
            <ul class="balls" aria-label="${esc(t.results.numbersLabel)}">
${results.numbers.map((n) => `              <li class="ball">${n}</li>`).join('\n')}
              <li class="ball ball--harbour"><span class="visually-hidden">${esc(t.results.ballLabel)}: </span>${results.harbourBall}</li>
            </ul>
            <p class="balls__legend"><span class="ball ball--harbour ball--tiny" aria-hidden="true"></span> ${esc(t.results.ballLabel)}</p>
            <p>${esc(fill(t.results.jackpotWon, { n: results.jackpotWinners }))}</p>
            <p class="note">${esc(fill(t.results.totalWinners, { n: num(results.totalWinners) }))}</p>
            <a class="link-arrow" href="#results">${esc(t.results.all)}</a>
          </div>
        </section>

      </div>
    </div>

    <section class="section faq" aria-labelledby="faq-heading">
      <div class="container container--narrow">
        <h2 id="faq-heading">${esc(t.faq.heading)}</h2>
        <div class="faq__list"${fallback('faq')}>
${faqItems.map((i) => `          <details class="faq__item">
            <summary>${esc(i.q)}</summary>
            <p>${esc(i.a)}</p>
          </details>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="section safer" aria-labelledby="safer-heading" id="safer-gambling">
      <div class="container safer__inner">
        <div class="safer__intro">
          <span class="age-badge age-badge--large" aria-hidden="true">18+</span>
          <h2 id="safer-heading">${esc(t.safer.heading)}</h2>
          <p>${esc(t.safer.body)}</p>
          <a class="btn btn--outline" href="#safer-tools">${esc(t.safer.link)}</a>
          <p class="safer__help">${esc(t.safer.help)} <a href="tel:${site.helpline.replace(/\s/g, '')}">${esc(fill(t.safer.helpLink, vars))}</a></p>
        </div>
        <ul class="safer__tools">
${t.safer.tools.map((x) => `          <li><strong>${esc(x.title)}</strong> <span>${esc(x.text)}</span></li>`).join('\n')}
        </ul>
      </div>
    </section>

  </main>

  <footer class="site-footer" id="terms">
    <div class="container">
      <div class="site-footer__top">
        <img src="${prefix}assets/harbourplay-logo.svg" width="185" height="76" alt="${esc(site.brand)}" class="site-footer__logo">
        <ul class="site-footer__nav">
${t.footer.nav.map((n) => `          <li><a href="#">${esc(n)}</a></li>`).join('\n')}
        </ul>
      </div>
      <p class="site-footer__warning"><span class="age-badge">18+</span> ${esc(t.footer.warning)}</p>
      <p class="site-footer__legal">${esc(fill(t.footer.legal, vars))}</p>
      <p class="site-footer__legal">${esc(fill(t.footer.copyright, vars))}</p>
    </div>
  </footer>

  <div class="sticky-cta" data-sticky hidden>
    <p class="sticky-cta__text"><strong>${euro(draw.jackpot)}</strong> <span>${esc(t.sticky.label)}</span></p>
    <a class="btn btn--primary" href="#buy-ticket">${esc(t.hero.cta)}</a>
  </div>
</body>
</html>
`;
}

const dist = new URL('dist/', root);
await rm(dist, { recursive: true, force: true });
await mkdir(new URL('mt/', dist), { recursive: true });
await cp(new URL('src/', root), dist, { recursive: true });
await writeFile(new URL('index.html', dist), page('en'));
await writeFile(new URL('mt/index.html', dist), page('mt'));
console.log('Built dist/index.html and dist/mt/index.html');
