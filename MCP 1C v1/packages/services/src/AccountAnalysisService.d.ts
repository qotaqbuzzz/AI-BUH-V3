import type { OneCClient } from "@aibos/onec-client";
export interface CorrAccountEntry {
    corrAccount: string;
    corrAccountName: string;
    turnoverDr: number;
    turnoverCr: number;
    shareDrPct: number;
    shareCrPct: number;
}
export interface SubcontoEntry {
    dim1: string;
    dim1Name: string;
    dim2: string;
    dim2Name: string;
    balanceDr: number;
    balanceCr: number;
    net: number;
}
export interface MonthEntry {
    month: string;
    turnoverDr: number;
    turnoverCr: number;
    closingBalance: number;
}
export interface AccountAnalysisResult {
    accountCode: string;
    accountName: string;
    period: {
        from: string;
        to: string;
    };
    summary: {
        openingBalance: number;
        debitTurnover: number;
        creditTurnover: number;
        closingBalance: number;
    };
    byCorrAccount: CorrAccountEntry[];
    bySubconto: SubcontoEntry[];
    monthlyTrend: MonthEntry[];
    meta: {
        recordsScanned: number;
        corrAccountTruncated: boolean;
    };
}
export declare class AccountAnalysisService {
    private readonly client;
    constructor(client: OneCClient);
    private resolveAccount;
    private resolveAccountCodes;
    private resolveDimNames;
    analyzeAccount(accountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<AccountAnalysisResult>;
}
//# sourceMappingURL=AccountAnalysisService.d.ts.map