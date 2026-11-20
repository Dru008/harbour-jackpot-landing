// Countdown to the next draw, and the mobile sticky "Buy ticket" bar.
// Without JavaScript the page still shows the draw date and time as text.
(() => {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const DRAW_LENGTH = 30 * 60 * 1000; // show "draw happening now" for 30 minutes
  const box = document.querySelector('.countdown[data-draw]');

  if (box) {
    const isMt = document.documentElement.lang === 'mt';
    const timeEl = box.querySelector('.countdown__title time');
    const values = Object.fromEntries([...box.querySelectorAll('[data-unit]')].map((el) => [el.dataset.unit, el]));
    let target = new Date(box.dataset.draw).getTime();

    // Some browsers ship without Maltese date names, so Maltese is formatted by hand.
    const MT_DAYS = ['Il-Ħadd', 'It-Tnejn', 'It-Tlieta', 'L-Erbgħa', 'Il-Ħamis', 'Il-Ġimgħa', 'Is-Sibt'];
    const MT_MONTHS = ['Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju', 'Lulju', 'Awwissu', 'Settembru', 'Ottubru', 'Novembru', 'Diċembru'];
    const label = (d) => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'Europe/Malta' })
        .formatToParts(d).map((x) => [x.type, x.value]));
      if (!isMt) return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Malta' }).format(d);
      const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
      return `${MT_DAYS[dayIndex]}, ${Number(parts.day)} ta’ ${MT_MONTHS[Number(parts.month) - 1]}`;
    };

    // The draw repeats weekly: if the date in the content file has passed, move to the next Saturday.
    // The server-rendered date is only rewritten when it actually changes.
    const roll = () => {
      let moved = false;
      while (Date.now() > target + DRAW_LENGTH) { target += WEEK; moved = true; }
      if (moved) {
        const d = new Date(target);
        timeEl.dateTime = d.toISOString();
        timeEl.textContent = `${label(d)}, 21:00`;
      }
    };

    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      roll();
      const left = target - Date.now();
      if (left <= 0) {
        box.classList.add('is-drawing');
        timeEl.textContent = box.dataset.drawing;
        return;
      }
      box.classList.remove('is-drawing');
      const s = Math.floor(left / 1000);
      values.d.textContent = pad(Math.floor(s / 86400));
      values.h.textContent = pad(Math.floor((s % 86400) / 3600));
      values.m.textContent = pad(Math.floor((s % 3600) / 60));
      values.s.textContent = pad(s % 60);
    };

    tick();
    setInterval(tick, 1000);
  }

  // Sticky buy bar (mobile): shows once the hero button has scrolled away,
  // and hides again over the safer gambling block and the footer, so we never push a sale there.
  const sticky = document.querySelector('[data-sticky]');
  const heroCta = document.getElementById('hero-cta');
  const quiet = [document.getElementById('safer-gambling'), document.querySelector('.site-footer')].filter(Boolean);
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    let pastHero = false;
    const inQuiet = new Set();
    const update = () => { sticky.hidden = !pastHero || inQuiet.size > 0; };
    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);
    const quietObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? inQuiet.add(e.target) : inQuiet.delete(e.target)));
      update();
    });
    quiet.forEach((el) => quietObserver.observe(el));
  }
})();
