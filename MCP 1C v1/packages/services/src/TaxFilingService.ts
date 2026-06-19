import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface FundRemittanceStatus {
  fundType: string;
  accrued: number;
  paid: number;
  outstanding: number;
  dueDate: string;
  isOverdue: boolean;
}

export interface KzTaxDeadline {
  type: string;
  description: string;
  dueDate: string;
  isOverdue: boolean;
}

const KZ_TAX_DEADLINES = [
  { type: "ФНО 100.00", description: "КПН декларация (годовая)", month: 3, day: 31 },
  { type: "ФНО 300.00", description: "НДС декларация (квартальная)", month: 2, day: 15 },
  { type: "ФНО 200.00", description: "ИПН/СН (ежеквартально)", month: 2, day: 15 },
  { type: "ОПВ/ОППВ", description: "Пенсионные взносы (ежемесячно)", month: 2, day: 25 },
  { type: "СО", description: "Социальные отчисления (ежемесячно)", month: 2, day: 25 },
  { type: "ВОСМС/ООСМС", description: "Медстрахование (ежемесячно)", month: 2, day: 25 },
];

export class TaxFilingService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getIpnSummary(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    period: string;
    totalAccrued: number;
    totalPaid: number;
    outstanding: number;
    glBalance3110: number;
    employeeCount: number;
  }> {
    const filters: string[] = [];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const [accruals, glBal] = await Promise.all([
      this.client.getRegisterBalance<{ НалогПлательщик_Key?: string; СуммаBalance?: number }>(
        "AccumulationRegister_ИПНРасчетыСБюджетом",
        { filter: filters.join(" and ") || undefined, select: "НалогПлательщик_Key,СуммаBalance" },
      ).catch(() => [] as { НалогПлательщик_Key?: string; СуммаBalance?: number }[]),
      this.register.getAccountBalance("3110", organizationGuid),
    ]);
    const totalAccrued = accruals.reduce((s, r) => s + Math.max(0, r.СуммаBalance ?? 0), 0);
    const totalPaid = accruals.reduce((s, r) => s + Math.max(0, -(r.СуммаBalance ?? 0)), 0);
    return {
      period: `${periodFrom}/${periodTo}`, totalAccrued, totalPaid, outstanding: totalAccrued - totalPaid,
      glBalance3110: glBal.creditBalance,
      employeeCount: new Set(accruals.map(r => r.НалогПлательщик_Key).filter(Boolean)).size,
    };
  }

  async getFundRemittanceStatus(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<FundRemittanceStatus[]> {
    const [opvBal, soBal] = await Promise.all([
      this.register.getAccountTurnovers("3150", periodFrom, periodTo, organizationGuid).catch(() => ({ debitTurnover: 0, creditTurnover: 0, netTurnover: 0, accountCode: "3150", accountGuid: "" })),
      this.register.getAccountTurnovers("3210", periodFrom, periodTo, organizationGuid).catch(() => ({ debitTurnover: 0, creditTurnover: 0, netTurnover: 0, accountCode: "3210", accountGuid: "" })),
    ]);
    const now = new Date();
    const dueDate = new Date(periodTo);
    dueDate.setMonth(dueDate.getMonth() + 1);
    dueDate.setDate(25);
    const dueDateStr = dueDate.toISOString().slice(0, 10);
    return [
      { fundType: "ОПВ", accrued: opvBal.creditTurnover, paid: opvBal.debitTurnover, outstanding: opvBal.creditTurnover - opvBal.debitTurnover, dueDate: dueDateStr, isOverdue: now > dueDate && opvBal.creditTurnover > opvBal.debitTurnover },
      { fundType: "СО", accrued: soBal.creditTurnover, paid: soBal.debitTurnover, outstanding: soBal.creditTurnover - soBal.debitTurnover, dueDate: dueDateStr, isOverdue: now > dueDate && soBal.creditTurnover > soBal.debitTurnover },
    ];
  }

  async getTaxFilingChecklist(year: number): Promise<KzTaxDeadline[]> {
    const now = new Date();
    return KZ_TAX_DEADLINES.map(d => {
      const dueDate = new Date(year, (d.month ?? 12) - 1, d.day);
      return { type: d.type, description: d.description, dueDate: dueDate.toISOString().slice(0, 10), isOverdue: now > dueDate };
    });
  }

  async validateFundRemittanceTimeliness(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    passed: boolean; overdueItems: FundRemittanceStatus[]; totalOverdue: number; estimatedPenalty: number;
  }> {
    const statuses = await this.getFundRemittanceStatus(periodFrom, periodTo, organizationGuid);
    const overdueItems = statuses.filter(s => s.isOverdue && s.outstanding > 0);
    const totalOverdue = overdueItems.reduce((s, i) => s + i.outstanding, 0);
    return { passed: overdueItems.length === 0, overdueItems, totalOverdue, estimatedPenalty: totalOverdue * 0.0025 };
  }
}
