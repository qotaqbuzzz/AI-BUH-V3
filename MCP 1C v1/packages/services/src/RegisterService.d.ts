import type { OneCClient } from "@aibos/onec-client";
import type { ExchangeRate, InventoryBalance, ContractorSettlement } from "@aibos/onec-client";
export interface AccountCodeResult {
    accountCode: string;
    accountGuid: string;
    debitBalance: number;
    creditBalance: number;
    netBalance: number;
    quantity: number;
}
export interface AccountTurnoverResult {
    accountCode: string;
    accountGuid: string;
    debitTurnover: number;
    creditTurnover: number;
    netTurnover: number;
}
export declare class RegisterService {
    private readonly client;
    private accountCache;
    constructor(client: OneCClient);
    resolveAccountGuid(accountCode: string): Promise<string | null>;
    getAccountBalance(accountCode: string, organizationGuid?: string, _date?: string): Promise<AccountCodeResult>;
    getAccountTurnovers(accountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<AccountTurnoverResult>;
    getExchangeRates(currencyCode?: string, date?: string): Promise<ExchangeRate[]>;
    getContractorSettlements(contractorGuid?: string, organizationGuid?: string): Promise<ContractorSettlement[]>;
    getAccountBreakdown(accountCode: string, date: string, organizationGuid?: string): Promise<{
        dim1: string;
        dim1Name: string;
        dim2: string;
        dim2Name: string;
        qty: number;
        amountDr: number;
        amountCr: number;
    }[]>;
    getAccountCard(accountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<{
        accountCode: string;
        rows: {
            period: string;
            recorderKey: string;
            lineNum: number;
            amountDr: number;
            amountCr: number;
            corrAccountCode: string;
        }[];
        totals: {
            debitTurnover: number;
            creditTurnover: number;
        };
    }>;
    getInventoryBalance(organizationGuid?: string, nomenclatureGuid?: string, _date?: string): Promise<InventoryBalance[]>;
}
//# sourceMappingURL=RegisterService.d.ts.map