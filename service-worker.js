// Nome do cache
const CACHE_NAME = 'arttesdabel-cache-v1';
// Ficheiros a serem guardados em cache
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/logo.png'
];

// Evento de instalação: abre o cache e adiciona os ficheiros principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: responde com os dados do cache se estiverem disponíveis
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o ficheiro estiver no cache, retorna-o
        if (response) {
          return response;
        }
        // Senão, busca na rede
        return fetch(event.request);
      }
    )
  );
});
