CODEBASE.md — onec-kz MCP + DeepSeek Agent

> Full codebase reference generated 2026-06-06. Updated 2026-06-16: HTTP transport migration, Telegram admin bot, named connections, chat agent, Fly.io deployment.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Layout](#2-repository-layout)
3. [Monorepo Packages](#3-monorepo-packages)
4. [MCP Server Core](#4-mcp-server-core)
5. [Tool Registration Layer (33 tools)](#5-tool-registration-layer)
6. [Services Layer](#6-services-layer)
7. [Validation Engine](#7-validation-engine)
8. [OData Client (`@aibos/onec-client`)](#8-odata-client)
9. [KZ Accounts Reference (`@aibos/kz-accounts`)](#9-kz-accounts-reference)
10. [Agent / Bot Layer](#10-agent--bot-layer)
11. [Tenant Registry (SQLite)](#11-tenant-registry)
12. [Rendering Sidecar](#12-rendering-sidecar)
13. [Cross-Cutting Patterns](#13-cross-cutting-patterns)
14. [Build & Scripts](#14-build--scripts)
15. [Environment Variables](#15-environment-variables)
16. [Domain Glossary](#16-domain-glossary)
17. [Key Account Mappings](#17-key-account-mappings)

---

## 1. Project Overview

This is a **multi-tenant SaaS financial AI agent** for 1C:Бухгалтерия (Kazakhstan edition). It has two main parts:

| Part | Technology | Purpose |
|---|---|---|
| **MCP Server** | TypeScript (Node, ESM) | Exposes 1C accounting data as 40+ MCP tools over stdio |
| **DeepSeek Agent** | JavaScript (Node, ESM) | CLI + Telegram bot that drives the MCP server via a DeepSeek LLM |

The system works universally for **any Kazakhstan industry** (agro, manufacturing, trade, services, construction, transport) with special handling for the agro КПН −70% reduction (Ст.285 НК РК).

---

## 2. Repository Layout

```
MCP metadata/
├── MCP 1C v1/                    # TypeScript MCP server (monorepo)
│   ├── apps/mcp/src/
│   │   ├── http-index.ts         # HTTP entry: POST/GET/DELETE /mcp, GET /health
│   │   ├── telegram-bot.ts       # Admin bot: long-poll, connection wizard, /add /list /remove
│   │   ├── chat-agent.ts         # Conversational LLM agent (OpenAI-compat + 7 tools)
│   │   ├── connections-store.ts  # Named 1C connections registry (connections.json, 0o600)
│   │   ├── session-registry.ts   # Per-session cache: getOrCreateSession()
│   │   ├── server.ts             # createServer(): DI, tool registration, resources
│   │   ├── config.ts             # loadConfigFromRequest() + loadConfigFromConnectionEntry()
│   │   ├── org-context.ts        # buildOrgContext(): server-side org GUID resolution
│   │   └── tools/                # ~33 registerXyz() modules
│   ├── packages/
│   │   ├── onec-client/          # HTTP OData client
│   │   ├── services/             # Business logic (25 service classes)
│   │   └── kz-accounts/          # Offline KZ chart of accounts
│   ├── Entities/                 # 889 .md files — offline OData schema
│   ├── dist/http-server.bundle.mjs  # esbuild ESM bundle (runtime entry, with createRequire banner)
│   ├── Dockerfile                # Multi-stage build → non-root mcp user, /app/data writable
│   ├── fly.toml                  # Fly.io config (app: ai-buh-v3, region: ams, port: 3000)
│   └── package.json              # Workspace root
│
├── agent-deepseek/               # JavaScript agent + Telegram bot
│   ├── agent.mjs                 # CLI interactive chat
│   ├── bot.mjs                   # Telegram multi-tenant bot
│   ├── session.mjs               # AgentSession (shared CLI + bot)
│   ├── mcp-client.mjs            # McpClient: spawns MCP child, JSONRPC
│   ├── tenant-manager.mjs        # Process pool (LRU, backoff, quarantine)
│   ├── onboard.mjs               # Owner CLI: register company, list, set status
│   ├── ui-text.mjs               # Thinking messages array
│   ├── registry/
│   │   ├── db.mjs                # SQLite schema + WAL init (better-sqlite3)
│   │   ├── crypto.mjs            # AES-256-GCM encrypt/decrypt for secrets at rest
│   │   └── tenants.mjs           # CRUD: tenants, secrets, users, history, usage
│   └── render/
│       ├── bridge.mjs            # Node→Python sidecar (segments/xlsx/pdf)
│       └── cache.mjs             # In-process answer cache (max 200, LRU)
│
├── guide/                        # System prompts + skill files (markdown)
├── docs/                         # Chart of accounts JSON
└── CODEBASE.md                   # ← this file
```

---

## 3. Monorepo Packages

**Root:** `MCP 1C v1/package.json`

```
workspaces: ["apps/*", "packages/*"]
```

| Package | Alias | Purpose |
|---|---|---|
| `apps/mcp` | — | MCP stdio server entry |
| `packages/onec-client` | `@aibos/onec-client` | OData HTTP client + types |
| `packages/services` | `@aibos/services` | Business logic services |
| `packages/kz-accounts` | `@aibos/kz-accounts` | Offline KZ chart of accounts |

**Build:** esbuild bundles everything into `dist/server.bundle.js` with path aliases resolved at build time. The kz-accounts `chart.json` is also copied to `dist/data/chart.json`.

---

## 4. MCP Server Core

### `apps/mcp/src/http-index.ts` *(primary entry — replaces stdio index.ts)*

HTTP server on `PORT` (default 3000). Routes:
- `GET  /health` → `{ status: "ok", sessions: N }`
- `POST /mcp`    → new session (if no `mcp-session-id` header) or existing session
- `GET  /mcp`    → SSE stream for server-to-client notifications
- `DELETE /mcp`  → explicit session termination

**New session auth** — pick one method:
```
X-Connection-Name: <name>          ← preferred: admin-registered via Telegram bot
  — OR —
Authorization: Basic <b64>         ← raw 1C credentials
X-OnecUrl: https://your-1c/base
X-OnecDefaultOrgGuid: <guid>       ← optional
```

Subsequent requests include `mcp-session-id: <uuid>` returned on first response.

### `apps/mcp/src/connections-store.ts`

Persists named 1C connections to `CONNECTIONS_FILE` (default `./data/connections.json`) at file mode `0o600`.

```typescript
addConnection(entry: ConnectionEntry): void   // writes/updates JSON
removeConnection(name: string): boolean
getConnection(name: string): ConnectionEntry | undefined
listConnections(): ConnectionEntry[]

interface ConnectionEntry { name: string; baseUrl: string; username: string; password: string; }
```

### `apps/mcp/src/telegram-bot.ts`

Long-poll admin bot. **Restricted to a single `ADMIN_CHAT_ID`**.

Commands: `/add [name url user pass]` · `/list` · `/remove <name>` · `/cancel` · `/start` · `/help`

Guided 4-step wizard: name → url → username → password → review → confirm. Pending entries held server-side (passwords exceed Telegram's 64-byte `callback_data` limit). URL auto-gets `/odata/standard.odata` appended if missing.

Inline keyboard: `➕ Add Connection`, `📋 List Connections`, `🗑 Remove <name>` buttons.

Starts via `startAdminBot()` called from `http-index.ts` on server boot (no-ops if `ADMIN_BOT_TOKEN`/`ADMIN_CHAT_ID` not set).

### `apps/mcp/src/chat-agent.ts`

Conversational accounting assistant embedded in the MCP server. Provider-agnostic: uses `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`, falls back to `ANTHROPIC_API_KEY` → `claude-sonnet-4-6`.

7 tools (OpenAI function-call format): `list_organizations`, `get_osv`, `get_account_balance`, `get_account_turnovers`, `list_documents`, `search_contractors`, `get_contractor_settlements`.

- Per-chat history: `MAX_HISTORY = 10` exchange pairs (older pairs trimmed)
- Tool loop: max 6 iterations
- System prompt: replies strictly in Russian, formats numbers with space separators (1 234 567), calls `list_organizations` first if org GUID needed

```typescript
export async function chat(chatId: number, userMessage: string, connection: ConnectionEntry): Promise<string>
export function clearHistory(chatId: number): void
```

### `apps/mcp/src/session-registry.ts`

```typescript
getOrCreateSession(id, config, transportFactory): Promise<Session>
deleteSession(id: string): void
getSessionCount(): number
```

### `apps/mcp/src/config.ts`

Two loaders (replaces the old single `loadConfig()`):

- **`loadConfigFromRequest(authorization?, onecUrl?, defaultOrgGuid?)`** — decodes Basic auth header, validates HTTPS, builds `AppConfig`
- **`loadConfigFromConnectionEntry(entry: ConnectionEntry)`** — builds `AppConfig` from a named connection

Both enforce HTTPS unless `ONEC_ALLOW_HTTP=true`. Defaults: `ONEC_TIMEOUT_MS=30000`, `ONEC_MAX_RETRIES=3`.

### `apps/mcp/src/org-context.ts`

**`buildOrgContext(catalog, configuredDefault?): Promise<OrgContext>`**

Solves the #1 LLM hallucination bug: the model reusing stale org GUIDs from conversation history, causing all-zero results.

Resolution logic in `resolveOrgGuid(provided?)`:
- Valid known GUID → use as-is, `corrected: false`
- Unknown/zero GUID → substitute default, `corrected: true`
- Omitted → use default, `corrected: false`
- Multi-org + no default → throws with list of valid orgs

The context is built once at server startup (per tenant process), stored as a singleton via `setOrgContext()` in `tools/utils.ts`.

```typescript
interface OrgContext {
  orgs: OrgInfo[];
  defaultGuid: string;
  byGuid: Map<string, OrgInfo>;  // keyed by lowercase GUID
  resolveOrgGuid(provided?: string): ResolveResult;
}
```

### `apps/mcp/src/server.ts`

**`createServer(): Promise<McpServer>`** — the DI factory.

Instantiation order (dependency chain):
```
OneCClient
  → CatalogService, DocumentService, RegisterService
    → ProductionService(client, register)
    → AnalyticsService(client, register)
    → AuditorService(client, documentService)
    → CostingService(client, register)
    → IntegrityValidator(client, reportsService, register)
    → TaxValidator(client, register)
    → PeriodCloseValidator(client, register, auditor)
    → DrillDownService(client, register)
    → AccountAnalysisService(client)
  → ReportsService(client)
  → GeneratorService(reportsService, catalogService)
DocflowClient → DocflowService
AccountsService (offline, no deps)
EntitySchemaService(entitiesDir)
GuidResolverService(client, entitySchemaService)
AnomalyMLService(client), AlertService()
InvestigationService(client), DocumentScannerService(client)
```

Then registers all 33 tool groups and 5 static resources:
- `onec://organizations`
- `onec://chart-of-accounts`
- `onec://currencies`
- `accounts://kz-chart` (offline KZ standard chart)
- `onec://kz-workflow` (KZ workflow reference markdown)
- `onec://entities` (dynamic, only if EntitySchemaService has 889 files)

### `apps/mcp/src/tools/utils.ts`

Shared utilities for all tool handlers:

```typescript
// Wrap success response, attach _meta provenance
function ok(data: unknown, meta?: ResponseMeta): ToolResult

// Convert OneCError or generic Error to MCP error response
function wrapError(e: unknown): ToolResult

// Resolve organization GUID via OrgContext singleton
function resolveOrg(provided?: string): { guid, corrected, provided? }

// Set the OrgContext singleton (called once in createServer)
function setOrgContext(ctx: OrgContext): void

interface ResponseMeta {
  orgGuid?: string;
  orgGuidCorrected?: boolean;
  orgGuidProvided?: string;   // original hallucinated value
  rowCount?: number;
  truncated?: boolean;
  note?: string;
}
```

Every tool response carries `_meta` with org provenance so the LLM can see which org was actually queried and whether a GUID was corrected.

---

## 5. Tool Registration Layer

All in `apps/mcp/src/tools/`. Each file exports one `registerXxxTools(server, service)` function.

### Register Tools (`register.tools.ts`)

| Tool | Description | Key Params |
|---|---|---|
| `onec_get_account_balance` | Debit/credit balance from AccountingRegister_Типовой/Balance | `accountCode`, `organizationGuid`, `date` |
| `onec_get_accounting_turnovers` | Debit/credit movement over date range | `accountCode`, `dateFrom`, `dateTo` |
| `onec_get_exchange_rates` | Rates from InformationRegister_КурсыВалют/SliceLast | `currencyCode`, `date` |
| `onec_get_contractor_settlements` | A/R + A/P from AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентамиФизЛицами | `contractorGuid` |
| `onec_get_account_breakdown` | Balance by subconto (ExtDimension1/2) with resolved names | `accountCode`, `dateTo` |
| `onec_get_account_card` | Individual Дт/Кт postings from RecordType. Returns authoritative turnovers even if line detail unavailable | `accountCode`, `dateFrom`, `dateTo` |
| `onec_get_inventory_balance` | Quantity + cost from AccumulationRegister_ТоварыОрганизацийБУ | `organizationGuid`, `nomenclatureGuid`, `date` |

> **Note**: `onec_get_accounting_turnovers` is in the McpClient denylist — hidden from LLM because `onec_analyze_account` supersedes it.

### Account Analysis Tools (`account-analysis.tools.ts`)

| Tool | Description |
|---|---|
| `onec_analyze_account` | Universal 5-view analyser: summary, byCorrAccount (% shares + docTypes), bySubconto, monthlyTrend, risks[]. Mandatory: show all risks with severity emoji and suggestedFix |

**Important OData quirk**: `AccountingRegister_Типовой_RecordType` uses English field names (`AccountDr_Key`, `AccountCr_Key`, `Period`) not Russian ones (`СчетДт_Key`, etc.). This is documented in `AccountAnalysisService`.

### Analytics Tools (`analytics.tools.ts`)

| Tool | Description |
|---|---|
| `onec_get_monthly_trend` | Monthly P&L: revenue (6010), COGS (7010), overhead (7210), gross profit, operating profit |
| `onec_get_financial_summary` | Snapshot: cash (1010+1030), AR (1210), AP (3310), VAT liability (3130−1420), КПН (3110) |

### Reports Tools (`reports.tools.ts`)

14 tools covering:

| Tool | Source |
|---|---|
| `onec_get_osv` | AccountingRegister_Типовой/BalanceAndTurnovers → trial balance |
| `onec_get_all_debtors` | Accounts 1210, 1250, 1251, 1254, 1255 |
| `onec_get_all_creditors` | Accounts 3310, 3350, 3387, 3390 |
| `onec_get_contractor_balance` | All accounts where contractor appears as ExtDimension |
| `onec_get_payments_in` | Document_ПлатежноеПоручениеВходящее |
| `onec_get_payments_out` | Document_ПлатежноеПоручениеИсходящее |
| `onec_get_purchases_report` | Document_ПоступлениеТоваровУслуг with line detail |
| `onec_get_creditors_detailed` | 3310/3350/3387/3390 with payment history, age category |
| `onec_get_advances_received_detailed` | Account 3510 with fulfillment tracking |
| `onec_get_full_liabilities_report` | All liability accounts combined |
| `onec_get_sales_report` | Document_РеализацияТоваровУслуг with line detail |
| `onec_get_cash_flow` | Bank + cash register in/out by month |
| `onec_get_fixed_assets` | Accounts 2410 (cost) and 2420 (depreciation) |
| `onec_get_payroll_documents` | Document_НачислениеЗарплатыРаботникамОрганизаций |
| `onec_detect_anomalies` | Manual ОперацияБух, round amounts ≥1M, unposted docs |

### Validation Drill-Down Tools (`validation-drilldown.tools.ts`)

8 investigation tools — called after a validation tool flags a problem:

| Tool | Investigates |
|---|---|
| `onec_drill_account_sign` | Documents causing wrong-side balance |
| `onec_drill_payroll_tax` | Per-document tax rate deviation from expected |
| `onec_drill_missing_esf` | Sales without matching ЭСФ in InformationRegister_АктуальныеЭСФ |
| `onec_drill_stale_advances` | Aging analysis of 1710 or 3510 by contractor |
| `onec_drill_vat_documents` | Per-sales VAT 3131 vs 6010 × 12% |
| `onec_drill_wip_documents` | Account 8112 inputs (1310, 3350, 2420, 8412) and outputs (1320) |
| `onec_drill_unposted_documents` | Full list of unposted docs by type with fix instructions |
| `onec_drill_unpaid_payments` | Outgoing payments Posted=true but Оплачено=false |

### Validation Integrity Tools (`validation-integrity.tools.ts`)

| Tool | Rule |
|---|---|
| `onec_validate_double_entry` | Σ Дт = Σ Кт for trial balance |
| `onec_validate_account_signs` | Asset accounts must have Дт balance, liabilities Кт |
| `onec_validate_balance_arithmetic` | Opening + turnoverDr − turnoverCr = closing, per account |
| `onec_validate_extdimension` | Contractor/employee/nomenclature accounts must have ExtDimension1 |

### Validation Tax Tools (`validation-tax.tools.ts`)

| Tool | Rule |
|---|---|
| `onec_validate_vat_charged_vs_revenue` | Σ 3131 Кт ≈ Σ 6010 Кт × 12% (±1%) |
| `onec_validate_vat_recoverable_vs_purchases` | 1421 Дт ≤ 3310 Кт × 12/112 |
| `onec_validate_esf_coverage` | Every РеализацияТоваровУслуг → ЭСФ in info register |
| `onec_validate_payroll_tax_rates` | ОПВ 10%, ОППВ 5%, СО 3.5%, ВОСМС 3%, ОСМС 2%, ИПН 10%, СН 9.5%−СО |
| `onec_validate_payroll_deductions` | Flag НачислениеЗарплаты below МЗП (85,000 ₸) |
| `onec_validate_payroll_accrual_balance` | 3350 Кт turnover ≈ Σ НачислениеЗарплаты document amounts |

### Validation Period-Close Tools (`validation-period-close.tools.ts`)

| Tool | Rule |
|---|---|
| `onec_validate_period_close_readiness` | Unposted docs, depreciation presence, ЗакрытиеМесяца status |
| `onec_validate_accrual_alignment` | Revenue→VAT, salary→ОПВ proportionality |
| `onec_validate_depreciation_completeness` | If 2410 > 0, then 2420 must have credit turnover |
| `onec_validate_wip_closure` | Seasonal 8110/8112: 0 in winter, growing spring, closes to 1320 at harvest |
| `onec_validate_cogs_basis` | 7010 Дт ≈ 1320 Кт for period |

### Validation Reconciliation Tools (`validation-reconciliation.tools.ts`)

| Tool | Rule |
|---|---|
| `onec_validate_invoice_payment_matching` | A/R (1210) + A/P (3310) outstanding, top-5 contractors each |
| `onec_validate_contract_terms_compliance` | Expired contracts (СрокДействияПо < period end) |
| `onec_validate_bank_balance_consistency` | Account 1030 ≥ 0 and outgoing payments with Оплачено=false |

### Catalog Tools (`catalog.tools.ts`)

| Tool | Source |
|---|---|
| `onec_search_contractors` | Catalog_Контрагенты by name/РНН/IIC |
| `onec_get_contractor` | Full record with main contract + bank account |
| `onec_search_nomenclature` | Catalog_Номенклатура by name/article |
| `onec_get_warehouses` | Catalog_Склады list |
| `onec_get_contractor_contracts` | Catalog_ДоговорыКонтрагентов for a contractor |
| `onec_get_organizations` | Catalog_Организации with BIN/РНН |

### Document Tools (`document.tools.ts`)

| Tool | Action |
|---|---|
| `onec_search_documents` | Filter by type, date, contractor, Posted status |
| `onec_get_document` | Full document + tabular parts |
| `onec_create_document` | Generic POST to any entity set |
| `onec_post_document` | Post or unpost a document via OData action |

### Production Tools (`production.tools.ts`)

| Tool | Account |
|---|---|
| `onec_get_production_costs` | WIP balance on 8110 |
| `onec_get_materials_balance` | Inventory 1310 from AccumulationRegister_ТоварыОрганизацийБУ |
| `onec_get_finished_goods_balance` | Stock 1320 |
| `onec_get_payroll_taxes_summary` | ОПВ/СО/ВОСМС/ИПН accumulation registers |
| `onec_get_vat_register` | НДС accumulation register |
| `onec_get_pl_summary` | 6010/7010/7210 turnovers |
| `onec_calculate_payroll_taxes` | Pure calc (НК РК 2026 constants, no 1C call) |
| `onec_get_kpn_estimate` | 6010−(7010+7210+7710) × 20% with optional 70% agro reduction |

### Auditor Tools (`auditor.tools.ts`)

| Tool | Description |
|---|---|
| `onec_audit_period_quality` | 5-block quality audit: completeness, errors, balance correctness, tax discipline, dynamics |
| `onec_get_document_journal_entries` | All Дт/Кт entries from AccountingRegister_Типовой_RecordType for a document GUID |
| `onec_verify_account_balance` | Balance + turnovers consistency check |
| `onec_get_esf_status` | InformationRegister_АктуальныеЭСФ count for period |
| `onec_get_unposted_documents` | Documents with Posted=false |
| `onec_get_month_close_status` | ЗакрытиеМесяца found/posted status |

### KZ Accounts Tools (`accounts.tools.ts`)

Offline, no 1C network call:

| Tool | Returns |
|---|---|
| `kz_chart_list_sections` | 8 sections (1–8) |
| `kz_chart_get_section` | Subsections within a section |
| `kz_chart_get_subsection` | Account groups within a subsection |
| `kz_chart_lookup` | Breadcrumb for a 4-digit code |
| `kz_chart_search` | Text search across all 3 levels |

### Other Tool Modules

| Module | Tools |
|---|---|
| `anomaly-ml.tools.ts` | `onec_scan_anomalies_ml` — statistical z-score anomaly scan |
| `costing.tools.ts` | COGS composition, nomenclature unit cost, harvest capitalization |
| `investigation.tools.ts` | Deep document investigation with full tabular parts |
| `metadata.tools.ts` | Live OData schema introspection |
| `entity-schema.tools.ts` | `onec_get_entity_index`, `onec_get_entity_schema` — offline from 889 .md files |
| `guid-resolver.tools.ts` | `onec_resolve_guid_to_entity` — GUID → entity type reverse lookup |
| `stock.tools.ts` | Inventory reports, turnover analysis |
| `fullreport.tools.ts` | Comprehensive financial report (P&L + balance sheet + cash flow) |
| `generator.tools.ts` | `onec_generate_sales_invoice` — create document from template |
| `docflow.tools.ts` | External docflow task/document CRUD |
| `scan.tools.ts` | Document OCR/compliance scan |
| `duediligence.tools.ts` | Contractor due diligence checks |

---

## 6. Services Layer

All in `packages/services/src/`.

### `RegisterService`

Core accounting register queries. Has an in-memory `accountCache: Map<string, string>` for code→GUID lookups.

```typescript
class RegisterService {
  resolveAccountGuid(accountCode: string): Promise<string | null>
  getAccountBalance(code, org?, date?): Promise<AccountCodeResult>
  getAccountTurnovers(code, dateFrom, dateTo, org?): Promise<AccountTurnoverResult>
  getExchangeRates(currencyCode?, date?): Promise<ExchangeRate[]>
  getContractorSettlements(contractorGuid?, org?): Promise<ContractorSettlement[]>
  getAccountBreakdown(code, date, org?): Promise<BreakdownRow[]>
  getAccountCard(code, dateFrom, dateTo, org?): Promise<CardResult>  // two-query approach for RecordType
  getInventoryBalance(org?, nom?, date?): Promise<InventoryBalance[]>
}
```

**`getAccountCard` implementation detail**: Uses two separate queries (Дт side + Кт side) because 1C OData does not support OR in `$filter` at top level. Returns authoritative turnovers from `/Turnovers` virtual table even if RecordType line detail fails (honest `rowsAvailable: false` flag).

### `AccountAnalysisService`

Returns `AccountAnalysisResult` with 5 views:

```typescript
interface AccountAnalysisResult {
  accountCode: string;
  accountName: string;
  period: { from, to };
  summary: { openingBalance, debitTurnover, creditTurnover, closingBalance };
  byCorrAccount: CorrAccountEntry[];  // with % share, docTypes
  bySubconto: SubcontoEntry[];        // ExtDimension1/2/3 with resolved names
  monthlyTrend: MonthEntry[];
  risks: CorrespondenceRisk[];        // from CorrespondenceRules engine
  dataWarnings: string[];             // data-quality guard output
  meta: { recordsScanned, corrAccountTruncated };
}
```

**Opening balance strategy**: Uses `RegisterBalance` at `dateFrom − 1 day` (not BalanceAndTurnovers) because equity/income accounts (5xxx, 6xxx) often show zero opening balance via BalanceAndTurnovers due to period-close bypass.

**RecordType field names**: English (`AccountDr_Key`, `AccountCr_Key`, `Period`) — this is a documented 1C OData quirk.

### `ReportsService`

1,946 lines. Major methods:

- `getOSV(dateFrom, dateTo, org?)` → OSV trial balance from BalanceAndTurnovers
- ==`getAllShortDebtors(org?, date?)` → accounts 1210/1250/1251/1254/1255==
- ==`getAllCreditorsLong(org?, date?)` → accounts 3310/3350/3387/3390==
  get GUID 
- `getIncomingPayments(...)` → Document_ПлатежноеПоручениеВходящее ==c==
- `getOutgoingPayments(...)` → Document_ПлатежноеПоручениеИсходящее
- `getPurchasesReport(...)` → ПоступлениеТоваровУслуг with Товары + Услуги tabular parts
- `getSalesReport(...)` → РеализацияТоваровУслуг with Товары + Услуги tabular parts
- `getContractorBalance(contractorGuid, date?)` → balance across ALL accounts
- `detectAnomalies(dateFrom, dateTo, org?)` → manual entries + round amounts + unposted
- `getDetailedCreditors(org?, date?)` → with payment history, age categories
- `getDetailedAdvancesReceived(org?, date?)` → 3510 with fulfillment tracking
- `getFullLiabilitiesReport(org?, date?)` → all liability sections combined
- `getAdvanceSettlementStatus(contractorGuid, org?)` → 3510/3387 received vs offset
- `getSalesWithLines(contractorGuids[], dateFrom, dateTo, org?)` → group query
- `getGroupBalance(contractorGuids[], groupLabel, date?)` → consolidated balance
- `getCashFlowSummary(dateFrom, dateTo, org?)` → bank + cash by month
- `getFixedAssets(org?, date?)` → 2410/2420 per asset
- `getPayrollDocuments(dateFrom, dateTo, org?)` → НачислениеЗарплатыРаботникамОрганизаций

### `AnalyticsService`

```typescript
getMonthlyTrend(dateFrom, dateTo, org?): Promise<MonthlyTrendResult>
  // revenue = 6010 Кт, cogs = 7010 Дт, overhead = 7210 Дт

getFinancialSummary(org, date?): Promise<FinancialSummary>
  // 7 parallel balance queries: 1010, 1030, 1210, 3310, 3130, 1420, 3110
  // vatLiability = max(0, 3130.creditBalance − 1420.debitBalance)
```

### `AuditorService`

`auditPeriodQuality(org, year, month, register, reports)` — 5-block quality audit:

1. **ПОЛНОТА**: ЗакрытиеМесяца, unposted docs (by type), НачислениеЗарплаты presence
2. **ОШИБКИ**: manual ОперацияБух count/amount, night-time entries (before 07:00 or after 19:00), round amounts ≥1M
3. **ОСТАТКИ**: Дт=Кт check, negative turnovers (red storno), atypical signs, WIP 8110 seasonal check, bank balance 1030
4. **НАЛОГИ**: VAT vs revenue %, payroll taxes presence, КПН (December only)
5. **ДИНАМИКА**: revenue change vs prior period, manual entry count growth

### `CatalogService`

```typescript
searchContractors(query, limit?)  // by name OR РНН OR ИИН using escapeOData()
getContractor(guid)               // with $expand main contract + bank account
searchNomenclature(query, isService?, limit?)
getOrganizations()
getWarehouses()
getContractorContracts(contractorGuid)  // with currency name resolution
```

### `ProductionService`

```typescript
getProductionCosts(org, date?)          // 8110 balance
getMaterialsBalance(org, date?, nom?)   // AccumulationRegister_ТоварыОрганизацийБУ
getFinishedGoodsBalance(org, date?)     // 1320 balance
getPayrollTaxesSummary(org, from, to)   // 4 payroll registers
getVatRegister(org, from, to)
getPLSummary(org, from, to)             // 6010/7010/7210

calculatePayrollTaxes(grossSalary, hasDeductions?): PayrollTaxResult
  // НК РК 2026: МРП=3692, МЗП=85000, 14 МРП deduction
  // ОПВ=10%, ООСМС=2%, ИПН=10%, ОППВ=5%, СО=3.5%, ВОСМС=3%, СН=9.5%−СО

getKPNEstimate(org, from, to, isAgro?): Promise<KPNEstimate>
  // isAgro=true → 70% reduction per Ст.285 НК РК
  // revenue=6010, expenses=7010+7210+7710
```

### `DocumentService`

```typescript
searchDocuments(params: DocSearchParams)
getDocument(type, guid)        // with tabular parts (Товары, Услуги, РасшифровкаПлатежа)
createDocument(entitySet, data)
postDocument(type, guid)
unpostDocument(type, guid)
```

Tabular parts map:
```
РеализацияТоваровУслуг  → Товары, Услуги
ПоступлениеТоваровУслуг → Товары, Услуги
ПлатежноеПоручение*     → РасшифровкаПлатежа
КассовыйОрдер*          → РасшифровкаПлатежа
ПеремещениеТоваров      → Товары
ТребованиеНакладная     → Материалы
```

### Other Services

| Service                    | Key Method                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `MetadataService`          | `listEntities(type)`, `getEntitySchema(name)` — live OData                                                     |
| `EntitySchemaService`      | `listEntities(category)`, `getEntitySchema(name)` — offline 889 .md files                                      |
| `GuidResolverService`      | `resolveGuid(guid)` → entity type + fields                                                                     |
| `AnomalyMLService`         | ==`scanDocuments(from, to, org?)` → z-score outliers, night entries, round amounts, manual entries, unposted== |
| `CostingService`           | `getCOGSComposition()`, `getNomenclatureUnitCost()`, `getRealProductionCosts()`                                |
| `InvestigationService`     | `investigateDocument(type, guid)` — full document with all subconto                                            |
| `DocumentGeneratorService` | `generateSalesInvoice(dto)`                                                                                    |
| `DocflowService`           | Task/document CRUD via DocflowClient                                                                           |
| `DocumentScannerService`   | `scanDocument(guid)` — OCR + compliance                                                                        |

---

## 7. Validation Engine

### `validation/types.ts`

Shared structures for all validators:

```typescript
type Severity = "info" | "warn" | "error" | "critical";
type Category = "integrity" | "tax" | "period-close" | "document" | "reconciliation";

interface ValidationFinding {
  severity: Severity;
  category: Category;
  ruleId: string;
  message: string;
  affectedEntities?: string[];
  suggestedFix?: string;
  ruleSource?: string;
}

interface ValidationReport {
  findings: ValidationFinding[];
  summary: { info, warn, error, critical };
  checkedAt: string;
}

// Helpers
emptyReport(): ValidationReport
add(report, finding): void
finalize(report): ValidationReport
```

### `validation/CorrespondenceRules.ts`

35+ rules for detecting wrong-side postings. Called by `AccountAnalysisService.analyzeAccount()`.

```typescript
function detectCorrespondenceRisks(
  accountCode: string,
  allEntries: CorrEntry[],
): CorrespondenceRisk[]
```

Rule categories:
- **EQ-001a**: Dividends (5xxx→3040) via payroll document type — wrong document
- **EQ-001b**: Dividends when P&L shows loss — critical
- **EQ-002**: Tax accounts (31xx) posted directly to equity (5xxx) — should go to 7xxx/8xxx
- **EQ-003**: Payroll accounts (32xx) posted to equity (5xxx)
- **Intercompany**: Large receivables/payables to related parties
- **Orphaned advances**: >180 days open on 1710/3510
- **Asset sign violations**: Asset accounts with Кт balance
- **Liability sign violations**: Liability accounts with Дт balance

Allowed corr-account prefixes for equity (5xxx): `5xxx ↔ 5xxx/6xxx/7xxx/8xxx` only.

### `validation/DrillDownService`

8 investigation methods returning evidence + step-by-step 1C correction instructions:

```typescript
drillAccountSignViolation(code, dateFrom, dateTo, org?, limit?)
drillPayrollTaxDeviation(taxAccount, dateFrom, dateTo, org?)
drillMissingESF(dateFrom, dateTo, org?)
drillStaleAdvances(date, accountCode, org?, agingDays?)
drillVATDocuments(dateFrom, dateTo, org?)
drillWIPSourceDocuments(dateFrom, dateTo, org?)
drillUnpostedDocuments(documentType, dateFrom, dateTo, org?)
drillUnpaidPayments(dateFrom, dateTo, org?)
```

### Other Validators

| Class | Validates |
|---|---|
| `IntegrityValidator` | Double-entry, account signs, balance arithmetic, ExtDimension presence |
| `TaxValidator` | VAT 12%, VAT recoverable, ЭСФ coverage, payroll rates, deductions, accrual balance |
| `PeriodCloseValidator` | Pre-close readiness, accrual alignment, depreciation completeness, WIP closure, COGS basis |
| `DocumentValidator` | Per-document sign consistency |
| `ReconciliationValidator` | A/R A/P matching, expired contracts, bank balance consistency |

---

## 8. OData Client

### `packages/onec-client/src/OneCClient.ts`

```typescript
class OneCClient {
  // Standard CRUD
  getCollection<T>(entitySet, params): Promise<T[]>
  getByKey<T>(entitySet, guid, params?): Promise<T>
  create<T>(entitySet, data): Promise<T>
  update(entitySet, guid, data): Promise<void>
  delete(entitySet, guid): Promise<void>
  postDocument(type, guid): Promise<void>
  unpostDocument(type, guid): Promise<void>

  // Virtual table functions (Period/StartPeriod/EndPeriod are function params, not $filter)
  getRegisterBalance<T>(register, params & { Period? }): Promise<T[]>
  getRegisterTurnovers<T>(register, params & { StartPeriod?, EndPeriod? }): Promise<T[]>
  getBalanceAndTurnovers<T>(register, params & { StartPeriod?, EndPeriod? }): Promise<T[]>
  getSliceLast<T>(register, params & { Period? }): Promise<T[]>

  // Metadata
  getMetadata(): Promise<string>
}
```

**Retry logic**: Exponential backoff for 500/502/503, max `maxRetries`. Never retries 401/403/404.

**Auth**: Basic auth via `Authorization` header. Credentials never logged.

**Query building** (`buildQueryString`): Encodes `$filter`, `$select`, `$expand`, `$orderby`, `$top`, `$skip` parameters. Always adds `$format=json`.

### `packages/onec-client/src/errors.ts`

Error hierarchy:
```
OneCError (base)
  OneCAuthError       (401)
  OneCForbiddenError  (403)
  OneCNotFoundError   (404)
  OneCServerError     (500)
  OneCNetworkError    (timeout/abort)
```

`parseODataError(body)` extracts `odata.error.message.value` from response JSON.

### `packages/onec-client/src/utils.ts`

```typescript
escapeOData(value: string): string       // '' → '' (OData single-quote escape)
validateAccountCode(code: string): string // validates 4-digit or 4-digit.1-4 format
```

---

## 9. KZ Accounts Reference

### `packages/kz-accounts/src/AccountsService.ts`

Offline, static — loads `data/chart.json` at construction. No network calls.

3-level hierarchy:
- **Sections** (1–8): major asset/liability/income/expense groupings
- **Subsections** (1000–8900): 4-digit prefix groups
- **Account groups** (1010–8960): specific account codes

```typescript
class AccountsService {
  listSections(): Section[]
  getSection(code: "1"|"2"|...|"8"): Section
  getSubsection(code: string): Subsection
  lookupCode(code: string): { section, subsection, group } | null
  search(query: string, limit?: number): SearchResult[]
  getFullChart(): FullChart
}
```

---

## 10. Agent / Bot Layer

### `agent-deepseek/session.mjs`

`AgentSession` — shared by CLI and Telegram bot.

```javascript
class AgentSession {
  constructor(openai, mcp, preloadedHistory = [])
  clearHistory()
  get historyLength()
  async runTurn(userText, onToolCall?): Promise<string>
}
```

**`runTurn` loop**: Max 20 steps. Step 0 uses `tool_choice: "required"` (forces tool use on first turn). Steps 1+ use `"auto"`. Executes all tool calls in parallel via `Promise.all`.

**Skills system**: Reads markdown files from `guide/skills/` directory. Exposes `get_skill(name)` as a built-in tool that returns the skill's markdown instructions.

**System prompt**: Loaded from `guide/11-deepseek-system-prompt.md` (or `SYSTEM_PROMPT_FILE` env). Skill index appended automatically.

**Logging**: Every tool call logs `[mcp] toolName(args) → preview300chars` to stderr.

### `agent-deepseek/mcp-client.mjs`

Manages one MCP child process per tenant. JSONRPC 2.0 over stdio.

```javascript
class McpClient {
  constructor(serverDir, extraEnv = {}, onExit = null)
  async start()                          // spawn + handshake + tool list
  get openaiTools()                      // converted to OpenAI function format, denylist filtered
  get toolCount()                        // after denylist
  get toolCountRaw()                     // before denylist
  get isReady()
  async callTool(name, args): Promise<string>
  stop()
}
```

**Security**: Child env is an ALLOWLIST (`PARENT_PASSTHROUGH`). Only `PATH`, locale vars, `ONEC_*`, `DOCFLOW_*`, `LLM_*` pass through. Parent secrets (`DEEPSEEK_API_KEY`, `TELEGRAM_BOT_TOKEN`, `DB_PATH`, `APP_ENC_KEY`) are never inherited.

**Tool denylist** (hidden from LLM):
- `onec_get_accounting_turnovers` — superseded by `onec_analyze_account`
- Phase 2 (commented): `onec_get_account_balance`, `onec_get_account_breakdown`, `onec_get_account_card`

**Timeout**: 120 seconds per tool call (some like full_report take 2–3 min).

**MCP handshake**: `initialize` → `notifications/initialized` → `tools/list`.

### `agent-deepseek/tenant-manager.mjs`

Process pool with reliability features:

```javascript
async getClient(tenantId): Promise<McpClient>
clearQuarantine(tenantId): void
evictTenant(tenantId): void
stopAll(): void
```

**Configuration** (via env):
- `MAX_WARM_TENANTS` — default 15
- `IDLE_TIMEOUT_MIN` — default 15 minutes
- `SPAWN_CONCURRENCY` — default 3 concurrent spawns
- `SPAWN_MAX_FAILURES` — default 4 before quarantine

**Backoff**: `5s → 10s → 20s → 40s` (doubles each failure). After `MAX_FAILURES`, tenant is quarantined until admin calls `clearQuarantine()`.

**LRU eviction**: When pool reaches `MAX_WARM`, evicts the entry with the oldest `lastUsed` timestamp.

**Idle eviction**: Timer runs every 60s, stops clients idle > `IDLE_TIMEOUT_MS`. Timer uses `.unref()` so it doesn't prevent process exit.

### `agent-deepseek/agent.mjs`

CLI interface. `node agent.mjs` → interactive chat. `node agent.mjs --once "query"` → one-shot.

Commands: `clear` (reset history), `exit`/`quit`.

### `agent-deepseek/bot.mjs`

Telegram multi-tenant bot. Key behaviors:

- **Concurrency guard**: `busy` map prevents concurrent turns per chat
- **Registration wizard**: 4-step flow (company name → URL → username → password → test connect)
- **SSRF guard**: URL must be `https://`, hostname must resolve to public IP (rejects 10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x, 100.64-127.x)
- **Access control**: `isActive(tenant)` checks status=active OR status=trial with unexpired `trial_ends_at`
- **Busy status**: Shows animated status while tools run, edits message with last 3 tool names
- **Rich rendering**: Tries Python sidecar for table PNG rendering + PDF/Excel export buttons (falls back to plain text)
- **Message splitting**: Chunks >4000 chars at newline boundaries
- **HTML conversion**: Markdown → Telegram HTML (bold, italic, code, pre, tables → `<pre>`)

**Admin commands** (restricted to `ADMIN_TELEGRAM_IDS`):
- `/admin_tenants` — list all tenants
- `/admin_status <id> <status>` — change status
- `/admin_quarantine_clear <id>` — reset spawn backoff

### `agent-deepseek/onboard.mjs`

Owner-run CLI for manual tenant registration:
```
node onboard.mjs --company "Acme ТОО" --url https://1c.acme.kz --user user --pass pass --telegram 123456789
node onboard.mjs --list
node onboard.mjs --status <tenantId> active
node onboard.mjs --unlink <telegramId>
node onboard.mjs --clear-quarantine <tenantId>
```

Tests connection before storing by calling `kz_chart_list_sections` (offline tool, fast).

---

## 11. Tenant Registry

### `registry/db.mjs`

SQLite database at `DB_PATH` (env) or `./data/registry.db`. WAL mode enabled.

Schema:
```sql
tenants        (id, name, status CHECK('trial'|'active'|'suspended'|'cancelled'), plan, trial_ends_at, created_at)
tenant_secrets (tenant_id FK, odata_url, username_enc, password_enc, docflow_url?, docflow_user_enc?, docflow_pass_enc?)
users          (telegram_id PK, tenant_id FK, role CHECK('owner'|'member'), linked_at)
history        (id, tenant_id, telegram_id, role, content, tool_calls JSON, tool_call_id, ts)
usage          (tenant_id, day, llm_tokens, tool_calls, PK=(tenant_id,day))
```

Index: `idx_history_chat ON history(tenant_id, telegram_id, ts)`

### `registry/crypto.mjs`

AES-256-GCM encryption for secrets at rest. Storage format: `<hex-iv>:<hex-tag>:<hex-ciphertext>`.

- Key: `APP_ENC_KEY` — 32-byte hex string (64 hex chars)
- Fresh random 96-bit IV per encryption (prevents nonce reuse)
- Authentication tag provides integrity verification

### `registry/tenants.mjs`

CRUD functions:

```javascript
createTenant({ name, odataUrl, username, password, ... })  → { id }
getTenantById(id)
getTenantByTelegramId(telegramId)
getSecrets(tenantId)          // decrypts credentials
updateSecrets(tenantId, ...)  // re-encrypts
setTenantStatus(tenantId, status)
isActive(tenant)              // true if status=active OR unexpired trial
listTenants()
linkUser(telegramId, tenantId, role)
unlinkUser(telegramId)
appendHistory(tenantId, telegramId, msg)
loadHistory(tenantId, telegramId)   // last 40 messages, oldest-first, skipping system
clearHistory(tenantId, telegramId)
recordUsage(tenantId, { tokens, toolCalls })
getUsage(tenantId, days?)
```

---

## 12. Rendering Sidecar

### `render/bridge.mjs`

Spawns `render_cli.py` (Python) for each render request. Three modes:

```javascript
renderSegments(answer): Promise<Array<{type:"text",md:string}|{type:"png",b64:string}>>
renderXlsx(answer): Promise<Buffer|null>   // null if no tables found
renderPdf(answer): Promise<Buffer>
```

Input: JSON → stdin. Output: JSON → stdout. Uses `PYTHON_BIN` env (default: `"python"`).

### `render/cache.mjs`

In-process LRU cache for raw answer markdown. Max 200 entries. Used so PDF/Excel export buttons can re-render without re-running the LLM.

```javascript
put(answer): string   // returns 10-char random key
get(key): string|null
```

---

## 13. Cross-Cutting Patterns

### Org GUID Resolution

**Problem**: LLM reuses stale GUIDs from conversation history → queries return wrong org's data.

**Solution flow**:
```
createServer()
  → buildOrgContext(catalogService, configuredDefault?)
    → catalogService.getOrganizations()  [once at startup]
    → builds Map<lowercaseGuid, OrgInfo>
    → determines defaultGuid (single-org auto-detect or env config)
  → setOrgContext(orgCtx)  [singleton in tools/utils.ts]

Every tool handler:
  → const org = resolveOrg(providedGuid?)
  → calls service with org.guid
  → returns ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected })
```

### Tool Response Provenance

Every tool response optionally carries `_meta`:
```json
{
  "data": "...",
  "_meta": {
    "orgGuid": "xxxx-yyyy-...",
    "orgGuidCorrected": true,
    "orgGuidProvided": "stale-guid",
    "rowCount": 42,
    "truncated": false,
    "note": "organizationGuid «stale» не найден — использован дефолтный"
  }
}
```

### Credential Isolation (Process-Per-Tenant)

```
Bot process (parent)
  - Holds: DEEPSEEK_API_KEY, TELEGRAM_BOT_TOKEN, DB_PATH, APP_ENC_KEY
  - Never passes these to children

MCP child process (per tenant)
  - Receives: ONEC_BASE_URL, ONEC_USERNAME, ONEC_PASSWORD (via allowlisted env)
  - Never sees parent secrets
  - Communicates via JSONRPC 2.0 over stdio
```

### Validation Report Convention

All validators produce `ValidationReport`:
- `findings[]` — zero or more `ValidationFinding` items
- Each finding has severity, category, ruleId, message (Russian), suggestedFix
- `summary` counts by severity
- Bot surfaces error/critical findings; user can drill down with `onec_drill_*` tools

### Correspondence Rule Engine

`CorrespondenceRules.detectCorrespondenceRisks()` is called by `AccountAnalysisService` after building `byCorrAccount`. Rules receive each corr-account entry plus context (all entries, subject account code). Empty result = no issues.

The `onec_analyze_account` tool description instructs the LLM: **if risks[] is non-empty, you MUST show every item** with severity emoji (🔴 critical, 🟠 error, 🟡 warn) and suggestedFix. Never ignore risks[].

### Agro-Specific Logic

- `ProductionService.getKPNEstimate(org, from, to, isAgro=true)` → 70% КПН reduction (Ст.285 НК РК)
- `AuditorService` WIP seasonal check: 8110 must be 0 in winter, growing in spring, close to 1320 at harvest
- `DrillDownService.drillWIPSourceDocuments` notes: "do NOT close 8110 until harvest (Aug–Sep)"
- `onec://kz-workflow` resource includes agro production cycle notes

---

## 14. Build & Scripts

```bash
# MCP Server (HTTP mode — production)
npm run build        # esbuild → dist/http-server.bundle.mjs + copy chart.json
node dist/http-server.bundle.mjs   # start HTTP server on PORT (default 3000)
npm run dev          # tsx --watch (hot reload)
npm run typecheck    # tsc --noEmit

# Docker build & run
docker build -t ai-buh .
docker run -p 3000:3000 --env-file .env ai-buh

# Fly.io deploy
fly deploy           # builds image, deploys to ai-buh-v3 (ams region, 512MB)

# Agent/Bot (DeepSeek layer)
node agent.mjs                      # Interactive CLI
node agent.mjs --once "query"       # One-shot
node bot.mjs                        # Telegram bot
node onboard.mjs --list             # List tenants
node onboard.mjs --company ... --url ... --user ... --pass ... --telegram ...
```

**esbuild alias**: Path aliases resolved at build time (no runtime package resolution needed):
```
@aibos/services    → ./packages/services/src/index.ts
@aibos/onec-client → ./packages/onec-client/src/index.ts
@aibos/kz-accounts → ./packages/kz-accounts/src/index.ts
```

**esbuild ESM bundle quirk**: The bundle includes a `createRequire` banner so CommonJS packages (e.g. `better-sqlite3`) work inside the ESM output:
```js
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
```

---

## 15. Environment Variables

### MCP Server (`.env` in `MCP 1C v1/`)

**Static connection (single-tenant / local dev):**

| Variable | Required | Default | Description |
|---|---|---|---|
| `ONEC_BASE_URL` | ✅ | — | 1C OData base URL (HTTPS enforced; `/odata/standard.odata` auto-appended) |
| `ONEC_USERNAME` | ✅ | — | 1C login |
| `ONEC_PASSWORD` | ✅ | — | 1C password |
| `ONEC_TIMEOUT_MS` | | 30000 | Request timeout in ms |
| `ONEC_MAX_RETRIES` | | 3 | Retry count for 5xx |
| `ONEC_LOG_LEVEL` | | info | Log verbosity |
| `ONEC_ALLOW_HTTP` | | false | Allow HTTP (local testing only) |
| `ONEC_DEFAULT_ORG_GUID` | | — | Default org for multi-org databases |
| `ENTITIES_DIR` | | `/app/Entities` | Path to offline schema .md files |
| `DOCFLOW_BASE_URL` | | not-configured | External docflow URL |
| `DOCFLOW_USERNAME` | | — | Docflow login |
| `DOCFLOW_PASSWORD` | | — | Docflow password |
| `DOCFLOW_TIMEOUT_MS` | | 30000 | Docflow timeout |
| `DOCFLOW_MAX_RETRIES` | | 3 | Docflow retry count |

**LLM (optional — enables AI digest and chat agent):**

| Variable | Default | Description |
|---|---|---|
| `LLM_BASE_URL` | — | Any OpenAI-compatible base URL (OpenAI, OpenRouter, DeepSeek, Ollama, Anthropic) |
| `LLM_API_KEY` | — | API key (empty for Ollama) |
| `LLM_MODEL` | — | Model name. Empty → fallback to `ANTHROPIC_API_KEY` → `claude-sonnet-4-6` |
| `ANTHROPIC_API_KEY` | — | Fallback when `LLM_BASE_URL` not set |

**Admin Telegram bot (zero-redeploy connection management):**

| Variable | Default | Description |
|---|---|---|
| `ADMIN_BOT_TOKEN` | — | Bot token from @BotFather |
| `ADMIN_CHAT_ID` | — | Your Telegram chat ID from @userinfobot. Bot ignores all other chats |
| `CONNECTIONS_FILE` | `./data/connections.json` | Named connection registry (created with mode 0o600) |

**Alert notifications (optional):**

| Variable | Default | Description |
|---|---|---|
| `ALERT_TELEGRAM_TOKEN` | — | Separate bot token for anomaly alerts |
| `ALERT_TELEGRAM_CHAT_ID` | — | Chat to receive alerts |
| `ALERT_WEBHOOK_URL` | — | Slack-compatible webhook (Teams, custom) |
| `ALERT_MIN_SEVERITY` | `warn` | Minimum severity: `info` · `warn` · `error` |
| `ALERT_MIN_CONFIDENCE` | `60` | Minimum ML confidence (0–100) to trigger alert |

### Agent/Bot (`.env` in `agent-deepseek/`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | ✅ | — | DeepSeek API key |
| `TELEGRAM_BOT_TOKEN` | ✅ (bot) | — | Telegram bot token |
| `DEEPSEEK_MODEL` | | deepseek-chat | Model name |
| `APP_ENC_KEY` | ✅ (bot) | — | 32-byte hex key for secret encryption |
| `DB_PATH` | | `./data/registry.db` | SQLite registry path |
| `ADMIN_TELEGRAM_IDS` | | — | Comma-separated admin Telegram IDs |
| `TRIAL_DAYS` | | 14 | Default trial period |
| `MCP_SERVER_DIR` | | `../MCP 1C v1` | Path to MCP server project |
| `MAX_WARM_TENANTS` | | 15 | Max warm MCP child processes |
| `IDLE_TIMEOUT_MIN` | | 15 | Minutes until idle eviction |
| `SPAWN_CONCURRENCY` | | 3 | Max concurrent spawns |
| `SPAWN_MAX_FAILURES` | | 4 | Failures before quarantine |
| `SYSTEM_PROMPT_FILE` | | auto | Override system prompt path |
| `PYTHON_BIN` | | python | Python executable for rendering |
| `SUPPORT_CONTACT` | | — | Support message for unregistered users |

---

## 16. Domain Glossary

| Term | Meaning |
|---|---|
| OSV / ОСВ | Оборотно-сальдовая ведомость — trial balance (opening + turnovers + closing per account) |
| НЗП | Незавершённое производство — work in progress (account 8110) |
| Проводка | Journal entry / posting (Дт/Кт pair) |
| Регистратор | Source document that created a posting |
| Субконто (ExtDimension) | Analytical dimension on an account (contractor, nomenclature, warehouse) |
| Корр. счёт | Corresponding account (counter-account in double-entry) |
| Сальдо | Balance (opening or closing) |
| Оборот | Turnover (movement for the period) |
| Контрагент | Business partner / contractor |
| Номенклатура | Nomenclature / inventory item |
| Склад | Warehouse |
| Организация | Legal entity (organization in the 1C database) |
| ЭСФ | Электронный счёт-фактура — electronic invoice (required for VAT sales in KZ) |
| КПН | Корпоративный подоходный налог — corporate income tax (20%; agro −70%) |
| НДС | Налог на добавленную стоимость — VAT (12%) |
| ОПВ | Обязательные пенсионные взносы — mandatory pension contributions (10% employee) |
| ОППВ | Обязательные профессиональные пенсионные взносы (5% employer, from 2025) |
| СО | Социальные отчисления — social contributions (3.5% employer) |
| ВОСМС | Взносы ОСМС — medical insurance contributions (3% employer) |
| ОСМС | Обязательное социальное медицинское страхование (2% employee) |
| СН | Социальный налог — social tax (9.5% − СО) |
| ИПН | Индивидуальный подоходный налог — individual income tax (10%, −14 МРП deduction) |
| МРП | Месячный расчётный показатель — monthly base unit (3,692 ₸ in 2026) |
| МЗП | Минимальная заработная плата — minimum wage (85,000 ₸ in 2026) |
| Красное сторно | Red storno — negative turnover (reversal entry) |

---

## 17. Key Account Mappings

```
ASSETS
  1010  Cash on hand (Касса)
  1030  Bank (Расчётный счёт)
  1210  Accounts receivable (Покупатели и заказчики)
  1250  Advances paid (short-term)
  1280  Allowance for doubtful debts (contra-asset)
  1310  Raw materials and supplies
  1320  Finished goods
  1330  Goods for resale
  1420  VAT recoverable (Input VAT)
  1421  VAT to be recovered
  1710  Advances issued to suppliers
  2410  Fixed assets (initial cost)
  2420  Accumulated depreciation (contra-asset)
  2521  Main herd (biological assets)
  2950  Growing livestock

LIABILITIES
  3110  Corporate income tax payable (КПН)
  3120  Individual income tax (ИПН withholding)
  3130  VAT payable (output VAT)
  3131  VAT charged (НДС начисленный)
  3150  Social tax (СН)
  3170  Other taxes
  3210  Social contributions payable (СО)
  3211  СО (employer)
  3212  ОСМС (employee)
  3213  ВОСМС (employer)
  3220  ОПВ (employee pension)
  3250  ОППВ (employer pension)
  3310  Accounts payable (suppliers)
  3350  Payroll payable (зарплата к выплате)
  3386  Accountable persons payable
  3387  Other advances received
  3390  Other creditors
  3430  Accrued vacation/bonus reserve
  3510  Advances received from customers
  4110  Long-term accounts payable
  4310  Long-term tax liabilities

EQUITY
  5030  Share capital (Уставный капитал)
  5510  Retained earnings / accumulated loss
  5570  Revaluation reserve
  5610  Current year profit/loss
  5620  Dividends payable
  5710  Other comprehensive income

INCOME
  6010  Revenue from sales
  6110  Interest income
  6250  Other income

EXPENSES
  7010  Cost of goods sold (Себестоимость)
  7210  Administrative expenses (Общие и административные)
  7710  Income tax expense (расходы по КПН)

PRODUCTION (cost accounts)
  8110  Main production / WIP (Основное производство)
  8112  WIP — crop farming (НЗП растениеводство)
  8410  Overhead (Производственные накладные расходы)
  8412  Overhead — crop farming
```

---

---

## 18. HTTP Deployment (Fly.io)

The MCP server runs as a stateless HTTP service, not stdio. Each client connects over HTTP and gets a UUID session.

**Fly.io config** (`fly.toml`):
- App: `ai-buh-v3`
- Region: `ams` (Amsterdam)
- VM: 512 MB RAM
- Internal port: 3000
- Health check: `GET /health`

**Docker image** (non-root, ~150 MB):
```
Stage 1 (builder): node:22-alpine
  npm ci --ignore-scripts
  esbuild bundle → dist/http-server.bundle.mjs
  copy chart.json → dist/data/

Stage 2 (runtime): node:22-alpine
  COPY dist/http-server.bundle.mjs
  COPY dist/data/ → ./data/
  COPY Entities/ → ./Entities/   (889 .md files)
  adduser mcp (non-root)
  chown mcp:mcp /app/data
  CMD ["node", "http-server.bundle.mjs"]
```

**Named connections workflow** (zero-redeploy):
1. DM the admin Telegram bot → `/add` → wizard collects name/url/user/pass → saves to `connections.json` on the volume
2. MCP client connects with header `X-Connection-Name: <name>`
3. Server loads credentials from `connections.json`, creates isolated session

*End of CODEBASE.md — generated from full source read of all 77+ source files. Updated 2026-06-16.*
