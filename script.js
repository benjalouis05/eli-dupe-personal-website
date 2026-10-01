// Looping tracks animate to translate(-50%), so each half must be at least as
// wide as the viewport: repeat the set until it is, then double it.
function fillLoop(track) {
  const set = track.innerHTML;
  let reps = 1;
  while (track.scrollWidth < window.innerWidth + 200 && reps < 8) {
    track.innerHTML += set;
    reps++;
  }
  track.innerHTML += track.innerHTML;
}
fillLoop(document.getElementById('reelTrack'));
const marquee = document.querySelector('.marquee-track');
marquee.innerHTML += marquee.innerHTML;

// Project count
document.getElementById('projectCount').textContent =
  `${document.querySelectorAll('.project').length} PROJECTS`;

// Mobile nav
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Active nav link follows scroll position
const navMap = new Map(
  [...links.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a])
);
const sectionFor = { offline: 'career' }; // sections without their own nav link
const spy = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = sectionFor[entry.target.id] || entry.target.id;
      const link = navMap.get(id);
      if (!link) continue;
      navMap.forEach((a) => a.classList.remove('active'));
      link.classList.add('active');
    }
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

// Reveal on scroll
const revealer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

// Only one project open at a time
const projects = document.querySelectorAll('.project');
projects.forEach((p) =>
  p.addEventListener('toggle', () => {
    if (p.open) projects.forEach((o) => o !== p && (o.open = false));
  })
);

// Terminal: type lines in once the contact section is visible
const termLines = [...document.querySelectorAll('[data-type]')];
const originals = termLines.map((el) => el.innerHTML);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeInto(el, html) {
  return new Promise((resolve) => {
    // Type only the visible text, then restore markup.
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent;
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 18);
      else { el.innerHTML = html; resolve(); }
    };
    tick();
  });
}

if (!reduceMotion) {
  termLines.forEach((el) => (el.textContent = ''));
  const termObs = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting) return;
    termObs.disconnect();
    for (let i = 0; i < termLines.length; i++) await typeInto(termLines[i], originals[i]);
  }, { threshold: 0.3 });
  termObs.observe(document.querySelector('.terminal'));
}

// Live clock
const clock = document.getElementById('clock');
const tickClock = () => {
  clock.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
};
tickClock();
setInterval(tickClock, 1000);
document.getElementById('year').textContent = new Date().getFullYear();
