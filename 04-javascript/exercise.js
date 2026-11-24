// ═══════════════════════════════════════════════════════════════
//  บทที่ 04: JavaScript Core
//  แก้ไฟล์นี้ แล้วรีเฟรช exercise.html เพื่อดูผล test
//  (แต่ละฟังก์ชันมี throw new Error('TODO') อยู่ ให้ลบออกแล้วเขียนโค้ดจริงแทน)
// ═══════════════════════════════════════════════════════════════

const TODO = Symbol('TODO');

// ───────────────────────────────────────────────────────────────
// ข้อ 0: QUIZ ให้ทายผลลัพธ์ก่อนรัน (แทน TODO ด้วยค่าที่คิดว่าถูก)
// test จะรันโค้ดจริงแล้วเทียบกับคำตอบ ห้ามแอบเปิด console ก่อนทาย
// ───────────────────────────────────────────────────────────────
const quiz = {
  q1: TODO, // typeof null
  q2: TODO, // [] + []
  q3: TODO, // 0.1 + 0.2 === 0.3
  q4: TODO, // '5' - 2
  q5: TODO, // '5' + 2
  q6: TODO, // [10, 1, 2].sort()
  q7: TODO, // [1, 2, 3].map(parseInt)        (คำใบ้: parseInt(string, radix) และ map ส่ง (value, index) เข้าไป)
  q8: TODO, // typeof NaN
  q9: TODO, // 0 || 'default'
  q10: TODO, // 0 ?? 'default'
  q11: TODO, // ผลลัพธ์ของ:  const out = []; for (var i = 0; i < 3; i++) out.push(() => i); out.map(f => f())
  q12: TODO, // ผลลัพธ์ของ:  const a = { n: 1 }; const b = a; b.n = 2; a.n
};

// ───────────────────────────────────────────────────────────────
// ข้อ 1: typeOf(value) คืนชนิดที่ "แม่นยำ" เป็นตัวพิมพ์เล็ก
//   typeOf(null) → 'null'      typeOf([]) → 'array'     typeOf(new Date()) → 'date'
//   typeOf(/a/) → 'regexp'     typeOf(1) → 'number'     typeOf({}) → 'object'
//   คำใบ้: Object.prototype.toString.call(x) คืน '[object Xxx]'
// ───────────────────────────────────────────────────────────────
function typeOf(value) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 2: sum(...nums) บวกเลขกี่ตัวก็ได้   sum() → 0,  sum(1, 2, 3) → 6
//   ใช้ rest parameters + reduce
// ───────────────────────────────────────────────────────────────
function sum(...nums) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 3: makeCounter(start = 0) คืน object ที่มี
//   inc()  เพิ่ม 1 แล้วคืนค่าใหม่
//   dec()  ลด 1 แล้วคืนค่าใหม่
//   reset() กลับไปเป็นค่า start
//   value  เป็น getter (get value() { ... }) ห้ามมีใครแก้ count ตรงๆ ได้
//   counter แต่ละตัวต้องแยกกัน (นี่คือ closure!)
// ───────────────────────────────────────────────────────────────
function makeCounter(start = 0) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 4: once(fn) คืนฟังก์ชันที่เรียก fn ได้ครั้งเดียว
//   ครั้งต่อๆ ไปคืนผลลัพธ์ของครั้งแรกโดยไม่เรียก fn อีก
//   ต้องส่ง arguments และ this ต่อให้ fn ด้วย
// ───────────────────────────────────────────────────────────────
function once(fn) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 5: memoize(fn) จำผลลัพธ์ตาม arguments
//   ถ้าเรียกซ้ำด้วย args เดิม ห้ามเรียก fn อีก ให้คืนค่าที่จำไว้
//   คำใบ้: ใช้ Map และ key = JSON.stringify(args)
// ───────────────────────────────────────────────────────────────
function memoize(fn) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 6: curry(fn)
//   const add3 = (a, b, c) => a + b + c;
//   curry(add3)(1)(2)(3) === 6
//   curry(add3)(1, 2)(3) === 6
//   curry(add3)(1)(2, 3) === 6
//   คำใบ้: fn.length คือจำนวน parameter ที่ฟังก์ชันประกาศไว้
// ───────────────────────────────────────────────────────────────
function curry(fn) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 7: groupBy(array, keyFn) → object   (ห้ามใช้ Object.groupBy นะ!)
//   groupBy([1,2,3,4], n => n % 2 ? 'odd' : 'even')  →  { odd: [1,3], even: [2,4] }
// ───────────────────────────────────────────────────────────────
function groupBy(array, keyFn) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 8: deepClone(value) copy แบบลึก (ห้ามใช้ structuredClone และ JSON)
//   ต้องรองรับ primitive, array, plain object (ซ้อนกันกี่ชั้นก็ได้) และ Date
//   คำใบ้: recursion
// ───────────────────────────────────────────────────────────────
function deepClone(value) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 9: myBind(fn, thisArg, ...presetArgs) ทำงานเหมือน fn.bind (ห้ามใช้ .bind)
//   คำใบ้: fn.apply(thisArg, args) หรือ fn.call(thisArg, ...args)
// ───────────────────────────────────────────────────────────────
function myBind(fn, thisArg, ...presetArgs) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 10: pipe(...fns) ต่อฟังก์ชันจากซ้ายไปขวา
//   pipe(x => x + 1, x => x * 2)(3) === 8
// ───────────────────────────────────────────────────────────────
function pipe(...fns) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 11: class EventEmitter (pattern นี้อยู่เบื้องหลัง DOM events, Node.js, Redux และอื่นๆ)
//   on(event, handler)   ลงทะเบียน และคืนฟังก์ชันสำหรับยกเลิก (unsubscribe)
//   off(event, handler)  ยกเลิก
//   emit(event, ...args) เรียกทุก handler ตามลำดับที่ลงทะเบียน แล้วคืนจำนวน handler ที่ถูกเรียก
//   once(event, handler) ทำงานครั้งเดียวแล้วยกเลิกตัวเอง
// ───────────────────────────────────────────────────────────────
class EventEmitter {
  on(event, handler) {
    throw new Error('TODO');
  }
  off(event, handler) {
    throw new Error('TODO');
  }
  emit(event, ...args) {
    throw new Error('TODO');
  }
  once(event, handler) {
    throw new Error('TODO');
  }
}

// ───────────────────────────────────────────────────────────────
// ข้อ 12: Class + inheritance
//   class Shape      constructor(name), area() คืน 0, toString() → `${name} (area: ${area()})`
//                    static count: นับว่าสร้าง Shape (รวม subclass) ไปแล้วกี่ตัว
//   class Rectangle extends Shape   constructor(w, h) → name 'Rectangle', area = w*h
//   class Square extends Rectangle  constructor(size) → name 'Square'
//   (ผลที่ได้: new Square(3).toString() === 'Square (area: 9)')
// ───────────────────────────────────────────────────────────────
class Shape {
  // TODO
}
class Rectangle extends Shape {
  // TODO
}
class Square extends Rectangle {
  // TODO
}
