# Agent Routing Tree

## Step 0 — always resolve tenant first
```
user mentions company/tenant?
  yes → use that tenantId
  no  → omit (defaults to "moskovskiy")
```

## Step 1 — intent classification
```
intent
├── "audit" / "check anomalies" / "risks"      → 02-anomaly-domain.md
├── "balance" / "debtors" / "creditors" / "OSV" → 03-reports-domain.md
├── "validate" / "ESF" / "VAT" / "period close" → 04-validation-domain.md
├── "find contractor" / "find document"          → 05-catalog-domain.md
├── "what is this GUID"                          → onec_resolve_guid
├── "account code meaning" / "1010" "3310"       → 06-reference-domain.md
└── "start investigation" / "full picture"       → playbooks in 08-workflows.md
```

## Step 2 — anomaly intent routing
```
"full audit"                 → onec_anomaly_full_scan  (entry point)
"large payments"             → onec_anomaly_large_tx
"duplicate payments"         → onec_anomaly_duplicates
"round amounts"              → onec_anomaly_round_amounts
"night entries"              → onec_anomaly_night_entries
"transit / money returned"   → onec_anomaly_transit
"concentration risk"         → onec_anomaly_concentration
"advances risk"              → onec_anomaly_advances_risk
"loans / debt structure"     → onec_anomaly_loan_analysis
"unclosed months"            → onec_anomaly_unclosed_periods
```

## Step 3 — validation intent routing
```
"double entry"               → onec_validate_double_entry
"wrong account signs"        → onec_validate_account_signs  → onec_drill_account_sign
"balance arithmetic"         → onec_validate_balance_arithmetic
"VAT charged"                → onec_validate_vat_charged_vs_revenue
"VAT recoverable"            → onec_validate_vat_recoverable_vs_purchases
"ESF coverage"               → onec_validate_esf_coverage  → onec_drill_missing_esf
"payroll taxes"              → onec_validate_payroll_tax_rates → onec_drill_payroll_tax
"period close ready"         → onec_validate_period_close_readiness
"depreciation"               → onec_validate_depreciation_completeness
"WIP / НЗП"                  → onec_validate_wip_closure → onec_drill_wip_documents
"reconciliation"             → onec_validate_invoice_payment_matching
                               onec_validate_contract_terms_compliance
                               onec_validate_bank_balance_consistency
```

## Step 4 — GUID drill-down chain
```
any GUID found in results →
  onec_resolve_guid(guid)
    resolvedAs = "document_recorder"  → see postings + contractor balance
    resolvedAs = "catalog_контрагенты" → see balance + receivables + payables
    resolvedAs = "catalog_организации" → see financial summary + OSV
    resolvedAs = "catalog_номенклатура" → see inventory + unit cost
    resolvedAs = "document"            → see postings + contractor
    resolvedAs = "unknown"             → GUID deleted or wrong tenant
```

## Common param patterns
```typescript
// tenantId is optional — omit to use default tenant ("moskovskiy")
// Include explicitly when targeting a specific tenant:
{ tenantId: "moskovskiy", ... }

// Date range (ISO string):
{ dateFrom: "2026-01-01", dateTo: "2026-05-31" }

// Org GUID — get it from:
onec_get_organizations() → rows[].Ref_Key
```
