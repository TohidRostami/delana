#!/usr/bin/env node
/**
 * انتقال دیتابیس محلی (SQLite) به Turso
 * ------------------------------------------------------------
 * ساختار جدول‌ها (DDL) و همهٔ داده‌ها را از فایل محلی می‌خواند و روی Turso می‌نویسد.
 *
 * استفاده:
 *   npm run db:migrate-turso -- --url=libsql://xxx.turso.io --token=eyJ...
 *
 * یا با متغیرهای محیطی (از .env.local / .env هم خوانده می‌شود):
 *   TURSO_DATABASE_URL=libsql://xxx.turso.io TURSO_AUTH_TOKEN=eyJ... npm run db:migrate-turso
 *
 * گزینه‌ها:
 *   --from=<path>     فایل SQLite مبدأ (پیش‌فرض: DATABASE_URL یا prisma/dev.db)
 *   --url=<url>       آدرس دیتابیس Turso
 *   --token=<token>   توکن دسترسی Turso
 *   --force           اگر روی Turso جدول وجود داشت، جدول‌های هم‌نام را حذف و دوباره بساز
 *   --include-sessions  داده‌ی نشست‌ها و کدهای تأیید (session / verification) را هم منتقل کن
 *                    (خود جدول‌ها همیشه ساخته می‌شوند؛ فقط داده‌شان پیش‌فرض منتقل نمی‌شود)
 *   --missing-only    فقط جدول‌هایی را که روی Turso وجود ندارند بساز؛ به جدول‌های موجود دست نمی‌زند
 *   --dry-run         فقط گزارش بده، چیزی ننویس
 *   --yes             بدون پرسش تأیید اجرا کن
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { existsSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

// ───────────── env ─────────────
for (const f of [".env.local", ".env"]) {
  try {
    if (existsSync(f)) process.loadEnvFile(f);
  } catch {
    /* ignore */
  }
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
const fail = (msg) => {
  console.error(C.red(`✖ ${msg}`));
  process.exit(1);
};

// ───────────── config ─────────────
const rawFrom = args.from || process.env.DATABASE_URL || "file:./prisma/dev.db";
const sourcePath = path.resolve(String(rawFrom).replace(/^file:/, ""));
const tursoUrl = args.url || process.env.TURSO_DATABASE_URL;
const tursoToken = args.token || process.env.TURSO_AUTH_TOKEN;
const force = !!args.force;
const dryRun = !!args["dry-run"];
const missingOnly = !!args["missing-only"];
const skipTables = new Set(["_prisma_migrations"]); // اصلاً منتقل نمی‌شوند
const skipData = new Set(); // جدول ساخته می‌شود ولی داده‌اش کپی نمی‌شود
if (!args["include-sessions"]) {
  skipData.add("session");
  skipData.add("verification");
}

if (!existsSync(sourcePath)) fail(`فایل دیتابیس محلی پیدا نشد: ${sourcePath}`);
if (!tursoUrl) fail("آدرس Turso داده نشده (--url یا TURSO_DATABASE_URL).");
if (!/^(libsql|https?|wss?):\/\//.test(tursoUrl) && !tursoUrl.startsWith("file:"))
  fail("آدرس Turso باید با libsql:// شروع شود.");
if (tursoUrl.startsWith("libsql") && !tursoToken)
  fail("توکن Turso داده نشده (--token یا TURSO_AUTH_TOKEN).");

const quote = (id) => `"${String(id).replace(/"/g, '""')}"`;

// ───────────── source ─────────────
const src = new Database(sourcePath, { readonly: true, fileMustExist: true });
const master = src
  .prepare(
    "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY rowid",
  )
  .all();

const tables = master.filter((m) => m.type === "table" && !skipTables.has(m.name));
const indexes = master.filter((m) => m.type === "index" && !skipTables.has(m.tbl_name));
if (tables.length === 0) fail("هیچ جدولی در دیتابیس محلی پیدا نشد. اول `npm run db:init` و `npm run db:seed` را بزنید.");

// ترتیب ساخت: جدول‌های والد قبل از فرزند (بر اساس FK)
function sortByDependency(list) {
  const names = new Set(list.map((t) => t.name));
  const deps = new Map(
    list.map((t) => [
      t.name,
      new Set(
        src
          .prepare(`PRAGMA foreign_key_list(${quote(t.name)})`)
          .all()
          .map((r) => r.table)
          .filter((n) => names.has(n) && n !== t.name),
      ),
    ]),
  );
  const out = [];
  const done = new Set();
  while (out.length < list.length) {
    const ready = list.filter(
      (t) => !done.has(t.name) && [...deps.get(t.name)].every((d) => done.has(d)),
    );
    if (ready.length === 0) {
      // وابستگی حلقوی؛ بقیه را به همان ترتیب اضافه کن
      for (const t of list) if (!done.has(t.name)) (out.push(t), done.add(t.name));
      break;
    }
    for (const t of ready) (out.push(t), done.add(t.name));
  }
  return out;
}
const ordered = sortByDependency(tables);

const counts = Object.fromEntries(
  ordered.map((t) => [
    t.name,
    skipData.has(t.name) ? 0 : src.prepare(`SELECT COUNT(*) c FROM ${quote(t.name)}`).get().c,
  ]),
);

// ───────────── target ─────────────
const db = createClient({ url: tursoUrl, authToken: tursoToken });
const host = (() => {
  try {
    return new URL(tursoUrl.replace(/^libsql:/, "https:")).host;
  } catch {
    return tursoUrl;
  }
})();

console.log(C.bold("\nانتقال دیتابیس به Turso"));
console.log(`  مبدأ : ${sourcePath}`);
console.log(`  مقصد : ${host}`);
console.log(`  جدول‌ها:`);
for (const t of ordered)
  console.log(
    `    - ${t.name.padEnd(16)} ${skipData.has(t.name) ? "  فقط ساختار" : String(counts[t.name]).padStart(6) + " ردیف"}`,
  );
if (skipData.size)
  console.log(C.dim("  (داده‌ی session و verification کپی نمی‌شود؛ کاربران باید دوباره وارد شوند)"));

// جدول‌های موجود در مقصد
const remoteTables = (
  await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' AND name NOT LIKE 'libsql_%'",
  )
).rows.map((r) => String(r.name));
const clash = remoteTables.filter((n) => ordered.some((t) => t.name === n));

if (remoteTables.length) {
  console.log(
    C.yellow(`\n⚠ در دیتابیس مقصد از قبل ${remoteTables.length} جدول وجود دارد: ${remoteTables.join(", ")}`),
  );
}
if (clash.length && !force && !missingOnly) {
  fail(
    "جدول‌های هم‌نام روی Turso وجود دارند. برای جلوگیری از پاک شدن اطلاعات، اجرا متوقف شد.\n" +
    "  اگر فقط بعضی جدول‌ها کم است، با --missing-only فقط همان‌ها ساخته می‌شوند (بدون حذف چیزی).\n" +
    "  اگر مطمئنید این دیتابیس خالی/قابل بازنویسی است، با --force دوباره اجرا کنید\n" +
    "  (هشدار: --force جدول‌های هم‌نام را حذف می‌کند!).",
  );
}

if (dryRun) {
  console.log(C.green("\n✔ dry-run: چیزی نوشته نشد."));
  process.exit(0);
}

if (!args.yes) {
  if (clash.length) console.log(C.red(`\n⚠ --force: این جدول‌ها روی ${host} حذف می‌شوند: ${clash.join(", ")}`));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = (await rl.question(`\nداده‌ها روی ${C.bold(host)} نوشته شوند؟ (yes/no) `)).trim().toLowerCase();
  rl.close();
  if (ans !== "yes" && ans !== "y") fail("لغو شد.");
}

// ───────────── run ─────────────
const t0 = Date.now();

// در حالت --missing-only فقط جدول‌های ناموجود ساخته می‌شوند
const work = missingOnly ? ordered.filter((t) => !remoteTables.includes(t.name)) : ordered;
const workNames = new Set(work.map((t) => t.name));
if (missingOnly) {
  console.log(
    work.length
      ? `  جدول‌های ناموجود روی Turso: ${work.map((t) => t.name).join(", ")}`
      : C.green("  همهٔ جدول‌ها از قبل وجود دارند؛ کاری لازم نیست."),
  );
}

if (!missingOnly && clash.length) {
  // از فرزند به والد حذف کن
  await db.execute("PRAGMA foreign_keys = OFF");
  const dropOrder = [...ordered].reverse().filter((t) => clash.includes(t.name));
  for (const t of dropOrder) await db.execute(`DROP TABLE IF EXISTS ${quote(t.name)}`);
  console.log(C.dim(`  ${dropOrder.length} جدول قدیمی حذف شد`));
}

// ساخت جدول‌ها
if (work.length) {
  await db.batch(
    work.map((t) => t.sql),
    "write",
  );
}
console.log(C.green(`✔ ${work.length} جدول ساخته شد`));

// داده‌ها
const BATCH_ROWS = 100;
for (const t of work) {
  const total = counts[t.name];
  if (!total) continue;
  const cols = src
    .prepare(`PRAGMA table_info(${quote(t.name)})`)
    .all()
    .map((c) => c.name);
  const insert = `INSERT INTO ${quote(t.name)} (${cols.map(quote).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`;
  const stmt = src.prepare(`SELECT ${cols.map(quote).join(", ")} FROM ${quote(t.name)}`);
  stmt.safeIntegers(true); // اعداد بزرگ (مثل تایم‌استمپ ms) بدون خطا

  let buffer = [];
  let written = 0;
  const flush = async () => {
    if (!buffer.length) return;
    await db.batch(buffer, "write");
    written += buffer.length;
    buffer = [];
  };
  for (const row of stmt.iterate()) {
    const vals = cols.map((c) => {
      const v = row[c];
      if (typeof v === "bigint") {
        return v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v;
      }
      if (Buffer.isBuffer(v)) return new Uint8Array(v);
      return v;
    });
    buffer.push({ sql: insert, args: vals });
    if (buffer.length >= BATCH_ROWS) await flush();
  }
  await flush();
  process.stdout.write(`  ${C.green("✔")} ${t.name.padEnd(16)} ${written}/${total}\n`);
}

// ایندکس‌ها (بعد از درج داده تا سریع‌تر باشد)
const idxWork = indexes.filter((i) => workNames.has(i.tbl_name));
if (idxWork.length) {
  await db.batch(
    idxWork.map((i) => i.sql),
    "write",
  );
  console.log(C.green(`✔ ${idxWork.length} ایندکس ساخته شد`));
}

// ───────────── verify ─────────────
let bad = 0;
for (const t of work) {
  const r = await db.execute(`SELECT COUNT(*) c FROM ${quote(t.name)}`);
  const remote = Number(r.rows[0].c);
  if (remote !== counts[t.name]) {
    bad++;
    console.log(C.red(`  ✖ ${t.name}: محلی ${counts[t.name]} ≠ Turso ${remote}`));
  }
}
const fk = await db.execute("PRAGMA foreign_key_check");
if (fk.rows.length) {
  bad++;
  console.log(C.red(`  ✖ ${fk.rows.length} ردیف با کلید خارجی نامعتبر روی Turso`));
}

src.close();
db.close();

if (bad) fail("تعداد ردیف‌ها یا کلیدهای خارجی مطابقت ندارد؛ خروجی بالا را بررسی کنید.");
console.log(C.green(`\n✔ انتقال با موفقیت انجام شد (${((Date.now() - t0) / 1000).toFixed(1)} ثانیه)`));