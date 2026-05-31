// sw.js — Service Worker
// Bertanggung jawab untuk:
// 1. Cache file PWA agar bisa dibuka offline
// 2. Memenuhi syarat "installable" bersama manifest.json

const CACHE_NAME = 'dompet-v1';
const CACHE_FILES = ['/', '/index.html', '/manifest.json', '/icon.svg'];

// Install: cache semua file utama
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(CACHE_FILES); })
      .then(function() { return self.skipWaiting(); })
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch: network first, fallback ke cache
self.addEventListener('fetch', function(e) {
  // Jangan intercept request ke Google (GAS API)
  if (e.request.url.indexOf('script.google') !== -1 ||
      e.request.url.indexOf('googleusercontent') !== -1) return;

  e.respondWith(
    fetch(e.request)
      .then(function(res) {
        // Simpan response terbaru ke cache
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        return res;
      })
      .catch(function() {
        // Offline: sajikan dari cache
        return caches.match(e.request);
      })
  );
});
