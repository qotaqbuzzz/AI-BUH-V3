import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { add, emptyReport, finalize, type ValidationReport } from "./types.js";

const MRP = 3_692;
const IPN_STD_DEDUCTION = 14 * MRP;

interface RateConfig {
  name: string;
  computeExpected: (base: number) => number;
  tolerancePct: number;
}

const PAYROLL_RATES: Record<string, RateConfig> = {
  "3220": { name: "ОПВ (10 %)", computeExpected: b => b * 0.10, tolerancePct: 2 },
  "3250": { name: "ОППВ (5 % работодатель, с 01.01.2025)", computeExpected: b => b * 0.05, tolerancePct: 2 },
  "3211": { name: "СО (3.5 %)", computeExpected: b => (b - b * 0.10) * 0.035, tolerancePct: 5 },
  "3213": { name: "ВОСМС (3 %)", computeExpected: b => b * 0.03, tolerancePct: 2 },
  "3212": { name: "ОСМС-работник (2 %)", computeExpected: b => b * 0.02, tolerancePct: 2 },
  "3120": { name: "ИПН (10 %, −14 МРП)", computeExpected: b => Math.max(0, b * 0.88 - IPN_STD_DEDUCTION) * 0.10, tolerancePct: 20 },
  "3150": { name: "СН (9.5 % − СО)", computeExpected: b => Math.max(0, b * 0.88 * 0.095 - (b * 0.90 * 0.035)), tolerancePct: 10 },
};

const DOC_NAV: Record<string, string> = {
  РеализацияТоваровУслуг:                    "Продажи → Реализация товаров и услуг",
  ПоступлениеТоваровУслуг:                   "Покупки → Поступление товаров и услуг",
  ПлатежноеПоручениеИсходящее:              "Банк → Исходящие платёжные поручения",
  ПлатежноеПоручениеВходящее:               "Банк → Входящие платёжные поручения",
  НачислениеЗарплатыРаботникамОрганизаций:   "Зарплата и кадры → Начисление зарплаты",
  ОперацияБух:                               "Операции → Операции, введённые вручную",
};

const WIP_CORR: Record<string, string> = {
  "1310": "ТребованиеНакладная (семена/удобрения/ГСМ)",
  "3350": "НачислениеЗарплатыРаботникамОрганизаций",
  "2420": "ЗакрытиеМесяца — амортизация техники",
  "8412": "ЗакрытиеМесяца — распределение накладных",
  "1320": "ОприходованиеТоваров / ОприходованиеИзПроизводства",
};

export class DrillDownService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  // ─── 1. Account sign violation drill-down ───────────────────────────────────

  async drillAccountSignViolation(
    accountCode: string,
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
    limit = 20,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.accountSignViolation", { from: dateFrom, to: dateTo }, organizationGuid);

    const card = await this.register.getAccountCard(accountCode, dateFrom, dateTo, organizationGuid).catch(() => null);
    if (!card || card.rows.length === 0) {
      add(report, {
        ruleId: "DRILL-001",
        ruleName: "No transactions on account",
        severity: "info",
        category: "integrity",
        description: `Нет проводок по счёту ${accountCode} за период — возможно проблема перенесена из предыдущего периода.`,
        affected: { accountCode },
        suggestedFix: "Расширьте период анализа или проверьте входящее сальдо.",
        ruleSource: "kz-agro-validation-rules.md#A.1",
      });
      return finalize(report, start);
    }

    const byRecorder = new Map<string, { dr: number; cr: number; period: string; corrAccounts: Set<string> }>();
    for (const row of card.rows) {
      const e = byRecorder.get(row.recorderKey) ?? { dr: 0, cr: 0, period: row.period, corrAccounts: new Set<string>() };
      e.dr += row.amountDr;
      e.cr += row.amountCr;
      if (row.corrAccountCode) e.corrAccounts.add(row.corrAccountCode);
      if (!e.period || row.period < e.period) e.period = row.period;
      byRecorder.set(row.recorderKey, e);
    }

    const isAsset = /^[12]/.test(accountCode);
    const sorted = [...byRecorder.entries()]
      .filter(([, e]) => isAsset ? e.cr > e.dr : e.dr > e.cr)
      .sort((a, b) => isAsset
        ? (b[1].cr - b[1].dr) - (a[1].cr - a[1].dr)
        : (b[1].dr - b[1].cr) - (a[1].dr - a[1].cr))
      .slice(0, limit);

    if (sorted.length === 0) {
      add(report, {
        ruleId: "DRILL-001a",
        ruleName: "No single-period offenders",
        severity: "info",
        category: "integrity",
        description: `Счёт ${accountCode}: нарушение не выявлено в текущем периоде — проблема, вероятно, из прошлого.`,
        affected: { accountCode },
        suggestedFix: "Расширьте период или проверьте входящее сальдо через onec_get_account_card.",
        ruleSource: "kz-agro-validation-rules.md#A.1",
      });
    } else {
      let idx = 0;
      for (const [recorderKey, e] of sorted) {
        idx++;
        const wrongAmt = isAsset ? e.cr - e.dr : e.dr - e.cr;
        const corrs = [...e.corrAccounts].join(", ");
        add(report, {
          ruleId: `DRILL-001b-${idx.toString().padStart(3, "0")}`,
          ruleName: `Документ вносит ${isAsset ? "Кт" : "Дт"}-остаток на счёт ${accountCode}`,
          severity: "error",
          category: "integrity",
          description: `Рег-р ${recorderKey.slice(0, 8)}… (${e.period}): ${isAsset ? "Кт−Дт" : "Дт−Кт"} = ${wrongAmt.toFixed(2)} ₸. Корр. счета: ${corrs || "—"}.`,
          affected: {
            accountCode,
            documentGuid: recorderKey,
            documentDate: e.period,
            actual: wrongAmt,
            expected: 0,
            extras: { debitAmount: e.dr, creditAmount: e.cr, corrAccounts: corrs },
          },
          suggestedFix: `1C: Журнал проводок → в поле "Регистратор" вставьте ${recorderKey} → вкладка "Проводки" → убедитесь, что счёт ${accountCode} стоит в колонке "${isAsset ? "Дт" : "Кт"}". При ошибке — перепровести или сторнировать документ.`,
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }
    }

    add(report, {
      ruleId: "DRILL-001-total",
      ruleName: `Итого по счёту ${accountCode}`,
      severity: "info",
      category: "integrity",
      description: `Дт оборот: ${card.totals.debitTurnover.toFixed(2)} ₸, Кт оборот: ${card.totals.creditTurnover.toFixed(2)} ₸. Показано документов: ${sorted.length} из ${byRecorder.size}.`,
      affected: { accountCode, extras: { totalDr: card.totals.debitTurnover, totalCr: card.totals.creditTurnover, uniqueDocs: byRecorder.size } },
      suggestedFix: "Для полного списка используйте onec_get_account_card.",
      ruleSource: "kz-agro-validation-rules.md#A.1",
    });

    return finalize(report, start);
  }

  // ─── 2. Payroll tax deviation per document ──────────────────────────────────

  async drillPayrollTaxDeviation(
    taxAccountCode: string,
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.payrollTaxDeviation", { from: dateFrom, to: dateTo }, organizationGuid);

    const cfg = PAYROLL_RATES[taxAccountCode];
    if (!cfg) {
      add(report, {
        ruleId: "DRILL-002-unknown",
        ruleName: "Unknown tax account",
        severity: "warn",
        category: "tax",
        description: `Счёт ${taxAccountCode} не является зарплатным налоговым счётом. Поддерживаются: ${Object.keys(PAYROLL_RATES).join(", ")}.`,
        affected: { accountCode: taxAccountCode },
        suggestedFix: "Укажите один из поддерживаемых счетов.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    const docFilters = [
      `Posted eq true`, `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) docFilters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const payrollDocs = await this.client.getCollection<{
      Ref_Key: string; Number: string; Date: string; СуммаДокумента?: number;
    }>(
      "Document_НачислениеЗарплатыРаботникамОрганизаций",
      { filter: docFilters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", top: 500 },
    ).catch(() => [] as { Ref_Key: string; Number: string; Date: string; СуммаДокумента?: number }[]);

    if (payrollDocs.length === 0) {
      add(report, {
        ruleId: "DRILL-002-nodocs",
        ruleName: "No payroll documents",
        severity: "info",
        category: "tax",
        description: "Нет проведённых НачислениеЗарплатыРаботникамОрганизаций за период.",
        affected: {},
        suggestedFix: "Нет действий.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    const docMap = new Map(payrollDocs.map(d => [d.Ref_Key, d]));

    const [card3350, cardTax] = await Promise.all([
      this.register.getAccountCard("3350", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountCard(taxAccountCode, dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const baseByDoc = new Map<string, number>();
    if (card3350) {
      for (const row of card3350.rows) {
        if (row.amountCr > 0 && docMap.has(row.recorderKey)) {
          baseByDoc.set(row.recorderKey, (baseByDoc.get(row.recorderKey) ?? 0) + row.amountCr);
        }
      }
    }

    const taxByDoc = new Map<string, number>();
    if (cardTax) {
      for (const row of cardTax.rows) {
        const amt = row.amountCr > 0 ? row.amountCr : row.amountDr;
        if (amt > 0 && docMap.has(row.recorderKey)) {
          taxByDoc.set(row.recorderKey, (taxByDoc.get(row.recorderKey) ?? 0) + amt);
        }
      }
    }

    let deviations = 0;
    let idx = 0;
    for (const doc of payrollDocs) {
      idx++;
      const base = baseByDoc.get(doc.Ref_Key) ?? (doc.СуммаДокумента ?? 0);
      if (base <= 0) continue;
      const actual = taxByDoc.get(doc.Ref_Key) ?? 0;
      const expected = cfg.computeExpected(base);
      if (expected <= 0) continue;
      const dev = actual - expected;
      const devPct = (dev / expected) * 100;
      const docDate = doc.Date.slice(0, 10);
      const isMissing = actual === 0;

      if (Math.abs(devPct) > cfg.tolerancePct) {
        deviations++;
        add(report, {
          ruleId: `DRILL-002-${idx.toString().padStart(3, "0")}`,
          ruleName: `${cfg.name} — отклонение в №${doc.Number}`,
          severity: isMissing ? "error" : Math.abs(devPct) > 15 ? "error" : "warn",
          category: "tax",
          description: `НачислениеЗарплаты №${doc.Number} от ${docDate}: база ${base.toFixed(2)} ₸, ожидаемый ${cfg.name} = ${expected.toFixed(2)} ₸, начислено = ${actual.toFixed(2)} ₸ (${devPct.toFixed(1)} %).`,
          affected: {
            accountCode: taxAccountCode,
            documentGuid: doc.Ref_Key,
            documentNumber: doc.Number,
            documentDate: docDate,
            documentType: "НачислениеЗарплатыРаботникамОрганизаций",
            expected, actual, deviation: dev, deviationPct: devPct,
          },
          suggestedFix: isMissing
            ? `1C: Зарплата → НачислениеЗарплаты №${doc.Number} → перепровести. Проверить настройки расчёта: вид начисления "${cfg.name}" (счёт ${taxAccountCode}) должен быть активен.`
            : `1C: НачислениеЗарплаты №${doc.Number} → вкладка "Налоги и взносы" → проверить ставку ${cfg.name}. Причины: изменена база вручную, неверная ставка или льгота.`,
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      } else {
        add(report, {
          ruleId: `DRILL-002-${idx.toString().padStart(3, "0")}-ok`,
          ruleName: `${cfg.name} OK — №${doc.Number}`,
          severity: "info",
          category: "tax",
          description: `№${doc.Number} (${docDate}): ${cfg.name} ${actual.toFixed(2)} ≈ ожидаемый ${expected.toFixed(2)} ₸ (${devPct.toFixed(1)} %).`,
          affected: { accountCode: taxAccountCode, documentGuid: doc.Ref_Key, documentNumber: doc.Number, expected, actual, deviationPct: devPct },
          suggestedFix: "OK.",
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      }
    }

    if (deviations === 0 && payrollDocs.length > 0) {
      add(report, {
        ruleId: "DRILL-002-allok",
        ruleName: `${cfg.name} корректен во всех ${payrollDocs.length} документах`,
        severity: "info",
        category: "tax",
        description: `Все ${payrollDocs.length} НачислениеЗарплаты корректно начисляют ${cfg.name}.`,
        affected: { accountCode: taxAccountCode },
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  // ─── 3. Full missing ESF list ────────────────────────────────────────────────

  async drillMissingESF(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.missingESF", { from: dateFrom, to: dateTo }, organizationGuid);

    const saleFilters = [
      `Posted eq true`, `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) saleFilters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const [sales, esfRows] = await Promise.all([
      this.client.getCollection<{ Ref_Key: string; Number: string; Date: string; СуммаДокумента: number }>(
        "Document_РеализацияТоваровУслуг",
        { filter: saleFilters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", top: 2000 },
      ).catch(() => [] as { Ref_Key: string; Number: string; Date: string; СуммаДокумента: number }[]),
      this.client.getCollection<{ ДокументОснование_Key?: string; ДокументОснование?: string }>(
        "InformationRegister_АктуальныеЭСФ",
        {
          filter: [
            `Period ge datetime'${dateFrom}T00:00:00'`,
            `Period le datetime'${dateTo}T23:59:59'`,
            ...(organizationGuid ? [`Организация_Key eq guid'${organizationGuid}'`] : []),
          ].join(" and "),
          select: "ДокументОснование_Key,ДокументОснование",
          top: 2000,
        },
      ).catch(() => [] as { ДокументОснование_Key?: string; ДокументОснование?: string }[]),
    ]);

    if (sales.length === 0) {
      add(report, { ruleId: "DRILL-003-none", ruleName: "No sales documents", severity: "info", category: "tax",
        description: "Нет РеализацияТоваровУслуг за период.", affected: {}, suggestedFix: "Нет действий.", ruleSource: "kz-agro-validation-rules.md#A.3" });
      return finalize(report, start);
    }

    const esfSet = new Set(esfRows.map(e => e.ДокументОснование_Key ?? e.ДокументОснование).filter(Boolean) as string[]);
    let covered = 0;
    let idx = 0;

    for (const sale of sales) {
      idx++;
      if (esfSet.has(sale.Ref_Key)) { covered++; continue; }
      const docDate = sale.Date.slice(0, 10);
      add(report, {
        ruleId: `DRILL-003-${idx.toString().padStart(4, "0")}`,
        ruleName: `Реализация №${sale.Number} — нет ЭСФ`,
        severity: "error",
        category: "tax",
        description: `РеализацияТоваровУслуг №${sale.Number} от ${docDate}: ${sale.СуммаДокумента.toFixed(2)} ₸ (НДС ${(sale.СуммаНДС ?? 0).toFixed(2)} ₸) — ЭСФ не зарегистрирован.`,
        affected: {
          documentGuid: sale.Ref_Key,
          documentNumber: sale.Number,
          documentDate: docDate,
          documentType: "РеализацияТоваровУслуг",
          actual: sale.СуммаДокумента,
          extras: { vatAmount: sale.СуммаНДС ?? 0 },
        },
        suggestedFix: `1C: открыть РеализацияТоваровУслуг №${sale.Number} → кнопка "ЭСФ" / "Создать ЭСФ" → заполнить реквизиты → отправить через ИС ЭСФ (esf.gov.kz). Срок — не позднее 15 дней с даты реализации.`,
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    add(report, {
      ruleId: "DRILL-003-summary",
      ruleName: "ЭСФ coverage summary",
      severity: sales.length - covered > 0 ? "error" : "info",
      category: "tax",
      description: `Реализаций: ${sales.length}. С ЭСФ: ${covered}. Без ЭСФ: ${sales.length - covered}.`,
      affected: { actual: sales.length - covered, expected: 0, extras: { total: sales.length, covered } },
      suggestedFix: sales.length - covered === 0 ? "OK." : `Выписать ЭСФ для ${sales.length - covered} реализаций.`,
      ruleSource: "kz-agro-validation-rules.md#A.3",
    });

    return finalize(report, start);
  }

  // ─── 4. Stale advances drill-down ───────────────────────────────────────────

  async drillStaleAdvances(
    date: string,
    accountCode: string,
    organizationGuid?: string,
    agingDays = 90,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.staleAdvances", { from: date, to: date }, organizationGuid);

    if (!["1710", "3510"].includes(accountCode)) {
      add(report, { ruleId: "DRILL-004-bad", ruleName: "Unsupported account", severity: "warn", category: "reconciliation",
        description: `Счёт ${accountCode} не поддерживается. Используйте 1710 (авансы выданные) или 3510 (авансы полученные).`,
        affected: { accountCode }, suggestedFix: "Используйте 1710 или 3510.", ruleSource: "kz-agro-validation-rules.md#A.6" });
      return finalize(report, start);
    }

    const breakdown = await this.register.getAccountBreakdown(accountCode, date, organizationGuid).catch(() => []);
    if (breakdown.length === 0) {
      add(report, { ruleId: "DRILL-004-empty", ruleName: "No open advances", severity: "info", category: "reconciliation",
        description: `Нет незакрытых авансов на счёте ${accountCode} на ${date}.`,
        affected: { accountCode }, suggestedFix: "Нет действий.", ruleSource: "kz-agro-validation-rules.md#A.6" });
      return finalize(report, start);
    }

    // Fetch contract start dates for aging
    const contractGuids = [...new Set(breakdown.map(b => b.dim2).filter(Boolean))];
    const contractStartMap = new Map<string, string>();
    for (let i = 0; i < contractGuids.length; i += 20) {
      const batch = contractGuids.slice(i, i + 20);
      const rows = await this.client.getCollection<{ Ref_Key: string; СрокДействияС?: string }>(
        "Catalog_ДоговорыКонтрагентов",
        { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,СрокДействияС", top: batch.length + 5 },
      ).catch(() => [] as { Ref_Key: string; СрокДействияС?: string }[]);
      for (const r of rows) if (r.СрокДействияС) contractStartMap.set(r.Ref_Key, r.СрокДействияС);
    }

    const refDate = new Date(date);
    const isIssued = accountCode === "1710";
    let staleCount = 0;
    let totalStale = 0;
    const totalBalance = breakdown.reduce((s, b) => s + (isIssued ? (b.amountDr - b.amountCr) : (b.amountCr - b.amountDr)), 0);
    let idx = 0;

    for (const entry of breakdown) {
      const net = isIssued ? entry.amountDr - entry.amountCr : entry.amountCr - entry.amountDr;
      if (net <= 0) continue;
      idx++;
      const startStr = contractStartMap.get(entry.dim2);
      const ageDaysCalc = startStr ? Math.floor((refDate.getTime() - new Date(startStr).getTime()) / 86_400_000) : -1;
      const isStale = ageDaysCalc >= agingDays || (ageDaysCalc < 0 && net > 1_000_000);
      if (isStale) { staleCount++; totalStale += net; }
      const ageLabel = ageDaysCalc >= 0 ? `${ageDaysCalc} дн. с ${startStr!.slice(0, 10)}` : "дата неизвестна";

      add(report, {
        ruleId: `DRILL-004-${idx.toString().padStart(3, "0")}`,
        ruleName: `${entry.dim1Name || "Контрагент"} / ${entry.dim2Name || "Договор"} — ${isStale ? "ПРОСРОЧЕННЫЙ" : "актуально"}`,
        severity: isStale ? (ageDaysCalc > 365 || net > 100_000_000 ? "error" : "warn") : "info",
        category: "reconciliation",
        description: `${entry.dim1Name || entry.dim1.slice(0, 8)} → договор: ${entry.dim2Name || "—"} (${ageLabel}): остаток = ${net.toFixed(2)} ₸.`,
        affected: {
          accountCode,
          contractorGuid: entry.dim1,
          contractorName: entry.dim1Name,
          actual: net,
          extras: { contractGuid: entry.dim2, contractName: entry.dim2Name, ageDays: ageDaysCalc, isStale },
        },
        suggestedFix: isIssued
          ? (isStale
            ? `Связаться с ${entry.dim1Name || "контрагентом"}: запросить поставку по договору ${entry.dim2Name || entry.dim2.slice(0, 8)}, либо возврат аванса ${net.toFixed(2)} ₸. В 1C: ПоступлениеТоваровУслуг → выбрать этот договор — остаток зачтётся автоматически.`
            : "Аванс в норме — ожидается поставка.")
          : (isStale
            ? `Закрыть аванс: создать РеализацияТоваровУслуг на ${net.toFixed(2)} ₸ по договору ${entry.dim2Name || entry.dim2.slice(0, 8)}, или вернуть средства контрагенту.`
            : "Аванс полученный в норме."),
        ruleSource: "kz-agro-validation-rules.md#A.6",
      });
    }

    add(report, {
      ruleId: "DRILL-004-total",
      ruleName: "Авансы итого",
      severity: staleCount > 0 ? "warn" : "info",
      category: "reconciliation",
      description: `Счёт ${accountCode}: ${idx} строк, итого ${totalBalance.toFixed(2)} ₸. Просрочено (>${agingDays} дн.): ${staleCount} на ${totalStale.toFixed(2)} ₸.`,
      affected: { accountCode, actual: totalBalance, extras: { staleCount, totalStale, agingDays } },
      suggestedFix: staleCount === 0 ? "OK." : `Разобрать ${staleCount} просроченных авансов.`,
      ruleSource: "kz-agro-validation-rules.md#A.6",
    });

    return finalize(report, start);
  }

  // ─── 5. VAT per sales document ───────────────────────────────────────────────

  async drillVATDocuments(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.vatDocuments", { from: dateFrom, to: dateTo }, organizationGuid);

    const saleFilters = [
      `Posted eq true`, `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) saleFilters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const sales = await this.client.getCollection<{
      Ref_Key: string; Number: string; Date: string; СуммаДокумента: number;
    }>(
      "Document_РеализацияТоваровУслуг",
      { filter: saleFilters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", top: 2000 },
    ).catch(() => [] as { Ref_Key: string; Number: string; Date: string; СуммаДокумента: number }[]);

    if (sales.length === 0) {
      add(report, { ruleId: "DRILL-005-none", ruleName: "No sales", severity: "info", category: "tax",
        description: "Нет РеализацияТоваровУслуг за период.", affected: {}, suggestedFix: "Нет действий.", ruleSource: "kz-agro-validation-rules.md#A.3" });
      return finalize(report, start);
    }

    const [rev6010, vat3131] = await Promise.all([
      this.register.getAccountCard("6010", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountCard("3131", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const salesSet = new Set(sales.map(s => s.Ref_Key));

    const revenueByDoc = new Map<string, number>();
    if (rev6010) {
      for (const r of rev6010.rows) {
        if (r.amountCr > 0 && salesSet.has(r.recorderKey))
          revenueByDoc.set(r.recorderKey, (revenueByDoc.get(r.recorderKey) ?? 0) + r.amountCr);
      }
    }
    const vatByDoc = new Map<string, number>();
    if (vat3131) {
      for (const r of vat3131.rows) {
        if (r.amountCr > 0 && salesSet.has(r.recorderKey))
          vatByDoc.set(r.recorderKey, (vatByDoc.get(r.recorderKey) ?? 0) + r.amountCr);
      }
    }

    let issues = 0;
    let idx = 0;
    for (const sale of sales) {
      idx++;
      const revenue = revenueByDoc.get(sale.Ref_Key) ?? 0;
      if (revenue <= 0) continue;
      const actual = vatByDoc.get(sale.Ref_Key) ?? 0;
      const expected = revenue * 12 / 100;
      const dev = actual - expected;
      const devPct = (dev / expected) * 100;
      const docDate = sale.Date.slice(0, 10);

      if (actual === 0) {
        issues++;
        add(report, {
          ruleId: `DRILL-005-${idx.toString().padStart(4, "0")}-novat`,
          ruleName: `№${sale.Number}: НДС отсутствует`,
          severity: "error",
          category: "tax",
          description: `Реализация №${sale.Number} от ${docDate}: выручка 6010 = ${revenue.toFixed(2)} ₸, НДС 3131 = 0 (ожидается ${expected.toFixed(2)} ₸).`,
          affected: { accountCode: "3131", documentGuid: sale.Ref_Key, documentNumber: sale.Number, documentDate: docDate, documentType: "РеализацияТоваровУслуг", expected, actual: 0, deviation: -expected },
          suggestedFix: `1C: РеализацияТоваровУслуг №${sale.Number} → поле НДС в строках = 12% "Сверху" → Провести. Если экспорт/освобождение — ставка 0%, указать причину в ЭСФ.`,
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      } else if (Math.abs(devPct) > 1) {
        issues++;
        add(report, {
          ruleId: `DRILL-005-${idx.toString().padStart(4, "0")}-dev`,
          ruleName: `№${sale.Number}: НДС отклонение ${devPct.toFixed(1)} %`,
          severity: Math.abs(devPct) > 5 ? "error" : "warn",
          category: "tax",
          description: `Реализация №${sale.Number} (${docDate}): выручка ${revenue.toFixed(2)} ₸, ожидаемый НДС ${expected.toFixed(2)} ₸, фактический ${actual.toFixed(2)} ₸ (${devPct.toFixed(1)} %).`,
          affected: { accountCode: "3131", documentGuid: sale.Ref_Key, documentNumber: sale.Number, documentDate: docDate, documentType: "РеализацияТоваровУслуг", expected, actual, deviation: dev, deviationPct: devPct },
          suggestedFix: `1C: Реализация №${sale.Number} → проверить ставку НДС в каждой строке (должна быть 12 %). Смешанные ставки (0 %/12 %) — норма при частично экспортных продажах.`,
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      }
    }

    if (issues === 0) {
      add(report, { ruleId: "DRILL-005-ok", ruleName: "НДС корректен по всем реализациям", severity: "info", category: "tax",
        description: `Все ${sales.length} РеализацияТоваровУслуг корректно начисляют НДС 12 %.`,
        affected: { accountCode: "3131" }, suggestedFix: "OK.", ruleSource: "kz-agro-validation-rules.md#A.3" });
    }

    return finalize(report, start);
  }

  // ─── 6. WIP source documents ────────────────────────────────────────────────

  async drillWIPSourceDocuments(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.wipSourceDocuments", { from: dateFrom, to: dateTo }, organizationGuid);

    const card = await this.register.getAccountCard("8112", dateFrom, dateTo, organizationGuid).catch(() => null);
    if (!card || card.rows.length === 0) {
      add(report, { ruleId: "DRILL-006-none", ruleName: "No 8112 activity", severity: "info", category: "period-close",
        description: "Нет проводок по 8112 (НЗП растениеводство) за период.",
        affected: { accountCode: "8112" },
        suggestedFix: "Если вегетационный период (апр–июл) — проверьте списание семян, удобрений, ГСМ через ТребованиеНакладная.",
        ruleSource: "kz-agro-validation-rules.md#A.3" });
      return finalize(report, start);
    }

    const inputs = new Map<string, number>();
    const outputs = new Map<string, number>();
    let totalIn = 0; let totalOut = 0;

    for (const row of card.rows) {
      if (row.amountDr > 0) { inputs.set(row.corrAccountCode, (inputs.get(row.corrAccountCode) ?? 0) + row.amountDr); totalIn += row.amountDr; }
      if (row.amountCr > 0) { outputs.set(row.corrAccountCode, (outputs.get(row.corrAccountCode) ?? 0) + row.amountCr); totalOut += row.amountCr; }
    }

    add(report, {
      ruleId: "DRILL-006-summary",
      ruleName: "8112 НЗП — итоги периода",
      severity: totalOut === 0 && totalIn > 5_000_000 ? "warn" : "info",
      category: "period-close",
      description: `8112: затраты Дт = ${totalIn.toFixed(2)} ₸, оприходование Кт = ${totalOut.toFixed(2)} ₸, остаток НЗП = ${(totalIn - totalOut).toFixed(2)} ₸.`,
      affected: { accountCode: "8112", extras: { totalIn, totalOut, netWIP: totalIn - totalOut } },
      suggestedFix: totalOut === 0
        ? "Кт-оборотов по 8112 нет — урожай не оприходован. Если уборка была, создать ОприходованиеТоваров/ОприходованиеИзПроизводства с Дт 1320 Кт 8112."
        : "OK.",
      ruleSource: "kz-agro-validation-rules.md#A.3",
    });

    for (const [corr, amt] of [...inputs.entries()].sort((a, b) => b[1] - a[1])) {
      add(report, {
        ruleId: `DRILL-006-in-${corr}`,
        ruleName: `8112 ← ${corr} (${WIP_CORR[corr] ?? corr})`,
        severity: "info",
        category: "period-close",
        description: `Затраты от ${corr}: ${amt.toFixed(2)} ₸ (${((amt / totalIn) * 100).toFixed(1)} %).`,
        affected: { accountCode: "8112", extras: { corrAccount: corr, amount: amt } },
        suggestedFix: `Первичные документы: ${WIP_CORR[corr] ?? `проводки на счёте ${corr}`}.`,
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    for (const [corr, amt] of outputs.entries()) {
      add(report, {
        ruleId: `DRILL-006-out-${corr}`,
        ruleName: `8112 → ${corr} (${WIP_CORR[corr] ?? corr})`,
        severity: corr === "1320" ? "info" : "warn",
        category: "period-close",
        description: `Выход из НЗП на ${corr}: ${amt.toFixed(2)} ₸.`,
        affected: { accountCode: "8112", extras: { corrAccount: corr, amount: amt } },
        suggestedFix: corr === "1320"
          ? `Урожай ${amt.toFixed(2)} ₸ оприходован на склад (1320). Детали — onec_get_harvest_output.`
          : `Нестандартный выход из 8112 на ${corr}. Проверить корректность проводки.`,
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  // ─── 7. Full unposted documents list ────────────────────────────────────────

  async drillUnpostedDocuments(
    documentType: string,
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.unpostedDocuments", { from: dateFrom, to: dateTo }, organizationGuid);

    const VALID = ["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг", "ПлатежноеПоручениеИсходящее",
      "ПлатежноеПоручениеВходящее", "НачислениеЗарплатыРаботникамОрганизаций", "ОперацияБух"];

    if (!VALID.includes(documentType)) {
      add(report, { ruleId: "DRILL-007-bad", ruleName: "Unknown document type", severity: "warn", category: "period-close",
        description: `Тип "${documentType}" не поддерживается. Доступные: ${VALID.join(", ")}.`,
        affected: {}, suggestedFix: "Укажите поддерживаемый тип.", ruleSource: "kz-agro-validation-rules.md#A.4" });
      return finalize(report, start);
    }

    const filters = [
      `Posted eq false`, `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const docs = await this.client.getCollection<{
      Ref_Key: string; Number: string; Date: string; СуммаДокумента?: number;
    }>(
      `Document_${documentType}`,
      { filter: filters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", orderby: "Date asc", top: 500 },
    ).catch(() => [] as { Ref_Key: string; Number: string; Date: string; СуммаДокумента?: number }[]);

    if (docs.length === 0) {
      add(report, { ruleId: "DRILL-007-ok", ruleName: `Нет непроведённых ${documentType}`, severity: "info", category: "period-close",
        description: `Все документы типа ${documentType} проведены.`, affected: { documentType }, suggestedFix: "OK.", ruleSource: "kz-agro-validation-rules.md#A.4" });
      return finalize(report, start);
    }

    const total = docs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0);
    add(report, {
      ruleId: "DRILL-007-header",
      ruleName: `${docs.length} непроведённых ${documentType}`,
      severity: docs.length > 5 ? "error" : "warn",
      category: "period-close",
      description: `Найдено ${docs.length} непроведённых ${documentType} на сумму ${total.toFixed(2)} ₸.`,
      affected: { actual: docs.length, expected: 0, extras: { totalAmount: total } },
      suggestedFix: `1C: ${DOC_NAV[documentType] ?? documentType} → фильтр "Непроведённые" → выделить всё → кнопка "Провести" (F9 или Ctrl+Enter).`,
      ruleSource: "kz-agro-validation-rules.md#A.4",
    });

    let idx = 0;
    for (const doc of docs) {
      idx++;
      const docDate = doc.Date.slice(0, 10);
      add(report, {
        ruleId: `DRILL-007-${idx.toString().padStart(3, "0")}`,
        ruleName: `Непроведён: ${documentType} №${doc.Number}`,
        severity: "warn",
        category: "period-close",
        description: `${documentType} №${doc.Number} от ${docDate}, сумма ${(doc.СуммаДокумента ?? 0).toFixed(2)} ₸.`,
        affected: {
          documentGuid: doc.Ref_Key,
          documentNumber: doc.Number,
          documentDate: docDate,
          documentType,
          actual: doc.СуммаДокумента ?? 0,
        },
        suggestedFix: `1C: открыть ${documentType} №${doc.Number} от ${docDate} → нажать "Провести и закрыть" (F9). При ошибке проведения — проверить реквизиты и исправить.`,
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    }

    return finalize(report, start);
  }

  // ─── 8. Unpaid posted payments full list ────────────────────────────────────

  async drillUnpaidPayments(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DrillDown.unpaidPayments", { from: dateFrom, to: dateTo }, organizationGuid);

    const filters = [
      `Posted eq true`, `DeletionMark eq false`, `Оплачено eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const docs = await this.client.getCollection<{
      Ref_Key: string; Number: string; Date: string; СуммаДокумента: number; Контрагент_Key?: string;
    }>(
      "Document_ПлатежноеПоручениеИсходящее",
      { filter: filters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента,Контрагент_Key", orderby: "Date asc", top: 200 },
    ).catch(() => [] as { Ref_Key: string; Number: string; Date: string; СуммаДокумента: number; Контрагент_Key?: string }[]);

    if (docs.length === 0) {
      add(report, { ruleId: "DRILL-008-ok", ruleName: "No unpaid posted payments", severity: "info", category: "reconciliation",
        description: "Нет ПП Исходящих с Оплачено=false.", affected: {}, suggestedFix: "OK.", ruleSource: "kz-agro-validation-rules.md#A.6" });
      return finalize(report, start);
    }

    // Resolve contractor names
    const guids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean) as string[])];
    const contMap = new Map<string, string>();
    for (let i = 0; i < guids.length; i += 20) {
      const batch = guids.slice(i, i + 20);
      const rows = await this.client.getCollection<{ Ref_Key: string; Description: string }>(
        "Catalog_Контрагенты",
        { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: batch.length },
      ).catch(() => [] as { Ref_Key: string; Description: string }[]);
      for (const r of rows) contMap.set(r.Ref_Key, r.Description);
    }

    const refDate = new Date(dateTo);
    const totalAmt = docs.reduce((s, d) => s + d.СуммаДокумента, 0);
    add(report, {
      ruleId: "DRILL-008-header",
      ruleName: `${docs.length} ПП проведены, но не оплачены`,
      severity: "warn",
      category: "reconciliation",
      description: `${docs.length} ПП Исходящих проведены, но Оплачено=false (${totalAmt.toFixed(2)} ₸). Требуется сверка с банком.`,
      affected: { actual: docs.length, expected: 0, extras: { totalAmount: totalAmt } },
      suggestedFix: "Сверить с банковской выпиской. Если банк подтвердил списание — открыть каждый ПП и поставить Оплачено=✓.",
      ruleSource: "kz-agro-validation-rules.md#A.6",
    });

    let idx = 0;
    for (const doc of docs) {
      idx++;
      const docDate = doc.Date.slice(0, 10);
      const name = (doc.Контрагент_Key ? contMap.get(doc.Контрагент_Key) : undefined) ?? "Контрагент неизвестен";
      const ageDays = Math.floor((refDate.getTime() - new Date(doc.Date).getTime()) / 86_400_000);
      add(report, {
        ruleId: `DRILL-008-${idx.toString().padStart(3, "0")}`,
        ruleName: `ПП №${doc.Number} → ${name}`,
        severity: ageDays > 7 ? "error" : "warn",
        category: "reconciliation",
        description: `ПП №${doc.Number} от ${docDate} на ${doc.СуммаДокумента.toFixed(2)} ₸ (${name}) — ${ageDays} дн. назад, не помечен оплаченным.`,
        affected: {
          documentGuid: doc.Ref_Key,
          documentNumber: doc.Number,
          documentDate: docDate,
          documentType: "ПлатежноеПоручениеИсходящее",
          contractorGuid: doc.Контрагент_Key,
          contractorName: name,
          actual: doc.СуммаДокумента,
          extras: { ageDays },
        },
        suggestedFix: `1C: открыть ПП №${doc.Number} от ${docDate} → поле "Оплачено" → установить ✓ после подтверждения в банке. Если платёж не прошёл — Отменить проведение.`,
        ruleSource: "kz-agro-validation-rules.md#A.6",
      });
    }

    return finalize(report, start);
  }
}
