import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import type { AuditorService } from "../AuditorService.js";
import { type ValidationReport } from "./types.js";
export declare class PeriodCloseValidator {
    private readonly client;
    private readonly register;
    private readonly auditor;
    constructor(client: OneCClient, register: RegisterService, auditor: AuditorService);
    validatePeriodCloseReadiness(year: number, month: number, organizationGuid: string): Promise<ValidationReport>;
    validateAccrualAlignment(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateDepreciationCompleteness(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
    validateWIPClosure(year: number, month: number, organizationGuid: string): Promise<ValidationReport>;
    validateCOGSBasis(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport>;
}
//# sourceMappingURL=PeriodCloseValidator.d.ts.map