# บทที่ 08: Modules, npm & Build tools

> หัวข้อใน roadmap: Package Managers (npm, yarn, pnpm) · Module Bundlers (Vite, webpack, esbuild, Rollup) · Linters and Formatters (ESLint, Prettier) · Task runners

เวลารัน `npm run dev` แล้วเว็บขึ้นมา มีเครื่องมือหลายตัวทำงานอยู่เบื้องหลัง บทนี้อธิบายว่าแต่ละตัวทำอะไร
แล้วให้ลอง **เขียน bundler เอง** ประมาณ 60 บรรทัด เพื่อให้เห็นว่า webpack และ Vite ทำงานยังไง

---

## 1. Module system มาจากไหน
**ยุคแรก**: ใช้ `<script>` หลายๆ ตัว ทุกไฟล์แชร์ตัวแปร global ร่วมกัน ชื่อชนกันง่าย และต้องเรียงลำดับไฟล์เองให้ถูก
```html
<script src="jquery.js"></script>
<script src="plugin.js"></script>  <!-- ถ้าสลับลำดับกับบรรทัดบน โค้ดจะพัง -->
<script src="app.js"></script>
```
**IIFE**: ห่อโค้ดไว้ในฟังก์ชันเพื่อสร้าง scope ส่วนตัว `(function () { … })();`

**CommonJS (Node.js)**: โหลดแบบ synchronous ตอนรัน ใช้กับ Node มาแต่เดิม
```js
const math = require('./math.js');
module.exports = { add };
```

**ES Modules (ESM)**: เป็นมาตรฐานของภาษา ใช้ได้ทั้งใน browser และ Node
```js
import { add } from './math.js';
import React from 'react';
export const PI = 3.14;
export default function App() {}
```
| | CommonJS | ESM |
|---|---|---|
| ไวยากรณ์ | `require` / `module.exports` | `import` / `export` |
| เวลาที่โหลด | ตอนรัน (เขียน `require` ไว้ใน `if` ได้) | **วิเคราะห์โครงสร้างได้ก่อนรัน (static)** |
| Tree-shaking | ทำได้ยาก | ทำได้ เพราะรู้ล่วงหน้าว่าแต่ละไฟล์ใช้อะไรบ้าง |
| โหลด async | ไม่ได้ | `import('./big.js')` (dynamic import ใช้ทำ code splitting) |

ใน browser ใช้ได้เลยด้วย `<script type="module" src="main.js"></script>` แต่ต้องเปิดผ่าน http:// ไม่ใช่ file://

## 2. npm
```powershell
npm init -y                 # สร้าง package.json
npm install dayjs           # เพิ่มเป็น dependency (โค้ดที่ใช้ตอนแอปรันจริง)
npm install -D vite eslint  # เพิ่มเป็น devDependency (เครื่องมือที่ใช้ตอนพัฒนาเท่านั้น)
npm uninstall dayjs
npm run dev                 # รันคำสั่งที่ตั้งไว้ใน "scripts"
npx eslint .                # รัน CLI ที่ติดตั้งอยู่ใน node_modules/.bin
npm outdated / npm audit    # เช็กเวอร์ชันเก่า และช่องโหว่ด้านความปลอดภัย
```
**package.json**
```json
{
  "name": "my-app",
  "type": "module",               // ให้ไฟล์ .js เป็น ESM
  "scripts": { "dev": "vite", "build": "vite build", "lint": "eslint ." },
  "dependencies": { "dayjs": "^1.11.13" },
  "devDependencies": { "vite": "^6.0.0" }
}
```
**Semver** `MAJOR.MINOR.PATCH` เช่น `1.11.13`
- MAJOR: มี breaking change (โค้ดเดิมอาจพัง) · MINOR: เพิ่มฟีเจอร์ · PATCH: แก้ bug
- `^1.11.13` ยอมรับ `>=1.11.13 <2.0.0` ซึ่งเป็นค่าเริ่มต้นของ npm
- `~1.11.13` ยอมรับ `>=1.11.13 <1.12.0`

**package-lock.json** บันทึกเวอร์ชันที่ติดตั้งจริงของ *ทุก* package รวมถึง package ที่ package อื่นพึ่งอยู่
**ต้อง commit ไฟล์นี้** เพื่อให้ทุกคนในทีมและ CI ได้ dependency ชุดเดียวกัน (บน CI ใช้ `npm ci`)
ส่วน `node_modules/` **ไม่ต้อง commit** เพราะสร้างใหม่จาก lock file ได้

pnpm และ yarn ทำหน้าที่เดียวกับ npm แต่ pnpm เร็วกว่าและประหยัดพื้นที่ดิสก์กว่า เพราะใช้ link แทนการ copy ไฟล์

## 3. Bundler ทำอะไร
1. **Resolve**: เริ่มจากไฟล์ entry ตามหา `import` แล้วสร้าง **dependency graph** ของทุกไฟล์
2. **Transform**: แปลงไฟล์ที่ browser อ่านไม่ได้ เช่น TypeScript, JSX, Sass และ syntax ใหม่ ให้เป็น JS/CSS ธรรมดา
3. **Bundle**: รวมหลายไฟล์ให้เหลือไม่กี่ไฟล์ พร้อม "runtime" เล็กๆ ที่ทำหน้าที่แทน `require`/`import`
4. **Optimize**: ทำ tree-shaking (ตัดโค้ดที่ไม่ได้ใช้), minify (ย่อชื่อตัวแปรและลบช่องว่าง) และ code splitting
5. **ตั้งชื่อไฟล์ด้วย hash**: เช่น `app.3f9a1c.js` แล้ว cache ได้ตลอดไป (ดูเรื่อง cache ในบทที่ 01)

**Vite** ทำงานต่างจาก webpack ตรงที่ตอน dev จะ **ไม่ bundle** แต่ส่ง ESM ให้ browser โหลดเองทีละไฟล์
จึงเริ่มทำงานได้ทันที และแก้ไฟล์แล้วหน้าเว็บอัปเดตแทบจะทันที (HMR) ส่วนตอน build จะใช้ Rollup bundle
ตัวที่ควรรู้จักอีก 2 ตัวคือ esbuild และ SWC ซึ่งเขียนด้วย Go และ Rust จึงเร็วกว่าเครื่องมือที่เขียนด้วย JS มาก

## 4. Linter และ Formatter
- **ESLint**: หาโค้ดที่น่าจะเป็น bug เช่น ตัวแปรที่ประกาศแล้วไม่ใช้ หรือลืม `await`
- **Prettier**: จัดรูปแบบโค้ดให้เหมือนกันทั้งทีม ทีมจะได้ไม่ต้องเถียงกันเรื่องเว้นวรรคหรือเครื่องหมาย
- ใช้คู่กับ **husky** + **lint-staged** เพื่อให้รัน lint อัตโนมัติก่อน commit

---

## 🧪 แบบฝึกหัด A: เขียน bundler เอง ✅ มี test
เปิด [`bundler.js`](bundler.js) แล้วเขียน 3 ฟังก์ชัน
1. `findDependencies(code)` หาทุก `require('...')` ในโค้ด
2. `createGraph(entry)` ไล่หา dependency ทั้งหมดแบบ BFS โดยไม่ซ้ำไฟล์
3. `bundle(graph)` สร้างโค้ดไฟล์เดียวที่รันได้เอง

ตัวอย่างโค้ดที่ใช้ bundle อยู่ใน [`example/`](example/index.js)
```powershell
node --test 08-modules-build/          # ตรวจงาน
node 08-modules-build/bundler.js       # bundle example/ ไปเป็น dist/bundle.js
node 08-modules-build/dist/bundle.js   # รันไฟล์ที่ bundle แล้ว
```
แล้วลองเปิด `dist/bundle.js` ดู ถ้าเทียบกับ output ของ webpack ในโหมด development จะเห็นว่าโครงสร้างคล้ายกันมาก

## 🧪 แบบฝึกหัด B: ใช้ Vite จริง (ไม่มี test)
```powershell
cd D:\leaning
npm create vite@latest vite-playground -- --template vanilla
cd vite-playground
npm install
npm run dev
```
1. แก้ `main.js` แล้วดูว่าหน้าเว็บอัปเดตเองโดยไม่ต้องรีเฟรช (HMR)
2. เปิด DevTools → Network ตอน dev จะเห็นไฟล์ถูกโหลดแยกกันทีละไฟล์ เพราะยังไม่ได้ bundle
3. รัน `npm run build` แล้วดูโฟลเดอร์ `dist/` ว่าชื่อไฟล์มี hash และโค้ดถูก minify
4. ลอง `npm install dayjs` แล้ว `import dayjs from 'dayjs'` ใน main.js

## ✅ เช็กความเข้าใจ
- ทำไม tree-shaking ถึงทำกับ ESM ได้ง่ายกว่า CommonJS
- `dependencies` กับ `devDependencies` ต่างกันยังไง
- ทำไมต้อง commit `package-lock.json`
