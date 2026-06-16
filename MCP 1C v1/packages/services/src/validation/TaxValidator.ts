import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { add, emptyReport, finalize, type ValidationReport } from "./types.js";

const VAT_RATE = 12; // %
const VAT_TOLERANCE_PCT = 1; // ±1 %

// 2026 constants
const MRP = 3_692;
const MZP = 85_000;
const IPN_STD_DEDUCTION = 14 * MRP; // 51 688

const RATES = {
  OPV: 0.10,   // 3220 — employee pension
  OPPV: 0.05,  // 3250 — employer pension (from 01.01.2025)
  SO: 0.035,   // 3211 — social insurance (employer)
  VOSMS: 0.03, // 3213 — medical (employer)
  OSMS: 0.02,  // 3212 — medical (employee)
  IPN: 0.10,   // 3120 — income tax
  SN: 0.095,   // 3150 — social tax base rate (then minus СО)
};

export class TaxValidator {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async validateVATCharged(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("TaxValidator.vatCharged", { from: dateFrom, to: dateTo }, organizationGuid);

    const [t6010, t3131] = await Promise.all([
      this.register.getAccountTurnovers("6010", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3131", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const revenue = t6010?.creditTurnover ?? 0;
    const vatCharged = t3131?.creditTurnover ?? 0;

    if (revenue <= 0) {
      add(report, {
        ruleId: "TAX-001",
        ruleName: "No revenue in period",
        severity: "info",
        category: "tax",
        description: "Account 6010 has no credit turnover — VAT cross-check not applicable.",
        affected: {},
        suggestedFix: "If sales did occur, verify they are posted to 6010.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    // 6010 in KZ 1C stores NET revenue (excluding VAT) — formula is revenue × 12 % (not × 12/112)
    const expected = revenue * VAT_RATE / 100;
    const deviation = vatCharged - expected;
    const deviationPct = expected > 0 ? (deviation / expected) * 100 : 0;

    if (vatCharged === 0) {
      add(report, {
        ruleId: "TAX-001a",
        ruleName: "VAT charged = 0 with revenue > 0",
        severity: "warn",
        category: "tax",
        description: `Revenue ${revenue.toFixed(2)} ₸ but VAT charged (3131) = 0. Either all exports/exempt or VAT not accrued.`,
        affected: { accountCode: "3131", actual: 0, expected },
        suggestedFix: "If sales were domestic to VAT-payers, accrue 3131 = revenue (net) × 12 % = " + expected.toFixed(2),
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else if (Math.abs(deviationPct) > VAT_TOLERANCE_PCT) {
      add(report, {
        ruleId: "TAX-001b",
        ruleName: "VAT charged deviates from revenue × 12 %",
        severity: Math.abs(deviationPct) > 5 ? "error" : "warn",
        category: "tax",
        description: `Expected 3131 ≈ ${expected.toFixed(2)} ₸ (= 6010 net × 12 %), actual ${vatCharged.toFixed(2)} ₸ (deviation ${deviationPct.toFixed(2)} %).`,
        affected: { accountCode: "3131", expected, actual: vatCharged, deviation, deviationPct },
        suggestedFix: "Reconcile by listing 6010 entries with 0 % VAT (exports/exempt) vs 12 % (domestic). Check ЭСФ register.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else {
      add(report, {
        ruleId: "TAX-001c",
        ruleName: "VAT charged matches revenue",
        severity: "info",
        category: "tax",
        description: `3131 = ${vatCharged.toFixed(2)} ≈ expected ${expected.toFixed(2)} (deviation ${deviationPct.toFixed(2)} %).`,
        affected: { accountCode: "3131", expected, actual: vatCharged, deviationPct },
        suggestedFix: "OK — within tolerance.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  async validateVATRecoverable(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("TaxValidator.vatRecoverable", { from: dateFrom, to: dateTo }, organizationGuid);

    // 1421 turnover Дт = VAT recoverable accrued in period
    const t1421 = await this.register.getAccountTurnovers("1421", dateFrom, dateTo, organizationGuid).catch(() => null);

    // Approximate VAT-bearing purchases by 3310 credit turnover (purchases on account)
    const t3310 = await this.register.getAccountTurnovers("3310", dateFrom, dateTo, organizationGuid).catch(() => null);

    const vatRecoverable = t1421?.debitTurnover ?? 0;
    const purchases = t3310?.creditTurnover ?? 0;

    if (purchases <= 0) {
      add(report, {
        ruleId: "TAX-002",
        ruleName: "No purchases in period",
        severity: "info",
        category: "tax",
        description: "Account 3310 has no credit turnover — VAT recoverable cross-check not applicable.",
        affected: {},
        suggestedFix: "No action.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    // Expected VAT recoverable if 100 % of purchases were from VAT payers
    const maxExpected = purchases * VAT_RATE / (100 + VAT_RATE);
    const ratio = vatRecoverable / maxExpected;

    if (vatRecoverable === 0) {
      add(report, {
        ruleId: "TAX-002a",
        ruleName: "VAT recoverable = 0 with purchases > 0",
        severity: "warn",
        category: "tax",
        description: `Purchases (3310 Кт) ${purchases.toFixed(2)} ₸ but 1421 Дт = 0. All suppliers non-VAT?`,
        affected: { accountCode: "1421", actual: 0, expected: maxExpected },
        suggestedFix: "Confirm by reviewing supplier invoices. If any supplier is VAT-payer, recover VAT separately.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else if (ratio > 1.01) {
      add(report, {
        ruleId: "TAX-002b",
        ruleName: "VAT recoverable exceeds maximum possible",
        severity: "error",
        category: "tax",
        description: `1421 Дт ${vatRecoverable.toFixed(2)} ₸ > theoretical max ${maxExpected.toFixed(2)} ₸ (ratio ${ratio.toFixed(3)}).`,
        affected: { accountCode: "1421", actual: vatRecoverable, expected: maxExpected, deviation: vatRecoverable - maxExpected },
        suggestedFix: "VAT recoverable cannot exceed 12/112 of purchases. Check for double-posting or wrong VAT rate.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else {
      add(report, {
        ruleId: "TAX-002c",
        ruleName: "VAT recoverable within expected range",
        severity: "info",
        category: "tax",
        description: `1421 Дт ${vatRecoverable.toFixed(2)} ₸ = ${(ratio * 100).toFixed(1)} % of max possible ${maxExpected.toFixed(2)} ₸.`,
        affected: { accountCode: "1421", actual: vatRecoverable, expected: maxExpected, deviationPct: (ratio - 1) * 100 },
        suggestedFix: "OK — within plausible range.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  async validateESFCoverage(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("TaxValidator.esfCoverage", { from: dateFrom, to: dateTo }, organizationGuid);

    const filters: string[] = [
      `Posted eq true`,
      `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const sales = await this.client.getCollection<{ Ref_Key: string; Number: string; Date: string; СуммаДокумента: number }>(
      "Document_РеализацияТоваровУслуг",
      { filter: filters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", top: 2000 },
    ).catch(() => []);

    if (sales.length === 0) {
      add(report, {
        ruleId: "TAX-003",
        ruleName: "No sales in period",
        severity: "info",
        category: "tax",
        description: "No Реализация documents to cross-check against ЭСФ register.",
        affected: {},
        suggestedFix: "No action.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    // Pull ЭСФ register for the period
    const esfFilters: string[] = [
      `Period ge datetime'${dateFrom}T00:00:00'`,
      `Period le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) esfFilters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const esfRows = await this.client.getCollection<{ ДокументОснование?: string; ДокументОснование_Key?: string }>(
      "InformationRegister_АктуальныеЭСФ",
      { filter: esfFilters.join(" and "), select: "ДокументОснование,ДокументОснование_Key", top: 2000 },
    ).catch(() => []);

    const esfRefs = new Set<string>();
    for (const e of esfRows) {
      const key = e.ДокументОснование_Key ?? e.ДокументОснование;
      if (key) esfRefs.add(key);
    }

    const missing = sales.filter(s => !esfRefs.has(s.Ref_Key));

    if (missing.length === 0) {
      add(report, {
        ruleId: "TAX-003a",
        ruleName: "All sales have matching ЭСФ",
        severity: "info",
        category: "tax",
        description: `Все ${sales.length} реализаций имеют запись в АктуальныеЭСФ.`,
        affected: { actual: sales.length, expected: sales.length },
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else {
      const totalMissing = missing.reduce((s, r) => s + (r.СуммаДокумента ?? 0), 0);
      add(report, {
        ruleId: "TAX-003b",
        ruleName: "Sales without ЭСФ",
        severity: "error",
        category: "tax",
        description: `${missing.length} из ${sales.length} реализаций НЕТ в АктуальныеЭСФ (сумма ${totalMissing.toFixed(2)} ₸).`,
        affected: { actual: missing.length, expected: 0, extras: { totalMissingAmount: totalMissing, totalSales: sales.length } },
        suggestedFix: `Выписать ЭСФ через ИС ЭСФ для каждой реализации. Первые 5: ${missing.slice(0, 5).map(m => `${m.Number} (${m.Date.slice(0, 10)})`).join("; ")}.`,
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  async validatePayrollTaxRates(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("TaxValidator.payrollTaxRates", { from: dateFrom, to: dateTo }, organizationGuid);

    // Payroll base = 3350 credit turnover (gross salary accruals)
    const [t3350, t3220, t3250, t3211, t3213, t3212, t3120, t3150] = await Promise.all([
      this.register.getAccountTurnovers("3350", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3220", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3250", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3211", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3213", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3212", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3120", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3150", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const base = t3350?.creditTurnover ?? 0;
    if (base <= 0) {
      add(report, {
        ruleId: "TAX-004",
        ruleName: "No payroll accruals in period",
        severity: "info",
        category: "tax",
        description: "Account 3350 has no credit turnover — payroll cross-check not applicable.",
        affected: {},
        suggestedFix: "If payroll was run, ensure 3350 received credits.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    const expect = (label: string, code: string, actual: number, expected: number, tolerancePct = 2) => {
      const dev = actual - expected;
      const devPct = expected > 0 ? (dev / expected) * 100 : 0;
      if (Math.abs(devPct) > tolerancePct) {
        add(report, {
          ruleId: `TAX-004-${code}`,
          ruleName: `${label} rate deviation`,
          severity: Math.abs(devPct) > 10 ? "error" : "warn",
          category: "tax",
          description: `${label} (${code}): expected ${expected.toFixed(2)} ₸, actual ${actual.toFixed(2)} ₸ (deviation ${devPct.toFixed(2)} %).`,
          affected: { accountCode: code, expected, actual, deviation: dev, deviationPct: devPct },
          suggestedFix: `Verify rate is applied correctly on НачислениеЗарплаты. Base for ${label} = ${base.toFixed(2)} ₸.`,
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      } else {
        add(report, {
          ruleId: `TAX-004-${code}-ok`,
          ruleName: `${label} matches expected`,
          severity: "info",
          category: "tax",
          description: `${label} (${code}): ${actual.toFixed(2)} ≈ expected ${expected.toFixed(2)} (deviation ${devPct.toFixed(2)} %).`,
          affected: { accountCode: code, expected, actual, deviationPct: devPct },
          suggestedFix: "OK.",
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      }
    };

    expect("ОПВ (10 %)", "3220", t3220?.creditTurnover ?? 0, base * RATES.OPV);
    expect("ОППВ (5 % employer)", "3250", t3250?.creditTurnover ?? 0, base * RATES.OPPV);
    expect("СО (3.5 %)", "3211", t3211?.creditTurnover ?? 0, (base - base * RATES.OPV) * RATES.SO);
    expect("ВОСМС (3 % employer)", "3213", t3213?.creditTurnover ?? 0, base * RATES.VOSMS);
    expect("ОСМС-работник (2 %)", "3212", t3212?.creditTurnover ?? 0, base * RATES.OSMS);

    // ИПН uses standard deduction — approximate (assumes everyone gets the deduction)
    const baseAfterOPV = base - base * RATES.OPV - base * RATES.OSMS;
    // We can't divide by employee count without per-employee data; this is aggregate approx
    const ipnApprox = Math.max(0, baseAfterOPV - IPN_STD_DEDUCTION) * RATES.IPN;
    expect("ИПН (10 %)", "3120", t3120?.creditTurnover ?? 0, ipnApprox, 15); // wider tolerance due to per-employee variance

    // СН = (base − ОПВ − ОСМС) × 9.5 % − СО
    const snExpected = Math.max(0, baseAfterOPV * RATES.SN - (t3211?.creditTurnover ?? 0));
    expect("СН (9.5 % − СО)", "3150", t3150?.creditTurnover ?? 0, snExpected, 5);

    return finalize(report, start);
  }

  async validatePayrollDeductions(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("TaxValidator.payrollDeductions", { from: dateFrom, to: dateTo }, organizationGuid);

    // Pull НачислениеЗарплаты documents to compare per-doc base with thresholds
    const filters: string[] = [
      `Posted eq true`,
      `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const docs = await this.client.getCollection<{ Ref_Key: string; Number: string; Date: string; СуммаДокумента?: number }>(
      "Document_НачислениеЗарплатыРаботникамОрганизаций",
      { filter: filters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", top: 500 },
    ).catch(() => []);

    if (docs.length === 0) {
      add(report, {
        ruleId: "TAX-005",
        ruleName: "No payroll docs in period",
        severity: "info",
        category: "tax",
        description: "Нет проведённых НачислениеЗарплатыРаботникамОрганизаций — проверка вычетов невозможна.",
        affected: {},
        suggestedFix: "Если зарплата начислялась, проведите соответствующие документы.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    const totalPayroll = docs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0);
    const avgPerDoc = totalPayroll / docs.length;

    add(report, {
      ruleId: "TAX-005a",
      ruleName: "Payroll documents summary",
      severity: "info",
      category: "tax",
      description: `${docs.length} НачислениеЗарплаты на сумму ${totalPayroll.toFixed(2)} ₸ (среднее ${avgPerDoc.toFixed(2)} ₸ на документ).`,
      affected: { actual: totalPayroll, extras: { docCount: docs.length, avgPerDoc } },
      suggestedFix: "Constants 2026: МЗП = 85 000 ₸, МРП = 3 692 ₸, ИПН standard deduction = 14 МРП = 51 688 ₸.",
      ruleSource: "kz-agro-validation-rules.md#A.3",
    });

    // Flag docs below МЗП (likely error or part-time/missing data)
    const belowMzp = docs.filter(d => (d.СуммаДокумента ?? 0) > 0 && (d.СуммаДокумента ?? 0) < MZP);
    if (belowMzp.length > 0) {
      add(report, {
        ruleId: "TAX-005b",
        ruleName: "Payroll documents below МЗП",
        severity: "warn",
        category: "tax",
        description: `${belowMzp.length} документ(ов) с суммой < МЗП (${MZP} ₸). Возможно: совместители, неполный месяц, или ошибка.`,
        affected: { actual: belowMzp.length, expected: 0 },
        suggestedFix: `Проверить документы: ${belowMzp.slice(0, 5).map(d => `${d.Number} = ${(d.СуммаДокумента ?? 0).toFixed(0)} ₸`).join("; ")}.`,
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  async validatePayrollAccrualBalance(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("TaxValidator.payrollAccrualBalance", { from: dateFrom, to: dateTo }, organizationGuid);

    const filters: string[] = [
      `Posted eq true`,
      `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const [docs, t3350] = await Promise.all([
      this.client.getCollection<{ СуммаДокумента?: number }>(
        "Document_НачислениеЗарплатыРаботникамОрганизаций",
        { filter: filters.join(" and "), select: "Ref_Key,СуммаДокумента", top: 1000 },
      ).catch(() => []),
      this.register.getAccountTurnovers("3350", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const docTotal = docs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0);
    const accrualCr = t3350?.creditTurnover ?? 0;

    if (docs.length === 0 && accrualCr === 0) {
      add(report, {
        ruleId: "TAX-006",
        ruleName: "No payroll activity",
        severity: "info",
        category: "tax",
        description: "Нет ни НачислениеЗарплаты, ни оборотов на 3350.",
        affected: {},
        suggestedFix: "Нет действий.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    const deviation = accrualCr - docTotal;
    const deviationPct = docTotal > 0 ? (deviation / docTotal) * 100 : 0;

    if (Math.abs(deviationPct) > 2) {
      add(report, {
        ruleId: "TAX-006a",
        ruleName: "3350 turnover does not match payroll docs",
        severity: "error",
        category: "tax",
        description: `НачислениеЗарплаты сумма = ${docTotal.toFixed(2)} ₸, обороты 3350 Кт = ${accrualCr.toFixed(2)} ₸ (отклонение ${deviationPct.toFixed(2)} %).`,
        affected: { accountCode: "3350", expected: docTotal, actual: accrualCr, deviation, deviationPct },
        suggestedFix: "Проверить, что все НачислениеЗарплаты проведены и формируют корректные проводки 8112/7210 → 3350.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else {
      add(report, {
        ruleId: "TAX-006b",
        ruleName: "3350 matches payroll docs",
        severity: "info",
        category: "tax",
        description: `НачислениеЗарплаты ${docTotal.toFixed(2)} ≈ 3350 Кт ${accrualCr.toFixed(2)} (отклонение ${deviationPct.toFixed(2)} %).`,
        affected: { accountCode: "3350", expected: docTotal, actual: accrualCr, deviationPct },
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }
}
