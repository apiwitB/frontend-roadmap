// raw-client.js: ส่ง HTTP request ผ่าน TCP socket โดยตรง ไม่ผ่าน fetch() หรือ library ใดๆ
// รัน:  node 01-internet/raw-client.js
//
// จะเห็นว่า HTTP/1.1 เป็นแค่ "ข้อความ" ที่มีรูปแบบตายตัว
// (ใช้ port 80 หรือ HTTP ไม่เข้ารหัส เพื่อให้อ่านข้อความได้ ถ้าเป็น HTTPS ข้อความจะถูก TLS เข้ารหัสทั้งหมด)

const net = require('node:net');

const HOST = 'example.com';
const PATH = '/'; // ลองเปลี่ยนเป็น '/does-not-exist'

const socket = net.connect(80, HOST, () => {
  console.log(`✅ TCP connected to ${HOST}:80 (handshake เสร็จแล้ว)\n`);

  // HTTP request: แต่ละบรรทัดต้องจบด้วย \r\n และปิดท้าย header ด้วยบรรทัดว่าง
  const request =
    `GET ${PATH} HTTP/1.1\r\n` +
    `Host: ${HOST}\r\n` + // ลองลบบรรทัดนี้ดู
    `User-Agent: raw-client-lab\r\n` +
    `Accept: text/html\r\n` +
    `Connection: close\r\n` + // ให้ server ปิด connection หลังตอบเสร็จ
    `\r\n`;

  console.log('──── ส่ง request ────');
  console.log(request.replace(/\r\n/g, '⏎\n'));
  socket.write(request);
});

let response = '';
socket.on('data', (chunk) => (response += chunk.toString()));
socket.on('end', () => {
  const [head, ...body] = response.split('\r\n\r\n');
  console.log('──── ได้ response header ────');
  console.log(head);
  console.log('\n──── body (300 ตัวอักษรแรก) ────');
  console.log(body.join('\r\n\r\n').slice(0, 300) + '…');
});
socket.on('error', (e) => console.error('❌ เชื่อมต่อไม่ได้:', e.message));
