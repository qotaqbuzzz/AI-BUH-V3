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
export declare class AnalyticsService {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    getMonthlyTrend(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<{
        months: {
            month: string;
            revenue: number;
            cogs: number;
            overhead: number;
            grossProfit: number;
            operatingProfit: number;
        }[];
        totals: {
            revenue: number;
            cogs: number;
            overhead: number;
            grossProfit: number;
            operatingProfit: number;
        };
    }>;
    getFinancialSummary(organizationGuid: string, date?: string): Promise<FinancialSummary>;
}
//# sourceMappingURL=AnalyticsService.d.ts.map