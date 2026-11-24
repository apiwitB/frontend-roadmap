# บทที่ 14: Final Project 🚀

ถึงตรงนี้คุณได้ลงมือทำทุกชั้นของ frontend มาแล้ว ตั้งแต่ HTTP, HTML, CSS, JS, DOM, async, build tools, framework, testing, TypeScript จนถึง security
บทนี้ให้สร้าง **แอปจริง 1 ตัว** ที่ใช้ความรู้ทั้งหมดรวมกัน

---

## โจทย์: "Reading List": แอปจดหนังสือที่อยากอ่าน
ค้นหาหนังสือจาก API สาธารณะ แล้วเก็บไว้ในรายการของตัวเอง

**API ที่ใช้ได้ฟรี (ไม่ต้องสมัคร)**: Open Library
```
https://openlibrary.org/search.json?q=harry+potter&limit=10
https://covers.openlibrary.org/b/id/{cover_i}-M.jpg
```

### ฟีเจอร์ที่ต้องมี (MVP)
1. ช่องค้นหาที่ใช้ **debounce** แสดงผลลัพธ์เป็นการ์ด (รูปปก, ชื่อหนังสือ, ผู้แต่ง, ปีที่พิมพ์)
2. มีสถานะ **loading / error / empty** ครบ และ **ยกเลิก request เก่า** ด้วย AbortController
3. ปุ่ม "เพิ่มเข้ารายการ" แล้วจัดการรายการได้ (สถานะ: อยากอ่าน / กำลังอ่าน / อ่านจบ) พร้อม filter
4. เก็บรายการไว้ใน localStorage
5. **Responsive** ใช้ได้ดีทั้งบนมือถือและเดสก์ท็อป และมี dark mode
6. **Accessible**: ใช้งานด้วย keyboard ได้ครบ, มี label, alt และ landmark
7. รูปปกใช้ lazy loading และกำหนด `width`/`height`

### เลือกระดับความยาก
| ระดับ | Stack | สิ่งที่ได้ฝึก |
|---|---|---|
| 🟢 พื้นฐาน | HTML + CSS + vanilla JS (ES modules) | บทที่ 02–06 |
| 🟡 กลาง | **Vite** + vanilla **TypeScript** + Vitest | เพิ่มบทที่ 08, 11 และ 12 |
| 🔴 สูง | **Vite + React + TypeScript** + Testing Library + Playwright + PWA | ทุกบท |

### เริ่มต้น (ระดับกลางและสูง)
```powershell
cd D:\leaning
npm create vite@latest reading-list -- --template react-ts
cd reading-list
npm install
npm run dev
```
```powershell
git init
git add .
git commit -m "chore: scaffold with vite"
```

### แนะนำให้แบ่ง commit ตามขั้นตอนนี้ (ฝึกใช้ Git ไปด้วย)
1. `feat: layout + responsive shell` (header, ช่องค้นหา, grid ว่างๆ)
2. `feat: search with debounce + abort`
3. `feat: reading list with localStorage`
4. `feat: status filter`
5. `feat: dark mode with css variables`
6. `test: unit tests for list reducer`
7. `perf: lazy images + lighthouse fixes`
8. `feat: pwa offline support` (ระดับสูง)

### โครงสร้างที่แนะนำ (React)
```
src/
├─ api/openLibrary.ts       ← fetch + แปลงข้อมูลให้เป็น type ของเราเอง (Book)
├─ hooks/useDebounce.ts
├─ hooks/useLocalStorage.ts
├─ state/readingList.ts     ← reducer (pure function ที่ test ง่าย)
├─ components/SearchBar.tsx
├─ components/BookCard.tsx
├─ components/ReadingList.tsx
├─ App.tsx
└─ styles/tokens.css        ← design tokens (บทที่ 09)
```

### Deploy (ฟรี)
- `npm run build` แล้วอัปโหลดโฟลเดอร์ `dist/` ขึ้น **Netlify Drop** (ลากไฟล์ไปวางได้เลย)
- หรือ push ขึ้น GitHub แล้วเชื่อมกับ **Vercel**, **Cloudflare Pages** หรือ **GitHub Pages**

---

## ✅ Checklist ประเมินตัวเอง
**HTML & Accessibility**
- [ ] ใช้ semantic tag (`header`, `main`, `nav`, `article`) และมี `h1` เพียง 1 อัน
- [ ] ใช้งานได้ครบด้วย Tab และ Enter และมี focus ring ที่มองเห็นได้
- [ ] คะแนน Lighthouse Accessibility ≥ 95

**CSS**
- [ ] เขียนแบบ mobile-first โดยไม่มี horizontal scroll ที่ความกว้าง 375px
- [ ] ใช้ design tokens (CSS variables) และมี dark mode
- [ ] ตั้งชื่อ class ให้มีระบบ (BEM, CSS Modules หรือ Tailwind)

**JavaScript**
- [ ] ใช้ pattern state → render (หรือ React state) โดยไม่ mutate state
- [ ] ใช้ debounce กับช่องค้นหาและยกเลิก request เก่าได้
- [ ] จัดการ error ครบ (ออฟไลน์, API ล่ม, ผลลัพธ์ว่าง)

**Tooling & Quality**
- [ ] ประวัติ Git แบ่งเป็น commit ย่อยๆ และ message อ่านเข้าใจ
- [ ] มี unit test ของ logic หลักอย่างน้อย 5 ข้อ
- [ ] (TS) ไม่มี `any` และเปิด `strict` ไว้
- [ ] ใช้ ESLint และ Prettier

**Performance & Security**
- [ ] คะแนน Lighthouse Performance ≥ 90 และ CLS < 0.1
- [ ] ไม่ใช้ `innerHTML` กับข้อมูลที่ได้จาก API
- [ ] ไม่มี secret อยู่ในโค้ด

---

## หลังจากนี้เรียนอะไรต่อ
- **Next.js** (SSR/SSG) → สร้างเว็บที่ SEO ดีขึ้น
- **TanStack Query** → จัดการข้อมูลที่ได้จาก server
- **Playwright** → เขียน E2E test
- **Web Components / Shadow DOM** → ลองเปิด `_shared/test-runner.js` ดู panel ผล test ใช้ Shadow DOM อยู่
- **Accessibility เชิงลึก**: WAI-ARIA Authoring Practices
- อ่านต่อที่ [roadmap.sh/frontend](https://roadmap.sh/frontend) แล้วติ๊กหัวข้อที่ทำไปแล้ว ส่วนที่เหลือให้หยิบมาเรียนทีละหัวข้อ
