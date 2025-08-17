// service-worker.js

// O nome do cache é versionado. Mudar este nome força a atualização de todos os arquivos.
const CACHE_NAME = 'arttesdabel-cache-v2'; 
// Lista de arquivos e recursos essenciais para o funcionamento offline do app.
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/logo.png',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700&display=swap',
  'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://cdn.jsdelivr.net/npm/toastify-js'
];

/**
 * Evento de Instalação (install)
 * - É acionado quando um novo service worker é registado.
 * - Abre o cache com o nome versionado.
 * - Adiciona todos os arquivos da lista `urlsToCache` ao cache.
 * - Chama `self.skipWaiting()` para forçar o novo service worker a se tornar ativo imediatamente.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos sendo adicionados.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força a ativação imediata do novo service worker.
  );
});

/**
 * Evento de Ativação (activate)
 * - É acionado depois que o service worker é instalado e está pronto para assumir o controle.
 * - Limpa caches antigos que não correspondem ao CACHE_NAME atual.
 * - Chama `self.clients.claim()` para que o service worker assuma o controle de todas as abas abertas do app.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('A deletar cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Garante que o SW ativo controle a página imediatamente.
  );
});

/**
 * Evento de Busca (fetch)
 * - Interceta todos os pedidos de rede da página.
 * - Utiliza uma estratégia "Network First" (rede primeiro) para o HTML principal, garantindo que o usuário sempre receba a versão mais recente da página.
 * - Para outros recursos (CSS, JS, imagens), usa uma estratégia "Cache First" (cache primeiro) para carregamento rápido. Se não estiver no cache, busca na rede e armazena para uso futuro.
 */
self.addEventListener('fetch', event => {
  // Para pedidos de navegação (o próprio HTML), vá para a rede primeiro.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Se a rede falhar, sirva a partir do cache.
        return caches.match(event.request);
      })
    );
    return;
  }

  // Para todos os outros pedidos (CSS, JS, imagens), use a estratégia "cache-first".
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorne-o.
        if (response) {
          return response;
        }

        // Se não, busque na rede.
        return fetch(event.request).then(
          networkResponse => {
            // Verifica se a resposta da rede é válida.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Clona a resposta para poder armazená-la no cache e enviá-la ao navegador.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});
