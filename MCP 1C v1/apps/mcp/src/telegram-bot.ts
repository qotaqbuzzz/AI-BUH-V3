/**
 * Admin Telegram bot — lets the admin register/remove 1C OData connections
 * without touching the server config or redeploying.
 *
 * Required env vars:
 *   ADMIN_BOT_TOKEN   — get from @BotFather
 *   ADMIN_CHAT_ID     — your Telegram chat ID (get from @userinfobot)
 *
 * Commands (admin chat only):
 *   /add <name> <url> <username> <password>
 *   /list
 *   /remove <name>
 *   /help
 */

import { addConnection, removeConnection, listConnections } from "./connections-store.js";

const TOKEN   = process.env.ADMIN_BOT_TOKEN;
const CHAT_ID = process.env.ADMIN_CHAT_ID;
const API     = `https://api.telegram.org/bot${TOKEN}`;

async function send(chatId: number | string, text: string): Promise<void> {
  await fetch(`${API}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  }).catch(() => {/* non-fatal */});
}

interface TgMessage {
  chat:  { id: number };
  text?: string;
}

async function getUpdates(offset: number): Promise<{ update_id: number; message?: TgMessage }[]> {
  const res  = await fetch(`${API}/getUpdates?timeout=30&offset=${offset}`);
  const json = await res.json() as { ok: boolean; result: { update_id: number; message?: TgMessage }[] };
  return json.ok ? json.result : [];
}

async function handle(msg: TgMessage): Promise<void> {
  const chatId = msg.chat.id;

  if (String(chatId) !== CHAT_ID) {
    await send(chatId, "⛔ Unauthorised.");
    return;
  }

  const [cmd, ...args] = (msg.text ?? "").trim().split(/\s+/);

  switch (cmd) {
    case "/start":
    case "/help":
      await send(chatId,
        "*AI BUH — Admin Bot*\n\n" +
        "`/add <name> <url> <user> <pass>` — register 1C connection\n" +
        "`/list` — show registered connections\n" +
        "`/remove <name>` — delete a connection\n\n" +
        "_Users connect with header:_ `X-Connection-Name: <name>`"
      );
      break;

    case "/add": {
      const [name, url, username, password] = args;
      if (!name || !url || !username || !password) {
        await send(chatId, "Usage: `/add <name> <url> <username> <password>`");
        break;
      }
      const baseUrl = url.includes("/odata/standard.odata")
        ? url
        : `${url.replace(/\/$/, "")}/odata/standard.odata`;
      addConnection({ name, baseUrl, username, password });
      await send(chatId, `✅ *${name}* registered.\n\`${baseUrl}\``);
      break;
    }

    case "/list": {
      const list = listConnections();
      if (!list.length) { await send(chatId, "No connections yet."); break; }
      const lines = list.map(c => `• *${c.name}* — \`${c.baseUrl}\` (${c.username})`);
      await send(chatId, lines.join("\n"));
      break;
    }

    case "/remove": {
      const [name] = args;
      if (!name) { await send(chatId, "Usage: `/remove <name>`"); break; }
      const deleted = removeConnection(name);
      await send(chatId, deleted ? `🗑 *${name}* removed.` : `*${name}* not found.`);
      break;
    }

    default:
      await send(chatId, "Unknown command — send /help");
  }
}

export function startAdminBot(): void {
  if (!TOKEN || !CHAT_ID) return; // silently skip if not configured

  console.log("Admin Telegram bot started (long-polling).");
  let offset = 0;

  void (async () => {
    while (true) {
      try {
        const updates = await getUpdates(offset);
        for (const u of updates) {
          offset = u.update_id + 1;
          if (u.message) void handle(u.message).catch(() => {});
        }
      } catch {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  })();
}
