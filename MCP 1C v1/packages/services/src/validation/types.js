export function emptyReport(ruleSet, period, organizationGuid) {
    return {
        ruleSet,
        period,
        organizationGuid,
        findings: [],
        summary: { info: 0, warn: 0, error: 0, critical: 0 },
        executionMs: 0,
    };
}
export function finalize(report, startedAtMs) {
    for (const f of report.findings)
        report.summary[f.severity]++;
    report.executionMs = Date.now() - startedAtMs;
    return report;
}
export function add(report, finding) {
    report.findings.push(finding);
}
//# sourceMappingURL=types.js.map