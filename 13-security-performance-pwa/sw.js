// sw.js: Service Worker (รันแยกจากหน้าเว็บ ไม่มี window และไม่มี DOM)
// ดู/ลบได้ที่ DevTools → Application → Service Workers

const CACHE = 'lab-v1';
// ⚠️ ถ้ามีไฟล์ไหนโหลดไม่ได้ (404) addAll จะล้มเหลวทั้งชุด
const FILES = [
  'exercise.html',
  'exercise.js',
  'manifest.webmanifest',
  'icon.svg',
  '../_shared/test-runner.js',
];

// ── ข้อ 7a: install ── เก็บไฟล์ทั้งหมดลง cache ล่วงหน้า (precache)
self.addEventListener('install', (event) => {
  // TODO: event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)))
  self.skipWaiting(); // ให้ SW ตัวใหม่ทำงานทันที ไม่ต้องรอปิดแท็บเก่า
});

// ── activate ── ลบ cache เวอร์ชันเก่า (เขียนไว้ให้แล้ว)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()) // ให้ควบคุมหน้าที่เปิดอยู่ทันที
  );
});

// ── ข้อ 7b: fetch ── กลยุทธ์ network-first
//   1) ลอง fetch(event.request) จาก network ก่อน
//      ถ้าได้ → เก็บ copy ลง cache (response.clone()) แล้วคืน response
//   2) ถ้า network ล่ม (ออฟไลน์) → คืนของจาก cache: caches.match(event.request)
//   ทำเฉพาะ GET (request ที่ method อื่นปล่อยผ่านไปเลย)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // TODO: event.respondWith(...)
});
