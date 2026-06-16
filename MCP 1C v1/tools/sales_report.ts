/**
 * Sales Report — revenue, volumes & receivables
 *
 * Produces:
 *   • Summary totals (revenue excl. VAT, VAT, total with VAT, outstanding receivables)
 *   • Monthly breakdown
 *   • By product: volume (qty), revenue, avg price
 *   • By contractor: revenue sold, paid, outstanding, collection %
 *   • Receivables risk summary (from-sales vs legacy)
 *
 * Output: formatted console table + JSON file saved to current directory.
 *
 * Usage:
 *   npx tsx tools/sales_report.ts [dateFrom] [dateTo] [orgGuid]
 *
 * Examples:
 *   npx tsx tools/sales_report.ts 2026-01-01 2026-12-31
 *   npx tsx tools/sales_report.ts 2026-01-01 2026-05-31
 */

import { writeFileSync } from "fs";
import { OneCClient } from "@aibos/onec-client";
import { ReportsService } from "@aibos/services";
import { loadConfig } from "../apps/mcp/src/config.js";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const dateFrom = args[0] ?? "2026-01-01";
const dateTo   = args[1] ?? new Date().toISOString().slice(0, 10);
const orgGuid  = args[2] as string | undefined;

// ── Init ──────────────────────────────────────────────────────────────────────
const { onec } = loadConfig();
const client   = new OneCClient({ ...onec, timeoutMs: 90_000 });
const svc      = new ReportsService(client);

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number): string =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDec = (n: number, d = 2): string =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });

const pct = (a: number, b: number): string =>
  b === 0 ? "—" : `${((a / b) * 100).toFixed(1)}%`;

const sep = (char = "─", len = 90): string => char.repeat(len);

const col = (s: string | number, w: number, right = false): string => {
  const str = String(s);
  return right ? str.padStart(w) : str.slice(0, w).padEnd(w);
};

// ── Step 1: Fetch sales ───────────────────────────────────────────────────────
console.log(`\nSales Report: ${dateFrom} → ${dateTo}${orgGuid ? `  org: ${orgGuid}` : ""}`);
console.log(sep("═"));

console.log("Loading sales…");
const { rows, totals } = await svc.getSalesReport(dateFrom, dateTo, undefined, orgGuid);
console.log(`  ${rows.length} line rows  |  revenue: ${fmt(totals.amount)} KZT`);

// ── Step 2: Fetch receivables ─────────────────────────────────────────────────
console.log("Loading receivables (acc. 1210, 1251)…");
const debtors = await svc.getAllDebtors(orgGuid);
console.log(`  ${debtors.rows.length} debtor rows  |  total: ${fmt(debtors.total)} KZT`);

// ─────────────────────────────────────────────────────────────────────────────
//  COMPUTE aggregations
// ─────────────────────────────────────────────────────────────────────────────

// Monthly breakdown
const monthly = new Map<string, { amount: number; vat: number; total: number }>();
for (const r of rows) {
  const m = r.date.slice(0, 7); // "YYYY-MM"
  const ex = monthly.get(m) ?? { amount: 0, vat: 0, total: 0 };
  ex.amount += r.amount;
  ex.vat    += r.vatAmount;
  ex.total  += r.total;
  monthly.set(m, ex);
}

// By product
interface ProductAgg {
  qty: number;
  amount: number;
  vatAmount: number;
  total: number;
  lineType: string;
}
const byProduct = new Map<string, ProductAgg>();
for (const r of rows) {
  const ex = byProduct.get(r.item) ?? { qty: 0, amount: 0, vatAmount: 0, total: 0, lineType: r.lineType };
  ex.qty      += r.qty;
  ex.amount   += r.amount;
  ex.vatAmount += r.vatAmount;
  ex.total    += r.total;
  byProduct.set(r.item, ex);
}
const productsSorted = [...byProduct.entries()].sort((a, b) => b[1].amount - a[1].amount);

// By contractor — revenue side
interface ContrAgg {
  revenue: number;
  vatAmount: number;
  total: number;
}
const byContractor = new Map<string, ContrAgg>();
for (const r of rows) {
  const ex = byContractor.get(r.contractor) ?? { revenue: 0, vatAmount: 0, total: 0 };
  ex.revenue   += r.amount;
  ex.vatAmount += r.vatAmount;
  ex.total     += r.total;
  byContractor.set(r.contractor, ex);
}

// Receivables side — build lookup by contractor name
const debtorByName = new Map<string, number>();
for (const d of debtors.rows) {
  const net = d.balanceDr - d.balanceCr;
  if (net > 0) {
    const prev = debtorByName.get(d.contractorName) ?? 0;
    debtorByName.set(d.contractorName, prev + net);
  }
}

// Join: contractors from 2026 sales + their outstanding
const contrSorted = [...byContractor.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
const inSales = new Set(contrSorted.map(([name]) => name));

// Receivables not linked to this period's sales = legacy
const legacyDebtors = [...debtorByName.entries()].filter(([name]) => !inSales.has(name));

// Outstanding for contractors IN sales
const outstandingFromSales = contrSorted.reduce((s, [name]) => {
  return s + (debtorByName.get(name) ?? 0);
}, 0);
const legacyTotal = legacyDebtors.reduce((s, [, v]) => s + v, 0);

// ─────────────────────────────────────────────────────────────────────────────
//  PRINT REPORT
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Summary ────────────────────────────────────────────────────────────────
console.log("\n" + sep("═"));
console.log("  SUMMARY");
console.log(sep("─"));
console.log(`  Revenue (excl. VAT)          ${fmt(totals.amount).padStart(22)} KZT`);
console.log(`  VAT 14%                      ${fmt(totals.vatAmount).padStart(22)} KZT`);
console.log(`  Total with VAT               ${fmt(totals.total).padStart(22)} KZT`);
console.log(sep("─"));
console.log(`  Outstanding receivables      ${fmt(debtors.total).padStart(22)} KZT`);
console.log(`    ↳ Trade (acc. 1210)        ${fmt(debtors.byAccount["1210"] ?? 0).padStart(22)} KZT`);
console.log(`    ↳ Employee advances (1251) ${fmt(debtors.byAccount["1251"] ?? 0).padStart(22)} KZT`);
console.log(sep("═"));

// ── 2. Monthly breakdown ──────────────────────────────────────────────────────
console.log("\n  BY MONTH");
console.log(sep("─"));
console.log(
  `  ${col("Month", 8)} ${col("Revenue (KZT)", 22, true)} ${col("VAT (KZT)", 16, true)} ${col("Total (KZT)", 20, true)} ${col("Share", 7, true)}`,
);
console.log(sep("─"));
for (const [month, v] of [...monthly.entries()].sort()) {
  console.log(
    `  ${col(month, 8)} ${col(fmt(v.amount), 22, true)} ${col(fmt(v.vat), 16, true)} ${col(fmt(v.total), 20, true)} ${col(pct(v.amount, totals.amount), 7, true)}`,
  );
}
console.log(sep("─"));
console.log(
  `  ${col("TOTAL", 8)} ${col(fmt(totals.amount), 22, true)} ${col(fmt(totals.vatAmount), 16, true)} ${col(fmt(totals.total), 20, true)} ${col("100%", 7, true)}`,
);

// ── 3. By product ─────────────────────────────────────────────────────────────
console.log("\n\n  BY PRODUCT — VOLUMES & REVENUE");
console.log(sep("─"));
console.log(
  `  ${col("Product", 40)} ${col("Qty", 12, true)} ${col("Revenue KZT", 20, true)} ${col("Avg Price", 14, true)} ${col("Share", 7, true)}`,
);
console.log(sep("─"));
for (const [item, v] of productsSorted) {
  const avgPrice = v.qty > 0 ? v.amount / v.qty : 0;
  console.log(
    `  ${col(item, 40)} ${col(fmtDec(v.qty, v.qty % 1 === 0 ? 0 : 3), 12, true)} ${col(fmt(v.amount), 20, true)} ${col(fmt(avgPrice), 14, true)} ${col(pct(v.amount, totals.amount), 7, true)}`,
  );
}
console.log(sep("─"));
console.log(
  `  ${col("TOTAL", 40)} ${col("—", 12, true)} ${col(fmt(totals.amount), 20, true)} ${col("—", 14, true)} ${col("100%", 7, true)}`,
);

// ── 4. By contractor — sales vs receivables ───────────────────────────────────
console.log("\n\n  BY CONTRACTOR — SALES vs RECEIVABLES");
console.log(sep("─"));
console.log(
  `  ${col("Contractor", 34)} ${col("Revenue", 18, true)} ${col("Outstanding", 16, true)} ${col("Collected%", 12, true)}`,
);
console.log(sep("─"));
for (const [name, v] of contrSorted) {
  const outstanding = debtorByName.get(name) ?? 0;
  const paid        = v.revenue - outstanding;
  const collectPct  = v.revenue > 0 ? `${Math.min(100, Math.round((paid / v.revenue) * 100))}%` : "—";
  console.log(
    `  ${col(name, 34)} ${col(fmt(v.revenue), 18, true)} ${col(outstanding > 0 ? fmt(outstanding) : "✓ paid", 16, true)} ${col(collectPct, 12, true)}`,
  );
}

// ── 5. Legacy debtors (not in this period's sales) ────────────────────────────
if (legacyDebtors.length) {
  console.log(sep("─"));
  console.log("  Additional debtors (pre-period / not in sales above):");
  for (const [name, amount] of legacyDebtors.sort((a, b) => b[1] - a[1])) {
    console.log(`    ${col(name, 36)} ${col(fmt(amount), 18, true)} KZT`);
  }
}

// ── 6. Receivables risk summary ───────────────────────────────────────────────
console.log("\n\n  RECEIVABLES RISK SUMMARY");
console.log(sep("─"));
console.log(`  From ${dateFrom.slice(0, 4)} sales                ${col(fmt(outstandingFromSales), 22, true)} KZT`);
console.log(`  Legacy / pre-period               ${col(fmt(legacyTotal), 22, true)} KZT`);
console.log(sep("─"));
console.log(`  Total trade receivables (1210)    ${col(fmt(debtors.byAccount["1210"] ?? 0), 22, true)} KZT`);
console.log(`  Employee advances      (1251)     ${col(fmt(debtors.byAccount["1251"] ?? 0), 22, true)} KZT`);
console.log(`  Grand total                       ${col(fmt(debtors.total), 22, true)} KZT`);
console.log(sep("═") + "\n");

// ─────────────────────────────────────────────────────────────────────────────
//  SAVE JSON
// ─────────────────────────────────────────────────────────────────────────────
const output = {
  meta: { dateFrom, dateTo, generatedAt: new Date().toISOString() },
  totals,
  receivables: {
    total: debtors.total,
    byAccount: debtors.byAccount,
    fromCurrentSales: outstandingFromSales,
    legacy: legacyTotal,
    rows: debtors.rows,
  },
  monthly: Object.fromEntries([...monthly.entries()].sort()),
  byProduct: Object.fromEntries(
    productsSorted.map(([item, v]) => [
      item,
      { ...v, avgPrice: v.qty > 0 ? Math.round(v.amount / v.qty) : 0 },
    ]),
  ),
  byContractor: Object.fromEntries(
    contrSorted.map(([name, v]) => {
      const outstanding = debtorByName.get(name) ?? 0;
      return [name, { ...v, outstanding, collected: v.revenue - outstanding }];
    }),
  ),
  salesRows: rows,
};

const outFile = `sales_report_${dateFrom.replace(/-/g, "")}_${dateTo.replace(/-/g, "")}.json`;
writeFileSync(outFile, JSON.stringify(output, null, 2), "utf8");
console.log(`Saved → ${outFile}`);
