/**
 * CLI interface for the onec-kz DeepSeek agent.
 *
 * Usage:
 *   node agent.mjs              — interactive chat session
 *   node agent.mjs --once "задай аудит аномалий за 2025 год"
 */
import "dotenv/config";
import { createInterface } from "readline";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { McpClient } from "./mcp-client.mjs";
import { AgentSession } from "./session.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY    = process.env.DEEPSEEK_API_KEY;
const SERVER_DIR = resolve(__dirname, process.env.MCP_SERVER_DIR ?? "../MCP 1C v1");
const MODEL      = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

if (!API_KEY) {
  console.error("❌  DEEPSEEK_API_KEY not set. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const args = process.argv.slice(2);
const onceIdx = args.indexOf("--once");
const ONCE_QUERY = onceIdx !== -1 ? args.slice(onceIdx + 1).join(" ") : null;

async function main() {
  process.stdout.write("Starting onec-kz MCP server… ");
  const mcp = new McpClient(SERVER_DIR);
  await mcp.start();
  console.log(`✅  ${mcp.toolCount} tools loaded\n`);

  const openai = new OpenAI({ apiKey: API_KEY, baseURL: "https://api.deepseek.com/v1" });
  const session = new AgentSession(openai, mcp);

  const onTool = (name) => process.stdout.write(`${name} `);

  if (ONCE_QUERY) {
    process.stdout.write("  [tools] ");
    const answer = await session.runTurn(ONCE_QUERY, onTool);
    process.stdout.write("\n");
    console.log("\n" + answer);
    mcp.stop();
    return;
  }

  console.log(`Model: ${MODEL}  |  Type 'exit' to quit, 'clear' to reset history\n`);
  console.log("─".repeat(60));

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt) => new Promise((r) => rl.question(prompt, r));

  while (true) {
    const input = (await ask("\nYou: ")).trim();
    if (!input) continue;
    if (input === "exit" || input === "quit") break;
    if (input === "clear") {
      session.clearHistory();
      console.log("History cleared.");
      continue;
    }
    try {
      process.stdout.write("  [tools] ");
      const answer = await session.runTurn(input, onTool);
      process.stdout.write("\n");
      console.log("\nAgent:\n" + answer);
    } catch (e) {
      console.error("\n❌  Error:", e.message);
    }
  }

  rl.close();
  mcp.stop();
  console.log("\nSession ended.");
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
