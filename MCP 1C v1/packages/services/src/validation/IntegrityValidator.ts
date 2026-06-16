import type { OneCClient } from "@aibos/onec-client";
import type { ReportsService } from "../ReportsService.js";
import type { RegisterService } from "../RegisterService.js";
import { add, emptyReport, finalize, type ValidationReport } from "./types.js";

// Contra-asset accounts where credit balance is normal (provisions, accumulated depreciation, impairment)
const CONTRA_ASSETS = new Set([
  "1090", "1170", "1280", "1360", "1530", "1630", "1740",
  "2080", "2180", "2230", "2330", "2420", "2430", "2450", "2460",
  "2530", "2540", "2620", "2630", "2720", "2740", "2750", "2770", "2780",
  "2950", "2980",
]);

// Liability accounts where debit balance is acceptable (prepayments to budget)
const PREPAID_LIABILITIES = new Set(["3110", "3120", "3130", "3140", "3150"]);

// Accounts that should carry a contractor sub-account
const CONTRACTOR_ACCOUNTS = ["1210", "1220", "1230", "1710", "2110", "3310", "3320", "3510", "4110"];

// Accounts that should carry an employee sub-account
const EMPLOYEE_ACCOUNTS = ["1251", "1254", "3350", "3385"];

// Accounts that should carry a nomenclature sub-account
const NOMENCLATURE_ACCOUNTS = ["1310", "1320", "1330", "1340", "1341"];

interface RecorderEntry {
  Регистратор?: string;
  Период?: string;
  СчетДт_Key?: string;
  СчетКт_Key?: string;
  Сумма?: number;
  СуммаDr?: number;
  СуммаCr?: number;
}

export class IntegrityValidator {
  constructor(
    private readonly client: OneCClient,
    private readonly reports: ReportsService,
    private readonly register: RegisterService,
  ) {}

  async validateDoubleEntry(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
    perDocumentSampleLimit = 0,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("IntegrityValidator.doubleEntry", { from: dateFrom, to: dateTo }, organizationGuid);

    // 1. Trial-balance level: Σ Дт = Σ Кт
    const osv = await this.reports.getOSV(dateFrom, dateTo, organizationGuid);

    const openDiff = osv.totals.openDr - osv.totals.openCr;
    const turnDiff = osv.totals.turnDr - osv.totals.turnCr;
    const closeDiff = osv.totals.closeDr - osv.totals.closeCr;

    if (Math.abs(openDiff) > 1) {
      add(report, {
        ruleId: "INT-001a",
        ruleName: "Opening balance imbalance",
        severity: "critical",
        category: "integrity",
        description: `Trial balance opening: Дт ${osv.totals.openDr.toFixed(2)} ≠ Кт ${osv.totals.openCr.toFixed(2)} (diff ${openDiff.toFixed(2)} ₸)`,
        affected: { expected: 0, actual: openDiff, deviation: openDiff },
        suggestedFix: "Carry-over from prior period is broken. Re-run закрытие года; verify реформация (5710→5610).",
        ruleSource: "kz-agro-validation-rules.md#A.1",
      });
    }
    if (Math.abs(turnDiff) > 1) {
      add(report, {
        ruleId: "INT-001b",
        ruleName: "Turnover imbalance",
        severity: "critical",
        category: "integrity",
        description: `Period turnover: Дт ${osv.totals.turnDr.toFixed(2)} ≠ Кт ${osv.totals.turnCr.toFixed(2)} (diff ${turnDiff.toFixed(2)} ₸)`,
        affected: { expected: 0, actual: turnDiff, deviation: turnDiff },
        suggestedFix: "Find document(s) that posted unbalanced entries — query AccountingRegister_Типовой_RecordType grouped by Recorder.",
        ruleSource: "kz-agro-validation-rules.md#A.1",
      });
    }
    if (Math.abs(closeDiff) > 1) {
      add(report, {
        ruleId: "INT-001c",
        ruleName: "Closing balance imbalance",
        severity: "critical",
        category: "integrity",
        description: `Trial balance closing: Дт ${osv.totals.closeDr.toFixed(2)} ≠ Кт ${osv.totals.closeCr.toFixed(2)} (diff ${closeDiff.toFixed(2)} ₸)`,
        affected: { expected: 0, actual: closeDiff, deviation: closeDiff },
        suggestedFix: "Direct consequence of opening or turnover imbalance — fix the upstream issue first.",
        ruleSource: "kz-agro-validation-rules.md#A.1",
      });
    }

    // 2. Per-document double-entry sample (optional, expensive)
    if (perDocumentSampleLimit > 0) {
      const filters: string[] = [
        `Период ge datetime'${dateFrom}T00:00:00'`,
        `Период le datetime'${dateTo}T23:59:59'`,
      ];
      const journal = await this.client.getCollection<RecorderEntry>("AccountingRegister_Типовой_RecordType", {
        filter: filters.join(" and "),
        select: "Регистратор,Период,Сумма",
        top: Math.min(perDocumentSampleLimit * 50, 5000),
      }).catch(() => []);

      const perRecorder = new Map<string, { dr: number; cr: number }>();
      for (const row of journal) {
        const key = row.Регистратор ?? "";
        if (!key) continue;
        const e = perRecorder.get(key) ?? { dr: 0, cr: 0 };
        const amt = row.Сумма ?? 0;
        e.dr += row.СуммаDr ?? amt;
        e.cr += row.СуммаCr ?? amt;
        perRecorder.set(key, e);
      }

      let flagged = 0;
      for (const [recorder, e] of perRecorder.entries()) {
        if (Math.abs(e.dr - e.cr) > 1) {
          flagged++;
          if (flagged > perDocumentSampleLimit) break;
          add(report, {
            ruleId: "INT-001d",
            ruleName: "Per-document Дт ≠ Кт",
            severity: "error",
            category: "integrity",
            description: `Document ${recorder}: Дт ${e.dr.toFixed(2)} ≠ Кт ${e.cr.toFixed(2)} (diff ${(e.dr - e.cr).toFixed(2)} ₸)`,
            affected: { documentGuid: recorder, expected: 0, actual: e.dr - e.cr, deviation: e.dr - e.cr },
            suggestedFix: "Open the document in 1C and recheck its postings (Дт/Кт tab). Re-post if needed.",
            ruleSource: "kz-agro-validation-rules.md#A.1",
          });
        }
      }
    }

    return finalize(report, start);
  }

  async validateAccountSigns(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("IntegrityValidator.accountSigns", { from: dateFrom, to: dateTo }, organizationGuid);

    const osv = await this.reports.getOSV(dateFrom, dateTo, organizationGuid);

    for (const row of osv.rows) {
      const code = row.accountCode;
      const netClose = row.closingDr - row.closingCr;
      const isAsset = /^[12]/.test(code);
      const isLiability = /^[34]/.test(code);

      // Assets with credit balance (excluding contra-assets)
      if (isAsset && !CONTRA_ASSETS.has(code) && netClose < -1) {
        add(report, {
          ruleId: "INT-002a",
          ruleName: "Atypical credit balance on asset account",
          severity: "error",
          category: "integrity",
          description: `Account ${code} (${row.accountName}) closing: Кт ${Math.abs(netClose).toFixed(2)} ₸ — asset should not have credit balance`,
          affected: { accountCode: code, accountName: row.accountName, actual: netClose, expected: 0 },
          suggestedFix: `Check for posting errors. If overpayment scenario, reclassify to 3xxx. Review ОперацияБух on this account.`,
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }

      // Liabilities with debit balance (excluding prepaid budget accounts)
      if (isLiability && !PREPAID_LIABILITIES.has(code) && netClose > 1) {
        add(report, {
          ruleId: "INT-002b",
          ruleName: "Atypical debit balance on liability account",
          severity: "error",
          category: "integrity",
          description: `Account ${code} (${row.accountName}) closing: Дт ${netClose.toFixed(2)} ₸ — liability should not have debit balance`,
          affected: { accountCode: code, accountName: row.accountName, actual: netClose, expected: 0 },
          suggestedFix: `Possible overpayment or reclassification needed. If supplier overpaid, reclassify to 1710 (Авансы выданные).`,
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }

      // Negative closing turnover signs — red storno
      if (row.turnoverDr < -1) {
        add(report, {
          ruleId: "INT-002c",
          ruleName: "Negative debit turnover (red storno)",
          severity: "warn",
          category: "integrity",
          description: `Account ${code}: Дт turnover ${row.turnoverDr.toFixed(2)} ₸ (negative — red storno)`,
          affected: { accountCode: code, accountName: row.accountName, actual: row.turnoverDr },
          suggestedFix: "Verify storno is intentional (correction of prior error). Otherwise re-post the underlying document.",
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }
      if (row.turnoverCr < -1) {
        add(report, {
          ruleId: "INT-002d",
          ruleName: "Negative credit turnover (red storno)",
          severity: "warn",
          category: "integrity",
          description: `Account ${code}: Кт turnover ${row.turnoverCr.toFixed(2)} ₸ (negative — red storno)`,
          affected: { accountCode: code, accountName: row.accountName, actual: row.turnoverCr },
          suggestedFix: "Verify storno is intentional. Negative credit on liability accounts often indicates a reversed accrual.",
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }
    }

    return finalize(report, start);
  }

  async validateBalanceArithmetic(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("IntegrityValidator.balanceArithmetic", { from: dateFrom, to: dateTo }, organizationGuid);

    const osv = await this.reports.getOSV(dateFrom, dateTo, organizationGuid);

    for (const row of osv.rows) {
      const openingNet = row.openingDr - row.openingCr;
      const turnoverNet = row.turnoverDr - row.turnoverCr;
      const closingNet = row.closingDr - row.closingCr;
      const computed = openingNet + turnoverNet;
      const diff = closingNet - computed;

      if (Math.abs(diff) > 1) {
        add(report, {
          ruleId: "INT-003",
          ruleName: "Balance arithmetic broken (opening + turnover ≠ closing)",
          severity: "critical",
          category: "integrity",
          description: `Account ${row.accountCode} (${row.accountName}): expected closing ${computed.toFixed(2)} but got ${closingNet.toFixed(2)} (diff ${diff.toFixed(2)} ₸)`,
          affected: {
            accountCode: row.accountCode,
            accountName: row.accountName,
            expected: computed,
            actual: closingNet,
            deviation: diff,
          },
          suggestedFix: "Indicates corrupted register data or unposted period transition. Run 'Перепроведение документов' in 1C for the period.",
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }
    }

    return finalize(report, start);
  }

  async validateExtDimensions(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("IntegrityValidator.extDimensions", { from: dateFrom, to: dateTo }, organizationGuid);

    const check = async (accountCode: string, dimensionType: "contractor" | "employee" | "nomenclature") => {
      const breakdown = await this.register.getAccountBreakdown(accountCode, dateTo, organizationGuid).catch(() => []);
      if (breakdown.length === 0) return; // account inactive — skip
      const orphan = breakdown.filter(b => !b.dim1 || b.dim1 === "00000000-0000-0000-0000-000000000000");
      if (orphan.length > 0) {
        const total = orphan.reduce((s, r) => s + Math.abs((r.amountDr ?? 0) - (r.amountCr ?? 0)), 0);
        add(report, {
          ruleId: "INT-004",
          ruleName: `Missing ${dimensionType} sub-account on account ${accountCode}`,
          severity: "error",
          category: "integrity",
          description: `Account ${accountCode}: ${orphan.length} entries without ${dimensionType} sub-account (total amount ${total.toFixed(2)} ₸)`,
          affected: { accountCode, actual: orphan.length, extras: { totalAmount: total, expectedDimension: dimensionType } },
          suggestedFix: `Open AccountingRegister_Типовой entries for account ${accountCode} where ExtDimension1 is empty and assign the correct ${dimensionType}.`,
          ruleSource: "kz-agro-validation-rules.md#A.1",
        });
      }
    };

    await Promise.all([
      ...CONTRACTOR_ACCOUNTS.map(c => check(c, "contractor")),
      ...EMPLOYEE_ACCOUNTS.map(c => check(c, "employee")),
      ...NOMENCLATURE_ACCOUNTS.map(c => check(c, "nomenclature")),
    ]);

    return finalize(report, start);
  }
}
