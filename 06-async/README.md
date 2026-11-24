# บทที่ 06: Async JavaScript & Fetch API

> หัวข้อใน roadmap: Learn Fetch API / Ajax (XHR) · Promises · async/await · Event loop

JS รันบน **thread เดียว** แต่ทำงานหลายอย่างพร้อมกันได้ เช่น โหลดข้อมูล รอ timer และตอบสนองต่อการคลิก
กลไกที่ทำให้เป็นแบบนี้ได้เรียกว่า **event loop** ซึ่งเป็นพื้นฐานที่ต้องเข้าใจก่อนเขียนโค้ด async

---

## 1. Event Loop
```
┌───────────────────────┐
│      Call Stack       │  ← โค้ด sync รันตรงนี้ทีละบรรทัด
└──────────┬────────────┘
           │ เมื่อ stack ว่าง
           ▼
┌───────────────────────┐   ① ทำ microtask ให้ "หมดทุกตัว" ก่อนเสมอ
│   Microtask queue     │      Promise.then / await / queueMicrotask
└──────────┬────────────┘
           ▼
┌───────────────────────┐   ② browser อาจวาดหน้าจอ (render) ตรงนี้
│   (Render)            │
└──────────┬────────────┘
           ▼
┌───────────────────────┐   ③ หยิบ macrotask มา 1 ตัว แล้วกลับไปทำข้อ ① ใหม่
│ Macrotask (task) queue│      setTimeout / setInterval / events / I/O
└───────────────────────┘
```
งานที่ต้องรอ เช่น timer, network และ event ไม่ได้รันบน thread ของ JS แต่ browser (Web APIs) เป็นคนจัดการ
เมื่อเสร็จแล้ว browser จะเอา callback มาใส่ไว้ใน queue ให้ JS หยิบไปทำต่อ

```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1 4 3 2   ← microtask (3) ทำก่อน macrotask (2) เสมอ แม้ setTimeout จะตั้งไว้ 0ms
```
**ผลที่ตามมา**: ถ้าเขียนลูปที่หนักมาก (sync) หน้าเว็บจะค้าง เพราะ event loop ไม่ได้ไปถึงขั้นวาดหน้าจอหรือรับคลิกเลย

## 2. จาก Callback มาเป็น Promise
```js
// callback hell: ซ้อนกันลึกขึ้นเรื่อยๆ และจัดการ error ยาก
getUser(id, (err, user) => {
  getPosts(user.id, (err, posts) => {
    getComments(posts[0].id, (err, comments) => { … });
  });
});
```
**Promise** คือ object ที่เป็นตัวแทนของ "ค่าที่จะได้ในอนาคต" และมี 3 สถานะ
`pending` → `fulfilled` (สำเร็จ ได้ value) หรือ `rejected` (ล้มเหลว ได้ reason) เมื่อเปลี่ยนสถานะแล้วจะเปลี่ยนกลับไม่ได้อีก

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve('done'), 1000);
});
p.then((v) => v.toUpperCase())     // .then คืน Promise ใหม่ จึงต่อกันเป็น chain ได้
 .then((v) => console.log(v))
 .catch((err) => console.error(err)) // จับ error ที่เกิดได้ทุกจุดใน chain ข้างบน
 .finally(() => hideSpinner());
```

## 3. async / await
async/await ทำให้โค้ด async อ่านเหมือนโค้ด sync ข้างในยังเป็น Promise เหมือนเดิม
```js
async function load() {          // async function คืนค่าเป็น Promise เสมอ
  try {
    const user = await getUser(1); // หยุดรอเฉพาะใน function นี้ ส่วนอื่นของโปรแกรมยังทำงานต่อได้
    const posts = await getPosts(user.id);
    return posts;
  } catch (err) {
    console.error(err);
  }
}
```
### ⚠️ กับดัก: await ทีละตัวทั้งที่ไม่ต้องรอกัน
```js
// ❌ ใช้เวลา 2 วินาที (รอตัวแรกเสร็จก่อนแล้วค่อยเริ่มตัวที่สอง)
const a = await fetchA(); // 1s
const b = await fetchB(); // 1s

// ✅ ใช้เวลา 1 วินาที (เริ่มพร้อมกัน แล้วรอทั้งคู่)
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```
| ฟังก์ชัน | พฤติกรรม |
|---|---|
| `Promise.all` | รอให้ทุกตัวสำเร็จ ถ้ามีตัวไหน reject ก็ reject ทันที |
| `Promise.allSettled` | รอทุกตัวจบ แล้วคืนผลของทุกตัว ทั้งที่สำเร็จและล้มเหลว |
| `Promise.race` | ได้ผลของตัวที่จบก่อน ไม่ว่าจะสำเร็จหรือล้มเหลว |
| `Promise.any` | ได้ผลของตัวแรกที่ **สำเร็จ** |

## 4. Fetch API
```js
const res = await fetch('/api/users?page=2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ann' }),
  signal: controller.signal,    // ใช้ยกเลิก request ได้
});
if (!res.ok) throw new Error(`HTTP ${res.status}`); // ‼️ fetch ไม่ reject เมื่อได้ 404 หรือ 500
const data = await res.json();   // body เป็น stream ต้อง await อีกครั้ง
```
> **fetch จะ reject เฉพาะตอนที่ network ล่ม** (เช่น ออฟไลน์, DNS หาไม่เจอ, โดน CORS block)
> ส่วน 404 หรือ 500 ถือว่า "ได้ response แล้ว" จึงต้องเช็ก `res.ok` เองทุกครั้ง

**AbortController**: ยกเลิก request ที่ไม่ต้องใช้แล้ว เช่น ตอนผู้ใช้พิมพ์ค้นหาต่อ
```js
let controller;
async function search(q) {
  controller?.abort();               // ยกเลิก request ของคำค้นหาก่อนหน้า
  controller = new AbortController();
  const res = await fetch(`/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
  …
}
```
ถ้าไม่ยกเลิก อาจเจอ **race condition** คือผลของคำค้นเก่ากลับมาช้ากว่าผลของคำค้นใหม่ แล้วไปเขียนทับผลที่ถูกต้อง

ตั้ง timeout ด้วยคำสั่งเดียวก็ได้: `fetch(url, { signal: AbortSignal.timeout(5000) })`

**AJAX / XMLHttpRequest** คือวิธีเก่าก่อนจะมี fetch ยังเจอได้ในโค้ดเก่า แนวคิดเหมือนกันแต่ใช้ callback แทน Promise

**CORS** (ทบทวนบทที่ 01): ถ้าเรียก API ที่อยู่คนละ origin แล้วเจอ `blocked by CORS policy`
ต้องให้ **server** ส่ง header `Access-Control-Allow-Origin` กลับมา แก้ฝั่ง frontend ไม่ได้

## 5. จัดการ error ให้ครบ
- ทุก Promise ควรมีที่จับ error ด้วย `.catch` หรือ `try/catch` ไม่งั้นจะเกิด `Unhandled promise rejection`
- เวลาโหลดข้อมูล ควรมี UI ครบ 3 สถานะ: **loading / error / success** และอาจมี **empty** เพิ่มอีกสถานะ
- ถ้าเป็น error ชั่วคราว (network กระตุก, 503) ให้ **retry** โดยรอนานขึ้นเรื่อยๆ ระหว่างแต่ละครั้ง (exponential backoff)

---

## 🧪 แบบฝึกหัด
เปิด [`exercise.html`](exercise.html) แล้วแก้ [`exercise.js`](exercise.js) ทั้งหมด 8 ข้อ
1. `sleep(ms)`
2. **ทายลำดับ** การทำงานของ event loop
3. เขียน `promiseAll` เอง
4. `withTimeout(promise, ms)`
5. `retry(fn, times)`
6. `getJSON(url)` ที่ throw เมื่อได้ 404
7. `loadUsersWithPosts()` โหลด 2 ไฟล์ **พร้อมกัน** แล้วรวมข้อมูล
8. `mapLimit(items, limit, fn)` ทำงานพร้อมกันได้ไม่เกิน limit ตัว (เป็นแนวคิดเดียวกับ connection pool)

ไฟล์ข้อมูลอยู่ใน [`data/`](data/users.json) ลองเปิดแท็บ **Network** ใน DevTools ดูว่า request ถูกส่งออกไปพร้อมกันจริงหรือเปล่า

## ✅ เช็กความเข้าใจ
- ทำไม `setTimeout(fn, 0)` ถึงไม่ได้ทำงานทันที
- `await` ใน `for` loop ต่างจาก `Promise.all(items.map(...))` ยังไง
- ถ้า `fetch` ได้ 500 กลับมา จะเข้า `catch` ไหม
