# Validation & Drill-Down Domain

## Integrity validation
```typescript
// ΣДт = ΣКт across trial balance + optional per-doc sample
onec_validate_double_entry({ tenantId, dateFrom, dateTo, organizationGuid?,
                             perDocumentSampleLimit?: 0-100 })

// Atypical signs: credit on assets, debit on liabilities
onec_validate_account_signs({ tenantId, dateFrom, dateTo, organizationGuid? })
→ findings[] → drill: onec_drill_account_sign({ accountCode })

// Per-account: opening + turnoverDt − turnoverCt = closing
onec_validate_balance_arithmetic({ tenantId, dateFrom, dateTo, organizationGuid? })

// Sub-account (ExtDimension1) required on 1210, 3310, 1710, 3510, 8110
onec_validate_extdimension({ tenantId, dateFrom, dateTo, organizationGuid? })
```

## Tax validation
```typescript
// НДС начисленный 3131 ≈ 6010 × 12%  (±1%)
onec_validate_vat_charged_vs_revenue({ tenantId, dateFrom, dateTo, organizationGuid? })
→ drill: onec_drill_vat_documents (per-doc breakdown)

// НДС к возмещению 1421 ≤ purchases × 12/112
onec_validate_vat_recoverable_vs_purchases({ tenantId, dateFrom, dateTo, organizationGuid? })

// Every РеализацияТоваровУслуг must have ЭСФ
onec_validate_esf_coverage({ tenantId, dateFrom, dateTo, organizationGuid? })
→ drill: onec_drill_missing_esf (full list of missing ЭСФ)

// ОПВ 10%, ОППВ 5%, СО 3.5%, ВОСМС 3%, ОСМС 2%, ИПН 10%, СН 9.5%-СО
onec_validate_payroll_tax_rates({ tenantId, dateFrom, dateTo, organizationGuid? })
→ drill: onec_drill_payroll_tax({ taxAccount: "3220"|"3250"|"3211"|... })

// НачислениеЗарплаты — flag docs below МЗП 85,000 ₸
onec_validate_payroll_deductions({ tenantId, dateFrom, dateTo, organizationGuid? })

// 3350 credit turnover ≈ ΣНачислениеЗарплаты
onec_validate_payroll_accrual_balance({ tenantId, dateFrom, dateTo, organizationGuid? })
```

## Period-close validation
```typescript
// Pre-flight: unposted docs + depreciation + ЗакрытиеМесяца status
onec_validate_period_close_readiness({ tenantId, year, month, organizationGuid })

// Revenue → VAT accrued, Salary → ОПВ accrued
onec_validate_accrual_alignment({ tenantId, dateFrom, dateTo, organizationGuid? })

// 2420 credit turnover must exist if 2410 balance > 0
onec_validate_depreciation_completeness({ tenantId, dateFrom, dateTo, organizationGuid? })

// 8110/8112 НЗП: zero winter, growing spring, zero at harvest
onec_validate_wip_closure({ tenantId, year, month, organizationGuid })
→ drill: onec_drill_wip_documents

// 7010 ≈ 1320 credit turnover for period
onec_validate_cogs_basis({ tenantId, dateFrom, dateTo, organizationGuid? })
```

## Drill-down tools (called after findings)
```typescript
onec_drill_account_sign({ tenantId, accountCode, dateFrom, dateTo, organizationGuid?, limit? })
onec_drill_payroll_tax({ tenantId, taxAccount, dateFrom, dateTo, organizationGuid? })
onec_drill_missing_esf({ tenantId, dateFrom, dateTo, organizationGuid? })
onec_drill_stale_advances({ tenantId, date, accountCode:"1710"|"3510", organizationGuid?, agingDays? })
onec_drill_vat_documents({ tenantId, dateFrom, dateTo, organizationGuid? })
onec_drill_wip_documents({ tenantId, dateFrom, dateTo, organizationGuid? })
onec_drill_unposted_documents({ tenantId, documentType, dateFrom, dateTo, organizationGuid? })
onec_drill_unpaid_payments({ tenantId, dateFrom, dateTo, organizationGuid? })
```

## Reconciliation validation (3)
```typescript
// AR (1210) + AP (3310) outstanding summary with top-5 per side
onec_validate_invoice_payment_matching({ tenantId, date, organizationGuid?, agingDaysWarn? })

// Expired contracts (СрокДействияПо < period end)
onec_validate_contract_terms_compliance({ tenantId, dateFrom, dateTo, organizationGuid? })

// Bank account 1030: closing balance ≥ 0 + posted-but-unpaid outgoing payments
onec_validate_bank_balance_consistency({ tenantId, dateFrom, dateTo, organizationGuid? })
```

## Document validation (3)
```typescript
// Per-line arithmetic: qty × price = amount; header sum check
onec_validate_document_line_totals({ tenantId,
  documentType: "РеализацияТоваровУслуг"|"ПоступлениеТоваровУслуг",
  dateFrom, dateTo, organizationGuid?, sampleLimit? })

// Nomenclature type matches account (e.g. 1320 should not contain services)
onec_validate_nomenclature_accounts({ tenantId, date, organizationGuid? })

// Large outstanding advances on 1710 and 3510 flagged if age > agingDays
onec_validate_advance_aging({ tenantId, date, organizationGuid?, agingDays?: 30-365 })
```

## Validation call order (full audit)
```
1. onec_validate_double_entry        — foundation check
2. onec_validate_account_signs       — balance direction
3. onec_validate_balance_arithmetic  — math check
4. onec_validate_vat_charged_vs_revenue + onec_validate_esf_coverage
5. onec_validate_payroll_tax_rates
6. onec_validate_period_close_readiness (per month)
7. onec_validate_depreciation_completeness
8. onec_validate_cogs_basis
```
