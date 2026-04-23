const CACHE_NAME = "locallens-public-v1"
const PUBLIC_ROUTES = ["/", "/planner", "/attractions/"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(["/", "/planner"]))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  )
})

function shouldCacheNavigation(url) {
  if (url.origin !== self.location.origin) {
    return false
  }

  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) {
    return false
  }

  return PUBLIC_ROUTES.some((route) =>
    route.endsWith("/")
      ? url.pathname.startsWith(route)
      : url.pathname === route
  )
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  if (event.request.mode !== "navigate" || !shouldCacheNavigation(url)) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached || caches.match("/"))
      )
  )
})
