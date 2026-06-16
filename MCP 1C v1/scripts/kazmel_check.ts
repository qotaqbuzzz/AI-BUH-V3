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
const fmt = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function check(year: string, from: string, to: string) {
  const res = await svc.getSalesReport(from, to);
  const kaz = res.rows.filter(r => r.contractor.toLowerCase().includes("казмел"));
  console.log(`\n=== Казмел ${year} (${from}–${to}) ===`);
  if (!kaz.length) { console.log("  НЕТ продаж"); return; }
  const net = kaz.reduce((s, r) => s + r.amount, 0);
  const vat = kaz.reduce((s, r) => s + r.vatAmount, 0);
  const total = kaz.reduce((s, r) => s + r.total, 0);
  const docs = new Set(kaz.map(r => r.docGuid));
  console.log(`  Контрагент: ${kaz[0]!.contractor}`);
  console.log(`  Нетто: ${fmt(net)} | НДС: ${fmt(vat)} | С НДС: ${fmt(total)} | докум.: ${docs.size}`);
  console.log("  Товары:");
  const byItem = new Map<string, number>();
  for (const r of kaz) byItem.set(r.item, (byItem.get(r.item) ?? 0) + r.amount);
  for (const [it, a] of [...byItem.entries()].sort((x, y) => y[1] - x[1])) {
    console.log(`    - ${it}: ${fmt(a)}`);
  }
  // rank among all contractors by net
  const byC = new Map<string, number>();
  for (const r of res.rows) byC.set(r.contractor, (byC.get(r.contractor) ?? 0) + r.amount);
  const ranked = [...byC.entries()].sort((a, b) => b[1] - a[1]);
  const rank = ranked.findIndex(([n]) => n.toLowerCase().includes("казмел")) + 1;
  const grand = ranked.reduce((s, [, a]) => s + a, 0);
  console.log(`  Рейтинг по нетто: #${rank} из ${ranked.length} | доля: ${(net / grand * 100).toFixed(1)}%`);
  console.log(`  ТОП-3: ${ranked.slice(0, 3).map(([n, a], i) => `${i + 1}.${n} (${fmt(a)})`).join("  ")}`);
}

await check("2025", "2025-01-01", "2025-12-31");
await check("2026", "2026-01-01", "2026-05-30");
