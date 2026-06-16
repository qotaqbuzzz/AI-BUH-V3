import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { type ValidationReport } from "./types.js";
export declare class ReconciliationValidator {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    validateInvoicePaymentMatching(date: string, organizationGuid?: string, agingDaysWarn?: number): Promise<ValidationReport>;
    validateContractTermsCompliance(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateBankBalanceConsistency(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
}
//# sourceMappingURL=ReconciliationValidator.d.ts.map