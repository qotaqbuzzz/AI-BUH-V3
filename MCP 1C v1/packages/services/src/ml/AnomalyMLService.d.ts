/**
 * AnomalyMLService — statistical anomaly detection on top of raw 1C data.
 *
 * Extends the basic AuditorService checks with:
 *  - Z-score outlier detection vs historical baselines
 *  - Confidence scoring (0–100)
 *  - Duplicate detection
 *  - Night-entry pattern analysis
 *  - PostgreSQL persistence (optional — works in-memory without a DB)
 */
import { OneCClient } from "@aibos/onec-client";
export type AnomalyType = "manual_entry" | "round_amount" | "night_entry" | "statistical_outlier" | "unposted_doc" | "storno" | "duplicate_amount" | "missing_vat" | "balance_mismatch";
export type Severity = "info" | "warn" | "error";
export interface Anomaly {
    docGuid: string;
    docType: string;
    docNumber: string;
    docDate: string;
    amount: number;
    entryHour?: number;
    accountCode?: string;
    anomalyType: AnomalyType;
    severity: Severity;
    confidence: number;
    zScore?: number;
    description: string;
}
export interface BaselineStats {
    docType: string;
    accountCode: string | null;
    month: number;
    sampleCount: number;
    mean: number;
    stdDev: number;
    p95: number;
    p99: number;
}
export interface ScanResult {
    orgGuid: string;
    dateFrom: string;
    dateTo: string;
    scannedAt: string;
    durationMs: number;
    anomalies: Anomaly[];
    summary: {
        total: number;
        error: number;
        warn: number;
        info: number;
        byType: Record<AnomalyType, number>;
    };
}
export declare class AnomalyMLService {
    private readonly client;
    constructor(client: OneCClient);
    scan(orgGuid: string, dateFrom: string, dateTo: string, baselines?: BaselineStats[]): Promise<ScanResult>;
    private detectManualEntries;
    private detectRoundAmounts;
    private detectNightEntries;
    private detectOutliers;
    private detectDuplicates;
    private detectStorno;
    private detectUnposted;
    buildBaselines(orgGuid: string, dateFrom: string, // pull 12+ months of history
    dateTo: string): Promise<BaselineStats[]>;
    private fetchManualEntries;
    private fetchDocuments;
    private buildSummary;
}
//# sourceMappingURL=AnomalyMLService.d.ts.map