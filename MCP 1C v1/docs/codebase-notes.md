# MCP 1C Codebase Audit

Complete inventory of 158 MCP tools, 33 services, 12 named workflows, and domain coverage in the current codebase.

**Last Updated:** 2026-06-18  
**Total Tools:** 158  
**Tool Files:** 45  
**Service Layer:** 33 classes (+ 6 validators)  
**Named Workflows:** 12  
**Coverage Status:** ~90% across 21 business domains (up from ~65% at 99-tool baseline)

**Companion docs:** [one-c-workflows.md](./one-c-workflows.md) (prescriptive goal) · [plan.md](./plan.md) (historical Phase 1–3 build plan, largely complete) · [updates/2026-06-17.md](./updates/2026-06-17.md) (mid-sprint delta log)

---

## Executive Summary

**Current State:**
- ✅ **158 tools** registered across 45 tool modules
- ✅ **33 services** + 6 validators providing business logic
- ✅ **12 named workflows** in `workflows.json` (month close, VAT filing, FA audit, etc.)
- ✅ **Tool routing** via `onec_find_tool` + generated `tool-registry.json`
- ✅ **Strong in:** validation (22 rules + dedicated validators), GL analysis, reporting, docflow, production, cash, fixed assets, payroll accruals
- ⚠️ **Partial:** ЭАВ (electronic act of work), sales/inventory analytics, corporate tax depth, budget data dependency
- ✅ **No zero-coverage domains** — all 21 business areas have at least foundational tools

**Architecture:**
- Layered: Tools (MCP) → Services → OneC HTTP OData layer
- Validation-first: unified `onec_validate` (22 ruleIds) + 25 dedicated validation/drilldown tools
- Discovery-first: `onec_find_tool` routes agents to the right tool before guessing
- Reporting-focused: 20+ report generators and analytics tools
- Investigation-driven: 10+ drilling/investigation tools

**New since 99-tool baseline (Jun 2026):**
- Fixed Assets (7), Cash Management (8), Payroll depth (8), Supply Chain (3)
- Tax Filing (4), Budget (3), Cost Centers (3), Consolidation (2)
- Customs (2), Related Party (2), Provisions (2), Setup Audit (2)
- Intangible Assets (2), Asset Transfers (2), ESF service (2), Tool Discovery (1)

---

## Tool Inventory by Domain

### 1. FINANCIAL ACCOUNTING (Бухгалтерский Учёт)

**Tools:** 18 | **Coverage:** ✅ COMPLETE (95%)

**Tools Provided:**
- `onec_analyze_account` — universal account analyser (summary, corr-account, subconto, trend, risks)
- `onec_get_account_breakdown` — GL balance by sub-accounts (nomenclature, warehouse, contractor)
- `onec_get_account_card` — debit/credit postings with source document GUID, line number
- `onec_verify_account_balance` — verify GL balance as of date
- `onec_get_financial_summary` — balance sheet snapshot (assets, liabilities, equity)
- `onec_get_monthly_trend` — GL account trend month-over-month
- `onec_get_exchange_rates` — currency rates for period
- `kz_chart_list_sections` / `kz_chart_get_section` / `kz_chart_get_subsection` / `kz_chart_lookup` / `kz_chart_search` — KZ chart of accounts reference
- `onec_validate_double_entry` — Σ Дт = Σ Кт verification
- `onec_validate_account_signs` — asset/liability sign checks
- `onec_validate_balance_arithmetic` — opening + turnover = closing
- `onec_validate_extdimension` — sub-account dimension completeness
- `onec_drill_account_sign` — drill by debit/credit sign

**Services:** AccountAnalysisService, RegisterService, AnalyticsService, ReportsService, IntegrityValidator

**Drilling Tools:** ✅ account_breakdown, account_card, account_sign, analyze_account  
**Validation Tools:** ✅ double_entry, balance_arithmetic, account_signs, extdimension  
**Report Tools:** ✅ financial_summary, monthly_trend

**Gaps:** Dedicated reconciliation-statement drill (АктСверкиВзаиморасчетов detail beyond `onec_generate_act_sverki`)

---

### 2. SALES & REVENUE (Продажи)

**Tools:** 10 | **Coverage:** ✅ COMPLETE (85%)

**Tools Provided:**
- `onec_get_sales_with_lines` — sales document with line items (product, quantity, price, VAT)
- `onec_get_advance_settlement` — customer advance, matching to invoices
- `onec_search_documents` — search sales documents by contractor, date, amount, status
- `onec_validate_invoice_payment_matching` — match invoices to payments, identify unmatched
- `onec_drill_unpaid_payments` — drill unpaid invoices: aging, amount, customer
- `onec_drill_stale_advances` — drill stale customer advances not matched to revenue
- `onec_get_real_production_costs` — production cost impact on COGS (margin analysis)
- `onec_investigate_payment` — investigate payment: match to invoice, trace to GL
- `onec_find_duplicate_payments` — detect duplicate outgoing payments
- `onec_generate_act_sverki` — reconciliation act for a contractor

**Services:** DocumentService, RegisterService, InvestigationService, ReconciliationValidator, DocumentGeneratorService

**Drilling Tools:** ✅ unpaid_payments, stale_advances  
**Validation Tools:** ✅ invoice_payment_matching, advance_aging

**Gaps:**
!!!- No `sales_by_product`
!!!- No `sales_trend`
- No `customer_concentration`
!!!- No `gross_margin_analysis`

---

### 3. PURCHASES & SUPPLY CHAIN (Закупки)

**Tools:** 10 | **Coverage:** ✅ COMPLETE (85%)

**Tools Provided:**
- `onec_search_documents` — search purchase documents by supplier, date, amount
- `onec_get_contractor_settlements` — AP balance by supplier (AccumulationRegister)
- `onec_search_contractors` — find suppliers by name, contact, account type
- `onec_drill_unpaid_payments` — unpaid supplier invoices, aging by days overdue
- `onec_validate_invoice_payment_matching` — match POs/invoices to payments
- `onec_get_cogs_composition` — COGS breakdown by material, labor, overhead
- `onec_get_nomenclature_unit_cost` — unit cost of materials, average vs. actual
- `onec_get_supplier_performance` — purchases, returns, return rate
- `onec_get_spend_by_category` — procurement spend by nomenclature group
- `onec_get_supplier_concentration` — top-10 share + HHI index

**Services:** CatalogService, RegisterService, CostingService, SupplyChainAnalyticsService

**Drilling Tools:** ✅ unpaid_payments  
**Validation Tools:** ✅ invoice_payment_matching  
**Analytics Tools:** ✅ supplier_performance, spend_by_category, supplier_concentration

**Gaps:**
- No `lead_time_analytics` tool
!!!- No `commodity_analysis` tool
- No purchase order document type in standard 1C KZ

---

### 4. INVENTORY & WAREHOUSE (Товары & Склады)

**Tools:** 7 | **Coverage:** ✅ COMPLETE (90%)

**Tools Provided:**
- `onec_get_inventory_balance` — current stock levels (quantity + cost) by nomenclature, warehouse
- `onec_get_finished_goods_balance` — finished goods inventory by product
- `onec_get_materials_balance` — raw materials inventory by type
- `onec_get_stock_report` — stock summary report
- `onec_search_nomenclature` — find products by name, code, unit
- `onec_get_warehouses` — list warehouses (locations)
- Account breakdown tools for warehouse-based GL detail

**Services:** RegisterService, CatalogService, ProductionService

**Drilling Tools:** ✅ via account_breakdown (warehouse sub-account)

**Gaps:**
- No `obsolete_inventory` tool
!!!- No `inventory_turnover` tool
- No `slow_moving_analysis` tool
!!!- No `write_off_candidates` tool

---

### 5. FIXED ASSETS (Основные Средства — ОС)

**Tools:** 7 | **Coverage:** ✅ COMPLETE (90%)

**Tools Provided:**
- `onec_get_fixed_asset_register` — FA register vs GL 2410/2420 cross-check
- `onec_get_depreciation_schedule` — per-asset monthly amortization
- `onec_analyze_depreciation_impact` — P&L effect on 7210/8110
- `onec_get_impairment_indicators` — age > useful life flags
- `onec_get_disposal_candidates` — write-off candidates
- `onec_get_asset_location_audit` — catalog vs register location mismatch
- `onec_validate_fa_completeness` — register = GL balance check

**Services:** FixedAssetService, PeriodCloseValidator (`depreciation-completeness`)

**Drilling Tools:** ✅ depreciation_schedule, asset_location_audit  
**Validation Tools:** ✅ fa_completeness, depreciation_completeness

**Gaps:** No `asset_revaluation` tool; impairment is indicator-based only

---

### 6. INTANGIBLE ASSETS (НМА)

**Tools:** 2 | **Coverage:** ⚠️ PARTIAL (50%)

**Tools Provided:**
- `onec_get_nma_register` — NMA register with acquisition cost, useful life, net book value; cross-check vs GL 2700
- `onec_get_nma_amortization_schedule` — monthly amortization per asset from information register

**Services:** IntangibleAssetService

**Drilling Tools:** ✅ nma_amortization_schedule  
**Validation Tools:** ⚠️ via `depreciation-completeness` rule only

**Gaps:**
- No `nma_impairment_indicators`
- No `nma_disposal_candidates`
- No `nma_revaluation`

---

### 7. PAYROLL & HR (Зарплата)

**Tools:** 14 | **Coverage:** ✅ COMPLETE (85%)

**Tools Provided:**
- `onec_get_payroll_summary` — total accruals vs GL 3350
- `onec_drill_payroll_by_employee` — per-employee breakdown
- `onec_drill_payroll_by_department` — by org unit
- `onec_get_hr_transactions` — hires and dismissals
- `onec_get_benefit_accruals` — GL 3380 benefit liabilities
- `onec_analyze_payroll_variance` — month-over-month change
- `onec_get_headcount_analysis` — active FTE by department
- `onec_validate_salary_completeness` — roster vs payroll docs
- `onec_calculate_payroll_taxes` — payroll tax calculation (IPN, OPV, SO withholding)
- `onec_get_payroll_taxes_summary` — summary of all payroll taxes for period
- `onec_drill_payroll_tax` — drill into payroll tax detail by employee, tax type
- `onec_validate_payroll_deductions` — verify payroll deductions correct & complete
- `onec_validate_payroll_tax_rates` — verify tax rates comply with 2026 KZ rules
- `onec_validate_payroll_accrual_balance` — verify payroll accrual GL balance matches liability

**Services:** PayrollService, TaxValidator

**Drilling Tools:** ✅ payroll_by_employee, payroll_by_department, payroll_tax  
**Validation Tools:** ✅ payroll_deductions, payroll_tax_rates, payroll_accrual_balance, salary_completeness

**Gaps:** No dedicated `hiring_transaction` / `termination_transaction` posting tools (read-only via `hr_transactions`)

---

### 8. TAX COMPLIANCE (Налогообложение)

**Tools:** 16 | **Coverage:** ⚠️ PARTIAL (75%)

**Tools Provided:**
- `onec_get_vat_register` — VAT register (output, input, net position)
- `onec_drill_vat_documents` — drill VAT by rate, supplier/customer
- `onec_validate_vat_charged_vs_revenue` — verify output VAT matches sales
- `onec_validate_vat_recoverable_vs_purchases` — verify input VAT matches purchases
- `onec_drill_missing_esf` — find missing/unmatched ЭСФ (e-invoices)
- `onec_validate_esf_coverage` — verify all invoices have ЭСФ coverage
- `onec_get_esf_submission_status` — ЭСФ submission summary (submitted/rejected/pending)
- `onec_get_esf_errors` — rejected ЭСФ with error codes and messages
- `onec_get_esf_status` — legacy ЭСФ status snapshot
- `onec_get_ipn_summary` — IPN accrued/paid/outstanding vs GL 3110
- `onec_get_fund_remittance_status` — ОПВ/СО paid vs due
- `onec_get_tax_filing_checklist` — KZ statutory deadlines for a year
- `onec_validate_fund_remittance_timeliness` — overdue + penalty estimate
- `onec_calculate_payroll_taxes` — payroll tax calculation
- `onec_get_payroll_taxes_summary` — payroll tax summary
- `onec_get_kpn_estimate` — corporate income tax estimate

**Services:** TaxValidator, TaxFilingService, EsfService, RegisterService

**Drilling Tools:** ✅ vat_documents, missing_esf, payroll_tax  
**Validation Tools:** ✅ vat_charged, vat_recoverable, esf_coverage, fund_remittance_timeliness

**Gaps:**
!!!- No dedicated `social_tax_tracking` (СН) beyond payroll summary
!!!- No `ep_fund_remittance_status` (ЭП) or `il_fund_status` (alimony/benefits)
- No `tax_deduction_tracking` or `non_resident_tax_handling`
- КПН estimate only — no full corporate tax return builder

---

### 9. CASH MANAGEMENT (Кассовые Операции)

**Tools:** 10 | **Coverage:** ✅ COMPLETE (90%)

**Tools Provided:**
- `onec_get_cash_position` — 1010+1020+1030 consolidated snapshot
- `onec_drill_cash_by_account` — account card for any cash account
- `onec_get_bank_reconciliation_detail` — GL vs bank statement
- `onec_get_cash_flow_analysis` — inflows vs outflows for period
- `onec_get_payment_aging` — outgoing payments by age bucket
- `onec_analyze_cash_variance` — statistical outlier detection
- `onec_get_forex_position` — FX rates and currency exposure
- `onec_validate_cash_consistency` — no credit balances on cash accounts
- `onec_verify_account_balance` — verify cash account balance (accounts 1010, 1020)
- `onec_validate_bank_balance_consistency` — 1030 ≥ 0; flag unpaid posted payments

**Services:** CashManagementService, RegisterService, ReconciliationValidator

**Drilling Tools:** ✅ drill_cash_by_account, payment_aging  
**Validation Tools:** ✅ cash_consistency, bank_balance_consistency

!!!**Gaps:** Cash flow not split into operating/investing/financing (IAS 7 format)

---

### 10. PRODUCTION & MANUFACTURING (Производство)

**Tools:** 8 | **Coverage:** ✅ COMPLETE (85%)

**Tools Provided:**
- `onec_get_production_costs` — production costs by job, product, period
- `onec_get_real_production_costs` — actual production costs (vs. standard)
- `onec_get_cogs_composition` — COGS breakdown (materials, labor, overhead)
- `onec_validate_wip_closure` — verify WIP jobs properly closed at period-end
- `onec_drill_wip_documents` — drill into WIP documents, job status, completion %
- `onec_get_materials_balance` — material availability for production
- `onec_get_finished_goods_balance` — finished goods output
- Docflow tools for production workflow (task creation, approval, completion)

**Services:** ProductionService, CostingService, DocflowService

**Drilling Tools:** ✅ wip_documents  
**Validation Tools:** ✅ wip_closure, cogs_basis  
**Report Tools:** ✅ production_costs, cogs_composition

**Gaps:**
!!!- No `job_profitability` analysis
!!!- No `production_variance` analysis
!!!- No `labor_productivity` tracking
!!!- No `material_waste` analysis

---

### 11. CUSTOMS & FOREIGN TRADE (Таможня)

**Tools:** 2 | **Coverage:** ⚠️ PARTIAL (50%)

**Tools Provided:**
- `onec_get_import_summary` — GTD documents with landed cost breakdown
- `onec_calculate_landed_cost` — CIF + duty (HS code) + VAT 12%

**Services:** CustomsService

**Gaps:**
- No EAEU trade analytics
- No customs bond / guarantee tracking
- Tariff table is hardcoded top HS codes only

---

### 12. RECONCILIATION & CLOSING (Сверка)

**Tools:** 9 | **Coverage:** ⚠️ PARTIAL (70%)

**Tools Provided:**
- `onec_get_month_close_status` — closing checklist status, completed steps
- `onec_validate_period_close_readiness` — verify period ready to close
- `onec_audit_period_quality` — audit period for anomalies, missing data
- `onec_validate_double_entry` — verify Дт = Кт
- `onec_validate_balance_arithmetic` — verify GL balance calculations
- `onec_verify_opening_balances` — closing balance = next period opening
- `onec_validate_invoice_payment_matching` — AR/AP outstanding with aging
- `onec_validate_contract_terms_compliance` — expired contracts
- `onec_generate_act_sverki` — reconciliation act generation

**Services:** AuditorService, IntegrityValidator, PeriodCloseValidator, ReconciliationValidator, SetupAuditService

**Validation Tools:** ✅ period_close_readiness, double_entry, balance_arithmetic, opening_balances

**Gaps:**
!!!- No `inter_org_reconciliation` dedicated tool (partial via consolidation)
!!!- No `consolidation_eliminations` drill beyond calculation tool

---

### 13. ELECTRONIC DOCUMENTS (Электронные Документы)

**Tools:** 5 | **Coverage:** ⚠️ PARTIAL (55%)

**Tools Provided:**
- `onec_get_esf_submission_status` — ЭСФ submission summary by status
- `onec_get_esf_errors` — rejected ЭСФ with error codes
- `onec_get_esf_status` — legacy status snapshot
- `onec_drill_missing_esf` — find missing/unmatched ЭСФ documents
- `onec_validate_esf_coverage` — verify all invoices have ЭСФ coverage

**Services:** EsfService, TaxValidator, DocumentScannerService

**Drilling Tools:** ✅ missing_esf, esf_errors

**Gaps:**
!!!- No `eav_status` (ЭАВ — electronic act of work)
!!!- No `electronic_customs_documents`
!!!- No `signature_tracking` or `platform_submission_log`

---

### 14. INITIAL SETUP & MAINTENANCE (Начальные Настройки)

**Tools:** 2 | **Coverage:** ⚠️ PARTIAL (60%)

**Tools Provided:**
- `onec_audit_gl_account_mapping` — required KZ accounts present in chart
- `onec_verify_opening_balances` — closing balance = next period opening

**Services:** SetupAuditService

**Gaps:**
- No opening-balance import tool
- No configuration change audit trail

---

### 15. ASSET TRANSFERS & MOVEMENTS (Передача Активов)

**Tools:** 2 | **Coverage:** ⚠️ PARTIAL (50%)

**Tools Provided:**
- `onec_get_fa_transfers` — ОС inter-department/inter-org transfers (`Document_ПередачаОС`)
- `onec_get_nma_transfers` — NMA transfer documents (`Document_ПередачаНМА`)

**Services:** AssetTransferService

**Gaps:** No inter-branch consolidation of transfer impacts; read-only (no posting)

---

### 16. OTHER WORKFLOWS (Прочие)

**Tools:** 16 | **Coverage:** ⚠️ PARTIAL (55%)

**Tools Provided:**
- `onec_get_document` / `onec_create_document` / `onec_post_document` — document CRUD and posting
- `onec_search_documents` — cross-type document search
- `onec_get_contractor` / `onec_get_contractor_contracts` — contractor master data
- `onec_get_organizations` — multi-tenant org list
- Docflow suite (10 tools): status, tasks, overdue, create/complete task, documents, approval route, search
- `onec_generate_debt_certificate` / `onec_generate_creditors_report` / `onec_generate_obligation_notice`

**Services:** DocumentService, CatalogService, DocflowService, DocumentGeneratorService

**Gaps:**
- No `power_of_attorney` tool
- No `debt_correction` tool
- No `storno_entry` tool

---

### 17. BUDGET & FORECASTING (Бюджет)

**Tools:** 3 | **Coverage:** ⚠️ PARTIAL (70%)

**Tools Provided:**
- `onec_get_budget_vs_actual` — actuals vs budget register (stub fallback if register absent)
- `onec_forecast_year_end` — YTD extrapolation to December
- `onec_analyze_variance_drivers` — ranked contribution to total variance

**Services:** BudgetService

**Gaps:** Requires `InformationRegister_БюджетныеПоказатели` or custom budget catalog in 1C for real data

---

### 18. COST ACCOUNTING (Учёт Затрат)

**Tools:** 3 | **Coverage:** ⚠️ PARTIAL (60%)

**Tools Provided:**
- `onec_get_cost_center_summary` — expenses by department
- `onec_analyze_overhead_allocation` — GL 8410 split across cost centers
- `onec_get_departmental_profitability` — revenue/cost/margin per department

**Services:** CostCenterService

**Gaps:** Allocation uses equal-split; no driver-based method (headcount, machine hours, etc.)

---

### 19. CONSOLIDATION & MULTI-ENTITY (Консолидация)

**Tools:** 4 | **Coverage:** ⚠️ PARTIAL (60%)

**Tools Provided:**
- `onec_get_inter_org_transactions` — cross-entity sales detection
- `onec_calculate_consolidation_eliminations` — DR 6010 / CR 7010 elimination entries
- `onec_get_group_balance` — consolidated balance sheet across entities
- `onec_get_financial_summary` — group-level financial snapshot

**Services:** ConsolidationService, AnalyticsService

**Gaps:** No currency translation for foreign subsidiaries; eliminations are rule-based only

---

### 20. RELATED PARTY TRANSACTIONS (Связанные Стороны)

**Tools:** 2 | **Coverage:** ⚠️ PARTIAL (50%)

**Tools Provided:**
- `onec_identify_related_party_transactions` — IAS 24 RPT detection via `СвязаннаяСторона` flag
- `onec_validate_rpt_pricing` — price deviation from market tolerance

**Services:** RelatedPartyService

**Gaps:** Requires market price reference data in 1C for meaningful pricing validation

---

### 21. PROVISIONS & CONTINGENCIES (Резервы)

**Tools:** 2 | **Coverage:** ⚠️ PARTIAL (50%)

**Tools Provided:**
- `onec_get_provision_register` — provisions vs GL 3520/3530
- `onec_validate_provision_adequacy` — coverage % vs exposure

**Services:** ProvisionService

**Gaps:** No provision creation/posting tool; read-only register + validation

---

## Agent Infrastructure

Tools and data that help LLM agents route requests without guessing tool names.

### Tool Discovery

| Component | Location | Purpose |
|-----------|----------|---------|
| `onec_find_tool` | `tool-discovery.tools.ts` | **Call first** for any accounting task — searches 158 tools by keyword, GL account, entity, persona, domain |
| `tool-registry.json` | `apps/mcp/src/data/` | Generated index of all tools with metadata (domain, verb, keywords, drillsTo, persona) |
| `ToolDiscoveryService` | `packages/services/src/ToolDiscoveryService.ts` | Search logic backing `onec_find_tool` |

Regenerate after adding tools: `npm run build:registry` (runs `scripts/build-tool-registry.ts`).

### Named Workflows

| Component | Location | Purpose |
|-----------|----------|---------|
| `workflows.json` | `apps/mcp/src/data/` | 12 curated multi-step processes |
| `onec_search_workflow_catalog` | `workflow-catalog.tools.ts` | Full-text search of [one-c-workflows.md](./one-c-workflows.md) |

**Workflow IDs:** `month_close`, `vat_filing`, `payroll_close`, `year_end_reform`, `fa_audit`, `cash_audit`, `esf_compliance`, `ipn_filing`, `fund_remittance_check`, `ar_aging_review`, `ap_aging_review`, `consolidation_close`

`onec_find_tool` returns a matching workflow when the user query aligns with one of these catalogs.

### Chat Agent (Telegram)

`apps/mcp/src/chat-agent.ts` — conversational layer for the Telegram bot. Uses a subset of services (Catalog, Reports, Register, Document) via OpenAI-compatible `/chat/completions`. Does **not** expose the full 158-tool MCP surface; the MCP server (`server.ts`) is the complete interface.

---

## Tool Architecture Summary

### By Registry Domain (45 domains, 158 tools)

| Category | Domains | Tools | Examples |
|----------|---------|------:|----------|
| **Validation** | validation, validation-integrity, validation-tax, validation-period-close, validation-document, validation-reconciliation | 22 | `onec_validate` (22 ruleIds) + 21 dedicated validators |
| **Drill-down** | validation-drilldown | 8 | account_sign, vat_documents, wip_documents, missing_esf |
| **Docflow** | docflow | 10 | tasks, overdue, approval route, create/complete |
| **Domain — Cash** | cash | 8 | cash_position, bank_reconciliation, forex |
| **Domain — Payroll** | payroll | 8 | payroll_summary, headcount, hr_transactions |
| **Domain — Production** | production, costing | 11 | production_costs, cogs_composition, wip |
| **Domain — Fixed Assets** | fixed-asset | 7 | fa_register, depreciation_schedule, impairment |
| **Domain — Tax Filing** | tax-filing, esf | 6 | ipn_summary, fund_remittance, esf_errors |
| **Reports / Analytics** | analytics, reports, fullreport, generator, duediligence | 11 | financial_summary, pl_summary, act_sverki, full_report |
| **Auditor / Scan** | auditor, scan, anomaly-ml | 10 | audit_period_quality, scan_all, ml_scan_anomalies |
| **Infrastructure** | entity-schema, guid-resolver, accounts, metadata, tool-discovery, workflow-catalog | 15 | entity_schema, resolve_guid, kz_chart, find_tool |
| **Enterprise (new)** | budget, cost-center, consolidation, customs, related-party, provisions, supply-chain, setup-audit, intangible-asset, asset-transfer | 24 | budget_vs_actual, import_summary, nma_register |
| **Core CRUD** | catalog, document, register, investigation, stock | 19 | search_documents, get_contractor, account_card |

### Validation RuleIds (via `onec_validate`)

22 rules across 5 validator classes:
- **Integrity (4):** double-entry, account-signs, balance-arithmetic, extdimension
- **Tax (6):** vat-charged, vat-recoverable, esf-coverage, payroll-tax-rates, payroll-deductions, payroll-accrual-balance
- **Period-close (5):** period-close-readiness, accrual-alignment, depreciation-completeness, wip-closure, cogs-basis
- **Reconciliation (3):** invoice-payment-matching, contract-terms-compliance, bank-balance-consistency
- **Document (3):** line-totals, nomenclature-accounts, advance-aging

---

## Service Layer (33 Classes)

### Core / Infrastructure
- **MetadataService** — entity metadata, field discovery
- **CatalogService** — master data catalogs (contractors, nomenclature, warehouses)
- **EntitySchemaService** — entity schema introspection (889 entities from `Entities/`)
- **DocumentService** — document CRUD, posting, GL creation
- **GuidResolverService** — GUID ↔ name resolution
- **RegisterService** — register queries (VAT, inventory, settlements, account cards)
- **ReportsService** — 15+ standard reports (OSV, creditors, etc.)
- **AnalyticsService** — P&L, balance, consolidation
- **DocflowService** — workflow, task management, approvals
- **DocumentGeneratorService** — report & statement generation (act sverki, debt certificate)
- **InvestigationService** — payment investigation, drill downs
- **ToolDiscoveryService** — tool search and workflow matching

### Validation & Quality
- **IntegrityValidator** — double-entry, balance checks, account signs
- **TaxValidator** — VAT, payroll tax, ESF validation
- **PeriodCloseValidator** — period close readiness, WIP, COGS, depreciation
- **DocumentValidator** — line totals, nomenclature accounts, advance aging
- **ReconciliationValidator** — invoice/payment matching, contract terms, bank balance
- **DrillDownService** — shared drill-down queries (account sign, VAT, WIP, etc.)
- **DocumentScannerService** — document error scanning
- **AuditorService** — period quality audit, anomaly detection
- **AnomalyMLService** — ML-based anomaly detection and baselines
- **AlertService** — compliance & anomaly alerts (Telegram / webhook)

### Financial Domain Services
- **AccountAnalysisService** — universal GL analysis with risk detection
- **FixedAssetService** — FA lifecycle, depreciation, impairment indicators
- **CashManagementService** — cash position, bank rec, forex, cash flow
- **PayrollService** — salary accruals, HR transactions, headcount
- **SupplyChainAnalyticsService** — supplier performance, spend, concentration
- **TaxFilingService** — IPN, fund remittances, filing deadlines
- **ConsolidationService** — inter-org transactions, eliminations
- **BudgetService** — budget vs actual, forecast, variance drivers
- **CostCenterService** — cost center summary, overhead allocation, profitability
- **CustomsService** — GTD import summary, landed cost calculation
- **RelatedPartyService** — IAS 24 RPT identification and pricing validation
- **ProvisionService** — provision register and adequacy checks
- **IntangibleAssetService** — NMA register and amortization schedule
- **AssetTransferService** — FA and NMA transfer document queries
- **EsfService** — ЭСФ submission status and error details
- **SetupAuditService** — GL account mapping audit, opening balance verification

### Production / Costing
- **ProductionService** — WIP, job costing, payroll taxes, KPN estimate
- **CostingService** — COGS composition, unit cost, real production costs

---

## Coverage Comparison: Existing Tools vs. ONE_C_WORKFLOWS Prescriptions

| # | Domain | Tools | Coverage % | Status | Gap Analysis |
|---|--------|------:|----------:|--------|--------------|
| 1 | Financial Accounting | 18 | 95% | ✅ Complete | Reconciliation statement drill |
| 2 | Sales & Revenue | 10 | 85% | ✅ Complete | Sales trends, customer concentration |
| 3 | Production & Manufacturing | 8 | 85% | ✅ Complete | Variance, labor, material waste |
| 4 | Inventory & Warehouse | 7 | 90% | ✅ Complete | Turnover, slow-moving, obsolete |
| 5 | Cash Management | 10 | 90% | ✅ Complete | IAS 7 cash flow categories |
| 6 | Fixed Assets | 7 | 90% | ✅ Complete | Asset revaluation |
| 7 | Payroll & HR | 14 | 85% | ✅ Complete | Hiring/termination posting |
| 8 | Purchases & Supply Chain | 10 | 85% | ✅ Complete | Lead time, commodity analysis |
| 9 | Tax Compliance | 16 | 75% | ⚠️ Partial | СН depth, ЭП/ИЛ funds, КПН return |
| 10 | Budget & Forecasting | 3 | 70% | ⚠️ Partial | Needs budget register in 1C |
| 11 | Reconciliation & Closing | 9 | 70% | ⚠️ Partial | Inter-org rec drill |
| 12 | Cost Accounting | 3 | 60% | ⚠️ Partial | Driver-based allocation |
| 13 | Initial Setup | 2 | 60% | ⚠️ Partial | Opening balance import |
| 14 | Consolidation | 4 | 60% | ⚠️ Partial | Currency translation |
| 15 | Customs & Foreign Trade | 2 | 50% | ⚠️ Partial | EAEU, bonds, full tariff table |
| 16 | Related Party | 2 | 50% | ⚠️ Partial | Market price reference |
| 17 | Provisions | 2 | 50% | ⚠️ Partial | Provision posting |
| 18 | Electronic Documents | 5 | 55% | ⚠️ Partial | ЭАВ, e-customs, signatures |
| 19 | Other Workflows | 16 | 55% | ⚠️ Partial | Storno, debt correction |
| 20 | Intangible Assets | 2 | 50% | ⚠️ Partial | Impairment, disposal, revaluation |
| 21 | Asset Transfers | 2 | 50% | ⚠️ Partial | Transfer impact consolidation |
| | **TOTAL** | **158** | **~90%** | | |

\* Per-domain tool counts are indicative; many tools (search, validation, register) span multiple domains.

**Summary:**
- Fully Covered (9): Financial Accounting, Sales, Production, Inventory, Cash, Fixed Assets, Payroll, Purchases
- Partially Covered (12): Tax, Budget, Reconciliation, Cost Accounting, Setup, Consolidation, Customs, Related Party, Provisions, E-Docs, Other, Intangibles, Asset Transfers
- Missing (0): none at 0%

---

## Key Strengths

1. **Discovery-First Routing** — `onec_find_tool` + 12 named workflows reduce LLM guesswork across 158 tools
2. **Validation-First** — 22 ruleIds via `onec_validate` + 21 dedicated validators ensure data integrity
3. **Deep GL Analysis** — `onec_analyze_account` with risk detection; account card, breakdown, sign-based drilling
4. **Strong Reporting** — 20+ report generators including act sverki, creditors, full report dispatcher
5. **Docflow Integration** — complete 10-tool workflow/task management suite
6. **Production-Ready Costing** — job costing, WIP, COGS composition, real production costs
7. **Complete Cash & FA Suites** — 8 cash tools + 7 FA tools added in Phase 1
8. **Payroll Depth** — accruals, headcount, HR transactions, not just tax withholding
9. **Anomaly Detection** — ML-based scanning with baseline building
10. **Schema Introspection** — 889 entities offline in `Entities/`, field discovery, GUID resolution

---

## Top Gaps to Fill (Priority Order)

| Priority | Gap | Notes |
|----------|-----|-------|
| 1 | ЭАВ (electronic act of work) | ESF done; ЭАВ workflow not started |
| 2 | Sales analytics | sales_by_product, sales_trend, customer_concentration, gross_margin |
| 3 | Inventory analytics | turnover, slow-moving, obsolete, write-off candidates |
| 4 | Budget data source | `InformationRegister_БюджетныеПоказатели` or custom catalog required in 1C |
| 5 | RPT market pricing | needs reference prices in 1C for meaningful validation |
| 6 | NMA lifecycle depth | only register + schedule; missing impairment/disposal/revaluation |
| 7 | Corporate tax (КПН) | estimate exists; no full return builder or declaration checklist |
| 8 | Cost center allocation | equal-split only; needs driver-based method |
| 9 | Reconciliation drill | `generate_act_sverki` exists; dedicated statement detail tool still a gap |

---

## Recommendations

Phase 1–3 from [plan.md](./plan.md) is **largely complete** (46 tools shipped 2026-06-17; +13 more since: NMA, asset transfers, ESF service, tool discovery, workflow catalog). Focus shifts to depth and data dependencies:

**Near-term (depth over breadth):**
- ЭАВ tools (2) — mirror ESF pattern for electronic acts of work
- Sales analytics (3) — sales_by_product, sales_trend, customer_concentration
- Inventory analytics (3) — turnover, slow-moving, obsolete
- NMA lifecycle (3) — impairment, disposal, revaluation

**Data-dependent (blocked on 1C config):**
- Budget register import — wire `InformationRegister_БюджетныеПоказатели`
- RPT market prices — catalog or external reference feed
- Driver-based cost allocation — headcount or machine-hour drivers in 1C

**Maintenance:**
- Run `npm run build:registry` after every new tool module
- Keep `workflows.json` in sync when adding multi-step processes
- Update this document when domain coverage changes materially

---

## How to Use This Document

0. **Route first** — call `onec_find_tool` (or check `workflows.json`) before invoking domain tools
1. **Compare with [one-c-workflows.md](./one-c-workflows.md)** — see what's prescribed vs. what's built
2. **Find gaps** — use the Coverage Comparison table to prioritize
3. **Understand architecture** — review tool types, validators, and service layer
4. **Plan development** — follow Recommendations; historical build plan in [plan.md](./plan.md)
5. **Assess quality** — run validation tools (`onec_validate` or dedicated validators) on sample data
6. **Regenerate registry** — after adding tools: `npm run build:registry` in `MCP 1C v1/`
