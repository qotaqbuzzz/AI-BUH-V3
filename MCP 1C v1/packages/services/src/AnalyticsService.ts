import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface FinancialSummary {
  date: string;
  cashOnHand: number;
  cashInBank: number;
  totalCash: number;
  accountsReceivable: number;
  accountsPayable: number;
  vatLiability: number;
  kpnLiability: number;
  netWorkingCapital: number;
}

export class AnalyticsService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getMonthlyTrend(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<{
    months: { month: string; revenue: number; cogs: number; overhead: number; grossProfit: number; operatingProfit: number }[];
    totals: { revenue: number; cogs: number; overhead: number; grossProfit: number; operatingProfit: number };
  }> {
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const months: { label: string; from: string; to: string }[] = [];
    const [y0s, m0s] = dateFrom.split("-");
    const [y1s, m1s] = dateTo.split("-");
    let y = parseInt(y0s ?? "2026", 10), m = parseInt(m0s ?? "1", 10);
    const yEnd = parseInt(y1s ?? "2026", 10), mEnd = parseInt(m1s ?? "12", 10);
    while (y < yEnd || (y === yEnd && m <= mEnd)) {
      const label = `${y}-${String(m).padStart(2, "0")}`;
      const lastDay = new Date(y, m, 0).getDate();
      months.push({ label, from: `${label}-01`, to: `${label}-${String(lastDay).padStart(2, "0")}` });
      m++;
      if (m > 12) { m = 1; y++; }
    }

    const rows = await Promise.all(months.map(async ({ label, from, to }) => {
      const [rev, cogs, overhead] = await Promise.all([
        this.register.getAccountTurnovers("6010", from, to, organizationGuid),
        this.register.getAccountTurnovers("7010", from, to, organizationGuid),
        this.register.getAccountTurnovers("7210", from, to, organizationGuid),
      ]);
      const revenue = rev.creditTurnover;
      const cogsAmt = cogs.debitTurnover;
      const overheadAmt = overhead.debitTurnover;
      return { month: label, revenue, cogs: cogsAmt, overhead: overheadAmt, grossProfit: revenue - cogsAmt, operatingProfit: revenue - cogsAmt - overheadAmt };
    }));

    return {
      months: rows,
      totals: {
        revenue: r2(rows.reduce((s, r) => s + r.revenue, 0)),
        cogs: r2(rows.reduce((s, r) => s + r.cogs, 0)),
        overhead: r2(rows.reduce((s, r) => s + r.overhead, 0)),
        grossProfit: r2(rows.reduce((s, r) => s + r.grossProfit, 0)),
        operatingProfit: r2(rows.reduce((s, r) => s + r.operatingProfit, 0)),
      },
    };
  }

  async getFinancialSummary(organizationGuid: string, date?: string): Promise<FinancialSummary> {
    const asOf = date ?? new Date().toISOString().split("T")[0];

    const [cash1010, cash1030, ar1210, ap3310, vat3130, vat1420, kpn3110] = await Promise.all([
      this.register.getAccountBalance("1010", organizationGuid, asOf),
      this.register.getAccountBalance("1030", organizationGuid, asOf),
      this.register.getAccountBalance("1210", organizationGuid, asOf),
      this.register.getAccountBalance("3310", organizationGuid, asOf),
      this.register.getAccountBalance("3130", organizationGuid, asOf),
      this.register.getAccountBalance("1420", organizationGuid, asOf),
      this.register.getAccountBalance("3110", organizationGuid, asOf),
    ]);

    const cashOnHand = cash1010.netBalance;
    const cashInBank = cash1030.netBalance;
    const totalCash = cashOnHand + cashInBank;
    const accountsReceivable = ar1210.debitBalance;
    const accountsPayable = ap3310.creditBalance;
    const vatLiability = Math.max(0, vat3130.creditBalance - vat1420.debitBalance);
    const kpnLiability = kpn3110.creditBalance;
    const netWorkingCapital = totalCash + accountsReceivable - accountsPayable - vatLiability - kpnLiability;

    return {
      date: asOf,
      cashOnHand,
      cashInBank,
      totalCash,
      accountsReceivable,
      accountsPayable,
      vatLiability,
      kpnLiability,
      netWorkingCapital,
    };
  }
}
