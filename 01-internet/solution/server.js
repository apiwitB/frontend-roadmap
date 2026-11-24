// เฉลย server.js   ตรวจเฉลย:  $env:SOLUTION=1; node --test 01-internet/
const http = require('node:http');

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;

    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Hello HTTP</h1><p>ลองเปิด <a href="/api/time">/api/time</a></p>');
      return;
    }

    if (path === '/api/time') {
      if (req.method !== 'GET') {
        res.writeHead(405, { Allow: 'GET' });
        res.end();
        return;
      }
      sendJSON(res, 200, { now: new Date().toISOString() });
      return;
    }

    if (req.method === 'GET' && path === '/old-page') {
      res.writeHead(301, { Location: '/' });
      res.end();
      return;
    }

    if (req.method === 'POST' && path === '/api/echo') {
      const raw = await readBody(req);
      try {
        sendJSON(res, 201, JSON.parse(raw));
      } catch {
        sendJSON(res, 400, { error: 'invalid json' });
      }
      return;
    }

    if (req.method === 'GET' && path === '/cached') {
      const etag = '"v1"';
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, { ETag: etag, 'Cache-Control': 'no-cache' });
        res.end();
        return;
      }
      res.writeHead(200, { ETag: etag, 'Cache-Control': 'no-cache', 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ข้อมูลนี้ cache ได้ แต่ต้องถาม server ก่อนใช้ทุกครั้ง');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports = { createServer, readBody };

if (require.main === module) {
  createServer().listen(3000, () => console.log('Server พร้อม → http://localhost:3000'));
}
