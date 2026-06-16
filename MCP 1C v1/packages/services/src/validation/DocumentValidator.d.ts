import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { type ValidationReport } from "./types.js";
export declare class DocumentValidator {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    validateLineTotals(documentType: "РеализацияТоваровУслуг" | "ПоступлениеТоваровУслуг", dateFrom: string, dateTo: string, organizationGuid?: string, sampleLimit?: number): Promise<ValidationReport>;
    validateNomenclatureAccounts(date: string, organizationGuid?: string): Promise<ValidationReport>;
    validateAdvanceAging(date: string, organizationGuid?: string, agingDays?: number): Promise<ValidationReport>;
}
//# sourceMappingURL=DocumentValidator.d.ts.map