# บทที่ 12: TypeScript

> หัวข้อใน roadmap: Type Checkers (TypeScript)

TypeScript คือ JavaScript ที่เพิ่ม **type** เข้ามา ใช้ตรวจโค้ดตอน compile และหายไปหมดตอนรัน
ประโยชน์คือเจอ bug ก่อนที่ผู้ใช้จะเจอ, autocomplete ใน editor แม่นขึ้นมาก และ refactor ได้มั่นใจขึ้น

---

## 1. Type พื้นฐาน
```ts
let name: string = 'Ann';
let age = 30;                 // ไม่ต้องเขียน type เองก็ได้ TS เดาให้ว่าเป็น number (type inference)
let tags: string[] = [];
let pair: [string, number] = ['a', 1];   // tuple
let anything: unknown;        // ✅ ปลอดภัย: ต้องตรวจ type ก่อนถึงจะใช้ได้
let yolo: any;                // ❌ ปิดการตรวจ type ทั้งหมด (พยายามอย่าใช้)

function add(a: number, b: number): number { return a + b; }
const log = (msg: string): void => console.log(msg);
```

## 2. `interface` และ `type`
```ts
interface User {
  id: number;
  name: string;
  email?: string;              // optional: อาจไม่มีก็ได้
  readonly createdAt: Date;    // ห้ามแก้ค่า
}
type Role = 'admin' | 'member' | 'guest';   // union ของ literal type ใช้แทน enum ได้
type Point = { x: number; y: number };
```
ทั้งสองแบบใช้แทนกันได้เกือบทุกกรณี โดยทั่วไป `interface` นิยมใช้กับ object ส่วน `type` นิยมใช้กับ union และ type ที่ซับซ้อน

## 3. Union และ Narrowing
```ts
function format(x: string | number) {
  if (typeof x === 'string') return x.toUpperCase();  // ในบล็อกนี้ TS รู้แล้วว่า x เป็น string
  return x.toFixed(2);                                  // ส่วนตรงนี้ x เป็น number
}
```
**Discriminated union** เป็นรูปแบบที่ใช้บ่อยมาก เช่น state ของ reducer หรือผลลัพธ์ของ API
```ts
type Result =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string };

function view(r: Result) {
  switch (r.status) {
    case 'loading': return '…';
    case 'success': return r.data.join(', ');   // ตรงนี้ TS รู้ว่ามี data
    case 'error': return r.message;
    default: {
      const _exhaustive: never = r;  // ถ้าเพิ่ม status ใหม่แล้วลืมเขียน case ตรงนี้จะ error
      return _exhaustive;
    }
  }
}
```
วิธี narrowing อื่นๆ: `in` (`'data' in r`), `instanceof`, `Array.isArray` และ type guard ที่เขียนเอง `function isUser(x: unknown): x is User`

## 4. Generics: type ที่รับ type เป็น parameter
```ts
function first<T>(arr: T[]): T | undefined { return arr[0]; }
first([1, 2]);      // T = number
first(['a']);       // T = string

interface ApiResponse<T> { data: T; error?: string }
const r: ApiResponse<User[]> = …;

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; }
getProp(user, 'name');   // ได้ type string
getProp(user, 'xxx');    // ❌ error: ไม่มี key นี้
```

## 5. Utility Types ที่มีมาให้
| Type | ผลลัพธ์ |
|---|---|
| `Partial<User>` | ทุก field กลายเป็น optional |
| `Required<User>` | ทุก field กลายเป็น required |
| `Pick<User, 'id' \| 'name'>` | เลือกเฉพาะบาง field |
| `Omit<User, 'id'>` | ตัดบาง field ออก |
| `Record<string, number>` | object ที่ key เป็น string และ value เป็น number |
| `Readonly<T>` | ทุก field เป็น readonly |
| `ReturnType<typeof fn>` | type ของค่าที่ฟังก์ชันคืน |
| `Awaited<Promise<X>>` | X |

`as const` และ `typeof` ช่วยสร้าง type จากค่าที่มีอยู่แล้ว
```ts
const ROLES = ['admin', 'member'] as const;
type Role = (typeof ROLES)[number];   // 'admin' | 'member'
```

## 6. Type ของ DOM
```ts
const input = document.querySelector<HTMLInputElement>('#email');  // ได้ HTMLInputElement | null
input?.value;
button.addEventListener('click', (e: MouseEvent) => { … });
```

## 7. การตั้งค่า
- เปิด `"strict": true` เสมอ เพราะถ้าปิดไว้ ประโยชน์ส่วนใหญ่ของ TS จะหายไป
- `tsc --noEmit` ใช้ตรวจ type อย่างเดียว ส่วนการ build ให้ Vite หรือ esbuild ทำ ซึ่งเร็วกว่าเพราะแค่ลบ type ทิ้งโดยไม่ตรวจ
- **Node 22.18 ขึ้นไป** รันไฟล์ `.ts` ได้โดยตรง (`node file.ts`) เพราะแค่ลบ type ทิ้ง (type stripping) แต่ **ไม่ได้ตรวจ type** จึงยังต้องรัน `tsc` แยก
  และไม่รองรับ syntax ที่ต้องแปลงเป็นโค้ดใหม่ เช่น `enum` หรือ `namespace` (ใช้ union ของ literal แทน)

---

## 🧪 แบบฝึกหัด
```powershell
cd 12-typescript
npm install          # ติดตั้ง TypeScript (ครั้งแรกครั้งเดียว)
npm test             # = tsc --noEmit (ตรวจ type) && node exercise.ts (รันจริง)
```
เปิด [`exercise.ts`](exercise.ts) แล้วเขียน type ตรงที่มี `TODO`

**วิธีที่ test ทำงาน**: ในไฟล์จะมีบรรทัด `// @ts-expect-error` ซึ่งบอก TS ว่า "บรรทัดถัดไปต้อง error"
ถ้า type ที่เขียนหลวมเกินไป (เช่น ใช้ `any`) บรรทัดนั้นจะไม่ error แล้ว `tsc` จะแจ้งว่า
*Unused '@ts-expect-error' directive* ดังนั้นต้องเขียน type ให้ **เข้มพอ** test จึงจะผ่าน

**เคล็ดลับ**: เปิดไฟล์ใน VS Code แล้วเอาเมาส์ชี้ที่ตัวแปรจะเห็น type ที่ TS คำนวณได้ และ error จะแสดงเป็นเส้นแดงทันทีโดยไม่ต้องรันคำสั่ง

## ✅ เช็กความเข้าใจ
- `unknown` กับ `any` ต่างกันยังไง และควรใช้ตัวไหนกับข้อมูลที่ได้จาก `JSON.parse`
- ทำไม discriminated union + `never` ถึงช่วยกันลืมเขียน case
- TypeScript ช่วยตรวจข้อมูลที่ได้จาก API ตอนรันไหม (คำใบ้: ไม่ได้ ถ้าต้องการต้องใช้ zod หรือ valibot)
