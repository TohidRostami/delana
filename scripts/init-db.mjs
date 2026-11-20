// ساخت جدول‌های SQLite از روی prisma/schema.prisma بدون نیاز به موتور Prisma (schema-engine).
// فقط برای وقتی که `npm run db:push` به‌خاطر دانلود نشدن باینری‌های Prisma کار نمی‌کند
// (مثلاً بسته‌بودن binaries.prisma.sh). روش اصلی همچنان `npm run db:push` است.
//
// استفاده:  npm run db:init            (اگر جدولی وجود داشته باشد، متوقف می‌شود)
//           npm run db:init -- --force (فایل دیتابیس را پاک و از نو می‌سازد)
import "dotenv/config";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(process.cwd() + "/");
const Database = require("better-sqlite3");
const src = fs.readFileSync("prisma/schema.prisma", "utf8").replace(/\/\/.*$/gm, "");
const enums = new Set([...src.matchAll(/^enum\s+(\w+)/gm)].map((m) => m[1]));
const models = [...src.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map((m) => ({ name: m[1], body: m[2] }));
const modelNames = new Set(models.map((m) => m.name));
const T = { String: "TEXT", Int: "INTEGER", Float: "REAL", Boolean: "BOOLEAN", DateTime: "DATETIME", Json: "JSONB", BigInt: "BIGINT" };
const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
if (!url.startsWith("file:")) { console.error("DATABASE_URL باید به فایل SQLite اشاره کند (file:...)"); process.exit(1); }
const file = path.resolve(process.cwd(), url.slice(5));
const force = process.argv.includes("--force");
fs.mkdirSync(path.dirname(file), { recursive: true });
if (force) for (const f of [file, file + "-journal"]) if (fs.existsSync(f)) fs.rmSync(f);
const db = new Database(file);
db.pragma("foreign_keys = ON");
if (db.prepare("select count(*) c from sqlite_master where type='table'").get().c > 0) {
  console.error("دیتابیس از قبل جدول دارد: " + file + "\nبرای ساخت از نو: npm run db:init -- --force");
  process.exit(1);
}
const tableOf = Object.fromEntries(models.map((m) => [m.name, (m.body.match(/^\s*@@map\("(.+?)"\)/m) ?? [])[1] ?? m.name]));
const fieldDb = (model, n) => { const m = models.find((x) => x.name === model); const r = m.body.match(new RegExp("^\\s*" + n + "\\s+.*?@map\\(\"(.+?)\"\\)", "m")); return r ? r[1] : n; };
for (const m of models) {
  const cols = []; let pk = []; const uniques = []; const indexes = []; let table = m.name;
  const fields = []; const fks = [];
  for (const raw of m.body.split("\n")) {
    const line = raw.trim(); if (!line) continue;
    if (line.startsWith("@@")) {
      let r;
      if ((r = line.match(/^@@map\("(.+?)"\)/))) table = r[1];
      else if ((r = line.match(/^@@id\(\[(.+?)\]/))) pk = r[1].split(",").map((s) => s.trim());
      else if ((r = line.match(/^@@unique\(\[(.+?)\]/))) uniques.push(r[1].split(",").map((s) => s.trim()));
      else if ((r = line.match(/^@@index\(\[(.+?)\]/))) indexes.push(r[1].split(",").map((s) => s.trim()));
      continue;
    }
    const f = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)$/); if (!f) continue;
    const [, name, type, list, opt, attrs] = f;
    if (modelNames.has(type) || list) {
      const rel = attrs.match(/@relation\((.*)\)/);
      const fk = rel && rel[1].match(/fields:\s*\[(.+?)\]\s*,\s*references:\s*\[(.+?)\]/);
      if (fk && !list) {
        const od = (rel[1].match(/onDelete:\s*(\w+)/) ?? [])[1] ?? (opt ? "SetNull" : "Restrict");
        const ou = (rel[1].match(/onUpdate:\s*(\w+)/) ?? [])[1] ?? "Cascade";
        const act = { Cascade: "CASCADE", SetNull: "SET NULL", Restrict: "RESTRICT", NoAction: "NO ACTION" };
        fks.push({ cols: fk[1].split(",").map((s) => s.trim()), refs: fk[2].split(",").map((s) => s.trim()), target: type, od: act[od], ou: act[ou] });
      }
      continue; // relation
    }
    fields.push({ name, type, opt: !!opt, attrs });
  }
  const dbn = (n) => { const f = fields.find((x) => x.name === n); const r = f?.attrs.match(/@map\("(.+?)"\)/); return r ? r[1] : n; };
  for (const f of fields) {
    const isEnum = enums.has(f.type);
    let c = `"${dbn(f.name)}" ${isEnum ? "TEXT" : T[f.type]}`;
    if (!f.opt) c += " NOT NULL";
    const d = f.attrs.match(/@default\((.*?)\)(?:\s|$)/);
    if (d) {
      const v = d[1].trim();
      if (v === "now()") c += " DEFAULT CURRENT_TIMESTAMP";
      else if (/^"/.test(v)) c += ` DEFAULT '${v.slice(1, -1)}'`;
      else if (v === "true" || v === "false") c += ` DEFAULT ${v === "true" ? 1 : 0}`;
      else if (/^-?[\d.]+$/.test(v)) c += ` DEFAULT ${v}`;
      else if (isEnum && /^\w+$/.test(v)) c += ` DEFAULT '${v}'`;
    }
    if (/@id\b/.test(f.attrs)) pk = [f.name];
    if (/@unique\b/.test(f.attrs)) uniques.push([f.name]);
    cols.push(c);
  }
  for (const k of fks) {
    cols.push(`FOREIGN KEY (${k.cols.map((c) => `"${dbn(c)}"`).join(", ")}) REFERENCES "${tableOf[k.target]}" (${k.refs.map((c) => `"${fieldDb(k.target, c)}"`).join(", ")}) ON DELETE ${k.od} ON UPDATE ${k.ou}`);
  }
  cols.push(`PRIMARY KEY (${pk.map((p) => `"${dbn(p)}"`).join(", ")})`);
  const ddl = `CREATE TABLE "${table}" (\n  ${cols.join(",\n  ")}\n)`;
  try { db.exec(ddl); } catch (e) { console.error(ddl); throw e; }
  uniques.forEach((u) => db.exec(`CREATE UNIQUE INDEX "${table}_${u.join("_")}_key" ON "${table}"(${u.map((x) => `"${dbn(x)}"`).join(",")})`));
  indexes.forEach((u) => db.exec(`CREATE INDEX "${table}_${u.join("_")}_idx" ON "${table}"(${u.map((x) => `"${dbn(x)}"`).join(",")})`));
}
console.log("created", file, models.length, "tables");
