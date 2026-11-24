// ═══════════════════════════════════════════════════════════════
//  บทที่ 05: Todo App (vanilla JS)
//  ใช้รูปแบบ  event → แก้ state → save() → render()
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'todos';

// ── element ที่ใช้ ──
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('todo-count');
const filterButtons = document.querySelectorAll('[data-filter]');
const template = document.getElementById('todo-template');

// ── state: ข้อมูลทั้งหมดของแอปอยู่ที่นี่ที่เดียว ──
// todo หนึ่งตัวมีหน้าตาแบบนี้: { id: 'abc', text: 'ซื้อนม', done: false }
let state = {
  todos: load(),
  filter: 'all', // 'all' | 'active' | 'done'
};

// ───────────────────────────────────────────────────────────────
// ข้อ 7: localStorage
// ───────────────────────────────────────────────────────────────
function load() {
  // TODO: อ่าน localStorage[STORAGE_KEY] แล้ว JSON.parse ถ้าไม่มีข้อมูลหรือ parse ไม่ได้ให้คืน []
  return [];
}

function save() {
  // TODO: เก็บ state.todos ลง localStorage เป็น JSON
}

// ───────────────────────────────────────────────────────────────
// ข้อ 1, 3, 4, 6: ฟังก์ชันที่แก้ state
// (ห้าม mutate array เดิม ให้สร้าง array ใหม่ด้วย [...], map หรือ filter)
// ───────────────────────────────────────────────────────────────
function addTodo(text) {
  // TODO: ตัดช่องว่างหน้าหลัง ถ้าว่างก็ไม่ต้องเพิ่ม
  //       สร้าง todo ใหม่ { id: crypto.randomUUID(), text, done: false } ต่อท้าย state.todos
  //       แล้ว save() + render()
}

function toggleTodo(id) {
  // TODO: สลับ done ของ todo ที่ id ตรงกัน
}

function removeTodo(id) {
  // TODO
}

function setFilter(filter) {
  // TODO: เปลี่ยน state.filter แล้ว render()
}

// ───────────────────────────────────────────────────────────────
// ข้อ 2, 5, 6: render() สร้าง UI ใหม่ทั้งหมดจาก state
// ───────────────────────────────────────────────────────────────
function render() {
  // TODO:
  // 1) กรอง todos ตาม state.filter
  // 2) สร้าง <li> จาก template ของแต่ละ todo
  //      - li.dataset.id = todo.id
  //      - ถ้า done: li.classList.add('done') และ checkbox.checked = true
  //      - ข้อความใส่ใน .text (ใช้ textContent!)
  // 3) list.replaceChildren(...lis)
  // 4) count.textContent = 'N items left' (ถ้าเป็น 1 ใช้ '1 item left')  นับจาก todos ทั้งหมดที่ยังไม่ done
  // 5) ปุ่ม filter: ตั้ง aria-pressed="true" ให้ปุ่มที่ตรงกับ state.filter และ "false" ให้ปุ่มอื่น
}

// ───────────────────────────────────────────────────────────────
// Event listeners
// ───────────────────────────────────────────────────────────────

// ข้อ 1: submit form
form.addEventListener('submit', (e) => {
  // TODO: e.preventDefault() ← ไม่งั้นหน้าจะรีเฟรช!
  //       แล้ว addTodo(input.value) และล้าง input
});

// ข้อ 3 + 4: event delegation ติด listener ที่ <ul> ตัวเดียว
//   - คลิก .delete → removeTodo(id)
//   - checkbox .toggle เปลี่ยน → toggleTodo(id)  (ใช้ event 'change' หรือ 'click' ก็ได้)
//   คำใบ้: const id = e.target.closest('li')?.dataset.id
// TODO

// ข้อ 6: ปุ่ม filter
// TODO

// (bonus ข้อ 8) ดับเบิลคลิกที่ .text เพื่อแก้ไข: แทน span ด้วย <input class="edit">
//   กด Enter = บันทึก, Escape = ยกเลิก, blur = บันทึก

render();

// ── สำหรับ test (ไม่ต้องแก้) ──
window.__todoTest = {
  reset() { state = { todos: [], filter: 'all' }; save(); render(); },
  reload() { state = { todos: load(), filter: 'all' }; render(); },
  get state() { return state; },
};
