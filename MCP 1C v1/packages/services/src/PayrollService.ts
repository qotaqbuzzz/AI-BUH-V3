import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface PayrollSummary {
  period: string;
  totalAccrual: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  glBalance3350: number;
}

export interface PayrollByEmployee {
  employeeGuid: string;
  employeeName: string;
  department: string;
  accrual: number;
  deductions: number;
  netPay: number;
}

export interface HrTransaction {
  documentGuid: string;
  documentDate: string;
  type: "hire" | "dismiss" | "transfer";
  employeeName: string;
  department: string;
}

export class PayrollService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  private periodFilter(from: string, to: string): string {
    return `Date ge datetime'${from}T00:00:00' and Date le datetime'${to}T23:59:59'`;
  }

  async getPayrollSummary(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<PayrollSummary> {
    const filters: string[] = ["DeletionMark eq false", "Posted eq true", this.periodFilter(periodFrom, periodTo)];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const docs = await this.client.getCollection<{ Ref_Key: string; СуммаДокумента?: number }>(
      "Document_НачислениеЗарплатыРаботникамОрганизаций",
      { filter: filters.join(" and "), select: "Ref_Key,СуммаДокумента", top: 500 },
    ).catch(() => [] as { Ref_Key: string; СуммаДокумента?: number }[]);
    const glBal = await this.register.getAccountBalance("3350", organizationGuid);
    const totalAccrual = docs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0);
    return { period: `${periodFrom}/${periodTo}`, totalAccrual, totalDeductions: 0, totalNetPay: totalAccrual, employeeCount: docs.length, glBalance3350: glBal.creditBalance };
  }

  async drillPayrollByEmployee(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<PayrollByEmployee[]> {
    const filters: string[] = ["DeletionMark eq false", "Posted eq true", this.periodFilter(periodFrom, periodTo)];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const rows = await this.client.getCollection<{
      Ref_Key: string;
      Сотрудник_Key?: string;
      Сотрудник?: { Description?: string };
      Подразделение_Key?: string;
      СуммаДокумента?: number;
    }>("Document_НачислениеЗарплатыРаботникамОрганизаций", {
      filter: filters.join(" and "),
      expand: "Сотрудник",
      select: "Ref_Key,Сотрудник_Key,Подразделение_Key,СуммаДокумента",
      top: 1000,
    }).catch(() => []);
    const empMap = new Map<string, { name: string; dept: string; amount: number }>();
    for (const r of rows) {
      const key = r.Сотрудник_Key ?? r.Ref_Key;
      const existing = empMap.get(key);
      const amt = r.СуммаДокумента ?? 0;
      if (existing) { existing.amount += amt; }
      else { empMap.set(key, { name: r.Сотрудник?.Description ?? key.slice(0, 8), dept: r.Подразделение_Key ?? "", amount: amt }); }
    }
    return [...empMap.entries()].map(([guid, v]) => ({ employeeGuid: guid, employeeName: v.name, department: v.dept, accrual: v.amount, deductions: 0, netPay: v.amount }));
  }

  async drillPayrollByDepartment(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{ departmentGuid: string; totalAccrual: number; employeeCount: number }[]> {
    const byEmp = await this.drillPayrollByEmployee(periodFrom, periodTo, organizationGuid);
    const deptMap = new Map<string, { total: number; count: number }>();
    for (const e of byEmp) {
      const ex = deptMap.get(e.department);
      if (ex) { ex.total += e.accrual; ex.count++; }
      else { deptMap.set(e.department, { total: e.accrual, count: 1 }); }
    }
    return [...deptMap.entries()].map(([dept, v]) => ({ departmentGuid: dept, totalAccrual: v.total, employeeCount: v.count }));
  }

  async getHrTransactions(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<HrTransaction[]> {
    const filters: string[] = ["DeletionMark eq false", "Posted eq true", this.periodFilter(periodFrom, periodTo)];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const [hires, dismissals] = await Promise.all([
      this.client.getCollection<{ Ref_Key: string; Date?: string; Сотрудник?: { Description?: string }; Подразделение_Key?: string }>(
        "Document_ПриемНаРаботуВОрганизацию",
        { filter: filters.join(" and "), expand: "Сотрудник", select: "Ref_Key,Date,Подразделение_Key", top: 500 },
      ).catch(() => []),
      this.client.getCollection<{ Ref_Key: string; Date?: string; Сотрудник?: { Description?: string }; Подразделение_Key?: string }>(
        "Document_УвольнениеИзОрганизаций",
        { filter: filters.join(" and "), expand: "Сотрудник", select: "Ref_Key,Date,Подразделение_Key", top: 500 },
      ).catch(() => []),
    ]);
    const result: HrTransaction[] = [
      ...hires.map(h => ({ documentGuid: h.Ref_Key, documentDate: h.Date?.slice(0, 10) ?? "", type: "hire" as const, employeeName: h.Сотрудник?.Description ?? "", department: h.Подразделение_Key ?? "" })),
      ...dismissals.map(d => ({ documentGuid: d.Ref_Key, documentDate: d.Date?.slice(0, 10) ?? "", type: "dismiss" as const, employeeName: d.Сотрудник?.Description ?? "", department: d.Подразделение_Key ?? "" })),
    ];
    return result.sort((a, b) => a.documentDate.localeCompare(b.documentDate));
  }

  async getBenefitAccruals(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    totalBenefits: number;
    glBalance3380: number;
    breakdown: { type: string; amount: number }[];
  }> {
    const glBal = await this.register.getAccountTurnovers("3380", periodFrom, periodTo, organizationGuid);
    return { totalBenefits: glBal.creditTurnover, glBalance3380: glBal.creditTurnover, breakdown: [{ type: "Социальные льготы", amount: glBal.creditTurnover }] };
  }

  async analyzePayrollVariance(currentFrom: string, currentTo: string, priorFrom: string, priorTo: string, organizationGuid?: string): Promise<{
    currentPeriod: number; priorPeriod: number; absoluteVariance: number; percentVariance: number; isAnomalous: boolean;
  }> {
    const [current, prior] = await Promise.all([
      this.getPayrollSummary(currentFrom, currentTo, organizationGuid),
      this.getPayrollSummary(priorFrom, priorTo, organizationGuid),
    ]);
    const absoluteVariance = current.totalAccrual - prior.totalAccrual;
    const percentVariance = prior.totalAccrual > 0 ? (absoluteVariance / prior.totalAccrual) * 100 : 0;
    return { currentPeriod: current.totalAccrual, priorPeriod: prior.totalAccrual, absoluteVariance, percentVariance, isAnomalous: Math.abs(percentVariance) > 20 };
  }

  async getHeadcountAnalysis(asOfDate: string, organizationGuid?: string): Promise<{
    totalHeadcount: number;
    byDepartment: { departmentGuid: string; count: number }[];
  }> {
    const filters: string[] = [];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const employees = await this.client.getSliceLast<{ Сотрудник_Key?: string; Подразделение_Key?: string; Состояние?: string }>(
      "InformationRegister_РаботникиОрганизаций",
      { Period: `${asOfDate}T23:59:59`, filter: filters.join(" and ") || undefined, select: "Сотрудник_Key,Подразделение_Key,Состояние" },
    ).catch(() => [] as { Сотрудник_Key?: string; Подразделение_Key?: string; Состояние?: string }[]);
    const active = employees.filter(e => e.Состояние !== "Уволен");
    const deptMap = new Map<string, number>();
    for (const e of active) { const d = e.Подразделение_Key ?? ""; deptMap.set(d, (deptMap.get(d) ?? 0) + 1); }
    return { totalHeadcount: active.length, byDepartment: [...deptMap.entries()].map(([departmentGuid, count]) => ({ departmentGuid, count })) };
  }

  async validateSalaryCompleteness(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    passed: boolean; headcount: number; employeesWithPayroll: number; missingEmployees: string[];
  }> {
    const [headcount, payroll] = await Promise.all([
      this.getHeadcountAnalysis(periodTo, organizationGuid),
      this.drillPayrollByEmployee(periodFrom, periodTo, organizationGuid),
    ]);
    const payrollGuids = new Set(payroll.map(p => p.employeeGuid));
    const missingCount = Math.max(0, headcount.totalHeadcount - payrollGuids.size);
    return {
      passed: missingCount === 0,
      headcount: headcount.totalHeadcount,
      employeesWithPayroll: payrollGuids.size,
      missingEmployees: missingCount > 0 ? [`${missingCount} сотрудников без начисления за период`] : [],
    };
  }
}
