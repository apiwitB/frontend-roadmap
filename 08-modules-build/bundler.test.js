// test ของ mini bundler   รัน: node --test 08-modules-build/
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { findDependencies, createGraph, bundle } = require(process.env.SOLUTION ? './solution/bundler.js' : './bundler.js');

const ENTRY = path.join(__dirname, 'example', 'index.js');

test('ข้อ 1: findDependencies หา require ทั้ง quote เดี่ยวและคู่', () => {
  const code = `const a = require('./a.js');\nconst b = require("./lib/b.js");\nconst x = notrequire;`;
  assert.deepEqual(findDependencies(code), ['./a.js', './lib/b.js']);
});

test('ข้อ 1: โค้ดที่ไม่มี require → []', () => {
  assert.deepEqual(findDependencies('module.exports = 1'), []);
});

test('ข้อ 2: createGraph มี 4 module (math.js ไม่ซ้ำ)', () => {
  const g = createGraph(ENTRY);
  assert.equal(g.length, 4);
  assert.equal(new Set(g.map((m) => m.filename)).size, 4);
});

test('ข้อ 2: entry มี id 0 และ filename เป็น absolute path', () => {
  const g = createGraph(ENTRY);
  assert.equal(g[0].id, 0);
  assert.equal(g[0].filename, path.resolve(ENTRY));
  assert.ok(g.every((m) => path.isAbsolute(m.filename)));
});

test('ข้อ 2: mapping ชี้ไปยัง id ที่ถูกต้อง', () => {
  const g = createGraph(ENTRY);
  const byFile = (f) => g.find((m) => m.filename.endsWith(f));
  const entry = g[0];
  assert.equal(entry.mapping['./greet.js'], byFile('greet.js').id);
  assert.equal(entry.mapping['./utils/math.js'], byFile('math.js').id);
  // greet.js ก็ require math.js เหมือนกัน → ต้องได้ id เดียวกัน
  assert.equal(byFile('greet.js').mapping['./utils/math.js'], byFile('math.js').id);
});

test('ข้อ 3: bundle รันได้และได้ผลถูกต้อง', () => {
  const code = bundle(createGraph(ENTRY));
  assert.equal(typeof code, 'string');
  const logs = [];
  const fakeConsole = { log: (...a) => logs.push(a.join(' ')) };
  new Function('console', code)(fakeConsole); // รันโค้ดโดยส่ง console ปลอมเข้าไป
  assert.deepEqual(logs, ['[math.js loaded]', 'สวัสดี Bundler! (อายุ 25)', '1 + 2 = 3']);
});

test('ข้อ 3: แต่ละ module มี scope แยกกัน (ไม่รั่วเป็น global)', () => {
  const code = bundle(createGraph(ENTRY));
  const sandbox = {};
  new Function('console', 'globalThis', code)({ log() {} }, sandbox);
  assert.equal(typeof globalThis.greet, 'undefined');
  assert.equal(typeof globalThis.add, 'undefined');
});
