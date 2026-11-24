// เฉลย mini bundler   ตรวจ: $env:SOLUTION=1; node --test 08-modules-build/
const fs = require('node:fs');
const path = require('node:path');

function findDependencies(code) {
  return [...code.matchAll(/require\(\s*['"](.+?)['"]\s*\)/g)].map((m) => m[1]);
}

function createGraph(entryFile) {
  const modules = [];
  const idByFile = new Map(); // absolute path → id  (กันไม่ให้สร้าง module ซ้ำ และกัน circular loop)

  const addModule = (filename) => {
    const mod = { id: modules.length, filename, code: fs.readFileSync(filename, 'utf8'), mapping: {} };
    modules.push(mod);
    idByFile.set(filename, mod.id);
    return mod;
  };

  const queue = [addModule(path.resolve(entryFile))];
  while (queue.length) {
    const mod = queue.shift(); // BFS
    for (const dep of findDependencies(mod.code)) {
      const abs = path.resolve(path.dirname(mod.filename), dep);
      if (!idByFile.has(abs)) queue.push(addModule(abs));
      mod.mapping[dep] = idByFile.get(abs);
    }
  }
  return modules;
}

function bundle(graph) {
  const modules = graph
    .map((m) => `${m.id}: [function (require, module, exports) {\n${m.code}\n}, ${JSON.stringify(m.mapping)}]`)
    .join(',\n');

  return `// 📦 bundled by mini-bundler
(function (modules) {
  const cache = {};
  function require(id) {
    if (cache[id]) return cache[id].exports;
    const [fn, mapping] = modules[id];
    const module = { exports: {} };
    cache[id] = module; // ใส่ cache ก่อนรัน เพื่อรองรับ circular dependency
    fn((p) => require(mapping[p]), module, module.exports);
    return module.exports;
  }
  require(0);
})({
${modules}
});
`;
}

module.exports = { findDependencies, createGraph, bundle };

if (require.main === module) {
  const graph = createGraph(path.join(__dirname, '..', 'example', 'index.js'));
  const out = path.join(__dirname, '..', 'dist', 'bundle.js');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, bundle(graph));
  console.log('✅', out);
}
