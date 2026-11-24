# บทที่ 01: Internet ทำงานยังไง

> หัวข้อใน roadmap: How does the internet work? · What is HTTP? · Browsers and how they work · DNS · Domain name · Hosting

Frontend developer หลายคนข้ามบทนี้ แต่ปัญหาจำนวนมากที่เจอตอนทำงานจริงมาจากเรื่องในบทนี้ เช่น CORS error,
ไฟล์ถูก cache จนแก้แล้วไม่เปลี่ยน, cookie ไม่ถูกส่งไป หรือหน้าเว็บโหลดช้า ถ้าเข้าใจบทนี้จะ debug เรื่องพวกนี้ได้เร็วขึ้นมาก

---

## 1. พิมพ์ `https://example.com/about` แล้วกด Enter เกิดอะไรขึ้นบ้าง

```
 ┌─────────┐   1. DNS: example.com = ?        ┌────────────┐
 │ Browser │ ───────────────────────────────▶ │ DNS server │
 │         │ ◀─────────────── 93.184.215.14 ─ └────────────┘
 │         │
 │         │   2. TCP handshake (SYN, SYN-ACK, ACK) ไปที่ port 443
 │         │   3. TLS handshake (แลก certificate, ตกลงกุญแจเข้ารหัส)
 │         │   4. HTTP request:  GET /about HTTP/1.1  Host: example.com
 │         │ ───────────────────────────────▶ ┌────────────┐
 │         │ ◀─────────────────────────────── │ Web server │
 │         │   5. HTTP response: 200 OK + HTML └────────────┘
 │         │
 │         │   6. Parse HTML → เจอ <link>, <script>, <img> → ส่ง request เพิ่ม (ทำซ้ำข้อ 4–5)
 │         │   7. Render: DOM + CSSOM → Render tree → Layout → Paint → Composite
 └─────────┘
```

### 1.1 DNS (Domain Name System)
DNS คือสมุดโทรศัพท์ของอินเทอร์เน็ต ใช้แปลงชื่อโดเมนเป็น IP address

ลำดับการค้นหาคือ cache ของ browser → cache ของ OS → resolver ของ ISP (หรือ 1.1.1.1 / 8.8.8.8) → root server (`.`) → TLD server (`.com`) → authoritative server ของ `example.com`

**ลองเลย** (PowerShell):
```powershell
Resolve-DnsName example.com
Resolve-DnsName google.com -Type MX
```
Record ที่ควรรู้จัก: `A` (IPv4), `AAAA` (IPv6), `CNAME` (ชื่อแฝงที่ชี้ไปอีกชื่อ), `MX` (mail server), `TXT` (ใช้ยืนยันโดเมน)

### 1.2 TCP และ TLS
- **TCP** ทำให้ข้อมูลไปถึงครบและเรียงลำดับถูกต้อง ก่อนส่งข้อมูลต้อง handshake 3 ครั้ง ซึ่งกินเวลา 1 round trip
- **TLS** (ตัว S ใน HTTPS) เข้ารหัสข้อมูลและยืนยันว่า server เป็นตัวจริงด้วย certificate
- เพราะการต่อแต่ละครั้งมีต้นทุน HTTP/1.1 จึงมี keep-alive, HTTP/2 ส่งหลายไฟล์บน connection เดียวได้ (multiplexing)
  และ HTTP/3 ย้ายไปใช้ QUIC บน UDP

### 1.3 HTTP คือข้อความธรรมดา
ตัว HTTP/1.1 เป็นแค่ข้อความ ส่งผ่าน TCP ได้เลย

**Request**
```http
GET /about HTTP/1.1
Host: example.com
Accept: text/html
Cookie: session=abc123

```
**Response**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1256
Cache-Control: max-age=3600

<!doctype html>...
```

**Method** ที่ใช้บ่อย

| Method | ใช้ทำอะไร | Safe? | Idempotent? |
|---|---|---|---|
| GET | อ่านข้อมูล | ✅ | ✅ |
| POST | สร้างข้อมูลหรือสั่งให้ทำงาน | ❌ | ❌ |
| PUT | แทนที่ข้อมูลทั้งก้อน | ❌ | ✅ |
| PATCH | แก้ข้อมูลบางส่วน | ❌ | ❌ |
| DELETE | ลบ | ❌ | ✅ |

*Idempotent* หมายถึงเรียกซ้ำกี่ครั้งผลลัพธ์ก็เหมือนเรียกครั้งเดียว นี่คือเหตุผลที่ browser กล้า retry GET เอง แต่ไม่ retry POST

**Status code**: จำแค่หลักแรกก็พอ
- `2xx` สำเร็จ: `200 OK`, `201 Created`, `204 No Content`
- `3xx` ไปที่อื่น: `301 Moved Permanently`, `302 Found`, `304 Not Modified` (ใช้ cache ที่มีได้เลย)
- `4xx` ฝั่ง client ผิด: `400 Bad Request`, `401 Unauthorized` (ยังไม่ login), `403 Forbidden` (login แล้วแต่ไม่มีสิทธิ์), `404 Not Found`, `405 Method Not Allowed`, `429 Too Many Requests`
- `5xx` ฝั่ง server พัง: `500`, `502 Bad Gateway`, `503 Service Unavailable`

### 1.4 Caching (สาเหตุของอาการ "แก้แล้วทำไมไม่เปลี่ยน")
- `Cache-Control: max-age=60`: ภายใน 60 วินาทีจะใช้ของใน cache โดยไม่ถาม server เลย
- `Cache-Control: no-cache`: เก็บไว้ได้ แต่ต้องถาม server ทุกครั้งก่อนใช้
- `Cache-Control: no-store`: ห้ามเก็บเลย
- **ETag / If-None-Match**: server ส่ง `ETag: "v1"` มากับ response ครั้งถัดไป browser จะถามกลับว่า `If-None-Match: "v1"`
  ถ้าไฟล์ยังไม่เปลี่ยน server ตอบ `304` โดยไม่มี body ช่วยประหยัด bandwidth
- เว็บจริงนิยมตั้งชื่อไฟล์แบบ `app.3f9a1c.js` แล้วตั้ง `max-age` ไว้ยาวเป็นปี เพราะถ้าเนื้อหาเปลี่ยน ชื่อไฟล์ก็เปลี่ยนตาม (บทที่ 08)

### 1.5 Browser render หน้าเว็บยังไง (Critical Rendering Path)
1. **Parse HTML → DOM** (Document Object Model)
2. **Parse CSS → CSSOM**
3. รวมกันเป็น **Render tree** ซึ่งมีแค่สิ่งที่มองเห็น (`display:none` จะไม่อยู่ในนี้)
4. **Layout** (หรือ reflow): คำนวณตำแหน่งและขนาดของทุกกล่อง
5. **Paint**: วาด pixel
6. **Composite**: รวม layer ต่างๆ เข้าด้วยกัน (เช่น `transform` กับ `opacity` ทำงานที่ขั้นนี้ จึง animate ได้ลื่น)

สิ่งสำคัญคือ `<script>` แบบปกติจะ **หยุดการ parse HTML** จนกว่าจะโหลดและรันเสร็จ จึงควรใช้ `defer` หรือ `type="module"`
ส่วน CSS จะ **บล็อกการ render** จนกว่าจะโหลดเสร็จ

### 1.6 Origin และ Same-Origin Policy
Origin ประกอบด้วย `scheme + host + port` เช่น `http://localhost:5500` กับ `http://localhost:3000` นับเป็นคนละ origin
browser ไม่ยอมให้ JS ของ origin หนึ่งอ่าน response จากอีก origin ถ้าอีกฝั่งไม่ได้อนุญาตด้วย header **CORS**
(`Access-Control-Allow-Origin`) และ `file://` ถูกจำกัดหนักที่สุด แบบฝึกหัดทั้งหมดจึงต้องเปิดผ่าน `node serve.js`

### 1.7 Hosting
- **Static hosting** (GitHub Pages, Netlify, Vercel, Cloudflare Pages): เอาไฟล์ HTML/CSS/JS ไปวางบน **CDN** ที่มี server กระจายทั่วโลก
- **Server**: ใช้เมื่อต้องรันโค้ดฝั่ง server (Node, PHP ฯลฯ) บน VPS, container หรือ serverless function

---

## 🧪 แบบฝึกหัด

### Lab A: ส่ง HTTP ด้วยมือ
```powershell
node 01-internet/raw-client.js
```
โปรแกรมนี้เปิด TCP socket แล้วพิมพ์ HTTP request ส่งไปเองทีละบรรทัด ให้ลองอ่านโค้ดแล้วทำต่อ:
1. เปลี่ยน path เป็น `/does-not-exist` แล้วดูว่าได้ status อะไร
2. ลบบรรทัด `Host:` ออกแล้วดูว่า server ตอบว่าอะไร (คำตอบนี้อธิบายว่าทำไม 1 IP ใส่ได้หลายเว็บ)
3. รัน `curl.exe -v https://example.com` แล้วหาว่าบรรทัดไหนเป็น TLS handshake

### Lab B: เขียน HTTP server เอง ✅ มี test
เปิด [`server.js`](server.js) แล้วทำตาม TODO ทั้ง 6 ข้อ จากนั้นรัน
```powershell
node --test 01-internet/
```
ระหว่างทำ ลองรัน server จริงด้วย `node 01-internet/server.js` แล้วเปิด http://localhost:3000
กด F12 → แท็บ **Network** → คลิก request แล้วดู Headers

ข้อ `/cached` ให้ลองรีเฟรชหลายๆ ครั้ง แล้วดูว่า status เปลี่ยนจาก 200 เป็น 304 ตอนไหน

### Lab C: DevTools Network (ไม่มี test)
เปิดเว็บที่ใช้บ่อย กด F12 → Network → ติ๊ก *Disable cache* → รีเฟรช แล้วตอบคำถามเหล่านี้:
- มี request ทั้งหมดกี่ตัว ไฟล์ไหนใหญ่ที่สุด
- คอลัมน์ *Protocol* ขึ้น `h2` หรือ `h3` (คลิกขวาที่หัวตารางเพื่อเปิดคอลัมน์นี้)
- ชี้เมาส์ที่แถบ *Waterfall* แล้วดูว่า DNS, Connect (TCP), SSL (TLS) และ Waiting (TTFB) ใช้เวลาเท่าไร

## ✅ เช็กความเข้าใจ
- 301 กับ 302 ต่างกันยังไง และมีผลกับ SEO อย่างไร
- ทำไม `<script>` ที่ไม่มี `defer` ถึงควรอยู่ท้าย `<body>`
- 401 กับ 403 ต่างกันยังไง
- `http://site.com` กับ `https://site.com` เป็น origin เดียวกันไหม
