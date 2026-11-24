# Frontend Roadmap Lab 🧭

ชุดบทเรียนและแบบฝึกหัดที่ทำตาม [roadmap.sh/frontend](https://roadmap.sh/frontend)
ทุกบทมีคำอธิบาย ให้ลองเขียนเอง แล้วมี **test ตรวจอัตโนมัติ** บอกว่าเขียนถูกหรือยัง

## เริ่มต้น

```powershell
cd D:\leaning\frontend-roadmap
node serve.js
```

แล้วเปิด **http://localhost:5500** (หน้ารวมจะแสดงบทเรียนและคะแนนของแต่ละแบบฝึกหัด)

> ต้องเปิดผ่าน `node serve.js` ห้ามดับเบิลคลิกไฟล์ HTML ตรงๆ เพราะ `file://` ใช้ `fetch()`, ES modules
> และ Service Worker ไม่ได้ (เหตุผลอธิบายไว้ในบทที่ 01 และ 13)

## วิธีเรียน (ทำแบบนี้ทุกบท)

1. **อ่าน** `README.md` ของบทนั้น (กดปุ่ม 📖 ที่หน้ารวม หรือเปิดใน VS Code แล้วกด `Ctrl+Shift+V`)
2. **เปิดแบบฝึกหัด** ในเบราว์เซอร์ จะเห็นกล่อง test มุมขวาล่าง ตอนแรกจะแดงหมด ซึ่งเป็นเรื่องปกติ
3. **แก้โค้ด** ตรงที่มีคำว่า `TODO` แล้วรีเฟรช (F5)
4. ทำจน test **เขียวหมด** 🎉
5. ติดจริงๆ ค่อยเปิด `solution/` ดู แต่ควรลองเองก่อนอย่างน้อย 20 นาที เพราะช่วงที่ติดคือช่วงที่ได้เรียนรู้มากที่สุด
6. เปิด **DevTools (F12)** ไว้ตลอด ใช้ Console, Elements และ Network ให้คล่อง

แบบฝึกหัดที่เขียนว่า 💻 ให้รันใน terminal (เช่น `node --test 01-internet/`)

## แผนที่บทเรียน ↔ Roadmap

| บท | หัวข้อใน roadmap | สิ่งที่จะได้ลงมือทำ |
|---|---|---|
| 01 | Internet, HTTP, DNS, Browsers | ส่ง HTTP ด้วย TCP ดิบ, เขียน HTTP server ที่มี cache/redirect |
| 02 | HTML, Semantic, Forms, Accessibility, SEO | แปลง div soup, ฟอร์มที่ validate ได้โดยไม่ใช้ JS |
| 03 | CSS, Box model, Flexbox, Grid, Responsive | 4 แบบฝึกหัด layout ที่ test ตรวจด้วยการวัดตำแหน่งจริง |
| 04 | JavaScript core | closure, this, prototype, memoize, curry, EventEmitter |
| 05 | DOM manipulation | Todo app ด้วย vanilla JS และ event delegation |
| 06 | Fetch API / AJAX, Async | Promise.all ที่เขียนเอง, retry, timeout, concurrency limit |
| 07 | Version control (Git) | lab ที่ให้สร้าง branch/merge/conflict แล้วมี script ตรวจงาน |
| 08 | Package managers, Module bundlers | เขียน bundler เอง (แบบ webpack ฉบับย่อ) |
| 09 | CSS architecture (BEM), Preprocessors | refactor เป็น BEM + design tokens + dark mode |
| 10 | Frameworks (React) | เขียน mini React (h, render, useState) แล้วเทียบกับ React จริง |
| 11 | Testing | หา bug ที่ซ่อนอยู่ด้วยการเขียน test |
| 12 | Type checkers (TypeScript) | ใช้ type บังคับให้โค้ดถูกต้อง |
| 13 | Web security, Performance, PWA | กัน XSS, debounce/throttle, Service Worker |
| 14 | Final project | สร้างแอปจริงที่ใช้ทุกอย่างรวมกัน |

## เครื่องมือที่ต้องมี
- **Node.js** (มีแล้ว) · **Git** (มีแล้ว) · **VS Code** · **Chrome หรือ Edge**
- บทที่ 12 ต้องรัน `npm install` ในโฟลเดอร์ `12-typescript` เพื่อติดตั้ง TypeScript

## โครงสร้างโฟลเดอร์
```
frontend-roadmap/
├─ serve.js            ← static server (node serve.js)
├─ index.html          ← หน้ารวม + ความคืบหน้า
├─ _shared/
│  └─ test-runner.js   ← test framework จิ๋วที่ทุกแบบฝึกหัดใช้ (เปิดอ่านได้ บทที่ 11 จะอธิบาย)
├─ 01-internet/ … 14-final-project/
│  ├─ README.md        ← บทเรียน
│  ├─ ex*.html / *.js  ← แบบฝึกหัด (แก้ตรง TODO)
│  └─ solution/        ← เฉลย
```
