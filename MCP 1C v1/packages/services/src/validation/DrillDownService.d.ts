import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { type ValidationReport } from "./types.js";
export declare class DrillDownService {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    drillAccountSignViolation(accountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string, limit?: number): Promise<ValidationReport>;
    drillPayrollTaxDeviation(taxAccountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    drillMissingESF(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    drillStaleAdvances(date: string, accountCode: string, organizationGuid?: string, agingDays?: number): Promise<ValidationReport>;
    drillVATDocuments(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    drillWIPSourceDocuments(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    drillUnpostedDocuments(documentType: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    drillUnpaidPayments(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
}
//# sourceMappingURL=DrillDownService.d.ts.map