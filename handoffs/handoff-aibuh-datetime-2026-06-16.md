# Handoff — AI BUH MCP 1C Server · Next focus: Date/Time

**Date:** 2026-06-16  
**Repo:** https://github.com/qotaqbuzzz/AI-BUH-V3  
**Live app:** https://ai-buh-v3.fly.dev  
**Working directory:** `/Users/raimbek/Desktop/DEVOPS/AIBuh-V-2.1-main/MCP 1C v1`  
**Parent repo root:** `/Users/raimbek/Desktop/DEVOPS/AIBuh-V-2.1-main`

---

## What was built this session

A production multi-tenant MCP HTTP server that lets independent users connect to their own 1C:Бухгалтерия OData databases without sharing credentials.

### Architecture
- **Entry point:** `apps/mcp/src/http-index.ts` — HTTP server on port 3000
- **Endpoints:** `POST/GET/DELETE /mcp` (MCP JSON-RPC), `GET /health`
- **Session isolation:** `apps/mcp/src/session-registry.ts` — one McpServer + OneCClient per session, 30-min idle TTL
- **OrgContext isolation:** `apps/mcp/src/tools/utils.ts` — AsyncLocalStorage so 27 tool files need no changes
- **Connection registry:** `apps/mcp/src/connections-store.ts` — persists to `/app/data/connections.json` (mode 0o600)
- **Telegram admin bot:** `apps/mcp/src/telegram-bot.ts` — guided wizard UX with inline buttons

### Connection methods (two options, pick one per session)
```
# Option A — named connection (admin-registered via Telegram bot)
X-Connection-Name: <name>

# Option B — raw credentials per request
Authorization: Basic <base64(user:pass)>
X-OnecUrl: https://host/DatabaseName
```

### Telegram bot UX (just deployed)
- `/start` → welcome card with [Add Connection] [List] inline buttons
- Tap Add → step-by-step wizard: name → URL → username → password → review card (Save / Cancel buttons)
- `/list` → each connection has inline Remove button
- `/cancel` → exits wizard at any step
- One-liner still works: `/add name url user pass`
- callback_query handled for all inline buttons

### Infrastructure
- **Fly.io app:** `ai-buh-v3`, region `ams`, 2 machines (1 running, 1 stopped standby)
- **Docker:** two-stage build; esbuild bundles to `dist/http-server.bundle.mjs`; runtime image is `node:22-alpine` as non-root user `mcp`
- **Fly secrets (redacted):** ADMIN_BOT_TOKEN, ADMIN_CHAT_ID
- **fly.toml:** `MCP 1C v1/fly.toml`

### Bugs fixed this session
1. `.dockerignore` excluded `tsconfig.json` → esbuild failed → fixed with specific glob patterns
2. Missing `AlertService.ts` → build error → created `packages/services/src/alerts/AlertService.ts`
3. `Dynamic require of "fs"` crash (dotenv CJS in ESM bundle) → fixed with esbuild `--banner:js` createRequire shim
4. `/app/data` owned by root → mcp user could not write `connections.json` → fixed: create user before mkdir, added `chown mcp:mcp /app/data`

---

## Current state

- Server: **healthy** (`GET /health` returns `{"status":"ok","sessions":0}`)
- Telegram bot: **running** (machine 08003d0b21e238 restarted as last action)
- No 1C connections registered yet — user was about to add their first connection via the bot when session ended

---

## Next focus: Date / Time

The user wants to work on date and time. Likely candidates (clarify at session start):

1. **Date formatting in OData responses** — 1C OData returns dates as `/Date(ms)/` or ISO strings; tools may need to normalise for LLM consumption
2. **Date filters in tool inputs** — tools like `onec_list_documents` may accept date ranges; 1C OData filter syntax: `$filter=Date ge datetime'2024-01-01T00:00:00'`
3. **Timezone handling** — 1C server likely UTC+5 (Kazakhstan); responses and filters may need TZ-aware conversion
4. **Report date ranges** — `onec_generate_full_report` or similar may need start/end date params

### Where to look
- Tool definitions: `apps/mcp/src/tools/` (27 files)
- 1C entity schemas: `Entities/` directory (889 `.md` files)
- Services layer: `packages/services/src/`

---

## Key files quick reference

| File | Purpose |
|------|---------|
| `apps/mcp/src/http-index.ts` | HTTP entry point |
| `apps/mcp/src/session-registry.ts` | Per-user session pool |
| `apps/mcp/src/config.ts` | Config loaders (env / headers / connection entry) |
| `apps/mcp/src/connections-store.ts` | Named connection registry (JSON file) |
| `apps/mcp/src/telegram-bot.ts` | Admin bot with wizard UX |
| `apps/mcp/src/tools/utils.ts` | withOrgContext, resolveOrg, AsyncLocalStorage |
| `apps/mcp/src/server.ts` | createServer(config) — wires all tools |
| `packages/services/src/alerts/AlertService.ts` | Anomaly alert dispatcher |
| `Dockerfile` | Two-stage build; esbuild bundle |
| `fly.toml` | Fly.io config |

---

## Suggested skills

- `/handoff` — to pass work to another session
- `/ultrareview` — code review before shipping date/time changes
- Use `ecc:typescript-reviewer` agent for any new tool code touching date handling
- Use `ecc:security-reviewer` if any date params are user-supplied (OData $filter injection risk)

---

## Commands to resume quickly

```bash
# Check server health
curl https://ai-buh-v3.fly.dev/health

# View live logs
cd "/Users/raimbek/Desktop/DEVOPS/AIBuh-V-2.1-main/MCP 1C v1" && fly logs --app ai-buh-v3

# Deploy after changes
cd "/Users/raimbek/Desktop/DEVOPS/AIBuh-V-2.1-main/MCP 1C v1" && fly deploy
```
