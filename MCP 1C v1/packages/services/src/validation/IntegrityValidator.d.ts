import type { OneCClient } from "@aibos/onec-client";
import type { ReportsService } from "../ReportsService.js";
import type { RegisterService } from "../RegisterService.js";
import { type ValidationReport } from "./types.js";
export declare class IntegrityValidator {
    private readonly client;
    private readonly reports;
    private readonly register;
    constructor(client: OneCClient, reports: ReportsService, register: RegisterService);
    validateDoubleEntry(dateFrom: string, dateTo: string, organizationGuid?: string, perDocumentSampleLimit?: number): Promise<ValidationReport>;
    validateAccountSigns(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateBalanceArithmetic(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateExtDimensions(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
}
//# sourceMappingURL=IntegrityValidator.d.ts.map