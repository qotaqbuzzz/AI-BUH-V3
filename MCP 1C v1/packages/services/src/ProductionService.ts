import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

// КЗ 2026 constants
const MRP_2026 = 3692;
const MZP_2026 = 85000;
const STANDARD_DEDUCTION_MRP = 14;

export interface PayrollTaxResult {
  grossSalary: number;
  opv: number;
  oosms: number;
  taxableBase: number;
  standardDeduction: number;
  ipn: number;
  netSalary: number;
  oppv: number;
  so: number;
  vosms: number;
  sn: number;
  totalEmployerCost: number;
}

export interface KPNEstimate {
  revenue: number;
  totalExpenses: number;
  taxableProfit: number;
  kpnBase: number;
  kpnRate: number;
  agroReduction: number;
  kpnPayable: number;
  isAgro: boolean;
}

export class ProductionService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getProductionCosts(organizationGuid: string, date?: string): Promise<{
    account: string;
    debitBalance: number;
    creditBalance: number;
    wipBalance: number;
    description: string;
  }> {
    const bal = await this.register.getAccountBalance("8110", organizationGuid, date);
    return {
      account: "8110 Основное производство",
      debitBalance: bal.debitBalance,
      creditBalance: bal.creditBalance,
      wipBalance: bal.netBalance,
      description: "Незавершённое производство (НЗП) — накопленные затраты производственного цикла",
    };
  }

  async getMaterialsBalance(organizationGuid: string, date?: string, nomenclatureGuid?: string): Promise<{
    account: string;
    inventory: unknown[];
    totalCost: number;
  }> {
    const inventory = await this.register.getInventoryBalance(organizationGuid, nomenclatureGuid, date);
    const totalCost = inventory.reduce((s, r) => s + ((r as { СтоимостьBalance?: number }).СтоимостьBalance ?? 0), 0);
    return { account: "1310 Сырьё и материалы", inventory, totalCost };
  }

  /** Get finished goods balance (account 1320 — Готовая продукция). */
  async getFinishedGoodsBalance(organizationGuid: string, date?: string): Promise<{
    account: string;
    debitBalance: number;
    creditBalance: number;
    stockBalance: number;
  }> {
    const bal = await this.register.getAccountBalance("1320", organizationGuid, date);
    return {
      account: "1320 Готовая продукция",
      debitBalance: bal.debitBalance,
      creditBalance: bal.creditBalance,
      stockBalance: bal.netBalance,
    };
  }

  async getPayrollTaxesSummary(organizationGuid: string, dateFrom: string, dateTo: string): Promise<{
    opv: unknown[];
    so: unknown[];
    vosms: unknown[];
    ipn: unknown[];
    period: { dateFrom: string; dateTo: string };
  }> {
    const [opv, so, vosms, ipn] = await Promise.all([
      this.client.getCollection("AccumulationRegister_ОПВРасчетыСФондами_Balance", {
        filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
        top: 500,
      }),
      this.client.getCollection("AccumulationRegister_СОРасчетыСФондами_Balance", {
        filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
        top: 500,
      }),
      this.client.getCollection("AccumulationRegister_ВОСМСРасчетыСФондами_Balance", {
        filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
        top: 500,
      }).catch(() => []),
      this.client.getCollection("AccumulationRegister_ИПНРасчетыСБюджетом_Balance", {
        filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
        top: 500,
      }).catch(() => []),
    ]);

    return { opv, so, vosms, ipn, period: { dateFrom, dateTo } };
  }

  async getVatRegister(organizationGuid: string, dateFrom: string, dateTo: string): Promise<unknown[]> {
    return this.client.getCollection("AccumulationRegister_НДС_Balance", {
      filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
      top: 500,
    });
  }

  /** P&L summary: revenue (6010), COGS (7010), overhead (7210). Works for any industry. */
  async getPLSummary(organizationGuid: string, dateFrom: string, dateTo: string): Promise<{
    revenue: number;
    cogs: number;
    grossProfit: number;
    overhead: number;
    operatingProfit: number;
    revenueAccount: string;
    cogsAccount: string;
    overheadAccount: string;
  }> {
    const [rev, cogs, overhead] = await Promise.all([
      this.register.getAccountTurnovers("6010", dateFrom, dateTo, organizationGuid),
      this.register.getAccountTurnovers("7010", dateFrom, dateTo, organizationGuid),
      this.register.getAccountTurnovers("7210", dateFrom, dateTo, organizationGuid),
    ]);

    const revenue = rev.creditTurnover;
    const cogsAmt = cogs.debitTurnover;
    const overheadAmt = overhead.debitTurnover;
    const grossProfit = revenue - cogsAmt;
    const operatingProfit = grossProfit - overheadAmt;

    return {
      revenue,
      cogs: cogsAmt,
      grossProfit,
      overhead: overheadAmt,
      operatingProfit,
      revenueAccount: "6010 Доход от реализации",
      cogsAccount: "7010 Себестоимость реализованной продукции",
      overheadAccount: "7210 Административные расходы",
    };
  }

  calculatePayrollTaxes(grossSalary: number, hasDeductions = true): PayrollTaxResult {
    const opv = Math.round(grossSalary * 0.10);
    const oosms = Math.round(grossSalary * 0.02);

    const standardDeduction = hasDeductions ? STANDARD_DEDUCTION_MRP * MRP_2026 : 0;
    const taxableBase = Math.max(0, grossSalary - opv - oosms - standardDeduction);
    const ipn = Math.round(taxableBase * 0.10);
    const netSalary = grossSalary - opv - oosms - ipn;

    const oppv = Math.round(grossSalary * 0.05);
    const so = Math.round(grossSalary * 0.035);
    const vosms = Math.round(grossSalary * 0.03);
    // СН = 9.5% − СО (Article 486 НК РК)
    const sn = Math.max(0, Math.round(grossSalary * 0.095) - so);
    const totalEmployerCost = grossSalary + oppv + so + vosms + sn;

    return { grossSalary, opv, oosms, taxableBase, standardDeduction, ipn, netSalary, oppv, so, vosms, sn, totalEmployerCost };
  }

  /**
   * Estimate КПН (corporate income tax).
   * @param isAgro - Apply 70% agricultural reduction per Ст.285 НК РК (Art. 285). Default: false.
   */
  async getKPNEstimate(organizationGuid: string, dateFrom: string, dateTo: string, isAgro = false): Promise<KPNEstimate> {
    const [rev, cogs, overhead, taxExpense] = await Promise.all([
      this.register.getAccountTurnovers("6010", dateFrom, dateTo, organizationGuid),
      this.register.getAccountTurnovers("7010", dateFrom, dateTo, organizationGuid),
      this.register.getAccountTurnovers("7210", dateFrom, dateTo, organizationGuid),
      this.register.getAccountTurnovers("7710", dateFrom, dateTo, organizationGuid),
    ]);

    const revenue = rev.creditTurnover;
    const totalExpenses = cogs.debitTurnover + overhead.debitTurnover + taxExpense.debitTurnover;
    const taxableProfit = Math.max(0, revenue - totalExpenses);
    const kpnBase = taxableProfit;
    const kpnRate = 0.20;
    // Agro reduction: 70% (Article 285 НК РК) — only for agricultural producers
    const agroReduction = isAgro ? Math.round(kpnBase * kpnRate * 0.70) : 0;
    const kpnPayable = Math.max(0, Math.round(kpnBase * kpnRate) - agroReduction);

    return { revenue, totalExpenses, taxableProfit, kpnBase, kpnRate, agroReduction, kpnPayable, isAgro };
  }
}
