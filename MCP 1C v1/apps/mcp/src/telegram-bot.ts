/**
 * Admin Telegram bot — guided UX for registering/removing 1C OData connections.
 *
 * Required env vars:
 *   ADMIN_BOT_TOKEN   — get from @BotFather
 *   ADMIN_CHAT_ID     — your Telegram chat ID (get from @userinfobot)
 *
 * Commands:
 *   /add [name url user pass]  — add connection (guided wizard or one-liner)
 *   /list                       — show connections with inline Remove buttons
 *   /remove <name>              — delete a connection
 *   /cancel                     — exit the current wizard
 *   /help, /start               — show main menu
 */

import { addConnection, removeConnection, listConnections } from "./connections-store.js";

const TOKEN   = process.env.ADMIN_BOT_TOKEN;
const CHAT_ID = process.env.ADMIN_CHAT_ID;
const API     = `https://api.telegram.org/bot${TOKEN}`;

// ── Telegram API types ────────────────────────────────────────────────────────

interface InlineButton   { text: string; callback_data: string; }
interface InlineKeyboard { inline_keyboard: InlineButton[][]; }

interface TgMessage {
  message_id: number;
  chat: { id: number };
  from?: { id: number };
  text?: string;
}
interface TgCallbackQuery {
  id: string;
  from: { id: number };
  message?: TgMessage;
  data?: string;
}
interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
}

// ── Telegram API helpers ──────────────────────────────────────────────────────

async function apiCall(method: string, body: object): Promise<void> {
  await fetch(`${API}/${method}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  }).catch(() => {});
}

function send(chatId: number | string, text: string, markup?: InlineKeyboard): Promise<void> {
  return apiCall("sendMessage", { chat_id: chatId, text, parse_mode: "Markdown", reply_markup: markup });
}

function editText(chatId: number | string, messageId: number, text: string, markup?: InlineKeyboard): Promise<void> {
  return apiCall("editMessageText", { chat_id: chatId, message_id: messageId, text, parse_mode: "Markdown", reply_markup: markup });
}

function answerCb(id: string, text?: string): Promise<void> {
  return apiCall("answerCallbackQuery", { callback_query_id: id, text });
}

async function getUpdates(offset: number): Promise<TgUpdate[]> {
  const res  = await fetch(`${API}/getUpdates?timeout=30&offset=${offset}`);
  const json = await res.json() as { ok: boolean; result: TgUpdate[] };
  return json.ok ? json.result : [];
}

// ── Wizard state ──────────────────────────────────────────────────────────────

type WizardStep = "name" | "url" | "username" | "password";
const STEPS: WizardStep[] = ["name", "url", "username", "password"];

const STEP_PROMPT: Record<WizardStep, string> = {
  name:     "Give this connection a short name (e.g. `mycompany`):",
  url:      "Enter the 1C server URL (e.g. `https://yourserver/ИмяБазы`):",
  username: "Enter the 1C username:",
  password: "Enter the password:",
};

interface WizardState {
  step:      WizardStep;
  name?:     string;
  url?:      string;
  username?: string;
  password?: string;
}

// Pending confirmations stored server-side — passwords exceed Telegram's 64-byte callback_data limit
interface PendingEntry { name: string; baseUrl: string; username: string; password: string; }

const _wizards = new Map<number, WizardState>();
const _pending = new Map<number, PendingEntry>();

// ── Shared UI ─────────────────────────────────────────────────────────────────

const MAIN_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "➕ Add Connection", callback_data: "wizard:start" }],
    [{ text: "📋 List Connections", callback_data: "action:list" }],
  ],
};

function showMenu(chatId: number): Promise<void> {
  return send(
    chatId,
    "*AI BUH — Admin Panel*\n\nManage 1C OData connections for your MCP server.\n\nUsers connect via the header:\n`X-Connection-Name: <name>`",
    MAIN_MENU,
  );
}

// ── Wizard flow ───────────────────────────────────────────────────────────────

async function startWizard(chatId: number): Promise<void> {
  _wizards.set(chatId, { step: "name" });
  await send(chatId, "➕ *Add a new 1C connection*\n\nSend /cancel at any time to abort.\n\n" + STEP_PROMPT.name);
}

async function advanceWizard(chatId: number, value: string): Promise<void> {
  const state = _wizards.get(chatId);
  if (!state) return;

  (state as Record<string, string>)[state.step] = value.trim();

  const nextIdx = STEPS.indexOf(state.step) + 1;

  if (nextIdx < STEPS.length) {
    state.step = STEPS[nextIdx];
    await send(chatId, STEP_PROMPT[state.step]);
    return;
  }

  // All steps collected — build the entry and ask for confirmation
  _wizards.delete(chatId);

  const baseUrl = state.url!.includes("/odata/standard.odata")
    ? state.url!
    : `${state.url!.replace(/\/$/, "")}/odata/standard.odata`;

  const entry: PendingEntry = {
    name:     state.name!,
    baseUrl,
    username: state.username!,
    password: state.password!,
  };
  _pending.set(chatId, entry);

  const maskPassword = "•".repeat(Math.min(entry.password.length, 10));

  await send(
    chatId,
    `*Review your connection:*\n\n` +
    `🏷 *Name:*     \`${entry.name}\`\n` +
    `🌐 *URL:*      \`${entry.baseUrl}\`\n` +
    `👤 *Username:* \`${entry.username}\`\n` +
    `🔑 *Password:* ${maskPassword}\n\n` +
    `Save this connection?`,
    {
      inline_keyboard: [[
        { text: "✅ Save", callback_data: "confirm:save" },
        { text: "❌ Cancel", callback_data: "confirm:cancel" },
      ]],
    },
  );
}

// ── Connections list with inline Remove buttons ───────────────────────────────

async function showList(chatId: number, prefix = ""): Promise<void> {
  const list = listConnections();
  if (!list.length) {
    await send(chatId, (prefix ? prefix + "\n\n" : "") + "No connections registered yet.", MAIN_MENU);
    return;
  }
  const lines    = list.map(c => `• *${c.name}*\n  \`${c.baseUrl}\`\n  user: ${c.username}`);
  const keyboard = list.map(c => [{ text: `🗑 Remove ${c.name}`, callback_data: `remove:${c.name}` }]);
  keyboard.push([{ text: "➕ Add Connection", callback_data: "wizard:start" }]);
  await send(chatId, (prefix ? prefix + "\n\n" : "") + lines.join("\n\n"), { inline_keyboard: keyboard });
}

// ── Message handler ───────────────────────────────────────────────────────────

async function handleMessage(msg: TgMessage): Promise<void> {
  const chatId = msg.chat.id;

  if (String(chatId) !== CHAT_ID) {
    await send(chatId, "⛔ Unauthorised.");
    return;
  }

  const text = (msg.text ?? "").trim();

  // /cancel always exits the wizard regardless of step
  if (text === "/cancel") {
    _wizards.delete(chatId);
    _pending.delete(chatId);
    await send(chatId, "Cancelled.", MAIN_MENU);
    return;
  }

  // Mid-wizard: non-command text is the next answer
  if (_wizards.has(chatId) && !text.startsWith("/")) {
    await advanceWizard(chatId, text);
    return;
  }

  const [cmd, ...args] = text.split(/\s+/);

  switch (cmd) {
    case "/start":
      await showMenu(chatId);
      break;

    case "/help":
      await send(
        chatId,
        "*Commands:*\n" +
        "`/add [name url user pass]` — add a connection\n" +
        "`/list` — show connections\n" +
        "`/remove <name>` — delete a connection\n" +
        "`/cancel` — cancel current operation",
        MAIN_MENU,
      );
      break;

    case "/add": {
      if (args.length >= 4) {
        // Power-user one-liner: /add name url user pass (password may contain spaces)
        const [name, url, username, ...rest] = args;
        const password = rest.join(" ");
        const baseUrl  = url.includes("/odata/standard.odata")
          ? url : `${url.replace(/\/$/, "")}/odata/standard.odata`;
        addConnection({ name, baseUrl, username, password });
        await send(chatId,
          `✅ *${name}* registered!\n\nUsers connect with:\n\`X-Connection-Name: ${name}\``,
          MAIN_MENU,
        );
      } else {
        await startWizard(chatId);
      }
      break;
    }

    case "/list":
      await showList(chatId);
      break;

    case "/remove": {
      const [name] = args;
      if (!name) { await send(chatId, "Usage: `/remove <name>`"); break; }
      const deleted = removeConnection(name);
      if (deleted) {
        await showList(chatId, `🗑 *${name}* removed.`);
      } else {
        await send(chatId, `*${name}* not found.`, MAIN_MENU);
      }
      break;
    }

    default:
      await showMenu(chatId);
  }
}

// ── Callback query handler ────────────────────────────────────────────────────

async function handleCallbackQuery(cq: TgCallbackQuery): Promise<void> {
  const chatId = cq.from.id;
  const data   = cq.data ?? "";

  if (String(chatId) !== CHAT_ID) {
    await answerCb(cq.id, "⛔ Unauthorised");
    return;
  }

  if (data === "wizard:start") {
    await answerCb(cq.id);
    await startWizard(chatId);
    return;
  }

  if (data === "action:list") {
    await answerCb(cq.id);
    await showList(chatId);
    return;
  }

  if (data === "confirm:save") {
    const entry = _pending.get(chatId);
    if (!entry) {
      await answerCb(cq.id, "Session expired — please start over");
      await showMenu(chatId);
      return;
    }
    _pending.delete(chatId);
    addConnection(entry);
    await answerCb(cq.id, "✅ Saved!");
    if (cq.message) {
      await editText(
        chatId,
        cq.message.message_id,
        `✅ *${entry.name}* registered!\n\n` +
        `🌐 \`${entry.baseUrl}\`\n` +
        `👤 ${entry.username}`,
      );
    }
    await showList(chatId, `Connection *${entry.name}* is now live.`);
    return;
  }

  if (data === "confirm:cancel") {
    _pending.delete(chatId);
    await answerCb(cq.id, "Cancelled");
    if (cq.message) {
      await editText(chatId, cq.message.message_id, "❌ Connection not saved.");
    }
    await showMenu(chatId);
    return;
  }

  if (data.startsWith("remove:")) {
    const name    = data.slice(7);
    const deleted = removeConnection(name);
    if (deleted) {
      await answerCb(cq.id, `🗑 ${name} removed`);
      await showList(chatId, `🗑 *${name}* removed.`);
    } else {
      await answerCb(cq.id, "Not found");
    }
    return;
  }

  await answerCb(cq.id);
}

// ── Polling loop ──────────────────────────────────────────────────────────────

export function startAdminBot(): void {
  if (!TOKEN || !CHAT_ID) return;

  console.log("Admin Telegram bot started (long-polling).");
  let offset = 0;

  void (async () => {
    while (true) {
      try {
        const updates = await getUpdates(offset);
        for (const u of updates) {
          offset = u.update_id + 1;
          if (u.message)        void handleMessage(u.message).catch(() => {});
          if (u.callback_query) void handleCallbackQuery(u.callback_query).catch(() => {});
        }
      } catch {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  })();
}
