// เฉลย test (ตั้งชื่อไม่ลงท้าย .test.js เพื่อไม่ให้ node --test หยิบไปรัน)
// ตรวจ (PowerShell):  $env:CART_TEST="11-testing/solution/cart-tests.solution.js"; node 11-testing/check.js
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createCart } = require(process.env.CART_IMPL || './cart.js');

const book = { id: 'book', name: 'หนังสือ', price: 200 };
const pen = { id: 'pen', name: 'ปากกา', price: 15.5 };

describe('add & subtotal', () => {
  test('ตะกร้าใหม่มี subtotal = 0', () => {
    assert.equal(createCart().subtotal(), 0);
  });
  test('เพิ่มสินค้า 2 ชิ้น → subtotal = ราคา × 2', () => {
    const cart = createCart();
    cart.add(book, 2);
    assert.equal(cart.subtotal(), 400);
  });
  test('เพิ่มสินค้าเดิมซ้ำ → บวกจำนวนเพิ่มในรายการเดิม', () => {
    const cart = createCart();
    cart.add(book, 2);
    cart.add(book, 3);
    assert.equal(cart.items().length, 1);
    assert.equal(cart.items()[0].qty, 5);
  });
  test('ไม่ส่ง qty → ค่าเริ่มต้นคือ 1', () => {
    const cart = createCart();
    cart.add(pen);
    assert.equal(cart.count(), 1);
  });
  test('qty = 0 หรือติดลบ → throw', () => {
    const cart = createCart();
    assert.throws(() => cart.add(book, 0));
    assert.throws(() => cart.add(book, -1));
    assert.equal(cart.count(), 0);
  });
  test('หลายสินค้า', () => {
    const cart = createCart();
    cart.add(book, 1);
    cart.add(pen, 2);
    assert.equal(cart.subtotal(), 231);
  });
});

describe('remove', () => {
  test('ลบสินค้าที่ระบุ', () => {
    const cart = createCart();
    cart.add(book);
    cart.add(pen);
    cart.remove('pen');
    assert.deepEqual(cart.items().map((i) => i.id), ['book']);
  });
  test('ลบสินค้าที่ไม่มี → ไม่มีอะไรเปลี่ยน', () => {
    const cart = createCart();
    cart.add(book);
    cart.add(pen);
    cart.remove('nope');
    assert.deepEqual(cart.items().map((i) => i.id), ['book', 'pen']);
  });
});

describe('total + โค้ดส่วนลด', () => {
  const cartWith = (price, qty = 1) => {
    const cart = createCart();
    cart.add({ id: 'x', price }, qty);
    return cart;
  };
  test('ไม่มีโค้ด → เท่ากับ subtotal', () => assert.equal(cartWith(300).total(), 300));
  test('SAVE10 ตอน subtotal < 500 → ไม่ลด', () => assert.equal(cartWith(499).total('SAVE10'), 499));
  test('SAVE10 ตอน subtotal = 500 พอดี → ลด 10%', () => assert.equal(cartWith(500).total('SAVE10'), 450)); // ← boundary
  test('SAVE10 ตอน subtotal > 500 → ลด 10%', () => assert.equal(cartWith(1000).total('SAVE10'), 900));
  test('FLAT50 → ลด 50', () => assert.equal(cartWith(200).total('FLAT50'), 150));
  test('FLAT50 ตอนยอดน้อยกว่า 50 → 0 (ไม่ติดลบ)', () => assert.equal(cartWith(30).total('FLAT50'), 0));
  test('โค้ดที่ไม่รู้จัก → ไม่ลด', () => assert.equal(cartWith(600).total('HACKER'), 600));
  test('ปัดทศนิยม 2 ตำแหน่ง', () => {
    assert.equal(cartWith(15.5, 3).total(), 46.5);
    assert.equal(cartWith(0.1, 3).total(), 0.3); // 0.1 * 3 = 0.30000000000000004 (floating point) → 0.3
  });
});

describe('count', () => {
  test('นับจำนวนชิ้นรวมทุกรายการ', () => {
    const cart = createCart();
    cart.add(book, 2);
    cart.add(pen, 3);
    assert.equal(cart.count(), 5);
  });
});
