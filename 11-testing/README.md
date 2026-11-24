# บทที่ 11: Testing

> หัวข้อใน roadmap: Testing your Apps (Vitest, Jest, Playwright, Cypress) · Unit / Integration / E2E

ตั้งแต่บทแรกเราใช้ test ที่เขียนไว้ให้แล้ว บทนี้จะเป็นคนเขียน test เอง
และจะเห็นว่า test framework ไม่ได้มีอะไรซับซ้อน ลองเปิด [`../_shared/test-runner.js`](../_shared/test-runner.js) ดู
มันเป็นแค่ array ของฟังก์ชันที่ถูกเรียกทีละตัวภายใน `try/catch`

---

## 1. ทำไมต้องเขียน test
- **กล้าแก้โค้ด (refactor)** เพราะถ้าทำอะไรพัง test จะแจ้งทันที
- **ใช้เป็นเอกสาร** อ่าน test แล้วรู้ว่าโค้ดควรทำงานยังไง
- **ช่วยออกแบบ** โค้ดที่เขียน test ยากมักเป็นโค้ดที่ผูกกันแน่นเกินไป

## 2. Testing Pyramid / Trophy
```
          ▲  E2E (Playwright, Cypress): เปิด browser จริงแล้วคลิกตามขั้นตอนเหมือนผู้ใช้  → ช้าแต่มั่นใจสูง
         ███ Integration: ทดสอบหลาย module ทำงานร่วมกัน เช่น component + API ปลอม
        █████ Unit: ทดสอบฟังก์ชันเดี่ยวๆ  → เร็ว ควรมีจำนวนมาก
```
Frontend สมัยใหม่นิยมเน้น **integration** ด้วย Testing Library ซึ่งทดสอบจากมุมมองของผู้ใช้
> "The more your tests resemble the way your software is used, the more confidence they can give you." (Kent C. Dodds)

## 3. โครงสร้างของ test: Arrange, Act, Assert
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('total ลดราคา 10% เมื่อใช้โค้ด SAVE10', () => {
  // Arrange: เตรียมข้อมูล
  const cart = createCart();
  cart.add({ id: 'a', price: 100 }, 2);
  // Act: สั่งให้ทำงาน
  const total = cart.total('SAVE10');
  // Assert: ตรวจผลลัพธ์
  assert.equal(total, 180);
});
```
**test ที่ดีควร**
- ทดสอบทีละพฤติกรรม และตั้งชื่อให้อ่านแล้วรู้ว่าทดสอบอะไร
- แยกจาก test ตัวอื่น ไม่ใช้ state ร่วมกัน และรันลำดับไหนก็ได้ผลเหมือนเดิม
- ทดสอบ **พฤติกรรม** ไม่ใช่วิธีเขียนข้างใน (implementation) เพื่อให้ refactor แล้ว test ไม่พัง
- คิดถึง **edge case** เสมอ เช่น ค่าว่าง, 0, ค่าติดลบ, ค่าที่ซ้ำ, ค่าที่ขอบพอดี และค่าที่ใหญ่มาก

## 4. Test Double: Mock, Stub และ Spy
ใช้แทนสิ่งที่ควบคุมไม่ได้ในตอน test เช่น network, เวลา, ตัวเลขสุ่ม หรือ localStorage
```js
import { test, mock } from 'node:test';

test('เรียก onSave หลังบันทึก', () => {
  const onSave = mock.fn();                 // spy: ฟังก์ชันปลอมที่จำได้ว่าถูกเรียกกี่ครั้งด้วย args อะไร
  saveForm({ name: 'A' }, onSave);
  assert.equal(onSave.mock.callCount(), 1);
  assert.deepEqual(onSave.mock.calls[0].arguments, [{ name: 'A' }]);
});

test('ไม่ต้องรอเวลาจริง', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });  // ควบคุมเวลาเอง ไม่ต้องรอจริง
  …
  t.mock.timers.tick(1000);
});
```
**Dependency injection** ทำให้ test ง่ายขึ้น เช่น `createCart({ now: () => fixedDate })` แทนการเรียก `Date.now()` ตรงๆ ในฟังก์ชัน

## 5. TDD: Red → Green → Refactor
1. 🔴 เขียน test ของสิ่งที่ยังไม่มี แล้วรันให้เห็นว่า **fail**
2. 🟢 เขียนโค้ดให้น้อยที่สุดที่ทำให้ test ผ่าน
3. 🔵 ปรับโค้ดให้ดีขึ้น (refactor) โดยที่ test ยังผ่านอยู่

## 6. เครื่องมือที่ใช้จริง
| เครื่องมือ | ใช้ทำ |
|---|---|
| `node:test` | test runner ที่มากับ Node ไม่ต้องติดตั้ง (ใช้ในบทนี้) |
| **Vitest** | ใช้ API แบบเดียวกับ Jest แต่เร็ว และเข้ากับ Vite ได้ดี เหมาะกับโปรเจกต์ frontend |
| **Testing Library** | `render(<App/>)` แล้ว `getByRole('button', { name: 'Save' })` เพื่อทดสอบแบบที่ผู้ใช้เห็น |
| **Playwright** | E2E บน Chromium, Firefox และ WebKit มี codegen ช่วยบันทึกขั้นตอน และมี trace viewer |
| **MSW** | ดักจับ fetch แล้วตอบด้วยข้อมูลปลอมในระดับ network |

**Coverage** บอกได้ว่าโค้ดบรรทัดไหน **ถูกรัน** ระหว่าง test แต่ไม่ได้บอกว่าโค้ดถูกต้อง
coverage 100% ก็ยังมี bug ได้ ถ้า test ไม่ได้ assert ผลลัพธ์ที่สำคัญ (`node --test --experimental-test-coverage`)

---

## 🧪 แบบฝึกหัด: หา bug ที่ซ่อนอยู่ด้วยการเขียน test
[`cart.js`](cart.js) คือโค้ดตะกร้าสินค้าที่ **มี bug ซ่อนอยู่ 4 จุด** และไม่มีใครรู้ว่าอยู่ตรงไหน

ข้อกำหนด (spec) ของตะกร้า
1. `add(product, qty = 1)`: ถ้าเพิ่มสินค้าที่มีอยู่แล้ว ให้ **บวกจำนวนเพิ่ม** ไม่ใช่เพิ่มเป็นรายการใหม่ ถ้า qty ≤ 0 ให้ throw
2. `remove(id)`: ลบสินค้าออก ถ้าไม่มีสินค้านั้นก็ไม่ต้องทำอะไร
3. `subtotal()`: ผลรวมของ ราคา × จำนวน
4. `total(code)`: ส่วนลด
   - `SAVE10` ลด 10% **เฉพาะเมื่อ subtotal ≥ 500**
   - `FLAT50` ลด 50 บาท แต่ยอดรวมต้องไม่ติดลบ
   - โค้ดที่ไม่รู้จัก ไม่ลดราคา
   - ผลลัพธ์ปัดเป็นทศนิยม 2 ตำแหน่ง
5. `count()`: จำนวนชิ้นทั้งหมด (รวมทุกรายการ)

**ขั้นตอน**
1. เปิด [`cart.test.js`](cart.test.js) ซึ่งเขียนตัวอย่างไว้ให้ 2 ข้อ
2. เขียน test เพิ่มให้ครอบคลุม spec ทุกข้อ รวมถึง edge case
3. รัน `node --test 11-testing/` แล้ว test ที่ fail จะชี้ให้เห็น bug
4. แก้ bug ใน `cart.js` จน test ผ่านทั้งหมด
5. ตรวจว่าเจอครบไหม: `node 11-testing/check.js` (script นี้จะใช้ test ของคุณรันกับ cart.js เวอร์ชันที่มี bug
   ทีละจุด ถ้า test ของคุณดีพอ ทุกเวอร์ชันที่มี bug ต้องทำให้ test fail
   ซึ่งมีทั้งหมด 10 แบบ รวม 4 bug ที่ซ่อนอยู่ใน cart.js ด้วย)

## ✅ เช็กความเข้าใจ
- unit test กับ E2E test ต่างกันยังไง และควรมีแต่ละแบบในสัดส่วนเท่าไร
- ทำไมการทดสอบ "วิธีเขียนข้างใน" (implementation detail) ถึงทำให้ refactor ยาก
- coverage 100% แปลว่าไม่มี bug หรือเปล่า
