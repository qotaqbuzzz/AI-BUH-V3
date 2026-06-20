/**
 * Eval runner — two modes:
 *
 * direct (default)
 *   Calls onec_answer for each question directly via MCP stdio, scores the
 *   ComposedAnswer JSON. Fast and deterministic — no LLM API key needed.
 *   Usage: npm run eval
 *          npm run eval -- --questions evals/questions/receivables.yaml
 *          npm run eval -- --dry-run
 *
 * agent
 *   Routes each question through a DeepSeek (or OpenAI-compatible) agent loop.
 *   The agent receives the tiered tool list and must decide which tools to call.
 *   Collects toolsCalled and passes to scorer for must_call enforcement.
 *   Requires: AGENT_EVAL_API_KEY (or DEEPSEEK_API_KEY)
 *   Optional: AGENT_EVAL_BASE_URL (default: https://api.deepseek.com/v1)
 *             AGENT_EVAL_MODEL   (default: deepseek-chat)
 *   Usage: npm run eval -- --mode agent
 */

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load as yamlLoad } from "js-yaml";
import { score } from "./scorer.js";
import type { EvalQuestion, ScoreResult } from "./scorer.js";
import { generateReport } from "./report.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");
const DIST      = join(ROOT, "dist/server.bundle.js");
const Q_DIR     = join(__dirname, "questions");
const RPT_DIR   = join(__dirname, "reports");

// ── CLI args ──────────────────────────────────────────────────────────────────
const args         = process.argv.slice(2);
const dryRun       = args.includes("--dry-run");
const specificFile = args.find((a) => a.endsWith(".yaml") || a.endsWith(".yml"));
const modeIdx      = args.indexOf("--mode");
const mode: "direct" | "agent" = (args[modeIdx + 1] === "agent") ? "agent" : "direct";

// ── Load questions ────────────────────────────────────────────────────────────
function loadQuestions(): EvalQuestion[] {
  const files = specificFile
    ? [specificFile]
    : readdirSync(Q_DIR)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        .map((f) => join(Q_DIR, f));

  const questions: EvalQuestion[] = [];
  for (const file of files) {
    const raw = yamlLoad(readFileSync(file, "utf8"));
    if (Array.isArray(raw)) questions.push(...(raw as EvalQuestion[]));
  }
  return questions;
}

// ── Minimal stdio MCP client ──────────────────────────────────────────────────
interface McpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

class EvalMcpClient {
  #proc: ReturnType<typeof spawn>;
  #pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  #nextId = 1;

  constructor() {
    this.#proc = spawn(process.execPath, [DIST], {
      cwd: ROOT,
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
    });

    this.#proc.stderr?.on("data", (d: Buffer) => {
      const line = d.toString().trim();
      if (line && !line.includes("[MCP]")) process.stderr.write(`[mcp-stderr] ${line}\n`);
    });

    const rl = createInterface({ input: this.#proc.stdout! });
    rl.on("line", (line: string) => {
      if (!line.trim()) return;
      let msg: { id?: number; result?: unknown; error?: unknown };
      try { msg = JSON.parse(line); } catch { return; }
      if (msg.id !== undefined && this.#pending.has(msg.id)) {
        const { resolve, reject } = this.#pending.get(msg.id)!;
        this.#pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  async init(): Promise<void> {
    await new Promise<void>((r) => setTimeout(r, 1500));
    await this.#send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "eval-runner", version: "1.0" },
    });
    this.#notify("notifications/initialized", {});
  }

  async listTools(): Promise<McpTool[]> {
    const result = await this.#send("tools/list", {}) as { tools?: McpTool[] };
    return result?.tools ?? [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const result = await this.#send("tools/call", { name, arguments: args }) as {
      content?: Array<{ text?: string }>;
    };
    if (result?.content) {
      return result.content.map((c) => c.text ?? JSON.stringify(c)).join("\n");
    }
    return JSON.stringify(result);
  }

  stop(): void { this.#proc.kill(); }

  #send(method: string, params: unknown): Promise<unknown> {
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#proc.stdin!.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
      setTimeout(() => {
        if (this.#pending.has(id)) {
          this.#pending.delete(id);
          reject(new Error(`MCP timeout: ${method}`));
        }
      }, 120_000);
    });
  }

  #notify(method: string, params: unknown): void {
    this.#proc.stdin!.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }
}

// ── Agent eval loop ───────────────────────────────────────────────────────────
// Uses Node 18+ built-in fetch — no extra package needed.

interface OAIMsg {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: OAIToolCall[];
  tool_call_id?: string;
}

interface OAIToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface OAIToolDef {
  type: "function";
  function: { name: string; description: string; parameters: unknown };
}

/** Tools exposed to the agent — primary entry-points + key primitives. */
const AGENT_TOOL_ALLOWLIST = new Set([
  "onec_answer",
  "onec_find_tool",
  "onec_skill_lookup",
  "onec_get_cash_position",
  "onec_get_report",
  "onec_get_financial_summary",
  "onec_get_payroll_summary",
  "onec_get_esf_status",
  "onec_get_contractor_settlements",
  "onec_resolve_guid",
  "onec_search_contractors",
]);

const AGENT_SYSTEM_PROMPT = `\
You are a financial analyst AI connected to a 1C:Бухгалтерия Kazakhstan accounting system.

ROUTING POLICY:
1. For ANY question about receivables (дебиторы), payables (кредиторы), or cash (касса/банк):
   ALWAYS call onec_answer(question, asOfDate?) FIRST.
   It returns structured data with provenance trail.
2. If onec_answer returns "unknown intent", call onec_find_tool(question) to discover the right primitive, then call it.
3. Never invent numbers — every numeric answer must come from a tool result.

Answer in the same language as the question. Be concise.`;

async function llmComplete(
  apiKey: string,
  baseURL: string,
  model: string,
  messages: OAIMsg[],
  tools: OAIToolDef[],
): Promise<OAIMsg & { finish_reason: string }> {
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, tools, tool_choice: "auto" }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json() as {
    choices: Array<{ message: OAIMsg; finish_reason: string }>;
  };
  const choice = data.choices[0];
  return { ...choice.message, finish_reason: choice.finish_reason };
}

interface AgentRunResult {
  rawResult: string;      // ComposedAnswer JSON (from onec_answer) or synthetic
  toolsCalled: string[];  // all MCP tool names the agent called, in order
  durationMs: number;
}

async function runAgentQuestion(
  q: EvalQuestion,
  client: EvalMcpClient,
  allTools: McpTool[],
  apiKey: string,
  baseURL: string,
  model: string,
  today: string,
): Promise<AgentRunResult> {
  const oaiTools: OAIToolDef[] = allTools
    .filter((t) => AGENT_TOOL_ALLOWLIST.has(t.name))
    .map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: (t.description ?? "").slice(0, 512),
        parameters: (t.inputSchema ?? { type: "object", properties: {} }) as unknown,
      },
    }));

  const asOf = q.as_of_date ?? today;
  const messages: OAIMsg[] = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    { role: "user", content: q.question_ru },
  ];

  const toolsCalled: string[] = [];
  let lastOnecAnswerResult: string | null = null;
  const t0 = Date.now();

  for (let step = 0; step < 6; step++) {
    let msg: OAIMsg & { finish_reason: string };
    try {
      msg = await llmComplete(apiKey, baseURL, model, messages, oaiTools);
    } catch (e) {
      const errText = (e as Error).message;
      return {
        rawResult: JSON.stringify({ isError: true, content: [{ text: errText }] }),
        toolsCalled,
        durationMs: Date.now() - t0,
      };
    }

    messages.push({ role: "assistant", content: msg.content, tool_calls: msg.tool_calls });

    if (!msg.tool_calls?.length || msg.finish_reason === "stop") break;

    const toolResults = await Promise.all(
      msg.tool_calls.map(async (tc) => {
        const name = tc.function.name;
        toolsCalled.push(name);
        let callArgs: Record<string, unknown> = {};
        try { callArgs = JSON.parse(tc.function.arguments); } catch { /* ignore */ }
        if (name === "onec_answer" && !callArgs.asOfDate) callArgs.asOfDate = asOf;

        let result: string;
        try {
          result = await client.callTool(name, callArgs);
          if (name === "onec_answer") lastOnecAnswerResult = result;
        } catch (e) {
          result = JSON.stringify({ isError: true, content: [{ text: (e as Error).message }] });
        }
        return { tool_call_id: tc.id, role: "tool" as const, content: result };
      }),
    );
    messages.push(...toolResults);
  }

  // Prefer onec_answer result for scoring; fall back to synthesized ComposedAnswer.
  const finalText = (messages.at(-1)?.role === "assistant" ? messages.at(-1)?.content : null) ?? "";
  const rawResult = lastOnecAnswerResult ?? JSON.stringify({
    answer: finalText,
    values: [],
    trail: [],
    conflicts: [],
    followups: [],
  });

  return { rawResult, toolsCalled, durationMs: Date.now() - t0 };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const questions = loadQuestions();
  console.log(`[eval] Loaded ${questions.length} questions  mode=${mode}`);

  if (dryRun) {
    console.log("[eval] --dry-run: skipping MCP calls\n");
    for (const q of questions) console.log(`  ${q.id}  ${q.question_ru}`);
    return;
  }

  // Agent mode requires LLM credentials.
  let agentApiKey  = "";
  let agentBaseURL = "";
  let agentModel   = "";
  if (mode === "agent") {
    agentApiKey  = process.env.AGENT_EVAL_API_KEY  ?? process.env.DEEPSEEK_API_KEY  ?? "";
    agentBaseURL = process.env.AGENT_EVAL_BASE_URL ?? process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1";
    agentModel   = process.env.AGENT_EVAL_MODEL    ?? process.env.DEEPSEEK_MODEL    ?? "deepseek-chat";
    if (!agentApiKey) {
      console.error("[eval] agent mode requires AGENT_EVAL_API_KEY or DEEPSEEK_API_KEY");
      process.exit(1);
    }
    console.log(`[eval] Agent model: ${agentModel}  base: ${agentBaseURL}`);
  }

  const client = new EvalMcpClient();
  try {
    console.log("[eval] Starting MCP server…");
    await client.init();
    console.log("[eval] MCP server ready\n");

    let allTools: McpTool[] = [];
    if (mode === "agent") {
      allTools = await client.listTools();
      const exposed = allTools.filter((t) => AGENT_TOOL_ALLOWLIST.has(t.name)).length;
      console.log(`[eval] ${allTools.length} tools fetched (${exposed} exposed to agent)\n`);
    }

    const results: ScoreResult[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (const q of questions) {
      const asOf = q.as_of_date ?? today;
      process.stdout.write(`  ${q.id.padEnd(8)}${q.question_ru.slice(0, 48).padEnd(50)}`);

      let rawResult: string;
      let toolsCalled: string[] | undefined;
      let durationMs: number;

      if (mode === "agent") {
        const run = await runAgentQuestion(
          q, client, allTools, agentApiKey, agentBaseURL, agentModel, today,
        );
        rawResult   = run.rawResult;
        toolsCalled = run.toolsCalled;
        durationMs  = run.durationMs;
      } else {
        const t0 = Date.now();
        try {
          rawResult = await client.callTool("onec_answer", { question: q.question_ru, asOfDate: asOf });
        } catch (e) {
          rawResult = JSON.stringify({ isError: true, content: [{ text: (e as Error).message }] });
        }
        durationMs = Date.now() - t0;
      }

      const result = score(q, rawResult, durationMs, toolsCalled);
      results.push(result);

      const icon = { pass: "✅", fail: "❌", needs_review: "⚠️ ", skip: "⏭️ " }[result.verdict];
      const toolSuffix = mode === "agent" && toolsCalled?.length
        ? `  [${toolsCalled.join("→")}]`
        : "";
      console.log(`${icon}  ${result.reason.slice(0, 55)}${toolSuffix}`);
    }

    // Summary
    const passes  = results.filter((r) => r.verdict === "pass").length;
    const reviews = results.filter((r) => r.verdict === "needs_review").length;
    const total   = results.length;
    console.log(`\n[eval] ${passes}/${total} passed (${((passes / total) * 100).toFixed(1)}%)  ⚠️ ${reviews} needs_review`);

    // Write markdown report (agent runs get a distinct filename).
    mkdirSync(RPT_DIR, { recursive: true });
    const fileSuffix = mode === "agent"
      ? `-agent-${agentModel.replace(/[^a-z0-9]/gi, "-")}`
      : "";
    const reportPath = join(RPT_DIR, `${today}${fileSuffix}.md`);
    writeFileSync(reportPath, generateReport(results, today), "utf8");
    console.log(`[eval] Report → ${reportPath}`);

    // Non-zero exit only for hard failures — needs_review is informational.
    if (results.filter((r) => r.verdict === "fail").length > 0) process.exit(1);
  } finally {
    client.stop();
  }
}

main().catch((e) => {
  console.error("[eval] Fatal:", e.message);
  process.exit(1);
});
