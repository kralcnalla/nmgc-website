const CACHE = 'nmgc-v7';

const PRECACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/resources.html',
  '/tournaments.html',
  '/leagues/bushwhackers.html',
  '/leagues/scratch.html',
  '/leagues/bestball.html',
  '/leagues/40over.html',
  '/tournaments/spring-scramble.html',
  '/tournaments/titos-classic.html',
  '/tournaments/red-white-blue.html',
  '/tournaments/championship.html',
  '/tournaments/fall-scramble.html',
  '/bestball-calculator.html',
  '/css/style.css',
  '/js/nav.js',
  '/js/pdfs.js',
  '/js/resources.js',
  '/images/N_logo.png',
  '/images/nmgc-logo.png',
  '/images/hero.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Navigation: network first, fall back to cached page or home
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
    );
    return;
  }
  // Everything else: cache first, then network
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
