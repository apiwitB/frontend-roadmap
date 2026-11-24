# บทที่ 03: CSS

> หัวข้อใน roadmap: Learn the basics · Making Layouts (Floats, Positioning, Display, Box Model, CSS Grid, Flexbox) · Responsive Design and Media Queries

หลายคนรู้สึกว่า CSS "ควบคุมไม่ได้" ซึ่งมักเกิดจากการเขียนแบบลองผิดลองถูก
ถ้าเข้าใจกฎ 4 ข้อนี้ จะคาดเดาผลของ CSS ได้เกือบทุกครั้ง: **cascade, box model, formatting context และ layout algorithm**

---

## 1. Cascade: ถ้ามีหลายกฎที่ขัดกัน กฎไหนชนะ

browser ตัดสินตามลำดับนี้ เริ่มจากข้อบนก่อน
1. **Origin & importance**: `!important` ชนะกฎปกติ (ใช้เท่าที่จำเป็นจริงๆ)
2. **Inline style**: `style="..."` ชนะ selector ทุกแบบ
3. **Cascade layers**: กฎที่ไม่ได้อยู่ใน `@layer` ชนะกฎที่อยู่ใน layer ส่วนระหว่าง layer ด้วยกัน layer ที่ประกาศทีหลังชนะ
4. **Specificity**: selector ที่เจาะจงกว่าชนะ
5. **ลำดับในไฟล์**: ถ้าทุกข้อข้างบนเท่ากัน กฎที่เขียนทีหลังชนะ

### Specificity คิดเป็นตัวเลข 3 หลัก `(ID, CLASS, TYPE)`
| Selector | คะแนน |
|---|---|
| `p` | (0,0,1) |
| `.note` | (0,1,0) |
| `p.note` | (0,1,1) |
| `.card .note` | (0,2,0) |
| `#main p` | (1,0,1) |
| `:is(.a, #b)` | ใช้คะแนนของตัวที่สูงสุดในวงเล็บ → (1,0,0) |
| `:where(.a, #b)` | **(0,0,0) เสมอ** เหมาะสำหรับเขียน base style ที่อยากให้ override ง่าย |
| `*` | (0,0,0) |

ให้เทียบทีละหลักจากซ้ายไปขวา เช่น `(1,0,0)` ชนะ `(0,15,0)` เพราะหลักแรกมากกว่า
ใน DevTools เอาเมาส์ชี้ที่ selector ใน Elements → Styles จะเห็นคะแนน specificity

### Inheritance
property บางตัวถูกส่งต่อจาก parent ไปยังลูกโดยอัตโนมัติ ส่วนใหญ่เป็นเรื่องข้อความ เช่น `color`, `font-*`, `line-height`
property เรื่องกล่อง เช่น `margin`, `padding`, `border`, `background` จะไม่ถูกส่งต่อ
ถ้าอยากบังคับก็ใช้ค่า `inherit`, `initial` หรือ `unset` ได้

---

## 2. Box Model
```
┌──────────── margin ────────────┐
│  ┌───────── border ─────────┐  │
│  │  ┌────── padding ─────┐  │  │
│  │  │      content       │  │  │
│  │  └────────────────────┘  │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```
- `box-sizing: content-box` (ค่าเริ่มต้น): `width` คือความกว้างของ content อย่างเดียว ขนาดจริงจึงเท่ากับ width + padding + border
- `box-sizing: border-box`: `width` รวม padding และ border ไว้แล้ว เข้าใจง่ายกว่ามาก โปรเจกต์ส่วนใหญ่จึงเริ่มด้วย
  ```css
  *, *::before, *::after { box-sizing: border-box; }
  ```
- **Margin collapsing**: margin แนวตั้งของ block ที่อยู่ติดกันจะ **ไม่บวกกัน** แต่ใช้ค่าที่มากกว่า
  เช่น 30px กับ 20px จะได้ระยะห่าง 30px ไม่ใช่ 50px (เรื่องนี้ไม่เกิดใน flex และ grid)

## 3. Display และ Formatting Context
| display | พฤติกรรม |
|---|---|
| `block` | ขึ้นบรรทัดใหม่ กว้างเต็ม parent และกำหนด width/height ได้ |
| `inline` | ไหลไปกับข้อความ **กำหนด width/height ไม่ได้** และ margin/padding แนวตั้งไม่ดันบรรทัดอื่น |
| `inline-block` | ไหลไปกับข้อความ แต่กำหนดขนาดได้ |
| `flex` / `grid` | ตัวเองทำตัวเป็น block ส่วนลูกถูกจัดด้วย flex หรือ grid algorithm |
| `none` | ไม่อยู่ใน render tree เลย |

## 4. Position
| ค่า | อ้างอิงตำแหน่งจาก |
|---|---|
| `static` | ค่าเริ่มต้น ไม่สนใจ top/left |
| `relative` | ตำแหน่งเดิมของตัวเอง (และยังกินพื้นที่เดิมอยู่) |
| `absolute` | **บรรพบุรุษตัวแรกที่ position ไม่ใช่ static** ถ้าไม่มีเลยจะอ้างอิงจากหน้าจอ และหลุดออกจาก flow |
| `fixed` | viewport (หน้าจอ) |
| `sticky` | ทำตัวเหมือน relative จนกว่าจะ scroll ถึงค่าที่ตั้งไว้ แล้วจะติดอยู่ตรงนั้น |

รูปแบบที่ใช้บ่อยที่สุดคือ parent ตั้ง `position: relative` แล้วลูกตั้ง `position: absolute; top: 0; right: 0;`

**z-index และ stacking context**: `z-index` เปรียบเทียบได้เฉพาะ element ที่อยู่ใน stacking context เดียวกัน
property อย่าง `opacity < 1`, `transform` หรือ `position` + `z-index` จะสร้าง stacking context ใหม่
นี่คือสาเหตุที่บางครั้งตั้ง `z-index: 9999` แล้วก็ยังไม่ขึ้นมาอยู่ข้างบน

## 5. Flexbox: layout 1 มิติ (แถวหรือคอลัมน์)
```css
.container {
  display: flex;
  flex-direction: row;          /* แกนหลัก (main axis) ← → */
  justify-content: space-between; /* จัดตามแกนหลัก */
  align-items: center;          /* จัดตามแกนขวาง (cross axis) ↑ ↓ */
  gap: 16px;
  flex-wrap: wrap;
}
.item { flex: 1 1 200px; }     /* flex-grow flex-shrink flex-basis */
```
- `flex: 1` เป็นตัวย่อของ `1 1 0%` คือให้แบ่งพื้นที่ที่เหลือเท่าๆ กัน
- **กับดักที่เจอบ่อย**: flex item มีค่าเริ่มต้น `min-width: auto` จึงหดให้เล็กกว่า content ข้างในไม่ได้
  ถ้าเจอข้อความยาวดัน layout จนล้น ให้ใส่ `min-width: 0`
- `margin-left: auto` บน item จะดัน item นั้นไปชิดขวา

## 6. Grid: layout 2 มิติ
```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;      /* fr = ส่วนแบ่งของพื้นที่ที่เหลือ */
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 16px;
}
.header { grid-area: header; }

/* responsive โดยไม่ต้องใช้ media query */
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.big { grid-column: span 2; grid-row: span 2; }
```
วิธีเลือก: ถ้าเนื้อหากำหนดขนาด ให้ใช้ **Flex** ถ้า layout กำหนดขนาด ให้ใช้ **Grid**

## 7. หน่วย
- `px`: ค่าคงที่
- `rem`: เทียบกับ font-size ของ `<html>` ซึ่งปกติคือ 16px ควรใช้กับขนาดตัวอักษรและ spacing เพราะจะขยายตามเมื่อผู้ใช้ตั้งตัวอักษรใหญ่
- `em`: เทียบกับ font-size ของตัวเอง ระวังจะทบกันเมื่อซ้อนหลายชั้น
- `%`: เทียบกับ parent
- `vw` / `vh` / `dvh`: เทียบกับ viewport (`dvh` คิดแถบ address bar บนมือถือที่ยืดหดได้ด้วย)
- `clamp(min, ideal, max)`: เช่น `font-size: clamp(1.5rem, 4vw, 3rem)` ใช้ทำตัวอักษรที่ปรับขนาดตามหน้าจอ

## 8. Responsive Design (mobile-first)
```css
/* เขียนสไตล์สำหรับมือถือก่อน ไม่ต้องอยู่ใน media query */
.cards { display: grid; grid-template-columns: 1fr; }

/* แล้วค่อยเพิ่มสไตล์เมื่อหน้าจอกว้างขึ้น */
@media (min-width: 768px)  { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .cards { grid-template-columns: repeat(3, 1fr); } }
```
เหตุผลที่ควรเริ่มจากมือถือ: layout มือถือเรียบง่ายกว่า การเพิ่มสไตล์ทีหลังจึงง่ายกว่าการเขียนทับเพื่อลด
ในทางกลับกัน ถ้าใช้ `max-width` เป็นหลัก มักต้องเขียน override ซ้อนกันหลายชั้น

**CSS สมัยใหม่ที่ควรรู้จัก**
- `@container`: เปลี่ยนสไตล์ตามขนาดของ **กล่องแม่** แทนหน้าจอ ทำให้ component เอาไปวางที่ไหนก็ปรับตัวเองได้
- `:has()`: เลือก parent จากสิ่งที่อยู่ข้างใน เช่น `.card:has(img)`
- Native nesting: `.card { & .title { … } }` เขียนแบบ Sass ได้โดยไม่ต้องใช้ preprocessor
- Logical properties: `margin-inline`, `padding-block` รองรับภาษาที่เขียนจากขวาไปซ้ายด้วย

---

## 🧪 แบบฝึกหัด (ทุกข้อให้เขียนเฉพาะใน `<style id="student">` เท่านั้น)
1. [`ex1-box-specificity.html`](ex1-box-specificity.html): box-sizing, margin collapse, specificity, position
2. [`ex2-flexbox.html`](ex2-flexbox.html): navbar, การ์ด, จัดกลาง, footer ติดล่าง
3. [`ex3-grid.html`](ex3-grid.html): layout ด้วย grid-template-areas และ gallery แบบ auto-fill
4. [`ex4-responsive.html`](ex4-responsive.html): mobile-first (test จะโหลดหน้าเดียวกันใน iframe ขนาด 375, 800 และ 1200px)

test ข้อ CSS ตรวจด้วยการ **วัดตำแหน่งจริง** ผ่าน `getBoundingClientRect()` และ `getComputedStyle()`
ถ้าอยากรู้ว่าตัวเลขที่ test ได้เป็นเท่าไร ให้ลองพิมพ์คำสั่งเดียวกันใน Console ได้เลย

**เคล็ดลับ DevTools**: ใน Elements ถ้ากดที่ป้าย `flex` หรือ `grid` ข้าง element จะมีเส้นแสดงโครง layout ขึ้นมา
และกด `Ctrl+Shift+M` เพื่อจำลองหน้าจอมือถือ

## ✅ เช็กความเข้าใจ
- `.card .title` กับ `#app h2` อันไหนชนะ เพราะอะไร
- ทำไม `width: 100%` + `padding: 20px` ถึงทำให้กล่องล้นจอ และแก้อย่างไร
- `position: absolute` อ้างอิงตำแหน่งจากอะไร
- `justify-content` กับ `align-items` ต่างกันยังไง และถ้าเปลี่ยน `flex-direction: column` จะเกิดอะไรขึ้น
