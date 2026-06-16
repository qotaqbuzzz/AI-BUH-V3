import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";
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
}
export declare class AgroProductionService {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    getProductionCosts(organizationGuid: string, date?: string): Promise<{
        account: string;
        debitBalance: number;
        creditBalance: number;
        wipBalance: number;
        description: string;
    }>;
    getMaterialsBalance(organizationGuid: string, date?: string, nomenclatureGuid?: string): Promise<{
        account: string;
        inventory: unknown[];
        totalCost: number;
    }>;
    getHarvestOutput(organizationGuid: string, date?: string): Promise<{
        account: string;
        debitBalance: number;
        creditBalance: number;
        stockBalance: number;
    }>;
    getPayrollTaxesSummary(organizationGuid: string, dateFrom: string, dateTo: string): Promise<{
        opv: unknown[];
        so: unknown[];
        vosms: unknown[];
        ipn: unknown[];
        period: {
            dateFrom: string;
            dateTo: string;
        };
    }>;
    getVatRegister(organizationGuid: string, dateFrom: string, dateTo: string): Promise<unknown[]>;
    getAgroPLSummary(organizationGuid: string, dateFrom: string, dateTo: string): Promise<{
        revenue: number;
        cogs: number;
        grossProfit: number;
        overhead: number;
        operatingProfit: number;
        revenueAccount: string;
        cogsAccount: string;
        overheadAccount: string;
    }>;
    calculatePayrollTaxes(grossSalary: number, hasDeductions?: boolean): PayrollTaxResult;
    getKPNEstimate(organizationGuid: string, dateFrom: string, dateTo: string): Promise<KPNEstimate>;
}
//# sourceMappingURL=AgroProductionService.d.ts.map