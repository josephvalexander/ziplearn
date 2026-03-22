// ============================================================
//  Zipplearn Service Worker
//
//  IMPORTANT — path handling:
//  GitHub Pages serves at /REPO-NAME/ not /.
//  The deploy.yml workflow patches the three PRECACHE_ASSETS
//  paths below at build time using sed, replacing the root path with
//  '/REPO-NAME/', the BASE_PATH-prefixed equivalents
//  so the correct paths are baked into the deployed
//  sw.js automatically. No manual editing needed.
//
//  Caching strategy:
//   • index.html  → network-first  (always gets latest deploy)
//   • everything else → cache-first (fast loads, offline works)
// ============================================================

const BUILD_VERSION   = '__BUILD_VERSION__';
const CACHE_NAME      = `zipplearn-${BUILD_VERSION}`;

// These three paths are patched by deploy.yml at build time
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => {
        self.clients.matchAll({ includeUncontrolled: true })
          .then(clients => clients.forEach(client =>
            client.postMessage({ type: 'UPDATE_AVAILABLE', version: BUILD_VERSION })
          ));
      })
  );
  // Don't skipWaiting — let the in-app toast handle activation
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('zipplearn-') && k !== CACHE_NAME)
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  // Only handle same-origin and Google Fonts
  if (url.origin !== location.origin && !url.hostname.includes('fonts.')) return;

  // Network-first for HTML — catches new deploys immediately
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for everything else
  event.respondWith(cacheFirst(request));
});

// ── STRATEGIES ───────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline — please reconnect.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type !== 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

// ── MESSAGES ─────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] User confirmed update — activating');
    self.skipWaiting();
  }
  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: BUILD_VERSION });
  }
});
