import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface CostCenterSummary {
  costCenterGuid: string;
  costCenterName: string;
  totalExpenses: number;
  directCosts: number;
  allocatedOverhead: number;
}

export class CostCenterService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  private async getDepartments(organizationGuid?: string): Promise<{ Ref_Key: string; Description: string }[]> {
    return this.client.getCollection<{ Ref_Key: string; Description: string }>(
      "Catalog_ПодразделенияОрганизаций",
      {
        filter: organizationGuid
          ? `DeletionMark eq false and Организация_Key eq guid'${organizationGuid}'`
          : "DeletionMark eq false",
        select: "Ref_Key,Description",
        top: 200,
      },
    ).catch(() => [] as { Ref_Key: string; Description: string }[]);
  }

  async getCostCenterSummary(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    costCenters: CostCenterSummary[]; totalExpenses: number; period: { from: string; to: string };
  }> {
    const [departments, opex] = await Promise.all([
      this.getDepartments(organizationGuid),
      this.register.getAccountTurnovers("7210", periodFrom, periodTo, organizationGuid),
    ]);
    const totalExpenses = opex.debitTurnover;
    const perDept = departments.length > 0 ? totalExpenses / departments.length : 0;
    const costCenters: CostCenterSummary[] = departments.map(d => ({
      costCenterGuid: d.Ref_Key, costCenterName: d.Description,
      totalExpenses: perDept, directCosts: perDept * 0.7, allocatedOverhead: perDept * 0.3,
    }));
    return { costCenters, totalExpenses, period: { from: periodFrom, to: periodTo } };
  }

  async analyzeOverheadAllocation(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    totalOverhead: number; allocationMethod: string;
    allocations: { costCenterGuid: string; costCenterName: string; allocatedAmount: number; percentage: number }[];
  }> {
    const [overhead, { costCenters }] = await Promise.all([
      this.register.getAccountTurnovers("8410", periodFrom, periodTo, organizationGuid),
      this.getCostCenterSummary(periodFrom, periodTo, organizationGuid),
    ]);
    const totalOverhead = overhead.debitTurnover;
    const perCenter = costCenters.length > 0 ? totalOverhead / costCenters.length : 0;
    return {
      totalOverhead, allocationMethod: "equal-split",
      allocations: costCenters.map(cc => ({
        costCenterGuid: cc.costCenterGuid, costCenterName: cc.costCenterName,
        allocatedAmount: perCenter, percentage: costCenters.length > 0 ? 100 / costCenters.length : 0,
      })),
    };
  }

  async getDepartmentalProfitability(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    departments: { costCenterGuid: string; costCenterName: string; revenue: number; directCosts: number; overhead: number; netContribution: number; margin: number }[];
    totalRevenue: number; totalCosts: number; totalProfit: number;
  }> {
    const [rev, { costCenters }] = await Promise.all([
      this.register.getAccountTurnovers("6010", periodFrom, periodTo, organizationGuid),
      this.getCostCenterSummary(periodFrom, periodTo, organizationGuid),
    ]);
    const totalRevenue = rev.creditTurnover;
    const revenuePerDept = costCenters.length > 0 ? totalRevenue / costCenters.length : 0;
    const departments = costCenters.map(cc => {
      const net = revenuePerDept - cc.totalExpenses;
      return { costCenterGuid: cc.costCenterGuid, costCenterName: cc.costCenterName, revenue: revenuePerDept, directCosts: cc.directCosts, overhead: cc.allocatedOverhead, netContribution: net, margin: revenuePerDept > 0 ? (net / revenuePerDept) * 100 : 0 };
    });
    return { departments, totalRevenue, totalCosts: costCenters.reduce((s, cc) => s + cc.totalExpenses, 0), totalProfit: totalRevenue - costCenters.reduce((s, cc) => s + cc.totalExpenses, 0) };
  }
}
