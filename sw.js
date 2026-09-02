const CACHE_NAME = 'players-pro-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/sw.js',
  'https://cdn.jsdelivr.net/npm/face-api.js',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cachés creados');
        return cache.addAll(urlsToCache).catch(() => {
          console.log('⚠️ Algunos recursos no pudieron cachearse (normal si están offline)');
        });
      })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Limpiando caché antiguo');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Manejar requests
self.addEventListener('fetch', (event) => {
  // Solo hacer cache de GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('📦 Sirviendo desde caché:', event.request.url);
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // No cachear si es una respuesta no-ok
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Servir página offline si no hay conexión
            console.log('📱 Modo offline:', event.request.url);
            return caches.match('/index.html');
          });
      })
  );
});
