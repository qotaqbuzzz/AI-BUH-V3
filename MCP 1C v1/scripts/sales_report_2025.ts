import "dotenv/config";
import { OneCClient } from "../packages/onec-client/src/index.js";
import { ReportsService } from "../packages/services/src/ReportsService.js";

const baseUrlRaw = process.env.ONEC_BASE_URL!.replace(/\/$/, "");
const baseUrl = baseUrlRaw.includes("/odata/standard.odata")
  ? baseUrlRaw
  : `${baseUrlRaw}/odata/standard.odata`;

const client = new OneCClient({
  baseUrl,
  username: process.env.ONEC_USERNAME!,
  password: process.env.ONEC_PASSWORD!,
  timeoutMs: 120_000,
  maxRetries: 2,
});

const svc = new ReportsService(client);
const result = await svc.getSalesReport("2025-01-01", "2025-12-31");

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

if (!result.rows.length) {
  console.log("НЕТ ДАННЫХ по продажам за 2025 год (0 строк из 1C)");
  process.exit(0);
}

// distinct docs / buyers
const docSet = new Set(result.rows.map(r => r.docGuid));
const docNumberByContractor = new Map<string, Set<string>>();

// by contractor
const byContractor = new Map<string, { amount: number; vatAmount: number; total: number; docs: Set<string> }>();
for (const r of result.rows) {
  const key = r.contractor || "(неизвестно)";
  const g = byContractor.get(key) ?? { amount: 0, vatAmount: 0, total: 0, docs: new Set() };
  g.amount += r.amount;
  g.vatAmount += r.vatAmount;
  g.total += r.total;
  g.docs.add(r.docGuid);
  byContractor.set(key, g);
}

// by month
const byMonth = new Map<string, { amount: number; total: number; docs: Set<string> }>();
for (const r of result.rows) {
  const key = r.date.slice(0, 7);
  const g = byMonth.get(key) ?? { amount: 0, total: 0, docs: new Set() };
  g.amount += r.amount;
  g.total += r.total;
  g.docs.add(r.docGuid);
  byMonth.set(key, g);
}

// by nomenclature with avg price
const byItem = new Map<string, { qty: number; amount: number }>();
for (const r of result.rows) {
  const key = r.item || "(не указано)";
  const g = byItem.get(key) ?? { qty: 0, amount: 0 };
  g.qty += r.qty;
  g.amount += r.amount;
  byItem.set(key, g);
}

console.log("\n=== РЕАЛЬНЫЙ ОТЧЁТ ПО ПРОДАЖАМ 2025 (01.01–31.12) из 1C ===\n");
console.log(`Всего строк            : ${result.rows.length}`);
console.log(`Уникальных документов  : ${docSet.size}`);
console.log(`Уникальных покупателей : ${byContractor.size}`);
console.log(`Сумма без НДС          : ${fmt(result.totals.amount)} KZT`);
console.log(`НДС                    : ${fmt(result.totals.vatAmount)} KZT`);
console.log(`Итого с НДС            : ${fmt(result.totals.total)} KZT`);

console.log("\n--- По контрагентам (нетто, desc) ---");
const sortedC = [...byContractor.entries()].sort((a, b) => b[1].amount - a[1].amount);
for (const [name, v] of sortedC) {
  console.log(`  ${name.padEnd(42)} ${fmt(v.amount).padStart(18)} KZT  (${v.docs.size} док.)`);
}

console.log("\n--- По месяцам (нетто) ---");
const sortedM = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
for (const [m, v] of sortedM) {
  console.log(`  ${m}   нетто: ${fmt(v.amount).padStart(18)} KZT  (${v.docs.size} док.)`);
}
const monthsByAmount = [...byMonth.entries()].sort((a, b) => b[1].amount - a[1].amount);
if (monthsByAmount.length) {
  console.log(`  >> Самый активный: ${monthsByAmount[0]![0]} = ${fmt(monthsByAmount[0]![1].amount)} KZT`);
  console.log(`  >> Самый тихий   : ${monthsByAmount[monthsByAmount.length-1]![0]} = ${fmt(monthsByAmount[monthsByAmount.length-1]![1].amount)} KZT`);
}

console.log("\n--- Топ-12 номенклатура (нетто) + средняя цена ---");
const sortedI = [...byItem.entries()].sort((a, b) => b[1].amount - a[1].amount).slice(0, 12);
for (const [item, v] of sortedI) {
  const avg = v.qty ? v.amount / v.qty : 0;
  console.log(`  ${item.slice(0, 50).padEnd(50)} кол:${String(v.qty.toFixed(1)).padStart(10)}  нетто:${fmt(v.amount).padStart(16)}  ~цена/т:${fmt(avg).padStart(12)}`);
}
