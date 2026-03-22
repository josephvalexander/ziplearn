// ============================================================
//  Zipplearn Service Worker
//  Strategy:
//    • HTML (index.html) → Network-first, fallback to cache
//      (ensures updates are always picked up)
//    • All other assets  → Cache-first, fallback to network
//      (fast loads for fonts, icons, manifest)
//  Auto-update flow:
//    1. GitHub Actions injects BUILD_VERSION at deploy time
//    2. New SW installs alongside old one
//    3. SW broadcasts 'UPDATE_AVAILABLE' to all open tabs
//    4. App shows an "Update ready" toast
//    5. User taps "Update" → skipWaiting → page reloads
// ============================================================

// BUILD_VERSION is replaced by GitHub Actions on every deploy
// e.g. "2024-12-01T10:30:00Z-a1b2c3d"
const BUILD_VERSION = '__BUILD_VERSION__';
const CACHE_NAME    = `zipplearn-${BUILD_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Google Fonts are cached at runtime (external, can't precache)
];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  // Do NOT skipWaiting here — we wait for the user to confirm
  // the update via the in-app toast before activating.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => {
        // Tell all open clients a new version is waiting
        self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
          clients.forEach(client =>
            client.postMessage({ type: 'UPDATE_AVAILABLE', version: BUILD_VERSION })
          );
        });
      })
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('zipplearn-') && key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin && !url.hostname.includes('fonts.')) return;

  // Network-first for HTML documents (catches deployments immediately)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for everything else (fonts, manifest, icons)
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
    return cached || new Response('Offline — please reconnect', {
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

// ── MESSAGE HANDLER ──────────────────────────────────────────
// App sends 'SKIP_WAITING' when the user taps "Update"
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Activating new version...');
    self.skipWaiting();
  }
  // App can also request the current version
  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: BUILD_VERSION });
  }
});
