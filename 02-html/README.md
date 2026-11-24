# บทที่ 02: HTML

> หัวข้อใน roadmap: Learn the basics · Writing Semantic HTML · Forms and Validations · Conventions and Best Practices · Accessibility · SEO Basics

หลายคนมองว่า HTML ง่าย แต่หน้าที่จริงของ HTML คือบอก **ความหมาย** ของเนื้อหา ไม่ใช่หน้าตา
ความหมายนี้มีผู้ใช้หลายกลุ่ม ได้แก่ browser, screen reader ของผู้พิการทางสายตา, Google และ extension ต่างๆ

---

## 1. โครงเอกสารที่ถูกต้อง

```html
<!doctype html>                 <!-- ถ้าไม่ใส่ browser จะเข้า "quirks mode" แล้ว render แบบปี 1999 -->
<html lang="th">                <!-- บอกภาษา ให้ screen reader อ่านออกเสียงถูก -->
<head>
  <meta charset="utf-8">        <!-- ถ้าไม่ใส่ ภาษาไทยอาจกลายเป็นตัวอ่านไม่ออก -->
  <meta name="viewport" content="width=device-width, initial-scale=1">  <!-- ถ้าไม่ใส่ มือถือจะซูมออกเป็นจอ 980px -->
  <title>ชื่อหน้า | ชื่อเว็บ</title>     <!-- แสดงบนแท็บ และเป็นหัวข้อในผลค้นหา Google -->
  <meta name="description" content="คำอธิบายสั้นๆ ที่จะไปโผล่ใน Google">
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>  <!-- defer = โหลดคู่กันไป แต่รันหลัง parse HTML เสร็จ -->
</head>
<body>…</body>
</html>
```

### `<script>`, `defer` และ `async`
```
ปกติ:   HTML ──parse──■ หยุด ■─download─run─■──parse ต่อ──
defer:  HTML ──parse───────────────────────────■ run (เรียงตามลำดับ)
          └─download──┘
async:  HTML ──parse──────■ run ■──parse ต่อ──   (รันทันทีที่โหลดเสร็จ ลำดับไม่แน่นอน)
          └─download──┘
```
`type="module"` จะทำงานแบบ `defer` ให้เองอัตโนมัติ

---

## 2. Semantic HTML
`<div>` และ `<span>` ไม่มีความหมายในตัว ส่วน tag ต่อไปนี้มีความหมายชัดเจน

| Tag | ความหมาย |
|---|---|
| `<header>` | ส่วนหัวของหน้า หรือของ section/article |
| `<nav>` | กลุ่มลิงก์นำทางหลัก |
| `<main>` | เนื้อหาหลักของหน้า **มีได้แค่ 1 อัน** |
| `<article>` | เนื้อหาที่ตัดออกไปอยู่เดี่ยวๆ ได้ เช่น บทความ โพสต์ หรือการ์ดสินค้า |
| `<section>` | กลุ่มเนื้อหาที่มีหัวข้อของตัวเอง |
| `<aside>` | เนื้อหาเสริม เช่น sidebar หรือกล่องโฆษณา |
| `<footer>` | ส่วนท้าย |
| `<figure>` + `<figcaption>` | รูปภาพหรือ diagram พร้อมคำบรรยาย |
| `<time datetime="2026-11-24">` | วันเวลาที่เครื่องอ่านเข้าใจได้ |
| `<button>` | สิ่งที่กดแล้ว **ทำอะไรบางอย่าง** |
| `<a href>` | สิ่งที่กดแล้ว **ไปที่อื่น** |

### ทำไม semantic ถึงสำคัญ: กรณี `<div onclick>`
```html
<div class="btn" onclick="save()">บันทึก</div>   <!-- ❌ -->
<button type="button" onclick="save()">บันทึก</button>   <!-- ✅ -->
```
`<button>` มีความสามารถเหล่านี้ติดมาฟรี ส่วน `<div>` ไม่มีเลย
- กด Tab ไปโฟกัสได้ และกด Enter หรือ Space เพื่อกดปุ่มได้
- screen reader อ่านว่า "บันทึก, ปุ่ม"
- อยู่ใน form แล้ว submit ได้, ใส่ `disabled` ได้

### หัวข้อ `<h1>`–`<h6>` คือสารบัญของหน้า
- ใช้ `<h1>` หน้าละ 1 อัน และไม่ควรข้ามระดับ (h2 → h4)
- เลือกระดับตามโครงสร้างของเนื้อหา ไม่ใช่ตามขนาดตัวอักษร ขนาดให้ไปกำหนดด้วย CSS
- ผู้ใช้ screen reader มักกดข้ามไปทีละหัวข้อ เพื่อดูภาพรวมของหน้าก่อน

---

## 3. Accessibility (a11y)
- **รูปทุกรูปต้องมี `alt`**: รูปที่มีความหมายให้เขียนอธิบาย เช่น `alt="กราฟยอดขายเพิ่มขึ้น 20%"`
  ส่วนรูปตกแต่งให้ใส่ `alt=""` (ว่าง) เพื่อให้ screen reader ข้ามไป
- **input ทุกตัวต้องมี `<label>`**: `<label for="email">` คู่กับ `<input id="email">`
  นอกจากช่วย screen reader แล้ว คลิกที่ label ก็จะโฟกัส input ให้ด้วย
- **กฎข้อแรกของ ARIA คืออย่าใช้ ARIA** ถ้ามี HTML tag ที่ทำหน้าที่นั้นได้อยู่แล้ว ให้ใช้ tag นั้น
  ใช้ ARIA เฉพาะกรณีที่ HTML ไม่มีให้ เช่น `aria-live` สำหรับประกาศข้อความที่เปลี่ยนแปลง หรือ `aria-expanded` ของเมนูที่เปิดปิดได้
- **ลองใช้เว็บโดยไม่ใช้เมาส์** กดแค่ Tab, Shift+Tab, Enter และ Space ดูว่าทำงานได้ครบไหม
- ใน DevTools ไปที่ Elements → แท็บ *Accessibility* เพื่อดู accessibility tree ซึ่งคือสิ่งที่ screen reader "เห็น"

---

## 4. Forms และ Validation ที่มีมาในตัว
HTML ตรวจข้อมูลได้เองโดยไม่ต้องเขียน JavaScript

```html
<form action="/register" method="post">
  <label for="email">อีเมล</label>
  <input id="email" name="email" type="email" required autocomplete="email">

  <label for="pw">รหัสผ่าน</label>
  <input id="pw" name="password" type="password" minlength="8" required autocomplete="new-password">

  <fieldset>
    <legend>แพ็กเกจ</legend>              <!-- กลุ่ม radio ต้องมี fieldset + legend -->
    <label><input type="radio" name="plan" value="free" checked> Free</label>
    <label><input type="radio" name="plan" value="pro"> Pro</label>
  </fieldset>

  <button type="submit">สมัคร</button>
</form>
```

| Attribute | ทำอะไร |
|---|---|
| `type="email/url/number/tel/date"` | ตรวจรูปแบบ และมือถือจะแสดง keyboard ที่เหมาะกับประเภทข้อมูล |
| `required` | ห้ามว่าง |
| `minlength` / `maxlength` | จำนวนตัวอักษรต่ำสุด/สูงสุด |
| `min` / `max` / `step` | สำหรับตัวเลขและวันที่ |
| `pattern="[0-9]{10}"` | ตรวจด้วย regex |
| `name` | **ชื่อที่ใช้ตอนส่งข้อมูลไป server** ถ้าไม่มี `name` ข้อมูลช่องนั้นจะไม่ถูกส่ง |
| `autocomplete` | ช่วยให้ browser และ password manager เติมข้อมูลให้ถูกช่อง |

ใช้ JS ตรวจสถานะได้: `form.checkValidity()`, `input.validity.valueMissing`, `input.validationMessage`
และใช้ CSS จัดสไตล์ได้: `input:user-invalid { border-color: red; }`
(`:user-invalid` จะแสดงผลหลังจากผู้ใช้แตะช่องนั้นแล้วเท่านั้น ต่างจาก `:invalid` ที่แดงตั้งแต่เปิดหน้า)

> ⚠️ validation ฝั่ง client มีไว้เพื่อ UX เท่านั้น server **ต้องตรวจซ้ำเสมอ** เพราะใครก็ส่ง request ตรงไปที่ server ได้

---

## 5. SEO พื้นฐาน
- `<title>` และ `<meta name="description">` ที่ไม่ซ้ำกันในแต่ละหน้า
- ใช้ heading เป็นลำดับชั้น, ใช้ semantic tag, ใส่ alt ให้รูป
- ใช้ URL ที่อ่านเข้าใจได้ (`/blog/learn-css-grid` ดีกว่า `/p?id=123`)
- ใส่ Open Graph (`<meta property="og:title">`, `og:image`) เพื่อให้แชร์ลิงก์ใน Facebook หรือ LINE แล้วมีรูปขึ้น
- ถ้าเนื้อหาอยู่ใน HTML ตั้งแต่แรก จะดีกว่าการให้ JS สร้างทีหลัง เรื่องนี้เกี่ยวกับ SSR ในบทที่ 10

---

## 🧪 แบบฝึกหัด
1. [`ex1-semantic.html`](ex1-semantic.html): แปลง "div soup" ให้เป็น semantic HTML
2. [`ex2-form.html`](ex2-form.html): สร้างฟอร์มสมัครสมาชิกที่ accessible และ validate ได้เองโดยไม่ใช้ JS

ทั้งสองข้อแก้ไฟล์ใน VS Code แล้วรีเฟรชหน้าเว็บ ผล test จะแสดงอยู่มุมขวาล่าง

**ลองเพิ่มเติม**: หลังทำ ex2 เสร็จ ให้กด Tab ไล่ทั้งฟอร์มโดยไม่ใช้เมาส์ แล้วเปิด Lighthouse ใน DevTools
→ เลือก Accessibility → *Analyze page load* แล้วดูคะแนน

## ✅ เช็กความเข้าใจ
- `<section>` กับ `<article>` ต่างกันยังไง
- ทำไม input ที่ไม่มี `name` ถึงไม่ถูกส่งไป server
- รูปโลโก้ที่อยู่ข้างข้อความชื่อบริษัท ควรใส่ `alt` ว่าอะไร (ลองคิดว่า screen reader จะอ่านซ้ำหรือเปล่า)
