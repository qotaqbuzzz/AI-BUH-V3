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

// ── Types ─────────────────────────────────────────────────────────

export type AnomalyType =
  | "manual_entry"
  | "round_amount"
  | "night_entry"
  | "statistical_outlier"
  | "unposted_doc"
  | "storno"
  | "duplicate_amount"
  | "missing_vat"
  | "balance_mismatch";

export type Severity = "info" | "warn" | "error";

export interface Anomaly {
  docGuid:      string;
  docType:      string;
  docNumber:    string;
  docDate:      string;
  amount:       number;
  entryHour?:   number;
  accountCode?: string;
  anomalyType:  AnomalyType;
  severity:     Severity;
  confidence:   number;   // 0–100
  zScore?:      number;
  description:  string;
}

export interface BaselineStats {
  docType:     string;
  accountCode: string | null;
  month:       number;
  sampleCount: number;
  mean:        number;
  stdDev:      number;
  p95:         number;
  p99:         number;
}

export interface ScanResult {
  orgGuid:    string;
  dateFrom:   string;
  dateTo:     string;
  scannedAt:  string;
  durationMs: number;
  anomalies:  Anomaly[];
  summary: {
    total:   number;
    error:   number;
    warn:    number;
    info:    number;
    byType:  Record<AnomalyType, number>;
  };
}

// ── Constants ─────────────────────────────────────────────────────

const Z_WARN  = 2.5;   // flag as warn
const Z_ERROR = 3.5;   // flag as error
const ROUND_THRESHOLD = 1_000_000;   // amounts divisible by this
const NIGHT_START = 22;              // 22:00
const NIGHT_END   = 6;              // 06:00
const DUP_WINDOW_HOURS = 24;

// ── Service ───────────────────────────────────────────────────────

export class AnomalyMLService {
  constructor(private readonly client: OneCClient) {}

  // ── Public: full scan ─────────────────────────────────────────

  async scan(
    orgGuid:  string,
    dateFrom: string,
    dateTo:   string,
    baselines?: BaselineStats[],
  ): Promise<ScanResult> {
    const t0 = Date.now();
    const anomalies: Anomaly[] = [];

    const [manualEntries, sales, purchases, payments] = await Promise.all([
      this.fetchManualEntries(orgGuid, dateFrom, dateTo),
      this.fetchDocuments("Document_РеализацияТоваровУслуг", orgGuid, dateFrom, dateTo),
      this.fetchDocuments("Document_ПоступлениеТоваровУслуг", orgGuid, dateFrom, dateTo),
      this.fetchDocuments("Document_ПлатежноеПоручениеИсходящее", orgGuid, dateFrom, dateTo),
    ]);

    const allDocs = [...sales, ...purchases, ...payments];

    // 1. Manual entries — always suspicious
    anomalies.push(...this.detectManualEntries(manualEntries));

    // 2. Round amounts across all docs
    anomalies.push(...this.detectRoundAmounts(allDocs));

    // 3. Night-time entries
    anomalies.push(...this.detectNightEntries([...manualEntries, ...allDocs]));

    // 4. Statistical outliers vs baseline
    if (baselines?.length) {
      anomalies.push(...this.detectOutliers(allDocs, baselines));
    }

    // 5. Duplicate amounts (same contractor + amount within 24h)
    anomalies.push(...this.detectDuplicates(allDocs));

    // 6. Storno / negative entries
    anomalies.push(...this.detectStorno(allDocs));

    // 7. Unposted docs
    const unposted = allDocs.filter(d => !d.Posted);
    anomalies.push(...this.detectUnposted(unposted));

    // Deduplicate by docGuid + anomalyType
    const seen = new Set<string>();
    const unique = anomalies.filter(a => {
      const key = `${a.docGuid}::${a.anomalyType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort: error first, then by confidence desc
    unique.sort((a, b) => {
      const sv = { error: 0, warn: 1, info: 2 };
      return (sv[a.severity] - sv[b.severity]) || (b.confidence - a.confidence);
    });

    return {
      orgGuid, dateFrom, dateTo,
      scannedAt:  new Date().toISOString(),
      durationMs: Date.now() - t0,
      anomalies:  unique,
      summary:    this.buildSummary(unique),
    };
  }

  // ── Detection logic ───────────────────────────────────────────

  private detectManualEntries(docs: OneCDoc[]): Anomaly[] {
    return docs.map(d => ({
      docGuid:     d.Ref_Key,
      docType:     "ОперацияБух",
      docNumber:   d.Number ?? "",
      docDate:     d.Date?.slice(0, 10) ?? "",
      amount:      d.СуммаДокумента ?? 0,
      anomalyType: "manual_entry" as AnomalyType,
      severity:    "warn" as Severity,
      confidence:  75,
      description: `Ручная операция ${d.Number} на сумму ${fmtAmt(d.СуммаДокумента)}, комментарий: "${d.Комментарий ?? "—"}"`,
    }));
  }

  private detectRoundAmounts(docs: OneCDoc[]): Anomaly[] {
    return docs
      .filter(d => (d.СуммаДокумента ?? 0) >= ROUND_THRESHOLD
                && (d.СуммаДокумента ?? 0) % ROUND_THRESHOLD === 0)
      .map(d => {
        const millions = (d.СуммаДокумента ?? 0) / 1_000_000;
        const confidence = Math.min(95, 50 + millions * 2);
        return {
          docGuid:     d.Ref_Key,
          docType:     d["@odata.type"]?.replace("#", "") ?? "Документ",
          docNumber:   d.Number ?? "",
          docDate:     d.Date?.slice(0, 10) ?? "",
          amount:      d.СуммаДокумента ?? 0,
          anomalyType: "round_amount" as AnomalyType,
          severity:    millions >= 50 ? "error" as Severity : "warn" as Severity,
          confidence:  Math.round(confidence),
          description: `Круглая сумма: ${millions} млн тг — возможное искажение`,
        };
      });
  }

  private detectNightEntries(docs: OneCDoc[]): Anomaly[] {
    return docs
      .filter(d => {
        if (!d.Date) return false;
        const h = new Date(d.Date).getUTCHours();
        return h >= NIGHT_START || h < NIGHT_END;
      })
      .map(d => {
        const h = new Date(d.Date!).getUTCHours();
        return {
          docGuid:     d.Ref_Key,
          docType:     d["@odata.type"]?.replace("#", "") ?? "Документ",
          docNumber:   d.Number ?? "",
          docDate:     d.Date?.slice(0, 10) ?? "",
          amount:      d.СуммаДокумента ?? 0,
          entryHour:   h,
          anomalyType: "night_entry" as AnomalyType,
          severity:    "warn" as Severity,
          confidence:  80,
          description: `Проводка в ${h}:00 (нерабочее время) — ${d.Number}`,
        };
      });
  }

  private detectOutliers(docs: OneCDoc[], baselines: BaselineStats[]): Anomaly[] {
    const result: Anomaly[] = [];
    const baselineMap = new Map(
      baselines.map(b => [`${b.docType}::${b.month}`, b]),
    );

    for (const doc of docs) {
      const month = doc.Date ? new Date(doc.Date).getMonth() + 1 : null;
      if (!month) continue;
      const key = `${doc["@odata.type"]?.replace("#", "")}::${month}`;
      const bl = baselineMap.get(key);
      if (!bl || bl.stdDev === 0 || bl.sampleCount < 10) continue;

      const amount = doc.СуммаДокумента ?? 0;
      const z = (amount - bl.mean) / bl.stdDev;
      if (Math.abs(z) < Z_WARN) continue;

      const severity: Severity = Math.abs(z) >= Z_ERROR ? "error" : "warn";
      const confidence = Math.min(99, Math.round((Math.abs(z) / 5) * 100));

      result.push({
        docGuid:     doc.Ref_Key,
        docType:     bl.docType,
        docNumber:   doc.Number ?? "",
        docDate:     doc.Date?.slice(0, 10) ?? "",
        amount,
        anomalyType: "statistical_outlier",
        severity,
        confidence,
        zScore:      Math.round(z * 100) / 100,
        description: `Сумма ${fmtAmt(amount)} отклоняется на ${Math.abs(z).toFixed(1)}σ от среднего (${fmtAmt(bl.mean)} ± ${fmtAmt(bl.stdDev)})`,
      });
    }
    return result;
  }

  private detectDuplicates(docs: OneCDoc[]): Anomaly[] {
    const result: Anomaly[] = [];
    const sorted = [...docs].sort((a, b) => (a.Date ?? "").localeCompare(b.Date ?? ""));

    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];
        const diffHours = (new Date(b.Date!).getTime() - new Date(a.Date!).getTime()) / 3_600_000;
        if (diffHours > DUP_WINDOW_HOURS) break;
        if (a.СуммаДокумента === b.СуммаДокумента
            && a.Контрагент_Key === b.Контрагент_Key
            && a.Ref_Key !== b.Ref_Key) {
          result.push({
            docGuid:     b.Ref_Key,
            docType:     b["@odata.type"]?.replace("#", "") ?? "Документ",
            docNumber:   b.Number ?? "",
            docDate:     b.Date?.slice(0, 10) ?? "",
            amount:      b.СуммаДокумента ?? 0,
            anomalyType: "duplicate_amount",
            severity:    "error",
            confidence:  90,
            description: `Дубль: ${b.Number} совпадает с ${a.Number} — один контрагент, та же сумма, ${diffHours.toFixed(0)}ч разницы`,
          });
        }
      }
    }
    return result;
  }

  private detectStorno(docs: OneCDoc[]): Anomaly[] {
    return docs
      .filter(d => (d.СуммаДокумента ?? 0) < 0)
      .map(d => ({
        docGuid:     d.Ref_Key,
        docType:     d["@odata.type"]?.replace("#", "") ?? "Документ",
        docNumber:   d.Number ?? "",
        docDate:     d.Date?.slice(0, 10) ?? "",
        amount:      d.СуммаДокумента ?? 0,
        anomalyType: "storno" as AnomalyType,
        severity:    "warn" as Severity,
        confidence:  85,
        description: `Отрицательная сумма ${fmtAmt(d.СуммаДокумента)} — сторно или ошибка`,
      }));
  }

  private detectUnposted(docs: OneCDoc[]): Anomaly[] {
    return docs.map(d => ({
      docGuid:     d.Ref_Key,
      docType:     d["@odata.type"]?.replace("#", "") ?? "Документ",
      docNumber:   d.Number ?? "",
      docDate:     d.Date?.slice(0, 10) ?? "",
      amount:      d.СуммаДокумента ?? 0,
      anomalyType: "unposted_doc" as AnomalyType,
      severity:    "warn" as Severity,
      confidence:  70,
      description: `Непроведённый документ ${d.Number} — не создал проводок`,
    }));
  }

  // ── Baseline builder (call monthly via cron) ──────────────────

  async buildBaselines(
    orgGuid:  string,
    dateFrom: string, // pull 12+ months of history
    dateTo:   string,
  ): Promise<BaselineStats[]> {
    const [sales, purchases, payments] = await Promise.all([
      this.fetchDocuments("Document_РеализацияТоваровУслуг", orgGuid, dateFrom, dateTo),
      this.fetchDocuments("Document_ПоступлениеТоваровУслуг", orgGuid, dateFrom, dateTo),
      this.fetchDocuments("Document_ПлатежноеПоручениеИсходящее", orgGuid, dateFrom, dateTo),
    ]);

    const groups = new Map<string, number[]>();

    const addDoc = (doc: OneCDoc, type: string) => {
      if (!doc.Date || !doc.СуммаДокумента) return;
      const month = new Date(doc.Date).getMonth() + 1;
      const key   = `${type}::${month}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(doc.СуммаДокумента);
    };

    sales.forEach(d => addDoc(d, "Document_РеализацияТоваровУслуг"));
    purchases.forEach(d => addDoc(d, "Document_ПоступлениеТоваровУслуг"));
    payments.forEach(d => addDoc(d, "Document_ПлатежноеПоручениеИсходящее"));

    const result: BaselineStats[] = [];
    for (const [key, amounts] of groups) {
      const [docType, monthStr] = key.split("::");
      if (amounts.length < 3) continue;
      const sorted = [...amounts].sort((a, b) => a - b);
      const mean   = amounts.reduce((s, v) => s + v, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);
      result.push({
        docType,
        accountCode: null,
        month:       Number(monthStr),
        sampleCount: amounts.length,
        mean:        Math.round(mean),
        stdDev:      Math.round(stdDev),
        p95:         sorted[Math.floor(sorted.length * 0.95)] ?? sorted.at(-1)!,
        p99:         sorted[Math.floor(sorted.length * 0.99)] ?? sorted.at(-1)!,
      });
    }
    return result;
  }

  // ── Data fetchers ─────────────────────────────────────────────

  private async fetchManualEntries(
    orgGuid: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<OneCDoc[]> {
    return this.client.getCollection<OneCDoc>("Document_ОперацияБух", {
      filter: [
        `DeletionMark eq false`,
        `Date ge datetime'${dateFrom}T00:00:00'`,
        `Date le datetime'${dateTo}T23:59:59'`,
        `Организация_Key eq guid'${orgGuid}'`,
      ].join(" and "),
      select: "Ref_Key,Date,Number,СуммаДокумента,Комментарий,Posted",
      top: 500,
    }).catch(() => []);
  }

  private async fetchDocuments(
    entitySet: string,
    orgGuid: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<OneCDoc[]> {
    return this.client.getCollection<OneCDoc>(entitySet, {
      filter: [
        `DeletionMark eq false`,
        `Date ge datetime'${dateFrom}T00:00:00'`,
        `Date le datetime'${dateTo}T23:59:59'`,
        `Организация_Key eq guid'${orgGuid}'`,
      ].join(" and "),
      select: "Ref_Key,Date,Number,СуммаДокумента,Контрагент_Key,Posted",
      top: 2000,
    }).catch(() => []);
  }

  // ── Helpers ───────────────────────────────────────────────────

  private buildSummary(anomalies: Anomaly[]) {
    const byType = {} as Record<AnomalyType, number>;
    let error = 0, warn = 0, info = 0;
    for (const a of anomalies) {
      byType[a.anomalyType] = (byType[a.anomalyType] ?? 0) + 1;
      if (a.severity === "error") error++;
      else if (a.severity === "warn") warn++;
      else info++;
    }
    return { total: anomalies.length, error, warn, info, byType };
  }
}

// ── Minimal 1C document shape ─────────────────────────────────────

interface OneCDoc {
  "Ref_Key": string;
  "Date"?: string;
  "Number"?: string;
  "СуммаДокумента"?: number;
  "Контрагент_Key"?: string;
  "Организация_Key"?: string;
  "Posted"?: boolean;
  "Комментарий"?: string;
  "@odata.type"?: string;
}

function fmtAmt(v?: number | null): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + " млн ₸";
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + "K ₸";
  return v.toFixed(0) + " ₸";
}
