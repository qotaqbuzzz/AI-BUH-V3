# Investigation, ML & Due Diligence Domain

## Investigation tools
```typescript
// Full single-payment deep-dive (replaces 8–10 manual queries)
onec_investigate_payment({ tenantId, docNumber: string, docDate, orgGuid })
→ { payee, account, employeeStatus?, riskLevel, verdict, relatedDocs }

// Duplicate pairs across a date range
onec_find_duplicate_payments({ tenantId, orgGuid, dateFrom, dateTo,
                               windowHours?: 1-168, onlyHighRisk?: boolean })
→ { total, highRisk, mediumRisk, totalAmount, pairs[{contractor,amount,dates,riskLevel}] }
```
Use `onec_investigate_payment` first for a single doc, `onec_find_duplicate_payments` for a period sweep.
Both return `riskLevel: "high" | "medium"` — pass any GUID from results to `onec_resolve_guid`.

---

## ML anomaly tools
```typescript
// z-score statistical scan — returns ranked anomalies with confidence %
onec_ml_scan_anomalies({ tenantId, organizationGuid, dateFrom, dateTo,
                         alertOnFindings?: boolean,   // Telegram/webhook alert
                         minConfidence?: 0-100 })     // default 50
→ { summary{ total, bySeverity }, anomalies[{ type, confidence, amount, guid, ... }] }

// Build statistical baselines from 12+ months of history
onec_build_baselines({ tenantId, organizationGuid, dateFrom, dateTo })
→ { baselines[{ docType, month, mean, stdDev, p95, p99 }] }
```
**Relationship:** `onec_anomaly_full_scan` calls `onec_ml_scan_anomalies` internally as one of its 6 contexts.
Call `onec_ml_scan_anomalies` directly when you need raw ML data or want to tune `minConfidence`.
Call `onec_build_baselines` before the first scan on a new tenant (uses 12+ months as training set).

---

## Due diligence tools
```typescript
// Advance fulfillment % for a contractor
// (how much of their advance has been offset by actual deliveries)
onec_get_advance_settlement({ tenantId, contractorGuid, organizationGuid?,
                              dateFrom?, dateTo? })
→ { advanceTotal, offsetTotal, remaining, fulfillmentPct }

// Sales with full line detail for a corporate group (up to 20 contractor GUIDs)
onec_get_sales_with_lines({ tenantId, contractorGuids: UUID[], dateFrom, dateTo,
                            organizationGuid? })
→ { rows[{ item, qty, unit, price, amount, vat, contractor }], totals }

// Consolidated balance across ALL accounts for a group of related contractors
onec_get_group_balance({ tenantId, contractorGuids: UUID[], groupLabel: string,
                         date? })
→ { label, rows[{ accountCode, balanceDr, balanceCr }], netExposure }
```

**Use case:** Corporate group analysis — pass all entity GUIDs together to see consolidated exposure.

---

## Scan tools (object-level sweep)
```typescript
// Sweep documents for structural errors
onec_scan_documents({ tenantId, organizationGuid, dateFrom, dateTo,
                      docTypes?: string[],
                      limitPerType?: 1-1000,
                      maxFindingsPerCheck?: 10-500 })
→ findings: DOC-001 unposted | DOC-002 missing contractor | DOC-003 zero-amount

// Full scan: documents + all accounting postings
onec_scan_all({ tenantId, organizationGuid, dateFrom, dateTo,
                includePostings?: boolean,   // default true
                docTypes?, limitPerType?,
                batchSize?: 50-1000,         // default 200
                delayMs?: 0-2000 })          // default 100 (rate limit)
→ findings: DOC-* + POST-* (circular, zero-amount, red storno)
```
**Tip:** Use `limitPerType: 10` for a quick test run before scanning the full year.

---

## Routing decision: which anomaly entry point to use?
```
"quick scan, unknown period"   → onec_anomaly_full_scan (6 contexts, finds toolHints)
"raw ML data / confidence"     → onec_ml_scan_anomalies
"one payment investigation"    → onec_investigate_payment
"duplicate sweep"              → onec_anomaly_duplicates (or onec_find_duplicate_payments)
"structural errors in docs"    → onec_scan_documents
"full object audit (slow)"     → onec_scan_all
"contractor exposure"          → onec_get_advance_settlement + onec_get_group_balance
```
