// 오프라인에서도 앱이 열리도록 앱 파일만 저장 (번역은 매번 서버에서)
const C = "translate-2", FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.oninstall = e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); };
self.onactivate = e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("translate") && k !== C).map(k => caches.delete(k)))));
self.onfetch = e => {
  if (new URL(e.request.url).origin !== location.origin) return;
  const key = e.request.mode === "navigate" ? "./" : e.request;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if (r.ok) caches.open(C).then(c => c.put(key, copy)); return r; })
    .catch(() => caches.match(key, { ignoreSearch: true }).then(r => r || caches.match("./"))));
};
