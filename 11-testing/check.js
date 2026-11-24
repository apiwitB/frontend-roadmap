// check.js: ตรวจว่า test ของคุณ "จับ bug ได้จริง" ด้วยเทคนิค mutation testing
//   node 11-testing/check.js
//
// หลักการ: สร้าง cart.js เวอร์ชันที่ถูกต้อง 1 ตัว และเวอร์ชันที่มี bug ทีละจุด (mutant) อีกหลายตัว
//   - test ของคุณต้อง "ผ่าน" กับเวอร์ชันที่ถูกต้อง
//   - test ของคุณต้อง "fail" กับ mutant ทุกตัว (เรียกว่า kill mutant)
// ถ้ามี mutant ที่รอด แปลว่า test ยังมีช่องโหว่ เครื่องมือจริงที่ทำแบบนี้คือ Stryker

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CORRECT = `
function createCart() {
  const items = [];
  return {
    add(product, qty = 1) {
      if (qty <= 0) throw new Error('qty must be positive');
      const existing = items.find((i) => i.id === product.id);
      if (existing) existing.qty += qty;
      else items.push({ ...product, qty });
    },
    remove(id) {
      const index = items.findIndex((i) => i.id === id);
      if (index !== -1) items.splice(index, 1);
    },
    subtotal() { return items.reduce((sum, i) => sum + i.price * i.qty, 0); },
    total(code) {
      const sub = this.subtotal();
      let result = sub;
      if (code === 'SAVE10' && sub >= 500) result = sub * 0.9;
      if (code === 'FLAT50') result = Math.max(0, sub - 50);
      return Math.round(result * 100) / 100;
    },
    count() { return items.reduce((n, i) => n + i.qty, 0); },
    items() { return items.map((i) => ({ ...i })); },
  };
}
module.exports = { createCart };
`;

const MUTANTS = [
  ['บวกจำนวนเมื่อเพิ่มสินค้าซ้ำ', 'existing.qty += qty', 'existing.qty = qty'],
  ['qty = 0 ต้อง throw', 'qty <= 0', 'qty < 0'],
  ['SAVE10 ที่ 500 พอดี', 'sub >= 500', 'sub > 500'],
  ['FLAT50 ห้ามติดลบ', 'Math.max(0, sub - 50)', 'sub - 50'],
  ['default qty = 1', 'add(product, qty = 1)', 'add(product, qty = 2)'],
  ['remove ลบถูกตัว', 'items.splice(index, 1)', 'items.splice(0, 1)'],
  ['ส่วนลด 10% (ไม่ใช่ 20%)', 'sub * 0.9', 'sub * 0.8'],
  ['ปัดทศนิยม 2 ตำแหน่ง', 'Math.round(result * 100) / 100', 'Math.round(result)'],
  ['count รวมจำนวนชิ้น ไม่ใช่จำนวนรายการ', 'n + i.qty', 'n + 1'],
  ['remove id ที่ไม่มี → ไม่ทำอะไร', 'if (index !== -1) items', 'items'],
];

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cart-mutants-'));
const testFile = process.env.CART_TEST || path.join(__dirname, 'cart.test.js');

function runTests(code, name) {
  const file = path.join(dir, `${name}.js`);
  fs.writeFileSync(file, code);
  const r = spawnSync(process.execPath, ['--test', testFile], { env: { ...process.env, CART_IMPL: file }, encoding: 'utf8' });
  return r.status === 0;
}

console.log('\n🧬 Mutation testing ของ cart.test.js\n');

if (!runTests(CORRECT, 'correct')) {
  console.log('❌ test ของคุณ fail กับเวอร์ชันที่ถูกต้อง แปลว่ามี test ที่คาดหวังผลผิดจาก spec');
  console.log('   ลองรัน:  node --test 11-testing/   แล้วตรวจกับ spec ใน README อีกครั้ง\n');
  process.exit(1);
}
console.log('✅ test ผ่านกับเวอร์ชันที่ถูกต้อง\n');

let killed = 0;
MUTANTS.forEach(([desc, from, to], i) => {
  if (!CORRECT.includes(from)) throw new Error('mutant ผิด: ' + from);
  const ok = !runTests(CORRECT.replace(from, to), `mutant${i}`);
  if (ok) killed++;
  console.log(`${ok ? '💀 kill แล้ว ' : '🧟 ยังรอด  '}  ${desc}`);
});

fs.rmSync(dir, { recursive: true, force: true });
console.log(`\nkill ได้ ${killed}/${MUTANTS.length} mutant${killed === MUTANTS.length ? ' 🎉 test ของคุณแข็งแรงมาก!' : ' ให้เขียน test เพิ่มสำหรับตัวที่ยังรอด'}\n`);

// ขั้นสุดท้าย: ใช้ test ชุดเฉลยตรวจ cart.js ของคุณ ว่าแก้ bug ครบแล้วหรือยัง
const reference = spawnSync(process.execPath, ['--test', path.join(__dirname, 'solution', 'cart-tests.solution.js')], {
  env: { ...process.env, CART_IMPL: path.join(__dirname, 'cart.js') },
  encoding: 'utf8',
});
const fixed = reference.status === 0;
console.log(fixed ? '✅ cart.js ของคุณแก้ bug ครบแล้ว\n' : '🐛 cart.js ยังมี bug อยู่ (test ชุดเฉลยยัง fail)\n');

process.exitCode = killed === MUTANTS.length && fixed ? 0 : 1;
