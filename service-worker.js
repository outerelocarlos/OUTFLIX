const cacheName = "v1";

/*const cacheAssets = [
  "detail.html",
  "genre.html",
  "genres.html",
  "index.html",
  "nowplaying.html",
  "search.html",
  "toprated.html",
  "trending.html",
  "upcoming.html",
  "/css/style.css",
  "/css/jquery-ui.css",
  "/js/app.js",
  "/js/jquery-ui.min.js"
];*/

// Evento de instalación
self.addEventListener("install", e => {
  console.log("Service Worker: Installed");

  /*e.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        console.log("Service Worker: Caching Files");
        cache.addAll(cacheAssets);
      })
      .then(() => {
        self.skipWaiting();
        console.log("Service Worker: Files Cached");
      })
  );*/
});

// Evento de activación
self.addEventListener("activate", e => {
  console.log("Service Worker: Activated");

  // Se elimina la cache no deseada
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Se elimina toda cache no asociada al cacheName vigente
          if (cache !== cacheName) {
            console.log("Service Worker: Deleting Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Evento fetch
self.addEventListener("fetch", e => {
  console.log("Service Worker: Fetching");
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(cacheName).then(cache => {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(err => caches.match(e.request).then(response => response))
  );
});
