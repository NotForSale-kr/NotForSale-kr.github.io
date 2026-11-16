// 오프라인에서도 앱이 열리도록 앱 파일만 저장 (시세는 매번 새로 받음) + 등락 알림 표시
const C = "stock-lite-2", FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.oninstall = e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); };
self.onactivate = e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("stock") && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
self.onfetch = e => {
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./"))));
};
self.onpush = e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || "주식 알림", {
    body: d.body || "", icon: "icon-192.png", tag: d.tag || "stock", renotify: true, data: { url: "./" }
  }));
};
self.onnotificationclick = e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.includes("/stock/") && "focus" in w) return w.focus();
    return clients.openWindow("./");
  }));
};
