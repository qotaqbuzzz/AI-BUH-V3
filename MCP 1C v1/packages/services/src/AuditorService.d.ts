import type { OneCClient } from "@aibos/onec-client";
import type { DocumentService } from "./DocumentService.js";
import type { RegisterService } from "./RegisterService.js";
import type { ReportsService } from "./ReportsService.js";
export type AuditStatus = "ok" | "warn" | "error";
export interface AuditCheck {
    block: number;
    blockName: string;
    status: AuditStatus;
    message: string;
    value?: number | string;
}
export interface PeriodAuditResult {
    organizationName: string;
    year: number;
    month: number;
    periodLabel: string;
    checks: AuditCheck[];
    summary: {
        ok: number;
        warn: number;
        error: number;
    };
}
export interface JournalEntry {
    Период?: string;
    Регистратор?: string;
    НомерСтроки?: number;
    СчетДт_Key?: string;
    СчетКт_Key?: string;
    Сумма?: number;
    КоличествоДт?: number;
    КоличествоКт?: number;
}
export declare class AuditorService {
    private readonly client;
    private readonly docs;
    constructor(client: OneCClient, docs: DocumentService);
    getDocumentJournalEntries(documentGuid: string): Promise<JournalEntry[]>;
    getESFStatus(organizationGuid: string, dateFrom: string, dateTo: string): Promise<unknown[]>;
    getUnpostedDocuments(documentType: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<unknown[]>;
    auditPeriodQuality(organizationGuid: string, year: number, month: number, register: RegisterService, reports: ReportsService): Promise<PeriodAuditResult>;
    getMonthCloseStatus(organizationGuid: string, year: number, month: number): Promise<{
        found: boolean;
        posted: boolean;
        date: string | null;
        guid: string | null;
    }>;
}
//# sourceMappingURL=AuditorService.d.ts.map