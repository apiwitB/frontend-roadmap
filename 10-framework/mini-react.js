// ═══════════════════════════════════════════════════════════════
//  บทที่ 10: mini-react (React ฉบับย่อ ประมาณ 80 บรรทัด)
//  vnode มี 2 แบบ:
//    1) string        → text node  เช่น 'Hello'
//    2) object        → { type, props, children }
//                       type เป็น 'div' (tag) หรือเป็นฟังก์ชัน (component)
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// ข้อ 1: h(type, props, ...children) → vnode
//   - props ที่เป็น null ให้เปลี่ยนเป็น {}
//   - children: flatten array ที่ซ้อนกัน (ใช้ .flat(Infinity))
//               ตัด null, undefined, true, false ออก (จะได้เขียน cond && <X/> ได้)
//               ตัวเลขให้แปลงเป็น string
//   h('p', null, 'a', [1, [false, 'b']], null)
//     → { type: 'p', props: {}, children: ['a', '1', 'b'] }
// ───────────────────────────────────────────────────────────────
function h(type, props, ...children) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 2: createDom(vnode) → DOM Node
//   - string → document.createTextNode
//   - type เป็นฟังก์ชัน → เรียก type({ ...props, children }) แล้ว createDom ผลที่ได้
//   - type เป็น string → document.createElement(type) แล้วใส่ props ด้วย setProp (ด้านล่าง)
//                        และ append ลูกทุกตัว (ใช้ createDom แบบ recursive)
// ───────────────────────────────────────────────────────────────
function createDom(vnode) {
  throw new Error('TODO');
}

// setProp(el, name, value, oldValue) ใช้ใส่ prop 1 ตัวให้ element
//   - onClick, onInput, …  → addEventListener('click', value)
//                           (ถ้ามี oldValue ให้ removeEventListener ตัวเก่าก่อน ใช้ในข้อ 5)
//   - className            → el.className = value
//   - style (object)       → Object.assign(el.style, value)
//   - value, checked       → el[name] = value   (ต้องตั้งเป็น property ไม่ใช่ attribute)
//   - key                  → ข้ามไป (ไม่ต้องใส่ลง DOM)
//   - อื่นๆ                 → el.setAttribute(name, value)
function setProp(el, name, value, oldValue) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 3: render(vnode, container) แทนเนื้อหาทั้งหมดใน container ด้วย DOM ที่สร้างจาก vnode
// ───────────────────────────────────────────────────────────────
function render(vnode, container) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 4: useState
//   mount() ด้านล่างเขียนไว้ให้แล้ว อ่านให้เข้าใจก่อน
//   ทุกแอปที่ mount จะมี instance = { hooks: [], hookIndex: 0, rerender }
//   ระหว่าง render ตัวแปร currentInstance จะชี้ไปที่แอปที่กำลัง render อยู่
//
//   useState(initial):
//     1) i = currentInstance.hookIndex++   (จำตำแหน่งของ hook ตัวนี้)
//     2) ถ้า hooks[i] ยังไม่มีค่า (ใช้ !(i in hooks)) → hooks[i] = initial
//     3) setState(next): ถ้า next เป็นฟังก์ชัน → next = next(ค่าปัจจุบัน)
//                        ถ้าค่าเหมือนเดิม (Object.is) → ไม่ต้องทำอะไร
//                        ไม่งั้นเก็บค่าใหม่ แล้วเรียก instance.rerender()
//        ⚠️ setState ต้องจำ instance ไว้เอง (เป็น closure) เพราะตอนที่ถูกเรียก currentInstance อาจเป็นแอปอื่นไปแล้ว
//     4) return [hooks[i], setState]
// ───────────────────────────────────────────────────────────────
let currentInstance = null;

function useState(initial) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 5 (ขั้นสูง): patch(parent, dom, oldV, newV) → DOM node ตัวใหม่
//   แก้ DOM เฉพาะส่วนที่เปลี่ยน โดยถือว่า oldV และ newV ถูก resolve แล้ว (ไม่มี component เหลือ มีแต่ tag และ string)
//   - oldV ไม่มี                  → parent.appendChild(createDom(newV))
//   - newV ไม่มี                  → dom.remove()
//   - type ต่างกัน หรือเป็น string ที่ข้อความต่างกัน → dom.replaceWith(createDom(newV))
//   - string ที่เหมือนกัน           → ไม่ต้องทำอะไร
//   - tag เดียวกัน → อัปเดต props (ลบตัวที่หายไป, setProp ตัวที่เปลี่ยน)
//                   แล้ว patch ลูกทีละตำแหน่ง (index): วนจาก max(old.length, new.length)-1 ลงมาถึง 0
//                   (ที่วนถอยหลังเพราะตอนลบลูก index ของตัวที่อยู่ข้างหลังจะไม่เลื่อน)
//   ทำเสร็จแล้วตั้ง ENABLE_PATCH = true
// ───────────────────────────────────────────────────────────────
const ENABLE_PATCH = false;

function patch(parent, dom, oldV, newV) {
  throw new Error('TODO');
}

// ═══════════════ โค้ดข้างล่างเขียนไว้ให้แล้ว (อ่านให้เข้าใจ) ═══════════════

// resolve: เรียก component (ฟังก์ชัน) ทุกตัวจนเหลือแต่ tag และ string
function resolve(vnode) {
  if (typeof vnode === 'string') return vnode;
  if (typeof vnode.type === 'function') {
    return resolve(vnode.type({ ...vnode.props, children: vnode.children }));
  }
  return { ...vnode, children: vnode.children.map(resolve) };
}

// mount(App, container): เริ่มแอป แล้ว render ใหม่ทุกครั้งที่ state เปลี่ยน
function mount(App, container) {
  const instance = { hooks: [], hookIndex: 0, tree: null, rerender };

  function rerender() {
    instance.hookIndex = 0; // ← สำคัญ! เริ่มนับ hook ใหม่จาก 0 ทุกครั้งที่ render
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
