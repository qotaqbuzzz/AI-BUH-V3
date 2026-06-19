/**
 * Eval runner — Gap 3, Phase 1.
 *
 * Spawns the MCP server as a stdio child process, calls onec_answer for each
 * question in evals/questions/*.yaml, scores results, and writes a markdown
 * report to evals/reports/<date>.md.
 *
 * Usage:
 *   npm run eval
 *   npm run eval -- --questions evals/questions/receivables.yaml
 *   npm run eval -- --dry-run    (parse questions only, no MCP calls)
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

// ── Load questions ─────────────────────────────────────────────────────────────
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
class EvalMcpClient {
  #proc: ReturnType<typeof spawn>;
  #pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  #nextId = 1;

  constructor() {
    // The child process loads .env itself via "import dotenv/config" in config.ts (cwd=ROOT).
    // No parent-side dotenv loading needed.
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
    // Give server time to boot
    await new Promise<void>((r) => setTimeout(r, 1500));
    await this.#send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "eval-runner", version: "1.0" },
    });
    this.#notify("notifications/initialized", {});
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
    });
  }

  #notify(method: string, params: unknown): void {
    this.#proc.stdin!.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const questions = loadQuestions();
  console.log(`[eval] Loaded ${questions.length} questions`);

  if (dryRun) {
    console.log("[eval] --dry-run: skipping MCP calls\n");
    for (const q of questions) console.log(`  ${q.id}  ${q.question_ru}`);
    return;
  }

  const client = new EvalMcpClient();
  try {
    console.log("[eval] Starting MCP server…");
    await client.init();
    console.log("[eval] MCP server ready\n");

    const results: ScoreResult[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (const q of questions) {
      const asOf = q.as_of_date ?? today;
      process.stdout.write(`  ${q.id.padEnd(8)}${q.question_ru.slice(0, 48).padEnd(50)}`);

      const t0 = Date.now();
      let rawResult: string;
      try {
        rawResult = await client.callTool("onec_answer", { question: q.question_ru, asOfDate: asOf });
      } catch (e) {
        rawResult = JSON.stringify({ isError: true, content: [{ text: (e as Error).message }] });
      }
      const durationMs = Date.now() - t0;

      const result = score(q, rawResult, durationMs);
      results.push(result);

      const icon = { pass: "✅", fail: "❌", needs_review: "⚠️ ", skip: "⏭️ " }[result.verdict];
      console.log(`${icon}  ${result.reason.slice(0, 60)}`);
    }

    // Summary
    const passes   = results.filter((r) => r.verdict === "pass").length;
    const total    = results.length;
    const passRate = ((passes / total) * 100).toFixed(1);
    console.log(`\n[eval] ${passes}/${total} passed (${passRate}%)`);

    // Write markdown report
    mkdirSync(RPT_DIR, { recursive: true });
    const reportPath = join(RPT_DIR, `${today}.md`);
    writeFileSync(reportPath, generateReport(results, today), "utf8");
    console.log(`[eval] Report → ${reportPath}`);

    // Non-zero exit for CI gate on hard failures
    if (results.filter((r) => r.verdict === "fail").length > 0) process.exit(1);
  } finally {
    client.stop();
  }
}

main().catch((e) => {
  console.error("[eval] Fatal:", e.message);
  process.exit(1);
});
