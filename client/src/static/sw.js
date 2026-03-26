const CACHE_NAME = 'recipe-app-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  // 网络优先策略，适合动态内容多的 App
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})
