const CACHE_NAME = 'conocetec-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/config.js',
  '/data/pois.geojson',
  '/data/campus_routes.geojson',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet.markercluster@1.5.1/dist/MarkerCluster.css',
  'https://unpkg.com/leaflet.markercluster@1.5.1/dist/MarkerCluster.Default.css',
  'https://unpkg.com/leaflet.markercluster@1.5.1/dist/leaflet.markercluster.js',
  'https://unpkg.com/@turf/turf@6.5.0/turf.min.js',
  'https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Error durante la instalación del Service Worker:', error);
      })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de caché: Network First, Fall back to Cache
self.addEventListener('fetch', event => {
  // No cachear solicitudes POST
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cachear respuestas exitosas
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar obtener del caché
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }

            // Si no está en caché, retornar una página de offline (opcional)
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pois') {
    event.waitUntil(syncPOIs());
  }
});

async function syncPOIs() {
  try {
    const response = await fetch('/data/pois.geojson');
    const data = await response.json();
    
    // Guardar en IndexedDB o localStorage
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/data/pois.geojson', new Response(JSON.stringify(data)));
    
    console.log('POIs sincronizados correctamente');
  } catch (error) {
    console.error('Error sincronizando POIs:', error);
  }
}

