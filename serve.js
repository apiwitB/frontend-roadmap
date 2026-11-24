// serve.js — static file server แบบไม่ต้องติดตั้งอะไร (ใช้แค่ Node.js)
// วิธีใช้:  node serve.js        แล้วเปิด http://localhost:5500
//
// ทำไมต้องใช้ server? เพราะถ้าเปิดไฟล์ด้วย file:// เบราว์เซอร์จะบล็อก fetch(),
// ES modules และ Service Worker (เรื่อง security / same-origin policy — เรียนในบทที่ 01 และ 13)

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 5500;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.ts': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = path.join(ROOT, decodeURIComponent(url.pathname));

    // กันการอ่านไฟล์นอกโฟลเดอร์ (path traversal เช่น /../../secret)
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
      fs.readFile(filePath, (err2, data) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`404 Not Found: ${url.pathname}`);
          console.log(`404 ${req.method} ${url.pathname}`);
          return;
        }
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-store', // เวลาเรียน ไม่อยากให้ cache ทำให้งง
        });
        res.end(data);
        console.log(`200 ${req.method} ${url.pathname}`);
      });
    });
  })
  .listen(PORT, () => {
    console.log(`\n  Frontend Roadmap Lab พร้อมแล้ว →  http://localhost:${PORT}\n`);
  });
