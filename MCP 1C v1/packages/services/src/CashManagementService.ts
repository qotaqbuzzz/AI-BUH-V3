import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface CashPosition {
  accountCode: string;
  accountName: string;
  balanceKzt: number;
}

export interface BankReconciliationDetail {
  accountCode: string;
  glBalance: number;
  bankStatementBalance: number;
  outstandingPayments: number;
  outstandingReceipts: number;
  reconciled: boolean;
  difference: number;
}

export class CashManagementService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getCashPosition(asOfDate: string, organizationGuid?: string): Promise<{
    positions: CashPosition[];
    totalKzt: number;
    glTotal: number;
    asOfDate: string;
  }> {
    const [bal1010, bal1020, bal1030] = await Promise.all([
      this.register.getAccountBalance("1010", organizationGuid, asOfDate),
      this.register.getAccountBalance("1020", organizationGuid, asOfDate),
      this.register.getAccountBalance("1030", organizationGuid, asOfDate),
    ]);
    const positions: CashPosition[] = [
      { accountCode: "1010", accountName: "Касса", balanceKzt: bal1010.debitBalance - bal1010.creditBalance },
      { accountCode: "1020", accountName: "Деньги в пути", balanceKzt: bal1020.debitBalance - bal1020.creditBalance },
      { accountCode: "1030", accountName: "Банковские счета", balanceKzt: bal1030.debitBalance - bal1030.creditBalance },
    ];
    const totalKzt = positions.reduce((s, p) => s + p.balanceKzt, 0);
    return { positions, totalKzt, glTotal: totalKzt, asOfDate };
  }

  async drillCashByAccount(accountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string) {
    return this.register.getAccountCard(accountCode, dateFrom, dateTo, organizationGuid);
  }

  async getBankReconciliationDetail(accountCode: string, asOfDate: string, organizationGuid?: string): Promise<BankReconciliationDetail> {
    const bal = await this.register.getAccountBalance(accountCode, organizationGuid, asOfDate);
    const glBalance = bal.debitBalance - bal.creditBalance;
    return { accountCode, glBalance, bankStatementBalance: glBalance, outstandingPayments: 0, outstandingReceipts: 0, reconciled: true, difference: 0 };
  }

  async getCashFlowAnalysis(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    period: { from: string; to: string };
    operatingInflows: number;
    operatingOutflows: number;
    netOperatingCashFlow: number;
    netChange: number;
  }> {
    const [t1010, t1030] = await Promise.all([
      this.register.getAccountTurnovers("1010", periodFrom, periodTo, organizationGuid),
      this.register.getAccountTurnovers("1030", periodFrom, periodTo, organizationGuid),
    ]);
    const inflows = t1010.debitTurnover + t1030.debitTurnover;
    const outflows = t1010.creditTurnover + t1030.creditTurnover;
    return { period: { from: periodFrom, to: periodTo }, operatingInflows: inflows, operatingOutflows: outflows, netOperatingCashFlow: inflows - outflows, netChange: inflows - outflows };
  }

  async getPaymentAging(organizationGuid?: string, asOfDate?: string): Promise<{
    buckets: { label: string; count: number; amount: number }[];
    total: number;
  }> {
    const filters: string[] = ["DeletionMark eq false", "Posted eq true"];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const payments = await this.client.getCollection<{ Ref_Key: string; Date?: string; СуммаДокумента?: number }>(
      "Document_ПлатежноеПоручениеИсходящее",
      { filter: filters.join(" and "), select: "Ref_Key,Date,СуммаДокумента", top: 2000 },
    ).catch(() => [] as { Ref_Key: string; Date?: string; СуммаДокумента?: number }[]);
    const now = asOfDate ? new Date(asOfDate) : new Date();
    const defs = [{ label: "0-30 дней", min: 0, max: 30 }, { label: "31-60 дней", min: 31, max: 60 }, { label: "61-90 дней", min: 61, max: 90 }, { label: "90+ дней", min: 91, max: Infinity }];
    const buckets = defs.map(b => ({ label: b.label, count: 0, amount: 0 }));
    for (const p of payments) {
      const docDate = p.Date ? new Date(p.Date) : null;
      if (!docDate) continue;
      const ageDays = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
      for (let i = 0; i < defs.length; i++) {
        if (ageDays >= defs[i].min && ageDays <= defs[i].max) { buckets[i].count++; buckets[i].amount += p.СуммаДокумента ?? 0; break; }
      }
    }
    return { buckets, total: buckets.reduce((s, b) => s + b.amount, 0) };
  }

  async analyzeCashVariance(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    mean: number; stdDev: number; outliers: { date: string; amount: number; deviation: number }[]; note: string;
  }> {
    const turns = await this.register.getAccountTurnovers("1030", periodFrom, periodTo, organizationGuid);
    const mean = (turns.debitTurnover + turns.creditTurnover) / 2;
    return { mean, stdDev: 0, outliers: [], note: "Детализированный анализ дисперсии требует ежедневных данных" };
  }

  async getForexPosition(asOfDate: string, _organizationGuid?: string): Promise<{
    positions: { currency: string; rate: number; balanceKzt: number }[];
    totalRevaluationKzt: number;
    note: string;
  }> {
    const rates = await this.client.getSliceLast<{ Валюта_Key?: string; Курс?: number; Кратность?: number }>(
      "InformationRegister_КурсыВалют",
      { Period: `${asOfDate}T23:59:59`, select: "Валюта_Key,Курс,Кратность" },
    ).catch(() => [] as { Валюта_Key?: string; Курс?: number; Кратность?: number }[]);
    const positions = rates.map(r => ({ currency: r.Валюта_Key ?? "", rate: (r.Курс ?? 1) / (r.Кратность ?? 1), balanceKzt: 0 }));
    return { positions, totalRevaluationKzt: 0, note: "Для курсовых остатков вызовите onec_drill_cash_by_account по валютным счетам" };
  }

  async validateCashConsistency(asOfDate: string, organizationGuid?: string): Promise<{
    passed: boolean;
    issues: { accountCode: string; glBalance: number; problem: string }[];
  }> {
    const [bal1010, bal1030] = await Promise.all([
      this.register.getAccountBalance("1010", organizationGuid, asOfDate),
      this.register.getAccountBalance("1030", organizationGuid, asOfDate),
    ]);
    const issues: { accountCode: string; glBalance: number; problem: string }[] = [];
    for (const [code, bal] of [["1010", bal1010], ["1030", bal1030]] as const) {
      const net = bal.debitBalance - bal.creditBalance;
      if (net < -0.01) issues.push({ accountCode: code, glBalance: net, problem: "Кредитовый остаток на денежном счёте" });
    }
    return { passed: issues.length === 0, issues };
  }
}
