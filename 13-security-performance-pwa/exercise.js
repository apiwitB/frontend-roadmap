// ═══════════════════════════════════════════════════════════════
//  บทที่ 13: Security, Performance & PWA
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// ข้อ 1: escapeHTML(str) แปลงอักขระพิเศษของ HTML ทั้ง 5 ตัว
//   &  →  &amp;     <  →  &lt;     >  →  &gt;     "  →  &quot;     '  →  &#39;
//   ⚠️ ต้องแปลง & ก่อนตัวอื่น (ไม่งั้น &lt; จะกลายเป็น &amp;lt;) หรือแปลงทุกตัวพร้อมกันในรอบเดียว
// ───────────────────────────────────────────────────────────────
function escapeHTML(str) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 2: renderComment(container, { author, text })
//   ต่อท้าย container ด้วย:
//     <article class="comment"><strong>{author}</strong><p>{text}</p></article>
//   ห้ามใช้ innerHTML กับข้อมูลที่ผู้ใช้กรอก
// ───────────────────────────────────────────────────────────────
function renderComment(container, comment) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 3: safeUrl(url) คืน url เดิมถ้าเป็น http:, https: หรือ path แบบ relative
//   ถ้าเป็นอย่างอื่น (เช่น javascript:, data:) → คืน '#'
//   คำใบ้: new URL(url, location.href).protocol  (ระวัง: ' JaVaScRiPt:alert(1)' ก็ต้องถูกจับได้)
// ───────────────────────────────────────────────────────────────
function safeUrl(url) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 4: debounce(fn, ms)
//   คืนฟังก์ชันที่ "รอให้หยุดเรียกครบ ms มิลลิวินาที" แล้วค่อยเรียก fn ครั้งเดียว ด้วย arguments ชุดล่าสุด
//   ต้องส่ง this ต่อด้วย
// ───────────────────────────────────────────────────────────────
function debounce(fn, ms) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 5: throttle(fn, ms)
//   เรียก fn ทันทีในครั้งแรก แล้วหลังจากนั้นภายใน ms มิลลิวินาที ไม่ว่าจะเรียกกี่ครั้งก็ไม่ทำอะไร
//   (เวอร์ชันง่าย: leading only)
// ───────────────────────────────────────────────────────────────
function throttle(fn, ms) {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 7: ลงทะเบียน Service Worker
//   ถ้า browser รองรับ ('serviceWorker' in navigator) → navigator.serviceWorker.register('sw.js')
//   แล้วเขียน install/fetch ใน sw.js
// ───────────────────────────────────────────────────────────────
// TODO


// ─── demo: ช่องค้นหาที่ใช้ debounce (ไม่ต้องแก้) ───
(() => {
  const input = document.getElementById('search');
  const out = document.getElementById('search-log');
  let raw = 0, debounced = 0;
  const update = () => { out.textContent = `พิมพ์ ${raw} ครั้ง → เรียก "API" ${debounced} ครั้ง`; };
  let onSearch = () => { debounced++; update(); };
  try { onSearch = debounce(onSearch, 300); } catch {}
  input.addEventListener('input', () => { raw++; update(); onSearch(); });
})();
