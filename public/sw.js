// Minimal service worker for PWA installability
const CACHE = 'castile-portal-v1';
self.addEventListener('install', function () {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});
