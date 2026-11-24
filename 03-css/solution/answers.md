# เฉลยบทที่ 03 (เอาไปวางใน `<style id="student">` ของแต่ละไฟล์)

## ex1-box-specificity
```css
/* ข้อ 1: width รวม padding + border เข้าไปด้วย */
.card { box-sizing: border-box; }

/* ข้อ 2: .content p = (0,1,1)
   .content .note = (0,2,0) ชนะ เพราะหลัก class มากกว่า
   ถ้าใช้ p.note = (0,1,1) จะเสมอกัน แล้วกฎที่เขียนทีหลังชนะ ซึ่งก็ใช้ได้ แต่พึ่งลำดับในไฟล์ ไม่ค่อยดี */
.content .note { color: #dc2626; }

/* ข้อ 3: inline ไม่รับ width ต้องเปลี่ยนเป็น inline-block */
.tag { display: inline-block; width: 80px; }

/* ข้อ 5 */
.product { position: relative; }
.badge { position: absolute; top: 0; right: 0; }
```
ข้อ 4: `window.answerGap = 30;` เพราะ margin แนวตั้งของ block ที่อยู่ติดกัน **collapse** และใช้ค่าที่มากกว่า (max(30, 20))
ถ้าเปลี่ยน parent ให้เป็น `display: flex; flex-direction: column` ระยะห่างจะกลายเป็น 50px เพราะ flex ไม่มี margin collapse

## ex2-flexbox
```css
.navbar { display: flex; justify-content: space-between; align-items: center; }
.links { display: flex; gap: 16px; }

.cards { display: flex; gap: 16px; }
.card { flex: 1 1 0; min-width: 0; }
/* ทำไมต้องเป็น flex-basis 0 แทน auto?
   - basis auto: เริ่มจากความกว้างของ content ก่อน แล้วค่อยแบ่งพื้นที่ที่เหลือ การ์ดที่ข้อความยาวจึงกว้างกว่าใบอื่น
   - basis 0: ทุกใบเริ่มจาก 0 แล้วแบ่งพื้นที่ทั้งหมดเท่ากัน
   min-width: 0 ช่วยให้หดเล็กกว่า content ได้ ไม่งั้นค่าเริ่มต้นคือ min-width: auto */

.stage { display: flex; justify-content: center; align-items: center; }
/* หรือเขียนสั้นๆ:  .stage { display: grid; place-items: center; } */

.page { display: flex; flex-direction: column; }
.page-main { flex: 1; }
```

## ex3-grid
```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  gap: 16px;
}
.l-header  { grid-area: header; }
.l-sidebar { grid-area: sidebar; }
.l-main    { grid-area: main; }
.l-footer  { grid-area: footer; }

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
/* auto-fill = ใส่คอลัมน์ให้ได้มากที่สุดที่ยังกว้าง >= 150px แล้ว 1fr จะยืดแต่ละคอลัมน์ให้เต็มแถว
   640px: 4×150 + 3×12 = 636 ≤ 640 จึงได้ 4 คอลัมน์ */
.featured { grid-column: span 2; grid-row: span 2; }
```

## ex4-responsive
```css
/* ─── มือถือ (ค่าเริ่มต้น) ─── */
.cards { display: grid; grid-template-columns: 1fr; gap: 16px; }
.nav-links { display: none; }
.hero img { max-width: 100%; height: auto; }  /* height:auto รักษาสัดส่วนของรูป */
.hero h1 { font-size: clamp(1.5rem, 1rem + 3vw, 3rem); }

/* ─── แท็บเล็ต ─── */
@media (min-width: 768px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: flex; }
  .menu-btn { display: none; }
}

/* ─── เดสก์ท็อป ─── */
@media (min-width: 1024px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
}
```
