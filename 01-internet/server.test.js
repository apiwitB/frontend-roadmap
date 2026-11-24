// test ของ server.js (ไม่ต้องแก้ไฟล์นี้)   รัน: node --test 01-internet/
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require(process.env.SOLUTION ? './solution/server.js' : './server.js');

let server, base;
before(async () => {
  server = createServer();
  await new Promise((r) => server.listen(0, r)); // port 0 = ให้ OS เลือก port ว่างให้
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

test('ข้อ 1: GET / ตอบ HTML', async () => {
  const r = await fetch(base + '/');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
});

test('ข้อ 2: GET /api/time ตอบ JSON ที่มี now เป็นเวลา ISO', async () => {
  const r = await fetch(base + '/api/time');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type') || '', /application\/json/);
  const body = await r.json();
  assert.ok(body.now, 'ต้องมี field "now"');
  assert.ok(Math.abs(Date.parse(body.now) - Date.now()) < 5000, '"now" ต้องเป็นเวลาปัจจุบันแบบ ISO');
});

test('ข้อ 2: DELETE /api/time → 405 + header Allow: GET', async () => {
  const r = await fetch(base + '/api/time', { method: 'DELETE' });
  assert.equal(r.status, 405);
  assert.equal(r.headers.get('allow'), 'GET');
});

test('ข้อ 3: GET /old-page → 301 ไป /', async () => {
  const r = await fetch(base + '/old-page', { redirect: 'manual' }); // ไม่ให้ fetch ตาม redirect เอง
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), '/');
});

test('ข้อ 4: POST /api/echo ส่ง JSON กลับด้วย 201', async () => {
  const payload = { name: 'สมชาย', tags: ['a', 'b'] };
  const r = await fetch(base + '/api/echo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(r.status, 201);
  assert.match(r.headers.get('content-type') || '', /application\/json/);
  assert.deepEqual(await r.json(), payload);
});

test('ข้อ 4: POST /api/echo ที่ JSON พัง → 400', async () => {
  const r = await fetch(base + '/api/echo', { method: 'POST', body: '{not json' });
  assert.equal(r.status, 400);
  assert.deepEqual(await r.json(), { error: 'invalid json' });
});

test('ข้อ 5: GET /cached ส่ง ETag และ Cache-Control', async () => {
  const r = await fetch(base + '/cached');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('etag'), '"v1"');
  assert.equal(r.headers.get('cache-control'), 'no-cache');
});

test('ข้อ 5: GET /cached พร้อม If-None-Match → 304 และไม่มี body', async () => {
  const r = await fetch(base + '/cached', { headers: { 'If-None-Match': '"v1"' } });
  assert.equal(r.status, 304);
  assert.equal(await r.text(), '');
});

test('ข้อ 6: path ที่ไม่มี → 404 Not Found', async () => {
  const r = await fetch(base + '/nope');
  assert.equal(r.status, 404);
  assert.match(r.headers.get('content-type') || '', /text\/plain/);
  assert.equal(await r.text(), 'Not Found');
});
