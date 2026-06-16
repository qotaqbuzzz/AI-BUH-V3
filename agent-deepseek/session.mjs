/**
 * AgentSession — one conversation thread.
 * Shared by the CLI (agent.mjs) and Telegram bot (bot.mjs).
 */
import { readFileSync, existsSync, readdirSync } from "fs";
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

// ── Session class ─────────────────────────────────────────────────────────────
export class AgentSession {
  #messages;
  #openai;
  #mcp;
  #tools;

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
  }

  get historyLength() { return this.#messages.length - 1; }

  /**
   * Run one user turn.
   * @param {string} userText
   * @param {(toolName: string) => void} [onToolCall]  - called before each tool executes
   * @returns {Promise<string>} final assistant text
   */
  async runTurn(userText, onToolCall) {
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    this.#messages.push({ role: "user", content: userText });

    for (let step = 0; step < 20; step++) {
      const response = await this.#openai.chat.completions.create({
        model,
        messages: this.#messages,
        tools: this.#tools,
        tool_choice: step === 0 ? "required" : "auto",
      });

      const msg = response.choices[0].message;
      this.#messages.push(msg);

      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        return msg.content ?? "";
      }

      const toolResults = await Promise.all(
        msg.tool_calls.map(async (tc) => {
          const name = tc.function.name;
          let callArgs;
          try { callArgs = JSON.parse(tc.function.arguments); } catch { callArgs = {}; }
          if (onToolCall) onToolCall(name);
          let result;
          try {
            result = name === "get_skill"
              ? readSkill(callArgs.name)
              : await this.#mcp.callTool(name, callArgs);
          } catch (e) {
            result = `ERROR: ${e.message}`;
          }
          const preview = typeof result === "string" ? result.slice(0, 300) : JSON.stringify(result).slice(0, 300);
          console.log(`[mcp] ${name}(${JSON.stringify(callArgs)}) → ${preview}`);
          return { tool_call_id: tc.id, role: "tool", content: result };
        })
      );
      this.#messages.push(...toolResults);
    }

    return "(max steps reached)";
  }
}
