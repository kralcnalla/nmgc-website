const CACHE = 'nmgc-v14';

// Only cache static assets — HTML always comes fresh from the network
const STATIC_ASSETS = [
  '/css/style.css',
  '/js/nav.js',
  '/js/pdfs.js',
  '/js/resources.js',
  '/images/N_logo.png',
  '/images/nmgc-logo.png',
  '/images/hero.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS)));
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

  const url = new URL(e.request.url);

  // HTML pages — always network, never serve stale HTML from cache
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('/index.html').then(r => r ||
          new Response('<h1 style="font-family:sans-serif;padding:2rem">You are offline.</h1>',
            { headers: { 'Content-Type': 'text/html' } })
        )
      )
    );
    return;
  }

  // Static assets — cache first, update in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      });
      return cached || network;
    })
  );
});
