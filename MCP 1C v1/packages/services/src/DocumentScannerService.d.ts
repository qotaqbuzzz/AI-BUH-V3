import type { OneCClient } from "@aibos/onec-client";
export type ScanSeverity = "info" | "warn" | "error" | "critical";
export interface ScanFinding {
    checkId: string;
    checkName: string;
    severity: ScanSeverity;
    documentType?: string;
    documentGuid?: string;
    documentNumber?: string;
    documentDate?: string;
    description: string;
    suggestedFix: string;
}
export interface ScanOptions {
    /** Subset of DOCUMENT_TYPES to scan. Default: all 13. */
    docTypes?: string[];
    /** OData page size for document queries. Default: 200. */
    batchSize?: number;
    /** Delay in ms between OData pages (rate-limit). Default: 100. */
    delayMs?: number;
    /** Max findings per check ID (prevents flood). Default: 100. */
    maxFindingsPerCheck?: number;
    /** Scan only the first N documents per type (for quick test runs). */
    limitDocsPerType?: number;
    /** Whether to scan accounting register postings. Default: true. */
    includePostings?: boolean;
}
export interface ScanReport {
    ranAt: string;
    dateFrom: string;
    dateTo: string;
    organizationGuid?: string;
    options: ScanOptions;
    summary: {
        documentsScanned: number;
        postingsScanned: number;
        critical: number;
        error: number;
        warn: number;
        info: number;
        total: number;
        truncated: boolean;
        fullFindingCount: number;
    };
    findings: ScanFinding[];
    scanErrors: {
        phase: string;
        error: string;
    }[];
}
export declare class DocumentScannerService {
    private readonly client;
    constructor(client: OneCClient);
    private paginate;
    scanDocuments(organizationGuid: string, dateFrom: string, dateTo: string, options?: ScanOptions): Promise<ScanReport>;
    scanPostings(organizationGuid: string, dateFrom: string, dateTo: string, options?: ScanOptions): Promise<ScanReport>;
    runFullScan(organizationGuid: string, dateFrom: string, dateTo: string, options?: ScanOptions): Promise<ScanReport>;
}
//# sourceMappingURL=DocumentScannerService.d.ts.map