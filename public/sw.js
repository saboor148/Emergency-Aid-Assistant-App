const CACHE_NAME = 'emergency-aid-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell & assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle Chat API Offline Fallback gracefully
  if (url.pathname === '/api/chat') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            emergencyName: "OFFLINE: INTERNET IS DISCONNECTED",
            calls: ["1122", "115"],
            steps: [
              "Step 1: Ghabrayein mat. Aap offline hain, lekin humare pehle se load shuda guides bilkul theek kam kar rahe hain.",
              "Step 2: Live AI naye sawalaat process nahi kar sakti, lekin aap search bar ka istemal kar ke niche se category parh saktay hain.",
              "Step 3: Fauran Rescue 1122 ya Edhi 115 par call karein agar haalat zyada kharab ho."
            ],
            khabardar: [
              "Bina internet ke AI predictions poori tarah accurate nahi hosaktay, so customized mashwaray par inhisar na karein.",
              "Panic na karein aur mareez ko seedha aur hawadaar jagah par letayein."
            ],
            tip: "Aap niche di gayi default emergency guidelines aur 'Ghar Ka Dabba' (First Aid checklist) ko kisi bhi time baghair internet parh saktay hain.",
            hospitalWhen: "Saans band hona, chest pain, ya bohat zyada bleeding par sab se pehle call karein aur qareebi hospital ruju karein."
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          }
        );
      })
    );
    return;
  }

  // Handle static assets (CSS, JS, logo icons, Fonts etc.)
  const isStaticAsset = 
    url.pathname.includes('/assets/') || 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css') || 
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.jpg') || 
    url.pathname.endsWith('.jpeg') || 
    url.pathname.endsWith('.svg') || 
    url.pathname.endsWith('.woff') || 
    url.pathname.endsWith('.woff2') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Feed from cache immediately, and refresh the cache in background
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Ignore bg update errors offline */});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        }).catch(() => {
          return new Response('Offline asset not found', { status: 404 });
        });
      })
    );
    return;
  }

  // General App navigation/loading requests: Network-First, Cache-Fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Serve index page for normal SPA route navigation fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
