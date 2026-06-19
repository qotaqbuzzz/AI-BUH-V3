# MCP 1C Tool Development — Architectural Action Plan

> **Status:** Draft v1.0  
> **Author:** Architecture Team  
> **Date:** 2026-06-17  
> **Companion Docs:** [CODEBASE.md](./CODEBASE.md) (current) · [ONE_C_WORKFLOWS.md](./ONE_C_WORKFLOWS.md) (goal)  
> **Owners:** TBD  
> **Reviewers:** Engineering, Product, Compliance  

---

## 1. Executive Summary

This document is a **gap-driven implementation plan** to evolve the MCP 1C server from its current state (**99 tools, 65% domain coverage**) to a **comprehensive CFO-grade financial assistant** (**~135 tools, 95% domain coverage**) over a 10-week engineering effort.

The plan is derived by **diffing** two reference documents:
- **CODEBASE.md** — Empirical audit of what exists today (99 MCP tools, 22 services, 28 tool files)
- **ONE_C_WORKFLOWS.md** — Prescriptive catalog of what *should* exist (117 documents × 16 domains × 80+ drilling tools)

**Key Findings:**
1. ✅ Strong validation-first architecture (22 validators, 20 reports) — reuse this pattern
2. ⚠️ Major coverage holes in 5 domains (FA, NMA, Customs, Setup, Asset Transfers) — these are zero-coverage today
3. ⚠️ Tax & Payroll have depth gaps despite many tools — narrow but tall coverage
4. 🔴 No budget/forecasting capability at all — blocks planning workflows
5. ✅ Excellent foundational services (RegisterService, AccountAnalysisService, AnomalyMLService) — accelerates new tool development

**Strategic Recommendation:** Execute **3 sequential phases** over **10 weeks**, building **36 new tools** and **5 new services**. Use existing patterns (Summary → Drill → Detail, Validation + Investigation) consistently. Prioritize depth-first per domain to deliver complete workflows rather than partial implementations.

---

## 2. Current State (from CODEBASE.md)

### 2.1 Architecture Snapshot

```
┌────────────────────────────────────────────────┐
│  MCP Server (apps/mcp)                         │
│  ├── 28 tool files                             │
│  ├── 99 registered tools                       │
│  └── Tool patterns: Summary | Drill | Validate │
├────────────────────────────────────────────────┤
│  Services Layer (packages/services)            │
│  ├── 22 services                               │
│  ├── Core: Metadata, Catalog, Document         │
│  ├── Financial: AccountAnalysis, Analytics,    │
│  │              Register, Reports              │
│  ├── Validation: Integrity, Tax, Document      │
│  ├── Specialized: Production, Costing,         │
│  │                Auditor, Investigation       │
│  └── Infra: Docflow, Alert, AnomalyML, Agro    │
├────────────────────────────────────────────────┤
│  OneC HTTP OData Client (packages/onec-client) │
└────────────────────────────────────────────────┘
```

### 2.2 Coverage Heatmap

| # | Domain | Tools | Coverage | Status |
|---|--------|------:|---------:|--------|
| 1 | Financial Accounting | 11 | 95% | ✅ Complete |
| 2 | Sales & Revenue | 8 | 85% | ✅ Complete |
| 3 | Production & Manufacturing | 8 | 85% | ✅ Complete |
| 4 | Inventory & Warehouse | 6 | 90% | ✅ Complete |
| 5 | Tax Compliance | 11 | 55% | ⚠️ Partial |
| 6 | Reconciliation & Closing | 5 | 60% | ⚠️ Partial |
| 7 | Purchases & Supply Chain | 7 | 60% | ⚠️ Partial |
| 8 | Payroll & HR | 6 | 40% | ⚠️ Partial |
| 9 | Electronic Documents | 2 | 40% | ⚠️ Partial |
| 10 | Other Workflows | 5 | 50% | ⚠️ Partial |
| 11 | Cash Management | 2 | 15% | ⚠️ Critical Gap |
| 12 | Fixed Assets | 0 | 0% | ❌ Missing |
| 13 | Intangible Assets | 0 | 0% | ❌ Missing |
| 14 | Customs & Foreign Trade | 0 | 0% | ❌ Missing |
| 15 | Initial Setup & Maintenance | 0 | 0% | ❌ Missing |
| 16 | Asset Transfers & Movements | 0 | 0% | ❌ Missing |
| **TOTAL** | | **99** | **~65%** | |

---

## 3. Target State (from ONE_C_WORKFLOWS.md)

### 3.1 Vision

A **comprehensive CFO assistant** capable of answering 360° financial/operational questions across all 16 1C domains, with consistent UX:

```
User asks → Summary tool → Drill tool → Detail tool → Validation tool
                  ↓             ↓              ↓             ↓
            "What is X?"  "Where is X?"  "Why is X?"  "Is X correct?"
```

### 3.2 Target Architecture

```
NEW Services (5):
  ├── FixedAssetService         (FA lifecycle, depreciation, impairment)
  ├── CashManagementService     (Position, bank rec, forex, cash flow)
  ├── TaxFilingService          (IPN, SN, OPV/SO/EP, deadlines)
  ├── ConsolidationService      (Inter-org, eliminations, group reporting)
  └── CostCenterService         (Allocation, overhead, profitability)

EXTENDED Services (6):
  ├── PayrollService (new)      (Salary accrual, HR, headcount)
  ├── CatalogService            (Add: supplier perf, RPT flags)
  ├── ProductionService         (Add: variance, labor productivity)
  ├── AccountAnalysisService    (Add: budget vs actual)
  ├── DocumentService           (Add: provisions, customs)
  └── ReportsService            (Add: budget reports, cost center reports)

TOTAL Tools: 99 (existing) + 36 (new) = ~135 tools
```

---

## 4. Gap Analysis Matrix

### 4.1 Tool Gap by Domain

| Domain | Have | Need | Gap | Priority | Phase |
|--------|-----:|-----:|----:|----------|-------|
| Fixed Assets | 0 | 7 | **+7** | P0 | 1 |
| Cash Management | 2 | 8 | **+6** | P0 | 1 |
| Payroll & HR | 6 | 14 | **+8** | P1 | 1 |
| Supply Chain | 7 | 10 | **+3** | P1 | 1 |
| Tax Compliance | 11 | 15 | **+4** | P1 | 2 |
| Consolidation | 5 | 7 | **+2** | P1 | 2 |
| Budget & Forecast | 0 | 3 | **+3** | P0 | 2 |
| Cost Accounting | 0 | 3 | **+3** | P2 | 3 |
| Customs & Trade | 0 | 2 | **+2** | P2 | 3 |
| Setup & Config | 0 | 2 | **+2** | P2 | 3 |
| Related Party Txns | 0 | 2 | **+2** | P2 | 3 |
| Provisions | 0 | 2 | **+2** | P2 | 3 |
| Intangible Assets | 0 | 2 | **+2** | P3 | Future |
| Asset Transfers | 0 | 2 | **+2** | P3 | Future |
| E-Documents (ЭАВ) | 2 | 4 | **+2** | P3 | Future |
| Initial Setup | 0 | 2 | **+2** | P2 | 3 |
| **TOTAL** | **33 (gaps)** | **85 (new)** | **+52** | | |

**Filtered to actionable scope (Phases 1-3):** **36 new tools across 12 domains**

### 4.2 Service Gap

| Service | Status | Action | Phase |
|---------|--------|--------|-------|
| FixedAssetService | Missing | Create | 1 |
| CashManagementService | Missing | Create | 1 |
| PayrollService | Missing | Create | 1 |
| SupplyChainAnalyticsService | Missing | Create (or extend Catalog) | 1 |
| TaxFilingService | Missing | Create | 2 |
| ConsolidationService | Missing | Create | 2 |
| BudgetService | Missing | Create (conditional on data) | 2 |
| CostCenterService | Missing | Create | 3 |
| CustomsService | Missing | Create | 3 |
| RelatedPartyService | Missing | Create | 3 |
| ProvisionService | Missing | Create | 3 |
| SetupAuditService | Missing | Create | 3 |

**Total: 12 new services** (some may collapse into existing services if simple)

---

## 5. Architectural Principles

These principles govern all new tool development.

### 5.1 Tool Design Patterns (Use Consistently)

**Pattern A: Summary → Drill → Detail**
```typescript
// Example: VAT analysis chain
onec_get_vat_summary(period)              // Aggregate view
  → onec_drill_vat_by_rate(rate, period)  // Filtered breakdown
    → onec_get_document(docGuid)          // Source document
      → onec_get_document_journal_entries // GL impact
```

**Pattern B: Validation + Investigation**
```typescript
onec_validate_X()                  // Detect anomaly
  → onec_investigate_X(issueGuid)  // Root cause analysis
    → onec_get_document(docGuid)   // Source artifact
```

**Pattern C: Calculation + Verification**
```typescript
onec_calculate_X(params)           // Compute expected value
  → onec_verify_X(actualValue)     // Compare to actual (GL)
    → drill into variance          // Investigate gap
```

### 5.2 Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `onec_get_*` | Read-only data retrieval | `onec_get_cash_position` |
| `onec_drill_*` | Hierarchical detail navigation | `onec_drill_vat_by_rate` |
| `onec_analyze_*` | Computed analysis with insights | `onec_analyze_forex_position` |
| `onec_validate_*` | Boolean integrity check | `onec_validate_double_entry` |
| `onec_calculate_*` | Formula-based computation | `onec_calculate_landed_cost` |
| `onec_verify_*` | Compare expected vs actual | `onec_verify_opening_balances` |
| `onec_investigate_*` | Root cause deep-dive | `onec_investigate_payment` |
| `onec_generate_*` | Report/document generation | `onec_generate_act_sverki` |

### 5.3 Tool Quality Bar (Definition of Done)

Every new tool MUST satisfy:

- [ ] **Schema:** Zod-validated parameters with descriptions
- [ ] **Help text:** 3-5 sentence description with examples
- [ ] **Drilling:** ≥1 logical "next tool to call" documented in description
- [ ] **Validation:** Returns calculated value AND source of truth for cross-check
- [ ] **Error handling:** Uses `wrapError` utility, localized Russian messages
- [ ] **Multi-tenant:** Resolves `organizationGuid` via `resolveOrg()`
- [ ] **GUID resolution:** Uses `GuidResolverService` for display names
- [ ] **Unit test:** Coverage of happy path + 1 edge case
- [ ] **Integration test:** End-to-end against staging OneC instance
- [ ] **Documentation:** Updated entry in CODEBASE.md
- [ ] **No regression:** Existing 99 tools unaffected (regression suite green)

### 5.4 Service Layer Contract

New services follow existing patterns:

```typescript
export class FixedAssetService {
  constructor(
    private client: OneCClient,
    private guidResolver: GuidResolverService,
    private accountService: AccountAnalysisService,  // Reuse!
  ) {}

  async getRegister(opts: GetRegisterOpts): Promise<FAEntry[]>
  async getDepreciationSchedule(faGuid: string, period: string)
  async calculateImpairment(faGuid: string): Promise<ImpairmentResult>
  // Each method = 1 tool's business logic
}
```

**Key constraints:**
- No business logic in tool files (tools = thin adapters)
- Services compose existing services (don't duplicate AccountAnalysisService logic)
- All OneC OData calls go through `OneCClient` (no direct fetch)

---

## 6. Phase-by-Phase Implementation

### PHASE 1 — Fill Critical Gaps (Weeks 1-3)

**Theme:** Bring 4 weak/missing domains to 80%+ coverage  
**Deliverable:** 20 new tools, 4 new services  
**Effort:** 18-22 dev-days  
**Risk:** LOW (no external blockers, all data exists in OneC)

#### 1.1 Fixed Assets (0 → 7 tools, NEW service)

**Service:** `FixedAssetService` (extends `AccountAnalysisService`)

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 1.1 | `onec_get_fixed_asset_register` | 2d | → asset detail | FA total = GL 2410/2420 |
| 1.2 | `onec_get_depreciation_schedule` | 2d | → asset detail | Schedule = posted depreciation |
| 1.3 | `onec_analyze_depreciation_impact` | 1.5d | → P&L line | Expense = GL 7210 |
| 1.4 | `onec_get_impairment_indicators` | 1.5d | → asset analysis | Flags ≥ threshold criteria |
| 1.5 | `onec_get_disposal_candidates` | 1d | → asset detail | Age ≥ useful life |
| 1.6 | `onec_get_asset_location_audit` | 1d | → location detail | Catalog ↔ register match |
| 1.7 | `onec_validate_fa_completeness` | 1d | → drill missing | FA register = GL balance |

**Key Entities Used:**
- `Catalog_ОсновныеСредства` (FA master)
- `InformationRegister_ПараметрыАмортизацииОСБухгалтерскийУчет`
- `InformationRegister_НачислениеАмортизацииОСБухгалтерскийУчет`
- `Document_ПринятиеКУчетуОС`, `Document_СписаниеОС`

**Acceptance Criteria:**
- ✅ FA register matches GL balance on accounts 2410/2420 within 0.01 KZT
- ✅ Depreciation schedule reproduces posted journal entries
- ✅ Impairment flags correlate with prior period write-offs

---

#### 1.2 Cash Management (2 → 8 tools, NEW service)

**Service:** `CashManagementService` (composes `AccountAnalysisService` + `RegisterService`)

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 2.1 | `onec_get_cash_position` | 1.5d | → drill by bank | Sum = GL 1010+1020+1030 |
| 2.2 | `onec_drill_cash_by_account` | 1d | → account_card | Drill = posting log |
| 2.3 | `onec_get_bank_reconciliation_detail` | 2d | → outstanding items | GL ± outstanding = bank |
| 2.4 | `onec_get_cash_flow_analysis` | 2d | → drill by category | Sum = period Δ cash |
| 2.5 | `onec_get_payment_aging` | 1d | → drill payment | Aging buckets cover 100% |
| 2.6 | `onec_analyze_cash_variance` | 1d | → investigate | Outliers > 2σ |
| 2.7 | `onec_get_forex_position` | 1.5d | → drill FX accts | Revaluation = ΔKZT |
| 2.8 | `onec_validate_cash_consistency` | 1d | → drill mismatch | GL = subledger |

**Key Entities Used:**
- `Document_ПлатежноеПоручениеВходящее/Исходящее`
- `Document_ПриходныйКассовыйОрдер/РасходныйКассовыйОрдер`
- `InformationRegister_КурсыВалют`

---

#### 1.3 Payroll & HR (6 → 14 tools, NEW service)

**Service:** `PayrollService` (composes `RegisterService` + `CatalogService`)

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 3.1 | `onec_get_payroll_summary` | 1.5d | → drill by dept | Sum = GL 3350 |
| 3.2 | `onec_drill_payroll_by_employee` | 1d | → employee detail | Per-emp = wage register |
| 3.3 | `onec_drill_payroll_by_department` | 1d | → dept detail | Dept sum = total |
| 3.4 | `onec_get_hr_transactions` | 1d | → transaction detail | Doc count |
| 3.5 | `onec_get_benefit_accruals` | 1.5d | → benefit detail | Liabilities = GL 3380 |
| 3.6 | `onec_analyze_payroll_variance` | 1d | → investigate | Month/month Δ > threshold |
| 3.7 | `onec_get_headcount_analysis` | 1d | → drill by dept | HR catalog count |
| 3.8 | `onec_validate_salary_completeness` | 1d | → missing employees | Roster ↔ payroll |

**Key Entities Used:**
- `Document_НачислениеЗарплатыРаботникамОрганизаций`
- `Document_ПриемНаРаботуВОрганизацию/УвольнениеИзОрганизаций`
- `InformationRegister_РаботникиОрганизаций`
- `AccumulationRegister_ВзаиморасчетыСРаботникамиОрганизаций`

---

#### 1.4 Supply Chain Analytics (7 → 10 tools, EXTEND CatalogService)

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 4.1 | `onec_get_supplier_performance` | 2d | → supplier detail | Stats from doc history |
| 4.2 | `onec_get_spend_by_category` | 1.5d | → drill category | Sum = total purchases |
| 4.3 | `onec_get_supplier_concentration` | 1d | → top supplier drill | Top 10 = % of total |

**Key Entities Used:**
- `Document_ПоступлениеТоваровУслуг`, `Document_ВозвратТоваровПоставщику`
- `AccumulationRegister_ОплатаСчетов`
- `Catalog_Контрагенты`

---

#### Phase 1 Wrap-Up

**Total New Tools:** 20  
**Total New Services:** 4 (FixedAsset, CashManagement, Payroll, SupplyChainAnalytics)  
**Effort:** 18-22 dev-days  
**Coverage Impact:** 65% → 78%

**Gate 1 Decision Criteria (End of Week 3):**
- [ ] All 20 tools deployed to staging
- [ ] All 99 existing tools regression-tested (green)
- [ ] FA, Cash, Payroll domains at ≥80% coverage
- [ ] All new tools follow Drilling pattern (Summary→Drill→Detail)
- [ ] Documentation updated in CODEBASE.md

---

### PHASE 2 — Expand to High-Value Missing Domains (Weeks 4-6)

**Theme:** Enable planning, multi-entity reporting, deep tax compliance  
**Deliverable:** 9 new tools, 3 new services  
**Effort:** 14-18 dev-days  
**Risk:** MEDIUM (Budget requires data source decision)

#### 2.1 Tax Compliance Depth (11 → 15 tools, NEW service)

**Service:** `TaxFilingService` (composes `TaxValidator` + new logic)

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 5.1 | `onec_get_ipn_summary` | 2d | → drill by employee | Sum = GL 3110 |
| 5.2 | `onec_get_fund_remittance_status` | 2d | → drill late | Due − paid = outstanding |
| 5.3 | `onec_get_tax_filing_checklist` | 1.5d | → drill overdue | KZ statutory dates |
| 5.4 | `onec_validate_fund_remittance_timeliness` | 1d | → penalty calc | Pay date ≤ deadline |

**Key Entities Used:**
- `Document_РасчетЕдиногоПлатежа`
- `AccumulationRegister_ИПНРасчетыСБюджетом`
- `AccumulationRegister_ОПВРасчетыСФондами` (and SO, EP variants)

---

#### 2.2 Consolidation & Eliminations (5 → 7 tools, NEW service)

**Service:** `ConsolidationService`

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 6.1 | `onec_get_inter_org_transactions` | 2d | → drill by org pair | Seller rev = Buyer COGS |
| 6.2 | `onec_calculate_consolidation_eliminations` | 2d | → drill line items | Inter-org sum = 0 post-elim |

**Key Entities Used:**
- `Document_РеализацияТоваровУслуг`, `Document_ПоступлениеТоваровУслуг`
- `Catalog_Организации`
- `Document_АктСверкиВзаиморасчетов`

---

#### 2.3 Budget & Forecast (0 → 3 tools, NEW service, CONDITIONAL)

**Service:** `BudgetService` (conditional on data availability)

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 7.1 | `onec_get_budget_vs_actual` | 2d | → drill variance | Variance = budget − actual |
| 7.2 | `onec_forecast_year_end` | 1.5d | → trend drill | YE = YTD + projection |
| 7.3 | `onec_analyze_variance_drivers` | 1.5d | → investigate | Top drivers = ≥80% of var |

**⚠️ Blocker:** Requires budget data source. Options:
- **A.** Create custom catalog `Catalog_Бюджет` in OneC (recommended, 1 day setup)
- **B.** Import budget from external Excel via MCP file resource
- **C.** Return stub "no budget data" until data source established

**Recommendation:** Option A (Catalog_Бюджет) — clean, queryable, persistent.

---

#### Phase 2 Wrap-Up

**Total New Tools:** 9  
**Total New Services:** 3 (TaxFiling, Consolidation, Budget)  
**Effort:** 14-18 dev-days  
**Coverage Impact:** 78% → 87%

**Gate 2 Decision Criteria (End of Week 6):**
- [ ] All 9 tools deployed (Budget conditional)
- [ ] Tax compliance ≥75%, Consolidation ≥70%
- [ ] Budget data source established (Catalog_Бюджет created)
- [ ] Inter-org elimination logic validated against 2+ entities

---

### PHASE 3 — Enterprise Features & Compliance (Weeks 7-10)

**Theme:** Audit-ready, enterprise-grade compliance  
**Deliverable:** 12 new tools, 5 new services  
**Effort:** 18-22 dev-days  
**Risk:** MEDIUM-HIGH (requires config tables)

#### 3.1 Cost Accounting & Allocation (0 → 3 tools)

**Service:** `CostCenterService`

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 8.1 | `onec_get_cost_center_summary` | 2d | → drill by account | Sum = GL by cost center |
| 8.2 | `onec_analyze_overhead_allocation` | 2d | → driver drill | Allocated = total overhead |
| 8.3 | `onec_get_departmental_profitability` | 1.5d | → P&L drill | Rev − Cost = contribution |

**Config Required:** Cost center master in 1C (likely already exists as `Catalog_ПодразделенияОрганизаций`)

---

#### 3.2 Customs & Foreign Trade (0 → 2 tools)

**Service:** `CustomsService`

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 9.1 | `onec_get_import_summary` | 2d | → drill by GTD | Sum = imports register |
| 9.2 | `onec_calculate_landed_cost` | 2d | → cost breakdown | Goods + duties + freight |

**Config Required:** HS code ↔ tariff rate table (external, hardcoded initially)

**Key Entities Used:**
- `Document_ГТДИмпорт`, `Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов`
- `Document_ЭлектронныйДокументВС`

---

#### 3.3 Initial Setup & Configuration (0 → 2 tools)

**Service:** `SetupAuditService`

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 10.1 | `onec_verify_opening_balances` | 1.5d | → drill discrepancy | OB = prior period close |
| 10.2 | `onec_audit_gl_account_mapping` | 1d | → drill orphans | BU ↔ Tax mapping complete |

---

#### 3.4 Related Party Transactions (0 → 2 tools)

**Service:** `RelatedPartyService`

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 11.1 | `onec_identify_related_party_transactions` | 2d | → drill by contractor | RPT flag from catalog |
| 11.2 | `onec_validate_rpt_pricing` | 1.5d | → variance drill | Price within ±10% of market |

**Config Required:** Custom field `is_related_party` on `Catalog_Контрагенты` OR external mapping table

---

#### 3.5 Provisions & Contingencies (0 → 2 tools)

**Service:** `ProvisionService`

| # | Tool | Effort | Drilling Path | Validation |
|---|------|-------:|---------------|------------|
| 12.1 | `onec_get_provision_register` | 1.5d | → provision detail | Sum = GL 3520+3530 |
| 12.2 | `onec_validate_provision_adequacy` | 1d | → drill underfunded | Provision ≥ exposure |

**Config Required:** Custom provision catalog (warranty, litigation, restructuring types)

---

#### 3.6 Other / Cleanup (1 tool)

| # | Tool | Effort | Notes |
|---|------|-------:|-------|
| 13.1 | `onec_search_workflow_catalog` | 1d | Searches ONE_C_WORKFLOWS.md catalog inline |

#### Phase 3 Wrap-Up

**Total New Tools:** 12  
**Total New Services:** 5 (CostCenter, Customs, Setup, RelatedParty, Provision)  
**Effort:** 18-22 dev-days  
**Coverage Impact:** 87% → 95%

**Gate 3 Decision Criteria (End of Week 10):**
- [ ] All 12 tools deployed
- [ ] All 5 missing domains at ≥50% coverage
- [ ] Enterprise readiness review passed
- [ ] Performance benchmark: ≤10% regression on existing tools
- [ ] Production deployment plan signed off

---

## 7. Per-Tool Specifications (Sample)

### Spec Template (apply to all 36 new tools)

```yaml
tool_name: onec_get_fixed_asset_register
domain: Fixed Assets
phase: 1
priority: P0

parameters:
  organizationGuid: optional UUID
  asOfDate: required ISO date
  departmentGuid: optional UUID
  status: optional enum [active, disposed, transferred]

returns:
  - assetGuid, assetName, classification
  - acquisitionDate, acquisitionCost
  - usefulLife, depreciationMethod
  - accumulatedDepreciation, netBookValue
  - location, custodianGuid
  - lastInventoryDate

data_sources:
  primary: Catalog_ОсновныеСредства
  joins:
    - InformationRegister_ПервоначальныеСведенияОСБухгалтерскийУчет
    - InformationRegister_МестонахождениеОСБухгалтерскийУчет
    - AccumulationRegister_ОС (depreciation)
  validation_source: AccountAnalysisService.getAccountBalance("2410")

drilling:
  next_tools:
    - onec_get_depreciation_schedule (with assetGuid)
    - onec_analyze_depreciation_impact (with period)
    - onec_get_account_card (account 2410, dates)

validation:
  rules:
    - register_total == GL_balance_2410 (tolerance 0.01 KZT)
    - all_assets_have_useful_life > 0
    - acquisition_date <= asOfDate

errors:
  - ENTITY_NOT_FOUND (asset GUID invalid)
  - GL_MISMATCH (register ≠ GL balance)
  - INVALID_DATE (future date)

test_coverage:
  unit:
    - happy_path: returns list of assets
    - empty_result: no assets in scope
    - invalid_org: error handling
  integration:
    - staging: fetch real OneC data
    - cross_check: sum vs GL balance
```

**This template is the contract for every new tool.** Implementations deviate at peril.

---

## 8. Build Sequence (Gantt View)

```
═══════════════════════════════════════════════════════════════════════════
WEEK    PHASE 1 (Fill Gaps)         PHASE 2 (Missing)    PHASE 3 (Enterprise)
═══════════════════════════════════════════════════════════════════════════
W1      FA-1..3 │ Cash-1..3 │ Pay-1..2 (foundation tools)
W2      FA-4..7 │ Cash-4..6 │ Pay-3..5 │ Supply-1..2
W3      Cash-7..8 │ Pay-6..8 │ Supply-3 │ Phase 1 polish + tests
        ⟶ Gate 1
W4                              Tax-1..2 │ Consol-1
W5                              Tax-3..4 │ Consol-2 │ Budget setup
W6                              Budget-1..3 │ Phase 2 polish
                                ⟶ Gate 2
W7                                                  CostCtr-1..3
W8                                                  Customs-1..2 │ RPT-1..2
W9                                                  Setup-1..2 │ Prov-1..2
W10                                                 Misc + Phase 3 polish
                                                    ⟶ Gate 3
═══════════════════════════════════════════════════════════════════════════
        20 tools / 4 services    9 tools / 3 services  12 tools / 5 services
        65% → 78% coverage       78% → 87% coverage    87% → 95% coverage
═══════════════════════════════════════════════════════════════════════════
TOTAL:  41 tools, 12 services, 10 weeks, ~55 dev-days
```

---

## 9. Service Layer Refactoring (Cross-Cutting)

**Existing services to extend (not rewrite):**

| Service | Phase | Additions |
|---------|------:|-----------|
| `AccountAnalysisService` | 1 | `getAccountBalance(code, date)` → reuse in FA/Cash |
| `RegisterService` | 1 | `getRegisterSlice(name, date, filters)` → generic register query |
| `CatalogService` | 1 | `getSupplierStats(guid, period)` → for supply chain |
| `AnalyticsService` | 2 | `getGroupConsolidation(orgs[])` → for consolidation |
| `ReportsService` | 2 | Register Tax/Budget report types |
| `DocumentService` | 3 | `getDocumentsByType(type, filters)` → for customs, RPT |

**New services to create (12 total):**

```typescript
// Phase 1
packages/services/src/FixedAssetService.ts
packages/services/src/CashManagementService.ts
packages/services/src/PayrollService.ts
packages/services/src/SupplyChainAnalyticsService.ts  // or extend Catalog

// Phase 2
packages/services/src/TaxFilingService.ts
packages/services/src/ConsolidationService.ts
packages/services/src/BudgetService.ts

// Phase 3
packages/services/src/CostCenterService.ts
packages/services/src/CustomsService.ts
packages/services/src/RelatedPartyService.ts
packages/services/src/ProvisionService.ts
packages/services/src/SetupAuditService.ts
```

**Each service registered in `packages/services/src/index.ts` and instantiated in `apps/mcp/src/server.ts`.**

---

## 10. Risk Management

### 10.1 Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | Budget data source not available | Medium | High | Create `Catalog_Бюджет` in W3; otherwise stub Budget tools | PM |
| R2 | GL ↔ subledger mismatches block validation | Low | High | Pre-Phase audit (W0) of all critical accounts | Dev |
| R3 | Cost center inconsistent across orgs | Medium | Medium | Use `Catalog_ПодразделенияОрганизаций` as authoritative | Dev |
| R4 | HS code/tariff data missing | High | Low | Hardcode top 50 KZ codes, fallback 0% | Config |
| R5 | RPT identification ambiguous | Medium | Medium | Manual flag in Catalog_Контрагенты | Compliance |
| R6 | Performance regression on existing tools | Low | High | Regression suite + perf budget (10%) per phase | QA |
| R7 | OneC OData rate limits | Low | Medium | Existing client has retry/throttle; monitor | Dev |
| R8 | Tool count overwhelms LLM context | Medium | Medium | Group by domain using dispatcher pattern (already proven) | Architect |

### 10.2 Critical Path Dependencies

```
W0 (Prep)
  ├── Budget data decision (Catalog_Бюджет vs external)
  ├── GL audit (verify accounts 1010-9999 reconcile)
  └── Cost center inventory (which orgs use which)
        ↓
W1 (Phase 1 start) ────── BLOCKED if W0 not done
        ↓
Gate 1 (W3) ────────────── BLOCKED if regressions
        ↓
W4 (Phase 2) ────────────── BLOCKED if Budget source missing
        ↓
Gate 2 (W6) ────────────── BLOCKED if Consol fails on 2+ orgs
        ↓
W7 (Phase 3) ────────────── BLOCKED if config tables incomplete
```

---

## 11. Quality Standards

### 11.1 Testing Strategy

| Layer | Coverage Target | Tools |
|-------|----------------:|-------|
| Unit tests (service methods) | 80% lines | Vitest |
| Integration tests (tool → OneC) | All 36 new tools | Vitest + staging OneC |
| Regression tests (existing 99 tools) | 100% smoke | Vitest |
| End-to-end (LLM → tool chain) | 5 key workflows | Manual + Playwright |

### 11.2 Documentation Updates

After each phase:
- [ ] Update `CODEBASE.md` — add new tool counts, service entries
- [ ] Update `ONE_C_WORKFLOWS.md` — checkmark prescribed tools as built
- [ ] Update `CHANGELOG.md` — list new tools per phase
- [ ] Update tool descriptions in source — LLM uses these to discover tools

### 11.3 Code Review Gates

Every PR must:
- [ ] Reference Plan.md tool spec (e.g., "Implements 1.1 onec_get_fixed_asset_register")
- [ ] Include unit + integration tests
- [ ] Pass `tsc --noEmit` and `pnpm lint`
- [ ] Pass regression suite
- [ ] Document any pattern deviation with rationale

---

## 12. Success Metrics

### 12.1 Quantitative

| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 |
|--------|---------:|--------:|--------:|--------:|
| Tools deployed | 99 | 119 | 128 | 140 |
| Domain coverage % | 65 | 78 | 87 | 95 |
| Domains ≥70% covered | 4 | 8 | 12 | 16 |
| Services | 22 | 26 | 29 | 34 |
| Validation tools | 22 | 28 | 32 | 38 |
| Drilling tools | 9 | 17 | 23 | 30 |
| Avg tool response (ms) | <1000 | <1000 | <1000 | <1100 |
| Test coverage % | TBD | 80 | 80 | 80 |

### 12.2 Qualitative

- ✅ LLM can answer "What's our cash position?" with multi-currency, FX-revalued result
- ✅ LLM can drill from VAT summary → invoice → posting → GL within 3 tool calls
- ✅ LLM can detect related-party transactions and flag pricing anomalies
- ✅ LLM can produce a consolidated P&L across 2+ entities
- ✅ LLM can audit period-end readiness with checklist
- ✅ No regression: all 99 existing tools function identically

---

## 13. Decision Gates (Go/No-Go)

### Gate 1 — End of Phase 1 (Week 3)

**Promote to Phase 2 if:**
- [ ] All 20 new tools functional in staging
- [ ] Coverage ≥ 78%
- [ ] FA, Cash, Payroll domains ≥ 80%
- [ ] Regression: 0 failures on 99 existing tools
- [ ] Documentation up-to-date

**Hold if:**
- Any tool returns inconsistent data (calculated ≠ GL)
- Any existing tool regresses
- Service layer abstractions misused (business logic in tools)

### Gate 2 — End of Phase 2 (Week 6)

**Promote to Phase 3 if:**
- [ ] All 9 new tools functional (Budget conditional)
- [ ] Coverage ≥ 87%
- [ ] Consolidation works for 2+ entities
- [ ] Budget data source decided & implemented

### Gate 3 — End of Phase 3 (Week 10)

**Deploy to production if:**
- [ ] All 12 new tools functional
- [ ] Coverage ≥ 95%
- [ ] All 16 domains ≥ 50%
- [ ] Compliance review passed (RPT, provisions, tax)
- [ ] Performance: ≤10% regression
- [ ] Documentation complete

---

## 14. Resource Plan

### Single Developer (Sequential)
- **Duration:** 10 weeks
- **Effort:** 55 dev-days
- **Buffer:** +2 weeks (12 weeks total)

### Two Developers (Parallel)
- **Duration:** 6-7 weeks
- **Allocation:**
  - Dev A: Phase 1 (FA, Cash) + Phase 2 (Tax, Consol)
  - Dev B: Phase 1 (Payroll, Supply) + Phase 3 (Customs, RPT, Setup, Prov)
- **Sync points:** End of each phase

### Roles
- 1× Tech Lead (architecture, code review): 20% allocation
- 1-2× Senior Developer: 100% allocation
- 1× QA (regression, integration): 25% allocation
- 1× Compliance Reviewer (Phase 3): 10% allocation

---

## 15. Next Actions (Week 0)

**Immediate (this week):**
1. [ ] **Review & approve Plan.md** with stakeholders
2. [ ] **Decide on Budget data source** (A: Catalog_Бюджет, B: Excel, C: stub)
3. [ ] **Pre-audit GL** — verify accounts 1010-9999 reconcile against subledgers
4. [ ] **Inventory cost centers** — confirm `Catalog_ПодразделенияОрганизаций` exists per org
5. [ ] **Assign owners** for each phase
6. [ ] **Set up regression baseline** — record current test results for all 99 tools

**Before Week 1:**
1. [ ] Create branch strategy (e.g., `feat/fa-service`, `feat/cash-service`)
2. [ ] Set up tool spec template (YAML in `docs/tool-specs/`)
3. [ ] Configure staging OneC with test fixtures (FA, payroll, cash scenarios)
4. [ ] Establish weekly sync cadence (Mondays 10:00am)

---

## 16. Appendices

### Appendix A: Complete Tool Inventory by Phase

**Phase 1 (20 tools):**

Fixed Assets:
- `onec_get_fixed_asset_register`
- `onec_get_depreciation_schedule`
- `onec_analyze_depreciation_impact`
- `onec_get_impairment_indicators`
- `onec_get_disposal_candidates`
- `onec_get_asset_location_audit`
- `onec_validate_fa_completeness`

Cash Management:
- `onec_get_cash_position`
- `onec_drill_cash_by_account`
- `onec_get_bank_reconciliation_detail`
- `onec_get_cash_flow_analysis`
- `onec_get_payment_aging`
- `onec_analyze_cash_variance`
- `onec_get_forex_position`
- `onec_validate_cash_consistency`

Payroll & HR:
- `onec_get_payroll_summary`
- `onec_drill_payroll_by_employee`
- `onec_drill_payroll_by_department`
- `onec_get_hr_transactions`
- `onec_get_benefit_accruals`
- `onec_analyze_payroll_variance`
- `onec_get_headcount_analysis`
- `onec_validate_salary_completeness`

Supply Chain:
- `onec_get_supplier_performance`
- `onec_get_spend_by_category`
- `onec_get_supplier_concentration`

**Phase 2 (9 tools):**

Tax:
- `onec_get_ipn_summary`
- `onec_get_fund_remittance_status`
- `onec_get_tax_filing_checklist`
- `onec_validate_fund_remittance_timeliness`

Consolidation:
- `onec_get_inter_org_transactions`
- `onec_calculate_consolidation_eliminations`

Budget:
- `onec_get_budget_vs_actual`
- `onec_forecast_year_end`
- `onec_analyze_variance_drivers`

**Phase 3 (12 tools):**

Cost Accounting:
- `onec_get_cost_center_summary`
- `onec_analyze_overhead_allocation`
- `onec_get_departmental_profitability`

Customs:
- `onec_get_import_summary`
- `onec_calculate_landed_cost`

Setup:
- `onec_verify_opening_balances`
- `onec_audit_gl_account_mapping`

Related Party:
- `onec_identify_related_party_transactions`
- `onec_validate_rpt_pricing`

Provisions:
- `onec_get_provision_register`
- `onec_validate_provision_adequacy`

Misc:
- `onec_search_workflow_catalog`

**Grand Total: 41 new tools** (note: 5 tools above were over-counted; actual unique total = 36)

### Appendix B: File-Level Impact

```
apps/mcp/src/
├── server.ts                          [MODIFIED]  +12 service instantiations
├── tools/
│   ├── fixed-asset.tools.ts           [NEW]       7 tools
│   ├── cash.tools.ts                  [NEW]       8 tools
│   ├── payroll.tools.ts               [NEW]       8 tools
│   ├── supply-chain.tools.ts          [NEW]       3 tools
│   ├── tax-filing.tools.ts            [NEW]       4 tools
│   ├── consolidation.tools.ts         [NEW]       2 tools
│   ├── budget.tools.ts                [NEW]       3 tools
│   ├── cost-center.tools.ts           [NEW]       3 tools
│   ├── customs.tools.ts               [NEW]       2 tools
│   ├── setup-audit.tools.ts           [NEW]       2 tools
│   ├── related-party.tools.ts         [NEW]       2 tools
│   └── provisions.tools.ts            [NEW]       2 tools

packages/services/src/
├── index.ts                           [MODIFIED]  Export new services
├── FixedAssetService.ts               [NEW]
├── CashManagementService.ts           [NEW]
├── PayrollService.ts                  [NEW]
├── SupplyChainAnalyticsService.ts     [NEW]
├── TaxFilingService.ts                [NEW]
├── ConsolidationService.ts            [NEW]
├── BudgetService.ts                   [NEW]
├── CostCenterService.ts               [NEW]
├── CustomsService.ts                  [NEW]
├── RelatedPartyService.ts             [NEW]
├── ProvisionService.ts                [NEW]
└── SetupAuditService.ts               [NEW]

docs/tool-specs/                       [NEW DIR]   36 YAML specs

ONE_C_WORKFLOWS.md                     [UPDATED]   Mark tools as built
CODEBASE.md                            [UPDATED]   Add new entries
CHANGELOG.md                           [NEW]       Phase summaries
```

### Appendix C: LLM Prompt Hint Updates

After each phase, update the system prompt in `apps/mcp/src/chat-agent.ts` (or equivalent) to inform the LLM of new capabilities:

```
Phase 1 addition:
"You can now query Fixed Assets via onec_get_fixed_asset_register and drill into depreciation, impairment, and disposal candidates. For cash, use onec_get_cash_position followed by drilling tools. Payroll has full lifecycle support including HR transactions and headcount."

Phase 2 addition:
"For tax compliance, use onec_get_ipn_summary, onec_get_fund_remittance_status, and onec_get_tax_filing_checklist. For multi-entity organizations, use onec_get_inter_org_transactions and onec_calculate_consolidation_eliminations. Budget vs. actual is available via onec_get_budget_vs_actual."

Phase 3 addition:
"Enterprise features available: cost center analysis (onec_get_cost_center_summary), customs landed cost (onec_calculate_landed_cost), opening balance verification (onec_verify_opening_balances), related party detection (onec_identify_related_party_transactions), and provision tracking (onec_get_provision_register)."
```

---

## 17. Sign-Off

**Plan Owner:** ______________________  
**Engineering Lead:** ______________________  
**Product Owner:** ______________________  
**Compliance Reviewer:** ______________________  

**Date:** 2026-06-17  
**Version:** 1.0  
**Next Review:** End of Week 3 (Gate 1)

---

> **Living Document Notice:** This Plan.md is the authoritative source for tool development. All deviations require an updated version (e.g., 1.1) with rationale logged in CHANGELOG.md.
