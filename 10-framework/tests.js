// test ของบทที่ 10
(() => {
  const box = () => {
    const d = document.createElement('div');
    d.className = 'test-box';
    document.getElementById('test-area').append(d);
    return d;
  };

  // ── ข้อ 1 ──
  test('ข้อ 1: h สร้าง vnode', () => {
    expect(h('div', { id: 'a' }, 'hi')).toEqual({ type: 'div', props: { id: 'a' }, children: ['hi'] });
  });
  test('ข้อ 1: h ใช้ {} แทน null props, flatten children, ตัด null/false', () => {
    expect(h('p', null, 'a', [1, [false, 'b']], null, true, undefined)).toEqual({ type: 'p', props: {}, children: ['a', '1', 'b'] });
  });
  test('ข้อ 1: h เก็บ vnode ซ้อนกัน', () => {
    const v = h('ul', null, ['x', 'y'].map((t) => h('li', { key: t }, t)));
    expect(v.children).toHaveLength(2);
    expect(v.children[0].type).toBe('li');
  });

  // ── ข้อ 2 ──
  test('ข้อ 2: createDom สร้าง text node', () => {
    const n = createDom('สวัสดี');
    expect(n.nodeType).toBe(Node.TEXT_NODE);
    expect(n.textContent).toBe('สวัสดี');
  });
  test('ข้อ 2: createDom สร้าง element + attribute + className + ลูกซ้อน', () => {
    const el = createDom(h('section', { id: 's1', className: 'box big', 'data-x': '1' }, h('h2', null, 'หัวข้อ'), 'ข้อความ'));
    expect(el.outerHTML).toBe('<section id="s1" class="box big" data-x="1"><h2>หัวข้อ</h2>ข้อความ</section>');
  });
  test('ข้อ 2: createDom ผูก event (onClick → click)', () => {
    let clicked = 0;
    const el = createDom(h('button', { onClick: () => clicked++ }, 'กด'));
    el.click(); el.click();
    expect(clicked).toBe(2);
    expect(el.hasAttribute('onClick') || el.hasAttribute('onclick')).toBe(false);
  });
  test('ข้อ 2: createDom รองรับ style object และ value', () => {
    const el = createDom(h('input', { style: { color: 'red' }, value: 'abc' }));
    expect(el.style.color).toBe('red');
    expect(el.value).toBe('abc');
  });
  test('ข้อ 2: createDom รองรับ component (ฟังก์ชัน) + props + children', () => {
    const Card = ({ title, children }) => h('div', { className: 'card' }, h('b', null, title), ...children);
    const el = createDom(h(Card, { title: 'T' }, 'body'));
    expect(el.outerHTML).toBe('<div class="card"><b>T</b>body</div>');
  });

  // ── ข้อ 3 ──
  test('ข้อ 3: render แทนเนื้อหาเดิมใน container', () => {
    const c = box();
    c.innerHTML = '<p>เก่า</p>';
    render(h('span', null, 'ใหม่'), c);
    expect(c.innerHTML).toBe('<span>ใหม่</span>');
  });

  // ── ข้อ 4 ──
  function Counter() {
    const [n, setN] = useState(0);
    return h('button', { onClick: () => setN(n + 1) }, 'Count: ', n);
  }
  test('ข้อ 4: useState + mount: คลิกแล้วตัวเลขเพิ่ม', () => {
    const c = box();
    mount(Counter, c);
    expect(c.textContent).toBe('Count: 0');
    c.querySelector('button').click();
    c.querySelector('button').click();
    expect(c.textContent).toBe('Count: 2');
  });
  test('ข้อ 4: หลาย state ใน component เดียว', () => {
    function Form() {
      const [a, setA] = useState('x');
      const [b, setB] = useState(10);
      return h('div', null,
        h('button', { id: 'ba', onClick: () => setA(a + 'x') }, a),
        h('button', { id: 'bb', onClick: () => setB(b * 2) }, b));
    }
    const c = box();
    mount(Form, c);
    c.querySelector('#bb').click();
    c.querySelector('#ba').click();
    c.querySelector('#bb').click();
    expect([c.querySelector('#ba').textContent, c.querySelector('#bb').textContent]).toEqual(['xx', '40']);
  });
  test('ข้อ 4: 2 แอปแยก state กัน', () => {
    const c1 = box(), c2 = box();
    mount(Counter, c1);
    mount(Counter, c2);
    c1.querySelector('button').click();
    c1.querySelector('button').click();
    c2.querySelector('button').click();
    expect([c1.textContent, c2.textContent]).toEqual(['Count: 2', 'Count: 1']);
  });
  test('ข้อ 4: functional update setN(n => n + 1)', () => {
    function Double() {
      const [n, setN] = useState(0);
      return h('button', { onClick: () => { setN((x) => x + 1); setN((x) => x + 1); } }, n);
    }
    const c = box();
    mount(Double, c);
    c.querySelector('button').click();
    expect(c.textContent).toBe('2');
  });
  test('ข้อ 4: setState ด้วยค่าเดิม → ไม่ render ใหม่', () => {
    let renders = 0;
    function Same() {
      renders++;
      const [n, setN] = useState(5);
      return h('button', { onClick: () => setN(5) }, n);
    }
    const c = box();
    mount(Same, c);
    c.querySelector('button').click();
    expect(renders).toBe(1);
  });

  // ── ข้อ 5 ──
  test('ข้อ 5: เปิด ENABLE_PATCH แล้ว', () => {
    if (!ENABLE_PATCH) throw new Error('TODO');
  });
  test('ข้อ 5: patch ใช้ DOM node เดิม (input ไม่ถูกสร้างใหม่)', () => {
    if (!ENABLE_PATCH) throw new Error('TODO');
    function Search() {
      const [q, setQ] = useState('');
      return h('div', null, h('input', { value: q, onInput: (e) => setQ(e.target.value) }), h('p', null, 'คุณพิมพ์: ', q));
    }
    const c = box();
    mount(Search, c);
    const input = c.querySelector('input');
    input.focus();
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    expect(c.querySelector('input') === input ? 'ok' : 'input ถูกสร้างใหม่ (focus จะหาย)').toBe('ok');
    expect(document.activeElement === input).toBe(true);
    expect(c.querySelector('p').textContent).toBe('คุณพิมพ์: abc');
  });
  test('ข้อ 5: patch เพิ่ม/ลบ ลูก และเปลี่ยน attribute', () => {
    if (!ENABLE_PATCH) throw new Error('TODO');
    function List() {
      const [items, setItems] = useState(['a']);
      return h('div', null,
        h('ul', { className: items.length > 2 ? 'many' : 'few' }, items.map((t) => h('li', null, t))),
        h('button', { id: 'add', onClick: () => setItems([...items, 'n' + items.length]) }, '+'),
        h('button', { id: 'rm', onClick: () => setItems(items.slice(1)) }, '-'));
    }
    const c = box();
    mount(List, c);
    const ul = c.querySelector('ul');
    c.querySelector('#add').click();
    c.querySelector('#add').click();
    expect([...c.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['a', 'n1', 'n2']);
    expect(ul.className).toBe('many');
    c.querySelector('#rm').click();
    c.querySelector('#rm').click();
    expect([...c.querySelectorAll('li')].map((l) => l.textContent)).toEqual(['n2']);
    expect(c.querySelector('ul') === ul && ul.className === 'few').toBe(true);
  });
  test('ข้อ 5: patch เปลี่ยน event handler ใหม่ (ไม่ใช้ closure เก่า)', () => {
    if (!ENABLE_PATCH) throw new Error('TODO');
    const c = box();
    mount(Counter, c);
    const btn = c.querySelector('button');
    btn.click(); btn.click(); btn.click();
    expect(c.textContent).toBe('Count: 3'); // ถ้าไม่ลบ listener เก่าจะได้เลขเพี้ยน
  });
})();
