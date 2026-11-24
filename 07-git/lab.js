// lab.js: สร้าง repo สำหรับฝึก และตรวจงาน Git lab
//   node 07-git/lab.js setup   → สร้าง 07-git/playground/ ใหม่
//   node 07-git/lab.js check   → ตรวจงาน

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, 'playground');
const git = (cmd, opts = {}) =>
  execSync(`git ${cmd}`, { cwd: DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
const tryGit = (cmd) => {
  try {
    return { ok: true, out: git(cmd) };
  } catch (e) {
    return { ok: false, out: String(e.stderr || e.message) };
  }
};

function setup() {
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.mkdirSync(DIR, { recursive: true });
  git('init -b main');
  // ตั้งชื่อเฉพาะ repo นี้ (ไม่แตะ config หลักของเครื่อง)
  git('config user.name "Git Learner"');
  git('config user.email "learner@example.com"');
  git('config core.autocrlf false');

  fs.writeFileSync(
    path.join(DIR, 'app.js'),
    [
      "// แอปตัวอย่างสำหรับฝึก Git",
      "const title = 'Hi';",
      '',
      'function render() {',
      '  document.body.textContent = title;',
      '}',
      '',
      'render();',
      '',
    ].join('\n')
  );
  fs.writeFileSync(path.join(DIR, 'README.md'), '# Git Playground\n\nโจทย์อยู่ใน 07-git/README.md\n');
  git('add .');
  git('commit -m "chore: initial commit"');

  console.log(`
✅ สร้าง repo ฝึกแล้วที่: ${DIR}

ต่อไป:
  cd 07-git/playground
  git log --oneline --graph --all

ทำโจทย์ 6 ข้อใน 07-git/README.md แล้วตรวจด้วย:
  node 07-git/lab.js check     (รันจากโฟลเดอร์ frontend-roadmap)
  node ../lab.js check         (หรือรันจากใน playground)
`);
}

function check() {
  if (!fs.existsSync(path.join(DIR, '.git'))) {
    console.log('❌ ยังไม่มี playground ให้รัน  node 07-git/lab.js setup  ก่อน');
    process.exit(1);
  }

  const results = [];
  const item = (name, fn, hint) => {
    let ok = false;
    try {
      ok = !!fn();
    } catch {}
    results.push({ name, ok, hint });
  };

  const tracked = () => git('ls-files').split('\n');

  item(
    '1. มี .gitignore ที่ ignore node_modules/ และ .env และ commit แล้ว',
    () => {
      const content = git('show main:.gitignore');
      return /node_modules/.test(content) && /^\.env$/m.test(content);
    },
    'สร้างไฟล์ .gitignore → git add .gitignore → git commit'
  );
  item('2. มี branch feature/greeting', () => tryGit('rev-parse --verify feature/greeting').ok, 'git switch -c feature/greeting');
  item(
    '2. ใน feature/greeting ได้แก้ title เป็น Hello',
    () => /'Hello'/.test(git('show feature/greeting:app.js')),
    "แก้ app.js ใน branch feature/greeting ให้เป็น const title = 'Hello'; แล้ว commit"
  );
  item(
    '3. ใน main มี commit ที่แก้ title เป็น Welcome',
    () => git('log main --format=%H -- app.js').split('\n').some((h) => /'Welcome'/.test(git(`show ${h}:app.js`))),
    "git switch main → แก้เป็น const title = 'Welcome'; → commit"
  );
  item(
    '4. merge feature/greeting เข้า main แล้ว (มี merge commit)',
    () => tryGit('merge-base --is-ancestor feature/greeting main').ok && git('rev-list --merges main').length > 0,
    'อยู่ที่ main แล้วรัน git merge feature/greeting'
  );
  item(
    "4. แก้ conflict แล้ว: title เป็น 'Hello, Welcome'",
    () => /const title = 'Hello, Welcome';/.test(git('show main:app.js')),
    "เปิด app.js ให้บรรทัดนั้นเป็น const title = 'Hello, Welcome';"
  );
  item(
    '4. ไม่เหลือ conflict marker (<<<<<<< ======= >>>>>>>)',
    () => !/^(<{7}|={7}|>{7})/m.test(git('show main:app.js')),
    'ลบบรรทัด <<<<<<<, ======= และ >>>>>>> ออกให้หมด'
  );
  item(
    '5. มี tag v1.0 ที่ชี้ไปยัง commit ล่าสุดของ main',
    () => git('rev-list -n 1 v1.0') === git('rev-parse main'), // (ไม่ใช้ v1.0^{commit} เพราะ ^ เป็นตัว escape ของ cmd.exe)
    'git tag v1.0   (ถ้าเคยสร้างผิดที่: git tag -d v1.0 แล้วสร้างใหม่)'
  );
  item(
    '6. มีไฟล์ .env แต่ไม่ถูก track',
    () => fs.existsSync(path.join(DIR, '.env')) && !tracked().includes('.env') && tryGit('check-ignore .env').ok,
    'สร้างไฟล์ .env (SECRET=123) ซึ่งต้องถูก .gitignore กันไว้'
  );
  item(
    '6. ไม่เคย commit .env เลยในประวัติ',
    () => git('log --all --format=%H -- .env') === '',
    'ถ้าเผลอ commit ไปแล้ว ให้ setup ใหม่ (ใน repo จริงต้องใช้ git filter-repo และเปลี่ยน secret ทันที)'
  );
  item('อยู่ที่ branch main', () => git('branch --show-current') === 'main', 'git switch main');
  item('working tree สะอาด (commit ครบแล้ว)', () => git('status --porcelain') === '', 'git status ดูว่ามีอะไรค้างอยู่');

  console.log('\n📋 ผลตรวจ Git Lab\n');
  results.forEach((r) => {
    console.log(`${r.ok ? '✅' : '❌'} ${r.name}`);
    if (!r.ok) console.log(`     💡 ${r.hint}`);
  });
  const passed = results.filter((r) => r.ok).length;
  console.log(`\nผ่าน ${passed}/${results.length}${passed === results.length ? ' 🎉 เก่งมาก!' : ''}\n`);
  console.log(git('log --oneline --graph --all --decorate'));
  process.exitCode = passed === results.length ? 0 : 1;
}

const cmd = process.argv[2];
if (cmd === 'setup') setup();
else if (cmd === 'check') check();
else console.log('ใช้:  node 07-git/lab.js setup   หรือ   node 07-git/lab.js check');
