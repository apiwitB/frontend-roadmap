// test ของบทที่ 06
(() => {
  const now = () => performance.now();

  test('ข้อ 1: sleep รอได้จริง', async () => {
    const t = now();
    await sleep(120);
    expect(now() - t).toBeGreaterThan(100);
  });

  test('ข้อ 2: ทายลำดับ event loop', async () => {
    const out = [];
    const log = (x) => out.push(x);
    log('A');
    setTimeout(() => log('B'), 0);
    Promise.resolve().then(() => log('C'));
    queueMicrotask(() => log('D'));
    (async () => { log('E'); await null; log('F'); })();
    log('G');
    await new Promise((r) => setTimeout(r, 10));
    if (eventLoopAnswer.length === 0) throw new Error('TODO');
    expect(eventLoopAnswer).toEqual(out);
  });

  test('ข้อ 3: promiseAll เรียงผลตามลำดับเดิม (ไม่ใช่ลำดับที่เสร็จ)', async () => {
    const delayed = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
    expect(await promiseAll([delayed('a', 60), delayed('b', 10), 'c'])).toEqual(['a', 'b', 'c']);
  });
  test('ข้อ 3: promiseAll ว่าง → []', async () => expect(await promiseAll([])).toEqual([]));
  test('ข้อ 3: promiseAll reject ทันทีที่มีตัวพัง', async () => {
    const t = now();
    let err;
    const boom = Promise.reject(new Error('boom'));
    boom.catch(() => {}); // กัน "Uncaught (in promise)" ใน console ตอนที่ promiseAll ยังไม่ได้เขียน
    try {
      await promiseAll([new Promise((r) => setTimeout(r, 500)), boom]);
    } catch (e) { err = e; }
    expect(err?.message).toBe('boom');
    expect(now() - t).toBeLessThan(200);
  });
  test('ข้อ 3: ไม่ได้ใช้ Promise.all', () => {
    expect(/Promise\.(all|allSettled|any|race)\b/.test(promiseAll.toString())).toBe(false);
  });

  test('ข้อ 4: withTimeout ได้ค่าถ้าเสร็จทัน', async () => {
    expect(await withTimeout(sleep(20).then(() => 'ok'), 200)).toBe('ok');
  });
  test('ข้อ 4: withTimeout reject เมื่อเกินเวลา', async () => {
    let err;
    try { await withTimeout(sleep(300), 50); } catch (e) { err = e; }
    expect(err?.message).toBe('timeout');
  });
  test('ข้อ 4: withTimeout ส่ง error เดิมต่อ', async () => {
    let err;
    const original = Promise.reject(new Error('original'));
    original.catch(() => {});
    try { await withTimeout(original, 200); } catch (e) { err = e; }
    expect(err?.message).toBe('original');
  });

  test('ข้อ 5: retry สำเร็จในครั้งที่ 3', async () => {
    let calls = 0;
    const flaky = async () => { calls++; if (calls < 3) throw new Error('fail ' + calls); return 'yay'; };
    expect(await retry(flaky, 5)).toBe('yay');
    expect(calls).toBe(3);
  });
  test('ข้อ 5: retry เกินจำนวน → throw error ครั้งสุดท้าย', async () => {
    let calls = 0, err;
    try { await retry(async () => { calls++; throw new Error('fail ' + calls); }, 3); } catch (e) { err = e; }
    expect(calls).toBe(3);
    expect(err?.message).toBe('fail 3');
  });

  test('ข้อ 6: getJSON โหลดข้อมูลได้', async () => {
    const users = await getJSON('data/users.json');
    expect(users).toHaveLength(3);
  });
  test('ข้อ 6: getJSON throw เมื่อ 404', async () => {
    let err;
    try { await getJSON('data/not-found.json'); } catch (e) { err = e; }
    expect(err?.message).toBe('HTTP 404');
  });

  test('ข้อ 7: loadUsersWithPosts รวมข้อมูลถูกต้อง', async () => {
    const users = await loadUsersWithPosts();
    expect(users.map((u) => u.posts.length)).toEqual([3, 1, 0]);
    expect(users[1]).toEqual({ id: 2, name: 'Bob', city: 'Chiang Mai', posts: ['Closure คืออะไร'] });
  });
  test('ข้อ 7: โหลด 2 ไฟล์พร้อมกัน (parallel)', async () => {
    const realFetch = window.fetch;
    let active = 0, max = 0;
    window.fetch = async (...args) => {
      active++; max = Math.max(max, active);
      await new Promise((r) => setTimeout(r, 80));
      try { return await realFetch(...args); } finally { active--; }
    };
    try { await loadUsersWithPosts(); } finally { window.fetch = realFetch; }
    expect(max === 2 ? 'ok' : 'โหลดทีละไฟล์อยู่ ลองใช้ Promise.all').toBe('ok');
  });

  test('ข้อ 8: mapLimit ผลลัพธ์ถูกและเรียงลำดับ', async () => {
    const res = await mapLimit([5, 1, 3, 2, 4], 2, async (n) => { await sleep(n * 10); return n * 10; });
    expect(res).toEqual([50, 10, 30, 20, 40]);
  });
  test('ข้อ 8: mapLimit ทำงานพร้อมกันได้ไม่เกิน limit (และใช้ครบ limit)', async () => {
    let active = 0, max = 0;
    await mapLimit([1, 2, 3, 4, 5, 6, 7, 8], 3, async () => {
      active++; max = Math.max(max, active);
      await sleep(30);
      active--;
    });
    expect(max).toBe(3);
  });
  test('ข้อ 8: mapLimit กับ array ว่าง', async () => expect(await mapLimit([], 3, async (x) => x)).toEqual([]));
})();
