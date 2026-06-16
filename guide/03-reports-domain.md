# Reports & Analytics Domain

## Analytics tools (fast snapshots)
```typescript
// P&L monthly trend — revenue 6010, COGS 7010, overhead 7210
onec_get_monthly_trend({ tenantId, dateFrom, dateTo, organizationGuid? })
→ { months[{month, revenue, cogs, overhead, grossProfit, operatingProfit}] }

// Financial snapshot — cash, AR, AP, VAT net, CIT
onec_get_financial_summary({ tenantId, organizationGuid, date? })
→ { cash, ar, ap, vatNet, cit, ... }
```

## Balance-sheet reports
```typescript
// Trial balance (ОСВ) — all accounts for period
onec_get_osv({ tenantId, dateFrom, dateTo, organizationGuid? })
→ { rows[{accountCode, openingDr, openingCr, turnoverDr, turnoverCr, closingDr, closingCr}] }

// AR: accounts 1210, 1250, 1251, 1254, 1255
onec_get_all_debtors({ tenantId, organizationGuid?, date? })
→ { rows[{contractorName, balanceDr, balanceCr}], total }

// AP: accounts 3310, 3350, 3387, 3390
onec_get_all_creditors({ tenantId, organizationGuid?, date? })
→ { rows[...], total }

// Full balance for one contractor across ALL accounts
onec_get_contractor_balance({ tenantId, contractorGuid, date? })
→ { rows[{accountCode, balanceDr, balanceCr}] }
```

## Payment reports
```typescript
onec_get_payments_in({ tenantId, dateFrom, dateTo, contractorGuid?, organizationGuid? })
// ПлатежноеПоручениеВходящее

onec_get_payments_out({ tenantId, dateFrom, dateTo, contractorGuid?, organizationGuid? })
// ПлатежноеПоручениеИсходящее

onec_get_cash_flow({ tenantId, dateFrom, dateTo, organizationGuid? })
→ { months[{month, inflow, outflow, net}] }
```

## Transaction reports
```typescript
onec_get_purchases_report({ tenantId, dateFrom, dateTo, contractorGuid?, organizationGuid? })
// ПоступлениеТоваровУслуг — line-level detail

onec_get_sales_report({ tenantId, dateFrom, dateTo, contractorGuid?, organizationGuid? })
// РеализацияТоваровУслуг — line-level detail
```

## Liability reports
```typescript
// AP detailed — age, contracts, payment history
onec_get_creditors_detailed({ tenantId, organizationGuid?, date? })

// Account 3510 — advances received from buyers
onec_get_advances_received_detailed({ tenantId, organizationGuid?, date? })

// All liabilities combined: 3510+3310+3350+3387+3390+tax+other
onec_get_full_liabilities_report({ tenantId, organizationGuid?, date? })
```

## Asset & payroll reports
```typescript
// Fixed assets — 2410 (cost), 2420 (accumulated depreciation)
onec_get_fixed_assets({ tenantId, organizationGuid?, date? })

// Payroll accrual docs НачислениеЗарплатыРаботникамОрганизаций
onec_get_payroll_documents({ tenantId, dateFrom, dateTo, organizationGuid? })
```

## Anomaly detection (basic)
```typescript
// Manual entries ОперацияБух + round amounts ≥1M + unposted docs
onec_detect_anomalies({ tenantId, dateFrom, dateTo, organizationGuid? })
// For deep ML: use onec_anomaly_full_scan instead
```

## Routing hints
```
Need P&L?           → onec_get_monthly_trend + onec_get_financial_summary
Need cash?          → onec_get_payments_in + onec_get_payments_out + onec_get_cash_flow
Need debts?         → onec_get_all_debtors + onec_get_all_creditors
Need one contractor → onec_get_contractor_balance(contractorGuid)
Need full audit?    → onec_get_osv → then onec_anomaly_full_scan
```
