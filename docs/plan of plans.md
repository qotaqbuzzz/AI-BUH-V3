# MCP 1C v2 — "Knows-the-Books" Bot Spec

**Status:** Draft v2.2 · **Owner:** suleimenovraim@gmail.com · **Date:** 2026-06-19
**Repos:**
- MCP server: `/Users/raimbek/Desktop/DEVOPS/AIBuh-V-2.1-main/MCP 1C v1`
- DeepSeek agent: `/Users/raimbek/Desktop/DEVOPS/AIBuh-V-2.1-main/agent-deepseek`

**LLM stack:** DeepSeek-Reasoner (R1, `deepseek-reasoner`) as the agent LLM, with `deepseek-chat` (V3) as a fallback for cheap probes only. Single client class (`api.deepseek.com/v1`, OpenAI-compatible). No Claude / Cursor / other client support in v2 scope.

**Agent shape:** DeepSeek R1 runs a **deep-reasoning multi-tool loop** — for any non-trivial question it chains several tool calls (e.g., resolve contractor → fetch balance → cross-check with debtors report → reconcile) inside a single reasoning span, then renders the composed answer. The MCP server provides both the high-level `onec_answer` composer **and** a curated set of mid-level "thinking primitives" so R1 can either delegate the whole question or assemble its own plan. This is intentional: R1 is good enough to plan multi-step questions, and the composer is a shortcut for canonical patterns — both surfaces co-exist.

---

## 1. Context

The product is a bot that "knows everything on the company books and answers any question" for an accountant / CFO / CEO persona, backed by 1C:Enterprise Kazakhstan via OData. v1 shipped 158 tools, an advisory `onec_find_tool` router, and proven end-to-end retrieval (e.g., Agrosyndicate debtors query).

The agent surface is **DeepSeek** driving the conversation: `agent-deepseek/bot.mjs:48` instantiates an OpenAI-compatible client against `https://api.deepseek.com/v1`, `agent-deepseek/mcp-client.mjs` spawns the MCP server as a stdio child process (denylist filter at lines 144-150), and `guide/11-deepseek-system-prompt.md` carries the persona/routing prompt. Telegram is the user channel today; the eval harness will call DeepSeek directly.

The system today is a **tool exposure layer**, not a reliable **answer generator**, and DeepSeek's compliance with the routing policy is enforced only by the system prompt — there is no MCP-side guarantee. v2 closes both gaps. Without v2, "any question" is a demo; with v2 it is a product the finance team can stake decisions on.

The gaps v2 must close (in priority order):

| # | Gap | Risk if unfixed |
|---|---|---|
| 1 | Org-context silently falls back to default GUID | Confidently-wrong numbers for the wrong company |
| 2 | No provenance/reasoning trail on answers | User cannot audit; trust collapses on first bad number |
| 3 | No eval harness for "any question" promise | Quality is invisible; regressions ship undetected |
| 4 | Tool router (`onec_find_tool`) is advisory; only enforced by system prompt | DeepSeek can bypass on long contexts; denylist filter is post-hoc, not pre-emptive |
| 5 | OData coverage gaps (mutual settlements 404, no `$metadata` on some endpoints) | Whole question classes silently unanswerable |
| 6 | Stateless conversation — no carry-over of subject | Follow-ups ("what about advances?") re-route blindly |
| 7 | Tool overlap — multiple valid routes can return slightly different numbers | No reconciliation = user sees contradictions |
| 8 | Deleted skill docs (`kz-agro-*.md`) still referenced by tools | Dead help links; lost domain knowledge |
| 9 | Agent doesn't render trail/conflicts (DeepSeek-side) | Composer output wasted; user sees raw amount with no audit handles |
| 10 | Agent is single-shot, can't chain tools for non-canonical questions | "Any question" reduces to "any question matching a canonical pattern" |

---

## 2. Goals & Non-Goals

### Goals
- Every numeric answer carries source + as-of + org GUID + tool-trail.
- Wrong-org answers are **impossible**, not "unlikely."
- An eval suite runs in CI and produces a single accuracy score.
- **DeepSeek R1 runs a deep reasoning loop** — multi-tool sequencing per user turn, up to a bounded iteration cap, with visible chain-of-thought captured in the trail.
- Both surfaces coexist: `onec_answer(question, context?)` as a fast path for canonical questions, plus a curated set of ~15-20 mid-level primitives R1 can chain when the question doesn't fit a canonical pattern.
- Conversation continuity at the MCP session level (HTTP transport) and explicit context at stdio.

### Non-Goals (v2)
- Write-back to 1C. Read-only stays the contract.
- Replacing the 158-tool surface — v2 is a layer **on top**, not a rewrite.
- LLM fine-tuning. The router improves via lexicon + workflows, not model weights.
- Multi-language UI; Russian + English only as today.
- **Cross-client compatibility.** Claude Desktop, Cursor, etc. are out of scope. Server stays MCP-spec-compliant so they may work, but quality is only tested against DeepSeek.
- **Switching transports.** stdio child-process stays the agent path. HTTP transport keeps shipping for future multi-tenant work but is not the focus of v2.

---

## 3. Current Architecture (Snapshot)

Grounded in code as of `main @ a7ce0a3`:

### 3a. MCP server (`MCP 1C v1/`)
- **Server entry** — `apps/mcp/src/server.ts:142-165` initializes `McpServer({ name: "onec-kz" })` with `instructions` field wired (lines 148-163) carrying the "always call `onec_find_tool` first" policy.
- **Transports** — stdio (`apps/mcp/src/index.ts:1-10`, primary for DeepSeek agent) and HTTP Streamable (`apps/mcp/src/http-index.ts:25-181`, `PORT=3000` at line 35, `session-registry.ts:14-41`, 30-min idle TTL — kept available, not used by agent today).
- **Org context** — `apps/mcp/src/org-context.ts:46-112` resolves once at startup. Lines 55-59 tolerate OData failure → degraded mode. Lines 86-110 silently map unknown/zero GUIDs to `defaultGuid`. **This is gap #1.**
- **Tool registration** — 158 tools across catalog/register/auditor/payroll/fixed-asset/etc. registered via `apps/mcp/src/tools/register.tools.ts`. Router defined in `apps/mcp/src/tools/tool-discovery.tools.ts:6-37`.
- **ToolDiscoveryService** — `packages/services/src/ToolDiscoveryService.ts:9-17, 108-180`. Weighted scoring (+20 keyword, +15 verb, +10 domain, +8 persona, +5 GL account, +3 entity, +2 fuzzy, −10/−5 mismatches). Loads pre-built `tool-registry.json` (3,459 lines). Workflow catalog at `apps/mcp/src/data/workflows.json`. Routing **advisory only**.
- **OneCClient** — `packages/onec-client/src/OneCClient.ts:20-207`. OData std + virtual-table register queries (lines 132-180). Retries 500/502/503 with backoff (lines 45-97), never 401/403/404. **No caching, no provenance recording.**
- **Provenance metadata** — `apps/mcp/src/tools/utils.ts:15-39` already defines `ResponseMeta { orgGuid, orgGuidCorrected, rowCount, truncated, note }` and `ok(data, meta)`. **Foundation exists; v2 extends it.**
- **Tests** — service-layer unit tests only (`packages/services/src/AccountAnalysisService.test.ts`). No eval harness, no `/evals` dir.
- **Skill docs** — `kz-agro-{accounting,costing-flow,validation-rules}.md` deleted from `apps/mcp/src/skills/`, still referenced as `kz-agro-validation-rules.md#A.1` etc. in `apps/mcp/src/tools/validation-drilldown.tools.ts`. **Dead links.**
- **Per-tool LLM hook** — `apps/mcp/src/tools/fullreport.tools.ts` calls a generic OpenAI-compatible endpoint via `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`. Separate from the agent LLM; will point at DeepSeek for v2.

### 3b. DeepSeek agent (`agent-deepseek/`)
- **bot.mjs** — Telegraf bot, line 48 instantiates `new OpenAI({ baseURL: "https://api.deepseek.com/v1" })`; reads `DEEPSEEK_API_KEY` (line 37) and `DEEPSEEK_MODEL` (line 38). Per-chat `AgentSession` dispatches messages.
- **mcp-client.mjs** — Spawns MCP server as stdio child; JSON-RPC over stdin/stdout. **Denylist filter at lines 144-150** removes tools from the list DeepSeek sees. This is the closest thing to enforced routing today, but it's manually curated.
- **System prompt** — `guide/11-deepseek-system-prompt.md` (lines 9-135). Accountant persona, strict data-source policy ("NEVER use your own training knowledge", lines 18-24), risk-display rules (lines 62-66). Already nudges DeepSeek toward `onec_find_tool`-first; not yet aware of `onec_answer`.
- **Config** — `agent-deepseek/.env.example` lines 8-9: `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`. Model defaults to whatever is set in `.env`; spec assumes `deepseek-chat` (V3) — confirm in Open Questions.

---

## 4. Target Architecture

```
   Telegram user                       Eval harness (CI)
        │                                     │
        ▼                                     ▼
┌─────────────────────┐         ┌──────────────────────────┐
│  bot.mjs (Telegraf) │         │  evals/runner.ts         │
│   per-chat session  │         │   direct DeepSeek calls  │
│   renders trail +   │         │   scores against golden  │
│   conflicts in reply│         │   Q→A YAML               │
└──────────┬──────────┘         └─────────────┬────────────┘
           │                                  │
           ▼                                  │
┌──────────────────────────────────────────┐  │
│  DeepSeek R1 (api.deepseek.com/v1,       │◄─┘
│   model=deepseek-reasoner)               │
│  ┌──── REASONING LOOP, ≤8 tool calls ──┐ │
│  │ think → call → result → think → …   │ │
│  │ tool surface: primary + primitive   │ │
│  │ (~18 tools, ~135 internal hidden)   │ │
│  └─────────────────────────────────────┘ │
└──────────┬───────────────────────────────┘
           │ multi-turn tool calls (OpenAI-compat)
           ▼
┌──────────────────────────────────────────┐
│  mcp-client.mjs (stdio JSON-RPC)         │
│   • tiered allowlist (primary+primitive) │
│   • surfaces _meta.trail to bot          │
│   • appends reasoning_content to trail   │
└──────────┬───────────────────────────────┘
           │ stdio
           ▼
┌──────────────────────────────────────────┐
│  MCP Server (onec-kz v2)                 │
│  ┌────────────────────────────────────┐  │
│  │  onec_answer(question, context?)   │◄── NEW primary tool
│  │   ├─ AnswerComposer                │  │
│  │   │   ├─ router (find_tool)        │  │
│  │   │   ├─ orchestrator (1..N tools) │  │
│  │   │   ├─ reconciler (cross-check)  │  │
│  │   │   └─ provenance writer         │  │
│  │   └─ returns {answer,trail,confl.} │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  158 tools — hidden via denylist + │  │
│  │  _hidden meta flag; still callable │  │
│  │  + ProvenanceRecord per call       │  │
│  │  + strict org binding              │  │
│  └────────────────────────────────────┘  │
└──────────┬───────────────────────────────┘
           ▼
       1C OData (+ /hs/reports fallback for gap-5)
```

---

## 5. Gap-by-Gap Design

### Gap 1 — Strict Org Binding
**File:** `apps/mcp/src/org-context.ts`

- Replace the silent `defaultGuid` fallback (lines 86-110) with a **strict resolver**:
  - Unknown GUID → throw `OrgContextError` with the list of valid orgs.
  - Zero-value GUID → throw, do **not** map.
  - `ONEC_DEFAULT_ORG_GUID` becomes opt-in only when caller explicitly passes `org: "default"`.
- Every tool that accepts `orgGuid` validates against `OrgContextSet.byGuid` at call time, not boot time.
- Multi-tenant HTTP sessions: bind `orgGuid` into `SessionContext` (see Gap 6) on first use; subsequent calls in the same session must match or be re-confirmed.
- **Telemetry:** log every `orgGuidCorrected: true` as a v1-era event so we can prove the silent-fallback rate drops to zero.

### Gap 2 — Provenance / Answer Composer (MCP-side)
**New files:**
- `apps/mcp/src/composer/AnswerComposer.ts`
- `apps/mcp/src/composer/ProvenanceRecord.ts`
- `apps/mcp/src/tools/answer.tools.ts` (registers `onec_answer`)

**Extends:** `apps/mcp/src/tools/utils.ts` `ResponseMeta` interface.

`ProvenanceRecord` per tool call:
```ts
{
  toolName: string;
  odataUrl: string;          // exact URL hit (sans credentials)
  asOf: ISO8601;             // server clock at request
  orgGuid: string;
  rowCount: number;
  durationMs: number;
  cacheHit: boolean;         // false for now (Gap 5 may add cache)
}
```

`onec_answer(question, context?)` returns:
```ts
{
  answer: string;            // human-readable summary in user's language
  values: Array<{ label, amount, currency, asOf, source }>;
  trail: ProvenanceRecord[]; // ordered, includes find_tool decision
  conflicts: ConflictReport[]; // see Gap 7
  followups: string[];       // suggested next questions
}
```

OneCClient (`packages/onec-client/src/OneCClient.ts`) gets a thin `recordProvenance(callback)` hook so every request emits a `ProvenanceRecord` without each tool wrapping manually.

### Gap 3 — Eval Harness
**New dir:** `evals/` at repo root.

Structure:
```
evals/
  questions/
    receivables.yaml      # ~20 questions per domain
    payables.yaml
    cash.yaml
    payroll.yaml
    vat-esf.yaml
  fixtures/               # snapshot of 1C state for offline runs
  runner.ts               # tsx evals/runner.ts
  scorer.ts               # exact-match + tolerance for amounts
  report.ts               # generates markdown report
```

Each question:
```yaml
- id: AR-001
  question_ru: "Сколько Агросиндикат нам должен на сегодня?"
  question_en: "How much does Agrosyndicate owe us as of today?"
  expected:
    type: amount
    value: 2_500_000
    currency: KZT
    tolerance_pct: 0.5
    as_of: "2026-06-19"
  must_call: [onec_find_tool]
  must_cite_source: true
```

- **v0 target:** 20 questions, manually scored. Runs nightly.
- **v1 target:** 100 questions across all domains, CI gate at 90%+ accuracy.
- Add `npm run eval` script in `package.json` next to existing `test`.

### Gap 4 — Routing Enforcement (Tiered Allowlist)
**Files:** `apps/mcp/src/tools/answer.tools.ts` (new) + `server.ts` + `agent-deepseek/mcp-client.mjs:144-150` + `guide/11-deepseek-system-prompt.md` + `apps/mcp/src/tools/tiers.ts` (new).

Because R1 is the agent, "hide all 158 tools behind `onec_answer`" is too restrictive — it strips the reasoning model of the building blocks it needs to compose non-canonical answers. Instead, three tiers with explicit metadata:

| Tier | Flag | Count | Examples | Exposed to R1? |
|---|---|---|---|---|
| **Primary** | `_tier: "primary"` | 3 | `onec_answer`, `onec_find_tool`, `onec_skill_lookup` | Yes — preferred entry-points |
| **Primitive** | `_tier: "primitive"` | ~15-20 (curated in `tiers.ts`) | `onec_get_organizations`, `onec_resolve_contractor`, `onec_contractor_balance`, `onec_debtors_report`, `onec_period_close`, `onec_cash_balance`, `onec_account_turnovers`, `onec_employee_payroll`, … | Yes — for multi-step reasoning |
| **Internal** | `_tier: "internal"` | ~135 (everything else) | Specialized one-off tools (`onec_*_kz_agro_*`, deep validation drilldowns) | No — orchestrator-only |

- **MCP-side:** add `_tier` metadata at registration (`apps/mcp/src/tools/register.tools.ts`). `tiers.ts` exports the curated allowlist and a `tier(toolName) → "primary"|"primitive"|"internal"` resolver.
- **Agent-side `mcp-client.mjs:144-150`:** flip denylist → allowlist. Forward only tools whose tier is `primary` or `primitive`. Internal tools remain reachable via `onec_answer`'s orchestrator and via `onec_find_tool`'s recommendations rendered as primitives.
- **System prompt (`guide/11-deepseek-system-prompt.md`):** rewrite routing section:
  1. For canonical questions (debt, cash on hand, P&L bucket totals), use `onec_answer(question)` — one-shot, returns trail.
  2. For non-canonical / multi-step questions, **reason step-by-step**: call `onec_find_tool(intent)` to discover candidate primitives; then call primitives in sequence; cite the trail you built.
  3. Never invent numbers. If no primitive returns the needed data, say so explicitly.
- **Bounded loop (in `bot.mjs`):** cap R1 at `MAX_TOOL_CALLS_PER_TURN = 8` (env-overridable). Hard stop with an error to the user if exceeded, to prevent runaway cost.

Net effect: routing is no longer "single-tool funnel" but "tiered surface" — R1 can do real multi-step reasoning, internal tools stay hidden, and the composer is the fast path for the 80% canonical questions.

### Gap 5 — OData Coverage
**New file:** `docs/odata-coverage.md` (audit output).
**Extends:** `packages/onec-client/src/OneCClient.ts` with HTTP-report fallback paths.

- **Audit pass:** systematically hit every register/document/catalog endpoint, record HTTP code + sample row. Document gaps (e.g., mutual settlements 404, `$metadata` missing).
- **Fallback paths:** for confirmed gaps, identify the corresponding 1C HTTP service (`/hs/<service>`) and add a typed client method. Memory shows `/hs/odata/standard.odata` is reachable; extend to `/hs/reports/<reportName>` style for cases OData can't serve.
- **Capability registry:** `packages/onec-client/src/Capabilities.ts` exports `{ entityName → { odata: bool, hsReport: bool, knownIssues: string[] }}`. `find_tool` reads this and refuses to recommend tools backed by known-broken endpoints, recommending an alternative instead.

### Gap 6 — Conversation Context (Subject Carry-Over)
**Files:** `agent-deepseek/bot.mjs` (primary owner) + `apps/mcp/src/tools/answer.tools.ts` (accepts context arg).

Because the agent path is stdio child-process (one MCP process per agent), session state **lives in `bot.mjs` per Telegram chat**, not in the MCP server. The MCP server is stateless w.r.t. conversation; the agent passes context explicitly.

Per-chat state in `bot.mjs` (extend existing `AgentSession`):
```ts
interface ChatSession {
  chatId: number;
  orgGuid: string;            // pinned on first use, see Gap 1
  lastSubject?: { type: 'contractor'|'employee'|'asset'|'doc', guid: string, name: string };
  lastPeriod?: { start: ISODate, end: ISODate };
  recentTrail: ProvenanceRecord[]; // last 10 onec_answer calls
}
```

- `onec_answer(question, context?)` accepts `context: { subject?, period?, recentTrail? }` from the agent.
- Resolution rule: when DeepSeek calls `onec_answer` with no explicit subject and `lastSubject` exists, the agent injects it into `context` before forwarding.
- System prompt is updated so DeepSeek knows it can ask "do you mean Agrosyndicate still?" rather than blindly re-routing.
- The MCP-side `SessionContext` work in v1 (HTTP `session-registry.ts:14-41`) is **deferred** — out of scope until HTTP becomes the primary transport.

### Gap 7 — Tool Reconciliation
**New file:** `apps/mcp/src/composer/Reconciler.ts`.

When `onec_answer` calls 2+ tools that should agree (e.g., "Agrosyndicate debt" can come from debtors report **and** contractor balance), the reconciler:

1. Normalizes amounts to a common shape `{ contractor, amount_kzt, as_of }`.
2. Computes pairwise deltas.
3. If `abs(delta) > tolerance` (default 1% or 1 KZT, whichever larger), emits a `ConflictReport`:
   ```ts
   {
     subject: 'Agrosyndicate debt as of 2026-06-19',
     sources: [
       { tool: 'onec_debtors_report', amount: 2_500_000, asOf: ... },
       { tool: 'onec_contractor_balance', amount: 2_487_500, asOf: ... }
     ],
     delta_pct: 0.5,
     hypothesis: 'Likely cause: advances given netted in one source but not the other.'
   }
   ```
4. The answer surfaces both numbers + the conflict rather than picking silently.

Tool pairs that should agree are declared in `apps/mcp/src/composer/reconciliation-pairs.json` (curated; ~30 pairs at v2 launch).

### Gap 8 — Skill Docs Restore/Rewire
**Files:**
- Restore `apps/mcp/src/skills/kz-agro-{accounting,costing-flow,validation-rules}.md` from git history (`git show <pre-deletion-sha>:...`) **or** delete the references in `validation-drilldown.tools.ts`.
- Recommended: **restore** — the references in tool descriptions (`#A.1`, `#A.3`, `#A.6`) point to specific rules; deleting silently loses domain knowledge.
- Wire skill markdowns into the build: copy `apps/mcp/src/skills/*.md` to `dist/skills/` (esbuild config) so production deploys have them.
- Add an `onec_skill_lookup(slug)` tool so the LLM can fetch the rule text rather than guess.

### Gap 9 — Agent Layer Updates (DeepSeek-specific, new in v2.1)
**Files:** `agent-deepseek/bot.mjs`, `agent-deepseek/mcp-client.mjs`, `guide/11-deepseek-system-prompt.md`, `agent-deepseek/.env.example`.

The MCP-side composer is wasted if the agent layer doesn't render its output. Concrete agent-side work:

- **`mcp-client.mjs:144-150`** — flip denylist → allowlist (Gap 4); also, when a tool result contains a `_meta.trail`, extract and pass it through to `bot.mjs` instead of stringifying the whole payload.
- **`bot.mjs`** — extend `AgentSession` with `ChatSession` (Gap 6). When the LLM produces a final answer that came from `onec_answer`, render:
  - Headline value(s) — `{label}: {amount} {currency} as of {asOf}`
  - Compact source line — `Источник: {toolName} → {odataUrl-shortened}` (clickable for HTTP, plain for stdio).
  - Conflict callout — if `conflicts.length > 0`, render a "⚠ Расхождение" block with both numbers + hypothesis.
- **`guide/11-deepseek-system-prompt.md`** — rewrite routing/format sections:
  - "Default tool is `onec_answer(question)`. Pass user's question verbatim plus inferred subject/period."
  - "When `onec_answer` returns `values`, restate them in the user's language; never invent or round numbers."
  - "When `onec_answer` returns `conflicts`, surface the discrepancy explicitly to the user — do not pick one number."
  - "If `onec_answer` returns an error, do not retry with raw `onec_*` tools — they are intentionally hidden."
- **`.env.example`** — pin `DEEPSEEK_MODEL=deepseek-reasoner` (R1) and document the V3 fallback.

### Gap 10 — Deep Reasoning Loop (new in v2.2)
**Files:** `agent-deepseek/bot.mjs` (agent loop), `agent-deepseek/mcp-client.mjs` (multi-turn JSON-RPC), `guide/11-deepseek-system-prompt.md` (reasoning-format rules), `apps/mcp/src/composer/ProvenanceRecord.ts` (extended).

The agent surface is a bounded reasoning loop, not a one-shot:

```
user_msg → R1 (think) → tool_call_1 → result_1 → R1 (think) →
          tool_call_2 → result_2 → … → R1 final answer + trail
```

Concrete shape:

- **Iteration cap** — `MAX_TOOL_CALLS_PER_TURN = 8` in `bot.mjs`. Beyond that, return a structured error ("question too complex; please narrow") rather than spin.
- **Reasoning capture** — R1 returns `reasoning_content` alongside `content`. `mcp-client.mjs` forwards reasoning summaries to `bot.mjs`; `bot.mjs` writes them into the assembled `trail` as `ReasoningStep` entries. Extend `ProvenanceRecord` union:
  ```ts
  type TrailEntry =
    | ProvenanceRecord                                  // a tool call
    | { kind: 'reasoning'; step: number; summary: string; tokensUsed: number };
  ```
- **Self-consistency check** — when R1 produces a final number that wasn't returned verbatim by any tool in the trail, the agent flags it as `derived: true` in the response and asks R1 to show the arithmetic. Pure-derived numbers (sums, ratios) are fine; invented numbers are not.
- **Pre-flight tool selection** — for the first turn, R1 is encouraged via system prompt to consider `onec_answer` first; only if `onec_answer` returns insufficient data should R1 fall through to primitive chaining. This keeps the cheap path cheap.
- **Trail rendering in Telegram** — `bot.mjs` collapses the trail by default ("🔍 Use 5 tools, 3 reasoning steps — tap to expand"); user can expand to see each step.
- **Cost telemetry** — log per-turn `{toolCalls, reasoningTokens, completionTokens, walltimeMs}` to `agent-deepseek/logs/turns.jsonl`. Reviewed weekly to spot questions that consistently hit the cap.

---

## 6. Phasing

### Phase 1 — Trust (Weeks 1-3)
Block any further feature work until these land. They are the credibility floor.

- [ ] Gap 1 — Strict org binding (1-2 days)
- [ ] Gap 2 — `ProvenanceRecord` + `AnswerComposer` skeleton + `onec_answer` tool (1 week)
- [ ] Gap 9a — `mcp-client.mjs` surfaces `_meta.trail`; `bot.mjs` renders headline value + source line (2-3 days)
- [ ] Gap 3 — Eval harness v0: 20 questions, DeepSeek API direct, manual scoring report (1 week)

**Exit criteria:** `npm run eval` produces a scored report; every Telegram answer shows headline value + source line; zero `orgGuidCorrected: true` events in a 24h soak.

### Phase 2 — Coverage (Weeks 4-6)
- [ ] Gap 5 — OData audit + capability registry + HTTP-report fallbacks for top-3 broken entities (mutual settlements first) (1.5 weeks)
- [ ] Gap 8 — Skill docs restore + `onec_skill_lookup` (2 days)
- [ ] Gap 4 + Gap 9b — Flip denylist→allowlist in `mcp-client.mjs`; add `_hidden`/`_public` flags in MCP server; rewrite system prompt at `guide/11-deepseek-system-prompt.md` (4 days)

**Exit criteria:** DeepSeek's visible tool list contains only `onec_answer`, `onec_find_tool`, `onec_skill_lookup`; every domain in `evals/questions/*.yaml` has ≥1 question exercising a previously-broken endpoint; CI eval pass rate ≥ 80%.

### Phase 3 — Continuity & Reasoning (Weeks 7-10)
- [ ] Gap 6 — `ChatSession` in `bot.mjs` with subject + period carry-over (1 week)
- [ ] Gap 7 — `Reconciler` + 30 declared reconciliation pairs (1.5 weeks)
- [ ] Gap 9c — `bot.mjs` renders conflict callouts (⚠ block) (2 days)
- [ ] **Gap 10 — R1 reasoning loop:** switch agent to `deepseek-reasoner`; multi-tool sequencing with `MAX_TOOL_CALLS_PER_TURN=8`; trail extended with `ReasoningStep` entries; cost telemetry to `logs/turns.jsonl` (1.5 weeks)
- [ ] Eval expansion to 100 questions including ~20 explicitly *non-canonical* multi-step questions; CI gate at ≥ 90% (ongoing)

**Exit criteria:** demo Telegram conversation "How much does Agrosyndicate owe? — What about advances? — And in May?" answers correctly with carried-over subject and period; conflict surfacing demonstrated on a known-divergent pair.

---

## 7. Verification

**Per-phase, run end-to-end:**

1. **Unit tests** — `npm test` in `MCP 1C v1/` (existing service-layer suite stays green).
2. **Eval harness** — `npm run eval` against staging 1C (Moskovskiy instance per memory S109). Uses DeepSeek API directly with the production system prompt; no Telegram round-trip.
3. **Soak** — run MCP server for 24h with synthetic question stream from `evals/runner.ts --soak`, assert zero `orgGuidCorrected: true` and zero unhandled `OrgContextError`.
4. **Live Telegram smoke** — send the canonical query "Сколько Агросиндикат нам должен?" via the Telegram bot. Expect: headline value + source line + (eventually) conflict callout. DeepSeek must call `onec_answer`, not a raw `onec_*` tool (verify in bot.mjs logs that the tool name in the tool-use turn is `onec_answer`).
5. **Tool-list verification** — `node agent-deepseek/mcp-client.mjs --list-public-tools` (new helper) prints exactly `[onec_answer, onec_find_tool, onec_skill_lookup]` after Phase 2.
6. **Eval report** — markdown artifact at `evals/reports/<date>.md` shows pass rate per domain. Phase exit gates on this number.

**Smoke command sequence (post-Phase 1):**
```bash
cd "MCP 1C v1"
npm run build:registry && npm run build

cd ../agent-deepseek
cp .env.example .env  # fill DEEPSEEK_API_KEY, ONEC_DEFAULT_ORG_GUID, TG_BOT_TOKEN
node bot.mjs &        # starts Telegram bot + spawns MCP server via stdio

# In Telegram:
#   "Сколько Агросиндикат нам должен?"
# Expect: amount + source line; check bot logs for tool_calls.name === "onec_answer".

# Direct eval (no Telegram):
cd ../"MCP 1C v1"
npm run eval -- --questions evals/questions/receivables.yaml --model deepseek-chat
```

---

## 8. Critical Files to Modify or Create

Paths under `MCP 1C v1/` unless prefixed `agent-deepseek/` or at repo root.

**Modify — MCP server:**
- `apps/mcp/src/org-context.ts` (Gap 1)
- `apps/mcp/src/tools/utils.ts:15-39` (Gap 2 — extend `ResponseMeta` with trail)
- `apps/mcp/src/server.ts:142-165` (Gap 4 — adjust instructions; add `_public`/`_hidden` flags)
- `apps/mcp/src/tools/register.tools.ts` (Gap 4 — tag specialized tools `_hidden: true`)
- `packages/onec-client/src/OneCClient.ts:20-207` (Gap 2 — provenance hook; Gap 5 — capability-aware client)
- `packages/services/src/ToolDiscoveryService.ts:108-180` (Gap 5 — read capability registry)
- `apps/mcp/src/tools/validation-drilldown.tools.ts` (Gap 8 — relink to restored skills)
- `apps/mcp/src/tools/fullreport.tools.ts` (point `LLM_*` env at DeepSeek for v2)
- `package.json` (add `eval` script)
- esbuild config — bundle `skills/*.md` into `dist/`

**Modify — DeepSeek agent:**
- `agent-deepseek/bot.mjs` (Gap 6 — extend `AgentSession` with `ChatSession`; Gap 9 — render headline + source + conflicts)
- `agent-deepseek/mcp-client.mjs:144-150` (Gap 4 — flip denylist → allowlist; Gap 9 — surface `_meta.trail`)
- `agent-deepseek/.env.example` (pin `DEEPSEEK_MODEL`)
- `guide/11-deepseek-system-prompt.md:9-135` (Gap 4 — rewrite routing to mandate `onec_answer`; Gap 9 — answer-rendering rules)

**Create — MCP server:**
- `apps/mcp/src/composer/AnswerComposer.ts`
- `apps/mcp/src/composer/ProvenanceRecord.ts`
- `apps/mcp/src/composer/Reconciler.ts`
- `apps/mcp/src/composer/reconciliation-pairs.json`
- `apps/mcp/src/tools/answer.tools.ts`
- `apps/mcp/src/tools/skill-lookup.tools.ts`
- `packages/onec-client/src/Capabilities.ts`
- Restored skills: `apps/mcp/src/skills/kz-agro-{accounting,costing-flow,validation-rules}.md`

**Create — Eval & docs (repo root):**
- `evals/runner.ts`, `evals/scorer.ts`, `evals/report.ts`
- `evals/questions/{receivables,payables,cash,payroll,vat-esf}.yaml`
- `docs/odata-coverage.md`

**Reuse (already exists, do not rebuild):**
- `ResponseMeta` / `ok(data, meta)` — `apps/mcp/src/tools/utils.ts:15-39`
- ToolDiscoveryService scoring — `packages/services/src/ToolDiscoveryService.ts:9-17`
- OneCClient retry/error model — `packages/onec-client/src/OneCClient.ts:45-97`, `errors.ts:1-76`
- Denylist filter scaffold — `agent-deepseek/mcp-client.mjs:144-150` (flip to allowlist)
- Telegraf `AgentSession` per-chat shape — `agent-deepseek/bot.mjs` (extend, don't replace)
- DeepSeek client init — `agent-deepseek/bot.mjs:48`

---

## 9. Open Questions

1. **Eval ground truth** — do we snapshot 1C state into fixtures, or evaluate live against staging only? Live is more honest but flakier; snapshot is reproducible but goes stale. Recommend: live for CI gate + nightly snapshot for regression diff.
2. **Reconciliation pair curation** — who owns the list? Proposal: any new domain tool PR must declare its reconciliation pair(s) if applicable, enforced by a lint rule on `reconciliation-pairs.json`.
3. **Capability registry source of truth** — generated from the OData audit script, or hand-curated? Recommend: generated, with a hand-curated overrides file.
4. **Orchestrator model** — *Decided in v2.2:* **two-tier orchestration.** Outer loop is R1 doing multi-tool reasoning in the agent (Gap 10). Inner loop is the deterministic composer inside `onec_answer` for canonical questions. R1 chooses which to use per turn. No MCP `sampling/createMessage` callback — the agent runs the loop directly via the OpenAI SDK against `api.deepseek.com/v1`.
5. **Cost** — R1 is more expensive than V3 per token (~2-3x), AND each turn now chains up to 8 tool calls and re-feeds growing trail back to R1. Expect 10-20× v1 cost per question. Mitigations: (a) cap at 8 tool calls; (b) collapse old trail entries (summaries) when context > 32k; (c) measure for two weeks before optimizing — premature caching is worse than the bill.
6. **DeepSeek model: V3 vs R1** — *Decided in v2.2:* **R1 (`deepseek-reasoner`)** for the agent loop because multi-tool reasoning is the v2 design. V3 (`deepseek-chat`) stays available as a fallback for `LLM_MODEL` in `apps/mcp/src/tools/fullreport.tools.ts` (which generates report summaries — no reasoning needed). Pin both in `.env.example`.
7. **Allowlist breaking change** — flipping `mcp-client.mjs:144-150` from denylist to a *tiered* allowlist (Gap 4) hides ~135 internal tools but keeps ~18 primary+primitive tools visible. Less disruptive than v2.1's "3 tools only" plan, but still a breaking change — gate behind `MCP_TOOL_VISIBILITY=tiered|all` and ramp eval coverage to ≥80% before flipping in prod.
8. **Multi-tenant** — v2 assumes one Telegram chat = one org. If users belong to multiple orgs, the `ChatSession.orgGuid` needs an explicit selection flow. Out of scope for v2; document as a known gap for v3.
9. **Primitive tier curation** — who picks the ~15-20 "primitive" tools (Gap 4)? Proposal: the eval-question authors. As a question gets added, the tool(s) it canonically uses get auto-promoted to primitive tier. Hand-curate the initial list from the 5 domains (receivables, payables, cash, payroll, VAT/ESF).
10. **R1 reasoning leakage** — R1's chain-of-thought may surface internal tool names or 1C entity GUIDs that confuse end-users. Decision: store reasoning in the trail (for audit) but strip from the user-facing message unless the user explicitly asks "why did you say that?" Implement as a `bot.mjs` template choice.

---

**End of spec.**
