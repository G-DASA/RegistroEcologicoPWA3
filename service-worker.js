const CACHE_NAME = 'registro-ecologico-v1'; // IMPORTANTE: Cambia 'v1' a 'v2', 'v3' ecc. OGNI volta che modifichi i file HTML, CSS, JS o Manifest!
const urlsToCache = [
  './', // Questo indica la directory principale
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192x192.png', // Assicurati che il percorso e il nome siano esatti
  './icons/icon-512x512.png'  // Assicurati che il percorso e il nome siano esatti
];

// Evento 'install': Viene scatenato quando il Service Worker viene installato per la prima volta.
// In questo evento, apriamo la cache e memorizziamo tutti i file essenziali.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('Service Worker: Opened cache. Adding URLs to cache.');
      return cache.addAll(urlsToCache)
        .catch((error) => {
          console.error('Service Worker: Cache.addAll failed:', error);
          // Questo errore è critico. Potrebbe essere un percorso sbagliato.
        });
    })
    .catch((error) => {
      console.error('Service Worker: caches.open failed:', error);
    })
  );
});

// Evento 'fetch': Viene scatenato ogni volta che il browser fa una richiesta di rete.
// Intercettiamo le richieste e, se il file è in cache, lo serviamo da lì (offline first).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
    .then((response) => {
      // Se troviamo una corrispondenza nella cache, la restituiamo.
      if (response) {
        console.log('Service Worker: Serving from cache:', event.request.url);
        return response;
      }
      // Altrimenti, facciamo la richiesta di rete.
      console.log('Service Worker: Fetching from network:', event.request.url);
      return fetch(event.request)
        .catch(() => {
          // Gestione dell'errore se la rete non è disponibile e il file non è in cache.
          // Ad esempio, potresti restituire una pagina offline predefinita.
          console.error('Service Worker: Fetch failed and no cache match for', event.request.url);
          // Puoi aggiungere qui una logica per mostrare una pagina offline se la risorsa non è in cache
          // if (event.request.mode === 'navigate') {
          //   return caches.match('./offline.html'); // Se hai una pagina offline
          // }
        });
    })
  );
});

// Evento 'activate': Viene scatenato quando il Service Worker viene attivato.
// In questo evento, puliamo le vecchie cache per non occupare spazio inutilmente.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME]; // La cache che vogliamo mantenere

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Elimina tutte le cache che non sono nella whitelist.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Prende il controllo delle pagine aperte.
  );
});