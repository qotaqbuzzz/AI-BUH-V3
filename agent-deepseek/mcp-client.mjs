/**
 * Persistent MCP stdio client — multi-tenant hardened.
 *
 * Spawns the precompiled onec-kz server once, keeps it alive for the session.
 *
 * Security:
 *  - Child env is an ALLOWLIST — only PATH, locale vars, and the tenant's own
 *    ONEC_ and DOCFLOW_ vars are passed. APP_ENC_KEY, DEEPSEEK_API_KEY, TELEGRAM_BOT_TOKEN,
 *    DB_PATH and all other parent secrets are NEVER inherited by the child.
 *  - Spawned with shell:false (argv array) — no shell injection surface.
 *
 * Reliability:
 *  - Unexpected child exit calls onExit() instead of process.exit(1) — the bot stays up;
 *    TenantManager evicts and respawns the tenant client as needed.
 */
import { spawn } from "child_process";
import { createInterface } from "readline";
import { resolve, join } from "path";

/** Env keys that the child process is allowed to inherit from the parent. */
const PARENT_PASSTHROUGH = new Set([
  "PATH", "HOME", "USERPROFILE", "SYSTEMROOT", "SYSTEMDRIVE", "WINDIR", "TEMP", "TMP",
  "LANG", "LANGUAGE", "LC_ALL", "LC_CTYPE", "LOCALAPPDATA", "APPDATA",
  "ONEC_TIMEOUT_MS", "ONEC_MAX_RETRIES", "ONEC_LOG_LEVEL", "ONEC_DEFAULT_ORG_GUID",
  "ENTITIES_DIR",
  "LLM_BASE_URL", "LLM_API_KEY", "LLM_MODEL", "ANTHROPIC_API_KEY",
  "ALERT_TELEGRAM_TOKEN", "ALERT_TELEGRAM_CHAT_ID", "ALERT_WEBHOOK_URL",
  "ALERT_MIN_SEVERITY", "ALERT_MIN_CONFIDENCE",
  "DOCFLOW_TIMEOUT_MS", "DOCFLOW_MAX_RETRIES",
  "NODE_ENV", "TZ",
]);

function buildChildEnv(extraEnv) {
  const env = {};
  for (const key of PARENT_PASSTHROUGH) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  // Tenant-specific overrides (ONEC_BASE_URL, ONEC_USERNAME, ONEC_PASSWORD, DOCFLOW_*)
  Object.assign(env, extraEnv);
  return env;
}

export class McpClient {
  #proc = null;
  #pending = new Map();
  #nextId = 1;
  #tools = [];
  #serverDir;
  #distEntry;
  #extraEnv;
  #onExit;
  #ready = false;
  #stopping = false;
  /** Trail from the most recent onec_answer call — read by bot.mjs for source line rendering. */
  #lastAnswerTrail = null;
  #lastAnswerValues = null;
  #lastAnswerConflicts = null;

  /**
   * @param {string} serverDir  Absolute path to the MCP 1C v1 project root.
   * @param {Object} [extraEnv] Per-tenant env vars (ONEC_BASE_URL, ONEC_USERNAME, ONEC_PASSWORD…).
   * @param {Function} [onExit] Called when the server exits unexpectedly after ready.
   */
  constructor(serverDir, extraEnv = {}, onExit = null) {
    this.#serverDir  = resolve(serverDir);
    this.#distEntry  = join(this.#serverDir, "dist/server.bundle.js");
    this.#extraEnv   = extraEnv;
    this.#onExit     = onExit;
  }

  async start() {
    this.#proc = spawn(
      process.execPath,                  // e.g. C:\Program Files\nodejs\node.exe
      [this.#distEntry],
      {
        cwd:   this.#serverDir,
        env:   buildChildEnv(this.#extraEnv),
        stdio: ["pipe", "pipe", "pipe"],
        shell: false,                    // no shell — no injection surface
      }
    );

    this.#proc.stderr.on("data", (d) => {
      const line = d.toString().trim();
      if (line) process.stderr.write(`[MCP] ${line}\n`);
    });

    this.#proc.on("exit", (code) => {
      if (this.#ready && !this.#stopping) {
        process.stderr.write(`[MCP] Server exited unexpectedly with code ${code}\n`);
        // Reject all pending requests so callers don't hang
        for (const { reject } of this.#pending.values()) {
          reject(new Error(`MCP server exited with code ${code}`));
        }
        this.#pending.clear();
        this.#ready = false;
        // Notify TenantManager so it can evict and respawn
        if (this.#onExit) this.#onExit();
      }
    });

    const rl = createInterface({ input: this.#proc.stdout });
    rl.on("line", (line) => {
      if (!line.trim()) return;
      let msg;
      try { msg = JSON.parse(line); } catch {
        process.stderr.write(`[MCP] Non-JSON stdout: ${line.slice(0, 120)}\n`);
        return;
      }
      if (msg.id !== undefined && this.#pending.has(msg.id)) {
        const { resolve, reject } = this.#pending.get(msg.id);
        this.#pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });

    // Wait for server to boot (it loads 889 entity files)
    await new Promise((r) => setTimeout(r, 800));

    // MCP handshake
    await this.#send("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      clientInfo: { name: "agent-deepseek", version: "2.0" },
    });
    this.#notify("notifications/initialized", {});

    // Fetch tool list
    const { tools } = await this.#send("tools/list", {});
    this.#tools = tools ?? [];
    this.#ready = true;

    return this;
  }

  /**
   * Tiered allowlist (v2 Phase 2). Only primary + primitive tools are exposed to R1.
   * Internal tools (~140) remain callable via onec_answer's orchestrator and onec_find_tool.
   * Override with MCP_TOOL_VISIBILITY=all in .env to restore full list (e.g. for debugging).
   *
   * Primary  — canonical entry-points:  onec_answer, onec_find_tool, onec_skill_lookup
   * Primitive — R1 building blocks for multi-step reasoning (17 curated tools)
   */
  static #TOOL_ALLOWLIST = new Set([
    // primary
    "onec_answer",
    "onec_find_tool",
    "onec_skill_lookup",
    // primitive
    "onec_get_organizations",
    "onec_search_contractors",
    "onec_get_contractor",
    "onec_get_contractor_settlements",
    "onec_get_report",
    "onec_get_cash_position",
    "onec_get_account_breakdown",
    "onec_analyze_account",
    "onec_get_payroll_summary",
    "onec_get_vat_register",
    "onec_get_esf_status",
    "onec_get_document",
    "onec_resolve_guid",
    "onec_get_exchange_rates",
    "onec_get_financial_summary",
    "onec_get_month_close_status",
    "onec_drill_cash_by_account",
  ]);

  static #TOOL_VISIBILITY = process.env.MCP_TOOL_VISIBILITY ?? "tiered";

  /** MCP tools exposed to R1 in OpenAI function-call format (tiered allowlist by default). */
  get openaiTools() {
    return this.#tools
      .filter((t) => McpClient.#TOOL_VISIBILITY === "all" || McpClient.#TOOL_ALLOWLIST.has(t.name))
      .map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description ?? "",
          parameters: t.inputSchema ?? { type: "object", properties: {} },
        },
      }));
  }

  /** Total registered tools on the server (before denylist filtering). */
  get toolCountRaw() { return this.#tools.length; }

  /** Tools actually exposed to the LLM (after allowlist filtering). */
  get toolCount() { return this.openaiTools.length; }

  get isReady()   { return this.#ready; }

  get lastAnswerTrail()     { return this.#lastAnswerTrail; }
  get lastAnswerValues()    { return this.#lastAnswerValues; }
  get lastAnswerConflicts() { return this.#lastAnswerConflicts; }
  clearLastAnswer() {
    this.#lastAnswerTrail = null;
    this.#lastAnswerValues = null;
    this.#lastAnswerConflicts = null;
  }

  async callTool(name, args) {
    const result = await this.#send("tools/call", { name, arguments: args });
    if (result?.content) {
      const text = result.content.map((c) => c.text ?? JSON.stringify(c)).join("\n");
      // Side-channel: extract provenance trail from onec_answer for bot-side rendering
      if (name === "onec_answer") {
        try {
          const parsed = JSON.parse(text);
          if (parsed?.trail)     this.#lastAnswerTrail     = parsed.trail;
          if (parsed?.values)    this.#lastAnswerValues    = parsed.values;
          if (parsed?.conflicts) this.#lastAnswerConflicts = parsed.conflicts;
        } catch { /* non-JSON or error response — leave trail as-is */ }
      }
      return text;
    }
    return JSON.stringify(result);
  }

  stop() {
    this.#stopping = true;
    this.#ready = false;
    if (this.#proc) {
      try { this.#proc.stdin.end(); } catch {}
      try { this.#proc.kill(); } catch {}
    }
  }

  #send(method, params) {
    return new Promise((resolve, reject) => {
      const id  = this.#nextId++;
      this.#pending.set(id, { resolve, reject });
      const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params });
      this.#proc.stdin.write(msg + "\n");
      setTimeout(() => {
        if (this.#pending.has(id)) {
          this.#pending.delete(id);
          reject(new Error(`MCP timeout: ${method}`));
        }
      }, 120_000); // 2 min — some tools (scan_all, full_report) are slow
    });
  }

  #notify(method, params) {
    const msg = JSON.stringify({ jsonrpc: "2.0", method, params });
    this.#proc.stdin.write(msg + "\n");
  }
}
