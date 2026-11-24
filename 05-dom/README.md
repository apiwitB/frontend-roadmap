# บทที่ 05: DOM & Events

> หัวข้อใน roadmap: Learn DOM Manipulation · Event Bubbling · Event delegation

**DOM (Document Object Model)** คือ object ที่ browser สร้างขึ้นจาก HTML มีโครงสร้างเป็น tree
เวลา JS แก้ DOM browser ก็จะวาดหน้าจอใหม่ตาม framework ทุกตัวก็ทำงานบนกลไกเดียวกันนี้ แค่ซ่อนรายละเอียดไว้

---

## 1. หา element
```js
document.querySelector('.card');        // ตัวแรกที่เจอ ถ้าไม่เจอได้ null
document.querySelectorAll('li');        // NodeList (static) ใช้ forEach ได้ หรือแปลงเป็น array ด้วย [...nodeList]
el.closest('.card');                    // ไล่หาขึ้นไปทาง parent รวมตัวเองด้วย (ใช้บ่อยมากกับ event delegation)
el.matches('.active');                  // เช็กว่าตรงกับ selector ไหม
form.elements.email;                    // เข้าถึง input ใน form ตาม name
```

## 2. สร้าง แก้ไข และลบ
```js
const li = document.createElement('li');
li.textContent = userInput;             // ✅ ปลอดภัย เพราะข้อความถูกแสดงเป็นข้อความเสมอ
li.innerHTML = userInput;               // ⚠️ อันตราย ถ้า userInput มี <img onerror=...> โค้ดนั้นจะถูกรัน (XSS) ดูบทที่ 13
li.className = 'item';
li.classList.add('done'); li.classList.toggle('done'); li.classList.contains('done');
li.dataset.id = '42';                   // จะกลายเป็น <li data-id="42">
li.setAttribute('aria-checked', 'true');
li.hidden = true;

list.append(li);                        // ใส่ไว้ท้ายสุด
list.prepend(li);                       // ใส่ไว้หน้าสุด
li.before(other); li.after(other);
li.remove();
list.replaceChildren(...newItems);      // แทนลูกทั้งหมดในครั้งเดียว
```

**`<template>`**: เขียน HTML ต้นแบบไว้ แล้ว clone ไปใช้ ช่วยให้ไม่ต้องเขียน createElement ยาวๆ
```html
<template id="row"><li><span class="text"></span><button>ลบ</button></li></template>
```
```js
const node = document.getElementById('row').content.cloneNode(true);
node.querySelector('.text').textContent = 'Hello';
list.append(node);
```

## 3. Events และ 3 Phases
```
            window
              │  ① CAPTURE (ลงจากบนสุด)
           document                    ③ BUBBLE (ขึ้นกลับไปข้างบน)
              │                            ▲
            <ul>  ────────────────────────┤
              │                            │
            <li>  ← ② TARGET (ตัวที่ถูกคลิก)
```
```js
el.addEventListener('click', handler);                 // ทำงานตอน bubble (ค่าเริ่มต้น)
el.addEventListener('click', handler, { capture: true }); // ทำงานตอน capture
el.addEventListener('click', handler, { once: true });    // ทำงานครั้งเดียวแล้วถอดตัวเอง

function handler(e) {
  e.target;          // element ที่ถูกคลิกจริงๆ (ลึกที่สุด)
  e.currentTarget;   // element ที่ติด listener ตัวนี้ไว้
  e.preventDefault();  // ยกเลิกพฤติกรรมปกติ เช่น ไม่ให้ form submit หรือไม่ให้ link เปลี่ยนหน้า
  e.stopPropagation(); // ไม่ให้ event bubble ต่อขึ้นไป (ใช้เท่าที่จำเป็น เพราะ debug ยาก)
}
```
ลองเปิด [`playground-events.html`](playground-events.html) แล้วคลิกดูลำดับ event จริงๆ

## 4. Event Delegation
แทนที่จะติด listener ให้ `<li>` ทุกตัว ซึ่งถ้ามี 1,000 ตัวก็ต้องติด 1,000 ครั้ง และตัวที่เพิ่มมาทีหลังก็ต้องติดใหม่อีก
ให้ติด **ตัวเดียวที่ parent** แล้วดูจาก `e.target` ว่าคลิกโดนอะไร
```js
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button.delete');
  if (!btn) return;                     // คลิกโดนอย่างอื่น ไม่ต้องทำอะไร
  const id = btn.closest('li').dataset.id;
  removeTodo(id);
});
```
วิธีนี้ใช้ได้เพราะ event **bubble** ขึ้นมาถึง parent เสมอ

## 5. รูปแบบ State → Render
เวลาเขียนแอปที่มีข้อมูลเปลี่ยนตลอด อย่าใช้ DOM เป็นที่เก็บข้อมูล ให้ทำแบบนี้แทน
```js
let state = { todos: [], filter: 'all' };   // 1) ข้อมูลจริงทั้งหมดอยู่ที่นี่ที่เดียว (single source of truth)

function render() {                          // 2) สร้าง UI ใหม่จาก state ทุกครั้ง
  list.replaceChildren(...visibleTodos().map(todoToLi));
  count.textContent = `${remaining()} items left`;
}

function addTodo(text) {                     // 3) event → แก้ state → เรียก render()
  state.todos = [...state.todos, { id: crypto.randomUUID(), text, done: false }];
  save();
  render();
}
```
นี่คือแนวคิดเดียวกับ React (`UI = f(state)`) ในบทที่ 10 เราจะเขียน mini React ที่ทำให้ขั้น render เร็วขึ้นด้วย diff

## 6. Performance: Reflow และ Repaint
- การ **อ่าน** ค่า layout (`offsetHeight`, `getBoundingClientRect()`) หลังจาก **เขียน** style ทำให้ browser ต้องคำนวณ layout ใหม่ทันที
- ถ้าทำสลับไปมาในลูป จะเกิดสิ่งที่เรียกว่า **layout thrashing** ซึ่งช้ามาก ควรอ่านค่าทั้งหมดก่อน แล้วค่อยเขียนทีเดียว
- ถ้าจะเพิ่ม element จำนวนมาก ให้ใช้ `DocumentFragment` หรือ `replaceChildren(...)` เพื่อแก้ DOM ครั้งเดียว
- ถ้าทำ animation ให้ใช้ `transform` และ `opacity` เพราะไม่ทำให้เกิด layout ใหม่

## 7. localStorage
```js
localStorage.setItem('todos', JSON.stringify(todos));  // เก็บได้เฉพาะ string
const todos = JSON.parse(localStorage.getItem('todos') ?? '[]');
```
ข้อมูลจะเก็บแยกตาม origin ได้ประมาณ 5MB เป็นการทำงานแบบ synchronous และ **ห้ามเก็บ token หรือข้อมูลลับ** เพราะ JS ทุกตัวในหน้าอ่านได้

---

## 🧪 แบบฝึกหัด: Todo App
เปิด [`exercise.html`](exercise.html) แล้วแก้ [`exercise.js`](exercise.js)
1. เพิ่ม todo จาก form (ตัดช่องว่างหน้าหลัง และไม่รับข้อความว่าง)
2. render รายการ: แต่ละ `<li>` มี checkbox, ข้อความ และปุ่มลบ
3. ติ๊ก checkbox แล้วสลับสถานะ done (ใส่ class `done` ที่ `<li>`)
4. ลบรายการด้วย **event delegation** (ติด listener ที่ `<ul>` ตัวเดียว)
5. แสดงจำนวนที่ยังไม่เสร็จ: `"2 items left"` (ถ้ามีตัวเดียวใช้ `"1 item left"`)
6. filter: All / Active / Done
7. บันทึกลง localStorage แล้วรีเฟรชหน้าข้อมูลต้องยังอยู่
8. (bonus) ดับเบิลคลิกที่ข้อความเพื่อแก้ไข

## ✅ เช็กความเข้าใจ
- `e.target` กับ `e.currentTarget` ต่างกันยังไง
- ทำไม event delegation ถึงใช้กับ element ที่เพิ่มเข้ามาทีหลังได้
- ทำไมควรใช้ `textContent` แทน `innerHTML` เมื่อแสดงข้อความที่ผู้ใช้พิมพ์
