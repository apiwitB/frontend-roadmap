// เฉลยบทที่ 05: เปิด solution/exercise.html เพื่อดูว่าผ่าน test
const STORAGE_KEY = 'todos';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('todo-count');
const filterButtons = document.querySelectorAll('[data-filter]');
const template = document.getElementById('todo-template');

let state = { todos: load(), filter: 'all' };

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return []; // ข้อมูลพังหรือ localStorage ถูกปิดไว้ (เช่นในโหมด private)
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
  } catch {}
}

function update(changes) {
  // จุดเดียวที่แก้ state: แก้ → save → render
  state = { ...state, ...changes };
  save();
  render();
}

function addTodo(text) {
  text = text.trim();
  if (!text) return;
  update({ todos: [...state.todos, { id: crypto.randomUUID(), text, done: false }] });
}

function toggleTodo(id) {
  update({ todos: state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
}

function removeTodo(id) {
  update({ todos: state.todos.filter((t) => t.id !== id) });
}

function editTodo(id, text) {
  text = text.trim();
  if (!text) return removeTodo(id);
  update({ todos: state.todos.map((t) => (t.id === id ? { ...t, text } : t)) });
}

function setFilter(filter) {
  update({ filter });
}

const FILTERS = {
  all: () => true,
  active: (t) => !t.done,
  done: (t) => t.done,
};

function todoToLi(todo) {
  const li = template.content.firstElementChild.cloneNode(true);
  li.dataset.id = todo.id;
  li.classList.toggle('done', todo.done);
  li.querySelector('.toggle').checked = todo.done;
  li.querySelector('.text').textContent = todo.text; // textContent กัน XSS
  return li;
}

function render() {
  list.replaceChildren(...state.todos.filter(FILTERS[state.filter]).map(todoToLi));

  const left = state.todos.filter((t) => !t.done).length;
  count.textContent = `${left} ${left === 1 ? 'item' : 'items'} left`;

  filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = '';
  input.focus();
});

// event delegation: listener ตัวเดียวคุมทุก <li> รวมถึงตัวที่สร้างทีหลัง
list.addEventListener('click', (e) => {
  const id = e.target.closest('li')?.dataset.id;
  if (!id) return;
  if (e.target.matches('.delete')) removeTodo(id);
  else if (e.target.matches('.toggle')) toggleTodo(id);
});

// bonus: ดับเบิลคลิกเพื่อแก้ไข
list.addEventListener('dblclick', (e) => {
  const span = e.target.closest('.text');
  if (!span) return;
  const id = span.closest('li').dataset.id;
  const edit = document.createElement('input');
  edit.className = 'edit';
  edit.value = span.textContent;
  span.replaceWith(edit);
  edit.focus();

  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    commit ? editTodo(id, edit.value) : render();
  };
  edit.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') finish(true);
    if (ev.key === 'Escape') finish(false);
  });
  edit.addEventListener('blur', () => finish(true));
});

document.querySelector('.filters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter]');
  if (btn) setFilter(btn.dataset.filter);
});

render();

window.__todoTest = {
  reset() { state = { todos: [], filter: 'all' }; save(); render(); },
  reload() { state = { todos: load(), filter: 'all' }; render(); },
  get state() { return state; },
};
