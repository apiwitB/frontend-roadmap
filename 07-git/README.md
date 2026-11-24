# บทที่ 07: Version Control (Git)

> หัวข้อใน roadmap: Version Control Systems · Basic Usage of Git · Repo hosting services (GitHub, GitLab)

หลายคนใช้ Git ด้วยการท่องคำสั่ง พอเจอ conflict หรือ detached HEAD ก็ไม่รู้จะแก้ยังไง
บทนี้อธิบายว่า Git เก็บข้อมูลยังไงข้างใน ซึ่งพอเข้าใจแล้วคำสั่งส่วนใหญ่จะเข้าใจได้เอง

---

## 1. Git เก็บอะไร
- **Commit = snapshot** ของไฟล์ทั้งหมด ณ เวลานั้น (ไม่ได้เก็บเป็น diff) พร้อมกับ author, message และ **pointer ไปยัง commit แม่**
- commit ทุกตัวมี hash เช่น `a1b2c3d` ซึ่งคำนวณมาจากเนื้อหา ถ้าเนื้อหาเปลี่ยนแม้นิดเดียว hash ก็จะเปลี่ยน
- commit ต่อกันเป็นกราฟแบบ **DAG** (directed acyclic graph)

```
            C───D        ← feature   (branch เป็นแค่ "ป้ายชื่อ" ที่ชี้ไปยัง commit)
           /
  A───B───E───F          ← main  ← HEAD   (HEAD = ตอนนี้อยู่ที่ไหน)
```
- **Branch** เป็นแค่ไฟล์ขนาด 41 byte ที่เก็บ hash ของ commit ไว้ การสร้าง branch จึงเร็วมาก ลองดูได้ด้วย `cat .git/refs/heads/main`
- **HEAD** ปกติจะชี้ไปที่ branch ถ้าชี้ไปที่ commit โดยตรงจะเรียกว่า *detached HEAD*

## 2. พื้นที่ 3 ส่วน
```
Working directory  ──git add──▶  Staging area (index)  ──git commit──▶  Repository (.git)
       ▲                                                                   │
       └──────────────────────── git restore / checkout ───────────────────┘
```
staging area ช่วยให้เลือกได้ว่าจะเอาไฟล์ไหนเข้า commit นี้ (เช่น แก้ 5 ไฟล์ แต่ commit แค่ 2 ไฟล์ก่อน)

## 3. คำสั่งที่ใช้ทุกวัน
```powershell
git status                      # ใช้บ่อยที่สุด บอกว่าตอนนี้มีอะไรเปลี่ยนบ้าง
git add file.js                 # เพิ่มไฟล์เข้า staging
git add -p                      # เลือกเพิ่มทีละส่วนของไฟล์ (ช่วยให้แต่ละ commit สะอาด)
git commit -m "feat: add login form"
git log --oneline --graph --all # ดูกราฟของ commit ทั้งหมด
git diff                        # ดูสิ่งที่แก้แต่ยังไม่ได้ add
git diff --staged               # ดูสิ่งที่ add แล้วแต่ยังไม่ commit

git switch -c feature/login     # สร้าง branch ใหม่และย้ายไปที่ branch นั้น
git switch main
git merge feature/login

git restore file.js             # ทิ้งสิ่งที่แก้ในไฟล์นี้ (⚠️ กู้คืนไม่ได้)
git restore --staged file.js    # เอาไฟล์ออกจาก staging (สิ่งที่แก้ไว้ยังอยู่)
git commit --amend              # แก้ commit ล่าสุด (ใช้ได้เฉพาะ commit ที่ยังไม่ push)
git stash / git stash pop       # เก็บงานที่ทำค้างไว้ชั่วคราว
git reflog                      # ประวัติว่า HEAD เคยอยู่ที่ไหนบ้าง ใช้กู้ commit ที่เผลอทำหายได้
```

## 4. Merge กับ Rebase
```
merge:   A───B───E───F───M      (สร้าง merge commit M ที่มีแม่ 2 ตัว ประวัติตรงกับที่เกิดขึ้นจริง)
              \         /
               C───D───

rebase:  A───B───E───F───C'───D'  (เอา commit ของเราไปต่อท้ายใหม่ ได้ประวัติเป็นเส้นตรง แต่ hash เปลี่ยน)
```
**กฎสำคัญ: ห้าม rebase commit ที่ push ขึ้นไปแล้วและมีคนอื่นใช้อยู่** เพราะ hash เปลี่ยน ทำให้ประวัติของเพื่อนในทีมไม่ตรงกัน

**Fast-forward**: ถ้า main ไม่มี commit ใหม่เลยตั้งแต่แตก branch ออกไป Git จะแค่ขยับป้าย main ไปข้างหน้า โดยไม่สร้าง merge commit

## 5. Conflict
conflict เกิดเมื่อสอง branch แก้ **บรรทัดเดียวกัน** Git จะเขียน marker ลงในไฟล์ให้ดูแบบนี้
```
<<<<<<< HEAD
const title = 'Welcome';
=======
const title = 'Hello';
>>>>>>> feature/greeting
```
วิธีแก้: เปิดไฟล์ → เลือกหรือรวมโค้ดตามที่ถูกต้อง → **ลบ marker ทั้ง 3 บรรทัดออก** → `git add` → `git commit`
(VS Code มีปุ่ม *Accept Current / Incoming / Both* ให้กดได้)

## 6. Remote และ GitHub Flow
```powershell
git clone <url>
git remote -v
git fetch                 # ดึงข้อมูลจาก remote มา แต่ยังไม่รวมกับงานของเรา
git pull                  # = fetch + merge (หรือ rebase ถ้าตั้งค่าไว้)
git push -u origin feature/login
```
**GitHub Flow** ที่ทีมส่วนใหญ่ใช้
1. แตก branch จาก `main`
2. commit เป็นชิ้นเล็กๆ และเขียน message ให้อ่านรู้เรื่อง
3. push แล้วเปิด **Pull Request**
4. ให้ทีม review และให้ CI รัน test/lint
5. merge เข้า `main` แล้ว deploy

**Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` ทำให้อ่านประวัติง่าย และใช้สร้าง changelog อัตโนมัติได้

## 7. `.gitignore`
```
node_modules/
dist/
.env
*.log
.DS_Store
```
**ห้าม commit `.env`, รหัสผ่าน หรือ API key** ถึงจะลบออกใน commit ถัดไป ข้อมูลก็ยังอยู่ในประวัติของ Git

---

## 🧪 Lab (มี script ตรวจงาน)
```powershell
node 07-git/lab.js setup
```
คำสั่งนี้จะสร้าง repo ฝึกที่ `07-git/playground/` ให้ทำตามโจทย์ต่อไปนี้ **ในโฟลเดอร์ playground**
(`cd 07-git/playground`)

1. สร้างไฟล์ `.gitignore` ที่ ignore `node_modules/` และ `.env` แล้ว commit
2. สร้าง branch `feature/greeting` → แก้บรรทัด `title` ใน `app.js` เป็น `'Hello'` → commit
3. กลับไปที่ `main` → แก้บรรทัดเดียวกันเป็น `'Welcome'` → commit
4. merge `feature/greeting` เข้า `main` → **จะเกิด conflict** → แก้ให้เป็น `'Hello, Welcome'` → commit
5. สร้าง tag `v1.0` ที่ commit ล่าสุด
6. สร้างไฟล์ `.env` ที่มีข้อความ `SECRET=123` (แต่ไฟล์นี้ต้องไม่ถูก commit)

เมื่อเสร็จแล้วตรวจงานด้วย
```powershell
node 07-git/lab.js check
```
ระหว่างทำ ให้รัน `git log --oneline --graph --all` บ่อยๆ เพื่อดูว่ากราฟเปลี่ยนไปยังไง
ถ้าอยากเริ่มใหม่ ให้รัน `node 07-git/lab.js setup` อีกครั้ง (จะลบ playground แล้วสร้างใหม่)

**ฝึกเพิ่ม**: เปิด [learngitbranching.js.org](https://learngitbranching.js.org/) ซึ่งเป็นเกมที่แสดงกราฟ branch ให้เห็นภาพ เหมาะมากสำหรับฝึก rebase

## ✅ เช็กความเข้าใจ
- branch ใน Git คืออะไร (ตอบให้ได้ภายใน 1 ประโยค)
- `git fetch` กับ `git pull` ต่างกันยังไง
- ถ้าเผลอ `git reset --hard` จะกู้ commit กลับมาได้ยังไง (คำใบ้: reflog)
