# 1C Kazakhstan Workflows Catalog

Complete reference of all 117+ main workflows (documents, registers, catalogs) available in the 1C accounting system, organized by business domain.

**Last Updated:** 2026-06-17  
**System:** 1C v8 Kazakhstan Accounting (Multi-tenant OData)  
**Total Documents:** 117 main types + 306 subtables = 423 total  
**Total Registers:** 48 accumulation + 121 information + 2 accounting = 171 total  
**Total Catalogs:** 271  

---

## Navigation

- [1. FINANCIAL ACCOUNTING (Бухгалтерский Учёт)](#1-financial-accounting)
- [2. SALES & REVENUE (Продажи)](#2-sales--revenue)
- [3. PURCHASES & SUPPLY CHAIN (Закупки)](#3-purchases--supply-chain)
- [4. INVENTORY & WAREHOUSE (Товары & Склады)](#4-inventory--warehouse)
- [5. FIXED ASSETS (Основные Средства - ОС)](#5-fixed-assets)
- [6. INTANGIBLE ASSETS (НМА)](#6-intangible-assets)
- [7. PAYROLL & HR (Зарплата)](#7-payroll--hr)
- [8. TAX COMPLIANCE (Налогообложение)](#8-tax-compliance)
- [9. CASH MANAGEMENT (Кассовые Операции)](#9-cash-management)
- [10. PRODUCTION & MANUFACTURING (Производство)](#10-production--manufacturing)
- [11. CUSTOMS & FOREIGN TRADE (Таможня)](#11-customs--foreign-trade)
- [12. RECONCILIATION & CLOSING (Сверка)](#12-reconciliation--closing)
- [13. ELECTRONIC DOCUMENTS (Электронные Документы)](#13-electronic-documents)
- [14. INITIAL SETUP & MAINTENANCE (Начальные Настройки)](#14-initial-setup--maintenance)
- [15. ASSET TRANSFERS & MOVEMENTS (Передача Активов)](#15-asset-transfers--movements)
- [16. OTHER WORKFLOWS (Прочие)](#16-other-workflows)

---

## Coverage Analysis & Tool Development Priorities

**Current Status:** 8 domains fully covered + 3 partially covered + 8 missing/underexplored

### Fully Covered Domains (Ready for Tool Building)
✅ **Financial Accounting** — GL entries, reconciliation (Docs: 3, Registers: 2)  
✅ **Sales & Revenue** — Invoicing, returns, advances (Docs: 5, Registers: 3)  
✅ **Purchases & Supply Chain** — Purchase orders, receipts, payables (Docs: 5, Registers: 3)  
✅ **Inventory & Warehouse** — Stock movements, counts, write-offs (Docs: 5, Registers: 3)  
✅ **Fixed Assets** — Lifecycle, depreciation, revaluation, disposals (Docs: 8, Registers: 5)  
✅ **Payroll & HR** — Salary, deductions, hiring/termination, benefits (Docs: 11, Registers: 8)  
✅ **Tax Compliance** — VAT, IPN, SN, OPV, SO, EP, IL, customs duties (Docs: 20+, Registers: 15+)  
✅ **Cash Management** — Bank transfers, cash disbursement, card payments (Docs: 6, Registers: 2)  

### Partially Covered Domains (Gaps in Tools/Analytics)
⚠️ **Production & Manufacturing** — WIP tracking exists (ДвижениеНЗП), but missing: cost center allocation, job costing, variance analysis, resource utilization  
⚠️ **Supply Chain** — No PO document type; missing: supplier performance, lead time analytics, spend analysis by category  
⚠️ **Advance Management** — Confusing dual-purpose document (АвансовыйОтчет covers customer advance + employee expense); missing: advance aging, matching to invoice  

### Missing/Underexplored Domains (No Documents, High CFO Value)
❌ **Budget & Forecasting** (Docs: 0) — No budget entry/tracking; blocks "budget vs. actual" workflow  
❌ **Cost Accounting & Allocation** (Docs: 1 partial) — No cost center master; missing: overhead allocation, profitability by center  
❌ **Consolidation & Eliminations** (Docs: 1 partial) — No group consolidation; missing: inter-org revenue elimination, currency translation  
❌ **Related Party Transactions** (Docs: 0) — No RPT identification; missing: pricing audit, governance workflow, IFRS disclosure  
❌ **Provisions & Contingencies** (Docs: 0) — No warranty/litigation tracking; missing: provision models, adequacy testing  
❌ **Revenue Recognition** (Docs: 1 partial) — Advance-to-invoice only; missing: long-term contracts, percentage-of-completion, deferred revenue  
❌ **Management Reporting & KPIs** (Docs: 0) — No ratio/trend analysis; missing: profitability by cost center, cash conversion cycle, executive dashboards  
❌ **Transfer Pricing** (Docs: 0) — No inter-org pricing; missing: cost-plus analysis, market-rate lookup, tax documentation  

---

## Recommended Tool Development Roadmap

### PHASE 1: Depth-First on Accounting (Months 1-2)
**Focus:** Build comprehensive tools for the 10 core accounting workflows you identified

| # | Workflow | Status | Priority | Dependencies |
|---|----------|--------|----------|--------------|
| 1 | Monthly VAT Management | ✅ Covered | HIGH | Start here; foundation for tax tools |
| 2 | Currency Revaluation | ✅ Covered | HIGH | Need exchange rate service |
| 3 | Social Tax & Pension | ✅ Covered | HIGH | Foundation for payroll tools |
| 4 | Receivables Aging | ✅ Covered | HIGH | Start with AR queries |
| 5 | Advance vs. Invoice Matching | ⚠️ Partially | HIGH | Tool needed: advance reconciliation |
| 6 | Bank Reconciliation | ✅ Covered | HIGH | Tool needed: outstanding item tracking |
| 7 | Expense Reports | ⚠️ Partially | MEDIUM | Tool needed: advance reimbursement |
| 8 | Fixed Asset Register | ✅ Covered | HIGH | Start here; straightforward |
| 9 | Budget vs. Actual | ❌ Missing | HIGH | **BLOCKER** — needs budget framework |
| 10 | Year-End Closing | ✅ Covered | MEDIUM | Depends on workflows 1-8 |

**Action for Phase 1:** Build 15-20 primitive tools covering the 8 well-covered domains. Create tool framework for advance matching (workflow #5) and expense reimbursement (workflow #7). **Defer budget tool** until Phase 2.

### PHASE 2: Expand to High-Value Domains (Months 3-4)
**Focus:** Add critical CFO workflows that are currently missing

**TIER 1 (Must-Have — unlock major decision-making):**
1. **Budget & Forecast Management** ⭐⭐⭐⭐⭐ — Unlocks financial planning, forecasting, variance analysis
2. **Cost Accounting & Cost Center Analysis** ⭐⭐⭐⭐⭐ — Unlocks departmental profitability, overhead allocation (critical for manufacturing)
3. **Consolidation & Eliminations** ⭐⭐⭐⭐ — Unlocks group-level reporting (critical for multi-entity orgs)

**TIER 2 (Should-Have — compliance & accuracy):**
4. **Related Party Transactions** ⭐⭐⭐⭐ — IFRS disclosure, audit requirement
5. **Provisions & Contingencies** ⭐⭐⭐⭐ — Accounting completeness, fair value reporting
6. **Revenue Recognition (Long-term contracts)** ⭐⭐⭐⭐ — IFRS 15 compliance
7. **Production Costing Detail** ⭐⭐⭐⭐ — Job profitability, WIP aging, variance analysis (if manufacturing)
8. **Supply Chain Analytics** ⭐⭐⭐ — Supplier performance, spend analysis

---

## Choosing Your Path

**Option A: Stick with Phase 1 (Original 10 Workflows)**
- Scope: 8 well-covered domains + 2 partial domain tools
- Timeline: 4-6 weeks to build all tools
- Outcome: Solid accounting/financial analysis suite
- Gap: No budget, no consolidation, no cost analysis
- Best for: Single-entity service/trading companies

**Option B: Expand to Phase 1 + Phase 2 Tier 1 (13 Workflows)**
- Scope: 8 + 3 new domains (budget, cost accounting, consolidation)
- Timeline: 8-10 weeks
- Outcome: Comprehensive CFO assistant (true 360° accounting)
- Gap: Still missing audit/compliance domains (Phase 2 Tier 2)
- Best for: Manufacturing or multi-entity organizations

**Option C: Full Coverage (Phase 1 + Phase 2 Tiers 1 & 2)**
- Scope: All 16 domains covered
- Timeline: 12-16 weeks
- Outcome: Enterprise-grade financial analytics and compliance
- Gap: None—comprehensive system
- Best for: Large organizations, audit-critical environments

---

## Notes for LLM Integration

1. **Use this catalog to:** Understand what domains are available and their maturity level
2. **Use ONE_C_WORKFLOWS.md for:** Finding the exact document/register names before building tools
3. **Phase 1 focus:** Build tools only for the 8 ✅ covered domains + 2 partial domain gaps
4. **Phase 2 readiness:** After Phase 1 is live, assess user feedback to prioritize Phase 2 domains
5. **Primitive tool strategy:** Build 15-20 small, composable tools rather than 50+ specialized tools (per prior session recommendation)

## 1. FINANCIAL ACCOUNTING (Бухгалтерский Учёт)

**Purpose:** Core GL, journal entries, account management, reconciliation statements.

**Drilling Tools (Recommended MCP Tools for LLM):**
- `onec_get_gl_summary(period?, organizationGuid?)` — GL balance by account, period-over-period comparison
- `onec_drill_gl_by_account(accountGuid, dateFrom?, dateTo?)` — Transactions for one GL account
- `onec_drill_gl_by_department(departmentGuid?, period?)` — GL activity by cost center/department
- `onec_get_reconciliation_statement(contractor/org?, status?)` — Disputes, unmatched items
- `onec_get_journal_entries(status?, postedDate?, createdBy?)` — Manual GL entries, audit trail
- `onec_analyze_gl_variance(account, period, threshold?)` — Unusual transactions, outliers

### 1.1 General Journal & GL Entry
- **Document_ОперацияБух** — Manual journal entry / GL operation
  - Use for: Adjustments, corrections, inter-account transfers
  - Fields: GL account pairs (Дт/Кт), amount, description, posting flag

### 1.2 Accounting Registers (Регистры)
- **AccountingRegister_ОперацииУчета** — Main accounting register (Дт/Кт entries)
- **AccountingRegister_ДополнительныеСведения** — Supplementary accounting info
  - Tracks: All posted GL transactions, dates, amounts, documents

### 1.3 Reconciliation & Statements
- **Document_АктСверкиВзаиморасчетов** — Reconciliation statement with contractors/customers
  - Subtables: ПоДаннымКонтрагента, ПоДаннымОрганизации, СписокОрганизаций, СписокСчетов
  - Use for: AR/AP aging, dispute identification
- **Document_ЗакрытиеДтКтЗадолженности** — Debt/obligation closing (mark resolved)
  - Subtable: Задолженность (debt items to close)

### 1.4 Inter-organizational Accounting
- **Information Register_ОсновныеДоговорыКонтрагента** — Contractor's primary contracts
- **Information Register_ОтветственныеЛицаОрганизаций** — Responsible persons by org

---

## 2. SALES & REVENUE (Продажи)

**Purpose:** Customer invoicing, revenue recognition, sales analysis.

**Drilling Tools:**
- `onec_get_sales_summary(period?, customerGuid?)` — Total revenue, unit sales, top products
- `onec_drill_sales_by_customer(dateFrom?, dateTo?, threshold?)` — Sales by customer, aging
- `onec_drill_sales_by_product(productGuid?, period?)` — Revenue by product/SKU, trends
- `onec_get_ar_aging(asOfDate?)` — Outstanding invoices by customer, days overdue
- `onec_get_advance_status(customerGuid?, status?)` — Unmatched customer advances, liability
- `onec_get_sales_returns(period?)` — Return rate, return reason analysis, refunds
- `onec_calculate_cogs(period?)` — Cost of goods sold, gross margin by product

### 2.1 Sales Invoicing
- **Document_СчетНаОплатуПокупателю** — Bill/invoice TO customer
  - Subtables: Товары, Услуги, ОС, НМА (goods/services/assets billed)
  - Use for: Revenue recognition, customer billing
- **Document_СчетФактураВыданный** — Tax invoice ISSUED (mandatory for VAT, Kazakhstan)
  - Subtables: Товары, Услуги, ОС, НМА, ДокументыОснования, ДатыПересеченияГраницы, НомераГТД
  - Use for: VAT filing, tax compliance, electronic reporting

### 2.2 Sales Transactions
- **Document_РеализацияТоваровУслуг** — Sale of goods/services (main sales order)
  - Use for: Recording revenue, COGS, inventory deduction
- **Document_РеализацияУслугПоПереработке** — Sale of processing/subcontracting services
  - Use for: Revenue from toll manufacturing

### 2.3 Sales Returns & Reversals
- **Document_ВозвратТоваровОтПокупателя** — Customer return (goods sent back)
  - Subtables: Товары, Услуги, ОС, НМА, НомераГТД
  - Use for: Reverse revenue, refunds, inventory adjustments

### 2.4 Customer Advance & Deposits
- **Document_АвансовыйОтчет** — Advance / cash accountability report
  - Subtables: ВыданныеАвансы, Товары, ОплатаПоставщикам, etc.
  - Use for: Advance received from customer, advance spent by employee
  - Related: Зерноваяraspiskaotchyot (grain certificate receipts)

### 2.5 Sales Analysis & Reports (via Registers)
- **AccumulationRegister_РеализацияТМЗ** — Sales register (goods/materials sold, COGS)
- **Information Register_СведенияСчетовФактурВыданных** — Issued invoice registry (VAT tracking)

---

## 3. PURCHASES & SUPPLY CHAIN (Закупки)

**Purpose:** Vendor invoicing, PO management, receipt tracking, payables.

**Drilling Tools:**
- `onec_get_purchase_summary(period?, supplierGuid?)` — Total purchases, unit COGS, top suppliers
- `onec_drill_purchases_by_supplier(dateFrom?, dateTo?, threshold?)` — Spend by supplier, concentration
- `onec_drill_purchases_by_category(categoryGuid?, period?)` — Spend by commodity/category
- `onec_get_ap_aging(asOfDate?)` — Outstanding invoices by supplier, days overdue, payment terms
- `onec_get_advance_to_supplier(supplierGuid?, status?)` — Unmatched supplier advances
- `onec_get_purchase_returns(period?)` — Return rate, reasons, credits
- `onec_get_supplier_performance(supplierGuid?, metrics?)` — On-time delivery, defect rate, lead time

### 3.1 Purchase Invoicing
- **Document_СчетНаОплатуПоставщика** — Bill/invoice FROM supplier
  - Subtables: Товары, Услуги, ОС, НМА
  - Use for: AP recognition, expense accrual
- **Document_СчетФактураПолученный** — Tax invoice RECEIVED (for VAT input credit)
  - Subtables: Товары, Услуги, ОС, НМА, ДокументыОснования, НомераГТД
  - Use for: VAT input credit, tax compliance

### 3.2 Goods Receipt & Acceptance
- **Document_ПоступлениеТоваровУслуг** — Receipt of goods/services (main PO receipt)
  - Use for: COGS, inventory in, payables accrual
- **Document_ОприходованиеТоваров** — Goods receipt & inventory increase
  - Use for: Stock additions, purchases, adjustments

### 3.3 Purchase Returns & Reversals
- **Document_ВозвратТоваровПоставщику** — Return to supplier (goods sent back)
  - Subtables: Товары, Услуги, ОС, НМА
  - Use for: Reverse purchase, reduce AP, inventory adjustment

### 3.4 Supplier Advance & Deposits
- **Document_АвансовыйОтчет** (same as sales, but for supplier context)
  - Use for: Advance paid to supplier, pending liability

### 3.5 Purchase Analysis & Reports
- **AccumulationRegister_ОплатаСчетов** — AP aging register (payment tracking)
- **Information Register_СведенияСчетовФактурПолученных** — Received invoice registry (VAT input)
- **Information Register_ОсновныеВиртуальныеСкладыКонтрагентов** — Supplier's virtual warehouse defaults

---

## 4. INVENTORY & WAREHOUSE (Товары & Склады)

**Purpose:** Stock movements, inventory levels, warehouse transfers, write-offs.

**Drilling Tools:**
- `onec_get_inventory_snapshot(warehouseGuid?, asOfDate?)` — Current stock levels by location
- `onec_drill_inventory_by_product(productGuid?, warehouseGuid?)` — Stock aging, slow-moving items
- `onec_get_inventory_variance(period?, warehouseGuid?)` — Counts vs. system, shrinkage, discrepancies
- `onec_get_obsolete_inventory(ageThreshold?, threshold?)` — Dead stock, write-off candidates
- `onec_get_stock_movements(warehouseGuid?, period?)` — Inbound/outbound, transfers, utilization
- `onec_analyze_inventory_cost(period?)` — COGS by product, valuation method impact
- `onec_get_inventory_turnover(productGuid?, period?)` — Days on hand, reorder frequency

### 4.1 Stock Transfers & Movements
- **Document_ПеремещениеТоваров** — Stock movement between warehouses/locations
  - Use for: Intra-warehouse transfers, location changes, stock reclass
- **Document_ТребованиеНакладная** — Material requisition / delivery note
  - Subtables: Материалы, МатериалыЗаказчика, НомераГТД, ИнвентаризационнаяКомиссия
  - Use for: Internal goods requests, production material allocation

### 4.2 Physical Inventory
- **Document_ИнвентаризацияТоваровНаСкладе** — Physical inventory count
  - Subtables: ИнвентаризационнаяКомиссия (count commission)
  - Use for: Cycle counts, period-end inventory verification, discrepancy identification

### 4.3 Stock Adjustments & Write-offs
- **Document_СписаниеТоваров** — Write-off / stock disposal
  - Subtables: Товары, НомераГТД, ИнвентаризационнаяКомиссия
  - Use for: Obsolete inventory, damaged goods, theft/loss, spoilage

### 4.4 Assembly & Kitting
- **Document_КомплектацияНоменклатуры** — Assembly of components into finished good
  - Use for: Kit assembly, finished good creation from components

### 4.5 Virtual Warehouse Management
- **AccumulationRegister_ТоварыНаВиртуальныхСкладах** — Virtual warehouse stock levels
- **AccumulationRegister_ТоварыВиртуальногоСкладаВРезерве** — Virtual warehouse reserved stock
- **AccumulationRegister_ТоварыОрганизацийБУ** — Organization stock (general BU tracking)

---

## 5. FIXED ASSETS (Основные Средства - ОС)

**Purpose:** Asset lifecycle, depreciation, revaluation, disposals, transfers.

**Drilling Tools:**
- `onec_get_fixed_asset_register(asOfDate?, departmentGuid?)` — Asset inventory, book value, net value
- `onec_drill_assets_by_class(assetClassGuid?, status?)` — Assets by type (building, vehicle, equipment)
- `onec_get_depreciation_schedule(assetGuid?, period?)` — Accumulated depreciation, useful life remaining
- `onec_analyze_depreciation_impact(period?, method?)` — Depreciation expense by method, impact on P&L
- `onec_get_impairment_indicators(threshold?)` — Obsolete, underutilized, aged assets
- `onec_get_disposal_candidates(ageThreshold?, depreciationRemaining?)` — End-of-life assets, scrap value
- `onec_get_asset_location_audit(departmentGuid?)` — Asset location vs. records, discrepancies

### 5.1 Asset Acquisition & Acceptance
- **Document_ПринятиеКУчетуОС** — Acceptance of asset into use
  - Use for: Capitalize asset, start depreciation schedule
- **Document_ПоступлениеНМА** (applies to intangibles too)

### 5.2 Asset Transfers
- **Document_ПередачаОС** — Transfer asset to another department/location/org
  - Use for: Inter-departmental moves, custody changes
- **Document_ПеремещениеОС** — Move asset location (same org)
  - Use for: Warehouse to shop floor, building to building

### 5.3 Asset Revaluation & Adjustments
- **Document_ПереоценкаВнеоборотныхАктивов** — Revalue fixed/intangible assets
  - Subtables: (implicit revaluation entries)
  - Use for: Inflation adjustment, fair value update, IFRS compliance
- **Document_МодернизацияОС** — Asset upgrade/improvement (capitalize additional cost)
- **Document_РеструктуризацияОС** — Asset restructuring (split, combine, reclassify)

### 5.4 Depreciation Configuration
- **Document_ИзменениеПараметровНачисленияАмортизацииОС** — Change depreciation method/schedule
  - Use for: Useful life change, depreciation rate adjustment
- **Document_ИзменениеГрафиковАмортизацииОС** — Modify depreciation schedules
  - Subtables: ОС (assets affected)
  - Use for: Corrective depreciation, accelerated/deferred depreciation
- **Document_ИзменениеСпособовОтраженияРасходовПоАмортизацииОС** — Change GL accounts for depreciation
- **Information Register_ПараметрыАмортизацииОСБухгалтерскийУчет** — Depreciation parameters (BU)
- **Information Register_НачислениеАмортизацииОСБухгалтерскийУчет** — Depreciation accrual schedule
- **Information Register_МестонахождениеОСБухгалтерскийУчет** — Asset location register

### 5.5 Asset Disposal
- **Document_СписаниеОС** — Retire / write-off asset
  - Subtables: ОС, Товары, ИнвентаризационнаяКомиссия
  - Use for: End of life, donation, sale, scrap
- **Document_ИзменениеСостоянияОС** — Change asset status (active → inactive → disposed)

### 5.6 Asset Registry & Analysis
- **Information Register_ПервоначальныеСведенияОСБухгалтерскийУчет** — Initial asset data (BU)
- **Information Register_ОбъектыНалоговогоУчетаФА** — Tax accounting objects (FA)
- **Catalog_ОСБухгалтерскийУчет** (asset master data)

### 5.7 Asset Physical Inventory
- **Document_ИнвентаризацияОС** — Physical FA count & verification
  - Subtables: ОС, ИнвентаризационнаяКомиссия
  - Use for: Period-end audit, capitalization verification

---

## 6. INTANGIBLE ASSETS (НМА)

**Purpose:** Patent, trademark, software, license management.

**Drilling Tools:**
- `onec_get_intangible_asset_register(asOfDate?)` — NMA inventory, cost, amortization status
- `onec_drill_nma_by_type(nmaTypeGuid?)` — Assets by category (patent, software, license, trademark)
- `onec_get_amortization_schedule(nmaGuid?, period?)` — Accumulated amortization, useful life remaining
- `onec_get_nma_impairment_risk(threshold?)` — Obsolete software, expired licenses, risk indicators
- `onec_analyze_nma_value(period?)` — Amortization expense, impact on P&L
- `onec_get_license_expiration(daysUntilExpiry?)` — Upcoming license renewals, compliance

### 6.1 Intangible Asset Lifecycle
- **Document_ПоступлениеНМА** — Receipt/acquisition of intangible asset
- **Document_ПринятиеКУчетуНМА** — Acceptance into use (start amortization)
- **Document_ПередачаНМА** — Transfer intangible asset to another party
- **Document_ВыработкаНМА** — Creation/development of internal intangible asset
- **Document_СписаниеНМА** — Retire/write-off intangible asset
  - Subtables: ИнвентаризационнаяКомиссия

### 6.2 Intangible Asset Depreciation (Amortization)
- **Document_ИзменениеПараметровНачисленияАмортизацииНМА** — Change amortization schedule
- **Document_ИзменениеСпособовОтраженияРасходовПоАмортизацииНМА** — Change GL accounts
- **Information Register_ПервоначальныеСведенияНМАБухгалтерскийУчет** — Initial NMA data (BU)

### 6.3 Intangible Asset Inventory
- **Document_ИнвентаризацияНМА** — Physical NMA verification

---

## 7. PAYROLL & HR (Зарплата)

**Purpose:** Salary accrual, deductions, tax withholding, payslips, HR transactions.

**Drilling Tools:**
- `onec_get_payroll_summary(period?, departmentGuid?)` — Total payroll, headcount, cost per employee
- `onec_drill_payroll_by_employee(employeeGuid?, period?)` — Individual salary, deductions, net pay
- `onec_drill_payroll_by_department(departmentGuid?, period?)` — Payroll cost by cost center
- `onec_get_tax_withholding(period?, employeeType?)` — IPN, OPV, SO withholding by employee/dept
- `onec_get_hr_transactions(type?, dateFrom?)` — Hiring, termination, transfers, compensation changes
- `onec_get_benefit_accruals(period?)` — Vacation, sick leave, bonuses, non-monetary benefits
- `onec_analyze_payroll_variance(period?, threshold?)` — Unusual deductions, outlier salaries
- `onec_get_headcount_analysis(departmentGuid?)` — Employee count, turnover rate, cost per FTE

### 7.1 Salary Accrual & Calculation
- **Document_НачислениеЗарплатыРаботникамОрганизаций** — Calculate & accrue employee salaries
  - Use for: Monthly salary run, bonus, incentive accrual
- **Information Register_ПлановыеНачисленияРаботниковОрганизаций** — Planned salary accruals
- **Information Register_ПлановыеУдержанияРаботниковОрганизаций** — Planned deductions

### 7.2 Salary Payment & Disbursement
- **Document_ЗарплатаКВыплатеОрганизаций** — Salary to pay (ready for disbursement)
  - Subtables: Зарплата (per-employee payable)
  - Use for: Payroll bank transfer, cash disbursement approval
- **Document_ПриходныйКассовыйОрдер** — Cash receipt (employee deposit, advance repayment)

### 7.3 Salary GL Posting
- **Document_ОтражениеЗарплатыВБухучете** — Post salary to GL (BU)
  - Use for: Salary expense recognition, payables accrual
- **Document_ОтражениеЗарплатыВРеглУчете** — Post salary to GL (Tax/Regulatory)

### 7.4 Salary Deductions & Withholding
- **Document_РасчетУдержанийРаботниковОрганизаций** — Calculate payroll deductions
  - Use for: Income tax (IPN), pension (OPV), social insurance (SO)
- **Document_УдержаниеИПНиОПВНУ** — Withhold IPN & OPV for non-residents
  - Subtables: ФизическиеЛица, УдержанныйИПН, УдержанныйОПВ, УдержанныеВОСМС

### 7.5 Salary Returns & Corrections
- **Document_ВозвратЗарплатыРаботниковОрганизаций** — Salary reversal (overpayment, correction)
  - Subtables: Зарплата
  - Use for: Salary correction, employee refund

### 7.6 HR Transactions
- **Document_ПриемНаРаботуВОрганизацию** — Hire employee (employment contract)
  - Use for: Create employee record, establish salary, start benefits
- **Document_УвольнениеИзОрганизаций** — Terminate employee
  - Subtables: РаботникиОрганизации
  - Use for: End employment, severance, final paycheck
- **Document_КадровоеПеремещениеОрганизаций** — Employee transfer / promotion / role change
  - Use for: Department transfer, salary change, title update
- **Document_КомандировкиОрганизаций** — Business trip / travel assignment
  - Use for: Travel expense tracking, per diem, advance

### 7.7 Salary Deposits & Deferred Payment
- **Document_ДепонированиеЗаработнойПлаты** — Escrow salary deposit (unclaimed pay)
  - Subtables: ДепонированнаяЗаработнаяПлата
  - Use for: Hold unclaimed wages (employee not collected)
- **AccumulationRegister_ВзаиморасчетыСРаботникамиОрганизаций** — Employee AR/AP (advances, loans)

### 7.8 Payroll Reports & Registers
- **Information Register_РаботникиОрганизаций** — Employee master data
- **AccumulationRegister_ВыплаченныеДоходыРаботникамОрганизацийНУ** — Paid salary history (tax reporting)
- **Document_ВедомостьПрочихДоходов** — Miscellaneous income ledger
  - Subtables: Выплаты
  - Use for: Bonus, incentive, non-salary income tracking
- **Document_ВедомостьНаПеречислениеПрочихВыплат** — Transfer misc. income/bonuses
- **Document_ВедомостьНаВозвратПрочихВыплат** — Return misc. income
- **Document_РегистрацияПрочихВыплат** — Register misc. income for tax purposes

### 7.9 Payroll Advance Setup
- **Document_ВводСведенийОПлановыхУдержанияхРаботниковОрганизаций** — Setup planned deductions
  - Subtables: Удержания
  - Use for: Loan repayment plan, alimony, union dues
- **Document_ВводСведенийОРеглУчетеПлановыхНачисленийРаботниковОрганизаций** — Setup planned accruals

---

## 8. TAX COMPLIANCE (Налогообложение)

**Purpose:** VAT, corporate income tax (IPN), social tax (СН), customs duties, tax declarations, reconciliation.

**Drilling Tools:**
- `onec_get_vat_summary(period?)` — Output VAT, input VAT, net position, refund eligibility
- `onec_drill_vat_by_rate(rate?, period?)` — Transactions by VAT rate (12%, 0%, exempt)
- `onec_get_vat_input_credit(period?)` — Input VAT claims, unclaimed VAT, audit risk
- `onec_get_tax_liability_summary(period?)` — IPN, SN, OPV, SO, EP accruals, budget payables
- `onec_drill_tax_by_type(taxType?, period?)` — Individual tax type detail (IPN rate calculation, SN base)
- `onec_get_tax_deduction_status(employeeGuid?)` — Claimed vs. unclaimed tax deductions
- `onec_get_fund_remittance_status(fundType?, period?)` — OPV, SO, EP remittances due vs. paid
- `onec_analyze_tax_compliance(period?)` — Late filings, missed deadlines, non-residents, risk flags
- `onec_get_tax_filing_checklist(jurisdiction?, period?)` — Required declarations, deadlines, status

### 8.1 VAT Management
- **Document_СчетФактураВыданный** — Issued invoice (output VAT source)
- **Document_СчетФактураПолученный** — Received invoice (input VAT claim)
- **AccumulationRegister_НДС** — VAT register (sales side, standard rate 12%)
- **AccumulationRegister_НДСКВозмещению** — VAT for refund (input side)
- **AccumulationRegister_КорректировкаНДС** — VAT correction/adjustment
- **AccumulationRegister_КорректировкаНДСКВозмещению** — Input VAT correction
- **AccumulationRegister_НДСЗаНерезидента** — VAT on non-resident transactions
- **AccumulationRegister_НДССИзмененнымСрокомУплаты** — VAT with deferred payment terms
- **AccumulationRegister_НДСВзаиморасчетыСБюджетом** — VAT payable/receivable (budget liability)
- **Document_РегистрацияНДСЗаНерезидента** — Register VAT for non-resident
- **Information Register_СведенияСчетовФактурВыданных** — Issued invoice registry (VAT tracking)
- **Information Register_СведенияСчетовФактурПолученных** — Received invoice registry (input credit)

### 8.2 Corporate Income Tax (ИПН)
- **Document_ЗаявлениеНаПредоставлениеВычетовИПН** — Request tax deductions/credits
  - Subtables: Вычеты, ПрочиеВычеты
  - Use for: Annual IPN filing, deduction claims
- **Document_ИПНЗаявлениеНаПредоставлениеВычета** — Alternative IPN deduction request format
  - Subtables: ГрафикПлатежей
- **Document_РасчетНалоговПриПоступленииАктивовУслуг** — Calculate tax on asset/service acquisition
- **AccumulationRegister_ИПНСведенияОДоходах** — IPN income information register
- **AccumulationRegister_ИПНРасчетыСБюджетом** — IPN payable (budget liability)
- **Information Register_ИПНПлановыеНалоговыеВычетыФизлиц** — Planned IPN deductions
- **Information Register_ИПНПрименениеВычетов** — Deduction application log
- **Information Register_ВычетыФизическихЛицИПН** — Physical person deductions

### 8.3 Social Tax (СН)
- **Document_РасчетСНиСО** — Calculate social tax & social insurance
- **Document_РасчетПениОПВиСО** — Calculate penalties on OPV & SO
- **AccumulationRegister_СНИсчисленный** — SN accrued
- **AccumulationRegister_СНСведенияОДоходах** — SN income register
- **Information Register_КоэффициентыИндексацииЗаработка** — Wage indexation coefficients

### 8.4 Pension & Social Contributions (ОПВ, ВОСМС, ООСМС, ЕП)
- **Document_ОПВПеречислениеВФонды** — OPV remittance to pension fund
  - Subtables: ОПВРасчетыСФондами, ОПВСведенияОДоходах
- **Document_ОПВВозвратВзносов** — OPV contribution return
- **Document_ЕППеречислениеВФонды** — EP (single pension) remittance
  - Subtables: ЕПРасчетыСФондами, ЕПСведенияОДоходах
- **Document_СОПеречислениеВФонды** — SO (social insurance) remittance
  - Subtables: СОРасчетыСФондами, СОСведенияОДоходах
- **Document_СОВозвратОтчислений** — SO return
- **AccumulationRegister_ОПВПодлежитПеречислениюВФонды** — OPV accrued (payable)
- **AccumulationRegister_ОПВРасчетыСФондами** — OPV payable balance
- **AccumulationRegister_ОПВСведенияОДоходах** — OPV income register
- **AccumulationRegister_ЕПКомпоненты** — EP components
- **AccumulationRegister_ЕПРасчетыСФондами** — EP payable
- **AccumulationRegister_ЕПСведенияОДоходах** — EP income register
- **AccumulationRegister_ООСМСРасчетыСФондами** — Health insurance (ООСМС) payable
- **AccumulationRegister_ООСМССведенияОДоходах** — ООСМС income register
- **AccumulationRegister_ВОСМСРасчетыСФондами** — Occupational (ВОСМС) payable
- **AccumulationRegister_ВОСМСПодлежитПеречислениюВФонды** — ВОСМС accrued
- **AccumulationRegister_ВОСМССведенияОДоходах** — ВОСМС income register
- **AccumulationRegister_ОППВРасчетыСФондами** — Additional contribution (ОППВ) payable
- **AccumulationRegister_ОППВСведенияОДоходах** — ОППВ income register

### 8.5 Mandatory Budget Payments
- **Document_РасчетЕдиногоПлатежа** — Calculate unified payment (consolidated tax)
- **Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС** — Register other purchase operations (VAT)
- **Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС** — Register other sales operations (VAT)
- **Document_РегистрацияПрочихДоходовВЦеляхНалогообложения** — Register miscellaneous income (tax)
- **AccumulationRegister_Акциз** — Excise tax register

### 8.6 Tax Compliance Registers
- **AccumulationRegister_СведенияОбИсчисленииВычетовИПН** — IPN deduction calculation register
- **Information Register_ОбъектыЗемельногоНалога** — Land tax objects
- **Information Register_ОбъектыИмущественногоНалога** — Property tax objects
- **Information Register_ОбъектыТранспортногоНалога** — Vehicle/transport tax objects
- **Information Register_ПараметрыРасчетаЗемельногоНалога** — Land tax parameters
- **Information Register_ПараметрыРасчетаТранспортногоНалога** — Transport tax parameters
- **Information Register_КодыОрганизацийВБанковскойСистеме** — Bank codes for orgs

---

## 9. CASH MANAGEMENT (Кассовые Операции)

**Purpose:** Bank deposits, withdrawals, cash receipts, disbursements, bank reconciliation.

**Drilling Tools:**
- `onec_get_cash_position(asOfDate?)` — Cash on hand by bank/currency, liquidity snapshot
- `onec_drill_cash_by_account(bankAccount?, period?)` — Deposits, withdrawals, transfers by account
- `onec_get_bank_reconciliation_detail(bankAccount?, period?)` — Outstanding checks, deposits in transit, NSF
- `onec_get_cash_flow_analysis(period?)` — Inflows vs. outflows, cash burn rate, forecast
- `onec_get_payment_aging(paymentType?, daysOverdue?)` — Overdue payments to suppliers/employees
- `onec_analyze_cash_variance(period?, threshold?)` — Unexpected cash movements, large transactions
- `onec_get_forex_position(asOfDate?)` — Foreign currency exposure, exchange rate impact, revaluation gains/losses

### 9.1 Bank Payments & Transfers
- **Document_ПлатежноеПоручениеИсходящее** — Outgoing payment order (bank transfer OUT)
- **Document_ПлатежноеПоручениеВходящее** — Incoming payment order (bank transfer IN)

### 9.2 Bank Orders & Receipts
- **Document_ПлатежныйОрдерСписаниеДенежныхСредств** — Cash disbursement order
- **Document_ПлатежныйОрдерПоступлениеДенежныхСредств** — Cash receipt order

### 9.3 Cash Box Operations
- **Document_ПриходныйКассовыйОрдер** — Cash receipt (cash in)
- **Document_РасходныйКассовыйОрдер** — Cash disbursement (cash out)

### 9.4 Card Payments
- **Document_ОплатаОтПокупателяПлатежнойКартой** — Customer payment via card
- **Document_ЧекККМ** — POS receipt / cash register check
  - Subtables: Товары, Услуги, Оплата

### 9.5 Cash Reconciliation & Analysis
- **AccumulationRegister_ОплатаСчетов** — Payment register (AP aging)
- **Information Register_КурсыВалют** — Exchange rates (for foreign currency cash)

---

## 10. PRODUCTION & MANUFACTURING (Производство)

**Purpose:** WIP, job costing, production orders, output tracking, variance.

**Drilling Tools:**
- `onec_get_wip_summary(period?)` — WIP balance, job count, average cost per unit
- `onec_drill_wip_by_job(jobGuid?, status?)` — Job cost detail (materials, labor, overhead), percent complete
- `onec_get_production_variance(period?)` — Actual vs. standard cost, material/labor/overhead variance
- `onec_analyze_production_cost(period?, productGuid?)` — COGS by product, margin by job, efficiency ratios
- `onec_get_production_output(period?)` — Units produced, output by shift, rejection rate
- `onec_get_material_consumption(period?, productGuid?)` — Material usage, waste, scrap, efficiency
- `onec_get_labor_productivity(period?, departmentGuid?)` — Labor hours, labor cost, output per hour

### 10.1 Work-in-Process (WIP)
- **Document_ДвижениеНЗП** — WIP movement / production progress
  - Subtables: Состав (BOM components, labor, overhead)
- **Document_ОтчетПроизводстваЗаСмену** — Production report by shift (output log)

### 10.2 Material Allocation & Requisition
- **Document_ТребованиеНакладная** — Material requisition
  - Subtables: Материалы, МатериалыЗаказчика

### 10.3 Processing / Subcontracting Services
- **Document_РеализацияУслугПоПереработке** — Sale of toll processing service
- **Document_ПоступлениеИзПереработки** — Receipt of processing result

### 10.4 Additional Production Costs
- **Document_ПоступлениеДопРасходов** — Receipt of supplementary production costs

### 10.5 Production Analysis
- **AccumulationRegister_ВыпускПродукцииУслугБухгалтерскийУчет** — Production output (BU)
- **AccumulationRegister_ВыпускПродукцииУслугНалоговыйУчет** — Production output (tax)

---

## 11. CUSTOMS & FOREIGN TRADE (Таможня)

**Purpose:** Import/export declarations, GTD tracking, commodity codes, border crossing.

**Drilling Tools:**
- `onec_get_import_export_summary(period?)` — Total imports/exports, value, commodity breakdown
- `onec_drill_imports_by_supplier(supplierCountry?, period?)` — Imports by source country, tariff exposure
- `onec_get_gtd_status(shipmentGuid?)` — Customs declaration status, clearance date, duty paid
- `onec_get_landed_cost(shipmentGuid?)` — Goods cost + duties + freight + insurance, total landed cost
- `onec_analyze_tariff_impact(period?, commodityCode?)` — Duty rates by commodity, tariff savings opportunities
- `onec_get_trade_compliance_status(period?)` — Restricted goods, export controls, EAEU compliance
- `onec_get_customs_pending(asOfDate?)` — Pending GTD clearances, delayed shipments, bottlenecks

### 11.1 Import & Export Customs
- **Document_ГТДИмпорт** — Customs declaration (GTD) - IMPORT
  - Subtables: Товары, ОС, Разделы
- **Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов** — Customs import declaration
  - Subtables: Товары, ОС

### 11.2 Electronic Customs Documents
- **Document_ЭлектронныйДокументВС** — Electronic customs document
  - Subtables: ИсходныеТовары, ИсходныеТоварыВС, Товары, ТоварыВС, Ошибки
- **Document_СканированиеТоваровИСМПТК** — Goods scanning & customs seal
  - Subtables: НоменклатураЗакодированная

### 11.3 Shipping & Border Crossing Documents
- **Document_СНТ** — Product shipping details (main form)
  - Subtables: Multiple sub-documents for cargo, export control, tobacco products
- **Document_СопоставлениеСНТиФНО** — Reconcile SNT vs. FNO
  - Subtables: ОшибкиСНТ, ФНО, ТоварыСНТ, ТоварыФНО

### 11.4 Special Duties & Controls
- **Document_ЗерноваяРасписка** — Grain certificate (commodity receipt)
  - Subtables: Товары
- **Information Register_ПодтверждениеРеализацииВЕАЭС** — EAEU realization confirmation

---

## 12. RECONCILIATION & CLOSING (Сверка)

**Purpose:** Period-end reconciliation, month-end closing checklist, inter-org statements.

**Drilling Tools:**
- `onec_get_reconciliation_summary(period?)` — Unmatched items count, aging, dispute status
- `onec_drill_unmatched_items(type?, ageThreshold?)` — Unmatched AR/AP, advance-to-invoice gaps, orphaned items
- `onec_get_closing_checklist_status(period?)` — Checklist progress, completed steps, open items
- `onec_analyze_period_close_readiness(period?)` — All accruals entered, accounts reconciled, GL locked
- `onec_get_currency_revaluation_impact(period?)` — Forex gains/losses, revaluation amount, P&L impact
- `onec_get_inter_org_reconciliation(org1?, org2?, period?)` — Balance confirmation, disputed balances
- `onec_get_consolidation_eliminations_due(period?)` — Inter-org revenue to eliminate, profit to eliminate

### 12.1 Reconciliation Statements
- **Document_АктСверкиВзаиморасчетов** — Reconciliation statement (AR/AP aging)
  - Subtables: ПоДаннымКонтрагента, ПоДаннымОрганизации, СписокОрганизаций, СписокСчетов

### 12.2 Debt Closing & Writeoff
- **Document_ЗакрытиеДтКтЗадолженности** — Close debt/obligation
  - Subtables: Задолженность

### 12.3 Month-End Closing
- **Document_ЗакрытиеМесяца** — Month-end closing checklist
  - Subtables: КурсыВалют, Ошибки
- **Document_КорректировкаДолга** — Debt correction

### 12.4 Currency Revaluation
- **Document_ПереоценкаВнеоборотныхАктивов** — Revalue assets for period-end
- **Information Register_КурсыВалют** — Exchange rate table

---

## 13. ELECTRONIC DOCUMENTS (Электронные Документы)

**Purpose:** Digital invoicing, e-signatures, blockchain integration, platform compliance.

**Drilling Tools:**
- `onec_get_esf_submission_status(period?)` — Submitted ЭСФ count, rejection count, pending
- `onec_get_esf_errors(period?)` — Validation errors, rejection reasons, corrections needed
- `onec_get_electronic_act_status(period?)` — ЭАВ submissions, approval status, payment triggered
- `onec_analyze_esf_compliance(period?)` — Required fields, missing signatures, audit trail

### 13.1 Electronic Tax Invoices (ЭСФ)
- **Document_ЭСФ** — Electronic invoice submission
  - Subtables: ЭСФ_Получатели, ЭСФ_Поставщики, ЭСФ_Товары, ЭСФ_ТоварыПоПолучателям, ЭСФ_ТоварыПоПоставщикам, ЭСФ_Ошибки

### 13.2 Electronic Act of Work (EAWR)
- **Document_ЭлектронныйАктВыполненныхРабот** — Electronic act of work performed
  - Subtables: Услуги, Ошибки, Получатели, Поставщики

### 13.3 Electronic Customs Documents
- **Document_ЭлектронныйДокументВС** — Electronic customs document
  - Subtables: ИсходныеТовары, ИсходныеТоварыВС, Товары, ТоварыВС, Ошибки

---

## 14. INITIAL SETUP & MAINTENANCE (Начальные Настройки)

**Purpose:** Opening balances, data initialization, configuration, corrections.

**Drilling Tools:**
- `onec_get_opening_balance_status(entity?)` — Opening balance entry status, completeness
- `onec_verify_gl_opening_balances(period?)` — GL balance match with source system, discrepancies
- `onec_get_configuration_audit(configType?)` — GL account mapping, depreciation methods, cost allocation rules
- `onec_verify_data_quality(entity?, threshold?)` — Duplicate data, missing mandatory fields, orphaned records
- `onec_get_correction_history(period?)` — Prior corrections, trend of error corrections, root cause analysis

### 14.1 Opening Balances
- **Document_ВводНачальныхОстатков** — Opening balance (GL accounts, AR/AP, inventories)
  - Subtables: БухСправка, Запасы, РасчетыПоНалогамИСборам, РасчетыСКонтрагентами, РасчетыСПодотчетнымиЛицами, ТоварыОрганизаций
- **Document_ВводНачальныхОстатковОС** — Opening balance for fixed assets
- **Document_ВводНачальныхОстатковПоЗарплате** — Opening balance for payroll
  - Subtables: ЗарплатаИНалоги, ВзносыИОтчисления, ОПВПодлежитПеречислению, ФизическиеЛица

### 14.2 Payroll Configuration
- **Document_ВводСведенийОПлановыхУдержанияхРаботниковОрганизаций** — Setup planned deductions
  - Subtables: Удержания
- **Document_ВводСведенийОРеглУчетеПлановыхНачисленийРаботниковОрганизаций** — Setup planned accruals
  - Subtables: ОсновныеНачисления

### 14.3 Asset Configuration
- **Document_УстановкаСоответствияСчетовБУиНУ** — Map BU accounts to tax accounts
  - Subtables: СоответствиеСчетовБУиНУ
- **Document_УстановкаПорядкаЗакрытияПодразделений** — Setup department closing order
  - Subtables: ПорядокЗакрытия
- **Document_УстановкаЦенНоменклатуры** — Set pricing for products/services
  - Subtables: Товары

### 14.4 Data Corrections & Maintenance
- **Document_УдалитьКорректировкаЗаписейРегистров** — Correct register entries
  - Subtables: ТаблицаРегистровНакопления, ТаблицаРегистровСведений
- **Document_УдалитьКорректировкаСтоимостиСписанияТоваров** — Correct inventory COGS

---

## 15. ASSET TRANSFERS & MOVEMENTS (Передача Активов)

**Purpose:** Transfers between departments, organizations, locations.

**Drilling Tools:**
- `onec_get_transfer_summary(period?)` — Assets transferred, inter-org transfers, movements
- `onec_drill_asset_transfers(assetType?, period?)` — FA/NMA/inventory transfers, from-to department, reason
- `onec_analyze_transfer_cost(period?)` — Cost impact of transfers, revaluation on transfer
- `onec_get_pending_transfers(asOfDate?)` — In-transit assets, incomplete transfers, holding entities

### 15.1 Fixed Asset Transfers
- **Document_ПередачаОС** — Transfer FA to another department/location/organization
- **Document_ПеремещениеОС** — Move FA within same org

### 15.2 Intangible Asset Transfers
- **Document_ПередачаНМА** — Transfer NMA to another party

### 15.3 Inventory Transfers
- **Document_ПеремещениеТоваров** — Move inventory between locations/warehouses

### 15.4 Material Requisition (Allocation to Production)
- **Document_ТребованиеНакладная** — Material requisition
  - Subtables: Материалы, МатериалыЗаказчика

---

## 16. OTHER WORKFLOWS (Прочие)

**Purpose:** Miscellaneous, specialized, and less-frequent operations.

**Drilling Tools:**
- `onec_get_miscellaneous_transactions(type?, period?)` — Notices, power-of-attorney, debt corrections
- `onec_get_cash_inventory_results(period?)` — Cash count results, overage/shortage identification
- `onec_get_wip_inventory_results(period?)` — WIP count results, completion status assessment
- `onec_get_storno_entries(period?)` — Reversed entries, reason, impact on GL

### 16.1 Miscellaneous Documents
- **Document_АвизоПрочее** — Other notices / advisories
  - Subtables: ДанныеБух
- **Document_Доверенность** — Power of attorney
  - Subtables: Товары
- **Document_КорректировкаДолга** — Debt correction

### 16.2 Physical Inventories (General)
- **Document_ИнвентаризацияДенежныхСредств** — Physical cash count
- **Document_ИнвентаризацияНЗП** — Physical WIP count

### 16.3 Fixed Asset Composition
- **Document_КомплектацияОС** — Assembly of FA components

### 16.4 Production & Sales Analysis
- **Document_ОтчетОРозничныхПродажах** — Retail sales report (POS summary)

### 16.5 Compliance Certifications
- **Document_РегистрацияПрочихВыплат** — Register miscellaneous payments
- **Document_РегистрацияПрочихДоходовВЦеляхНалогообложения** — Register misc. income
- **Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС** — Register other purchases (VAT)
- **Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС** — Register other sales (VAT)

### 16.6 Inter-Company Funds Transfer
- **Document_ИЛПеречислениеПолучателям** — Transfer alimony/benefits to recipients
  - Subtables: ИсполнительныеЛисты

### 16.7 Storno & Reversals
- **Document_Сторнирование** — Storno entry (reverse posted document)

---

## Quick Domain Index

| Domain | Primary Documents | Registers | Use Case |
|--------|---|---|---|
| **Sales** | РеализацияТоваровУслуг, СчетФактураВыданный, СчетНаОплатуПокупателю | РеализацияТМЗ, СведенияСчетовФактурВыданных | Track revenue, AR, VAT |
| **Purchases** | ПоступлениеТоваровУслуг, СчетФактураПолученный | СведенияСчетовФактурПолученных, ОплатаСчетов | Track COGS, AP, input VAT |
| **Payroll** | НачислениеЗарплатыРаботникамОрганизаций, ЗарплатаКВыплатеОрганизаций, РасчетУдержанийРаботниковОрганизаций | ВыплаченныеДоходыРаботникамОрганизацийНУ, РаботникиОрганизаций | Calculate salary, tax, compliance |
| **VAT** | СчетФактураВыданный, СчетФактураПолученный | НДС, НДСКВозмещению | VAT filing, audit |
| **Tax** | ЗаявлениеНаПредоставлениеВычетовИПН, РасчетСНиСО, ОПВПеречислениеВФонды | ИПНСведенияОДоходах, СНИсчисленный, ОПВРасчетыСФондами | Tax accrual, declarations, remittance |
| **Cash** | ПлатежноеПоручение, ПриходныйКассовыйОрдер, РасходныйКассовыйОрдер | ОплатаСчетов, КурсыВалют | Bank transfers, cash control |
| **Fixed Assets** | ПринятиеКУчетуОС, ПередачаОС, СписаниеОС | ПараметрыАмортизацииОСБухгалтерскийУчет, МестонахождениеОСБухгалтерскийУчет | Asset lifecycle, depreciation |
| **Inventory** | ПеремещениеТоваров, ИнвентаризацияТоваровНаСкладе, СписаниеТоваров | ТоварыОрганизацийБУ, ТоварыНаВиртуальныхСкладах | Stock movements, counts |
| **Production** | ДвижениеНЗП, ОтчетПроизводстваЗаСмену, ТребованиеНакладная | ВыпускПродукцииУслугБухгалтерскийУчет | WIP tracking, costing |
| **Customs** | ГТДИмпорт, ЭлектронныйДокументВС, СНТ | — | Import/export, duty |
| **Closing** | ЗакрытиеМесяца, АктСверкиВзаиморасчетов, ОперацияБух | КурсыВалют | Month-end, reconciliation |

---

## Notes for LLM Integration

1. **Workflow Sequencing:** Many workflows have dependencies (e.g., Sales → Invoice → Payment). Model the dependency tree.
2. **Register Updates:** Each document posting updates multiple accumulation/information registers. Plan tool architecture accordingly.
3. **Dual-Ledger:** Kazakhstan has BU (Accounting) vs. Tax (Regulatory) tracking. Many documents have both paths.
4. **Localization:** All entity names are in Russian/Cyrillic. Use `onec_search_entities()` before querying.
5. **Multi-currency:** Exchange rates drive VAT, tax, and forex calculations. Update regularly.
6. **Period-Locked:** Month-end (ЗакрытиеМесяца) locks GL. Plan for draft state.
7. **Compliance Deadlines:** Tax filings have statutory deadlines. Model these in tool outputs.
8. **Entity Count:** 889 total entity schema files across 9 categories (223 Documents, 271 Catalogs, 121 Info Registers, 48 Accumulation Registers, etc.). Use schema introspection tools as a fallback.

