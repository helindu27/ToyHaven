const CACHE_NAME = "toy-haven-v23";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./products.html",
  "./cart.html",
  "./checkout.html",
  "./wishlist.html",
  "./support.html",
  "./css/style.css",
  "./js/products.js",
  "./js/main.js",
  "./js/cart.js",
  "./js/checkout.js",
  "./js/wishlist.js",
  "./js/support.js",
  "./manifest.json",
  "./images/favicon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(CORE_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function saveResponse(request, response) {
  if (response && response.ok && response.type === "basic") {
    caches.open(CACHE_NAME).then(function (cache) {
      cache.put(request, response.clone());
    });
  }
  return response;
}

function useNetworkFirst(request) {
  return fetch(request)
    .then(function (response) { return saveResponse(request, response); })
    .catch(function () {
      return caches.match(request).then(function (cachedResponse) {
        if (cachedResponse) return cachedResponse;
        if (request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    });
}

function useCacheFirst(request) {
  return caches.match(request).then(function (cachedResponse) {
    if (cachedResponse) return cachedResponse;
    return fetch(request).then(function (response) {
      return saveResponse(request, response);
    });
  });
}

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  var requestUrl = new URL(event.request.url);
  var isLocalRequest = requestUrl.origin === self.location.origin;
  var needsFreshCode = event.request.mode === "navigate" ||
    event.request.destination === "script" ||
    event.request.destination === "style";

  if (isLocalRequest && needsFreshCode) {
    event.respondWith(useNetworkFirst(event.request));
  } else {
    event.respondWith(useCacheFirst(event.request));
  }
});
