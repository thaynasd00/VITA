// VITA - Service Worker
// Guarda a página em cache para o app abrir mesmo sem internet.
// Dados (Supabase) e WhatsApp continuam sempre pela rede, nunca são cacheados.

const CACHE = "vita-cache-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Nunca cacheia chamadas de dados/API nem WhatsApp
  if (req.url.includes("supabase.co") || req.url.includes("wa.me")) return;

  // Estratégia: tenta a rede primeiro (sempre pega a versão mais nova),
  // guarda uma cópia em cache, e se estiver offline usa o cache.
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then((r) => r || caches.match("./"))
      )
  );
});
