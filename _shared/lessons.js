// รายการบทเรียนทั้งหมด (หน้า index.html อ่านไฟล์นี้เพื่อสร้างเมนูและแสดงความคืบหน้า)
// type: 'browser' = เปิดในเบราว์เซอร์แล้วดูผล test มุมขวาล่าง
//       'node'    = รันคำสั่งใน terminal
window.LESSONS = [
  {
    id: '01-internet',
    title: 'Internet ทำงานยังไง',
    roadmap: 'Internet · HTTP · DNS · Browser',
    desc: 'พิมพ์ URL แล้วเกิดอะไรขึ้นบ้าง ตั้งแต่ DNS → TCP → HTTP → browser render แล้วเขียน HTTP server เอง',
    exercises: [
      { name: 'ส่ง HTTP request ด้วยมือ (raw TCP)', type: 'node', cmd: 'node 01-internet/raw-client.js' },
      { name: 'เขียน HTTP server: routing, status, header, cache', type: 'node', cmd: 'node --test 01-internet/' },
    ],
  },
  {
    id: '02-html',
    title: 'HTML',
    roadmap: 'Semantic HTML · Forms · Accessibility · SEO',
    desc: 'โครงสร้างเอกสาร, semantic tags, form validation, accessibility',
    exercises: [
      { name: 'แปลง div soup เป็น semantic HTML', type: 'browser', path: '02-html/ex1-semantic.html' },
      { name: 'ฟอร์มสมัครสมาชิกที่ accessible + validate เองได้', type: 'browser', path: '02-html/ex2-form.html' },
    ],
  },
  {
    id: '03-css',
    title: 'CSS',
    roadmap: 'Box model · Specificity · Flexbox · Grid · Responsive',
    desc: 'เข้าใจ cascade, box model, layout ทั้ง flexbox / grid และทำ responsive แบบ mobile-first',
    exercises: [
      { name: 'Box model & Specificity', type: 'browser', path: '03-css/ex1-box-specificity.html' },
      { name: 'Flexbox', type: 'browser', path: '03-css/ex2-flexbox.html' },
      { name: 'Grid layout', type: 'browser', path: '03-css/ex3-grid.html' },
      { name: 'Responsive (mobile-first)', type: 'browser', path: '03-css/ex4-responsive.html' },
    ],
  },
  {
    id: '04-javascript',
    title: 'JavaScript พื้นฐานแบบลึก',
    roadmap: 'Types · Scope · Closure · this · Prototype',
    desc: 'type coercion, scope, closure, this, prototype, class และ higher-order function',
    exercises: [{ name: 'JS Core 12 ข้อ', type: 'browser', path: '04-javascript/exercise.html' }],
  },
  {
    id: '05-dom',
    title: 'DOM & Events',
    roadmap: 'DOM manipulation · Events · Delegation',
    desc: 'จัดการ DOM, event bubbling/capturing, event delegation, state → render',
    exercises: [
      { name: 'Playground: event bubbling (ดูอย่างเดียว)', type: 'browser', path: '05-dom/playground-events.html', noTest: true },
      { name: 'Todo App ด้วย Vanilla JS', type: 'browser', path: '05-dom/exercise.html' },
    ],
  },
  {
    id: '06-async',
    title: 'Async JS & Fetch API',
    roadmap: 'Promise · async/await · Event loop · Fetch · AJAX',
    desc: 'event loop, microtask vs macrotask, Promise เขียนเอง, fetch + error handling, concurrency',
    exercises: [{ name: 'Async 8 ข้อ', type: 'browser', path: '06-async/exercise.html' }],
  },
  {
    id: '07-git',
    title: 'Version Control (Git)',
    roadmap: 'Git · Branch · Merge · Conflict · GitHub',
    desc: 'commit คืออะไรจริงๆ, branch เป็นแค่ pointer, merge/rebase, แก้ conflict',
    exercises: [
      { name: 'สร้าง repo สำหรับฝึก', type: 'node', cmd: 'node 07-git/lab.js setup' },
      { name: 'ตรวจงาน Git lab', type: 'node', cmd: 'node 07-git/lab.js check' },
    ],
  },
  {
    id: '08-modules-build',
    title: 'Modules, npm & Build tools',
    roadmap: 'Package managers · Module bundlers · Linters',
    desc: 'npm, semver, ES modules vs CommonJS แล้วเขียน bundler เองเพื่อเข้าใจว่า webpack/Vite ทำอะไร',
    exercises: [{ name: 'เขียน mini bundler', type: 'node', cmd: 'node --test 08-modules-build/' }],
  },
  {
    id: '09-css-architecture',
    title: 'CSS Architecture',
    roadmap: 'BEM · CSS Variables · Preprocessors · CSS-in-JS',
    desc: 'ตั้งชื่อแบบ BEM, design tokens ด้วย custom properties, dark mode, @layer',
    exercises: [{ name: 'Refactor เป็น BEM + Theme', type: 'browser', path: '09-css-architecture/exercise.html' }],
  },
  {
    id: '10-framework',
    title: 'Framework (React) — สร้างเองก่อนใช้',
    roadmap: 'React · Components · Virtual DOM · State',
    desc: 'เขียน mini React เอง (h, render, component, useState) แล้วค่อยเทียบกับ React จริง',
    exercises: [
      { name: 'เขียน mini-react', type: 'browser', path: '10-framework/exercise.html' },
      { name: 'React จริง (เทียบ)', type: 'browser', path: '10-framework/react-demo.html', noTest: true },
    ],
  },
  {
    id: '11-testing',
    title: 'Testing',
    roadmap: 'Unit · Integration · E2E · TDD',
    desc: 'เขียน test ด้วย node:test, หา bug ที่ซ่อนอยู่ด้วย test, mock/spy, TDD',
    exercises: [{ name: 'หา bug ใน cart.js ด้วย test', type: 'node', cmd: 'node --test 11-testing/' }],
  },
  {
    id: '12-typescript',
    title: 'TypeScript',
    roadmap: 'Static type checkers',
    desc: 'type, interface, union + narrowing, generics, utility types',
    exercises: [
      { name: 'ติดตั้ง (ครั้งแรก)', type: 'node', cmd: 'cd 12-typescript; npm install' },
      { name: 'Type check + run', type: 'node', cmd: 'cd 12-typescript; npm test' },
    ],
  },
  {
    id: '13-security-performance-pwa',
    title: 'Security, Performance & PWA',
    roadmap: 'Web Security · Performance · PWA',
    desc: 'XSS, CSP, CORS, debounce/throttle, lazy loading, Core Web Vitals, Service Worker',
    exercises: [{ name: 'Security & Performance 7 ข้อ', type: 'browser', path: '13-security-performance-pwa/exercise.html' }],
  },
  {
    id: '14-final-project',
    title: 'Final Project',
    roadmap: 'รวมทุกอย่าง',
    desc: 'สร้างแอปจริงหนึ่งตัวที่ใช้ความรู้ทุกบท พร้อม checklist ให้ประเมินตัวเอง',
    exercises: [],
  },
];
