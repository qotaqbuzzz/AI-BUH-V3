# Reference Domain — KZ Chart, Entity Schema, GUID Resolver

## Universal GUID resolver — most important single tool
```typescript
onec_resolve_guid({ tenantId, guid: UUID, dateFrom?, dateTo? })
```
**Auto-detects type and returns everything in one call:**
```
resolvedAs                 → what was returned
"document_recorder"        → postings[] + document header + contractor + balance
"catalog_контрагенты"      → data + balance + contracts + receivables + payables
                             + recentDocuments (last 15)
"catalog_организации"      → data + financialSummary + osv_topAccounts
"catalog_номенклатура"     → data + inventoryBalance + unitCost
"document"                 → document header + postings + contractor + contractorBalance
"unknown"                  → not found in this tenant
```
**One call replaces 5–10 manual queries. Always try this first with an unknown GUID.**

## KZ regulatory chart of accounts — static, no tenantId
```typescript
kz_chart_list_sections()
// → sections 1-8: 1=Short-term assets, 2=Long-term, 3=Short-term liab,
//   4=Long-term liab, 5=Capital, 6=Income, 7=Expenses, 8=Production

kz_chart_get_section({ code: "1"|"2"|...|"8" })

kz_chart_get_subsection({ code: "1000"|"1200"|"2400"|"3300"|"6000"|... })

kz_chart_lookup({ code: "1"|"1000"|"1010" })  // any level, returns breadcrumb

kz_chart_search({ query: "аренд"|"дебиторская"|"налог", limit?: 1-50 })
// Full-text search in Russian
```

## Entity schema — static, no tenantId
```typescript
// List all entity names in a category
onec_list_entity_schemas({ category?: "Catalog"|"Document"|"AccumulationRegister"
                                     |"InformationRegister"|"AccountingRegister"
                                     |"ChartOfAccounts"|"DocumentJournal" })

// Full field list for an OData entity
onec_get_entity_schema({ entityName: "Document_РеализацияТоваровУслуг" })
→ { fields[{name, type, description}], tabularSections[{name, fields[]}] }
```
Resource `onec://entities` → index of all 889 entities by category.

## Register tools
```typescript
// Account balance as of date (from AccountingRegister_Типовой)
onec_get_account_balance({ tenantId, accountCode, organizationGuid?, date? })

// Debit/credit turnovers for a period
onec_get_accounting_turnovers({ tenantId, accountCode, dateFrom, dateTo, organizationGuid? })

// Account card — individual Дт/Кт postings
onec_get_account_card({ tenantId, accountCode, dateFrom, dateTo, organizationGuid? })

// Balance breakdown by subconto (contractor, nomenclature, warehouse)
onec_get_account_breakdown({ tenantId, accountCode, dateTo, organizationGuid? })

// Receivables/payables by contractor (AccumulationRegister_Взаиморасчёты)
onec_get_contractor_settlements({ tenantId, contractorGuid?, organizationGuid? })

// Inventory balance (AccumulationRegister_ТоварыОрганизацийБУ)
onec_get_inventory_balance({ tenantId, organizationGuid?, nomenclatureGuid?, date? })

// Exchange rates from InformationRegister_КурсыВалют
onec_get_exchange_rates({ tenantId, currencyCode?, date? })
```

## Costing tools
```typescript
// Unit cost of nomenclature item
onec_get_nomenclature_unit_cost({ tenantId, nomenclatureGuid, dateFrom, dateTo })

// Cost breakdown for production period
onec_get_production_cost_breakdown({ tenantId, organizationGuid, dateFrom, dateTo })
```

## Resources (read without tool call)
```
onec://kz-workflow          — tax rates НК РК 2026 + account flow reference
kz-standard-chart           — full KZ regulatory chart JSON
onec://chart-of-accounts    — live 1C ChartOfAccounts_Типовой
```
