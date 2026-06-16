# Other Domains — Production, Stock, Costing, Full Report, Schema

## Production & Tax calculation tools
```typescript
// WIP balance — account 8110
onec_get_production_costs({ tenantId, organizationGuid, date? })
→ { wip8110: { total, byItem[] } }

// Materials balance — account 1310
onec_get_materials_balance({ tenantId, organizationGuid, date?, nomenclatureGuid? })
→ { rows[{ nomenclature, qty, amount }] }

// Finished goods — account 1320
onec_get_finished_goods_balance({ tenantId, organizationGuid, date? })
→ { rows[{ nomenclature, qty, amount }] }

// Payroll tax register balances (ОПВ, СО, ВОСМС, ИПН)
onec_get_payroll_taxes_summary({ tenantId, organizationGuid, dateFrom, dateTo })
→ { rows[{ account, accrued, paid, balance }] }

// VAT accumulation register
onec_get_vat_register({ tenantId, organizationGuid, dateFrom, dateTo })
→ { rows[{ document, vatAmount, direction }] }

// P&L: revenue 6010, COGS 7010, overhead 7210
onec_get_pl_summary({ tenantId, organizationGuid, dateFrom, dateTo })
→ { revenue, cogs, overhead, grossProfit, operatingProfit }

// Pure KZ payroll tax calculator — NO 1C call, НК РК 2026
onec_calculate_payroll_taxes({ grossSalary: number, hasDeductions?: boolean })
→ { gross, opv, oppv, so, vosms, osms, ipnBase, ipn, sn, net, employerTotal }

// КПН estimate — НК РК Art.313 (isAgro: Art.285 -70% reduction)
onec_get_kpn_estimate({ tenantId, organizationGuid, dateFrom, dateTo, isAgro?: boolean })
→ { taxableBase, taxRate, kpnAmount }
```

---

## Stock tools
```typescript
// Full inventory: 1310 materials + 1320 finished goods + 1330 goods
onec_get_stock_report({ tenantId, organizationGuid?, dateTo?, dateFrom?,
                        warehouseGuid? })
→ { items[{ nomenclature, warehouse, qty, totalCost, avgCost,
            lastPurchasePrice, lastPurchaseDate, lastSupplier }] }
```

---

## Costing tools
```typescript
// Per-nomenclature unit cost (cost per 1 tonne of wheat etc.)
onec_get_nomenclature_unit_cost({ tenantId, nomenclatureGuid, dateFrom, dateTo,
                                  organizationGuid? })
→ { productionUnitCost, cogsUnitCost, openingQty, closingQty }

// Production cost breakdown by corr-account with % and sample docs
// Corr-accounts: 1310 materials, 3350 payroll, 2420 depreciation, 8412 overhead
onec_get_cogs_composition({ tenantId, dateFrom, dateTo, organizationGuid?,
                            perCategoryDocLimit?: 1-50 })
→ { byCategory[{ corrAccount, amount, pct, sampleDocs[] }] }

// TRUE production cost excluding НЗП ping-pong inflation
// Filters inter-account transfers, returns only NEW costs
onec_get_real_production_costs({ tenantId, dateFrom, dateTo, organizationGuid?,
                                 productionAccountCode?: "8112",
                                 wipAccountCode?: "1341",
                                 finishedGoodsAccountCode?: "1320" })
→ { newCosts[{ source, amount }], harvestCapitalized, wipNetIncrease, realTotal }
```

---

## Full report tool — most comprehensive single call
```typescript
onec_generate_full_report({ tenantId, organizationGuid,
                            dateFrom?, dateTo?,
                            outputFile?: string,
                            industryOverride?: "agro"|"manufacturing"|"trade"
                                              |"services"|"construction"
                                              |"transport"|"universal" })
```
**Returns:** 20-section Markdown financial report including:
- Full balance sheet from OSV (sections 1–8)
- P&L with gross/operating/net profit
- Balance structure summary (assets vs liabilities+equity)
- AR breakdown + AP with aging table
- Advances issued/received per contractor with risk flags
- Loans by lender (short + long term)
- Cash flow by month
- Sales by nomenclature + top buyers
- Fixed assets with wear %
- Tax position (КПН, НДС net, payroll taxes)
- Financial diagnostics vs industry benchmarks
- Risk table with 🔴/🟠/🟡 flags
- Management recommendations (30d / 6m / strategic)
- AI narrative (if `LLM_BASE_URL` + `LLM_MODEL` set in env)

**Auto-detects industry** from sales items and OSV: agro, manufacturing, trade, services, construction, transport, universal.

**Saves to file** at `C:\Users\PC\Desktop\AI-BOS-2.0\Аналитика_<org>_<date>.md` (or `outputFile` override).

---

## Entity schema tools (static — no tenantId)
```typescript
// Full field list for any OData entity
onec_get_entity_schema({ entityName: "Document_РеализацияТоваровУслуг" })
→ { properties[{name, type, nullable}], relations[{field, targetEntity}] }

// Search for entity by name fragment
onec_search_entities({ query: "Поступление", category?: "Document", limit?: 20 })
→ { results[{ name, category, propertyCount, relationCount }] }

// Find all entities containing a specific field name
onec_find_field({ fieldName: "НазначениеПлатежа", limit?: 20 })
→ { results[{ entityName, fieldType, nullable }] }

// Full relationship graph (outbound FK + inbound refs)
onec_get_entity_relations({ entityName: "Document_АвансовыйОтчет" })
→ { outbound[{ field, targetEntity }], inbound[{ sourceEntity, sourceField }] }
```
Use `onec_search_entities` when you know a partial Russian name.
Use `onec_find_field` to discover exact Cyrillic field spelling before building `$filter`.
Use `onec_get_entity_relations` to build `$expand` chains.

---

## Metadata tool
```typescript
// List entity names from live 1C $metadata endpoint
onec_get_metadata({ tenantId, entityType?: "Catalog"|"Document"|"Register"|"all" })
→ { total, entities: string[] }
```
Use `onec_search_entities` (from entity schema service — 889 indexed entities) in preference to this.
`onec_get_metadata` hits the live OData endpoint and is slower — use for verification only.

---

## Docflow & Generator tools
```typescript
// DocflowService — document workflow (global service, no tenantId required internally
// but tools accept tenantId for routing consistency)
// → see docflow.tools.ts for approval/routing workflows

// DocumentGeneratorService — auto-generate 1C documents from templates
// → see generator.tools.ts for template-based document creation
```
