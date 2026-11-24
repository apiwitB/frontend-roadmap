// เฉลย mini-react   (เปิด solution/exercise.html)

function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children
      .flat(Infinity)
      .filter((c) => c != null && c !== false && c !== true)
      .map((c) => (typeof c === 'object' ? c : String(c))),
  };
}

function createDom(vnode) {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  if (typeof vnode.type === 'function') {
    return createDom(vnode.type({ ...vnode.props, children: vnode.children }));
  }
  const el = document.createElement(vnode.type);
  for (const [name, value] of Object.entries(vnode.props)) setProp(el, name, value);
  vnode.children.forEach((child) => el.appendChild(createDom(child)));
  return el;
}

function setProp(el, name, value, oldValue) {
  if (name === 'key' || name === 'children') return;
  if (name.startsWith('on')) {
    const event = name.slice(2).toLowerCase(); // onClick → click
    if (oldValue) el.removeEventListener(event, oldValue);
    if (value) el.addEventListener(event, value);
  } else if (name === 'className') {
    el.className = value ?? '';
  } else if (name === 'style') {
    el.removeAttribute('style');
    Object.assign(el.style, value || {});
  } else if (name === 'value' || name === 'checked') {
    if (el[name] !== value) el[name] = value; // ถ้าค่าเท่าเดิมไม่ต้องตั้งใหม่ ตำแหน่ง cursor จะได้ไม่กระโดด
  } else if (value == null || value === false) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, value);
  }
}

function render(vnode, container) {
  container.replaceChildren(createDom(vnode));
}

let currentInstance = null;

function useState(initial) {
  const instance = currentInstance; // จับ instance ไว้ใน closure
  const i = instance.hookIndex++;
  if (!(i in instance.hooks)) instance.hooks[i] = initial;

  const setState = (next) => {
    if (typeof next === 'function') next = next(instance.hooks[i]);
    if (Object.is(next, instance.hooks[i])) return;
    instance.hooks[i] = next;
    instance.rerender();
    // React จริงไม่ render ทันที แต่จะรวม setState หลายครั้งไว้ render ทีเดียว (batching)
  };
  return [instance.hooks[i], setState];
}

const ENABLE_PATCH = true;

function patch(parent, dom, oldV, newV) {
  if (oldV === undefined) return parent.appendChild(createDom(newV));
  if (newV === undefined) {
    dom.remove();
    return null;
  }
  const isText = typeof oldV === 'string' || typeof newV === 'string';
  if (isText ? oldV !== newV : oldV.type !== newV.type) {
    const fresh = createDom(newV);
    dom.replaceWith(fresh);
    return fresh;
  }
  if (isText) return dom; // ข้อความเหมือนเดิม

  // tag เดียวกัน: อัปเดตเฉพาะ props ที่เปลี่ยน
  for (const name of Object.keys(oldV.props)) {
    if (!(name in newV.props)) setProp(dom, name, undefined, oldV.props[name]);
  }
  for (const [name, value] of Object.entries(newV.props)) {
    if (oldV.props[name] !== value) setProp(dom, name, value, oldV.props[name]);
  }

  // patch ลูกทีละตำแหน่ง (React จริงใช้ key จับคู่ลูกแทนการใช้ตำแหน่ง)
  const max = Math.max(oldV.children.length, newV.children.length);
  for (let i = max - 1; i >= 0; i--) {
    if (i >= oldV.children.length) continue; // ลูกที่เพิ่มใหม่ทำในลูปถัดไป ให้เรียงลำดับถูก
    patch(dom, dom.childNodes[i], oldV.children[i], newV.children[i]);
  }
  for (let i = oldV.children.length; i < newV.children.length; i++) {
    patch(dom, undefined, undefined, newV.children[i]);
  }
  return dom;
}

function resolve(vnode) {
  if (typeof vnode === 'string') return vnode;
  if (typeof vnode.type === 'function') {
    return resolve(vnode.type({ ...vnode.props, children: vnode.children }));
  }
  return { ...vnode, children: vnode.children.map(resolve) };
}

function mount(App, container) {
  const instance = { hooks: [], hookIndex: 0, tree: null, rerender };

  function rerender() {
    instance.hookIndex = 0;
    currentInstance = instance;
    const newTree = resolve(h(App, null));
    currentInstance = null;

    if (ENABLE_PATCH && instance.tree) {
      patch(container, container.firstChild, instance.tree, newTree);
    } else {
      render(newTree, container);
    }
    instance.tree = newTree;
  }

  rerender();
  return instance;
}
