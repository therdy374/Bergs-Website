const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const header = document.querySelector('.site-header');
const progress = document.querySelector('.progress-bar');

menuToggle?.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = `${Math.min(100, Math.max(0, window.scrollY / max * 100))}%`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = Number(el.dataset.count);
    let start = 0, startTime = performance.now();
    function tick(now) {
      const p = Math.min((now - startTime) / 900, 1);
      el.textContent = Math.floor((1 - Math.pow(1-p,3)) * target);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
},{threshold:.6});
counters.forEach(c => counterObserver.observe(c));

document.querySelectorAll('.filter button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.type === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

document.querySelectorAll('.system').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.system').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
  });
});


window.addEventListener('pointermove', e => {
  const glow = document.querySelector('.cursor-glow'); if (!glow) return;
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

// Premium navigation: active section + mobile menu animation
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-contact)');
const sections = [...document.querySelectorAll('main section[id]')];
if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => menuToggle.classList.toggle('open'));
}

// Inquiry modal
const modal = document.getElementById('inquiryModal');
const inquiryForm = document.getElementById('inquiryForm');
const inquiryType = document.getElementById('inquiryType');
const formStatus = document.getElementById('formStatus');
const openModalButtons = document.querySelectorAll('.js-open-modal');
const closeModalButtons = document.querySelectorAll('[data-close-modal]');

function openInquiryModal(type = 'General Inquiry') {
  if (!modal) return;
  inquiryType.value = type;
  if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), 120);
}
function closeInquiryModal() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
openModalButtons.forEach(button => button.addEventListener('click', () => openInquiryModal(button.dataset.formType || 'General Inquiry')));
closeModalButtons.forEach(button => button.addEventListener('click', closeInquiryModal));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeInquiryModal(); });

if (inquiryForm) {
  inquiryForm.addEventListener('submit', async e => {
    e.preventDefault();
    const submitButton = inquiryForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending…';
    formStatus.textContent = 'Sending your inquiry…';
    formStatus.className = 'form-status';
    try {
      const response = await fetch(inquiryForm.action, { method:'POST', body:new FormData(inquiryForm), headers:{'Accept':'application/json'} });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || 'Unable to send inquiry.');
      formStatus.textContent = data.message; showSuccess(data.message);
      inquiryForm.reset();
      inquiryType.value = 'General Inquiry';
    } catch (error) {
      formStatus.textContent = error.message || 'Unable to send inquiry. Please email info@bergsph.com directly.';
      formStatus.className = 'form-status error';
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  });
}

/* ===== Modern layer ===== */
const metaTheme = document.querySelector('meta[name="theme-color"]');
function applyTheme(t) {
  root.dataset.theme = t;
  themeToggle?.setAttribute('aria-checked', String(t === 'light'));
  metaTheme?.setAttribute('content', t === 'light' ? '#f5f8fa' : '#07111c');
}
applyTheme(root.dataset.theme || 'dark');
themeToggle?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('bergs-theme', next); } catch {}
  const r = themeToggle.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion:reduce)').matches) return applyTheme(next);
  document.startViewTransition(() => applyTheme(next)).ready.then(() =>
    root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }));
});

document.querySelectorAll('.btn,.contact-cta').forEach(b => {
  b.addEventListener('pointerdown', e => {
    const r = b.getBoundingClientRect(), s = document.createElement('i');
    s.className = 'ripple'; s.style.cssText = `left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  });
  if (matchMedia('(hover:hover)').matches && b.classList.contains('btn')) {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
      b.style.setProperty('--tx', `${(e.clientX - r.left - r.width / 2) * .1}px`); b.style.setProperty('--ty', `${(e.clientY - r.top - r.height / 2) * .18}px`); });
    b.addEventListener('pointerleave', () => { b.style.removeProperty('--tx'); b.style.removeProperty('--ty'); });
  }
});
document.querySelectorAll('.cap-card,.company-card,.project-card,.pillar,.service-item').forEach(c =>
  c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); }));

const SYS = ['Power systems, switchgear, motors, and electrical reliability across plant operations.', 'Rotating equipment, boilers, and mechanical systems built for availability.', 'Instrumentation, controls, and automation that keep plants running safely and efficiently.', 'Balance-of-plant systems that support dependable generation.', 'Preventive and corrective maintenance focused on long-term asset performance.', 'Design, analysis, and technical support from concept through commissioning.'];
document.querySelectorAll('.system').forEach((b, i) => { const p = document.createElement('div'); p.className = 'system-panel'; p.innerHTML = `<p>${SYS[i] || ''}</p>`; b.after(p); });

/* Modal helpers: focus trap + restore focus */
let lastFocus = null;
const openM = m => { lastFocus = document.activeElement; m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open'); };
const closeM = m => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); lastFocus?.focus?.(); };
document.addEventListener('keydown', e => {
  const m = document.querySelector('.modal.open'); if (!m) return;
  if (e.key === 'Escape') closeM(m);
  if (e.key === 'Tab') {
    const f = [...m.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"]),textarea')].filter(x => x.offsetParent);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});
document.querySelectorAll('[data-dismiss]').forEach(b => b.addEventListener('click', () => closeM(b.closest('.modal'))));

/* Inquiry chips + success state */
const chips = document.querySelectorAll('.chip[data-type]');
const kicker = modal?.querySelector('.modal-kicker');
function syncChips() {
  modal?.querySelector('.modal-dialog')?.classList.remove('sent');
  const t = inquiryType.value; let hit = false;
  chips.forEach(c => { const on = c.dataset.type === t; c.classList.toggle('active', on); hit ||= on; });
  if (kicker) kicker.textContent = (hit ? t : 'BERGS HOLDINGS CORPORATION').toUpperCase();
}
chips.forEach(c => c.addEventListener('click', () => { inquiryType.value = c.dataset.type; syncChips(); }));
openModalButtons.forEach(b => b.addEventListener('click', syncChips));
function showSuccess(msg) { modal.querySelector('.success-msg').textContent = msg || 'Thank you. We will get back to you soon.'; modal.querySelector('.modal-dialog').classList.add('sent'); }

/* Info modal: projects + company quick view */
const info = document.getElementById('infoModal');
const PROJ = {
  balingasag: { cat: 'Power Generation', title: 'Balingasag Power Station', meta: ['3 × 55 MW configuration', 'CFBC technology', 'Misamis Oriental'], desc: 'A major power generation asset demonstrating BERGS’ technical capability, project experience, and commitment to reliable energy delivery.', img: 'assets/balingasag-power-station.svg' },
  om: { cat: 'Operations & Maintenance', title: 'Plant Maintenance Services', meta: ['Electro-mechanical', 'Reliability services'], desc: 'Electro-mechanical and reliability services focused on plant availability, efficiency, and long-term performance.', img: 'assets/bppms-01.svg' },
  eng: { cat: 'Engineering', title: 'Power Engineering Solutions', meta: ['Technical design', 'Project support'], desc: 'Technical design and project support for complex energy, industrial, and infrastructure projects.', img: 'assets/bestc-02.svg' }
};
function openInfo(d) {
  if (!info) return;
  info.querySelector('#infoMedia').style.backgroundImage = `url(${d.img})`;
  info.querySelector('#infoKicker').textContent = d.cat;
  info.querySelector('#infoTitle').textContent = d.title;
  info.querySelector('#infoDesc').textContent = d.desc;
  const row = info.querySelector('#infoMeta'); row.replaceChildren(...(d.meta || []).map(t => Object.assign(document.createElement('span'), { className: 'chip', textContent: t })));
  const link = info.querySelector('#infoLink'); link.hidden = !d.href; if (d.href) link.href = d.href;
  info.querySelector('#infoInquire').onclick = () => { closeM(info); openInquiryModal(d.inquiry); syncChips(); };
  d.inquiry = d.inquiry || 'General Inquiry'; openM(info);
}
document.querySelectorAll('.js-open-project').forEach(b => b.addEventListener('click', () => {
  const p = PROJ[b.dataset.project]; const im = b.closest('.project-card')?.querySelector('.frame img') || document.querySelector('.project-visual img'); openInfo({ ...p, img: im?.getAttribute('src') || p.img, inquiry: 'Project Inquiry – ' + p.title });
}));
document.querySelectorAll('.js-open-company').forEach(b => b.addEventListener('click', () => {
  const c = b.closest('.company-card');
  openInfo({ cat: c.dataset.code + ' / BERGS GROUP', title: c.querySelector('h3').textContent, desc: c.querySelector('p').textContent,
    img: c.querySelector('.card-media img').getAttribute('src'), href: c.querySelector('a').href, meta: ['BERGS Group company'], inquiry: 'Partnership – ' + c.dataset.code });
}));

/* Auto-fit images: drop photo.jpg/.png/.webp next to the placeholder .svg and it is picked up automatically.
   Results are cached per browser session so the extra lookups happen once. Set <html data-auto-img="off"> to disable once final filenames are in the HTML. */
try {
  const IMG_EXT = ['webp', 'jpg', 'jpeg', 'png'];
  if (document.documentElement.dataset.autoImg !== 'off') document.querySelectorAll('.frame img, .media-slot img, .hero-image img, .project-visual img, .sub-hero-bg img, .co-logo img').forEach(img => {
    const src = img.getAttribute('src') || ''; if (!/\.svg$/.test(src)) return;
    const key = 'bergs-img:' + src; let hit = null; try { hit = sessionStorage.getItem(key); } catch {}
    if (hit !== null) { if (hit) img.src = hit; return; }
    const base = src.replace(/\.svg$/, '');
    (function tryExt(i) {
      if (i >= IMG_EXT.length) { try { sessionStorage.setItem(key, ''); } catch {} return; }
      const t = new Image(), url = `${base}.${IMG_EXT[i]}`;
      t.onload = () => { img.src = url; try { sessionStorage.setItem(key, url); } catch {} };
      t.onerror = () => tryExt(i + 1); t.src = url;
    })(0);
  });
} catch (err) { console.warn('Auto image detection skipped:', err); }

/* Hero video: autoplay on open, keep the pause/play button in sync, never leave a dead frame */
try {
  const heroVid = document.querySelector('.hero-image video'), mediaBtn = document.querySelector('.media-toggle');
  if (heroVid) {
    let userPaused = false;
    heroVid.muted = true; heroVid.defaultMuted = true; heroVid.setAttribute('muted', ''); heroVid.setAttribute('playsinline', '');
    const sync = () => { if (!mediaBtn) return; mediaBtn.setAttribute('aria-pressed', String(heroVid.paused)); mediaBtn.setAttribute('aria-label', heroVid.paused ? 'Play animation' : 'Pause animation'); };
    const tryPlay = () => { if (!userPaused) { const p = heroVid.play(); if (p && p.catch) p.catch(() => {}); } };
    heroVid.addEventListener('play', sync); heroVid.addEventListener('pause', sync); sync();
    mediaBtn?.addEventListener('click', () => { if (heroVid.paused) { userPaused = false; tryPlay(); } else { userPaused = true; heroVid.pause(); } });
    tryPlay(); heroVid.addEventListener('canplay', tryPlay);
    ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'].forEach(ev => addEventListener(ev, () => { if (heroVid.paused) tryPlay(); }, { once: true, passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && heroVid.paused) tryPlay(); });
  }
} catch (err) { console.warn('Hero video script skipped:', err); }

/* Interactive marquee: auto-scroll, drag/swipe with inertia, arrows, pause, keyboard, click = company quick view */
try { (() => {
  const root = document.querySelector('.marquee'); if (!root) return;
  const view = root.querySelector('.mq-viewport'), track = root.querySelector('.marquee-track');
  const toggle = root.querySelector('[data-mq="toggle"]'); root.classList.add('is-live');
  let pid = 0, x = 0, vel = 0, half = 0, last = performance.now(), paused = false, hover = false, dragging = false, moved = 0, k = 1, inView = true, sx = 0, sp = 0, lx = 0;
  const measure = () => { half = track.scrollWidth / 2; };
  new ResizeObserver(measure).observe(track); measure();
  new IntersectionObserver(e => { inView = e[0].isIntersecting; }).observe(root);
  const wrap = () => { if (!half) return; while (x <= -half) x += half; while (x > 0) x -= half; };
  const frame = now => {
    const dt = Math.min(40, now - last) / 16.67; last = now;
    if (inView) {
      if (!dragging) {
        if (Math.abs(vel) > .15) { x += vel * dt; vel *= Math.pow(.93, dt); }
        else { vel = 0; k += ((paused || hover ? 0 : 1) - k) * Math.min(1, .08 * dt); if (k < .01 && (paused || hover)) k = 0; x -= .7 * k * dt; }
      }
      wrap(); track.style.transform = `translate3d(${x}px,0,0)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  view.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  view.addEventListener('pointerleave', () => { hover = false; });
  view.addEventListener('pointerdown', e => { dragging = true; moved = 0; sx = lx = e.clientX; sp = x; vel = 0; pid = e.pointerId; });
  view.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 6 && !view.classList.contains('dragging')) { view.classList.add('dragging'); view.setPointerCapture(pid); } x = sp + dx; vel = e.clientX - lx; lx = e.clientX; });
  const end = () => { dragging = false; view.classList.remove('dragging'); };
  view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
  view.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); vel -= e.deltaX * .15; } }, { passive: false });
  view.addEventListener('keydown', e => { if (e.key === 'ArrowRight') vel = -16; if (e.key === 'ArrowLeft') vel = 16; });
  root.querySelector('[data-mq="prev"]').addEventListener('click', () => { vel = 18; });
  root.querySelector('[data-mq="next"]').addEventListener('click', () => { vel = -18; });
  toggle.addEventListener('click', () => { paused = !paused; toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? 'Resume scrolling' : 'Pause scrolling'); });
  track.addEventListener('click', e => {
    const a = e.target.closest('.mq-item'); if (!a) return;
    if (moved > 6) { e.preventDefault(); return; }
    const code = (a.getAttribute('href').match(/companies\/(\w+)\.html/) || [])[1];
    const btn = code && document.querySelector(`.company-card[data-code="${code.toUpperCase()}"] .js-open-company`);
    if (btn) { e.preventDefault(); btn.click(); }
  });
})(); } catch (err) { console.warn('Marquee script skipped:', err); }
