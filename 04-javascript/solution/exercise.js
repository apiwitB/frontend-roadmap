// เฉลยบทที่ 04   (เปิด solution/exercise.html เพื่อดูว่าผ่าน test ทุกข้อ)
const TODO = Symbol('TODO');

const quiz = {
  q1: 'object', // bug เก่าแก่ของ JS
  q2: '', // array ถูกแปลงเป็น string: '' + '' = ''
  q3: false, // floating point: 0.1 + 0.2 = 0.30000000000000004
  q4: 3, // - ใช้กับ string ไม่ได้ เลยแปลงเป็น number
  q5: '52', // + ถ้ามีฝั่งไหนเป็น string จะต่อ string แทน
  q6: [1, 10, 2], // sort() ค่าเริ่มต้นเรียงแบบ string ต้องใช้ sort((a, b) => a - b)
  q7: [1, NaN, NaN], // parseInt('1',0)=1, parseInt('2',1)=NaN, parseInt('3',2)=NaN
  q8: 'number',
  q9: 'default',
  q10: 0,
  q11: [3, 3, 3], // var มีตัวเดียวทั้ง loop ถ้าเปลี่ยนเป็น let จะได้ [0,1,2]
  q12: 2, // a และ b ชี้ไปที่ object ตัวเดียวกัน
};

function typeOf(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}

function makeCounter(start = 0) {
  let count = start; // private ผ่าน closure
  return {
    inc: () => ++count,
    dec: () => --count,
    reset: () => { count = start; },
    get value() { return count; }, // มีแต่ getter ไม่มี setter จึงกำหนดค่าใหม่ไม่ได้
  };
}

function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    // ต้องใช้ function ธรรมดา เพื่อให้รับ this จากคนที่เรียกได้ (arrow function ไม่มี this ของตัวเอง)
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    // ยังได้ args ไม่ครบ: คืนฟังก์ชันใหม่ที่จำ args ชุดนี้ไว้ (เป็น closure และไม่มี state ร่วมกัน)
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] ||= []).push(item);
    return groups;
  }, {});
}

function deepClone(value) {
  if (value === null || typeof value !== 'object') return value; // primitive
  if (value instanceof Date) return new Date(value.getTime());
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = deepClone(v);
  return out;
}

function myBind(fn, thisArg, ...presetArgs) {
  return function (...args) {
    return fn.apply(thisArg, [...presetArgs, ...args]);
  };
}

function pipe(...fns) {
  return (input) => fns.reduce((acc, fn) => fn(acc), input);
}

class EventEmitter {
  #handlers = new Map(); // # = private field

  on(event, handler) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, []);
    this.#handlers.get(event).push(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    const list = this.#handlers.get(event);
    if (!list) return;
    const i = list.indexOf(handler);
    if (i !== -1) list.splice(i, 1);
  }
  emit(event, ...args) {
    // copy array ก่อน เพราะ handler แบบ once จะลบตัวเองออกระหว่างที่กำลังวนลูปอยู่
    const list = [...(this.#handlers.get(event) || [])];
    list.forEach((h) => h(...args));
    return list.length;
  }
  once(event, handler) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    return this.on(event, wrapper);
  }
}

class Shape {
  static count = 0;
  constructor(name) {
    this.name = name;
    Shape.count++; // ใช้ Shape.count ไม่ใช่ this.constructor.count เพื่อให้นับรวม subclass ด้วย
  }
  area() { return 0; }
  toString() { return `${this.name} (area: ${this.area()})`; }
}
class Rectangle extends Shape {
  constructor(w, h, name = 'Rectangle') {
    super(name); // ใน subclass ต้องเรียก super() ก่อนใช้ this
    this.w = w;
    this.h = h;
  }
  area() { return this.w * this.h; }
}
class Square extends Rectangle {
  constructor(size) {
    super(size, size, 'Square');
  }
}
