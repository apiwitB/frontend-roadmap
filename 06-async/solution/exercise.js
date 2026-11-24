// เฉลยบทที่ 06

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// sync ก่อน: A, E (โค้ดใน async function รันแบบ sync จนเจอ await ตัวแรก), G
// microtask เรียงตามลำดับที่เข้าคิว: C, D, F
// macrotask: B
const eventLoopAnswer = ['A', 'E', 'G', 'C', 'D', 'F', 'B'];

function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);

    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value; // ใส่ตาม index เดิม ไม่ใช้ push เพราะต้องเรียงตามลำดับ ไม่ใช่ตามเวลาที่เสร็จ
        if (--remaining === 0) resolve(results);
      }, reject); // reject ครั้งแรกจะมีผล ครั้งต่อๆ ไปถูกเพิกเฉย เพราะ Promise เปลี่ยนสถานะได้ครั้งเดียว
    });
  });
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)); // ล้าง timer ไม่ให้ค้าง
}

async function retry(fn, times) {
  let lastError;
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return await fn(); // ‼️ ต้องใส่ await ไม่งั้น catch จะจับ error ของ Promise ไม่ได้
    } catch (e) {
      lastError = e;
      // ของจริงมักรอก่อนลองใหม่: await sleep(2 ** attempt * 100)  (exponential backoff)
    }
  }
  throw lastError;
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadUsersWithPosts() {
  const [users, posts] = await Promise.all([getJSON('data/users.json'), getJSON('data/posts.json')]);
  return users.map((u) => ({
    ...u,
    posts: posts.filter((p) => p.userId === u.id).map((p) => p.title),
  }));
}

async function mapLimit(items, limit, asyncFn) {
  const results = new Array(items.length);
  let next = 0; // index ที่ใช้ร่วมกันทุก worker (ไม่มี race condition เพราะ JS มี thread เดียว)

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await asyncFn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}
