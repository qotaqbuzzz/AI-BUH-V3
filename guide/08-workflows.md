# Agent Playbooks — Step-by-Step Workflows

## Playbook A: "Show me the financial health of the company"
```
1. onec_get_organizations({ tenantId })
   → pick Ref_Key as orgGuid

2. onec_get_financial_summary({ tenantId, organizationGuid: orgGuid, date: today })
   → cash, AR, AP, VAT net, CIT snapshot

3. onec_get_monthly_trend({ tenantId, dateFrom: "2026-01-01", dateTo: today, organizationGuid: orgGuid })
   → 6-month P&L trend

4. onec_get_all_debtors({ tenantId, organizationGuid: orgGuid })
   + onec_get_all_creditors({ tenantId, organizationGuid: orgGuid })
   → working capital gap = debtors − creditors
```

---

## Playbook B: "Run a full anomaly audit"
```
1. onec_get_organizations  → orgGuid
2. onec_anomaly_full_scan({ tenantId, organizationGuid: orgGuid,
                            dateFrom: "2026-01-01", dateTo: today,
                            minSeverity: "medium" })
   → findings[] sorted by severity

3. For each finding with toolHint:
   → call finding.toolHint with same tenantId + orgGuid + dates

4. For any recorderGuid or GUID found in findings:
   → onec_resolve_guid({ tenantId, guid })
```

---

## Playbook C: "Investigate a specific payment"
```
1. onec_investigate_payment({ tenantId, docNumber, docDate, orgGuid })
   → payee name, account, risk verdict in one call

2. If risk is high:
   → onec_find_duplicate_payments({ tenantId, orgGuid, dateFrom, dateTo })
   → onec_get_document_journal_entries({ tenantId, documentGuid })

3. Resolve contractor:
   → onec_resolve_guid({ tenantId, guid: contractorGuid })
   → see full balance + payables + recent docs
```

---

## Playbook D: "Prepare for period close (month-end)"
```
1. onec_validate_period_close_readiness({ tenantId, year, month, organizationGuid })
   → unpostedDocs, depreciation status, ЗакрытиеМесяца exists?

2. If unpostedDocs.total > 0:
   → onec_drill_unposted_documents for each type listed

3. onec_validate_depreciation_completeness({ tenantId, dateFrom, dateTo })
   → if missing: post НачислениеАмортизации before closing

4. onec_validate_accrual_alignment (revenue → VAT, salary → ОПВ)

5. onec_validate_wip_closure (8112 НЗП balance check)

6. onec_get_month_close_status → confirm ЗакрытиеМесяца is posted
```

---

## Playbook E: "Tax compliance check"
```
1. onec_validate_vat_charged_vs_revenue → 3131 ≈ 6010 × 12%
   if fail → onec_drill_vat_documents (per-doc breakdown)

2. onec_validate_esf_coverage → every sale has ЭСФ
   if missing → onec_drill_missing_esf (list of GUIDs)

3. onec_validate_payroll_tax_rates → ОПВ/ОППВ/СО/ВОСМС/ИПН/СН rates
   if fail → onec_drill_payroll_tax({ taxAccount: "3220" })

4. onec_validate_payroll_deductions → flag below МЗП 85,000 ₸

5. onec_validate_payroll_accrual_balance → 3350 ≈ ΣНачисления
```

---

## Playbook F: "Deep-dive on a contractor"
```
1. onec_search_contractors({ tenantId, query: "name or БИН" })
   → pick Ref_Key

2. onec_resolve_guid({ tenantId, guid: contractorGuid })
   → balance across all accounts + contracts + receivables + payables
   → last 15 documents

3. onec_get_contractor_balance({ tenantId, contractorGuid })
   → per-account breakdown

4. onec_anomaly_concentration({ tenantId, asOfDate })
   → is this contractor in top-5 concentration?

5. onec_get_sales_report + onec_get_purchases_report
   (filter by contractorGuid)
```

---

## Playbook G: "Accounting integrity check"
```
1. onec_validate_double_entry     → ΣДт = ΣКт
2. onec_validate_account_signs    → no credit on assets
   if violations → onec_drill_account_sign per account
3. onec_validate_balance_arithmetic → opening + turnover = closing
4. onec_validate_extdimension     → sub-accounts present
5. onec_audit_period_quality({ year, month })
   → structured ✅/⚠️/❌ across 5 blocks
```

---

## Param quick-fill cheatsheet
```typescript
const TODAY     = new Date().toISOString().slice(0,10);
const YEAR_START = `${TODAY.slice(0,4)}-01-01`;

// Most calls need:
{ tenantId: "moskovskiy", organizationGuid: "<from onec_get_organizations>",
  dateFrom: YEAR_START, dateTo: TODAY }
```
