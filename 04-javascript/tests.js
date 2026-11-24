// test ของบทที่ 04 (ไม่ต้องแก้ แต่เปิดอ่านได้)

// ── ข้อ 0: quiz ──
const quizCode = {
  q1: () => typeof null,
  q2: () => [] + [],
  q3: () => 0.1 + 0.2 === 0.3,
  q4: () => '5' - 2,
  q5: () => '5' + 2,
  q6: () => [10, 1, 2].sort(),
  q7: () => [1, 2, 3].map(parseInt),
  q8: () => typeof NaN,
  q9: () => 0 || 'default',
  q10: () => 0 ?? 'default',
  q11: () => { const out = []; for (var i = 0; i < 3; i++) out.push(() => i); return out.map((f) => f()); },
  q12: () => { const a = { n: 1 }; const b = a; b.n = 2; return a.n; },
};
Object.keys(quizCode).forEach((k) => {
  test(`ข้อ 0 quiz ${k}`, () => {
    if (quiz[k] === TODO) throw new Error('TODO');
    expect(quiz[k]).toEqual(quizCode[k]());
  });
});

// ── ข้อ 1 ──
test('ข้อ 1: typeOf', () => {
  expect(typeOf(null)).toBe('null');
  expect(typeOf(undefined)).toBe('undefined');
  expect(typeOf([])).toBe('array');
  expect(typeOf({})).toBe('object');
  expect(typeOf(new Date())).toBe('date');
  expect(typeOf(/x/)).toBe('regexp');
  expect(typeOf(42)).toBe('number');
  expect(typeOf('hi')).toBe('string');
  expect(typeOf(() => {})).toBe('function');
});

// ── ข้อ 2 ──
test('ข้อ 2: sum', () => {
  expect(sum()).toBe(0);
  expect(sum(5)).toBe(5);
  expect(sum(1, 2, 3, 4)).toBe(10);
});

// ── ข้อ 3 ──
test('ข้อ 3: makeCounter inc/dec/reset/value', () => {
  const c = makeCounter(10);
  expect(c.inc()).toBe(11);
  expect(c.inc()).toBe(12);
  expect(c.dec()).toBe(11);
  expect(c.value).toBe(11);
  c.reset();
  expect(c.value).toBe(10);
});
test('ข้อ 3: counter แต่ละตัวแยกกัน และ value แก้ตรงๆ ไม่ได้', () => {
  const a = makeCounter(), b = makeCounter();
  a.inc(); a.inc();
  expect([a.value, b.value]).toEqual([2, 0]);
  try { a.value = 999; } catch {}
  expect(a.value).toBe(2);
});

// ── ข้อ 4 ──
test('ข้อ 4: once เรียก fn ครั้งเดียว', () => {
  let calls = 0;
  const init = once((x) => { calls++; return x * 2; });
  expect(init(5)).toBe(10);
  expect(init(100)).toBe(10);
  expect(calls).toBe(1);
});
test('ข้อ 4: once ส่ง this ต่อ', () => {
  const obj = { n: 7, get: once(function () { return this.n; }) };
  expect(obj.get()).toBe(7);
});

// ── ข้อ 5 ──
test('ข้อ 5: memoize ไม่คำนวณซ้ำ', () => {
  let calls = 0;
  const slowSquare = memoize((n) => { calls++; return n * n; });
  expect(slowSquare(4)).toBe(16);
  expect(slowSquare(4)).toBe(16);
  expect(slowSquare(5)).toBe(25);
  expect(calls).toBe(2);
});
test('ข้อ 5: memoize หลาย arguments', () => {
  let calls = 0;
  const add = memoize((a, b) => { calls++; return a + b; });
  add(1, 2); add(1, 2); add(2, 1);
  expect(calls).toBe(2);
});

// ── ข้อ 6 ──
test('ข้อ 6: curry', () => {
  const add3 = (a, b, c) => a + b + c;
  const c = curry(add3);
  expect(c(1)(2)(3)).toBe(6);
  expect(c(1, 2)(3)).toBe(6);
  expect(c(1)(2, 3)).toBe(6);
  expect(c(1, 2, 3)).toBe(6);
  const add1 = c(1);
  expect(add1(10)(20)).toBe(31);
  expect(add1(100)(200)).toBe(301); // ต้องเรียกซ้ำได้ (ห้ามเก็บ state ร่วมกัน!)
});

// ── ข้อ 7 ──
test('ข้อ 7: groupBy', () => {
  expect(groupBy([1, 2, 3, 4, 5], (n) => (n % 2 ? 'odd' : 'even'))).toEqual({ odd: [1, 3, 5], even: [2, 4] });
  const people = [{ n: 'A', city: 'BKK' }, { n: 'B', city: 'CNX' }, { n: 'C', city: 'BKK' }];
  expect(groupBy(people, (p) => p.city).BKK.map((p) => p.n)).toEqual(['A', 'C']);
  expect(groupBy([], (x) => x)).toEqual({});
});

// ── ข้อ 8 ──
test('ข้อ 8: deepClone object ซ้อนกัน', () => {
  const orig = { a: 1, b: { c: [1, 2, { d: 3 }] }, e: null };
  const copy = deepClone(orig);
  expect(copy).toEqual(orig);
  copy.b.c[2].d = 99;
  expect(orig.b.c[2].d).toBe(3);
  expect(copy.b === orig.b).toBe(false);
});
test('ข้อ 8: deepClone Date และ primitive', () => {
  const d = new Date('2026-01-01');
  const c = deepClone({ d });
  expect(c.d instanceof Date).toBe(true);
  expect(c.d === d).toBe(false);
  expect(c.d.getTime()).toBe(d.getTime());
  expect(deepClone(5)).toBe(5);
  expect(deepClone('x')).toBe('x');
  expect(Array.isArray(deepClone([1, [2]]))).toBe(true);
});

// ── ข้อ 9 ──
test('ข้อ 9: myBind', () => {
  if (myBind.toString().includes('.bind(')) throw new Error('ห้ามใช้ .bind');
  const user = { name: 'Ann' };
  function greet(greeting, mark) { return `${greeting}, ${this.name}${mark}`; }
  const hi = myBind(greet, user, 'Hi');
  expect(hi('!')).toBe('Hi, Ann!');
  expect(myBind(greet, { name: 'Bob' })('Yo', '?')).toBe('Yo, Bob?');
});

// ── ข้อ 10 ──
test('ข้อ 10: pipe', () => {
  expect(pipe((x) => x + 1, (x) => x * 2)(3)).toBe(8);
  expect(pipe()(5)).toBe(5);
  expect(pipe((s) => s.trim(), (s) => s.toUpperCase(), (s) => s + '!')('  hi ')).toBe('HI!');
});

// ── ข้อ 11 ──
test('ข้อ 11: EventEmitter on/emit', () => {
  const e = new EventEmitter();
  const log = [];
  e.on('msg', (a, b) => log.push(`1:${a}${b}`));
  e.on('msg', (a) => log.push(`2:${a}`));
  expect(e.emit('msg', 'x', 'y')).toBe(2);
  expect(log).toEqual(['1:xy', '2:x']);
  expect(e.emit('nothing')).toBe(0);
});
test('ข้อ 11: off และ unsubscribe', () => {
  const e = new EventEmitter();
  let n = 0;
  const h = () => n++;
  const unsub = e.on('a', h);
  e.emit('a');
  unsub();
  e.emit('a');
  e.on('a', h);
  e.off('a', h);
  e.emit('a');
  expect(n).toBe(1);
});
test('ข้อ 11: once', () => {
  const e = new EventEmitter();
  let n = 0;
  e.once('a', () => n++);
  e.emit('a'); e.emit('a');
  expect(n).toBe(1);
});

// ── ข้อ 12 ──
test('ข้อ 12: Rectangle / Square', () => {
  expect(new Rectangle(2, 5).area()).toBe(10);
  expect(new Square(3).area()).toBe(9);
  expect(new Square(3).toString()).toBe('Square (area: 9)');
  expect(new Rectangle(1, 2).toString()).toBe('Rectangle (area: 2)');
});
test('ข้อ 12: prototype chain ถูกต้อง', () => {
  const s = new Square(1);
  expect(s instanceof Rectangle && s instanceof Shape).toBe(true);
  expect(Object.getPrototypeOf(Square.prototype)).toBe(Rectangle.prototype);
  expect(Object.hasOwn(s, 'area')).toBe(false); // method ต้องอยู่บน prototype ไม่ใช่บน instance
});
test('ข้อ 12: static count', () => {
  const before = Shape.count;
  new Shape('x'); new Square(2);
  expect(Shape.count - before).toBe(2);
});
