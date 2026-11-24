// ✏️ เขียน test ของ cart.js ที่นี่   รัน: node --test 11-testing/
// (บรรทัด require ด้านล่างทำให้ check.js สลับไปทดสอบกับ cart.js เวอร์ชันอื่นได้ ห้ามแก้)
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createCart } = require(process.env.CART_IMPL || './cart.js');

// สินค้าตัวอย่าง
const book = { id: 'book', name: 'หนังสือ', price: 200 };
const pen = { id: 'pen', name: 'ปากกา', price: 15.5 };

describe('add & subtotal', () => {
  // ✅ ตัวอย่างที่ 1
  test('ตะกร้าใหม่มี subtotal = 0', () => {
    const cart = createCart();
    assert.equal(cart.subtotal(), 0);
  });

  // ✅ ตัวอย่างที่ 2
  test('เพิ่มสินค้า 2 ชิ้น → subtotal = ราคา × 2', () => {
    const cart = createCart();
    cart.add(book, 2);
    assert.equal(cart.subtotal(), 400);
  });

  // TODO: เพิ่มสินค้าที่มีอยู่แล้ว → จำนวนต้องบวกเพิ่ม (ไม่ใช่เพิ่มเป็นรายการใหม่)

  // TODO: qty ≤ 0 ต้อง throw  (คำใบ้: assert.throws(() => ...))

  // TODO: ไม่ส่ง qty → ค่าเริ่มต้นคือ 1
});

describe('remove', () => {
  // TODO
});

describe('total + โค้ดส่วนลด', () => {
  // TODO: SAVE10 ตอน subtotal น้อยกว่า 500 / เท่ากับ 500 พอดี / มากกว่า 500
  // TODO: FLAT50 ตอนยอดน้อยกว่า 50
  // TODO: โค้ดที่ไม่รู้จัก
  // TODO: ทศนิยม 2 ตำแหน่ง
});

describe('count', () => {
  // TODO
});
