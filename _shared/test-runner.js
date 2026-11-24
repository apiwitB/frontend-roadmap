/* test-runner.js — test framework ขนาดจิ๋วที่ใช้ในทุกแบบฝึกหัดฝั่งเบราว์เซอร์
 *
 * ไฟล์นี้ตั้งใจเขียนให้อ่านง่าย ลองเปิดอ่านดูได้เลย! (บทที่ 11 จะเรียนว่า test framework ทำงานยังไง
 * และไฟล์นี้คือตัวอย่างจริงของ Jest/Vitest ฉบับย่อ)
 *
 * วิธีใช้ในไฟล์แบบฝึกหัด:
 *   <script src="../_shared/test-runner.js"></script>
 *   <script>
 *     test('1 + 1 = 2', () => { expect(1 + 1).toBe(2); });
 *     test('async ได้ด้วย', async () => { expect(await Promise.resolve(5)).toBe(5); });
 *   </script>
 *
 * - ถ้า URL มี ?embed  จะไม่รัน test (ใช้ตอนโหลดหน้าเดียวกันใน iframe เพื่อทดสอบ responsive)
 * - ผลลัพธ์จะถูกเก็บใน localStorage เพื่อให้หน้า index แสดงความคืบหน้า
 */
(function () {
  const params = new URLSearchParams(location.search);
  const EMBED = params.has('embed');
  const tests = [];

  // ---------- API ที่ใช้เขียน test ----------
  window.test = function (name, fn) {
    tests.push({ name, fn });
  };

  class AssertionError extends Error {}

  function fmt(v) {
    if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
    if (v instanceof Element) return `<${v.tagName.toLowerCase()}>`;
    if (typeof v === 'string') return JSON.stringify(v);
    if (Number.isNaN(v)) return 'NaN';
    if (v === undefined) return 'undefined';
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  // เปรียบเทียบแบบลึก (deep equality) — เหมือน toEqual ของ Jest
  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  }

  function makeMatchers(actual, negate) {
    const check = (pass, msg) => {
      if (negate ? pass : !pass) throw new AssertionError((negate ? 'ไม่ควรเป็นแบบนี้: ' : '') + msg);
    };
    return {
      toBe: (e) => check(Object.is(actual, e), `คาดว่า ${fmt(e)} แต่ได้ ${fmt(actual)}`),
      toEqual: (e) => check(deepEqual(actual, e), `คาดว่า ${fmt(e)} แต่ได้ ${fmt(actual)}`),
      toBeTruthy: () => check(!!actual, `คาดว่าเป็นค่า truthy แต่ได้ ${fmt(actual)}`),
      toBeFalsy: () => check(!actual, `คาดว่าเป็นค่า falsy แต่ได้ ${fmt(actual)}`),
      toBeGreaterThan: (n) => check(actual > n, `คาดว่า > ${n} แต่ได้ ${fmt(actual)}`),
      toBeLessThan: (n) => check(actual < n, `คาดว่า < ${n} แต่ได้ ${fmt(actual)}`),
      toBeCloseTo: (n, d = 1) => check(Math.abs(actual - n) <= d, `คาดว่าใกล้ ${n} (±${d}) แต่ได้ ${fmt(actual)}`),
      toContain: (x) =>
        check(actual != null && actual.includes(x), `คาดว่า ${fmt(actual)} มี ${fmt(x)} อยู่`),
      toHaveLength: (n) =>
        check(actual != null && actual.length === n, `คาดว่ายาว ${n} แต่ยาว ${actual == null ? actual : actual.length}`),
      toMatch: (re) => check(re.test(String(actual)), `คาดว่า ${fmt(actual)} ตรงกับ ${re}`),
      toBeInstanceOf: (C) => check(actual instanceof C, `คาดว่าเป็น instance ของ ${C.name}`),
      toThrow: (msgPart) => {
        let threw = false;
        let err;
        try {
          actual();
        } catch (e) {
          threw = true;
          err = e;
        }
        const ok = threw && (!msgPart || String(err && err.message).includes(msgPart));
        check(ok, msgPart ? `คาดว่า throw error ที่มีข้อความ "${msgPart}"` : 'คาดว่าจะ throw error');
      },
    };
  }

  window.expect = function (actual) {
    const m = makeMatchers(actual, false);
    m.not = makeMatchers(actual, true);
    return m;
  };

  // helper: รอจนเงื่อนไขเป็นจริง (ใช้กับ UI ที่ต้องรอ render/fetch)
  window.waitFor = async function (cond, { timeout = 2000, interval = 20 } = {}) {
    const start = Date.now();
    for (;;) {
      try {
        const r = await cond();
        if (r) return r;
      } catch {}
      if (Date.now() - start > timeout) throw new AssertionError('waitFor: หมดเวลารอ');
      await new Promise((r) => setTimeout(r, interval));
    }
  };

  // helper: โหลดหน้าเดิมใน iframe ตามความกว้างที่กำหนด (ใช้ทดสอบ responsive)
  window.loadInFrame = function (width, height = 800) {
    return new Promise((resolve) => {
      const f = document.createElement('iframe');
      f.style.cssText = `position:absolute;left:-10000px;top:0;width:${width}px;height:${height}px;border:0`;
      f.src = location.pathname + '?embed';
      f.onload = () => resolve(f);
      document.body.appendChild(f);
    });
  };

  // ---------- ส่วนรัน test และแสดงผล ----------
  function withTimeout(p, ms) {
    return Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`หมดเวลา (${ms}ms) — มี Promise ที่ไม่ resolve หรือเปล่า?`)), ms)),
    ]);
  }

  async function run() {
    const results = [];
    for (const t of tests) {
      try {
        await withTimeout(Promise.resolve().then(t.fn), 4000);
        results.push({ name: t.name, ok: true });
      } catch (e) {
        const isTodo = e instanceof Error && /TODO|not implemented|ยังไม่ได้ทำ/i.test(e.message);
        results.push({ name: t.name, ok: false, msg: isTodo ? 'ยังไม่ได้ทำ (TODO)' : e.message || String(e) });
        if (!(e instanceof AssertionError) && !isTodo) console.error(`[test] ${t.name}`, e);
      }
    }
    render(results);
    try {
      const passed = results.filter((r) => r.ok).length;
      localStorage.setItem('fr:' + location.pathname, JSON.stringify({ passed, total: results.length, at: Date.now() }));
    } catch {}
  }

  function render(results) {
    const host = document.createElement('test-panel');
    const root = host.attachShadow({ mode: 'open' }); // Shadow DOM: CSS ของหน้าไม่รั่วเข้ามา และ querySelector ของ test มองไม่เห็น
    const passed = results.filter((r) => r.ok).length;
    const all = passed === results.length;
    let open = true;
    try {
      open = localStorage.getItem('fr:panel') !== 'closed';
    } catch {}
    root.innerHTML = `
      <style>
        :host { all: initial; }
        .p { position: fixed; right: 12px; bottom: 12px; z-index: 2147483647; width: min(420px, calc(100vw - 24px));
             max-height: 60vh; display: flex; flex-direction: column; font: 13px/1.45 system-ui, "Noto Sans Thai", sans-serif;
             background: #111827; color: #e5e7eb; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.35); overflow: hidden; }
        .h { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: pointer; user-select: none;
             background: ${all ? '#065f46' : '#7f1d1d'}; font-weight: 600; }
        .h span { margin-left: auto; font-weight: 400; opacity: .8; font-size: 12px; }
        ul { list-style: none; margin: 0; padding: 6px 0; overflow: auto; }
        li { padding: 5px 12px; display: grid; grid-template-columns: 18px 1fr; gap: 6px; }
        .m { grid-column: 2; color: #fca5a5; font-size: 12px; white-space: pre-wrap; word-break: break-word; }
        .closed ul { display: none; }
      </style>
      <div class="p ${open ? '' : 'closed'}">
        <div class="h">${all ? '🎉' : '🧪'} ผ่าน ${passed}/${results.length} ข้อ <span>คลิกเพื่อย่อ/ขยาย</span></div>
        <ul>${results
          .map(
            (r) =>
              `<li><b>${r.ok ? '✅' : '❌'}</b><span>${escape(r.name)}</span>${r.ok ? '' : `<span class="m">${escape(r.msg)}</span>`}</li>`
          )
          .join('')}</ul>
      </div>`;
    root.querySelector('.h').addEventListener('click', () => {
      const p = root.querySelector('.p');
      p.classList.toggle('closed');
      try {
        localStorage.setItem('fr:panel', p.classList.contains('closed') ? 'closed' : 'open');
      } catch {}
    });
    document.documentElement.appendChild(host);
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  if (!EMBED) {
    // รันหลังจากหน้าโหลดครบ (รวม CSS และ script ของผู้เรียน) แล้วรออีกนิดให้ layout นิ่ง
    window.addEventListener('load', async () => {
      try { await document.fonts.ready; } catch {}
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); // รอให้ browser วาดหน้าจอเสร็จ 2 เฟรม
      setTimeout(run, 50);
    });
  }
})();
