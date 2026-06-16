import { DOCUMENT_TYPES } from "@aibos/onec-client";
// ─── Internal helpers ────────────────────────────────────────────────────────
const NULL_GUID = "00000000-0000-0000-0000-000000000000";
// Document types that must have a contractor field
const REQUIRES_CONTRACTOR = new Set([
    "РеализацияТоваровУслуг",
    "ПоступлениеТоваровУслуг",
    "ПлатежноеПоручениеИсходящее",
    "ПлатежноеПоручениеВходящее",
    "ПриходныйКассовыйОрдер",
    "РасходныйКассовыйОрдер",
]);
const SEVERITY_ORDER = { critical: 0, error: 1, warn: 2, info: 3 };
function sortBySeverity(a, b) {
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
}
function isoDate(d) {
    return d ? d.slice(0, 10) : "";
}
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
// ─── FindingCollector: per-check-ID capped accumulator ───────────────────────
class FindingCollector {
    maxPerCheck;
    findings = [];
    counts = new Map();
    constructor(maxPerCheck) {
        this.maxPerCheck = maxPerCheck;
    }
    add(f) {
        const n = (this.counts.get(f.checkId) ?? 0) + 1;
        this.counts.set(f.checkId, n);
        if (n <= this.maxPerCheck)
            this.findings.push(f);
    }
    get all() { return this.findings; }
    countFor(id) { return this.counts.get(id) ?? 0; }
    totalRaw() { return [...this.counts.values()].reduce((s, v) => s + v, 0); }
}
// ─── Main service ─────────────────────────────────────────────────────────────
export class DocumentScannerService {
    client;
    constructor(client) {
        this.client = client;
    }
    // Auto-paginating generator — yields batches until exhausted
    async *paginate(entitySet, params, batchSize, delayMs) {
        let skip = 0;
        while (true) {
            const batch = await this.client
                .getCollection(entitySet, { ...params, top: batchSize, skip })
                .catch(() => []);
            if (batch.length === 0)
                break;
            yield batch;
            if (batch.length < batchSize)
                break;
            skip += batchSize;
            if (delayMs > 0)
                await sleep(delayMs);
        }
    }
    // ── Document scan ──────────────────────────────────────────────────────────
    async scanDocuments(organizationGuid, dateFrom, dateTo, options = {}) {
        const batchSize = options.batchSize ?? 200;
        const delayMs = options.delayMs ?? 100;
        const maxPerCheck = options.maxFindingsPerCheck ?? 100;
        const limitPerType = options.limitDocsPerType;
        const targetTypes = options.docTypes ?? [...DOCUMENT_TYPES];
        const collector = new FindingCollector(maxPerCheck);
        const scanErrors = [];
        let documentsScanned = 0;
        const orgFilter = organizationGuid ? ` and Организация_Key eq guid'${organizationGuid}'` : "";
        const dateFilter = `Date ge datetime'${dateFrom}T00:00:00' and Date le datetime'${dateTo}T23:59:59'`;
        for (const docType of targetTypes) {
            let docsThisType = 0;
            try {
                const filter = `DeletionMark eq false and ${dateFilter}${orgFilter}`;
                const select = "Ref_Key,Number,Date,Posted,Контрагент_Key,СуммаДокумента";
                outer: for await (const batch of this.paginate(`Document_${docType}`, { filter, select }, batchSize, delayMs)) {
                    for (const doc of batch) {
                        documentsScanned++;
                        docsThisType++;
                        const num = doc.Number ?? "?";
                        const date = isoDate(doc.Date);
                        const guid = doc.Ref_Key;
                        // DOC-001: Unposted document
                        if (doc.Posted === false) {
                            collector.add({
                                checkId: "DOC-001",
                                checkName: "Непроведённый документ",
                                severity: "warn",
                                documentType: docType,
                                documentGuid: guid,
                                documentNumber: num,
                                documentDate: date,
                                description: `${docType} № ${num} (${date}) — не проведён (Posted = false)`,
                                suggestedFix: `Откройте документ в 1C и выберите «Провести». Если документ не нужен — пометьте на удаление.`,
                            });
                        }
                        // DOC-002: Missing contractor on documents that require it
                        if (REQUIRES_CONTRACTOR.has(docType)) {
                            const hasCont = doc.Контрагент_Key
                                && doc.Контрагент_Key !== NULL_GUID
                                && doc.Контрагент_Key !== "";
                            if (!hasCont) {
                                collector.add({
                                    checkId: "DOC-002",
                                    checkName: "Отсутствует контрагент",
                                    severity: "error",
                                    documentType: docType,
                                    documentGuid: guid,
                                    documentNumber: num,
                                    documentDate: date,
                                    description: `${docType} № ${num} (${date}) — не заполнен контрагент`,
                                    suggestedFix: `Откройте документ и заполните поле «Контрагент».`,
                                });
                            }
                        }
                        // DOC-003: Zero-amount document (suspicious for financial docs)
                        const amount = doc.СуммаДокумента ?? null;
                        if (amount !== null && amount === 0 && REQUIRES_CONTRACTOR.has(docType)) {
                            collector.add({
                                checkId: "DOC-003",
                                checkName: "Нулевая сумма документа",
                                severity: "info",
                                documentType: docType,
                                documentGuid: guid,
                                documentNumber: num,
                                documentDate: date,
                                description: `${docType} № ${num} (${date}) — сумма документа = 0`,
                                suggestedFix: `Проверьте строки документа — возможно не заполнены количество или цена.`,
                            });
                        }
                        if (limitPerType && docsThisType >= limitPerType)
                            break outer;
                    }
                }
            }
            catch (e) {
                scanErrors.push({
                    phase: `scanDocuments.${docType}`,
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        }
        return buildReport(organizationGuid, dateFrom, dateTo, options, collector, documentsScanned, 0, scanErrors);
    }
    // ── Posting scan ───────────────────────────────────────────────────────────
    async scanPostings(organizationGuid, dateFrom, dateTo, options = {}) {
        const batchSize = options.batchSize ?? 500;
        const delayMs = options.delayMs ?? 100;
        const maxPerCheck = options.maxFindingsPerCheck ?? 100;
        const collector = new FindingCollector(maxPerCheck);
        const scanErrors = [];
        let postingsScanned = 0;
        const orgFilter = organizationGuid ? ` and Организация_Key eq guid'${organizationGuid}'` : "";
        const periodFilter = `Период ge datetime'${dateFrom}T00:00:00' and Период le datetime'${dateTo}T23:59:59'`;
        const filter = `${periodFilter}${orgFilter}`;
        const select = "Регистратор,СчетДт_Key,СчетКт_Key,Сумма,Период";
        try {
            for await (const batch of this.paginate("AccountingRegister_Типовой_RecordType", { filter, select }, batchSize, delayMs)) {
                for (const row of batch) {
                    postingsScanned++;
                    const drKey = row.СчетДт_Key ?? "";
                    const crKey = row.СчетКт_Key ?? "";
                    const amount = row.Сумма ?? 0;
                    const period = isoDate(row.Период);
                    const recorder = row.Регистратор ?? "";
                    // POST-001: Circular posting — debit account = credit account
                    if (drKey && crKey && drKey === crKey && drKey !== NULL_GUID) {
                        collector.add({
                            checkId: "POST-001",
                            checkName: "Круговая проводка (Дт = Кт)",
                            severity: "critical",
                            documentGuid: recorder,
                            documentDate: period,
                            description: `Круговая проводка: один и тот же счёт на Дт и Кт (GUID …${drKey.slice(-8)}), сумма ${amount.toFixed(2)} ₸, дата ${period}`,
                            suggestedFix: `Найдите документ-регистратор по GUID и исправьте проводку — Дт и Кт не могут быть одним счётом.`,
                        });
                    }
                    // POST-002: Zero-amount posting
                    if (amount === 0) {
                        collector.add({
                            checkId: "POST-002",
                            checkName: "Нулевая проводка",
                            severity: "info",
                            documentGuid: recorder,
                            documentDate: period,
                            description: `Нулевая проводка за ${period} (документ …${recorder.slice(-8)})`,
                            suggestedFix: `Проверьте документ-регистратор — нулевые проводки чаще всего означают незаполненные строки.`,
                        });
                    }
                    // POST-003: Negative amount — red storno
                    if (amount < 0) {
                        collector.add({
                            checkId: "POST-003",
                            checkName: "Отрицательная сумма (красное сторно)",
                            severity: "warn",
                            documentGuid: recorder,
                            documentDate: period,
                            description: `Красное сторно: сумма ${amount.toFixed(2)} ₸ за ${period} (документ …${recorder.slice(-8)})`,
                            suggestedFix: `Красное сторно допустимо для исправительных записей. Убедитесь, что документ является корректировочным.`,
                        });
                    }
                }
            }
        }
        catch (e) {
            scanErrors.push({
                phase: "scanPostings",
                error: e instanceof Error ? e.message : String(e),
            });
        }
        return buildReport(organizationGuid, dateFrom, dateTo, options, collector, 0, postingsScanned, scanErrors);
    }
    // ── Full scan ──────────────────────────────────────────────────────────────
    async runFullScan(organizationGuid, dateFrom, dateTo, options = {}) {
        const runPostings = options.includePostings !== false;
        const [docResult, postResult] = await Promise.allSettled([
            this.scanDocuments(organizationGuid, dateFrom, dateTo, options),
            runPostings
                ? this.scanPostings(organizationGuid, dateFrom, dateTo, options)
                : Promise.resolve(null),
        ]);
        const docReport = docResult.status === "fulfilled" ? docResult.value : null;
        const postReport = postResult.status === "fulfilled" ? postResult.value : null;
        const allFindings = [
            ...(docReport?.findings ?? []),
            ...(postReport?.findings ?? []),
        ].sort(sortBySeverity);
        const allErrors = [
            ...(docReport?.scanErrors ?? []),
            ...(postReport?.scanErrors ?? []),
        ];
        if (docResult.status === "rejected")
            allErrors.push({ phase: "scanDocuments", error: String(docResult.reason) });
        if (postResult.status === "rejected")
            allErrors.push({ phase: "scanPostings", error: String(postResult.reason) });
        const maxTotal = (options.maxFindingsPerCheck ?? 100) * 10;
        const truncated = allFindings.length > maxTotal;
        const finalFindings = truncated ? allFindings.slice(0, maxTotal) : allFindings;
        const counts = countSeverities(finalFindings);
        return {
            ranAt: new Date().toISOString(),
            dateFrom,
            dateTo,
            organizationGuid,
            options,
            summary: {
                documentsScanned: docReport?.summary.documentsScanned ?? 0,
                postingsScanned: postReport?.summary.postingsScanned ?? 0,
                ...counts,
                total: allFindings.length,
                truncated,
                fullFindingCount: allFindings.length,
            },
            findings: finalFindings,
            scanErrors: allErrors,
        };
    }
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function countSeverities(findings) {
    const r = { critical: 0, error: 0, warn: 0, info: 0 };
    for (const f of findings)
        r[f.severity]++;
    return r;
}
function buildReport(organizationGuid, dateFrom, dateTo, options, collector, documentsScanned, postingsScanned, scanErrors) {
    const findings = collector.all.slice().sort(sortBySeverity);
    const counts = countSeverities(findings);
    const rawTotal = collector.totalRaw();
    const truncated = rawTotal > findings.length;
    return {
        ranAt: new Date().toISOString(),
        dateFrom,
        dateTo,
        organizationGuid: organizationGuid || undefined,
        options,
        summary: {
            documentsScanned,
            postingsScanned,
            ...counts,
            total: rawTotal,
            truncated,
            fullFindingCount: rawTotal,
        },
        findings,
        scanErrors,
    };
}
//# sourceMappingURL=DocumentScannerService.js.map