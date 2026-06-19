import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface BudgetVsActualLine {
  accountCode: string;
  accountName: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
}

export class BudgetService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getBudgetVsActual(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    period: { from: string; to: string };
    lines: BudgetVsActualLine[];
    totalBudget: number;
    totalActual: number;
    totalVariance: number;
    dataSource: string;
  }> {
    const budgetRows = await this.client.getCollection<{
      Статья?: { Счет?: string; Description?: string };
      Сумма?: number;
    }>("InformationRegister_БюджетныеПоказатели", {
      filter: `Период ge datetime'${periodFrom}T00:00:00' and Период le datetime'${periodTo}T23:59:59'`,
      expand: "Статья",
      select: "Статья,Сумма",
      top: 500,
    }).catch(() => [] as { Статья?: { Счет?: string; Description?: string }; Сумма?: number }[]);

    const hasBudgetData = budgetRows.length > 0;
    const dataSource = hasBudgetData ? "InformationRegister_БюджетныеПоказатели" : "stub — данных бюджета нет; создайте регистр или Catalog_Бюджет в 1С";

    const [rev6010, cogs7010, opex7210] = await Promise.all([
      this.register.getAccountTurnovers("6010", periodFrom, periodTo, organizationGuid),
      this.register.getAccountTurnovers("7010", periodFrom, periodTo, organizationGuid),
      this.register.getAccountTurnovers("7210", periodFrom, periodTo, organizationGuid),
    ]);

    const lines: BudgetVsActualLine[] = [
      { accountCode: "6010", accountName: "Выручка", budgetAmount: 0, actualAmount: rev6010.creditTurnover, variance: -rev6010.creditTurnover, variancePercent: 0 },
      { accountCode: "7010", accountName: "Себестоимость", budgetAmount: 0, actualAmount: cogs7010.debitTurnover, variance: -cogs7010.debitTurnover, variancePercent: 0 },
      { accountCode: "7210", accountName: "Административные расходы", budgetAmount: 0, actualAmount: opex7210.debitTurnover, variance: -opex7210.debitTurnover, variancePercent: 0 },
    ];

    if (hasBudgetData) {
      for (const row of budgetRows) {
        const code = row.Статья?.Счет ?? "";
        const line = lines.find(l => l.accountCode === code);
        if (line) {
          line.budgetAmount = row.Сумма ?? 0;
          line.variance = line.budgetAmount - line.actualAmount;
          line.variancePercent = line.budgetAmount > 0 ? (line.variance / line.budgetAmount) * 100 : 0;
        }
      }
    }

    const totalBudget = lines.reduce((s, l) => s + l.budgetAmount, 0);
    const totalActual = lines.reduce((s, l) => s + l.actualAmount, 0);
    return { period: { from: periodFrom, to: periodTo }, lines, totalBudget, totalActual, totalVariance: totalBudget - totalActual, dataSource };
  }

  async forecastYearEnd(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    ytdRevenue: number; ytdExpenses: number; projectedYearEndRevenue: number; projectedYearEndExpenses: number; projectedNetIncome: number; monthsElapsed: number; monthsRemaining: number;
  }> {
    const [rev, cogs, opex] = await Promise.all([
      this.register.getAccountTurnovers("6010", periodFrom, periodTo, organizationGuid),
      this.register.getAccountTurnovers("7010", periodFrom, periodTo, organizationGuid),
      this.register.getAccountTurnovers("7210", periodFrom, periodTo, organizationGuid),
    ]);
    const monthsElapsed = Math.max(1, Math.round((new Date(periodTo).getTime() - new Date(periodFrom).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthsRemaining = Math.max(0, 12 - monthsElapsed);
    const factor = 12 / monthsElapsed;
    const ytdRevenue = rev.creditTurnover;
    const ytdExpenses = cogs.debitTurnover + opex.debitTurnover;
    return { ytdRevenue, ytdExpenses, projectedYearEndRevenue: ytdRevenue * factor, projectedYearEndExpenses: ytdExpenses * factor, projectedNetIncome: (ytdRevenue - ytdExpenses) * factor, monthsElapsed, monthsRemaining };
  }

  async analyzeVarianceDrivers(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    drivers: { accountCode: string; accountName: string; variance: number; contributionPercent: number }[];
    totalVariance: number;
  }> {
    const bva = await this.getBudgetVsActual(periodFrom, periodTo, organizationGuid);
    const drivers = bva.lines.filter(l => Math.abs(l.variance) > 0).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));
    const totalAbs = drivers.reduce((s, d) => s + Math.abs(d.variance), 0);
    return {
      drivers: drivers.map(d => ({ accountCode: d.accountCode, accountName: d.accountName, variance: d.variance, contributionPercent: totalAbs > 0 ? (Math.abs(d.variance) / totalAbs) * 100 : 0 })),
      totalVariance: bva.totalVariance,
    };
  }
}
