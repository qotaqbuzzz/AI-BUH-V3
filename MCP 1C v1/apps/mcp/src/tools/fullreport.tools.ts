import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import type { ReportsService, OSVRow, SettlementRow, CreditorDetailRow } from "@aibos/services";
import type { CatalogService } from "@aibos/services";
import type { AccountsService } from "@aibos/kz-accounts";
import { wrapError } from "./utils.js";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, dec = 0): string {
  const v = Number(n ?? 0);
  if (!isFinite(v)) return "—";
  return v.toLocaleString("ru-RU", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

type OsvMap = Map<string, OSVRow>;

function buildOsvMap(rows: OSVRow[]): OsvMap {
  return new Map(rows.map(r => [r.accountCode, r]));
}

function dr(acc: OsvMap, code: string): number  { return acc.get(code)?.closingDr ?? 0; }
function cr(acc: OsvMap, code: string): number  { return acc.get(code)?.closingCr ?? 0; }
function oc(acc: OsvMap, code: string): number  { return acc.get(code)?.openingCr ?? 0; }
function td(acc: OsvMap, code: string): number  { return acc.get(code)?.turnoverDr ?? 0; }
function tc(acc: OsvMap, code: string): number  { return acc.get(code)?.turnoverCr ?? 0; }

const MONTH_RU: Record<string, string> = {
  "01": "Январь", "02": "Февраль", "03": "Март", "04": "Апрель",
  "05": "Май",    "06": "Июнь",    "07": "Июль", "08": "Август",
  "09": "Сентябрь","10": "Октябрь","11": "Ноябрь","12": "Декабрь",
};

// ── industry detection ────────────────────────────────────────────────────────

type Industry = "agro" | "manufacturing" | "trade" | "services" | "construction" | "transport" | "universal";

interface IndustryFlags {
  label: string;
  showBio: boolean;
  showWip: boolean;
  showGoodsMargin: boolean;
  showServices: boolean;
}

const AGRO_KEYWORDS = /зерн|пшениц|ячмень|семен|лён|лен|чечевиц|овёс|овес|рапс|подсолн|урожай|скот|крс|мясо|молоко|сено|фураж|зернохранилищ|комбайн|уборк|пашн|посев|теленок|корова|бычок/i;
const CONSTRUCTION_KEYWORDS = /строит|монтаж|смр|объект|подряд|проект|кладк|фундамент|кровл/i;
const TRANSPORT_KEYWORDS = /перевозк|доставк|логист|транспорт|фрахт|грузоперевоз|экспедиц/i;

function detectIndustry(
  salesItems: string[],
  lineTypes: string[],
  acc: OsvMap,
): { industry: Industry; flags: IndustryFlags } {
  const itemStr = salesItems.join(" ").toLowerCase();
  const hasBio = dr(acc, "2521") > 0 || dr(acc, "2950") > 0 || dr(acc, "2920") > 0 || dr(acc, "2930") > 0;
  const hasWip8 = dr(acc, "8110") > 0 || dr(acc, "8112") > 0 || dr(acc, "8210") > 0 || dr(acc, "8310") > 0;
  const hasGoods1330 = dr(acc, "1330") > 0 || td(acc, "1330") > 0;
  const hasFinishedGoods = dr(acc, "1320") > 0;
  const servicesPct = lineTypes.length > 0 ? lineTypes.filter(t => t === "Услуга").length / lineTypes.length : 0;
  const goodsPct    = lineTypes.length > 0 ? lineTypes.filter(t => t === "Товар").length / lineTypes.length : 0;

  if (hasBio || AGRO_KEYWORDS.test(itemStr)) {
    return { industry: "agro", flags: { label: "Агропромышленный комплекс", showBio: true, showWip: true, showGoodsMargin: false, showServices: false } };
  }
  if (CONSTRUCTION_KEYWORDS.test(itemStr)) {
    return { industry: "construction", flags: { label: "Строительство и подрядные работы", showBio: false, showWip: true, showGoodsMargin: false, showServices: false } };
  }
  if (TRANSPORT_KEYWORDS.test(itemStr)) {
    return { industry: "transport", flags: { label: "Транспорт и логистика", showBio: false, showWip: false, showGoodsMargin: false, showServices: true } };
  }
  if (hasWip8 && hasFinishedGoods) {
    return { industry: "manufacturing", flags: { label: "Промышленное производство", showBio: false, showWip: true, showGoodsMargin: true, showServices: false } };
  }
  if (hasGoods1330 && goodsPct > 0.5) {
    return { industry: "trade", flags: { label: "Оптовая / розничная торговля", showBio: false, showWip: false, showGoodsMargin: true, showServices: false } };
  }
  if (servicesPct > 0.7) {
    return { industry: "services", flags: { label: "Сфера услуг", showBio: false, showWip: false, showGoodsMargin: false, showServices: true } };
  }
  return { industry: "universal", flags: { label: "Многопрофильная деятельность", showBio: hasBio, showWip: hasWip8, showGoodsMargin: hasGoods1330, showServices: servicesPct > 0.3 } };
}

// ── industry benchmarks ───────────────────────────────────────────────────────

interface Benchmarks { liqNorm: string; leverageNorm: string; marginNorm: string; arDaysNorm: string }

function getBenchmarks(industry: Industry): Benchmarks {
  switch (industry) {
    case "agro":         return { liqNorm: ">0.15x", leverageNorm: "<40%", marginNorm: ">20%", arDaysNorm: "<90 дн" };
    case "manufacturing":return { liqNorm: ">0.2x",  leverageNorm: "<60%", marginNorm: ">15%", arDaysNorm: "<60 дн" };
    case "trade":        return { liqNorm: ">0.1x",  leverageNorm: "<70%", marginNorm: ">8%",  arDaysNorm: "<45 дн" };
    case "services":     return { liqNorm: ">0.3x",  leverageNorm: "<30%", marginNorm: ">25%", arDaysNorm: "<30 дн" };
    case "construction": return { liqNorm: ">0.15x", leverageNorm: "<50%", marginNorm: ">12%", arDaysNorm: "<90 дн" };
    case "transport":    return { liqNorm: ">0.2x",  leverageNorm: "<55%", marginNorm: ">10%", arDaysNorm: "<45 дн" };
    default:             return { liqNorm: ">0.2x",  leverageNorm: "<50%", marginNorm: ">10%", arDaysNorm: "<60 дн" };
  }
}

// ── OSV section grouping ──────────────────────────────────────────────────────

interface OsvBuckets {
  assets1: OSVRow[];       // краткосрочные активы
  assets2: OSVRow[];       // долгосрочные активы
  liab3: OSVRow[];         // краткосрочные обязательства
  liab4: OSVRow[];         // долгосрочные обязательства
  equity5: OSVRow[];       // капитал
  income6: OSVRow[];       // доходы
  expenses7: OSVRow[];     // расходы
  production8: OSVRow[];   // производственные счета
}

function groupBySection(rows: OSVRow[]): OsvBuckets {
  const buckets: OsvBuckets = {
    assets1: [], assets2: [], liab3: [], liab4: [], equity5: [],
    income6: [], expenses7: [], production8: [],
  };
  for (const r of rows) {
    const sec = r.accountCode.charAt(0);
    switch (sec) {
      case "1": buckets.assets1.push(r); break;
      case "2": buckets.assets2.push(r); break;
      case "3": buckets.liab3.push(r); break;
      case "4": buckets.liab4.push(r); break;
      case "5": buckets.equity5.push(r); break;
      case "6": buckets.income6.push(r); break;
      case "7": buckets.expenses7.push(r); break;
      case "8": buckets.production8.push(r); break;
    }
  }
  return buckets;
}

// Счета амортизации (контр-активы) — сторона остатка Cr
const CONTRA_ASSET_CODES = new Set(["2420","2430","2740","1280","2840"]);

function assetValue(r: OSVRow): number {
  return CONTRA_ASSET_CODES.has(r.accountCode) ? -(r.closingCr) : r.closingDr;
}

function liabValue(r: OSVRow): number {
  return r.closingCr;
}

// ── data collection ───────────────────────────────────────────────────────────

interface SalesRowNorm {
  item: string;
  contractor: string;
  lineType: string;
  qty: number;
  amount: number;
  vatAmount: number;
}

interface CollectedData {
  orgName: string;
  osv: { rows: OSVRow[] };
  debtors: { rows: SettlementRow[]; total: number };
  creditors: { rows: SettlementRow[]; total: number };
  detailedCreditors: { rows: CreditorDetailRow[]; total: number };
  advancesReceived: { rows: CreditorDetailRow[]; total: number };
  advancesGiven: { rows: SettlementRow[]; byAccount: Record<string, number> };
  accountable: { rows: SettlementRow[]; byAccount: Record<string, number> };
  loans: { rows: SettlementRow[]; byAccount: Record<string, number> };
  cashflow: { months: { month: string; inflow: number; outflow: number; net: number }[]; totals: { inflow: number; outflow: number; net: number } };
  sales: { rows: SalesRowNorm[]; totals: { amount: number; vatAmount: number } };
  purchases: { totals: { amount: number } };
  fa: { rows: { name: string; initialCost: number; accumulatedDepreciation: number; residualValue: number }[]; totals: { initialCost: number; accumulatedDepreciation: number; residualValue: number } };
  dateFrom: string;
  dateTo: string;
}

async function collectAll(
  reports: ReportsService,
  catalog: CatalogService,
  orgGuid: string,
  dateFrom: string,
  dateTo: string,
): Promise<CollectedData> {
  const [
    orgs, osvRaw, dbtRaw, crdRaw, detCrdRaw, advRecRaw,
    advGivRaw, accountableRaw, loansRaw,
    cfRaw, salesRaw, purchRaw, faRaw,
  ] = await Promise.all([
    catalog.getOrganizations().catch(() => [] as { Ref_Key: string; Description: string }[]),
    reports.getOSV(dateFrom, dateTo, orgGuid).catch(() => ({ rows: [] as OSVRow[], totals: {} as never })),
    reports.getAllDebtors(orgGuid).catch(() => ({ rows: [] as SettlementRow[], total: 0, byAccount: {} })),
    reports.getAllCreditors(orgGuid).catch(() => ({ rows: [] as SettlementRow[], total: 0, byAccount: {} })),
    reports.getDetailedCreditors(orgGuid, dateTo).catch(() => ({ rows: [] as CreditorDetailRow[], total: 0, byAccount: {} })),
    reports.getDetailedAdvancesReceived(orgGuid, dateTo).catch(() => ({ rows: [] as CreditorDetailRow[], total: 0, byAccount: {} })),
    reports.getSettlementBreakdown(["1710"], orgGuid, dateTo).catch(() => ({ rows: [] as SettlementRow[], byAccount: {} })),
    reports.getSettlementBreakdown(["1251"], orgGuid, dateTo).catch(() => ({ rows: [] as SettlementRow[], byAccount: {} })),
    reports.getSettlementBreakdown(["3010","3020","3030","4010","4020","4030","4150"], orgGuid, dateTo).catch(() => ({ rows: [] as SettlementRow[], byAccount: {} })),
    reports.getCashFlowSummary(dateFrom, dateTo, orgGuid).catch(() => ({ months: [], totals: { inflow: 0, outflow: 0, net: 0 }, byType: [] })),
    reports.getSalesReport(dateFrom, dateTo, undefined, orgGuid).catch(() => ({ rows: [], totals: { amount: 0, vatAmount: 0, total: 0 } })),
    reports.getPurchasesReport(dateFrom, dateTo, undefined, orgGuid).catch(() => ({ rows: [], totals: { amount: 0, vatAmount: 0, total: 0 } })),
    reports.getFixedAssets(orgGuid).catch(() => ({ asOfDate: dateTo, rows: [], totals: { initialCost: 0, accumulatedDepreciation: 0, residualValue: 0 } })),
  ]);

  const orgName = (orgs as { Ref_Key: string; Description: string }[]).find(o => o.Ref_Key === orgGuid)?.Description ?? orgGuid;

  const salesRows: SalesRowNorm[] = (salesRaw.rows as { item: string; contractor: string; lineType?: string; qty: number; amount: number; vatAmount: number }[])
    .map(r => ({ item: r.item, contractor: r.contractor, lineType: r.lineType ?? "Товар", qty: r.qty, amount: r.amount, vatAmount: r.vatAmount }));

  return {
    orgName,
    osv: { rows: osvRaw.rows },
    debtors: { rows: dbtRaw.rows, total: dbtRaw.total },
    creditors: { rows: crdRaw.rows, total: crdRaw.total },
    detailedCreditors: { rows: detCrdRaw.rows, total: detCrdRaw.total },
    advancesReceived: { rows: advRecRaw.rows, total: advRecRaw.total },
    advancesGiven: advGivRaw,
    accountable: accountableRaw,
    loans: loansRaw,
    cashflow: { months: cfRaw.months, totals: cfRaw.totals },
    sales: { rows: salesRows, totals: { amount: salesRaw.totals.amount, vatAmount: salesRaw.totals.vatAmount } },
    purchases: { totals: { amount: purchRaw.totals.amount } },
    fa: faRaw,
    dateFrom,
    dateTo,
  };
}

// ── balance table builder ─────────────────────────────────────────────────────

function buildOsvTable(
  rows: OSVRow[],
  valueMode: "dr" | "cr" | "contra-dr",
  accountsService: AccountsService,
): { lines: string[]; total: number } {
  const L: string[] = [];
  const a = (s: string) => L.push(s);
  let total = 0;

  // Group by subsection (first 2 chars of code)
  const bySubsection = new Map<string, OSVRow[]>();
  for (const r of rows) {
    const sub = r.accountCode.length >= 2 ? r.accountCode.slice(0, 2) + "00" : r.accountCode;
    const bucket = bySubsection.get(sub) ?? [];
    bucket.push(r);
    bySubsection.set(sub, bucket);
  }

  for (const [subKey, subRows] of [...bySubsection.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))) {
    // Subsection header
    const subInfo = accountsService.lookupCode(subKey);
    const subName = subInfo?.level === "subsection" ? subInfo.data.name : (subInfo?.level === "group" ? subInfo.data.name : subKey);
    if (subRows.length > 1) {
      a(`| | ***${subName}*** | | | | |`);
    }
    for (const r of subRows.sort((x, y) => x.accountCode.localeCompare(y.accountCode, undefined, { numeric: true }))) {
      let val: number;
      if (valueMode === "contra-dr") {
        val = CONTRA_ASSET_CODES.has(r.accountCode) ? -(r.closingCr) : r.closingDr;
      } else if (valueMode === "dr") {
        val = r.closingDr;
      } else {
        val = r.closingCr;
      }
      total += val;
      const openVal = valueMode === "cr" ? (r.openingCr) : r.openingDr;
      a(`| ${r.accountCode} | ${r.accountName || r.accountCode} | ${fmt(openVal)} | ${fmt(r.turnoverDr)} | ${fmt(r.turnoverCr)} | **${fmt(val)}** |`);
    }
  }

  return { lines: L, total };
}

// ── settlement расшифровки ────────────────────────────────────────────────────

function ageLabel(age: CreditorDetailRow["ageCategory"]): string {
  switch (age) {
    case "current": return "< 1 года";
    case "1y": return "1–2 года";
    case "2y": return "2–3 года";
    case "3y+": return "3+ лет";
    default: return "—";
  }
}

function buildDebtorTable(rows: SettlementRow[], total: number, label: string): string[] {
  if (!rows.length) return [];
  const L: string[] = [];
  const a = (s: string) => L.push(s);
  a(`## ${label}`);
  a(``);
  a(`**Итого: ${fmt(total)} тг**`);
  a(``);
  a(`| Счёт | Контрагент | Сумма (тг) | Доля |`);
  a(`|---|---|---:|---:|`);
  const sorted = [...rows].sort((a, b) => (b.balanceDr - b.balanceCr) - (a.balanceDr - a.balanceCr));
  for (const r of sorted) {
    const net = r.balanceDr - r.balanceCr;
    if (net <= 0) continue;
    const pct = total > 0 ? (net / total * 100).toFixed(1) + "%" : "—";
    a(`| ${r.accountCode} | ${r.contractorName} | ${fmt(net)} | ${pct} |`);
  }
  a(`| | **ИТОГО** | **${fmt(total)}** | 100% |`);
  a(``);
  return L;
}

function buildAdvancesGivenTable(rows: SettlementRow[], byAccount: Record<string, number>): string[] {
  const L: string[] = [];
  const a = (s: string) => L.push(s);
  // calculate total (Dr side is asset)
  const total = rows.reduce((s, r) => s + (r.balanceDr - r.balanceCr), 0);
  if (total <= 0 && !rows.length) return [];

  a(`## АВАНСЫ ВЫДАННЫЕ (1710) — РАСШИФРОВКА`);
  a(``);
  a(`**Итого: ${fmt(total)} тг** — средства у поставщиков, ожидающие поставки/возврата`);
  a(``);
  a(`| Контрагент | Сумма (тг) | Доля | Риск |`);
  a(`|---|---:|---:|---|`);
  for (const r of rows) {
    const net = r.balanceDr - r.balanceCr;
    if (net <= 0) continue;
    const pct = total > 0 ? (net / total * 100).toFixed(1) + "%" : "—";
    const risk = net / total > 0.3 ? "🔴 Высокий" : net / total > 0.1 ? "🟡 Умеренный" : "🟢 Низкий";
    a(`| ${r.contractorName} | ${fmt(net)} | ${pct} | ${risk} |`);
  }
  a(`| **ИТОГО** | **${fmt(total)}** | 100% | |`);
  a(``);
  if (total > 0) {
    const topRow = rows.find(r => r.balanceDr - r.balanceCr === Math.max(...rows.map(x => x.balanceDr - x.balanceCr)));
    if (topRow) {
      const topNet = topRow.balanceDr - topRow.balanceCr;
      const topPct = (topNet / total * 100).toFixed(0);
      if (Number(topPct) > 50) {
        a(`> ⚠️ **Концентрация:** ${topPct}% авансов у одного контрагента «${topRow.contractorName}».`);
        a(`> Рекомендуется акт сверки и контроль сроков поставки.`);
        a(``);
      }
    }
  }
  return L;
}

function buildDetailedCreditorTable(rows: CreditorDetailRow[], total: number): string[] {
  if (!rows.length) return [];
  const L: string[] = [];
  const a = (s: string) => L.push(s);

  a(`## КРЕДИТОРСКАЯ ЗАДОЛЖЕННОСТЬ — РАСШИФРОВКА`);
  a(``);
  a(`**Итого: ${fmt(total)} тг**`);
  a(``);
  a(`| Счёт | Контрагент | Сумма (тг) | Доля | Возраст | Последний платёж | Договоры |`);
  a(`|---|---|---:|---:|---|---|---|`);
  for (const r of rows) {
    const pct = total > 0 ? (r.balance / total * 100).toFixed(1) + "%" : "—";
    const lastPay = r.lastPaymentDate ? `${r.lastPaymentDate}` : "—";
    const contracts = r.contracts.slice(0, 2).join(", ") || "—";
    a(`| ${r.accountCode} | ${r.contractorName} | ${fmt(r.balance)} | ${pct} | ${ageLabel(r.ageCategory)} | ${lastPay} | ${contracts.slice(0, 40)} |`);
  }
  a(`| | **ИТОГО** | **${fmt(total)}** | 100% | | | |`);
  a(``);

  // Aging summary
  const groups: Record<string, number> = { current: 0, "1y": 0, "2y": 0, "3y+": 0, unknown: 0 };
  for (const r of rows) groups[r.ageCategory] = (groups[r.ageCategory] ?? 0) + r.balance;
  a(`### Структура по возрасту долга`);
  a(``);
  a(`| Период | Сумма (тг) | Доля |`);
  a(`|---|---:|---:|`);
  for (const [key, val] of Object.entries(groups)) {
    if (val <= 0) continue;
    a(`| ${ageLabel(key as CreditorDetailRow["ageCategory"])} | ${fmt(val)} | ${(val / total * 100).toFixed(1)}% |`);
  }
  a(``);
  return L;
}

function buildAdvancesReceivedTable(rows: CreditorDetailRow[], total: number): string[] {
  if (!rows.length) return [];
  const L: string[] = [];
  const a = (s: string) => L.push(s);
  a(`## АВАНСЫ ПОЛУЧЕННЫЕ (3510) — РАСШИФРОВКА`);
  a(``);
  a(`**Итого: ${fmt(total)} тг** — обязательства по поставке товаров/услуг покупателям`);
  a(``);
  a(`| Контрагент | Сумма (тг) | Доля | Возраст аванса |`);
  a(`|---|---:|---:|---|`);
  for (const r of rows) {
    const pct = total > 0 ? (r.balance / total * 100).toFixed(1) + "%" : "—";
    a(`| ${r.contractorName} | ${fmt(r.balance)} | ${pct} | ${ageLabel(r.ageCategory)} |`);
  }
  a(`| **ИТОГО** | **${fmt(total)}** | 100% | |`);
  a(``);
  return L;
}

function buildLoansTable(rows: SettlementRow[], byAccount: Record<string, number>): string[] {
  if (!rows.length && Object.values(byAccount).every(v => v === 0)) return [];
  const L: string[] = [];
  const a = (s: string) => L.push(s);
  a(`## ЗАЙМЫ И КРЕДИТЫ — РАСШИФРОВКА`);
  a(``);

  const shortCodes = new Set(["3010","3020","3030"]);
  const longCodes = new Set(["4010","4020","4030","4150"]);

  const shortRows = rows.filter(r => shortCodes.has(r.accountCode));
  const longRows  = rows.filter(r => longCodes.has(r.accountCode));
  const shortTotal = shortRows.reduce((s, r) => s + (r.balanceCr - r.balanceDr), 0);
  const longTotal  = longRows.reduce((s, r) => s + (r.balanceCr - r.balanceDr), 0);
  const grandTotal = shortTotal + longTotal;

  if (shortRows.length > 0) {
    a(`### Краткосрочные займы и кредиты (3010/3020/3030)`);
    a(``);
    a(`**Итого: ${fmt(shortTotal)} тг**`);
    a(``);
    a(`| Счёт | Займодавец | Сумма (тг) | Доля |`);
    a(`|---|---|---:|---:|`);
    for (const r of shortRows) {
      const net = r.balanceCr - r.balanceDr;
      if (net <= 0) continue;
      const pct = shortTotal > 0 ? (net / shortTotal * 100).toFixed(1) + "%" : "—";
      a(`| ${r.accountCode} | ${r.contractorName} | ${fmt(net)} | ${pct} |`);
    }
    a(`| | **Итого краткосрочные** | **${fmt(shortTotal)}** | 100% |`);
    a(``);
  } else if (shortTotal === 0) {
    a(`### Краткосрочные займы и кредиты`);
    a(`*Краткосрочных займов нет*`);
    a(``);
  }

  if (longRows.length > 0) {
    a(`### Долгосрочные займы, кредиты и аренда (4010/4020/4030/4150)`);
    a(``);
    a(`**Итого: ${fmt(longTotal)} тг**`);
    a(``);
    a(`| Счёт | Займодавец / Арендодатель | Сумма (тг) | Доля |`);
    a(`|---|---|---:|---:|`);
    for (const r of longRows) {
      const net = r.balanceCr - r.balanceDr;
      if (net <= 0) continue;
      const pct = longTotal > 0 ? (net / longTotal * 100).toFixed(1) + "%" : "—";
      a(`| ${r.accountCode} | ${r.contractorName} | ${fmt(net)} | ${pct} |`);
    }
    a(`| | **Итого долгосрочные** | **${fmt(longTotal)}** | 100% |`);
    a(``);
  } else if (longTotal === 0) {
    a(`### Долгосрочные займы и аренда`);
    a(`*Долгосрочных займов нет*`);
    a(``);
  }

  a(`**Общий долг: ${fmt(grandTotal)} тг** (краткосрочные ${fmt(shortTotal)} тг + долгосрочные ${fmt(longTotal)} тг)`);
  a(``);
  return L;
}

// ── full report builder ───────────────────────────────────────────────────────

function buildReport(d: CollectedData, accountsService: AccountsService): string {
  const acc = buildOsvMap(d.osv.rows);
  const buckets = groupBySection(d.osv.rows);

  // ── Sales aggregation
  const byItem = new Map<string, { qty: number; amount: number }>();
  const byCtr  = new Map<string, number>();
  const lineTypes: string[] = [];
  for (const r of d.sales.rows) {
    const prev = byItem.get(r.item) ?? { qty: 0, amount: 0 };
    byItem.set(r.item, { qty: prev.qty + r.qty, amount: prev.amount + r.amount });
    byCtr.set(r.contractor, (byCtr.get(r.contractor) ?? 0) + r.amount);
    lineTypes.push(r.lineType);
  }
  const salesByItem = [...byItem.entries()].sort((a, b) => b[1].amount - a[1].amount);
  const salesByCtr  = [...byCtr.entries()].sort((a, b) => b[1] - a[1]);
  const revenue = d.sales.totals.amount;

  // ── Industry
  const { industry, flags } = detectIndustry(salesByItem.map(([item]) => item), lineTypes, acc);
  const benchmarks = getBenchmarks(industry);

  // ── Key metrics
  const cash = dr(acc, "1010") + dr(acc, "1030") + dr(acc, "1050");
  const ar   = dr(acc, "1210");
  const advancesOut = dr(acc, "1710");
  const materials = dr(acc, "1310");
  const fg = dr(acc, "1320");
  const goods1330 = dr(acc, "1330");
  const faGross = d.fa.totals.initialCost;
  const faDep   = d.fa.totals.accumulatedDepreciation;
  const faNet   = d.fa.totals.residualValue;
  const faWearPct = faGross > 0 ? (faDep / faGross) * 100 : 0;
  const herd = dr(acc, "2521");
  const livestock = dr(acc, "2950");
  const loans = cr(acc, "3010") + cr(acc, "3020") + cr(acc, "3030");
  const loansLong = cr(acc, "4010") + cr(acc, "4020") + cr(acc, "4030") + cr(acc, "4150");
  const loansOpen = oc(acc, "3010") + oc(acc, "3020") + oc(acc, "3030");
  const ap = cr(acc, "3310");
  const vatOut = cr(acc, "3131") + cr(acc, "3130");
  const vatIn  = dr(acc, "1421") + dr(acc, "1420");
  const vatNet = Math.max(0, vatOut - vatIn);
  const ltLease = cr(acc, "4150");
  const equityCharter = cr(acc, "5030");
  const equityReval = cr(acc, "5520");
  const equityNpCur = cr(acc, "5610");
  const equityNpPrev = cr(acc, "5620");
  const equityTotal = equityCharter + equityReval + equityNpCur + equityNpPrev;
  const cogs = td(acc, "7010");
  const adminCosts = td(acc, "7210");
  const subsidy = tc(acc, "6230") - td(acc, "6230");
  const totalDebt = loans + loansLong;

  // P&L totals
  const totalIncome = buckets.income6.reduce((s, r) => s + r.turnoverCr, 0);
  const totalExpenses = buckets.expenses7.reduce((s, r) => s + r.turnoverDr, 0);
  const grossProfit = revenue - cogs;
  const operatingProfit = grossProfit - adminCosts;
  const netProfit = totalIncome - totalExpenses;

  // Balance totals from OSV
  const totalAssets1 = buckets.assets1.reduce((s, r) => s + assetValue(r), 0);
  const totalAssets2 = buckets.assets2.reduce((s, r) => s + assetValue(r), 0);
  const totalLiab3 = buckets.liab3.reduce((s, r) => s + liabValue(r), 0);
  const totalLiab4 = buckets.liab4.reduce((s, r) => s + liabValue(r), 0);
  const totalEquity5 = buckets.equity5.reduce((s, r) => s + liabValue(r), 0);
  const totalLiabEquity = totalLiab3 + totalLiab4 + totalEquity5;
  const totalAssetsAll = totalAssets1 + totalAssets2;

  const L: string[] = [];
  const a = (s: string) => L.push(s);

  const toFmt = d.dateTo.split("-").reverse().join(".");

  a(`# ФИНАНСОВО-ПРОМЫШЛЕННЫЙ АНАЛИЗ`);
  a(`## ${d.orgName} | ${d.dateFrom} – ${d.dateTo}`);
  a(``);
  a(`---`);
  a(``);

  // ── 1. Профиль и отрасль
  a(`## 1. ПРОФИЛЬ КОМПАНИИ`);
  a(``);
  a(`| Показатель | Значение |`);
  a(`|---|---|`);
  a(`| Организация | **${d.orgName}** |`);
  a(`| Отрасль (авто) | **${flags.label}** |`);
  a(`| Период анализа | ${d.dateFrom} — ${d.dateTo} |`);
  a(`| Выручка YTD | **${fmt(revenue)} тг** |`);
  a(`| Активы (баланс) | **${fmt(totalAssetsAll)} тг** |`);
  a(`| Капитал | **${fmt(totalEquity5)} тг** |`);
  a(`| Долг (займы) | **${fmt(totalDebt)} тг** |`);
  a(`| Денежные средства | **${fmt(cash)} тг** |`);
  a(``);

  // ── 2. Баланс из ОСВ
  a(`## 2. БАЛАНС`);
  a(``);
  a(`### АКТИВЫ`);
  a(``);
  a(`#### Раздел 1 — Краткосрочные активы`);
  a(``);
  a(`| Счёт | Наименование | Нач. остаток | Об. Дт | Об. Кт | Кон. остаток |`);
  a(`|---|---|---:|---:|---:|---:|`);
  const { lines: a1Lines, total: _a1total } = buildOsvTable(buckets.assets1, "contra-dr", accountsService);
  for (const l of a1Lines) a(l);
  a(`| | **ИТОГО раздел 1** | | | | **${fmt(totalAssets1)}** |`);
  a(``);

  a(`#### Раздел 2 — Долгосрочные активы`);
  a(``);
  a(`| Счёт | Наименование | Нач. остаток | Об. Дт | Об. Кт | Кон. остаток |`);
  a(`|---|---|---:|---:|---:|---:|`);
  const { lines: a2Lines, total: _a2total } = buildOsvTable(buckets.assets2, "contra-dr", accountsService);
  for (const l of a2Lines) a(l);
  a(`| | **ИТОГО раздел 2** | | | | **${fmt(totalAssets2)}** |`);
  a(``);
  a(`| | **ИТОГО АКТИВЫ** | | | | **${fmt(totalAssetsAll)}** |`);
  a(``);

  a(`### ОБЯЗАТЕЛЬСТВА`);
  a(``);
  a(`#### Раздел 3 — Краткосрочные обязательства`);
  a(``);
  a(`| Счёт | Наименование | Нач. остаток | Об. Дт | Об. Кт | Кон. остаток |`);
  a(`|---|---|---:|---:|---:|---:|`);
  const { lines: l3Lines, total: _l3total } = buildOsvTable(buckets.liab3, "cr", accountsService);
  for (const l of l3Lines) a(l);
  a(`| | **ИТОГО раздел 3** | | | | **${fmt(totalLiab3)}** |`);
  a(``);

  if (buckets.liab4.length > 0) {
    a(`#### Раздел 4 — Долгосрочные обязательства`);
    a(``);
    a(`| Счёт | Наименование | Нач. остаток | Об. Дт | Об. Кт | Кон. остаток |`);
    a(`|---|---|---:|---:|---:|---:|`);
    const { lines: l4Lines, total: _l4total } = buildOsvTable(buckets.liab4, "cr", accountsService);
    for (const l of l4Lines) a(l);
    a(`| | **ИТОГО раздел 4** | | | | **${fmt(totalLiab4)}** |`);
    a(``);
  }
  a(`| | **ИТОГО ОБЯЗАТЕЛЬСТВА** | | | | **${fmt(totalLiab3 + totalLiab4)}** |`);
  a(``);

  a(`### КАПИТАЛ`);
  a(``);
  a(`#### Раздел 5 — Капитал и резервы`);
  a(``);
  a(`| Счёт | Наименование | Нач. остаток | Об. Дт | Об. Кт | Кон. остаток |`);
  a(`|---|---|---:|---:|---:|---:|`);
  const { lines: e5Lines, total: _e5total } = buildOsvTable(buckets.equity5, "cr", accountsService);
  for (const l of e5Lines) a(l);
  a(`| | **ИТОГО КАПИТАЛ** | | | | **${fmt(totalEquity5)}** |`);
  a(``);

  // ── 3. Сводная структура баланса
  a(`## 3. СВОДНАЯ СТРУКТУРА БАЛАНСА`);
  a(``);
  a(`| Статья | Сумма (тг) | Доля |`);
  a(`|---|---:|---:|`);
  a(`| **Краткосрочные активы (1)** | **${fmt(totalAssets1)}** | ${totalAssetsAll > 0 ? (totalAssets1 / totalAssetsAll * 100).toFixed(1) + "%" : "—"} |`);
  a(`| **Долгосрочные активы (2)** | **${fmt(totalAssets2)}** | ${totalAssetsAll > 0 ? (totalAssets2 / totalAssetsAll * 100).toFixed(1) + "%" : "—"} |`);
  a(`| **ИТОГО АКТИВЫ** | **${fmt(totalAssetsAll)}** | 100% |`);
  a(`| | | |`);
  a(`| Краткосрочные обязательства (3) | ${fmt(totalLiab3)} | ${totalLiabEquity > 0 ? (totalLiab3 / totalLiabEquity * 100).toFixed(1) + "%" : "—"} |`);
  a(`| Долгосрочные обязательства (4) | ${fmt(totalLiab4)} | ${totalLiabEquity > 0 ? (totalLiab4 / totalLiabEquity * 100).toFixed(1) + "%" : "—"} |`);
  a(`| **Капитал и резервы (5)** | **${fmt(totalEquity5)}** | ${totalLiabEquity > 0 ? (totalEquity5 / totalLiabEquity * 100).toFixed(1) + "%" : "—"} |`);
  a(`| **ИТОГО ПАССИВЫ** | **${fmt(totalLiabEquity)}** | 100% |`);
  a(``);
  const imbalance = Math.abs(totalAssetsAll - totalLiabEquity);
  if (imbalance < 100) {
    a(`> ✅ **Баланс сходится:** Активы = Пассивы (**${fmt(totalAssetsAll)}** тг).`);
  } else {
    a(`> ⚠️ **Расхождение баланса:** Активы ${fmt(totalAssetsAll)} тг ≠ Пассивы ${fmt(totalLiabEquity)} тг (Δ = ${fmt(imbalance)} тг). Проверьте ОСВ.`);
  }
  a(``);

  // ── 4. P&L
  a(`## 4. ДОХОДЫ И РАСХОДЫ (P&L — YTD)`);
  a(``);
  a(`### Доходы (раздел 6)`);
  a(``);
  a(`| Счёт | Наименование | Оборот Кт (тг) | Доля |`);
  a(`|---|---|---:|---:|`);
  for (const r of buckets.income6.sort((x, y) => y.turnoverCr - x.turnoverCr)) {
    const pct = totalIncome > 0 ? (r.turnoverCr / totalIncome * 100).toFixed(1) + "%" : "—";
    a(`| ${r.accountCode} | ${r.accountName} | ${fmt(r.turnoverCr)} | ${pct} |`);
  }
  a(`| | **ИТОГО ДОХОДЫ** | **${fmt(totalIncome)}** | 100% |`);
  a(``);
  a(`### Расходы (раздел 7)`);
  a(``);
  a(`| Счёт | Наименование | Оборот Дт (тг) | Доля |`);
  a(`|---|---|---:|---:|`);
  for (const r of buckets.expenses7.sort((x, y) => y.turnoverDr - x.turnoverDr)) {
    const pct = totalExpenses > 0 ? (r.turnoverDr / totalExpenses * 100).toFixed(1) + "%" : "—";
    a(`| ${r.accountCode} | ${r.accountName} | ${fmt(r.turnoverDr)} | ${pct} |`);
  }
  a(`| | **ИТОГО РАСХОДЫ** | **${fmt(totalExpenses)}** | 100% |`);
  a(``);
  a(`### Итоговые показатели P&L`);
  a(``);
  a(`| Показатель | Сумма (тг) | Маржа |`);
  a(`|---|---:|---:|`);
  a(`| Выручка от продаж | ${fmt(revenue)} | 100% |`);
  if (cogs > 0) {
    a(`| Себестоимость продаж (7010) | (${fmt(cogs)}) | ${revenue > 0 ? (cogs / revenue * 100).toFixed(1) + "%" : "—"} |`);
    a(`| **Валовая прибыль** | **${fmt(grossProfit)}** | **${revenue > 0 ? (grossProfit / revenue * 100).toFixed(1) + "%" : "—"}** |`);
  }
  if (adminCosts > 0) {
    a(`| Административные расходы (7210) | (${fmt(adminCosts)}) | |`);
    a(`| **Операционная прибыль** | **${fmt(operatingProfit)}** | **${revenue > 0 ? (operatingProfit / revenue * 100).toFixed(1) + "%" : "—"}** |`);
  }
  a(`| Прочие доходы (раздел 6 кроме 6010) | ${fmt(totalIncome - tc(acc, "6010"))} | |`);
  a(`| Прочие расходы (раздел 7 кроме 7010/7210) | (${fmt(totalExpenses - td(acc, "7010") - td(acc, "7210"))}) | |`);
  a(`| **Чистый результат** | **${fmt(netProfit)}** | **${totalIncome > 0 ? (netProfit / totalIncome * 100).toFixed(1) + "%" : "—"}** |`);
  a(``);

  // ── 5. Продажи
  a(`## 5. ПРОДАЖИ`);
  a(``);
  a(`**Общая выручка: ${fmt(revenue)} тг**`);
  a(``);
  a(`### По номенклатуре`);
  a(``);
  a(`| Номенклатура | Объём | Выручка (тг) | Доля |`);
  a(`|---|---:|---:|---:|`);
  for (const [item, val] of salesByItem.slice(0, 15)) {
    const pct = revenue > 0 ? (val.amount / revenue * 100).toFixed(1) + "%" : "—";
    a(`| ${item.slice(0, 50)} | ${fmt(val.qty, 1)} | ${fmt(val.amount)} | ${pct} |`);
  }
  a(`| **ИТОГО** | | **${fmt(revenue)}** | 100% |`);
  a(``);
  a(`### Топ покупателей`);
  a(``);
  a(`| Покупатель | Выручка (тг) | Доля |`);
  a(`|---|---:|---:|`);
  for (const [ctr, amt] of salesByCtr.slice(0, 10)) {
    const pct = revenue > 0 ? (amt / revenue * 100).toFixed(1) + "%" : "—";
    a(`| ${ctr} | ${fmt(amt)} | ${pct} |`);
  }
  a(``);

  // ── 6. Дебиторка
  for (const l of buildDebtorTable(d.debtors.rows, d.debtors.total, "ДЕБИТОРСКАЯ ЗАДОЛЖЕННОСТЬ")) a(l);
  if (d.accountable.rows.length > 0) {
    const accTotal = d.accountable.rows.reduce((s, r) => s + (r.balanceDr - r.balanceCr), 0);
    for (const l of buildDebtorTable(d.accountable.rows, accTotal, "ПОДОТЧЁТНЫЕ ЛИЦА (1251)")) a(l);
  }

  // ── 7. Авансы выданные
  for (const l of buildAdvancesGivenTable(d.advancesGiven.rows, d.advancesGiven.byAccount)) a(l);

  // ── 8. Кредиторка с aging
  for (const l of buildDetailedCreditorTable(d.detailedCreditors.rows, d.detailedCreditors.total)) a(l);

  // ── 9. Авансы полученные
  for (const l of buildAdvancesReceivedTable(d.advancesReceived.rows, d.advancesReceived.total)) a(l);

  // ── 10. Займы и кредиты
  for (const l of buildLoansTable(d.loans.rows, d.loans.byAccount)) a(l);

  // ── 11. Денежный поток
  a(`## ДЕНЕЖНЫЙ ПОТОК`);
  a(``);
  a(`| Месяц | Приход (тг) | Расход (тг) | Нетто (тг) |`);
  a(`|---|---:|---:|---:|`);
  for (const mo of d.cashflow.months) {
    const mm   = mo.month.length >= 7 ? mo.month.slice(5, 7) : "?";
    const name = MONTH_RU[mm] ?? mo.month;
    const sign = mo.net >= 0 ? "+" : "";
    a(`| ${name} ${mo.month.slice(0, 4)} | ${fmt(mo.inflow)} | ${fmt(mo.outflow)} | **${sign}${fmt(mo.net)}** |`);
  }
  const cfNet = d.cashflow.totals.net;
  a(`| **ИТОГО** | **${fmt(d.cashflow.totals.inflow)}** | **${fmt(d.cashflow.totals.outflow)}** | **${cfNet >= 0 ? "+" : ""}${fmt(cfNet)}** |`);
  a(``);

  // ── 12. Закупки
  a(`## ЗАКУПКИ`);
  a(``);
  a(`| Показатель | Сумма (тг) |`);
  a(`|---|---:|`);
  a(`| Объём закупок за период | **${fmt(d.purchases.totals.amount)}** |`);
  if (revenue > 0 && d.purchases.totals.amount > 0) {
    const va = revenue / d.purchases.totals.amount;
    a(`| Мультипликатор добавленной стоимости | ${va.toFixed(2)}x |`);
  }
  a(``);

  // ── 13. Основные средства
  a(`## ОСНОВНЫЕ СРЕДСТВА`);
  a(``);
  a(`| Показатель | Сумма (тг) |`);
  a(`|---|---:|`);
  a(`| Первоначальная стоимость | ${fmt(faGross)} |`);
  a(`| Накопленная амортизация | (${fmt(faDep)}) — **${faWearPct.toFixed(0)}%** |`);
  a(`| **Остаточная стоимость** | **${fmt(faNet)}** |`);
  a(``);
  if (d.fa.rows.length > 0) {
    a(`### Топ объектов`);
    a(``);
    a(`| Объект | Первонач. (тг) | Остаток (тг) | Износ |`);
    a(`|---|---:|---:|---:|`);
    const faSorted = [...d.fa.rows].sort((x, y) => y.initialCost - x.initialCost);
    for (const row of faSorted.slice(0, 15)) {
      const wear = row.initialCost > 0 ? (row.accumulatedDepreciation / row.initialCost) * 100 : 0;
      const flag = wear > 70 ? " ⚠️" : wear < 10 ? " ✅" : "";
      a(`| ${row.name.slice(0, 50)} | ${fmt(row.initialCost)} | ${fmt(row.residualValue)} | ${wear.toFixed(0)}%${flag} |`);
    }
    a(``);
  }

  // ── 14. Условные блоки
  if (flags.showBio) {
    const bioTotal = herd + livestock;
    if (bioTotal > 0) {
      a(`## БИОЛОГИЧЕСКИЕ АКТИВЫ`);
      a(``);
      a(`| Счёт | Наименование | Остаток (тг) |`);
      a(`|---|---|---:|`);
      if (herd > 0) a(`| 2521 | Основное стадо (продуктивный / рабочий скот) | **${fmt(herd)}** |`);
      if (livestock > 0) a(`| 2950 | Животные на выращивании и откорме | **${fmt(livestock)}** |`);
      a(`| | **ИТОГО биологические активы** | **${fmt(bioTotal)}** |`);
      a(``);
    }
  }

  if (flags.showWip && buckets.production8.length > 0) {
    a(`## НЕЗАВЕРШЁННОЕ ПРОИЗВОДСТВО (Раздел 8)`);
    a(``);
    a(`| Счёт | Наименование | Об. Дт | Об. Кт | Кон. остаток |`);
    a(`|---|---|---:|---:|---:|`);
    const wipTotal = buckets.production8.reduce((s, r) => s + r.closingDr, 0);
    for (const r of buckets.production8.sort((x, y) => x.accountCode.localeCompare(y.accountCode))) {
      a(`| ${r.accountCode} | ${r.accountName} | ${fmt(r.turnoverDr)} | ${fmt(r.turnoverCr)} | **${fmt(r.closingDr)}** |`);
    }
    a(`| | **ИТОГО НЗП** | | | **${fmt(wipTotal)}** |`);
    a(``);
  }

  if (flags.showGoodsMargin && goods1330 > 0) {
    a(`## ТОВАРНЫЕ ЗАПАСЫ`);
    a(``);
    a(`| Счёт | Наименование | Нач. остаток | Об. Дт | Об. Кт | Кон. остаток |`);
    a(`|---|---|---:|---:|---:|---:|`);
    const r1330 = acc.get("1330");
    if (r1330) {
      a(`| 1330 | Товары | ${fmt(r1330.openingDr)} | ${fmt(r1330.turnoverDr)} | ${fmt(r1330.turnoverCr)} | **${fmt(r1330.closingDr)}** |`);
    }
    a(``);
  }

  // ── 15. Налоговая позиция
  a(`## НАЛОГОВАЯ ПОЗИЦИЯ`);
  a(``);
  a(`| Налог | К уплате / начислено (тг) | К возмещению (тг) | Нетто (тг) |`);
  a(`|---|---:|---:|---:|`);

  const kpnPay = cr(acc, "3110");
  const kpnRef = dr(acc, "1410");
  if (kpnPay > 0 || kpnRef > 0) {
    a(`| КПН (корпоративный подоходный налог) | ${fmt(kpnPay)} | ${fmt(kpnRef)} | **${fmt(kpnRef - kpnPay)}** |`);
  }
  if (vatOut > 0 || vatIn > 0) {
    a(`| НДС | ${fmt(vatOut)} | ${fmt(vatIn)} | **${fmt(vatIn - vatOut)}** |`);
  }
  const soc = cr(acc, "3211") + cr(acc, "3212") + cr(acc, "3213") + cr(acc, "3220") + cr(acc, "3250");
  if (soc > 0) {
    a(`| Социальные платежи (ОПВ/СО/ВОСМС/ООСМС) | ${fmt(soc)} | — | **${fmt(-soc)}** |`);
  }
  const iin = cr(acc, "3120");
  if (iin > 0) {
    a(`| ИПН (индивидуальный подоходный налог) | ${fmt(iin)} | — | **${fmt(-iin)}** |`);
  }
  const taxOther = cr(acc, "3170");
  if (taxOther > 0) {
    a(`| Прочие налоги и сборы (3170) | ${fmt(taxOther)} | — | **${fmt(-taxOther)}** |`);
  }
  a(``);

  // ── 16. Финансовая диагностика
  a(`## ФИНАНСОВАЯ ДИАГНОСТИКА`);
  a(``);
  a(`*Отраслевые нормы: ${flags.label}*`);
  a(``);
  a(`| Коэффициент | Значение | Норма отрасли | Оценка |`);
  a(`|---|---|---|---|`);

  const absLiq = ap > 0 ? cash / ap : Infinity;
  const liqStr = isFinite(absLiq) ? `${absLiq.toFixed(2)}x` : "∞";
  const liqThreshold = parseFloat(benchmarks.liqNorm.replace(">", "").replace("x", ""));
  a(`| Абсолютная ликвидность (Д/КЗ) | ${liqStr} | ${benchmarks.liqNorm} | ${absLiq > liqThreshold ? "✅" : "⚠️"} |`);

  const leverage = totalEquity5 > 0 ? (totalDebt / totalEquity5) * 100 : 0;
  const levThreshold = parseFloat(benchmarks.leverageNorm.replace("<", "").replace("%", ""));
  a(`| Долговая нагрузка (займы/капитал) | ${leverage.toFixed(1)}% | ${benchmarks.leverageNorm} | ${leverage < levThreshold ? "✅" : "⚠️"} |`);

  if (cogs > 0 && revenue > 0) {
    const grossMargin = (grossProfit / revenue) * 100;
    const marginThreshold = parseFloat(benchmarks.marginNorm.replace(">", "").replace("%", ""));
    a(`| Валовая маржа (Выр−СС)/Выр | ${grossMargin.toFixed(1)}% | ${benchmarks.marginNorm} | ${grossMargin > marginThreshold ? "✅" : "⚠️"} |`);
  }

  if (ar > 0 && revenue > 0) {
    const arDays = (ar / revenue) * 365;
    const arThreshold = parseFloat(benchmarks.arDaysNorm.replace("<", "").replace(" дн", ""));
    a(`| Дней дебиторки (ДЗ/Выр × 365) | ${arDays.toFixed(0)} дн | ${benchmarks.arDaysNorm} | ${arDays < arThreshold ? "✅" : "⚠️"} |`);
  }

  if (d.purchases.totals.amount > 0 && revenue > 0) {
    const va = revenue / d.purchases.totals.amount;
    a(`| Мультипликатор доб. стоимости | ${va.toFixed(1)}x | >2x | ${va > 2 ? "✅" : "⚠️"} |`);
  }

  const npTotal = equityNpCur + equityNpPrev;
  a(`| Накопленная прибыль | ${fmt(npTotal)} тг | >0 | ${npTotal > 0 ? "✅" : "🔴"} |`);
  a(``);

  if (loans === 0 && loansOpen > 0) {
    a(`> ✅ Краткосрочные банковские займы полностью погашены в периоде (было ${fmt(loansOpen)} тг).`);
    a(``);
  } else if (loans > 0) {
    a(`> ⚠️ Остаток краткосрочных займов: **${fmt(loans)} тг**.`);
    a(``);
  }

  // ── 17. Риски
  a(`## РИСКИ`);
  a(``);
  a(`| Уровень | Риск | Факт | Последствие |`);
  a(`|---|---|---|---|`);

  if (advancesOut > cash) {
    a(`| 🔴 Критический | Авансы выданные > денежные средства | ${fmt(advancesOut)} тг выдано vs ${fmt(cash)} тг на счетах | Кассовый разрыв при невозврате |`);
  }
  if (d.debtors.rows.length > 0) {
    const topD = [...d.debtors.rows].sort((a, b) => b.balanceDr - a.balanceDr)[0];
    if (topD) {
      const pctD = d.debtors.total > 0 ? (topD.balanceDr / d.debtors.total) * 100 : 0;
      if (pctD > 50) {
        a(`| 🔴 Критический | Концентрация дебиторки | ${pctD.toFixed(0)}% ДЗ у «${topD.contractorName}» | Потеря ${fmt(topD.balanceDr)} тг при дефолте |`);
      }
    }
  }
  if (faWearPct > 60) {
    a(`| 🟠 Высокий | Износ ОС ${faWearPct.toFixed(0)}% | Остаточная ст-ть ${fmt(faNet)} тг из ${fmt(faGross)} тг | Операционные сбои, capex давление |`);
  }
  if (vatNet > 0) {
    a(`| 🟡 Средний | НДС нетто к уплате | ${fmt(vatNet)} тг | Налоговое обязательство |`);
  }
  if (revenue > 0 && salesByItem.length > 0) {
    const [topItem, topItemD] = salesByItem[0]!;
    const pctItem = (topItemD.amount / revenue) * 100;
    if (pctItem > 50) {
      a(`| 🟠 Высокий | Концентрация выручки | ${pctItem.toFixed(0)}% от «${topItem.slice(0, 30)}» | Ценовая / спросовая волатильность |`);
    }
  }
  if (salesByCtr.length > 0) {
    const [topCtr, topAmt] = salesByCtr[0]!;
    const topPct = revenue > 0 ? (topAmt / revenue) * 100 : 0;
    if (topPct > 40) {
      a(`| 🟠 Высокий | Концентрация покупателей | ${topPct.toFixed(0)}% выручки — «${topCtr}» | Потеря ключевого клиента |`);
    }
  }
  if (cfNet < 0) {
    a(`| 🟠 Высокий | Отрицательный денежный поток | ${fmt(cfNet)} тг нетто за период | Истощение ликвидности |`);
  }
  if (totalDebt > totalEquity5 * 0.8) {
    a(`| 🟡 Средний | Высокая долговая нагрузка | Долг ${fmt(totalDebt)} тг vs капитал ${fmt(totalEquity5)} тг | Риск рефинансирования |`);
  }
  a(``);

  // ── 18. Возможности роста
  a(`## ВОЗМОЖНОСТИ РОСТА`);
  a(``);
  const opportunities: string[] = [];
  if (npTotal > 0 && faWearPct > 50) {
    opportunities.push(`Обновление основных средств за счёт накопленной прибыли (${fmt(npTotal)} тг) — снизит операционные риски и amortization давление.`);
  }
  if (ar > revenue * 0.3) {
    opportunities.push(`Ускорение оборачиваемости дебиторки: сокращение срока ДЗ с текущих ${revenue > 0 ? ((ar / revenue) * 365).toFixed(0) : "—"} дней высвободит оборотные средства.`);
  }
  if (salesByCtr.length > 0 && salesByCtr[0] && (salesByCtr[0][1] / revenue) > 0.4) {
    opportunities.push(`Диверсификация клиентской базы: снижение зависимости от топ-покупателя (${(salesByCtr[0][1] / revenue * 100).toFixed(0)}% выручки).`);
  }
  if (salesByItem.length > 1 && salesByItem[0] && (salesByItem[0][1].amount / revenue) > 0.5) {
    opportunities.push(`Расширение продуктового портфеля: топ-продукт — ${(salesByItem[0][1].amount / revenue * 100).toFixed(0)}% выручки, риск моноконцентрации.`);
  }
  if (vatIn > vatOut && vatIn > 0) {
    opportunities.push(`НДС к возмещению (${fmt(vatIn)} тг) — ускорить процедуру возврата для улучшения ликвидности.`);
  }
  if (opportunities.length === 0) {
    opportunities.push("Оптимизация оборотного капитала и сокращение операционных расходов.");
    opportunities.push("Развитие новых рынков сбыта для снижения концентрационных рисков.");
    opportunities.push("Автоматизация учётных процессов для ускорения закрытия периода.");
  }
  for (const opp of opportunities.slice(0, 5)) {
    a(`- ${opp}`);
  }
  a(``);

  // ── 19. Рекомендации
  a(`## РЕКОМЕНДАЦИИ РУКОВОДСТВУ`);
  a(``);
  a(`**[Немедленно — до 30 дней]**`);
  a(``);
  if (advancesOut > 0) a(`- Получить расшифровку авансов выданных (${fmt(advancesOut)} тг) — сверить с поставщиками, установить сроки поставки.`);
  if (d.debtors.rows.length > 0) a(`- Провести акт сверки с топ-дебитором, зафиксировать график погашения.`);
  if (vatNet > 0) a(`- Проверить полноту НДС-вычетов (НДС нетто к уплате: ${fmt(vatNet)} тг).`);
  a(``);
  a(`**[Краткосрочно — до 6 месяцев]**`);
  a(``);
  if (faWearPct > 60) a(`- Разработать план capex для замены объектов ОС с износом >70%.`);
  if (ar > revenue * 0.3) a(`- Ввести кредитную политику: ограничить сроки отсрочки, усилить контроль ДЗ.`);
  if (totalDebt > 0) a(`- Разработать план погашения займов (текущий долг: ${fmt(totalDebt)} тг).`);
  a(``);
  a(`**[Стратегически — 1–3 года]**`);
  a(``);
  a(`- Диверсифицировать продукты, рынки и клиентов для снижения концентрационных рисков.`);
  if (npTotal > revenue) a(`- Рассмотреть инвестиционную программу развития за счёт накопленной прибыли.`);
  else a(`- Наращивать операционную маржу через оптимизацию себестоимости и управление накладными расходами.`);
  a(``);

  // ── 20. Итоговое заключение
  a(`## ИТОГОВОЕ ЗАКЛЮЧЕНИЕ`);
  a(``);

  let score = 3;
  if (absLiq > liqThreshold) score++;
  else if (isFinite(absLiq) && absLiq < liqThreshold / 2) score--;
  if (totalDebt === 0) score++;
  else if (leverage > levThreshold) score--;
  if (cfNet < 0) score--;
  if (faWearPct > 70) score--;
  if (npTotal > 0) score++;
  score = Math.max(1, Math.min(5, score));
  const stars = "★".repeat(score) + "☆".repeat(5 - score);

  a(`**Рейтинг финансового состояния: ${stars} (${score}/5)**`);
  a(``);
  a(`**${d.orgName}** (${flags.label}) — компания с выручкой **${fmt(revenue)} тг** за период, денежными средствами **${fmt(cash)} тг** и капиталом **${fmt(totalEquity5)} тг**.`);
  if (totalDebt === 0) a(`Долговая нагрузка отсутствует — высокая финансовая независимость.`);
  else a(`Совокупный долг: **${fmt(totalDebt)} тг** (${leverage.toFixed(1)}% от капитала).`);
  a(`Чистый денежный поток за период: **${cfNet >= 0 ? "+" : ""}${fmt(cfNet)} тг**. Накопленная прибыль: **${fmt(npTotal)} тг**.`);
  a(``);

  a(`---`);
  a(``);
  a(`*[AI_ANALYSIS_PLACEHOLDER]*`);

  return L.join("\n");
}

// ── AI analysis ───────────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `Ты — старший финансовый аналитик инвестиционного класса. Тебе предоставлены финансовые данные
компании из системы 1С (Казахстан). Твоя задача: написать профессиональное аналитическое
заключение на русском языке.

ДАННЫЕ:
{METRICS_JSON}

ИНСТРУКЦИЯ:
1. Используй указанную отрасль для отраслевого контекста.
2. Все выводы делай с конкретными цифрами из данных.
3. Не повторяй таблицы — только интерпретация.

Напиши строго следующие разделы в Markdown:

## ОТРАСЛЕВОЙ КОНТЕКСТ
Бизнес-модель компании, отраслевые особенности, масштаб.

## ОПЕРАЦИОННЫЙ АНАЛИЗ
НЗП, запасы, авансы, ОС. Сезонность потоков. Качество активов.

## ФИНАНСОВЫЕ РИСКИ И ВОЗМОЖНОСТИ
Минимум 5 конкретных рисков и 3–5 возможностей роста с обоснованием.

## ПРОГНОЗ И СТРАТЕГИЯ
Краткосрочный прогноз (6 мес) и стратегические инициативы (1–3 года).

Тон: профессиональный, деловой, конкретный. Без общих фраз.`;

async function generateAiAnalysis(
  d: CollectedData,
  buckets: OsvBuckets,
  acc: OsvMap,
  industry: string,
  revenue: number,
  cash: number,
  totalDebt: number,
  equityTotal: number,
  cfNet: number,
  salesByItem: [string, { qty: number; amount: number }][],
  salesByCtr: [string, number][],
): Promise<string> {
  const llm = resolveLlm();
  if (!llm) return fallbackAiSection();

  const summary = {
    org: d.orgName,
    period: `${d.dateFrom} – ${d.dateTo}`,
    industry,
    cash_tg: cash,
    debtors_tg: d.debtors.total,
    advances_given_tg: dr(acc, "1710"),
    materials_tg: dr(acc, "1310"),
    finished_goods_tg: dr(acc, "1320"),
    fixed_assets_net_tg: d.fa.totals.residualValue,
    fixed_assets_wear_pct: d.fa.totals.initialCost > 0 ? Math.round(d.fa.totals.accumulatedDepreciation / d.fa.totals.initialCost * 100) : 0,
    bank_loans_short_tg: totalDebt,
    ap_tg: cr(acc, "3310"),
    equity_tg: equityTotal,
    revenue_tg: revenue,
    purchases_tg: d.purchases.totals.amount,
    cf_net_tg: cfNet,
    top_products: salesByItem.slice(0, 8).map(([item, v]) => ({ item, amount: v.amount })),
    top_buyers: salesByCtr.slice(0, 5).map(([buyer, amount]) => ({ buyer, amount })),
    cashflow_months: d.cashflow.months,
    creditors_detail: d.detailedCreditors.rows.slice(0, 5).map(r => ({ name: r.contractorName, balance: r.balance, age: r.ageCategory })),
    advances_received: d.advancesReceived.rows.slice(0, 5).map(r => ({ name: r.contractorName, balance: r.balance })),
  };

  const prompt = ANALYSIS_PROMPT.replace("{METRICS_JSON}", JSON.stringify(summary, null, 2));
  try {
    const res = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(llm.apiKey ? { Authorization: `Bearer ${llm.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: llm.model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return fallbackAiSection(`LLM вернул ошибку ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = await res.json() as { choices?: { message?: { content?: string } }[] };
    const text = json?.choices?.[0]?.message?.content;
    return (typeof text === "string" && text.trim()) ? text : fallbackAiSection("LLM вернул пустой ответ.");
  } catch (e) {
    return fallbackAiSection(`Не удалось вызвать LLM: ${e}`);
  }
}

// Провайдер-агностичный LLM через OpenAI-совместимый /chat/completions.
// Настройки в .env: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL (любой провайдер: OpenAI,
// OpenRouter, DeepSeek, Groq, локальный Ollama/LM Studio, Anthropic compat-endpoint).
function resolveLlm(): { baseUrl: string; apiKey: string; model: string } | null {
  const baseUrl = (process.env["LLM_BASE_URL"] ?? "").replace(/\/$/, "");
  const apiKey  = process.env["LLM_API_KEY"] ?? "";
  const model   = process.env["LLM_MODEL"] ?? "";
  if (baseUrl && model) return { baseUrl, apiKey, model };
  // обратная совместимость: Anthropic через OpenAI-совместимый endpoint
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    return {
      baseUrl: "https://api.anthropic.com/v1",
      apiKey: anthropicKey,
      model: model || "claude-sonnet-4-6",
    };
  }
  return null;
}

function fallbackAiSection(reason?: string): string {
  const why = reason ?? "Задайте в `.env`: `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (любой OpenAI-совместимый провайдер).";
  return `> *Расширенный AI-дайджест недоступен. ${why}*`;
}

// ── tool registration ─────────────────────────────────────────────────────────

export function registerFullReportTools(
  server: McpServer,
  reports: ReportsService,
  catalog: CatalogService,
  accountsService: AccountsService,
): void {
  server.tool(
    "onec_generate_full_report",
    "Генерирует глубокий финансово-промышленный отчёт в формате Markdown для любой организации в 1С. " +
    "Работает с любой отраслью: торговля, производство, услуги, строительство, транспорт, АПК — " +
    "отрасль определяется автоматически. " +
    "Собирает ОСВ (все разделы 1–8), расшифровки: дебиторка, кредиторка с aging, авансы выданные/полученные, " +
    "займы и кредиты по займодавцу, продажи, закупки, ОС, денежные потоки. " +
    "Формирует: полный баланс из ОСВ, P&L, сводную структуру баланса, налоговую позицию, " +
    "финансовую диагностику с отраслевыми бенчмарками, риски и рекомендации руководству. " +
    "При заданных LLM-настройках (LLM_BASE_URL/LLM_API_KEY/LLM_MODEL — любой OpenAI-совместимый провайдер: " +
    "OpenAI, OpenRouter, DeepSeek, Groq, локальный Ollama/LM Studio, Anthropic) — AI-дайджест; иначе — детерминированный анализ.",
    {
      organizationGuid: z.string().uuid().describe("Ref_Key организации из справочника Организации 1С"),
      dateFrom: z.string().optional().describe("Начало периода YYYY-MM-DD (по умолчанию: 01.01 текущего года)"),
      dateTo: z.string().optional().describe("Конец периода YYYY-MM-DD (по умолчанию: сегодня)"),
      outputFile: z.string().optional().describe("Путь для сохранения MD-файла"),
      industryOverride: z.enum(["agro","manufacturing","trade","services","construction","transport","universal"]).optional()
        .describe("Принудительно задать отрасль (если авто-определение неточно)"),
    },
    async ({ organizationGuid, dateFrom, dateTo, outputFile }) => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const from = dateFrom ?? `${today.slice(0, 4)}-01-01`;
        const to   = dateTo   ?? today;

        const data    = await collectAll(reports, catalog, organizationGuid, from, to);
        const acc     = buildOsvMap(data.osv.rows);
        const buckets = groupBySection(data.osv.rows);

        const salesByItem = (() => {
          const byItem = new Map<string, { qty: number; amount: number }>();
          for (const r of data.sales.rows) {
            const prev = byItem.get(r.item) ?? { qty: 0, amount: 0 };
            byItem.set(r.item, { qty: prev.qty + r.qty, amount: prev.amount + r.amount });
          }
          return [...byItem.entries()].sort((a, b) => b[1].amount - a[1].amount);
        })();
        const salesByCtr = (() => {
          const byCtr = new Map<string, number>();
          for (const r of data.sales.rows) byCtr.set(r.contractor, (byCtr.get(r.contractor) ?? 0) + r.amount);
          return [...byCtr.entries()].sort((a, b) => b[1] - a[1]);
        })();

        const { industry, flags } = detectIndustry(salesByItem.map(([i]) => i), data.sales.rows.map(r => r.lineType), acc);
        const revenue    = data.sales.totals.amount;
        const cash       = dr(acc, "1010") + dr(acc, "1030") + dr(acc, "1050");
        const loans      = cr(acc, "3010") + cr(acc, "3020") + cr(acc, "3030");
        const loansLong  = cr(acc, "4010") + cr(acc, "4020") + cr(acc, "4030") + cr(acc, "4150");
        const totalDebt  = loans + loansLong;
        const equityTotal = buckets.equity5.reduce((s, r) => s + r.closingCr, 0);
        const cfNet      = data.cashflow.totals.net;

        const reportMd = buildReport(data, accountsService);
        const aiText   = await generateAiAnalysis(data, buckets, acc, flags.label, revenue, cash, totalDebt, equityTotal, cfNet, salesByItem, salesByCtr);

        const toFormatted = to.split("-").reverse().join(".");
        let finalMd = reportMd.replace(
          "*[AI_ANALYSIS_PLACEHOLDER]*",
          `${aiText}\n\n---\n\n*Отчёт сформирован инструментом \`onec_generate_full_report\` | ${toFormatted}*`,
        );

        const safeName = data.orgName
          .replace(/[«»""'']/g, "")
          .replace(/[^\wа-яёА-ЯЁ\s\-]/g, "")
          .trim()
          .replace(/\s+/g, "_");
        const [yyyy, mm, dd] = to.split("-");
        const dateTag = `${dd}${mm}${yyyy}`;
        const defaultPath = join("C:\\Users\\PC\\Desktop\\AI-BOS-2.0", `Аналитика_${safeName}_${dateTag}.md`);
        const savePath = outputFile ?? defaultPath;
        try {
          mkdirSync(dirname(savePath), { recursive: true });
          writeFileSync(savePath, finalMd, "utf-8");
          finalMd += `\n\n> 💾 Файл сохранён: \`${savePath}\``;
        } catch (e) {
          finalMd += `\n\n> ⚠️ Ошибка сохранения файла: ${e}`;
        }

        return { content: [{ type: "text" as const, text: finalMd }] };
      } catch (e) { return wrapError(e); }
    },
  );
}
