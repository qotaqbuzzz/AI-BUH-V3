# MCP 1C v1 — project structure

```
MCP 1C v1/
├── apps/mcp/                    # MCP server application
│   └── src/
│       ├── index.ts             # stdio entry (Cursor / Claude)
│       ├── http-index.ts        # HTTP entry (Docker / Fly.io)
│       ├── server.ts            # tool + resource registration
│       ├── config.ts            # env / header config
│       ├── connections-store.ts # multi-tenant connection registry
│       ├── telegram-bot.ts      # admin bot for connections
│       ├── chat-agent.ts        # LLM chat layer
│       ├── data/
│       │   ├── tool-registry.json   # generated tool index
│       │   └── workflows.json       # named multi-step workflows
│       └── tools/               # 46 MCP tool modules (*.tools.ts)
│
├── packages/
│   ├── onec-client/             # OData HTTP client + docflow
│   ├── services/                # business logic (reports, audit, validation, …)
│   │   └── src/
│   │       ├── validation/      # period close, tax, integrity validators
│   │       ├── costing/         # COGS / production costing
│   │       ├── ml/              # anomaly detection
│   │       └── alerts/          # Telegram / webhook alerts
│   └── kz-accounts/             # static KZ chart of accounts (chart.json)
│
├── Entities/                    # 889 × .md — offline 1C OData schema (runtime)
│   ├── Catalog/
│   ├── Document/
│   ├── InformationRegister/
│   └── …
│
├── scripts/
│   └── build-tool-registry.ts   # regenerates tool-registry.json
│
├── docs/                        # planning & reference (not loaded at runtime)
│   ├── plan.md                  # tool development roadmap
│   ├── codebase-notes.md
│   ├── one-c-workflows.md
│   └── updates/
│
├── data/                        # runtime local state (gitignore connections)
│   └── connections.json         # saved 1C connections (secrets)
│
├── dist/                        # build output (gitignored) — npm run build
├── node_modules/                # dependencies (gitignored) — npm install
│
├── package.json                 # workspace root + scripts
├── tsconfig.json                # typecheck
├── tsconfig.build.json          # optional tsc emit → dist/
├── Dockerfile                   # HTTP deploy image
├── fly.toml                     # Fly.io config
├── README.md                    # setup & capabilities
└── .env / .env.example          # secrets & config
```

## Regenerating artifacts

| Artifact | Command |
|----------|---------|
| `node_modules/` | `npm install` |
| `dist/` | `npm run build` |
| `apps/mcp/src/data/tool-registry.json` | `npm run build:registry` |

## Do not move without code changes

- **`Entities/`** — default path for `ENTITIES_DIR`; Docker copies it to `/app/Entities`
- **`data/connections.json`** — path hardcoded in `connections-store.ts` (override via `CONNECTIONS_FILE`)
- **`packages/kz-accounts/src/data/chart.json`** — copied into `dist/data/` on build
