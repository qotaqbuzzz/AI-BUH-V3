export type Severity = "info" | "warn" | "error" | "critical";

export type Category =
  | "integrity"
  | "tax"
  | "period-close"
  | "document"
  | "reconciliation";

export interface ValidationFinding {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  category: Category;
  description: string;
  affected: {
    accountCode?: string;
    accountName?: string;
    documentGuid?: string;
    documentNumber?: string;
    documentDate?: string;
    documentType?: string;
    contractorGuid?: string;
    contractorName?: string;
    employeeGuid?: string;
    employeeName?: string;
    expected?: number;
    actual?: number;
    deviation?: number;
    deviationPct?: number;
    extras?: Record<string, string | number | boolean | null>;
  };
  suggestedFix: string;
  ruleSource: string;
}

export interface ValidationReport {
  ruleSet: string;
  period: { from: string; to: string };
  organizationGuid?: string;
  findings: ValidationFinding[];
  summary: Record<Severity, number>;
  executionMs: number;
}

export function emptyReport(ruleSet: string, period: { from: string; to: string }, organizationGuid?: string): ValidationReport {
  return {
    ruleSet,
    period,
    organizationGuid,
    findings: [],
    summary: { info: 0, warn: 0, error: 0, critical: 0 },
    executionMs: 0,
  };
}

export function finalize(report: ValidationReport, startedAtMs: number): ValidationReport {
  for (const f of report.findings) report.summary[f.severity]++;
  report.executionMs = Date.now() - startedAtMs;
  return report;
}

export function add(report: ValidationReport, finding: ValidationFinding): void {
  report.findings.push(finding);
}
