// ═══════════════════════════════════════════════════════════════
//  บทที่ 12: TypeScript     รัน: npm test  (ในโฟลเดอร์ 12-typescript)
//
//  แทน `any` และใส่ type ตรงที่มี TODO
//  บรรทัด "// @ts-expect-error" คือ test: บรรทัดถัดไป "ต้อง" error
//  ถ้า type ยังหลวมเกินไป tsc จะแจ้งว่า "Unused '@ts-expect-error' directive"
// ═══════════════════════════════════════════════════════════════
import assert from 'node:assert/strict';

// ───────────────────────────────────────────────────────────────
// ข้อ 1: as const + typeof   สร้าง type Role จาก array ROLES
//   ผลที่ต้องได้: Role = 'admin' | 'member' | 'guest'
// ───────────────────────────────────────────────────────────────
const ROLES = ['admin', 'member', 'guest']; // TODO: ทำให้เป็น readonly tuple
type Role = any; // TODO

// ───────────────────────────────────────────────────────────────
// ข้อ 2: interface User
//   id: number, name: string, email: string, role: Role, nickname เป็น optional string
//   createdAt: Date ที่เป็น readonly
// ───────────────────────────────────────────────────────────────
type User = any; // TODO: เปลี่ยนเป็น interface User { ... }

const ann: User = { id: 1, name: 'Ann', email: 'ann@example.com', role: 'admin', createdAt: new Date() };
const bob: User = { id: 2, name: 'Bob', email: 'bob@example.com', role: 'member', nickname: 'B', createdAt: new Date() };

function typeTests2() {
  // ฟังก์ชันนี้ไม่ถูกเรียก มีไว้ให้ tsc ตรวจเท่านั้น
  // @ts-expect-error  role ต้องเป็นค่าใน ROLES เท่านั้น
  const bad1: User = { id: 3, name: 'X', email: 'x@x.com', role: 'superuser', createdAt: new Date() };
  // @ts-expect-error  id ต้องเป็น number
  const bad2: User = { id: '4', name: 'X', email: 'x@x.com', role: 'guest', createdAt: new Date() };
  // @ts-expect-error  ขาด email
  const bad3: User = { id: 5, name: 'X', role: 'guest', createdAt: new Date() };
  // @ts-expect-error  createdAt เป็น readonly
  ann.createdAt = new Date();
}

// ───────────────────────────────────────────────────────────────
// ข้อ 3: ใส่ type ให้ parameter และค่าที่ return
//   displayName คืน nickname ถ้ามี ถ้าไม่มีคืน name
// ───────────────────────────────────────────────────────────────
function displayName(user) { // TODO: ใส่ type
  return user.nickname ?? user.name;
}
function typeTests3() {
  // ฟังก์ชันนี้ไม่ถูกเรียก มีไว้ให้ tsc ตรวจเท่านั้น
  // @ts-expect-error  ต้องรับ User เท่านั้น
  displayName({ name: 'not a user' });
}

// ───────────────────────────────────────────────────────────────
// ข้อ 4: Discriminated union + exhaustive check
//   Shape = { kind: 'circle'; radius: number } | { kind: 'rect'; width: number; height: number }
//   ใน area ให้ใส่ default ที่ใช้ never ตรวจว่าเขียน case ครบ
// ───────────────────────────────────────────────────────────────
type Shape = any; // TODO

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rect':
      return shape.width * shape.height;
    // TODO: default + never
  }
  return 0; // TODO: ลบบรรทัดนี้ (เมื่อทำ exhaustive แล้ว TS จะรู้ว่าไม่มีทางมาถึงบรรทัดนี้)
}
function typeTests4() {
  // ฟังก์ชันนี้ไม่ถูกเรียก มีไว้ให้ tsc ตรวจเท่านั้น
  // @ts-expect-error  ไม่มี shape ชนิด triangle
  area({ kind: 'triangle', base: 2 });
  // @ts-expect-error  circle ต้องมี radius ไม่ใช่ width
  area({ kind: 'circle', width: 2 });
}

// ───────────────────────────────────────────────────────────────
// ข้อ 5: Generics
//   first(arr) คืนตัวแรก (หรือ undefined) โดย type ต้องตามชนิดของ array
//   groupBy(arr, keyFn) → Record<K, T[]>   (K ต้อง extends PropertyKey)
// ───────────────────────────────────────────────────────────────
function first(arr: any[]): any { // TODO: generic
  return arr[0];
}
function typeTests5a() {
  // ฟังก์ชันนี้ไม่ถูกเรียก มีไว้ให้ tsc ตรวจเท่านั้น
  // @ts-expect-error  first ของ number[] ได้ number | undefined จึงเรียก toUpperCase ไม่ได้
  first([1, 2, 3])?.toUpperCase();
  // @ts-expect-error  ผลลัพธ์อาจเป็น undefined ต้องเช็กก่อนใช้
  first(['a']).toUpperCase();
}

function groupBy(arr: any[], keyFn: (item: any) => any): any { // TODO: generic
  const out = {} as any;
  for (const item of arr) (out[keyFn(item)] ??= []).push(item);
  return out;
}
function typeTests5b() {
  // ฟังก์ชันนี้ไม่ถูกเรียก มีไว้ให้ tsc ตรวจเท่านั้น
  const byRole = groupBy([ann, bob], (u) => u.role);
  // @ts-expect-error  key ต้องเป็น Role เท่านั้น ('owner' ไม่ใช่ Role)
  byRole.owner;
}

// ───────────────────────────────────────────────────────────────
// ข้อ 6: Utility types
//   UserPreview = เฉพาะ id กับ name ของ User   (Pick)
//   UserUpdate  = ทุก field ของ User ยกเว้น id และ createdAt และเป็น optional ทั้งหมด (Partial + Omit)
// ───────────────────────────────────────────────────────────────
type UserPreview = any; // TODO
type UserUpdate = any; // TODO

function toPreview(u: User): UserPreview {
  return { id: u.id, name: u.name };
}
function updateUser(u: User, patch: UserUpdate): User {
  return { ...u, ...patch };
}
function typeTests6() {
  // ฟังก์ชันนี้ไม่ถูกเรียก มีไว้ให้ tsc ตรวจเท่านั้น
  // @ts-expect-error  UserPreview ไม่มี email
  toPreview(ann).email;
  // @ts-expect-error  ห้ามแก้ id
  updateUser(ann, { id: 99 });
}

// ───────────────────────────────────────────────────────────────
// ข้อ 7: unknown + narrowing
//   parseAge รับค่าอะไรก็ได้ (เช่นที่ได้มาจาก JSON) แล้วคืน number
//   - number ที่เป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป → คืนค่านั้น
//   - string ของตัวเลข เช่น '42' → 42
//   - กรณีอื่น → throw new Error('invalid age')
//   ห้ามใช้ any และ as
// ───────────────────────────────────────────────────────────────
function parseAge(input: unknown): number {
  throw new Error('TODO');
}

// ───────────────────────────────────────────────────────────────
// ข้อ 8: ApiResult<T>
//   = { ok: true; data: T } | { ok: false; error: string }
//   unwrap คืน data ถ้า ok ไม่งั้น throw new Error(error)
// ───────────────────────────────────────────────────────────────
type ApiResult<T> = any; // TODO

function unwrap<T>(r: ApiResult<T>): T {
  // TODO: narrow ด้วย r.ok
  return r.data;
}
function peek(r: ApiResult<number>) {
  // @ts-expect-error  ต้อง narrow ก่อนถึงจะเข้าถึง data ได้
  return r.data;
}

// ═══════════════ runtime tests (รันด้วย node exercise.ts) ═══════════════
assert.equal(displayName(ann), 'Ann');
assert.equal(displayName(bob), 'B');
assert.equal(Math.round(area({ kind: 'circle', radius: 1 }) * 100), 314);
assert.equal(area({ kind: 'rect', width: 2, height: 3 }), 6);
assert.equal(first([10, 20]), 10);
assert.equal(first([]), undefined);
assert.deepEqual(Object.keys(groupBy([ann, bob], (u) => u.role)), ['admin', 'member']);
assert.deepEqual(toPreview(ann), { id: 1, name: 'Ann' });
assert.equal(updateUser(ann, { name: 'Anna' }).name, 'Anna');
assert.equal(parseAge(30), 30);
assert.equal(parseAge('42'), 42);
assert.throws(() => parseAge(-1));
assert.throws(() => parseAge(1.5));
assert.throws(() => parseAge('abc'));
assert.throws(() => parseAge(null));
assert.throws(() => parseAge({ age: 1 }));
assert.equal(unwrap({ ok: true, data: 'yay' }), 'yay');
assert.throws(() => unwrap({ ok: false, error: 'nope' }), /nope/);
assert.deepEqual([...ROLES], ['admin', 'member', 'guest']);

console.log('🎉 ผ่านทุกข้อ ทั้ง type check และ runtime!');
