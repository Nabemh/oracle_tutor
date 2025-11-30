
const CACHE_NAME = 'oracle-offline-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/types.ts',
  '/constants.ts',
  '/App.tsx',
  '/services/geminiService.ts',
  '/services/audioUtils.ts',
  '/services/offlineService.ts',
  '/components/ChatSession.tsx',
  '/components/LiveSession.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
  // CDN Imports
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/react@^19.2.0/',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/@google/genai@^1.30.0',
  'https://aistudiocdn.com/@heroicons/react@^2.2.0/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((r) => {
      console.log('[Service Worker] Fetching resource: ' + event.request.url);
      return r || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          console.log('[Service Worker] Caching new resource: ' + event.request.url);
          // Only cache valid http/https requests
          if (event.request.url.startsWith('http')) {
              cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});
