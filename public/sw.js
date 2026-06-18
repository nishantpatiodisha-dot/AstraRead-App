const CACHE_VERSION = 'astraread-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Patterns for static assets (Next.js hashes these, so they're safe to cache indefinitely)
const STATIC_PATTERNS = [
  /\/_next\/static\//,     // JS, CSS chunks
  /\/_next\/image\//,      // Optimized images
  /\.(?:woff2?|ttf|otf)$/, // Fonts
  /\.(?:png|jpg|jpeg|gif|svg|ico|webp)$/, // Images
];

function isStaticAsset(url) {
  const pathname = new URL(url).pathname;
  return STATIC_PATTERNS.some(pattern => pattern.test(pathname));
}

function isApiOrDataRequest(url) {
  const pathname = new URL(url).pathname;
  return pathname.startsWith('/api/') || pathname.includes('_next/data');
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old versioned caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  if (isStaticAsset(url)) {
    // Cache-first for static assets — they have content hashes so stale data is impossible
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  if (isApiOrDataRequest(url)) {
    // Network-only for API routes — must always get fresh data
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for HTML pages — try network, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
