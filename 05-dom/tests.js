// test ของบทที่ 05 (ไฟล์นี้โหลดก่อน exercise.js)

// แอบดูว่ามีการติด event listener ที่ <li> หรือปุ่มในลิสต์หรือเปล่า (ถ้ามีแปลว่าไม่ได้ใช้ delegation)
const __listenerTargets = [];
const __origAdd = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, ...rest) {
  __listenerTargets.push({ el: this, type });
  return __origAdd.call(this, type, ...rest);
};

(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const T = () => window.__todoTest;
  // กันหน้ารีเฟรชวนไม่จบตอนที่ผู้เรียนยังไม่ได้ใส่ preventDefault()
  // (listener นี้อยู่ที่ window จึงทำงานหลัง listener ของ form ตอน bubble)
  let submitNotPrevented = false;
  window.addEventListener('submit', (e) => {
    if (!e.defaultPrevented) {
      submitNotPrevented = true;
      e.preventDefault();
    }
  });

  const add = (text) => {
    $('#todo-input').value = text;
    $('#todo-form').requestSubmit(); // จำลองการกด Enter หรือคลิกปุ่ม submit
  };
  const items = () => $$('#todo-list > li');
  const liByText = (t) => items().find((li) => li.querySelector('.text')?.textContent === t);

  test('ข้อ 1: เพิ่ม todo และตัดช่องว่าง', () => {
    T().reset();
    add('  ซื้อนม  ');
    expect(items()).toHaveLength(1);
    expect(items()[0].querySelector('.text')?.textContent).toBe('ซื้อนม');
  });
  test('ข้อ 1: ล้าง input หลังเพิ่ม และไม่รีเฟรชหน้า', () => {
    T().reset();
    add('A');
    expect(submitNotPrevented ? 'ลืม e.preventDefault() หน้าจะรีเฟรช' : 'ok').toBe('ok');
    expect($('#todo-input').value).toBe('');
  });
  test('ข้อ 1: ไม่เพิ่มข้อความว่าง', () => {
    T().reset();
    add('   ');
    add('');
    expect(items()).toHaveLength(0);
  });
  test('ข้อ 2: <li> มี data-id, checkbox.toggle, .text, button.delete', () => {
    T().reset();
    add('X');
    const li = items()[0];
    expect(!!li.dataset.id).toBe(true);
    expect(!!li.querySelector('input[type=checkbox].toggle')).toBe(true);
    expect(!!li.querySelector('button.delete')).toBe(true);
  });
  test('ข้อ 2: ข้อความถูกแสดงเป็นข้อความ ไม่ใช่ HTML (กัน XSS)', () => {
    T().reset();
    add('<img src=x onerror="window.__xss=1"><b>bold</b>');
    expect($('#todo-list img')).toBe(null);
    expect($('#todo-list b')).toBe(null);
    expect(items()[0].querySelector('.text').textContent).toContain('<b>bold</b>');
  });
  test('ข้อ 3: คลิก checkbox → li มี class done', () => {
    T().reset();
    add('A'); add('B');
    liByText('A').querySelector('.toggle').click();
    expect(liByText('A').classList.contains('done')).toBe(true);
    expect(liByText('A').querySelector('.toggle').checked).toBe(true);
    expect(liByText('B').classList.contains('done')).toBe(false);
    liByText('A').querySelector('.toggle').click();
    expect(liByText('A').classList.contains('done')).toBe(false);
  });
  test('ข้อ 4: กดลบแล้วรายการหายไป', () => {
    T().reset();
    add('A'); add('B'); add('C');
    liByText('B').querySelector('.delete').click();
    expect(items().map((li) => li.querySelector('.text').textContent)).toEqual(['A', 'C']);
  });
  test('ข้อ 4: ใช้ event delegation (ไม่ได้ติด listener ที่ li หรือปุ่มในลิสต์)', () => {
    T().reset();
    add('A'); add('B');
    // element ที่อยู่ใน <li> (แม้จะถูกลบออกจาก DOM ไปแล้ว) ยกเว้น input.edit ของข้อ bonus
    const inside = __listenerTargets.filter(
      (x) => x.el instanceof Element && x.el.closest('li.todo') && !x.el.matches('.edit')
    );
    expect(inside.length === 0 ? 'ok' : `มี listener ติดที่ <${inside[0].el.tagName.toLowerCase()}> ${inside.length} ตัว`).toBe('ok');
    expect(__listenerTargets.some((x) => x.el === $('#todo-list'))).toBe(true);
  });
  test('ข้อ 5: นับจำนวนที่ยังไม่เสร็จ (มีรูปเอกพจน์)', () => {
    T().reset();
    expect($('#todo-count').textContent.trim()).toBe('0 items left');
    add('A');
    expect($('#todo-count').textContent.trim()).toBe('1 item left');
    add('B');
    expect($('#todo-count').textContent.trim()).toBe('2 items left');
    liByText('A').querySelector('.toggle').click();
    expect($('#todo-count').textContent.trim()).toBe('1 item left');
  });
  test('ข้อ 6: filter Active / Done / All', () => {
    T().reset();
    add('A'); add('B'); add('C');
    liByText('B').querySelector('.toggle').click();
    $('[data-filter=active]').click();
    expect(items().map((li) => li.querySelector('.text').textContent)).toEqual(['A', 'C']);
    $('[data-filter=done]').click();
    expect(items().map((li) => li.querySelector('.text').textContent)).toEqual(['B']);
    $('[data-filter=all]').click();
    expect(items()).toHaveLength(3);
  });
  test('ข้อ 6: ปุ่ม filter ที่เลือกมี aria-pressed="true"', () => {
    T().reset();
    $('[data-filter=done]').click();
    expect($$('[data-filter]').map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
    $('[data-filter=all]').click();
  });
  test('ข้อ 6: นับ items left จากทั้งหมด ไม่ใช่เฉพาะที่ filter อยู่', () => {
    T().reset();
    add('A'); add('B');
    $('[data-filter=done]').click();
    expect($('#todo-count').textContent.trim()).toBe('2 items left');
    $('[data-filter=all]').click();
  });
  test('ข้อ 7: บันทึกใน localStorage', () => {
    T().reset();
    add('จำฉันไว้');
    const saved = JSON.parse(localStorage.getItem('todos') || '[]');
    expect(saved.map((t) => t.text)).toEqual(['จำฉันไว้']);
  });
  test('ข้อ 7: โหลดกลับมาได้ (จำลองการรีเฟรช)', () => {
    T().reset();
    add('A'); add('B');
    liByText('A').querySelector('.toggle').click();
    $('#todo-list').replaceChildren();
    T().reload();
    expect(items()).toHaveLength(2);
    expect(liByText('A').classList.contains('done')).toBe(true);
  });
  test('ข้อ 7: localStorage พัง → ไม่ crash', () => {
    localStorage.setItem('todos', '{broken');
    T().reload();
    expect(items()).toHaveLength(0);
    T().reset();
  });
  test('ห้าม mutate: addTodo สร้าง array ใหม่', () => {
    T().reset();
    const before = T().state.todos;
    add('A');
    expect(T().state.todos === before).toBe(false);
    T().reset();
  });
})();
