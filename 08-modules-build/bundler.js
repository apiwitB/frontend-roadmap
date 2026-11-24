// ═══════════════════════════════════════════════════════════════
//  บทที่ 08: Mini Bundler (ใช้แนวคิดเดียวกับ webpack แต่เหลือประมาณ 60 บรรทัด)
//
//  bundle ไฟล์ CommonJS (require / module.exports) ให้รวมเป็นไฟล์เดียว
//  ตรวจงาน:  node --test 08-modules-build/
//  ใช้งาน:   node 08-modules-build/bundler.js   → สร้าง dist/bundle.js
// ═══════════════════════════════════════════════════════════════

const fs = require('node:fs');
const path = require('node:path');

// ───────────────────────────────────────────────────────────────
// ข้อ 1: findDependencies(code) → array ของ path ที่ถูก require ตามลำดับที่เจอ
//   findDependencies("const a = require('./a.js'); const b = require(\"./b.js\")")
//   → ['./a.js', './b.js']
//   คำใบ้: regex  /require\(\s*['"](.+?)['"]\s*\)/g  กับ  code.matchAll(...)
//   (bundler จริงใช้ parser สร้าง AST เช่น @babel/parser หรือ acorn ซึ่งแม่นกว่า regex มาก)
// ───────────────────────────────────────────────────────────────
function findDependencies(code) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 2: createGraph(entryFile) → array ของ module
//   แต่ละ module:  { id, filename, code, mapping }
//     id       ตัวเลขที่เริ่มจาก 0 (entry ต้องเป็น 0)
//     filename absolute path (ใช้ path.resolve)
//     code     เนื้อหาไฟล์
//     mapping  object ที่แปลง "path ที่เขียนใน require" → id   เช่น { './greet.js': 1 }
//
//   ขั้นตอน (BFS):
//     queue = [entry]
//     วนลูปหยิบไฟล์จาก queue → อ่านโค้ด → หา deps
//       → แต่ละ dep: resolve path จากโฟลเดอร์ของไฟล์ปัจจุบัน
//                    (path.resolve(path.dirname(filename), dep))
//       → ถ้ายังไม่เคยเจอไฟล์นี้ ให้สร้าง module ใหม่แล้วใส่ queue ถ้าเคยเจอแล้วใช้ id เดิม (ห้ามซ้ำ!)
// ───────────────────────────────────────────────────────────────
function createGraph(entryFile) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 3: bundle(graph) → string ของโค้ด JS ที่รันได้เองทั้งไฟล์
//
//   โครงที่ควรได้ (ลองเทียบกับ output ของ webpack):
//
//   (function (modules) {
//     const cache = {};
//     function require(id) {
//       if (cache[id]) return cache[id].exports;           // เคยรันแล้ว ใช้ผลที่เก็บไว้ (module รันครั้งเดียว)
//       const [fn, mapping] = modules[id];
//       const module = { exports: {} };
//       cache[id] = module;
//       fn((p) => require(mapping[p]), module, module.exports); // require ของแต่ละไฟล์แปลง path → id
//       return module.exports;
//     }
//     require(0);
//   })({
//     0: [function (require, module, exports) { ...code ของ module 0... }, {"./greet.js":1}],
//     1: [function (require, module, exports) { ...code ของ module 1... }, {...}],
//   });
//
//   ห่อโค้ดของแต่ละไฟล์ด้วย function เพื่อให้แต่ละไฟล์มี scope ของตัวเอง (ตัวแปรไม่ชนกัน)
// ───────────────────────────────────────────────────────────────
function bundle(graph) {
  throw new Error('TODO');
}

module.exports = { findDependencies, createGraph, bundle };

// ─── CLI (ไม่ต้องแก้) ───
if (require.main === module) {
  const graph = createGraph(path.join(__dirname, 'example', 'index.js'));
  console.log('📦 Dependency graph:');
  graph.forEach((m) => console.log(`  [${m.id}] ${path.relative(__dirname, m.filename)}  →`, m.mapping));
  const out = path.join(__dirname, 'dist', 'bundle.js');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, bundle(graph));
  console.log(`\n✅ เขียนไฟล์ ${path.relative(process.cwd(), out)} แล้ว ลองรัน: node ${path.relative(process.cwd(), out)}`);
}
