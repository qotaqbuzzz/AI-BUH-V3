import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { type ValidationReport } from "./types.js";
export declare class TaxValidator {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    validateVATCharged(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateVATRecoverable(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateESFCoverage(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validatePayrollTaxRates(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validatePayrollDeductions(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validatePayrollAccrualBalance(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
}
//# sourceMappingURL=TaxValidator.d.ts.map