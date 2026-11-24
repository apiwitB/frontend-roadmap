# บทที่ 10: Framework (React) แบบสร้างเองก่อนใช้จริง

> หัวข้อใน roadmap: Pick a Framework (React, Vue, Angular, Svelte) · Components · State management · SSR / SSG

ทุกคนสอนการใช้ React แต่น้อยคนที่บอกว่า React แก้ปัญหาอะไร บทนี้จะเริ่มจากปัญหานั้นก่อน
แล้วให้ **เขียน mini React เองประมาณ 80 บรรทัด** หลังจากนั้นการใช้ React จริงจะเข้าใจง่ายขึ้นมาก

---

## 1. ปัญหา: UI ต้องตรงกับ state เสมอ
ในบทที่ 05 เราเขียน `render()` ที่ลบ DOM เดิมทิ้งแล้วสร้างใหม่ทั้งหมด วิธีนี้เข้าใจง่ายแต่มีปัญหา
- **ช้า** เพราะสร้าง DOM ใหม่ทั้งหมดทุกครั้งที่มีอะไรเปลี่ยน แม้จะเปลี่ยนแค่ตัวเดียว
- **สถานะของ DOM หาย** เช่น focus ของ input, ตำแหน่ง cursor และตำแหน่ง scroll

ถ้าเลือกแก้ DOM เฉพาะจุดเอง (imperative) จะเร็วกว่า แต่โค้ดจะซับซ้อนขึ้นเรื่อยๆ และพลาดง่าย

**สิ่งที่ framework ทำให้**: เราเขียนแค่ว่า UI ควร **หน้าตาเป็นแบบไหน** สำหรับ state หนึ่งๆ (declarative)
แล้ว framework จะคำนวณเองว่าต้องแก้ DOM ตรงไหนบ้าง
```
UI = f(state)
```

## 2. Virtual DOM
1. component คืนค่าเป็น **object ธรรมดา** ที่อธิบาย UI (virtual node หรือ vnode) ซึ่งสร้างได้เร็วมาก
   ```js
   { type: 'button', props: { onClick: inc }, children: ['Count: 3'] }
   ```
2. เมื่อ state เปลี่ยน ให้สร้าง vnode tree ชุดใหม่
3. **Diff**: เปรียบเทียบ tree เก่ากับ tree ใหม่ (ขั้นนี้เรียกว่า reconciliation)
4. **Patch**: แก้ DOM จริงเฉพาะส่วนที่ต่างกัน

**JSX** เป็นแค่ไวยากรณ์ที่ build tool แปลงให้เป็นการเรียกฟังก์ชัน
```jsx
<button onClick={inc}>Count: {n}</button>
// ↓ Babel / esbuild แปลงเป็น
h('button', { onClick: inc }, 'Count: ', n)      // ใน React ชื่อ React.createElement / jsx()
```

## 3. Component, Props และ State
```jsx
function Counter({ start }) {                // props: ค่าที่ parent ส่งมาให้ ห้ามแก้
  const [count, setCount] = useState(start); // state: ค่าที่ component นี้เป็นเจ้าของ
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```
- ข้อมูลไหลจาก **บนลงล่าง** ผ่าน props ส่วน event ส่งกลับขึ้นไปผ่าน callback (one-way data flow)
- ถ้า component หลายตัวต้องใช้ state เดียวกัน ให้ **ย้าย state ขึ้นไปไว้ที่ parent ที่ใกล้ที่สุดที่ครอบทั้งสองตัว** (lifting state up)
- `setState` ไม่ได้เปลี่ยนค่าทันที แต่จะ **นัดให้ render ใหม่** และต้องส่งค่าใหม่เข้าไปเสมอ (immutable ตามบทที่ 04)

### Hooks ทำงานยังไง
```js
let hooks = [], index = 0;
function useState(initial) {
  const i = index++;                     // จำตำแหน่งของ hook ตัวนี้ไว้
  if (hooks[i] === undefined) hooks[i] = initial;
  const set = (v) => { hooks[i] = v; rerender(); };
  return [hooks[i], set];
}
// ก่อน render ทุกครั้ง ให้ index = 0
```
นี่คือเหตุผลของ **"Rules of Hooks"** ที่ห้ามเรียก hook ใน `if` หรือ loop เพราะ React ใช้ **ลำดับการเรียก** ในการจับคู่ว่า state ไหนเป็นของ hook ตัวไหน

### Hooks ที่ใช้บ่อย
| Hook | ใช้ทำอะไร |
|---|---|
| `useState` | เก็บ state |
| `useEffect(fn, deps)` | ทำ side effect หลัง render เช่น fetch, subscribe หรือตั้ง timer และ return ฟังก์ชัน cleanup |
| `useRef` | เก็บค่าที่เปลี่ยนแล้ว **ไม่ต้องการให้ render ใหม่** หรือใช้อ้างอิง DOM element |
| `useMemo` / `useCallback` | จำผลการคำนวณหรือฟังก์ชันไว้ (คือ memoize ที่เขียนในบทที่ 04) |
| `useContext` | ส่งค่าลงไปหลายชั้นโดยไม่ต้องส่ง props ต่อกันทุกชั้น |

### `key` ใน list
```jsx
{todos.map((t) => <Todo key={t.id} todo={t} />)}
```
`key` บอก React ว่า item ไหนเป็นตัวเดิม ถ้าใช้ index เป็น key แล้วมีการลบหรือสลับลำดับ React จะจับคู่ผิดตัว
ผลคือ state ของ input จะไปติดกับ item ผิดตัว

## 4. เปรียบเทียบ Framework
| | React | Vue | Svelte | Angular |
|---|---|---|---|---|
| แนวคิด | UI = f(state) + VDOM | reactive + VDOM | **compiler** ไม่มี VDOM | framework ครบชุด + TypeScript |
| ตรวจจับการเปลี่ยนแปลง | เรียก `setState` แล้ว render component ใหม่ | Proxy ติดตามว่าใครใช้ค่าไหน | compiler สร้างโค้ดที่แก้ DOM ตรงๆ | Signals / zone.js |
| ความยาก | ปานกลาง | ง่าย | ง่าย | ยาก |

**Signals** (Solid, Vue, Angular และ Svelte 5) เป็นแนวทางที่หลายตัวกำลังย้ายมาใช้
แทนที่จะ render ทั้ง component ใหม่ ระบบจะติดตามว่าตรงไหนใช้ค่าไหน แล้วแก้เฉพาะตรงนั้น

## 5. SSR, SSG และ CSR
- **CSR** (Client-Side Rendering): ส่ง HTML ที่ว่างเปล่าไปก่อน แล้วให้ JS สร้าง UI ทีหลัง ผลคือหน้าแรกโหลดช้าและ SEO ไม่ดี
- **SSR** (Server-Side Rendering): server สร้าง HTML ให้ทุก request แล้วฝั่ง browser ทำ **hydration** คือผูก event listener เข้ากับ HTML นั้น
- **SSG** (Static Site Generation): สร้าง HTML ไว้ล่วงหน้าตอน build เร็วที่สุด เหมาะกับ blog และเว็บเอกสาร
- framework อย่าง **Next.js** (React) และ **Nuxt** (Vue) ทำทั้ง 3 แบบได้ เลือกเป็นรายหน้า

## 6. State management
- ถ้า state ใช้แค่ใน component เดียว ให้ใช้ `useState` ก็พอ
- ถ้าต้องแชร์ไปหลายที่ ให้ใช้ Context หรือ library เช่น **Zustand** หรือ Redux Toolkit (Redux คือ EventEmitter ในบทที่ 04 รวมกับ reducer)
- ถ้าเป็นข้อมูลที่โหลดจาก server ให้ใช้ **TanStack Query** ซึ่งจัดการ cache, loading และ refetch ให้ (เรื่องที่เขียนเองในบทที่ 06)

---

## 🧪 แบบฝึกหัด A: เขียน mini-react ✅ มี test
เปิด [`exercise.html`](exercise.html) แล้วแก้ [`mini-react.js`](mini-react.js)
1. `h(type, props, ...children)` สร้าง vnode
2. `createDom(vnode)` แปลง vnode เป็น DOM จริง (รองรับ text, attribute, event และ component ที่เป็นฟังก์ชัน)
3. `render(vnode, container)`
4. `useState` + `mount(App, container)` ให้ render ใหม่เมื่อ state เปลี่ยน
5. (ขั้นสูง) `patch` diff แล้วแก้เฉพาะส่วนที่เปลี่ยน เพื่อให้ **input ไม่เสีย focus** ตอนพิมพ์

ข้างล่าง test จะมี demo แอป Counter และ Todo ที่เขียนด้วย mini-react ของเรา

## 🧪 แบบฝึกหัด B: เทียบกับ React จริง
เปิด [`react-demo.html`](react-demo.html) ซึ่งเป็นแอปเดียวกันที่เขียนด้วย React จริง (โหลดจาก CDN)
ลองเทียบโค้ดกับ mini-react ดูว่าเหมือนกันแค่ไหน

ถ้าจะทำโปรเจกต์จริง ให้เริ่มด้วย `npm create vite@latest my-react -- --template react` (ต่อจากบทที่ 08)

## ✅ เช็กความเข้าใจ
- ทำไมถึงห้ามเรียก `useState` ใน `if`
- ทำไมไม่ควรใช้ index ของ array เป็น `key`
- SSR กับ SSG ต่างกันยังไง และ blog ควรเลือกแบบไหน
