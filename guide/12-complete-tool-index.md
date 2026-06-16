# Complete Tool Index — onec-kz v2.0.0

All 75 tools + 7 resources. `RO` = readOnlyHint. `W` = destructiveHint.

## Anomaly domain (10)
| Tool | Hint | Key params |
|---|---|---|
| `onec_anomaly_full_scan` | RO | tenantId, organizationGuid, dateFrom, dateTo, minSeverity |
| `onec_anomaly_large_tx` | RO | tenantId, organizationGuid, dateFrom, dateTo, threshold, topN |
| `onec_anomaly_duplicates` | RO | tenantId, organizationGuid, dateFrom, dateTo, windowHours |
| `onec_anomaly_round_amounts` | RO | tenantId, organizationGuid, dateFrom, dateTo, minAmount, divisor |
| `onec_anomaly_night_entries` | RO | tenantId, organizationGuid, dateFrom, dateTo, workdayStart/End |
| `onec_anomaly_transit` | RO | tenantId, organizationGuid, dateFrom, dateTo, windowDays |
| `onec_anomaly_concentration` | RO | tenantId, organizationGuid?, asOfDate |
| `onec_anomaly_advances_risk` | RO | tenantId, organizationGuid?, asOfDate, dateFrom |
| `onec_anomaly_loan_analysis` | RO | tenantId, organizationGuid?, asOfDate, dateFrom |
| `onec_anomaly_unclosed_periods` | RO | tenantId, organizationGuid, year |

## GUID resolver (1)
| Tool | Hint | Key params |
|---|---|---|
| `onec_resolve_guid` | RO | tenantId, guid, dateFrom?, dateTo? |

## Catalog (6)
| Tool | Hint | Key params |
|---|---|---|
| `onec_search_contractors` | RO | tenantId, query, limit? |
| `onec_get_contractor` | RO | tenantId, guid |
| `onec_search_nomenclature` | RO | tenantId, query, isService?, limit? |
| `onec_get_warehouses` | RO | tenantId |
| `onec_get_contractor_contracts` | RO | tenantId, contractorGuid |
| `onec_get_organizations` | RO | tenantId |

## Documents (4)
| Tool | Hint | Key params |
|---|---|---|
| `onec_search_documents` | RO | tenantId, documentType, dateFrom?, dateTo?, ... |
| `onec_get_document` | RO | tenantId, documentType, guid |
| `onec_create_document` | W | tenantId, entitySet, data |
| `onec_post_document` | W | tenantId, documentType, guid, action |

## Reports & Analytics (15)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_osv` | RO | tenantId, dateFrom, dateTo, organizationGuid? |
| `onec_get_all_debtors` | RO | tenantId, organizationGuid?, date? |
| `onec_get_all_creditors` | RO | tenantId, organizationGuid?, date? |
| `onec_get_contractor_balance` | RO | tenantId, contractorGuid, date? |
| `onec_get_payments_in` | RO | tenantId, dateFrom, dateTo, ... |
| `onec_get_payments_out` | RO | tenantId, dateFrom, dateTo, ... |
| `onec_get_purchases_report` | RO | tenantId, dateFrom, dateTo, ... |
| `onec_get_sales_report` | RO | tenantId, dateFrom, dateTo, ... |
| `onec_get_cash_flow` | RO | tenantId, dateFrom, dateTo, organizationGuid? |
| `onec_get_fixed_assets` | RO | tenantId, organizationGuid?, date? |
| `onec_get_payroll_documents` | RO | tenantId, dateFrom, dateTo, organizationGuid? |
| `onec_get_creditors_detailed` | RO | tenantId, organizationGuid?, date? |
| `onec_get_advances_received_detailed` | RO | tenantId, organizationGuid?, date? |
| `onec_get_full_liabilities_report` | RO | tenantId, organizationGuid?, date? |
| `onec_detect_anomalies` | RO | tenantId, dateFrom, dateTo, organizationGuid? |
| `onec_get_monthly_trend` | RO | tenantId, dateFrom, dateTo, organizationGuid? |
| `onec_get_financial_summary` | RO | tenantId, organizationGuid, date? |

## Auditor (6)
| Tool | Hint | Key params |
|---|---|---|
| `onec_audit_period_quality` | RO | tenantId, organizationGuid, year, month |
| `onec_get_document_journal_entries` | RO | tenantId, documentGuid |
| `onec_verify_account_balance` | RO | tenantId, accountCode, dateFrom, dateTo |
| `onec_get_esf_status` | RO | tenantId, organizationGuid, dateFrom, dateTo |
| `onec_get_unposted_documents` | RO | tenantId, documentType, dateFrom, dateTo |
| `onec_get_month_close_status` | RO | tenantId, organizationGuid, year, month |

## Integrity validation (4)
| Tool | Hint | Key params |
|---|---|---|
| `onec_validate_double_entry` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_account_signs` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_balance_arithmetic` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_extdimension` | RO | tenantId, dateFrom, dateTo |

## Tax validation (6)
| Tool | Hint | Key params |
|---|---|---|
| `onec_validate_vat_charged_vs_revenue` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_vat_recoverable_vs_purchases` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_esf_coverage` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_payroll_tax_rates` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_payroll_deductions` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_payroll_accrual_balance` | RO | tenantId, dateFrom, dateTo |

## Period-close validation (5)
| Tool | Hint | Key params |
|---|---|---|
| `onec_validate_period_close_readiness` | RO | tenantId, year, month, organizationGuid |
| `onec_validate_accrual_alignment` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_depreciation_completeness` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_wip_closure` | RO | tenantId, year, month, organizationGuid |
| `onec_validate_cogs_basis` | RO | tenantId, dateFrom, dateTo |

## Drill-down (8)
| Tool | Hint | Key params |
|---|---|---|
| `onec_drill_account_sign` | RO | tenantId, accountCode, dateFrom, dateTo |
| `onec_drill_payroll_tax` | RO | tenantId, taxAccount, dateFrom, dateTo |
| `onec_drill_missing_esf` | RO | tenantId, dateFrom, dateTo |
| `onec_drill_stale_advances` | RO | tenantId, date, accountCode |
| `onec_drill_vat_documents` | RO | tenantId, dateFrom, dateTo |
| `onec_drill_wip_documents` | RO | tenantId, dateFrom, dateTo |
| `onec_drill_unposted_documents` | RO | tenantId, documentType, dateFrom, dateTo |
| `onec_drill_unpaid_payments` | RO | tenantId, dateFrom, dateTo |

## Investigation & ML (4)
| Tool | Hint | Key params |
|---|---|---|
| `onec_investigate_payment` | RO | tenantId, docNumber, docDate, orgGuid |
| `onec_find_duplicate_payments` | RO | tenantId, orgGuid, dateFrom, dateTo |
| `onec_ml_scan_anomalies` | RO | tenantId, organizationGuid, dateFrom, dateTo |
| `onec_build_baselines` | RO | tenantId, organizationGuid, dateFrom, dateTo |

## Due diligence (3)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_advance_settlement` | RO | tenantId, contractorGuid |
| `onec_get_sales_with_lines` | RO | tenantId, contractorGuids[], dateFrom, dateTo |
| `onec_get_group_balance` | RO | tenantId, contractorGuids[], groupLabel |

## Scan (2)
| Tool | Hint | Key params |
|---|---|---|
| `onec_scan_documents` | RO | tenantId, organizationGuid, dateFrom, dateTo |
| `onec_scan_all` | RO | tenantId, organizationGuid, dateFrom, dateTo |

## Production (8)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_production_costs` | RO | tenantId, organizationGuid, date? |
| `onec_get_materials_balance` | RO | tenantId, organizationGuid, date? |
| `onec_get_finished_goods_balance` | RO | tenantId, organizationGuid, date? |
| `onec_get_payroll_taxes_summary` | RO | tenantId, organizationGuid, dateFrom, dateTo |
| `onec_get_vat_register` | RO | tenantId, organizationGuid, dateFrom, dateTo |
| `onec_get_pl_summary` | RO | tenantId, organizationGuid, dateFrom, dateTo |
| `onec_calculate_payroll_taxes` | RO | grossSalary, hasDeductions? |
| `onec_get_kpn_estimate` | RO | tenantId, organizationGuid, dateFrom, dateTo, isAgro? |

## Stock (1)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_stock_report` | RO | tenantId, organizationGuid?, dateTo? |

## Costing (3)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_nomenclature_unit_cost` | RO | tenantId, nomenclatureGuid, dateFrom, dateTo |
| `onec_get_cogs_composition` | RO | tenantId, dateFrom, dateTo |
| `onec_get_real_production_costs` | RO | tenantId, dateFrom, dateTo |

## Account analysis (1)
| Tool | Hint | Key params |
|---|---|---|
| `onec_analyze_account` | RO | tenantId, accountCode, dateFrom, dateTo |

## KZ chart of accounts — static (5)
| Tool | Hint | Key params |
|---|---|---|
| `kz_chart_list_sections` | RO | — |
| `kz_chart_get_section` | RO | code: "1"–"8" |
| `kz_chart_get_subsection` | RO | code: "1000"–"8000" |
| `kz_chart_lookup` | RO | code: any level |
| `kz_chart_search` | RO | query, limit? |

## Entity schema — static (4 or 1 if unavailable)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_entity_schema` | RO | entityName |
| `onec_search_entities` | RO | query, category?, limit? |
| `onec_find_field` | RO | fieldName, limit? |
| `onec_get_entity_relations` | RO | entityName |

## Full report (1)
| Tool | Hint | Key params |
|---|---|---|
| `onec_generate_full_report` | — | tenantId, organizationGuid, dateFrom?, dateTo?, outputFile? |

## Register / accounting registers (7)
| Tool | Hint | Key params |
|---|---|---|
| `onec_get_account_balance` | RO | tenantId, accountCode, organizationGuid?, date? |
| `onec_get_accounting_turnovers` | RO | tenantId, accountCode, dateFrom, dateTo |
| `onec_get_exchange_rates` | RO | tenantId, currencyCode?, date? |
| `onec_get_contractor_settlements` | RO | tenantId, contractorGuid?, organizationGuid? |
| `onec_get_account_breakdown` | RO | tenantId, accountCode, dateTo |
| `onec_get_account_card` | RO | tenantId, accountCode, dateFrom, dateTo |
| `onec_get_inventory_balance` | RO | tenantId, organizationGuid?, nomenclatureGuid?, date? |

## Reconciliation validation (3)
| Tool | Hint | Key params |
|---|---|---|
| `onec_validate_invoice_payment_matching` | RO | tenantId, date, organizationGuid? |
| `onec_validate_contract_terms_compliance` | RO | tenantId, dateFrom, dateTo |
| `onec_validate_bank_balance_consistency` | RO | tenantId, dateFrom, dateTo |

## Document validation (3)
| Tool | Hint | Key params |
|---|---|---|
| `onec_validate_document_line_totals` | RO | tenantId, documentType, dateFrom, dateTo |
| `onec_validate_nomenclature_accounts` | RO | tenantId, date, organizationGuid? |
| `onec_validate_advance_aging` | RO | tenantId, date, agingDays? |

## Generator — HTML document generation (4)
| Tool | Hint | Key params |
|---|---|---|
| `onec_generate_act_sverki` | — | tenantId, contractorGuid, dateFrom, dateTo, orgGuid? |
| `onec_generate_debt_certificate` | — | tenantId, contractorGuid, date?, orgGuid? |
| `onec_generate_creditors_report` | — | tenantId, orgGuid?, date? |
| `onec_generate_obligation_notice` | — | tenantId, contractorGuid, date?, orgGuid? |

## Docflow — 1С:Документооборот (10, or stub if not configured)
| Tool | Hint | Key params |
|---|---|---|
| `onec_docflow_status` | RO | — (stub when not configured) |
| `onec_docflow_get_tasks` | RO | assignee?, status?, dateFrom?, dateTo? |
| `onec_docflow_get_overdue` | RO | top? |
| `onec_docflow_create_task` | W | title, assignee, dueDate, description? |
| `onec_docflow_complete_task` | W | taskId, resolution, comment? |
| `onec_docflow_get_documents` | RO | type?, status?, dateFrom?, dateTo? |
| `onec_docflow_get_document` | RO | documentId |
| `onec_docflow_create_document` | W | type, title, content, ... |
| `onec_docflow_get_approval_route` | RO | documentId |
| `onec_docflow_search_by_contractor` | RO | contractorGuid, dateFrom?, dateTo? |

## Tenant + metadata (3)
| Tool | Hint | Key params |
|---|---|---|
| `onec_list_tenants` | RO | — |
| `onec_ping_tenant` | RO | tenantId |
| `onec_get_metadata` | RO | tenantId, entityType? |

## Resources (7)
```
onec://organizations          onec://chart-of-accounts
onec://currencies             onec://tenants
onec://kz-workflow            onec://entities
accounts://kz-chart
```
