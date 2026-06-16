/**
 * Telegram bot interface — multi-tenant router.
 *
 * Each Telegram user is resolved to a tenant via the registry.
 * Each tenant gets its own MCP server process (process-per-tenant isolation).
 * Each user gets their own conversation history (durable in SQLite).
 *
 * Commands: /start  /clear  /status  /help
 * Admin commands (ADMIN_TELEGRAM_IDS): /admin_tenants  /admin_status <id> <status>
 */
import "dotenv/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import OpenAI from "openai";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dns from "dns/promises";

import { AgentSession } from "./session.mjs";
import { McpClient } from "./mcp-client.mjs";
import { getClient, stopAll, clearQuarantine, evictTenant } from "./tenant-manager.mjs";
import {
  createTenant, linkUser,
  getTenantByTelegramId, isActive, listTenants,
  setTenantStatus, loadHistory, appendHistory, clearHistory,
  recordUsage, getUsage,
} from "./registry/tenants.mjs";
import { renderSegments, renderXlsx, renderPdf } from "./render/bridge.mjs";
import { put as cachePut, get as cacheGet }       from "./render/cache.mjs";
import { thinking }                                from "./ui-text.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const API_KEY     = process.env.DEEPSEEK_API_KEY;
const MODEL       = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
const SUPPORT_MSG = process.env.SUPPORT_CONTACT ?? "Напишите нам для подключения.";

/** Admin Telegram IDs (comma-separated) */
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS ?? "")
  .split(",").map((s) => s.trim()).filter(Boolean).map(Number);

if (!BOT_TOKEN) { console.error("❌  TELEGRAM_BOT_TOKEN not set"); process.exit(1); }
if (!API_KEY)   { console.error("❌  DEEPSEEK_API_KEY not set");    process.exit(1); }

const openai = new OpenAI({ apiKey: API_KEY, baseURL: "https://api.deepseek.com/v1", timeout: 120_000 });

const SERVER_DIR = resolve(__dirname, process.env.MCP_SERVER_DIR ?? "../MCP 1C v1");
const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS ?? "14", 10);

// ── Registration wizard ────────────────────────────────────────────────────────

// chatId → { step, company?, url?, username?, password? }
const regStates = new Map();

function isPrivateIp(ip) {
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (v4) {
    const [, a, b, c] = v4.map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 0) return true;
  }
  if (ip === "::1" || /^fe80:/i.test(ip) || /^f[cd]/i.test(ip)) return true;
  return false;
}

async function validateOdataUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch {
    throw new Error("Некорректный URL.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("URL должен начинаться с https://\nПередача пароля по HTTP небезопасна.");
  }
  let addrs;
  try { addrs = await dns.resolve(parsed.hostname); } catch {
    throw new Error(`Не удалось разрезолвить хост: ${parsed.hostname}`);
  }
  for (const ip of addrs) {
    if (isPrivateIp(ip)) {
      throw new Error(`Хост ведёт на приватный IP (${ip}).\nУкажите публичный 1C-сервер.`);
    }
  }
}

async function handleRegStep(ctx, state) {
  const chatId = ctx.chat.id;
  const text   = ctx.message.text.trim();

  // Step 1 — company name
  if (state.step === "company") {
    if (text.length < 2) {
      await ctx.reply("Введите корректное название (минимум 2 символа):");
      return;
    }
    state.company = text;
    state.step    = "url";
    await ctx.replyWithHTML(
      "📍 <b>Шаг 2/4</b> — URL 1C OData\n\n" +
      "Введите HTTPS-адрес вашего 1C OData сервера:\n" +
      "<code>https://1c.company.kz/base/odata/standard.odata</code>"
    );
    return;
  }

  // Step 2 — OData URL
  if (state.step === "url") {
    const msg = await ctx.reply("🔍 Проверяю URL…");
    try {
      await validateOdataUrl(text);
      state.url  = text;
      state.step = "username";
      await ctx.telegram.deleteMessage(chatId, msg.message_id).catch(() => {});
      await ctx.replyWithHTML("✅ URL проверен.\n\n📍 <b>Шаг 3/4</b> — Введите логин 1C:");
    } catch (e) {
      await ctx.telegram.deleteMessage(chatId, msg.message_id).catch(() => {});
      await ctx.reply(`❌ ${e.message}\n\nВведите URL ещё раз:`);
    }
    return;
  }

  // Step 3 — username
  if (state.step === "username") {
    if (!text) { await ctx.reply("Введите логин 1C:"); return; }
    state.username = text;
    state.step     = "password";
    await ctx.replyWithHTML("📍 <b>Шаг 4/4</b> — Введите пароль 1C:");
    return;
  }

  // Step 4 — password + test + register
  if (state.step === "password") {
    state.password = text;
    const msg = await ctx.reply("⚙️ Проверяю подключение к 1C…");
    try {
      const client = new McpClient(SERVER_DIR, {
        ONEC_BASE_URL: state.url,
        ONEC_USERNAME: state.username,
        ONEC_PASSWORD: state.password,
      });
      await client.start();
      await client.callTool("kz_chart_list_sections", {});
      client.stop();

      const { id } = createTenant({
        name:      state.company,
        odataUrl:  state.url,
        username:  state.username,
        password:  state.password,
        plan:      "starter",
        trialDays: TRIAL_DAYS,
      });
      linkUser(ctx.from.id, id, "owner");

      regStates.delete(chatId);
      await ctx.telegram.deleteMessage(chatId, msg.message_id).catch(() => {});
      await ctx.replyWithHTML(
        `🎉 <b>Компания зарегистрирована!</b>\n\n` +
        `• Компания: <b>${escHtml(state.company)}</b>\n` +
        `• Статус: trial (${TRIAL_DAYS} дней)\n\n` +
        `Теперь вы можете задавать вопросы по 1С.\n` +
        `Например: <code>финансовое состояние</code> или <code>список должников</code>`
      );
    } catch (e) {
      regStates.delete(chatId);
      await ctx.telegram.deleteMessage(chatId, msg.message_id).catch(() => {});
      await ctx.reply(
        `❌ Не удалось подключиться к 1C:\n${e.message}\n\n` +
        `Проверьте данные и попробуйте /register снова.`
      );
    }
    return;
  }
}

// ── Markdown → Telegram HTML ──────────────────────────────────────────────────
function toHtml(text) {
  return text
    // fenced code blocks — protect first, no further processing inside
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
      `<pre>${escHtml(code.trim())}</pre>`)
    // inline code
    .replace(/`([^`]+)`/g, (_, c) => `<code>${escHtml(c)}</code>`)
    // ## / ### headings → bold (Telegram HTML has no h-tags)
    .replace(/^#{1,3}\s+(.+)$/gm, (_, t) =>
      `<b>${t.trim().replace(/\*\*/g, "").replace(/__/g, "")}</b>`)
    // standalone --- rules → empty line (visual noise in Telegram)
    .replace(/^\s*[-—]{3,}\s*$/gm, "")
    // markdown tables → <pre>, stripping MD markup from cells before escaping
    // (so **bold** inside cells doesn't show as raw <b> tags in the code block)
    .replace(/((?:\|.+\|\n?)+)/g, (table) => {
      const clean = table
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1");
      return `<pre>${escHtml(clean.trim())}</pre>`;
    })
    // bold / italic — applied after tables so they don't inject tags into <pre>
    .replace(/\*\*(.+?)\*\*/g, (_, t) => `<b>${t}</b>`)
    .replace(/__(.+?)__/g,    (_, t) => `<b>${t}</b>`)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, (_, t) => `<i>${t}</i>`);
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function splitMessage(text, limit = 4000) {
  if (text.length <= limit) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf("\n", limit);
    if (cut < limit * 0.5) cut = limit;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function sendLong(ctx, text) {
  const html   = toHtml(text);
  const chunks = splitMessage(html);
  for (const chunk of chunks) {
    await ctx.replyWithHTML(chunk).catch(async () => {
      await ctx.reply(chunk.replace(/<[^>]+>/g, "")).catch(() => {});
    });
  }
}

async function editStatus(ctx, msgId, text) {
  try {
    await ctx.telegram.editMessageText(ctx.chat.id, msgId, undefined, text);
  } catch {}
}

// ── In-memory session store (AgentSession per user) ───────────────────────────
// Sessions are re-created when the tenant's MCP client respawns.
// chatId → AgentSession
const sessions = new Map();
// chatId → boolean
const busy     = new Map();

function getSession(chatId, tenantId, client) {
  const existing = sessions.get(chatId);
  // Rebind if the client changed (tenant respawned)
  if (existing && existing.__clientRef === client) return existing;
  // Build history from SQLite (durable across bot restarts)
  const history    = loadHistory(tenantId, chatId);
  const session    = new AgentSession(openai, client, history);
  session.__clientRef = client;    // detect respawn
  sessions.set(chatId, session);
  return session;
}

// ── Admin guard ────────────────────────────────────────────────────────────────
function isAdmin(ctx) {
  return ADMIN_IDS.includes(ctx.from?.id);
}

// ── Bot setup ─────────────────────────────────────────────────────────────────
const bot = new Telegraf(BOT_TOKEN, { handlerTimeout: 600_000 }); // 10 min — multi-tool chains can take 2–3 min

// Global error handler — prevents unhandled errors from crashing the process
bot.catch((err, ctx) => {
  const corrId = randomUUID().slice(0, 8);
  console.error(`[bot:catch] [${corrId}] user=${ctx?.from?.id}:`, err.message);
  ctx?.reply(`❌ Непредвиденная ошибка [${corrId}]. Попробуйте снова.`).catch(() => {});
  busy.delete(ctx?.chat?.id);
});

// Private-chat only
bot.use((ctx, next) => {
  if (ctx.chat?.type !== "private") return; // silently drop group messages
  return next();
});

// ── Commands ──────────────────────────────────────────────────────────────────
bot.command("start", (ctx) => {
  const tenant = getTenantByTelegramId(ctx.from.id);
  if (!tenant) {
    ctx.replyWithHTML(
      `<b>onec-kz финансовый агент</b>\n\n` +
      `Для начала работы подключите вашу 1C:Бухгалтерия.\n\n` +
      `Нажмите /register — я проведу вас через регистрацию за 1 минуту.`
    );
    return;
  }
  ctx.replyWithHTML(
    `<b>onec-kz финансовый агент</b>\n\n` +
    `Я подключён к 1С:Бухгалтерия (Казахстан) и умею:\n` +
    `• Финансовый анализ и отчёты\n` +
    `• Аудит аномалий и рисков\n` +
    `• Проверка НДС, зарплат, периода\n` +
    `• Акты сверки, должники, кредиторы\n\n` +
    `Просто напишите запрос на русском или английском.\n\n` +
    `<b>Команды:</b>\n` +
    `/clear — очистить историю диалога\n` +
    `/status — состояние подписки\n` +
    `/help — список навыков`
  );
});

bot.command("register", async (ctx) => {
  const tenant = getTenantByTelegramId(ctx.from.id);
  if (tenant) {
    ctx.replyWithHTML(
      `✅ Вы уже подключены: <b>${escHtml(tenant.name)}</b>\n` +
      `Используйте /status для просмотра подписки.`
    );
    return;
  }
  regStates.set(ctx.chat.id, { step: "company" });
  ctx.replyWithHTML(
    `📋 <b>Регистрация компании</b>\n\n` +
    `Я задам 4 вопроса. В любой момент /cancel для отмены.\n\n` +
    `📍 <b>Шаг 1/4</b> — Введите название компании:`
  );
});

bot.command("cancel", (ctx) => {
  if (regStates.has(ctx.chat.id)) {
    regStates.delete(ctx.chat.id);
    ctx.reply("❌ Регистрация отменена.");
  } else {
    ctx.reply("Нечего отменять.");
  }
});

bot.command("help", (ctx) => {
  ctx.replyWithHTML(
    `<b>Доступные навыки (skills):</b>\n\n` +
    `• <code>закрыть месяц</code> — period close\n` +
    `• <code>НДС 300</code> — подготовка декларации\n` +
    `• <code>проверить зарплату</code> — payroll audit\n` +
    `• <code>акт сверки</code> — reconciliation act\n` +
    `• <code>аудит аномалий</code> — ML anomaly scan\n` +
    `• <code>due diligence контрагента</code>\n` +
    `• <code>еженедельный мониторинг</code>\n` +
    `• <code>закрытие года</code>\n` +
    `• <code>отчёт директору</code>\n` +
    `• <code>налоговая проверка</code>\n` +
    `• <code>КПН расчёт</code>\n\n` +
    `<b>Быстрые запросы:</b>\n` +
    `• <code>финансовое состояние</code>\n` +
    `• <code>список должников</code>\n` +
    `• <code>ОСВ за [месяц]</code>\n` +
    `• <code>движение денег</code>`
  );
});

bot.command("clear", async (ctx) => {
  const tenant = getTenantByTelegramId(ctx.from.id);
  if (tenant) clearHistory(tenant.id, ctx.from.id);
  sessions.delete(ctx.chat.id);
  ctx.reply("✅ История диалога очищена.");
});

bot.command("status", async (ctx) => {
  const tenant = getTenantByTelegramId(ctx.from.id);
  if (!tenant) {
    ctx.replyWithHTML(
      `<b>Статус:</b> не подключён\n\n${escHtml(SUPPORT_MSG)}`
    );
    return;
  }
  const active   = isActive(tenant);
  const trial    = tenant.status === "trial" && tenant.trial_ends_at
    ? `\n• Trial до: ${new Date(tenant.trial_ends_at).toISOString().slice(0, 10)}`
    : "";
  const usage    = getUsage(tenant.id, 7);
  const tokens7d = usage.reduce((s, r) => s + r.llm_tokens, 0);
  ctx.replyWithHTML(
    `<b>Статус подписки:</b>\n` +
    `• Компания: ${escHtml(tenant.name)}\n` +
    `• Статус: ${active ? "✅ активна" : "⛔ " + tenant.status}${trial}\n` +
    `• Модель: ${MODEL}\n` +
    `• Токены (7 дней): ${tokens7d.toLocaleString()}\n` +
    `• Сессий: ${sessions.size}`
  );
});

// ── Admin commands ─────────────────────────────────────────────────────────────
bot.command("admin_tenants", (ctx) => {
  if (!isAdmin(ctx)) { ctx.reply("⛔ Access denied."); return; }
  const tenants = listTenants();
  if (!tenants.length) { ctx.reply("No tenants."); return; }
  const lines = tenants.map((t) =>
    `• <code>${t.id.slice(0, 8)}</code> <b>${escHtml(t.name)}</b> — ${t.status}`
  );
  ctx.replyWithHTML(`<b>Tenants (${tenants.length}):</b>\n\n` + lines.join("\n"));
});

bot.command("admin_status", (ctx) => {
  if (!isAdmin(ctx)) { ctx.reply("⛔ Access denied."); return; }
  const parts = ctx.message.text.split(/\s+/).slice(1);
  if (parts.length < 2) { ctx.reply("Usage: /admin_status <tenantId> <status>"); return; }
  const [tenantId, status] = parts;
  try {
    setTenantStatus(tenantId, status);
    if (status !== "active") evictTenant(tenantId); // force re-check on next message
    ctx.reply(`✅ Tenant ${tenantId.slice(0, 8)} → ${status}`);
  } catch (e) {
    ctx.reply(`❌ ${e.message}`);
  }
});

bot.command("admin_quarantine_clear", (ctx) => {
  if (!isAdmin(ctx)) { ctx.reply("⛔ Access denied."); return; }
  const tenantId = ctx.message.text.split(/\s+/)[1];
  if (!tenantId) { ctx.reply("Usage: /admin_quarantine_clear <tenantId>"); return; }
  clearQuarantine(tenantId);
  ctx.reply(`✅ Quarantine cleared for ${tenantId.slice(0, 8)}`);
});

// ── Table export callback (PDF / Excel on demand) ────────────────────────────
bot.action(/^tbl:([^:]+):(pdf|xlsx)$/, async (ctx) => {
  try {
    const key = ctx.match[1];
    const fmt = ctx.match[2];

    const answer = cacheGet(key);
    if (!answer) {
      await ctx.answerCbQuery("⚠️ Данные устарели. Повторите запрос.", { show_alert: true }).catch(() => {});
      return;
    }

    await ctx.answerCbQuery("⏳ Готовлю файл…").catch(() => {});

    if (fmt === "pdf") {
      const buf = await renderPdf(answer);
      await ctx.replyWithDocument({ source: buf, filename: "отчёт.pdf" });
    } else {
      const buf = await renderXlsx(answer);
      if (!buf) {
        await ctx.reply("⚠️ Таблицы не найдены в ответе.");
        return;
      }
      await ctx.replyWithDocument({ source: buf, filename: "отчёт.xlsx" });
    }
  } catch (e) {
    const corrId = randomUUID().slice(0, 8);
    console.error(`[bot:export] [${corrId}] fmt=${fmt ?? "?"}:`, e.message);
    await ctx.reply(`❌ Не удалось создать файл [${corrId}]. Попробуйте снова.`).catch(() => {});
  }
});

// ── Main message handler ───────────────────────────────────────────────────────
bot.on(message("text"), async (ctx) => {
  const chatId   = ctx.chat.id;
  const userId   = ctx.from.id;
  const userText = ctx.message.text;

  // ── Registration wizard intercept ────────────────────────────────────────
  const regState = regStates.get(chatId);
  if (regState) {
    await handleRegStep(ctx, regState).catch((e) => {
      console.error("[bot:reg-step]", e.message);
    });
    return;
  }

  if (busy.get(chatId)) {
    await ctx.reply("⏳ Обрабатываю предыдущий запрос, подождите…").catch(() => {});
    return;
  }

  busy.set(chatId, true);

  try {
    // ── Tenant resolution & access control ──────────────────────────────────
    const tenant = getTenantByTelegramId(userId);
    if (!tenant) {
      await ctx.replyWithHTML(
        `Вы не подключены к системе.\n\n` +
        `Используйте /register для подключения вашей 1C:Бухгалтерия.\n\n` +
        `${escHtml(SUPPORT_MSG)}`
      );
      return;
    }
    if (!isActive(tenant)) {
      await ctx.replyWithHTML(
        `⛔ <b>Ваша подписка неактивна</b> (статус: ${tenant.status}).\n\n` +
        `Для продления свяжитесь с нами.`
      );
      return;
    }

    // ── Get tenant's MCP client ──────────────────────────────────────────────
    const statusMsg = await ctx.reply(thinking());
    const toolsUsed = [];

    let client;
    try {
      client = await getClient(tenant.id);
    } catch (e) {
      await ctx.telegram.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
      await ctx.reply(`⚠️ ${e.message}`);
      return;
    }

    // ── Run agent turn ───────────────────────────────────────────────────────
    const session = getSession(chatId, tenant.id, client);

    const answer = await session.runTurn(userText, async (toolName) => {
      toolsUsed.push(toolName);
      const label = toolsUsed.slice(-3).join(" → ");
      await editStatus(ctx, statusMsg.message_id,
        `⚙️ ${label}${toolsUsed.length > 3 ? ` (+${toolsUsed.length - 3} more)` : ""}`);
    });

    // ── Persist new messages to SQLite ───────────────────────────────────────
    appendHistory(tenant.id, userId, { role: "user",      content: userText });
    appendHistory(tenant.id, userId, { role: "assistant", content: answer   });

    // ── Record usage ─────────────────────────────────────────────────────────
    recordUsage(tenant.id, {
      tokens:    userText.length + answer.length,  // rough estimate; replace with real counts from response
      toolCalls: toolsUsed.length,
    });

    // ── Send reply ───────────────────────────────────────────────────────────
    await ctx.telegram.deleteMessage(chatId, statusMsg.message_id).catch(() => {});

    // Try rich rendering: inline PNG tables + PDF/Excel export buttons.
    // Falls back to plain sendLong() if the Python sidecar is unavailable.
    let hasTables = false;
    try {
      const segments = await renderSegments(answer);
      for (const seg of segments) {
        if (seg.type === "text") {
          if (seg.md.trim()) await sendLong(ctx, seg.md);
        } else if (seg.type === "png") {
          hasTables = true;
          await ctx.replyWithPhoto(
            { source: Buffer.from(seg.b64, "base64") },
          ).catch(async () => {
            // If photo send fails, continue gracefully
          });
        }
      }
      // Offer PDF + Excel export buttons if any table was rendered
      if (hasTables) {
        const key = cachePut(answer);
        await ctx.reply("📥 Экспорт таблиц:", {
          reply_markup: {
            inline_keyboard: [[
              { text: "📄 PDF (полный ответ)", callback_data: `tbl:${key}:pdf`  },
              { text: "📊 Excel (таблицы)",    callback_data: `tbl:${key}:xlsx` },
            ]],
          },
        }).catch(() => {});
      }
    } catch (renderErr) {
      // Python sidecar unavailable or failed — fall back to plain text
      const corrId = randomUUID().slice(0, 8);
      console.warn(`[bot] render fallback [${corrId}]:`, renderErr.message);
      await sendLong(ctx, answer);
    }

    if (toolsUsed.length > 0) {
      const unique = [...new Set(toolsUsed)];
      console.log(`[bot] tools used for user ${userId}: ${unique.join(", ")}`);
    }

  } catch (e) {
    // Generic error — never expose 1C URL / creds / stack in the user-visible message
    const corrId = randomUUID().slice(0, 8);
    console.error(`[bot] Error [${corrId}] for user ${userId} tenant ${getTenantByTelegramId(userId)?.id}:`, e.message);
    await ctx.reply(`❌ Ошибка обработки запроса [${corrId}]. Пожалуйста, попробуйте снова.`);
  } finally {
    busy.delete(chatId);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("✅  Registry loaded. Starting Telegram bot…");

  await bot.telegram.deleteWebhook({ drop_pending_updates: true });
  await bot.telegram.setMyCommands([]).catch(() => {});

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await bot.launch({ dropPendingUpdates: true });
      console.log("✅  Telegram bot running (multi-tenant mode)\n");
      break;
    } catch (e) {
      if (e.message?.includes("409") && attempt < 5) {
        console.log(`⏳  Another session active, retrying in 35s… (${attempt}/5)`);
        await new Promise((r) => setTimeout(r, 35_000));
      } else {
        throw e;
      }
    }
  }

  process.once("SIGINT",  () => { bot.stop("SIGINT");  stopAll(); });
  process.once("SIGTERM", () => { bot.stop("SIGTERM"); stopAll(); });
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
