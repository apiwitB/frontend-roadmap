# บทที่ 04: JavaScript พื้นฐานแบบลึก

> หัวข้อใน roadmap: Syntax and Basic Constructs · Learn DOM Manipulation · Learn Fetch API / Ajax · ES6+ and modular JavaScript · Understand the concepts Hoisting, Event Bubbling, Scope, Prototype, Shadow DOM, strict

บทนี้เน้นเรื่องที่คนเขียน JS มาเป็นปีแล้วก็ยังพลาดได้ ถ้าเข้าใจบทนี้ดี การอ่านโค้ดของ framework และ library จะง่ายขึ้นมาก

---

## 1. Types และ Coercion
JS มี **primitive** 7 ชนิด ได้แก่ `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`
ส่วนอย่างอื่นทั้งหมดเป็น **object** รวมถึง array, function, Date และ RegExp

```js
typeof null          // 'object'  ← bug เก่าตั้งแต่ปี 1995 ที่แก้ไม่ได้แล้ว
typeof []            // 'object'  → ถ้าจะเช็กว่าเป็น array ให้ใช้ Array.isArray([])
typeof function(){}  // 'function'
Object.prototype.toString.call(new Date()) // '[object Date]' ← วิธีเช็ก type ที่แม่นที่สุด
```

**Primitive ถูก copy ตามค่า ส่วน object ถูก copy ตาม reference**
```js
let a = { n: 1 };
let b = a;       // b ชี้ไปที่ object ตัวเดียวกับ a
b.n = 2;
a.n              // 2
```

**`==` จะแปลง type ก่อนเปรียบเทียบ ส่วน `===` ไม่แปลง** จึงควรใช้ `===` เสมอ
ยกเว้นกรณี `x == null` ซึ่งเป็นวิธีเช็กทั้ง `null` และ `undefined` ในครั้งเดียว
```js
'5' == 5     // true
0 == ''      // true
null == undefined // true
NaN === NaN  // false → ใช้ Number.isNaN(x) หรือ Object.is(x, NaN) แทน
```

**Falsy** มีแค่ 8 ค่า: `false, 0, -0, 0n, '', null, undefined, NaN` ค่าอื่นนอกจากนี้เป็น truthy ทั้งหมด รวมถึง `[]` และ `{}`

**`??` กับ `||`**
```js
0 || 10   // 10  (|| ถือว่า 0 เป็นค่า falsy)
0 ?? 10   // 0   (?? ใช้ค่าสำรองเฉพาะเมื่อเป็น null หรือ undefined)
user?.address?.city   // optional chaining: ถ้าตรงไหนเป็น null/undefined จะได้ undefined แทนการ error
```

## 2. Scope, Hoisting และ TDZ
```js
console.log(x); // undefined   ← var ถูก hoist และมีค่าเริ่มต้นเป็น undefined
var x = 1;

console.log(y); // ReferenceError ← let/const ก็ถูก hoist เหมือนกัน แต่อยู่ใน "Temporal Dead Zone" จนถึงบรรทัดที่ประกาศ
let y = 2;

hello();        // ใช้ได้ เพราะ function declaration ถูก hoist ไปทั้งตัว
function hello() {}
```
- `var` มี scope ระดับ **function** ส่วน `let` และ `const` มี scope ระดับ **block** (`{ }`)
- `const` ห้ามกำหนดค่าใหม่ แต่ **ไม่ได้ทำให้ object แก้ไขไม่ได้** (`const a = []; a.push(1)` ยังทำได้)

ตัวอย่างคลาสสิกที่ใช้ถามในสัมภาษณ์:
```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2  (let สร้าง i ใหม่ทุกรอบ)
```

## 3. Closure
> **Closure** คือฟังก์ชันที่ยังจำตัวแปรใน scope ที่มันถูกสร้างขึ้นได้ แม้ scope นั้นจะทำงานจบไปแล้ว

```js
function makeCounter() {
  let count = 0;               // ตัวแปรนี้เป็น "private" โค้ดข้างนอกเข้าถึงไม่ได้
  return () => ++count;        // ฟังก์ชันนี้ "ปิดล้อม" (close over) ตัวแปร count ไว้
}
const next = makeCounter();
next(); // 1
next(); // 2
```
closure ถูกใช้อยู่ทั่วไป เช่น ใน event handler, React hooks (`useState`), debounce, memoize และ module pattern

## 4. `this` มีกฎ 4 ข้อ (ดูว่าฟังก์ชัน **ถูกเรียกอย่างไร** ไม่ใช่ดูว่าเขียนไว้ที่ไหน)
| วิธีเรียก | `this` คือ |
|---|---|
| `obj.method()` | `obj` |
| `fn()` | `undefined` ใน strict mode หรือ module (ถ้าไม่ใช่ strict จะเป็น `window`) |
| `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)` | `x` |
| `new Fn()` | object ใหม่ที่กำลังถูกสร้าง |
| **arrow function** | ไม่มี `this` ของตัวเอง ใช้ `this` ของ scope ที่ครอบอยู่ |

```js
const user = {
  name: 'Ann',
  hi() { return this.name; },
  later() { setTimeout(function () { console.log(this.name); }); }, // ❌ this ไม่ใช่ user แล้ว
  later2() { setTimeout(() => console.log(this.name)); },           // ✅ arrow ใช้ this ของ later2
};
const hi = user.hi;
hi(); // ❌ this เป็น undefined เพราะเรียกแบบ fn() ไม่ใช่ obj.method()
```

## 5. Prototype และ Class
ทุก object มี link ซ่อนอยู่ไปยัง object อีกตัว เรียกว่า **prototype** (`Object.getPrototypeOf(obj)`)
ถ้าหา property ในตัวเองไม่เจอ JS จะไปหาต่อใน prototype และไล่ต่อขึ้นไปเรื่อยๆ จนสุด chain ซึ่งก็คือ `null`

```js
class Animal {
  constructor(name) { this.name = name; }   // property นี้อยู่บน instance แต่ละตัว
  speak() { return `${this.name} makes a sound`; } // method นี้อยู่บน Animal.prototype (ทุก instance ใช้ร่วมกัน)
}
class Dog extends Animal {
  speak() { return `${super.speak()} — woof`; }
}
const d = new Dog('Rex');
// d → Dog.prototype → Animal.prototype → Object.prototype → null
```
`class` เป็นแค่ไวยากรณ์ที่เขียนง่ายขึ้น (syntactic sugar) ข้างในยังทำงานด้วย prototype เหมือนเดิม
ลองพิมพ์ `d` ใน Console แล้วกางดู `[[Prototype]]` จะเห็น chain นี้

## 6. Functions เป็นค่า: Higher-order functions
ฟังก์ชันเก็บใส่ตัวแปรได้ ส่งเป็น argument ได้ และ return ออกมาได้
```js
const nums = [1, 2, 3, 4];
nums.map((n) => n * 2);                 // [2, 4, 6, 8]
nums.filter((n) => n % 2 === 0);        // [2, 4]
nums.reduce((sum, n) => sum + n, 0);    // 10
nums.find((n) => n > 2);                // 3
nums.some((n) => n > 3);                // true
```

## 7. ES6+ ที่ใช้ทุกวัน
```js
const { name, age = 18, ...rest } = user;      // destructuring + ค่า default + rest
const [first, , third] = arr;
const copy = { ...obj, updated: true };        // spread (เป็น shallow copy)
const merged = [...a, ...b];
const s = `สวัสดี ${name}`;                     // template literal
const sum = (...nums) => nums.reduce((a, b) => a + b, 0); // rest parameters
structuredClone(obj);                           // deep copy ที่มีมาในตัว
Object.entries({ a: 1 });                       // [['a', 1]]
arr.at(-1);                                     // ตัวสุดท้ายของ array
Object.groupBy(items, (x) => x.type);           // จัดกลุ่ม (ES2024)
```

### Immutability (สำคัญมากเมื่อใช้ React)
```js
// ❌ แก้ array เดิม (mutate)
state.todos.push(newTodo);
// ✅ สร้าง array ใหม่
const next = { ...state, todos: [...state.todos, newTodo] };
```

---

## 🧪 แบบฝึกหัด
เปิด [`exercise.html`](exercise.html) ในเบราว์เซอร์ แล้วแก้ [`exercise.js`](exercise.js)
ส่วน test อยู่ที่ [`tests.js`](tests.js) ซึ่งเปิดอ่านได้ว่าแต่ละข้อทดสอบอะไรบ้าง

**ข้อ 0 (quiz)** ให้ **ทายคำตอบก่อน** แล้วค่อยรันดูผล ข้อนี้ฝึกให้เดาพฤติกรรมของ JS ได้แม่นขึ้น

เคล็ดลับ: ใช้ `console.log` หรือใส่ `debugger;` ในโค้ด แล้วเปิด DevTools จะหยุดตรงบรรทัดนั้นให้ดูค่าตัวแปรทีละขั้นได้

## ✅ เช็กความเข้าใจ
- ถ้าดึง method ออกมาจาก object แล้วเรียกเดี่ยวๆ ทำไม `this` ถึงหายไป และแก้ได้กี่วิธี
- closure ทำให้เกิด memory leak ได้อย่างไร
- `{...obj}` กับ `structuredClone(obj)` ต่างกันยังไง
