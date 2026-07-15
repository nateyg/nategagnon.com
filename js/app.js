/* ─────────────────────────────────────────────
   nategagnon.com — app
   Hash router + views + bug ticker + weather
   ───────────────────────────────────────────── */

const SOCIALS = {
  email: 'mailto:gagnon.nate@gmail.com',
  linkedin: 'https://www.linkedin.com/in/nategagnon/',
  twitter: 'https://x.com/nateyg',
  instagram: 'https://www.instagram.com/nategeeo',
};

const SITE_UPDATED = '7.15'; // bump when content changes

// Paste your Formspree endpoint here to make the early-access form save signups,
// e.g. 'https://formspree.io/f/abcdwxyz'. Empty = friendly no-op (nothing stored).
const FORM_ENDPOINT = '';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Icons ──
   PNG assets are 4.4x exports from the design file; height pins them to
   their designed 1x size. arrow/dot stay SVG so they inherit --ink. */
const img = (name, h) => `<img class="icon-img" src="assets/icons/${name}.png" style="height:${h}px" alt="">`;

const ICONS = {
  arrow: `<svg viewBox="0 0 16 16" fill="none"><path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  dot: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="6"/></svg>`,
  x: img('x', 12),
  chevL: img('chev-left', 19),
  chevR: img('chev-right', 19),
  mail: img('email', 16),
  linkedin: img('linkedin', 21),
  twitter: img('twitter', 17),
  instagram: img('instagram', 21),
  appstore: img('appstore', 15),
  testflight: img('testflight', 15),
  wSunny: img('sunny', 12),
  wPartly: img('partly', 10.5),
  wRainy: img('rainy', 10.5),
  wCloudy: img('cloudy', 9),
};

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */
let PROJECTS = [];

async function loadProjects() {
  const r = await fetch('data/projects.json');
  const d = await r.json();
  PROJECTS = d.projects;
}

const liveProjects = () => PROJECTS.filter(p => p.status === 'live');

/* ─────────────────────────────────────────────
   BUG TICKER (top-left)
   ───────────────────────────────────────────── */
const GREETINGS = ['hello', 'welcome'];
let weather = null; // { label: 'sunny 72°F' }
let bugTimer = null;
let bugIndex = 0;

async function loadWeather() {
  try {
    const r = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=37.8044&longitude=-122.2712' +
      '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles'
    );
    const d = await r.json();
    const t = Math.round(d.current.temperature_2m);
    const code = d.current.weather_code;
    let desc = 'sunny';
    if (code >= 51) desc = 'rainy';
    else if (code === 3) desc = 'cloudy';
    else if (code >= 1) desc = 'partly cloudy';
    weather = { label: `${desc} ${t}°F` };
  } catch (_) { /* bug just keeps greeting */ }
}

function bugSequence() {
  // greetings with the live weather line mixed in
  const seq = [...GREETINGS];
  if (weather) seq.splice(1, 0, weather.label);
  return seq;
}

function renderBugHome() {
  const slot = document.getElementById('bug-slot');
  slot.innerHTML = `
    <div class="bug" id="bug">
      <span class="bug-glyph"><span class="bug-dot"></span></span>
      <span class="bug-ticker"><span class="bug-line">hello</span></span>
    </div>`;
  bugIndex = 0;
  clearInterval(bugTimer);
  bugTimer = setInterval(tickBug, 10_000);
}

let fadeTimer = null;

// simple fade between copy states: fade fully out, swap, fade back in.
// The swap waits past the transition's end so the new copy never shows
// while the old one is still partially visible.
function tickBug() {
  const bug = document.getElementById('bug');
  if (!bug) return;
  const seq = bugSequence();
  bugIndex = (bugIndex + 1) % seq.length;
  const next = seq[bugIndex];
  const line = bug.querySelector('.bug-line');

  if (document.hidden) { line.textContent = next; return; }

  clearTimeout(fadeTimer);
  line.style.transition = 'opacity 500ms ease-in-out';
  line.style.opacity = '0';
  fadeTimer = setTimeout(() => {
    line.textContent = next;
    line.style.opacity = '1';
  }, 620);
}

function renderBugSubpage() {
  clearInterval(bugTimer);
  const slot = document.getElementById('bug-slot');
  slot.innerHTML = `
    <a class="bug bug-home" href="#/" aria-label="home">
      <span class="bug-glyph"><span class="glyph-inner">${ICONS.x}</span></span>
      <span class="bug-ticker"><span class="bug-line settled">home</span></span>
    </a>`;
}

/* ─────────────────────────────────────────────
   SHARED PARTIALS
   ───────────────────────────────────────────── */
function heroHTML(shape, { arrows = false } = {}) {
  return `
    <div class="hero${arrows ? ' project' : ''}">
      <div class="hero-stage">
        <div class="hero-shadow"></div>
        <glossy-icon shape="${shape}" speed="0.25" finish="mirror" zoom="1.32"></glossy-icon>
      </div>
    </div>`;
}

function earlyAccessHTML() {
  return `
    <div class="section-label">early access</div>
    <div class="early-card card-in" style="--cd:140ms">
      <p class="early-copy">Get updates, new projects, and TestFlight invites before anyone&nbsp;else&nbsp;:)</p>
      <form class="email-form" id="email-form">
        <input class="email-input" type="email" required placeholder="enter your email" aria-label="email address">
        <button class="email-go" type="submit" aria-label="subscribe">${ICONS.arrow}</button>
      </form>
    </div>`;
}

function footerHTML({ socials = true } = {}) {
  return `
    <footer class="footer">
      ${socials ? `<div class="socials">
        <a class="social-link" href="${SOCIALS.email}" aria-label="email">${ICONS.mail}</a>
        <a class="social-link" href="${SOCIALS.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${ICONS.linkedin}</a>
        <a class="social-link" href="${SOCIALS.twitter}" target="_blank" rel="noopener" aria-label="Twitter">${ICONS.twitter}</a>
        <a class="social-link" href="${SOCIALS.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
      </div>` : ''}
      <div class="copyright"><strong>©2026</strong></div>
    </footer>`;
}

function bindEmailForm(panel) {
  const form = panel.querySelector('#email-form');
  if (!form) return;
  const input = form.querySelector('.email-input');
  const note = (msg) => {
    input.value = '';
    input.placeholder = msg;
    setTimeout(() => { input.placeholder = 'enter your email'; }, 3500);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    // no endpoint configured yet → friendly acknowledgement, nothing stored
    if (!FORM_ENDPOINT) { note('thanks! talk soon :)'); return; }

    input.disabled = true;
    input.placeholder = 'sending…';
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, _subject: 'new early-access signup — nategagnon.com' }),
      });
      input.disabled = false;
      note(r.ok ? 'thanks! talk soon :)' : 'hmm — try again?');
    } catch (_) {
      input.disabled = false;
      note('hmm — try again?');
    }
  });
}

/* ─────────────────────────────────────────────
   VIEWS
   ───────────────────────────────────────────── */
function homeView() {
  const rows = PROJECTS.map((p, i) => {
    const soon = p.status !== 'live';
    return `
      <div class="row ${soon ? 'soon' : ''} stagger" style="--d:${i * 50}ms"
           ${soon ? '' : `data-slug="${p.slug}" role="link" tabindex="0"`}>
        <span class="row-dot"></span>
        <span class="row-name">${p.name}${soon ? '' : `<span class="row-arrow">${ICONS.arrow}</span>`}</span>
        <span class="row-meta">
          ${soon ? `<span class="soon-label">coming soon</span>` : ''}
          <span class="tag">${p.tag}</span>
        </span>
      </div>`;
  }).join('');

  return {
    bug: 'home',
    html: `
      ${heroHTML('hncircle2')}
      <div class="container bio-wrap">
        <p class="bio"><strong>Nate Gagnon</strong> is a Creative Director <span class="mbr"></span>at <strong>Airbnb</strong> working across marketing, <span class="mbr"></span>product, and AI. He lives in <strong>Oakland, CA</strong> <span class="mbr"></span>and makes digital things for fun.</p>
      </div>
      <div class="home-grid">
        <div class="home-col">
          <div class="section-label">the latest</div>
          <div class="card card-in">${rows}</div>
        </div>
        <div class="home-col">
          ${earlyAccessHTML()}
        </div>
      </div>
      <div class="container">${footerHTML()}</div>`,
    bind(panel) {
      panel.querySelectorAll('.row[data-slug]').forEach(row => {
        const go = () => navigate(`#/p/${row.dataset.slug}`);
        row.addEventListener('click', go);
        row.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      });
      bindEmailForm(panel);
    },
  };
}

function projectView(slug) {
  const list = liveProjects();
  const idx = list.findIndex(p => p.slug === slug);
  if (idx === -1) return homeView();
  const p = list[idx];

  const buttons = p.links.map(l => {
    const icon = l.icon ? `<span class="btn-icon">${ICONS[l.icon]}</span>` : '';
    const cls = l.style === 'outline' ? 'btn-outline' : 'btn-filled';
    const href = l.url || '#';
    const blank = l.url ? `target="_blank" rel="noopener"` : `onclick="return false"`;
    return `<a class="btn ${cls}" href="${href}" ${blank}>${icon}${l.label}</a>`;
  }).join('');

  return {
    bug: 'sub',
    html: `
      ${heroHTML(p.icon, { arrows: true })}
      <div class="container">
        <div class="project-card card-in">
          <div class="project-head">
            <h1 class="project-title">${p.name}</h1>
            <span class="tag">${p.tag}</span>
          </div>
          <p class="project-desc">${p.description}</p>
          <div class="project-actions">${buttons}</div>
        </div>
      </div>
      <div class="container">${footerHTML()}</div>`,
    bind(panel) {
      const prev = list[(idx - 1 + list.length) % list.length];
      const next = list[(idx + 1) % list.length];
      const goPrev = () => navigate(`#/p/${prev.slug}`, 'left');
      const goNext = () => navigate(`#/p/${next.slug}`, 'right');
      setChevrons(goPrev, goNext);
      bindSwipe(panel, goPrev, goNext);
    },
  };
}

function setChevrons(goPrev, goNext) {
  const slot = document.getElementById('chev-slot');
  if (!goPrev) { slot.innerHTML = ''; return; }
  if (!slot.querySelector('.chev')) {
    slot.innerHTML = `
      <button class="chev prev" aria-label="previous project">${ICONS.chevL}</button>
      <button class="chev next" aria-label="next project">${ICONS.chevR}</button>`;
  }
  const position = () => {
    const stage = document.querySelector('.hero-stage');
    if (!stage) return;
    const mid = stage.getBoundingClientRect().top + window.scrollY + stage.offsetHeight / 2;
    slot.querySelectorAll('.chev').forEach(c => { c.style.top = mid + 'px'; });
  };
  position();
  window.addEventListener('resize', position, { once: true });
  const prevBtn = slot.querySelector('.chev.prev');
  const nextBtn = slot.querySelector('.chev.next');
  prevBtn.onclick = goPrev;
  nextBtn.onclick = goNext;
}

/* ── Swipe between projects ──
   Panel follows the finger with light damping and a slight tilt; a flick or
   a 60px pull commits the page turn, anything less springs back. */
function bindSwipe(panel, goPrev, goNext) {
  let x0 = 0, y0 = 0, t0 = 0, dx = 0, axis = null, active = false;
  const card = () => panel.querySelector('.project-card');

  const begin = (x, y, target) => {
    if (target.closest('glossy-icon, .chev, a, button, input')) return;
    x0 = x; y0 = y; t0 = performance.now();
    dx = 0; axis = null; active = true;
  };

  const move = (x, y) => {
    if (!active) return false;
    const mx = x - x0, my = y - y0;
    if (!axis && (Math.abs(mx) > 5 || Math.abs(my) > 5)) {
      axis = Math.abs(mx) > Math.abs(my) ? 'h' : 'v';
    }
    if (axis !== 'h') return false;
    dx = mx;
    if (!REDUCED) {
      // the panel follows the finger; the card drifts a touch further,
      // so the page feels like layered physical cards
      panel.style.transition = 'none';
      panel.style.transform = `translateX(${dx * 0.85}px) rotate(${dx * 0.018}deg)`;
      const c = card();
      if (c) { c.style.transition = 'none'; c.style.transform = `translateX(${dx * 0.22}px)`; }
    }
    return true;
  };

  const settle = (el, transition, transform) => {
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
  };

  const release = () => {
    if (!active) return;
    active = false;
    if (axis !== 'h') return;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - t0);
    const commit = Math.abs(dx) > 60 || (Math.abs(dx) > 20 && velocity > 0.25);
    if (commit) {
      if (REDUCED) { dx > 0 ? goPrev() : goNext(); return; }
      const dir = dx > 0 ? 1 : -1;
      const off = dir * Math.max(window.innerWidth * 0.75, Math.abs(dx) * 3);
      settle(panel, 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1), opacity 320ms ease',
             `translateX(${off}px) rotate(${off * 0.018}deg)`);
      settle(card(), 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)', `translateX(${dir * 60}px)`);
      panel.style.opacity = '0';
      setTimeout(() => { dx > 0 ? goPrev() : goNext(); }, 150);
    } else {
      settle(panel, 'transform 380ms cubic-bezier(0.23, 1, 0.32, 1)', 'translateX(0) rotate(0deg)');
      settle(card(), 'transform 380ms cubic-bezier(0.23, 1, 0.32, 1)', 'translateX(0)');
    }
  };

  panel.addEventListener('touchstart', (e) => begin(e.touches[0].clientX, e.touches[0].clientY, e.target), { passive: true });
  panel.addEventListener('touchmove', (e) => { if (move(e.touches[0].clientX, e.touches[0].clientY)) e.preventDefault(); }, { passive: false });
  panel.addEventListener('touchend', release);
  panel.addEventListener('touchcancel', release);

  panel.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') begin(e.clientX, e.clientY, e.target); });
  panel.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); });
  panel.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse') release(); });
  panel.addEventListener('pointercancel', (e) => { if (e.pointerType === 'mouse') release(); });
}

function contactView() {
  const rows = [
    { name: 'Email', icon: 'mail', url: SOCIALS.email },
    { name: 'LinkedIn', icon: 'linkedin', url: SOCIALS.linkedin },
    { name: 'Twitter (X)', icon: 'twitter', url: SOCIALS.twitter },
    { name: 'Instagram', icon: 'instagram', url: SOCIALS.instagram },
  ].map((r, i) => `
    <a class="contact-row stagger" style="--d:${i * 50}ms" href="${r.url}" ${r.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
      <span class="row-dot"></span>
      <span class="row-name">${r.name}<span class="row-arrow">${ICONS.arrow}</span></span>
      <span class="contact-icon">${ICONS[r.icon]}</span>
    </a>`).join('');

  return {
    bug: 'sub',
    html: `
      <div class="contact-grid">
        <div class="contact-copy">
          <div class="contact-head">
            <h1>Nate Gagnon</h1>
          </div>
          <p>I'm a Chicago native turned California lifer.</p>
          <p>Throughout my career I've had the pleasure of working at incredible ad agencies, all the big tech companies you've heard of, and small scrappy startups. I currently work at Airbnb.</p>
          <p>My work has been featured in TIME, VICE, the BBC, FiveThirtyEight, NPR, TEDx, and occasionally the front page of Reddit.</p>
          <p>I'm obsessed with leaving the internet a more interesting place than I found it.</p>
          <p>Say hello :)</p>
        </div>
        <div class="contact-cards">
          <div class="section-label">get in touch</div>
          <div class="card card-in">${rows}</div>
          ${earlyAccessHTML()}
        </div>
      </div>
      <div class="container">${footerHTML({ socials: false })}</div>`,
    bind(panel) { bindEmailForm(panel); },
  };
}

/* ─────────────────────────────────────────────
   ROUTER + TRANSITIONS
   ───────────────────────────────────────────── */
let currentHash = null;
let pendingDirection = null; // 'left' | 'right' | null

function navigate(hash, direction = null) {
  pendingDirection = direction;
  if (location.hash === hash) return;
  location.hash = hash;
}

function resolveView() {
  const h = location.hash || '#/';
  if (h.startsWith('#/p/')) return projectView(h.slice(4));
  if (h === '#/contact') return contactView();
  return homeView();
}

let currentBugMode = null;

function setBug(mode, instant) {
  if (mode === currentBugMode) return;
  currentBugMode = mode;
  const slot = document.getElementById('bug-slot');
  const apply = () => { mode === 'home' ? renderBugHome() : renderBugSubpage(); };
  if (instant || REDUCED || document.hidden) { apply(); slot.style.opacity = '1'; return; }
  slot.style.transition = 'opacity 150ms ease';
  slot.style.opacity = '0';
  setTimeout(() => {
    apply();
    slot.style.opacity = '1';
    // belt and suspenders: never leave the slot faded out
    setTimeout(() => { slot.style.transition = ''; slot.style.opacity = ''; }, 220);
  }, 170);
}

function render() {
  const hash = location.hash || '#/';
  if (hash === currentHash) return;
  const firstRender = currentHash === null;
  currentHash = hash;

  const view = resolveView();
  const container = document.getElementById('view');
  const old = container.querySelector('.view-panel');
  const dir = pendingDirection;
  pendingDirection = null;

  const panel = document.createElement('div');
  panel.className = 'view-panel';
  panel.innerHTML = view.html;
  if (dir) panel.querySelectorAll('.card-in').forEach(el => el.classList.remove('card-in'));

  const enterClass = dir === 'left' ? 'h-enter-left'
                   : dir === 'right' ? 'h-enter-right'
                   : 'v-enter';
  const exitClass  = dir === 'left' ? 'h-exit-right'
                   : dir === 'right' ? 'h-exit-left'
                   : 'v-exit';

  // update bug + contact pill (crossfade the swap in both directions)
  setBug(view.bug, firstRender);
  // visibility (not display) — the pill's box must keep the nav height stable
  // contact page swaps the "contact" pill for an "Updated x.xx" stamp
  const onContact = hash === '#/contact';
  const pill = document.getElementById('nav-contact');
  const upd = document.getElementById('nav-updated');
  pill.hidden = onContact;
  upd.hidden = !onContact;
  if (onContact) upd.textContent = `Updated ${SITE_UPDATED}`;

  window.scrollTo({ top: 0, behavior: 'instant' });
  if (!hash.startsWith('#/p/')) setChevrons(null);

  // exit and enter overlap: the old panel goes absolute and fades out in
  // place while the new one mounts underneath — no dead gap between views
  if (old && !REDUCED && !document.hidden) {
    old.style.position = 'absolute';
    old.style.top = '0';
    old.style.left = '0';
    old.style.right = '0';
    old.style.pointerEvents = 'none';
    old.classList.add(exitClass);
    setTimeout(() => old.remove(), 360);
  } else if (old) {
    old.remove();
  }

  container.appendChild(panel);
  view.bind && view.bind(panel);

  if (!firstRender && !document.hidden) {
    panel.classList.add(enterClass);
    // let the browser paint the initial enter state (and the 3D icon finish
    // its synchronous init) before starting the transition — starting it in
    // the same task drops the first frames and reads as a hitch
    requestAnimationFrame(() => requestAnimationFrame(() => {
      panel.classList.remove(enterClass);
    }));
  }
}

/* ─────────────────────────────────────────────
   BOOT
   ───────────────────────────────────────────── */
document.getElementById('nav-contact').addEventListener('click', () => navigate('#/contact'));
window.addEventListener('hashchange', render);

(async function boot() {
  await loadProjects();
  loadWeather().then(() => {}); // non-blocking; ticker picks it up next cycle
  setInterval(loadWeather, 10 * 60_000);
  render();
})();
