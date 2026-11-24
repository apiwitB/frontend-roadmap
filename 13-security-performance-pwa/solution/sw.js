// เฉลย sw.js
const CACHE = 'lab-v1';
const FILES = ['exercise.html', 'exercise.js', 'manifest.webmanifest', 'icon.svg', '../_shared/test-runner.js'];

self.addEventListener('install', (event) => {
  // waitUntil: บอก browser ว่ายังติดตั้งไม่เสร็จ จนกว่า Promise นี้จะ resolve
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // response เป็น stream ที่อ่านได้ครั้งเดียว จึงต้อง clone ก่อน: ตัวหนึ่งเก็บลง cache อีกตัวส่งให้หน้าเว็บ
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // ออฟไลน์ → ใช้ของใน cache
  );
});
