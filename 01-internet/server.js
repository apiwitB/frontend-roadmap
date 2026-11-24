// server.js: เขียน HTTP server ด้วย node:http (ไม่ใช้ Express เพื่อให้เห็นสิ่งที่ framework ซ่อนไว้)
//
// รัน server จริง:   node 01-internet/server.js   → http://localhost:3000
// ตรวจคำตอบ:        node --test 01-internet/
//
// ทำ TODO ให้ครบทั้ง 6 ข้อ (ข้อ 1 เป็นตัวอย่างที่ทำให้แล้ว)

const http = require('node:http');

function createServer() {
  return http.createServer(async (req, res) => {
    // req.method เช่น 'GET', req.url เช่น '/api/time?x=1', req.headers เป็น object ที่ key เป็นตัวพิมพ์เล็กทั้งหมด
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    // ── ข้อ 1 (ตัวอย่าง) ── GET /  ตอบ HTML
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Hello HTTP</h1><p>ลองเปิด <a href="/api/time">/api/time</a></p>');
      return;
    }

    // ── ข้อ 2 ── /api/time
    //   GET  → 200, Content-Type: application/json
    //          body คือ JSON  { "now": "<เวลาปัจจุบันแบบ ISO เช่น new Date().toISOString()>" }
    //   method อื่น (เช่น DELETE) → 405 Method Not Allowed พร้อม header  Allow: GET
    // TODO

    // ── ข้อ 3 ── GET /old-page → redirect ถาวร (301) ไปที่ "/"
    //   (redirect ใช้ header "Location")
    // TODO

    // ── ข้อ 4 ── POST /api/echo
    //   อ่าน body ที่ client ส่งมา (เป็น JSON) แล้วตอบกลับเหมือนเดิมด้วย status 201
    //   ถ้า JSON ผิดรูปแบบ → 400 และ body เป็น JSON { "error": "invalid json" }
    //   คำใบ้: body มาเป็น stream แบบทีละ chunk ใช้ฟังก์ชัน readBody(req) ด้านล่างได้เลย
    // TODO

    // ── ข้อ 5 ── GET /cached → ทดลองเรื่อง cache ด้วย ETag
    //   ตอบ 200 พร้อม header  Cache-Control: no-cache   และ   ETag: "v1"
    //   body เป็นข้อความอะไรก็ได้
    //   แต่ถ้า request มี header  if-none-match  เป็น "v1" (รวมเครื่องหมาย " ด้วย)
    //   → ตอบ 304 โดยไม่มี body
    // TODO

    // ── ข้อ 6 ── path อื่นทั้งหมด → 404, Content-Type: text/plain, body = "Not Found"
    // TODO  (ตอนนี้ยังตอบ 501 อยู่ ให้แก้)
    res.writeHead(501);
    res.end('TODO');
  });
}

// อ่าน body ทั้งหมดจาก request stream แล้วคืนเป็น string
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports = { createServer, readBody };

// ถ้ารันไฟล์นี้ตรงๆ (ไม่ได้ถูก require จาก test) ให้เปิด server ที่ port 3000
if (require.main === module) {
  createServer().listen(3000, () => console.log('Server พร้อม → http://localhost:3000'));
}
