
const CACHEABLE = [
  // assets
  '/cofre/assets/',

  // pages
  '/cofre/get-started',
  '/cofre/login',
  '/cofre/home',
  '/cofre/settings',
]

function isCacheable(url) {
  return CACHEABLE.reduce((acc, path) => acc || url.includes(path), false)
}

async function putInCache(request, response) {
  const cache = await caches.open('v1')
  await cache.put(request, response)
}

async function networkFirst(request) {
  try {
    const responseFromNetwork = await fetch(request)
    if (isCacheable(responseFromNetwork.url)) {
      putInCache(request, responseFromNetwork.clone())
    }
    console.log('responding from network', request.url)
    return responseFromNetwork
  } catch (_error) {
    const responseFromCache = await caches.match(request)
    if (responseFromCache) {
      console.log('responding from cache', responseFromCache.url)
      return responseFromCache
    }

    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(
    networkFirst(event.request)
  )
})
