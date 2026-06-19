# onec-kz-mcp — Universal MCP Server for 1C:Бухгалтерия Kazakhstan

MCP (Model Context Protocol) server for **Kazakhstan accounting and finance** — connects Claude to any 1C:Бухгалтерия database via OData. Works for **any KZ industry**: agro, manufacturing, trade, services, construction, transport. TypeScript, Node ≥ 18, stdio transport.

> **MCP 1C v1** — universal successor to the agro-specific server. Industry auto-detected from sales nomenclature and account balances.

## Capabilities

### 1C Live Data (OData) — 62 tools

| Category | Tools | Description |
|---|---|---|
| Catalogs | 6 | Contractors, nomenclature, organizations, warehouses |
| Documents | 4 | Search, fetch, create, post/unpost |
| Registers | 7 | Account balances, turnovers, inventory, exchange rates |
| Reports | 15 | Trial balance (ОСВ), payroll, taxes, debtors/creditors |
| Production | 8 | WIP (8110), finished goods (1320), P&L, payroll-tax calc, КПН estimate |
| Auditor | 6 | Manual entries, round amounts, statistical outliers, VAT check |
| Investigation | 2 | Payment tracing, duplicate detection |
| Analytics | 2 | Monthly P&L trend, financial snapshot |
| Generator | 4 | HTML Акт сверки, Справка о задолженности |
| Stock | 1 | Full inventory with warehouse/cost detail |
| ML Anomaly | 2 | Z-score outlier detection with Telegram/webhook alerts |
| Due Diligence | 3 | Advance settlement, grouped contractor analysis |
| Docflow | 3 | 1С:Документооборот integration (optional) |
| Metadata | 1 | List available 1C entity types |

**Live resources:** `onec://organizations`, `onec://chart-of-accounts`, `onec://currencies`, `onec://kz-workflow`

### KZ Regulatory Reference (static) — 5 tools

The official Kazakhstan standard chart of accounts (Типовой план счетов РК, ~200 account groups) embedded as local data — no network call required.

| Tool | Description |
|---|---|
| `kz_chart_list_sections` | All 8 top-level sections |
| `kz_chart_get_section` | Section + subsections |
| `kz_chart_get_subsection` | Subsection + account groups |
| `kz_chart_lookup` | Any code → detail + breadcrumb path |
| `kz_chart_search` | Full-text search in Russian |

**Static resource:** `accounts://kz-chart`

## Architecture

See **[STRUCTURE.md](./STRUCTURE.md)** for the full folder map.

```
MCP 1C v1/
├── apps/mcp/src/         ← MCP server (stdio + HTTP), 46 tool modules
├── packages/             ← onec-client, services, kz-accounts
├── Entities/             ← 889 offline 1C schema .md files
├── docs/                 ← plan, workflows, dev notes (not runtime)
├── data/                 ← connections.json (local secrets)
├── scripts/              ← build-tool-registry.ts
├── Dockerfile, fly.toml  ← deploy
└── package.json          ← npm workspace root
```

## Universal vs Agro Features

| Feature | Universal (default) | Agro mode |
|---|---|---|
| WIP account 8110 | НЗП for any manufacturer | Season НЗП — do NOT close until harvest |
| Finished goods 1320 | Any finished goods | Harvested grain/crops |
| P&L summary | Any industry 6010/7010/7210 | Same |
| КПН estimate | 20% flat rate | 20% − 70% reduction (Ст.285) |
| `isAgro` flag | `false` (default) | `true` |
| Industry detection | Auto from nomenclature | Detected by bio-assets + keywords |

To enable agro-specific КПН reduction, pass `isAgro: true` to `onec_get_kpn_estimate`.

## Setup

```bash
cd "MCP 1C v1"
npm install
cp .env.example .env
# fill in ONEC_BASE_URL, ONEC_USERNAME, ONEC_PASSWORD
npm run typecheck     # verify — zero errors expected
```

## Running

```bash
npm run dev    # hot-reload (tsx --watch)
npm start      # production
```

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ONEC_BASE_URL` | ✅ | — | `/odata/standard.odata` appended automatically if absent |
| `ONEC_USERNAME` | ✅ | — | 1C Basic Auth user |
| `ONEC_PASSWORD` | ✅ | — | 1C Basic Auth password |
| `ONEC_TIMEOUT_MS` | | `30000` | HTTP timeout per request |
| `ONEC_MAX_RETRIES` | | `3` | Retried on 500/502/503 |
| `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` | | — | Any OpenAI-compatible LLM for AI digest in full report |
| `ALERT_TELEGRAM_TOKEN` / `ALERT_TELEGRAM_CHAT_ID` | | — | ML anomaly alerts |
| `ALERT_WEBHOOK_URL` | | — | Slack/Teams webhook |
| `DOCFLOW_*` | | — | 1С:Документооборот (optional) |

## НК РК 2026 Rates

| Tax | Rate | Notes |
|---|---|---|
| КПН | 20% | Agro reduction −70% via `isAgro=true` (Ст.285) |
| НДС | 12% | |
| ИПН | 10% | Standard deduction 14 МРП = 51,688 тг |
| ОПВ | 10% (employee) | |
| ОППВ | 5% (employer) | From 01.01.2025 |
| СО | 3.5% (employer) | |
| ВОСМС | 3% (employer) | |
| ООСМС | 2% (employee) | |
| СН | 9.5% − СО | |
| МРП 2026 | 3,692 тг | |
| МЗП 2026 | 85,000 тг | |
