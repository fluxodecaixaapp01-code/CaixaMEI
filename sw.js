// CaixaMEI Service Worker
const CACHE_NAME = 'caixamei-v1';
const ASSETS = [
  '/CaixaMEI/',
  '/CaixaMEI/index.html',
  '/CaixaMEI/manifest.json',
  '/CaixaMEI/icon-192.png',
  '/CaixaMEI/icon-512.png',
];

// Instala e faz cache dos assets principais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estratégia: Network first, cache como fallback
self.addEventListener('fetch', e => {
  // Ignora requisições do Supabase (sempre online)
  if(e.request.url.includes('supabase.co') || e.request.url.includes('googleapis.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Atualiza cache com resposta nova
        if(res.ok && e.request.method === 'GET'){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
