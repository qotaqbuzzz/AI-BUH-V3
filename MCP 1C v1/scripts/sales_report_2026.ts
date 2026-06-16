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
const result = await svc.getSalesReport("2026-01-01", "2026-05-30");

if (!result.rows.length) {
  console.log("Нет данных по продажам за 2026 год");
  process.exit(0);
}

// Summary by contractor
const byContractor = new Map<string, { amount: number; vatAmount: number; total: number; docs: Set<string> }>();
for (const r of result.rows) {
  const key = r.contractor || "(неизвестно)";
  const g = byContractor.get(key) ?? { amount: 0, vatAmount: 0, total: 0, docs: new Set() };
  g.amount += r.amount;
  g.vatAmount += r.vatAmount;
  g.total += r.total;
  g.docs.add(r.docNumber);
  byContractor.set(key, g);
}

// Summary by nomenclature
const byItem = new Map<string, { qty: number; amount: number }>();
for (const r of result.rows) {
  const key = r.item || "(не указано)";
  const g = byItem.get(key) ?? { qty: 0, amount: 0 };
  g.qty += r.qty;
  g.amount += r.amount;
  byItem.set(key, g);
}

const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

console.log("\n=== ОТЧЁТ ПО ПРОДАЖАМ 2026 (01.01–30.05) ===\n");
console.log(`Всего строк документов : ${result.rows.length}`);
console.log(`Сумма без НДС          : ${fmt(result.totals.amount)} KZT`);
console.log(`НДС                    : ${fmt(result.totals.vatAmount)} KZT`);
console.log(`Итого с НДС            : ${fmt(result.totals.total)} KZT`);

console.log("\n--- По контрагентам ---");
const sorted = [...byContractor.entries()].sort((a, b) => b[1].amount - a[1].amount);
for (const [name, v] of sorted) {
  console.log(`  ${name.padEnd(40)} ${fmt(v.amount).padStart(18)} KZT (${v.docs.size} накл.)`);
}

console.log("\n--- Топ-10 номенклатура ---");
const sortedItems = [...byItem.entries()].sort((a, b) => b[1].amount - a[1].amount).slice(0, 10);
for (const [item, v] of sortedItems) {
  console.log(`  ${item.padEnd(40)} кол: ${String(v.qty).padStart(8)}  сумма: ${fmt(v.amount).padStart(18)} KZT`);
}
