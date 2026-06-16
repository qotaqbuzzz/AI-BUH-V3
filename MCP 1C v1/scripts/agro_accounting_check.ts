/**
 * Аудит проводок — все счета + выявление ошибок в цепочке растениеводства
 *
 * Подход (document-first, обход ограничений сервера):
 *   1. Загружаем заголовки документов (3 типа)
 *   2. Для каждого документа: RecordSet → ALL проводки + собираем Account GUID-ы
 *   3. Batch-resolve GUID → код/наименование (ChartOfAccounts по Ref_Key, 15 шт.)
 *   4. BalanceAndTurnovers С фильтром по найденным GUID-ам → ОСВ
 *   5. Матрица Дт/Кт по всем счетам + чек-лист ошибок 8110→1320→7010
 *
 * Почему НЕ используем BalanceAndTurnovers без фильтра:
 *   Сервер 1С вычисляет агрегат за ВСЁ время → timeout >90с.
 *   BalanceAndTurnovers С фильтром по GUID работает быстро.
 *
 * Usage: npx tsx scripts/agro_accounting_check.ts
 */

import { writeFileSync } from "fs";
import { OneCClient } from "@aibos/onec-client";
import { loadConfig } from "../apps/mcp/src/config.js";

// ── Branded types ─────────────────────────────────────────────────────────────
type Brand<T, B extends string> = T & { readonly __brand: B };
type Guid        = Brand<string, "Guid">;
type AccountCode = Brand<string, "AccountCode">;

// ── Domain types ──────────────────────────────────────────────────────────────
interface AccountInfo {
  readonly guid: Guid;
  readonly code: AccountCode;
  readonly name: string;
}

interface OsvEntry {
  openDr: number; openCr: number;
  turnDr: number; turnCr: number;
  closeDr: number; closeCr: number;
}

interface JournalLine {
  readonly date:      string;
  readonly docType:   string;
  readonly docGuid:   Guid;
  readonly docNumber: string;
  readonly drGuid:    Guid;
  readonly drCode:    AccountCode;
  readonly drName:    string;
  readonly crGuid:    Guid;
  readonly crCode:    AccountCode;
  readonly crName:    string;
  readonly amount:    number;
  readonly note:      string;
}

interface CorrEntry {
  readonly drCode: AccountCode;
  readonly drName: string;
  readonly crCode: AccountCode;
  readonly crName: string;
  count:  number;
  amount: number;
  readonly docTypes: Set<string>;
}

type CheckStatus = "OK" | "WARN" | "ERROR" | "INFO";
interface CheckResult {
  readonly id:          string;
  readonly description: string;
  readonly status:      CheckStatus;
  readonly detail:      string;
  readonly amount?:     number;
}

// ── OData raw response shapes ─────────────────────────────────────────────────
interface BtRow {
  Account_Key?:            string;
  СуммаOpeningBalanceDr?:  number;
  СуммаOpeningBalanceCr?:  number;
  СуммаTurnoverDr?:        number;
  СуммаTurnoverCr?:        number;
  СуммаClosingBalanceDr?:  number;
  СуммаClosingBalanceCr?:  number;
}
interface ChartRow  { Ref_Key: string; Code: string; Description: string; }
interface DocRow    { Ref_Key: string; Date?: string; Number?: string; }
interface RecordSetRow {
  Period?:        string;
  AccountDr_Key?: string;
  AccountCr_Key?: string;
  Сумма?:         number;
  Содержание?:    string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number): string =>
  n === 0 ? "0" : n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (v: unknown): string => {
  const s = String(v ?? "");
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const row = (...cols: unknown[]): string => cols.map(esc).join(",");

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const zeroOsv = (): OsvEntry => ({ openDr: 0, openCr: 0, turnDr: 0, turnCr: 0, closeDr: 0, closeCr: 0 });

// ── Doc configs ───────────────────────────────────────────────────────────────
const DOC_CONFIGS = [
  { type: "Document_ЗакрытиеМесяца",         filter: "DeletionMark eq false" },
  { type: "Document_РеализацияТоваровУслуг", filter: "Posted eq true and DeletionMark eq false" },
  { type: "Document_ОперацияБух",             filter: "Posted eq true and DeletionMark eq false" },
  { type: "Document_СписаниеТоваров",         filter: "Posted eq true and DeletionMark eq false" },
] as const;

// ── Init ──────────────────────────────────────────────────────────────────────
const { onec } = loadConfig();
const client = new OneCClient({ ...onec, timeoutMs: 90_000 });

// ══════════════════════════════════════════════════════════════════════════════
//  ШАГ 1: Загрузка заголовков документов
// ══════════════════════════════════════════════════════════════════════════════
console.log("\nАудит проводок — все счета + цепочка растениеводства");
console.log("═".repeat(66));
console.log("Шаг 1: Загрузка документов...");

interface DocMeta { guid: Guid; docType: string; label: string; date: string; number: string; }
const allDocMeta: DocMeta[] = [];

for (const { type, filter } of DOC_CONFIGS) {
  const label = type.replace("Document_", "");
  const docs = await client.getCollection<DocRow>(type, {
    filter,
    select: "Ref_Key,Date,Number",
    top: 3000,
  }).catch((e: unknown) => {
    console.warn(`  ⚠ ${label}: ошибка загрузки — ${e instanceof Error ? e.message.slice(0, 60) : e}`);
    return [] as DocRow[];
  });
  console.log(`  ${label.padEnd(35)} ${docs.length} шт`);
  for (const d of docs) {
    allDocMeta.push({
      guid: d.Ref_Key as Guid,
      docType: type,
      label,
      date: d.Date ?? "",
      number: d.Number ?? "",
    });
  }
}

console.log(`  Итого документов: ${allDocMeta.length}`);
if (allDocMeta.length === 0) {
  console.error("  Нет документов — сервер недоступен или база пуста.");
  process.exit(1);
}

// ══════════════════════════════════════════════════════════════════════════════
//  ШАГ 2: Проводки из RecordSet (все документы, все счета)
// ══════════════════════════════════════════════════════════════════════════════
console.log("\nШаг 2: Сбор проводок из RecordSet (все документы)...");

const allLines: JournalLine[] = [];
const discoveredGuids = new Set<Guid>();  // для batch ChartOfAccounts → все GUID-ы из проводок

// Временная заглушка: пока коды неизвестны — используем GUID-префикс
const tmpCode = (g: string): AccountCode => (g || "???").slice(0, 8) as AccountCode;

let processed = 0;
for (const doc of allDocMeta) {
  processed++;
  if (processed % 50 === 0) process.stdout.write(`  прогресс: ${processed}/${allDocMeta.length}\r`);

  const entries = await client.getCollection<RecordSetRow>(
    `${doc.docType}(guid'${doc.guid}')/AccountingRegister_Типовой_RecordSet`,
    { select: "Period,AccountDr_Key,AccountCr_Key,Сумма,Содержание", top: 500 },
  ).catch(() => [] as RecordSetRow[]);

  for (const e of entries) {
    const drGuid = (e.AccountDr_Key ?? "") as Guid;
    const crGuid = (e.AccountCr_Key ?? "") as Guid;
    if (!drGuid && !crGuid) continue;
    if (drGuid) discoveredGuids.add(drGuid);
    if (crGuid) discoveredGuids.add(crGuid);

    allLines.push({
      date:      (e.Period ?? doc.date).slice(0, 10),
      docType:   doc.label,
      docGuid:   doc.guid,
      docNumber: doc.number,
      drGuid,
      drCode:    tmpCode(drGuid),
      drName:    "",
      crGuid,
      crCode:    tmpCode(crGuid),
      crName:    "",
      amount:    e.Сумма ?? 0,
      note:      e.Содержание ?? "",
    });
  }
}

process.stdout.write("\n");
console.log(`  Проводок собрано: ${allLines.length}`);
console.log(`  Уникальных счетов в проводках: ${discoveredGuids.size}`);

if (allLines.length === 0) {
  console.warn("  Проводок нет — RecordSet пуст или все документы без бухгалтерских записей.");
}

// ══════════════════════════════════════════════════════════════════════════════
//  ШАГ 3: Разрешение GUID → код/наименование (batch по Ref_Key, 15 шт.)
// ══════════════════════════════════════════════════════════════════════════════
console.log("\nШаг 3: Разрешение кодов счетов (ChartOfAccounts batch)...");

const byGuid = new Map<Guid, AccountInfo>();
const byCode = new Map<AccountCode, AccountInfo>();

const guidList = [...discoveredGuids];
for (const batch of chunk(guidList, 15)) {
  const filter = batch.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
  const rows = await client.getCollection<ChartRow>(
    "ChartOfAccounts_Типовой",
    { filter, select: "Ref_Key,Code,Description", top: batch.length + 5 },
  ).catch(() => [] as ChartRow[]);

  for (const r of rows) {
    if (!r.Ref_Key) continue;
    const info: AccountInfo = {
      guid: r.Ref_Key as Guid,
      code: (r.Code ?? "") as AccountCode,
      name: r.Description ?? "",
    };
    byGuid.set(info.guid, info);
    if (info.code && !byCode.has(info.code)) byCode.set(info.code, info);
  }
}

console.log(`  Разрешено: ${byGuid.size} из ${guidList.length}`);

// Helper: resolved code or fallback GUID-prefix
const getInfo = (g: Guid): AccountInfo =>
  byGuid.get(g) ?? { guid: g, code: g.slice(0, 8) as AccountCode, name: "" };

// Back-fill resolved codes/names into allLines
for (const line of allLines as JournalLine[]) {
  const mutable = line as {
    drCode: AccountCode; drName: string;
    crCode: AccountCode; crName: string;
  };
  const dr = getInfo(line.drGuid);
  const cr = getInfo(line.crGuid);
  mutable.drCode = dr.code;
  mutable.drName = dr.name;
  mutable.crCode = cr.code;
  mutable.crName = cr.name;
}

// ── List all discovered accounts ─────────────────────────────────────────────
const allAccounts: Array<AccountInfo & { totalTurnDr: number; totalTurnCr: number }> = [];
const turnByGuid = new Map<Guid, { dr: number; cr: number }>();
for (const line of allLines) {
  const addTurn = (g: Guid, side: "dr" | "cr") => {
    const ex = turnByGuid.get(g) ?? { dr: 0, cr: 0 };
    ex[side] += line.amount;
    turnByGuid.set(g, ex);
  };
  if (line.drGuid) addTurn(line.drGuid, "dr");
  if (line.crGuid) addTurn(line.crGuid, "cr");
}
for (const guid of discoveredGuids) {
  const info = getInfo(guid);
  const t = turnByGuid.get(guid) ?? { dr: 0, cr: 0 };
  allAccounts.push({ ...info, totalTurnDr: t.dr, totalTurnCr: t.cr });
}
allAccounts.sort((a, b) => a.code.localeCompare(b.code));

console.log("\nВсе счета, задействованные в проводках:");
for (const acc of allAccounts) {
  console.log(
    `  ${acc.code.padEnd(10)} ${acc.name.slice(0, 38).padEnd(38)}` +
    `  Дт:${fmt(acc.totalTurnDr).padStart(20)}  Кт:${fmt(acc.totalTurnCr).padStart(20)}`,
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ШАГ 4: ОСВ через BalanceAndTurnovers (с фильтром по найденным GUID-ам)
// ══════════════════════════════════════════════════════════════════════════════
console.log("\nШаг 4: BalanceAndTurnovers с фильтром по найденным счетам...");

const btByGuid = new Map<Guid, OsvEntry>();

if (guidList.length > 0) {
  // Split large GUID lists into chunks (OData filter length limit)
  const guidBatches = chunk(guidList, 30);
  for (const batch of guidBatches) {
    const filter = batch.map(g => `Account_Key eq guid'${g}'`).join(" or ");
    const rows = await client.getBalanceAndTurnovers<BtRow>("AccountingRegister_Типовой", {
      filter,
      select: "Account_Key,СуммаOpeningBalanceDr,СуммаOpeningBalanceCr,СуммаTurnoverDr,СуммаTurnoverCr,СуммаClosingBalanceDr,СуммаClosingBalanceCr",
      top: 2000,
    }).catch((e: unknown) => {
      console.warn(`  ⚠ BalanceAndTurnovers batch ошибка: ${e instanceof Error ? e.message.slice(0, 80) : e}`);
      return [] as BtRow[];
    });

    for (const r of rows) {
      const g = (r.Account_Key ?? "") as Guid;
      if (!g) continue;
      const ex = btByGuid.get(g) ?? zeroOsv();
      ex.openDr  += r.СуммаOpeningBalanceDr  ?? 0;
      ex.openCr  += r.СуммаOpeningBalanceCr  ?? 0;
      ex.turnDr  += r.СуммаTurnoverDr        ?? 0;
      ex.turnCr  += r.СуммаTurnoverCr        ?? 0;
      ex.closeDr += r.СуммаClosingBalanceDr  ?? 0;
      ex.closeCr += r.СуммаClosingBalanceCr  ?? 0;
      btByGuid.set(g, ex);
    }
  }
  console.log(`  ОСВ загружен для ${btByGuid.size} счетов`);
} else {
  console.warn("  Нет GUID-ов для ОСВ-запроса");
}

// Build osvByCode
const osvByCode = new Map<AccountCode, OsvEntry>();
for (const [g, v] of btByGuid) {
  const code = getInfo(g).code;
  if (!code || code.length < 4) continue;
  const base = osvByCode.get(code) ?? zeroOsv();
  base.openDr  += v.openDr;  base.openCr  += v.openCr;
  base.turnDr  += v.turnDr;  base.turnCr  += v.turnCr;
  base.closeDr += v.closeDr; base.closeCr += v.closeCr;
  osvByCode.set(code, base);
}

// Helper: OSV by code prefix
const osv = (prefix: string): OsvEntry => {
  const entry = [...osvByCode.entries()].find(([k]) => k.startsWith(prefix));
  return entry?.[1] ?? zeroOsv();
};

const KEY_CHAIN = ["8110", "1310", "1320", "1330", "7010", "6010"] as const;
console.log("\nОСВ по ключевым счетам цепочки:");
for (const prefix of KEY_CHAIN) {
  const v = osv(prefix);
  if (!v.turnDr && !v.turnCr) { console.log(`  ${prefix.padEnd(10)} — нет данных`); continue; }
  const saldo = v.closeDr - v.closeCr;
  console.log(
    `  ${prefix.padEnd(10)}  Дт:${fmt(v.turnDr).padStart(22)}  Кт:${fmt(v.turnCr).padStart(22)}  Сальдо:${fmt(saldo).padStart(18)}`,
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ШАГ 5: Матрица корреспонденции (все Дт/Кт пары)
// ══════════════════════════════════════════════════════════════════════════════
const corrMap = new Map<string, CorrEntry>();
for (const line of allLines) {
  const key = `${line.drCode}|${line.crCode}`;
  const ex = corrMap.get(key);
  if (ex) {
    ex.count++;
    ex.amount += line.amount;
    ex.docTypes.add(line.docType);
  } else {
    corrMap.set(key, {
      drCode: line.drCode, drName: line.drName,
      crCode: line.crCode, crName: line.crName,
      count: 1, amount: line.amount,
      docTypes: new Set([line.docType]),
    });
  }
}
const corrSorted = [...corrMap.values()].sort((a, b) => b.amount - a.amount);

// ══════════════════════════════════════════════════════════════════════════════
//  ШАГ 6: Чек-лист ошибок
// ══════════════════════════════════════════════════════════════════════════════
const corrAmount = (drPrefix: string, crPrefix: string): number =>
  [...corrMap.values()]
    .filter(c => c.drCode.startsWith(drPrefix) && c.crCode.startsWith(crPrefix))
    .reduce((s, c) => s + c.amount, 0);

const checks: CheckResult[] = [];

const c1 = corrAmount("7010", "1320");
checks.push({
  id: "CHECK-1", description: "Дт 7010 / Кт 1320 — основная цепочка себестоимости",
  status: c1 > 0 ? "OK" : "ERROR",
  detail: c1 > 0 ? `Проводок на ${fmt(c1)} тг — цепочка работает` : "Проводок Дт 7010/Кт 1320 нет — ЦЕПОЧКА НАРУШЕНА!",
  amount: c1,
});

const c2 = corrAmount("7010", "1330");
checks.push({
  id: "CHECK-2", description: "Дт 7010 / Кт 1330 — себестоимость покупных товаров",
  status: "INFO",
  detail: c2 > 0 ? `${fmt(c2)} тг — покупные товары корректно` : "Нет (покупные не реализовывались)",
  amount: c2,
});

const c3 = corrAmount("7010", "8110");
checks.push({
  id: "CHECK-3", description: "Дт 7010 / Кт 8110 — прямое закрытие производства (минуя 1320)",
  status: c3 > 0 ? "WARN" : "OK",
  detail: c3 > 0 ? `${fmt(c3)} тг — затраты идут в себестоимость МИНУЯ счёт 1320` : "Нет прямых проводок (норма)",
  amount: c3,
});

const c4entries = [...corrMap.values()].filter(
  c => c.drCode.startsWith("7010") &&
       !c.crCode.startsWith("1320") &&
       !c.crCode.startsWith("1330") &&
       !c.crCode.startsWith("8110") &&
       !c.crCode.startsWith("5610"),
);
const c4 = c4entries.reduce((s, c) => s + c.amount, 0);
checks.push({
  id: "CHECK-4", description: "Дт 7010 / Кт нетипичные счета — возможные ошибки ввода",
  status: c4 > 0 ? "WARN" : "OK",
  detail: c4 > 0
    ? `НЕТИПИЧНЫЕ: ${c4entries.map(c => `Кт ${c.crCode}: ${fmt(c.amount)} тг`).join("; ")}`
    : "Нетипичных корреспонденций нет",
  amount: c4,
});

const c5 = corrAmount("1320", "8110");
checks.push({
  id: "CHECK-5", description: "Дт 1320 / Кт 8110 — оприходование урожая из производства",
  status: c5 > 0 ? "OK" : "WARN",
  detail: c5 > 0 ? `${fmt(c5)} тг — урожай оприходован из 8110` : "Нет переноса 8110→1320 — проверьте механизм оприходования",
  amount: c5,
});

const c6 = corrAmount("8110", "1310");
checks.push({
  id: "CHECK-6", description: "Дт 8110 / Кт 1310 — списание материалов в производство",
  status: c6 > 0 ? "OK" : "WARN",
  detail: c6 > 0 ? `${fmt(c6)} тг — материалы списаны` : "Нет списания материалов в производство",
  amount: c6,
});

const v8110 = osv("8110");
const bal8110 = v8110.closeDr - v8110.closeCr;
checks.push({
  id: "CHECK-7", description: "Остаток счёта 8110 — незакрытое производство",
  status: Math.abs(bal8110) < 1 ? "OK" : "WARN",
  detail: Math.abs(bal8110) < 1
    ? "Счёт 8110 закрыт полностью"
    : `Остаток ${fmt(bal8110)} тг — НЗП посевов или незакрытые затраты`,
  amount: bal8110,
});

const v7010 = osv("7010");
const bal7010 = v7010.closeDr - v7010.closeCr;
checks.push({
  id: "CHECK-8", description: "Остаток счёта 7010 — должен закрыться на 5610",
  status: Math.abs(bal7010) < 1 ? "OK" : "WARN",
  detail: Math.abs(bal7010) < 1
    ? "Счёт 7010 закрыт — норма"
    : `Остаток ${fmt(bal7010)} тг — ЗакрытиеМесяца не проведено`,
  amount: bal7010,
});

const dr7010   = v7010.turnDr;
const srcTotal = osv("1320").turnCr + osv("1330").turnCr;
const gap      = Math.abs(dr7010 - srcTotal);
const gapPct   = srcTotal > 0 ? (gap / srcTotal) * 100 : 0;
checks.push({
  id: "CHECK-9", description: "Баланс потоков: Дт 7010 ≈ Кт 1320 + Кт 1330",
  status: gapPct < 1 ? "OK" : gapPct < 10 ? "WARN" : "ERROR",
  detail: `Дт 7010: ${fmt(dr7010)} | Кт 1320+1330: ${fmt(srcTotal)} | Разница: ${fmt(gap)} (${gapPct.toFixed(1)}%)` +
    (gapPct >= 10 ? " — ЗНАЧИТЕЛЬНОЕ РАСХОЖДЕНИЕ!" : ""),
  amount: gap,
});

// ══════════════════════════════════════════════════════════════════════════════
//  КОНСОЛЬНЫЙ ВЫВОД
// ══════════════════════════════════════════════════════════════════════════════
const ICON: Record<CheckStatus, string> = { OK: "✓", WARN: "⚠", ERROR: "✗", INFO: "ℹ" };

console.log("\n" + "═".repeat(66));
console.log("  АУДИТ — ИТОГИ");
console.log("═".repeat(66));

console.log("\n  ОСВ ПО ЦЕПОЧКЕ РАСТЕНИЕВОДСТВА:");
console.log("  " + "Счёт".padEnd(10) + "  " + "Оборот Дт".padStart(22) + "  " + "Оборот Кт".padStart(22) + "  " + "Сальдо".padStart(20));
for (const prefix of KEY_CHAIN) {
  const v = osv(prefix);
  if (!v.turnDr && !v.turnCr) continue;
  const saldo = v.closeDr - v.closeCr;
  const saldoStr = saldo >= 0 ? `${fmt(saldo)} Дт` : `${fmt(-saldo)} Кт`;
  console.log("  " + prefix.padEnd(10) + "  " + fmt(v.turnDr).padStart(22) + "  " + fmt(v.turnCr).padStart(22) + "  " + saldoStr.padStart(20));
}

const totalCorr = corrSorted.reduce((s, c) => s + c.amount, 0);
console.log(`\n  ТОП-20 КОРРЕСПОНДЕНЦИЙ (всего ${corrSorted.length} пар, оборот ${fmt(totalCorr)} тг):`);
corrSorted.slice(0, 20).forEach((c, i) => {
  const share = totalCorr > 0 ? `${((c.amount / totalCorr) * 100).toFixed(1)}%` : "";
  console.log(`  ${String(i + 1).padStart(2)}. Дт ${c.drCode.padEnd(10)} / Кт ${c.crCode.padEnd(10)}  ${fmt(c.amount).padStart(22)} тг  ${share.padStart(6)}  (${c.count} прд)`);
});

console.log("\n  ЧЕК-ЛИСТ ОШИБОК В УЧЁТЕ:");
for (const ch of checks) {
  console.log(`  ${ICON[ch.status]} ${ch.id}: ${ch.description}`);
  console.log(`       ${ch.detail}`);
}
console.log("═".repeat(66) + "\n");

// ══════════════════════════════════════════════════════════════════════════════
//  CSV
// ══════════════════════════════════════════════════════════════════════════════
const lines: string[] = [];
const sep   = () => lines.push("", "");
const title = (t: string) => { lines.push(row(t)); lines.push(row("─".repeat(80))); };

// Раздел 1: ОСВ по всем счетам
title("РАЗДЕЛ 1. ОСВ — ВСЕ СЧЕТА (из проводок + BalanceAndTurnovers)");
lines.push(row("Код", "Наименование", "Нач. Дт", "Нач. Кт", "Оборот Дт", "Оборот Кт", "Кон. Дт", "Кон. Кт", "Сальдо"));
for (const acc of allAccounts) {
  const v = btByGuid.get(acc.guid) ?? zeroOsv();
  const saldo = v.closeDr - v.closeCr;
  lines.push(row(acc.code, acc.name, v.openDr || "", v.openCr || "", v.turnDr || "", v.turnCr || "", v.closeDr || "", v.closeCr || "", saldo !== 0 ? saldo : ""));
}

// Раздел 2: Матрица всех Дт/Кт пар
sep();
title("РАЗДЕЛ 2. МАТРИЦА КОРРЕСПОНДЕНЦИИ — ВСЕ ДТ/КТ ПАРЫ");
lines.push(row("Дт счёт", "Дт наименование", "Кт счёт", "Кт наименование", "Сумма, тг", "Проводок", "Доля, %", "Типы документов"));
for (const c of corrSorted) {
  const share = totalCorr > 0 ? ((c.amount / totalCorr) * 100).toFixed(2) : "";
  lines.push(row(c.drCode, c.drName, c.crCode, c.crName, c.amount, c.count, share, [...c.docTypes].join("; ")));
}

// Раздел 3: Детальные проводки по 7010
sep();
title("РАЗДЕЛ 3. ПРОВОДКИ — СЧЁТ 7010 (СЕБЕСТОИМОСТЬ)");
lines.push(row("Дата", "Тип документа", "Номер", "Дт счёт", "Дт наименование", "Кт счёт", "Кт наименование", "Сумма, тг", "Содержание"));
allLines
  .filter(l => l.drCode.startsWith("7010") || l.crCode.startsWith("7010"))
  .sort((a, b) => a.date.localeCompare(b.date))
  .forEach(l => lines.push(row(l.date, l.docType, l.docNumber, l.drCode, l.drName, l.crCode, l.crName, l.amount, l.note)));

// Раздел 4: Детальные проводки по 1320
sep();
title("РАЗДЕЛ 4. ПРОВОДКИ — СЧЁТ 1320 (НЗП / ГП)");
lines.push(row("Дата", "Тип документа", "Номер", "Дт счёт", "Дт наименование", "Кт счёт", "Кт наименование", "Сумма, тг", "Содержание"));
allLines
  .filter(l => l.drCode.startsWith("1320") || l.crCode.startsWith("1320"))
  .sort((a, b) => a.date.localeCompare(b.date))
  .forEach(l => lines.push(row(l.date, l.docType, l.docNumber, l.drCode, l.drName, l.crCode, l.crName, l.amount, l.note)));

// Раздел 5: Детальные проводки по 8110
sep();
title("РАЗДЕЛ 5. ПРОВОДКИ — СЧЁТ 8110 (ОСНОВНОЕ ПРОИЗВОДСТВО)");
lines.push(row("Дата", "Тип документа", "Номер", "Дт счёт", "Дт наименование", "Кт счёт", "Кт наименование", "Сумма, тг", "Содержание"));
allLines
  .filter(l => l.drCode.startsWith("8110") || l.crCode.startsWith("8110"))
  .sort((a, b) => a.date.localeCompare(b.date))
  .forEach(l => lines.push(row(l.date, l.docType, l.docNumber, l.drCode, l.drName, l.crCode, l.crName, l.amount, l.note)));

// Раздел 6: Чек-лист
sep();
title("РАЗДЕЛ 6. ЧЕК-ЛИСТ ОШИБОК В УЧЁТЕ");
lines.push(row("ID", "Статус", "Проверка", "Детали", "Сумма"));
for (const ch of checks) {
  lines.push(row(ch.id, ch.status, ch.description, ch.detail, ch.amount ?? ""));
}

// Раздел 7: Все проводки (полный лог)
sep();
title("РАЗДЕЛ 7. ВСЕ ПРОВОДКИ (полный лог)");
lines.push(row("Дата", "Тип документа", "Номер", "Дт счёт", "Дт наименование", "Кт счёт", "Кт наименование", "Сумма, тг", "Содержание"));
allLines
  .sort((a, b) => a.date.localeCompare(b.date))
  .forEach(l => lines.push(row(l.date, l.docType, l.docNumber, l.drCode, l.drName, l.crCode, l.crName, l.amount, l.note)));

const csvPath = "C:\\Users\\PC\\Desktop\\AI-BOS-2.0\\onec-kz-agro-mcp\\agro_accounting_check.csv";
writeFileSync(csvPath, "﻿" + lines.join("\n"), "utf8");

console.log(`CSV: ${csvPath}`);
console.log(`Счетов: ${allAccounts.length} | Проводок: ${allLines.length} | Пар Дт/Кт: ${corrMap.size}`);
