# บทที่ 09: CSS Architecture

> หัวข้อใน roadmap: CSS Architecture (BEM) · CSS Preprocessors (Sass, PostCSS) · Modern CSS (Styled Components, CSS Modules, Tailwind)

ทุก selector ใน CSS มีผลกับทั้งหน้า (global) โปรเจกต์ที่ใหญ่ขึ้นจึงเริ่มเจอปัญหาแบบนี้
"แก้ปุ่มหน้า A แล้วปุ่มหน้า B พัง", "ไม่กล้าลบ class เพราะไม่รู้ว่ามีใครใช้อยู่", "ต้องใส่ `!important` ซ้อนกันไปเรื่อยๆ"
บทนี้คือวิธีจัดระเบียบ CSS เพื่อแก้ปัญหาเหล่านี้

---

## 1. BEM (Block, Element, Modifier)
```
.block            ← component ที่ใช้ซ้ำได้ เช่น .card
.block__element   ← ส่วนประกอบของ block เช่น .card__title
.block--modifier  ← รูปแบบหรือสถานะของ block เช่น .card--featured
.block__element--modifier  เช่น .card__button--disabled
```
```html
<article class="card card--featured">
  <img class="card__image" …>
  <h2 class="card__title">…</h2>
  <button class="card__button">…</button>
</article>
```
**ข้อดีของ BEM**
- specificity เท่ากันทุกตัวที่ (0,1,0) จึงไม่ต้องแข่งกันว่ากฎไหนชนะ
- ดูชื่อ class ก็รู้ว่าเป็นของ component ไหน จึงลบหรือแก้ได้มั่นใจขึ้น
- ไม่ขึ้นกับโครงสร้าง HTML (`.card__title` ใช้ได้ไม่ว่าจะอยู่ลึกกี่ชั้น ต่างจาก `.card div h2`)

**สิ่งที่ไม่ควรทำ**: `.card__body__title` (ซ้อน element ใน element) ให้ใช้ `.card__title` แทน เพราะ BEM ไม่ได้สะท้อนโครงสร้าง DOM

## 2. Design Tokens ด้วย CSS Custom Properties
```css
:root {
  --color-primary: #4f46e5;
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --radius: 12px;
}
.card__button { background: var(--color-primary); padding: var(--space-sm) var(--space-md); }
```
- ต่างจากตัวแปรของ Sass ตรงที่ **เปลี่ยนค่าได้ตอนรัน** และถูกส่งต่อไปยัง element ลูก (inherit) ตาม DOM
- ทำ **theme** ได้ด้วยการเขียนค่าตัวแปรใหม่ภายใต้ scope อื่น
```css
[data-theme="dark"] { --color-bg: #0f172a; --color-text: #e2e8f0; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }
```
- ใช้ค่า fallback ได้: `var(--accent, hotpink)`
- เปลี่ยนค่าจาก JS ได้: `el.style.setProperty('--x', '10px')`

## 3. `@layer` (Cascade Layers)
แบ่ง CSS เป็นชั้นๆ โดยให้ **ลำดับของ layer สำคัญกว่า specificity**
```css
@layer reset, base, components, utilities;   /* ประกาศลำดับไว้ก่อน: layer หลังสุดชนะ */

@layer components { .card .card__badge { display: inline-block; } }  /* specificity (0,2,0) */
@layer utilities  { .u-hidden { display: none; } }                   /* (0,1,0) แต่ชนะ เพราะอยู่ layer หลังกว่า */
```
เหมาะกับการดึง CSS ของ library เข้ามาโดยไม่ต้องแข่ง specificity กับมัน (เช่น ใส่ CSS ของ library ไว้ใน layer ที่อยู่ต้นๆ)

## 4. แนวทางอื่นที่ควรรู้จัก
| แนวทาง | ตัวอย่าง | ทำงานยังไง |
|---|---|---|
| **Preprocessor** | Sass, Less | มีตัวแปร, nesting, mixin และ function แล้ว compile ออกมาเป็น CSS ปัจจุบัน CSS ทำ nesting และตัวแปรได้เองแล้ว |
| **PostCSS** | autoprefixer | ใช้ plugin แปลง CSS เช่น เติม vendor prefix ให้อัตโนมัติ |
| **CSS Modules** | `styles.module.css` | build tool แปลงชื่อ class ให้ไม่ซ้ำกัน เช่น `.title` กลายเป็น `.title_x7f3a` ทำให้มี scope ระดับไฟล์ |
| **Utility-first** | Tailwind | เขียน class เล็กๆ ลงใน HTML ตรงๆ เช่น `class="p-4 rounded-lg bg-indigo-600"` |
| **CSS-in-JS** | styled-components, Emotion | เขียน CSS ไว้ในไฟล์ JS ผูกกับ component |

ตัวอย่าง Sass เทียบกับ CSS สมัยใหม่
```scss
// Sass
$primary: #4f46e5;
@mixin center { display: grid; place-items: center; }
.card { &__title { color: $primary; } &:hover { … } }
```
```css
/* CSS ปัจจุบัน (ไม่ต้อง compile) */
.card { & .card__title { color: var(--primary); } &:hover { … } }
```
ข้อสังเกต: `&__title` ใช้ได้ใน Sass เท่านั้น ใน CSS ต้องเขียนชื่อ class เต็ม

**ไม่มีแนวทางไหนดีที่สุดในทุกกรณี** หลักการที่ทุกแนวทางมีร่วมกันคือ 1) ทำให้ CSS มี scope ไม่ส่งผลไปทั้งหน้า 2) รวมค่าที่ใช้ซ้ำไว้เป็น token 3) ทำให้ specificity คาดเดาได้

---

## 🧪 แบบฝึกหัด
เปิด [`exercise.html`](exercise.html) ซึ่งเป็น card component ที่ยังไม่มี class เลย ให้ทำตามนี้
1. ใส่ class แบบ BEM: `card`, `card__image`, `card__title`, `card__body`, `card__button`, `card--featured` และ `card__badge`
2. สร้าง design tokens ใน `:root` และให้ component ใช้ `var(...)` ทั้งหมด
3. ทำ dark theme ด้วย `[data-theme="dark"]` และปุ่ม toggle (เขียน JS 5 บรรทัด)
4. ใช้ `@layer` เพื่อให้ utility class `.u-hidden` ชนะ component เสมอ

## ✅ เช็กความเข้าใจ
- ทำไมการใช้ `.card__title` ถึงดีกว่า `.card h2`
- CSS variable กับ Sass variable ต่างกันยังไง ตัวไหนใช้ทำ dark mode ตอนรันได้
- ถ้าใส่ CSS ของ library ไว้ใน `@layer vendor` แล้ว CSS ของเราที่ไม่ได้อยู่ใน layer ใดเลยจะชนะหรือแพ้
