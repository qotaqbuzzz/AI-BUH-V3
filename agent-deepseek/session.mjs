/**
 * AgentSession — one conversation thread.
 * Shared by the CLI (agent.mjs) and Telegram bot (bot.mjs).
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, appendFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Skills ────────────────────────────────────────────────────────────────────
export const SKILLS_DIR = resolve(__dirname, "../guide/skills");

export const SKILL_FILES = (() => {
  if (!existsSync(SKILLS_DIR)) return {};
  const map = {};
  for (const f of readdirSync(SKILLS_DIR)) {
    if (!f.endsWith(".md")) continue;
    const key = f.replace(/^\d+-/, "").replace(/\.md$/, "");
    map[key] = resolve(SKILLS_DIR, f);
  }
  return map;
})();

export function readSkill(name) {
  const path = SKILL_FILES[name];
  if (!path) {
    return `Unknown skill "${name}". Available: ${Object.keys(SKILL_FILES).join(", ")}`;
  }
  return readFileSync(path, "utf8");
}

export const GET_SKILL_TOOL = {
  type: "function",
  function: {
    name: "get_skill",
    description:
      "Get detailed step-by-step workflow instructions for a complex accounting task. " +
      "Call this BEFORE starting any multi-step workflow so you follow the correct tool sequence. " +
      "Available skills: " + Object.keys(SKILL_FILES).join(", "),
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Skill name from the available list above." },
      },
      required: ["name"],
    },
  },
};

// ── System prompt ─────────────────────────────────────────────────────────────
export function buildSystemPrompt() {
  const customPath = process.env.SYSTEM_PROMPT_FILE;
  if (customPath && existsSync(customPath)) return readFileSync(customPath, "utf8");

  const defaultPath = resolve(__dirname, "../guide/11-deepseek-system-prompt.md");
  let base = "You are a financial analyst AI connected to a 1C:Бухгалтерия Kazakhstan accounting system.";
  if (existsSync(defaultPath)) {
    const raw = readFileSync(defaultPath, "utf8");
    const match = raw.match(/```\n([\s\S]+?)```/);
    base = match ? match[1].trim() : raw;
  }

  const indexPath = SKILL_FILES["skill-index"] ?? resolve(SKILLS_DIR, "00-skill-index.md");
  if (existsSync(indexPath)) {
    const index = readFileSync(indexPath, "utf8");
    base += `\n\n## Agent Skills\nBefore executing any complex workflow listed below, call get_skill(name) to load the full step-by-step instructions.\n\n${index}`;
  }
  return base;
}

// ── Telemetry ──────────────────────────────────────────────────────────────────
const LOGS_DIR = resolve(__dirname, "logs");
function writeTurnLog(entry) {
  try {
    mkdirSync(LOGS_DIR, { recursive: true });
    appendFileSync(resolve(LOGS_DIR, "turns.jsonl"), JSON.stringify(entry) + "\n", "utf8");
  } catch { /* non-fatal */ }
}

// ── Session class ─────────────────────────────────────────────────────────────
const MAX_TOOL_CALLS = parseInt(process.env.MAX_TOOL_CALLS_PER_TURN ?? "8", 10);

// Labels that indicate a global/aggregate answer (no specific subject extracted)
const GLOBAL_LABELS = /^(Все |All |Total|Итого)/i;

export class AgentSession {
  #messages;
  #openai;
  #mcp;
  #tools;
  // Gap 6 — per-session subject/period carry-over
  #chatContext = { lastSubject: null, lastPeriod: null };

  /**
   * @param {OpenAI} openai
   * @param {McpClient} mcp
   * @param {Array} [preloadedHistory]  Messages loaded from SQLite (excludes system message).
   */
  constructor(openai, mcp, preloadedHistory = []) {
    this.#openai = openai;
    this.#mcp = mcp;
    this.#tools = [GET_SKILL_TOOL, ...mcp.openaiTools];
    this.#messages = [
      { role: "system", content: buildSystemPrompt() },
      ...preloadedHistory,
    ];
  }

  clearHistory() {
    this.#messages.splice(1);
    this.#chatContext = { lastSubject: null, lastPeriod: null };
  }

  get historyLength() { return this.#messages.length - 1; }
  get chatContext()   { return this.#chatContext; }

  /**
   * Run one user turn.
   * @param {string} userText
   * @param {(toolName: string) => void} [onToolCall]  - called before each tool executes
   * @returns {Promise<string>} final assistant text
   */
  async runTurn(userText, onToolCall) {
    const model    = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    const isR1     = model.includes("reasoner");
    const turnStart = Date.now();
    let toolCallCount = 0;
    let reasoningTokens = 0;

    this.#messages.push({ role: "user", content: userText });

    for (let step = 0; step < MAX_TOOL_CALLS + 1; step++) {
      const response = await this.#openai.chat.completions.create({
        model,
        messages: this.#messages,
        tools: this.#tools,
        tool_choice: step === 0 ? "required" : "auto",
      });

      const msg = response.choices[0].message;

      // Capture R1 reasoning tokens for telemetry
      if (isR1 && response.usage?.completion_tokens_details?.reasoning_tokens) {
        reasoningTokens += response.usage.completion_tokens_details.reasoning_tokens;
      }

      this.#messages.push(msg);

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        writeTurnLog({
          ts: new Date().toISOString(),
          model,
          toolCalls: toolCallCount,
          durationMs: Date.now() - turnStart,
          reasoningTokens: isR1 ? reasoningTokens : undefined,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
        });
        return msg.content ?? "";
      }

      // Hard cap: if we've already used MAX_TOOL_CALLS, stop calling tools
      if (toolCallCount >= MAX_TOOL_CALLS) {
        writeTurnLog({
          ts: new Date().toISOString(),
          model,
          toolCalls: toolCallCount,
          durationMs: Date.now() - turnStart,
          reasoningTokens: isR1 ? reasoningTokens : undefined,
          cappedAt: MAX_TOOL_CALLS,
        });
        return `(Вопрос слишком сложный для одного хода — использовано ${toolCallCount} инструментов. Пожалуйста, уточните запрос.)`;
      }

      const toolResults = await Promise.all(
        msg.tool_calls.map(async (tc) => {
          const name = tc.function.name;
          let callArgs;
          try { callArgs = JSON.parse(tc.function.arguments); } catch { callArgs = {}; }

          // Gap 6 — inject last known subject into onec_answer if not already set
          if (name === "onec_answer" && this.#chatContext.lastSubject && !callArgs.context?.subject) {
            callArgs = {
              ...callArgs,
              context: { ...(callArgs.context ?? {}), subject: this.#chatContext.lastSubject },
            };
          }

          if (onToolCall) onToolCall(name);
          toolCallCount++;

          let result;
          try {
            result = name === "get_skill"
              ? readSkill(callArgs.name)
              : await this.#mcp.callTool(name, callArgs);
          } catch (e) {
            result = `ERROR: ${e.message}`;
          }

          // Gap 6 — update last subject from onec_answer result
          if (name === "onec_answer" && typeof result === "string") {
            try {
              const parsed = JSON.parse(result);
              if (parsed?.values?.length > 0) {
                const label = parsed.values[0].label;
                if (label && !GLOBAL_LABELS.test(label)) {
                  this.#chatContext.lastSubject = { type: "contractor", name: label };
                }
              }
              if (callArgs.asOfDate) {
                this.#chatContext.lastPeriod = { start: callArgs.asOfDate, end: callArgs.asOfDate };
              }
            } catch { /* ignore parse errors */ }
          }

          const preview = typeof result === "string" ? result.slice(0, 300) : JSON.stringify(result).slice(0, 300);
          console.log(`[mcp] ${name}(${JSON.stringify(callArgs)}) → ${preview}`);
          return { tool_call_id: tc.id, role: "tool", content: typeof result === "string" ? result : JSON.stringify(result) };
        })
      );
      this.#messages.push(...toolResults);
    }

    return "(max steps reached)";
  }
}
