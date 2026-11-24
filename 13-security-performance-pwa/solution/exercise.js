// เฉลยบทที่ 13 (copy ไปแทน exercise.js และ copy solution/sw.js ไปแทน sw.js เพื่อดูว่าผ่าน test)

function escapeHTML(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, (c) => map[c]); // แปลงทุกตัวในรอบเดียว จึงไม่มีปัญหา & ถูกแปลงซ้ำ
}

function renderComment(container, comment) {
  const article = document.createElement('article');
  article.className = 'comment';
  const author = document.createElement('strong');
  author.textContent = comment.author; // textContent ไม่ parse HTML
  const text = document.createElement('p');
  text.textContent = comment.text;
  article.append(author, text);
  container.append(article);
}

function safeUrl(url) {
  try {
    const { protocol } = new URL(url, location.href); // URL parser ตัด space และทำให้ protocol เป็นตัวพิมพ์เล็กให้แล้ว
    return protocol === 'http:' || protocol === 'https:' ? url : '#';
  } catch {
    return '#';
  }
}

function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer); // เรียกใหม่ก่อนครบเวลา → ยกเลิกตัวเก่าแล้วเริ่มนับใหม่
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function throttle(fn, ms) {
  let last = -Infinity;
  return function (...args) {
    const now = performance.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((e) => console.error('SW register failed', e));
}

(() => {
  const input = document.getElementById('search');
  const out = document.getElementById('search-log');
  let raw = 0, debounced = 0;
  const update = () => { out.textContent = `พิมพ์ ${raw} ครั้ง → เรียก "API" ${debounced} ครั้ง`; };
  const onSearch = debounce(() => { debounced++; update(); }, 300);
  input.addEventListener('input', () => { raw++; update(); onSearch(); });
})();
