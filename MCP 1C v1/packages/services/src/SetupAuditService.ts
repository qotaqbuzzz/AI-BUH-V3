import type { OneCClient } from "@aibos/onec-client";
import type { ReportsService, OSVRow } from "./ReportsService.js";

// KZ standard chart of accounts — accounts that must exist for any operating entity
const REQUIRED_ACCOUNTS: { code: string; name: string; reason: string }[] = [
  { code: "1010", name: "Денежные средства в кассе", reason: "Касса" },
  { code: "1030", name: "Деньги на текущих банковских счетах", reason: "Банк" },
  { code: "1210", name: "Краткосрочная дебиторская задолженность покупателей и заказчиков", reason: "Дебиторы" },
  { code: "1310", name: "Сырьё и материалы", reason: "Материалы" },
  { code: "1320", name: "Готовая продукция", reason: "Готовая продукция" },
  { code: "3110", name: "КПН", reason: "Налог на прибыль" },
  { code: "3130", name: "НДС", reason: "НДС" },
  { code: "3310", name: "Краткосрочная кредиторская задолженность поставщикам и подрядчикам", reason: "Кредиторы" },
  { code: "3350", name: "Краткосрочная задолженность по оплате труда", reason: "Зарплата" },
  { code: "6010", name: "Доход от реализации продукции и оказания услуг", reason: "Выручка" },
  { code: "7010", name: "Себестоимость реализованной продукции и оказанных услуг", reason: "COGS" },
];

export interface GlMappingIssue {
  severity: "error" | "warn" | "info";
  code: string;
  accountCode: string;
  message: string;
  recommendation: string;
}

export interface GlAuditResult {
  asOfDate: string;
  totalAccountsInChart: number;
  requiredAccountsPresent: string[];
  requiredAccountsMissing: { code: string; name: string; reason: string }[];
  deletedRequiredAccounts: { code: string; name: string }[];
  issues: GlMappingIssue[];
  passed: boolean;
}

export interface OpeningBalanceMismatch {
  accountCode: string;
  accountName: string;
  priorCloseDr: number;
  priorCloseCr: number;
  currentOpenDr: number;
  currentOpenCr: number;
  diffDr: number;
  diffCr: number;
}

export interface OpeningBalanceResult {
  asOfDate: string;
  priorDate: string;
  organizationGuid: string;
  totalAccountsChecked: number;
  mismatches: OpeningBalanceMismatch[];
  passed: boolean;
  maxAbsDiff: number;
}

const TOLERANCE = 0.01;

export class SetupAuditService {
  constructor(
    private readonly client: OneCClient,
    private readonly reports: ReportsService,
  ) {}

  async auditGlAccountMapping(asOfDate: string, organizationGuid?: string): Promise<GlAuditResult> {
    const chartRows = await this.client.getCollection<{
      Ref_Key: string;
      Code: string;
      Description: string;
      DeletionMark: boolean;
    }>(
      "ChartOfAccounts_Типовой",
      { select: "Ref_Key,Code,Description,DeletionMark", top: 2000 },
    );

    const activeByCode = new Map<string, string>();
    const deletedCodes = new Set<string>();

    for (const row of chartRows) {
      const code = row.Code?.trim() ?? "";
      if (!code) continue;
      if (row.DeletionMark) {
        deletedCodes.add(code);
      } else {
        activeByCode.set(code, row.Description ?? "");
      }
    }

    const requiredAccountsPresent: string[] = [];
    const requiredAccountsMissing: typeof REQUIRED_ACCOUNTS = [];
    const deletedRequiredAccounts: { code: string; name: string }[] = [];

    for (const req of REQUIRED_ACCOUNTS) {
      if (activeByCode.has(req.code)) {
        requiredAccountsPresent.push(req.code);
      } else if (deletedCodes.has(req.code)) {
        deletedRequiredAccounts.push({ code: req.code, name: req.name });
      } else {
        requiredAccountsMissing.push(req);
      }
    }

    const issues: GlMappingIssue[] = [];

    for (const missing of requiredAccountsMissing) {
      issues.push({
        severity: "error",
        code: "MISSING_REQUIRED_ACCOUNT",
        accountCode: missing.code,
        message: `Счёт ${missing.code} (${missing.name}) отсутствует в плане счетов`,
        recommendation: `Добавьте счёт ${missing.code} в типовой план счетов 1С`,
      });
    }

    for (const del of deletedRequiredAccounts) {
      issues.push({
        severity: "warn",
        code: "DELETED_REQUIRED_ACCOUNT",
        accountCode: del.code,
        message: `Счёт ${del.code} помечен на удаление, но используется в типовом учёте`,
        recommendation: `Снимите пометку удаления со счёта ${del.code}`,
      });
    }

    return {
      asOfDate,
      totalAccountsInChart: activeByCode.size,
      requiredAccountsPresent,
      requiredAccountsMissing,
      deletedRequiredAccounts,
      issues,
      passed: issues.filter(i => i.severity === "error").length === 0,
    };
  }

  async verifyOpeningBalances(asOfDate: string, organizationGuid: string): Promise<OpeningBalanceResult> {
    const priorDate = this.previousDay(asOfDate);

    const [priorOSV, currentOSV] = await Promise.all([
      this.reports.getOSV(priorDate, priorDate, organizationGuid),
      this.reports.getOSV(asOfDate, asOfDate, organizationGuid),
    ]);

    const priorClose = new Map<string, OSVRow>();
    for (const row of priorOSV.rows) priorClose.set(row.accountCode, row);

    const currentOpen = new Map<string, OSVRow>();
    for (const row of currentOSV.rows) currentOpen.set(row.accountCode, row);

    const allCodes = new Set([...priorClose.keys(), ...currentOpen.keys()]);
    const mismatches: OpeningBalanceMismatch[] = [];

    for (const code of allCodes) {
      const prior = priorClose.get(code);
      const current = currentOpen.get(code);

      const pCloseDr = prior?.closingDr ?? 0;
      const pCloseCr = prior?.closingCr ?? 0;
      const cOpenDr = current?.openingDr ?? 0;
      const cOpenCr = current?.openingCr ?? 0;

      const diffDr = Math.abs(pCloseDr - cOpenDr);
      const diffCr = Math.abs(pCloseCr - cOpenCr);

      if (diffDr > TOLERANCE || diffCr > TOLERANCE) {
        mismatches.push({
          accountCode: code,
          accountName: prior?.accountName ?? current?.accountName ?? "",
          priorCloseDr: pCloseDr,
          priorCloseCr: pCloseCr,
          currentOpenDr: cOpenDr,
          currentOpenCr: cOpenCr,
          diffDr,
          diffCr,
        });
      }
    }

    const maxAbsDiff = mismatches.reduce((max, m) => Math.max(max, m.diffDr, m.diffCr), 0);

    return {
      asOfDate,
      priorDate,
      organizationGuid,
      totalAccountsChecked: allCodes.size,
      mismatches,
      passed: mismatches.length === 0,
      maxAbsDiff,
    };
  }

  private previousDay(isoDate: string): string {
    const d = new Date(isoDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
}
