const CACHE_NAME = "wasser-app-v2";
// Use relative URLs so it works under GitHub Pages subpaths
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192x192.png",
  "./icon-512x512.png",
];

// Install Event - Cache Resources
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Event - Serve from Cache
self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // For navigation requests, try network first, then cache, then fallback to index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match("./index.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(request);
    })
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background Sync for Reminders
self.addEventListener("sync", function (event) {
  if (event.tag === "water-reminder") {
    event.waitUntil(
      // Send reminder notification
      self.registration.showNotification("Zeit zum Trinken! 💧", {
        body: "Vergiss nicht, ein Glas Wasser zu trinken!",
        icon: "./icon-192x192.png",
        badge: "./icon-192x192.png",
        tag: "water-reminder",
        requireInteraction: true,
        actions: [
          {
            action: "drink",
            title: "Ich trinke jetzt!",
          },
        ],
      })
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "drink") {
    // Open the app relative to scope
    event.waitUntil(clients.openWindow("./"));
  }
});
