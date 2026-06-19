/**
 * Conversational 1C agent for the Telegram bot.
 * Uses OpenAI-compatible /chat/completions with tool use to answer accounting questions.
 *
 * Required env: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL
 * Fallback:     ANTHROPIC_API_KEY (uses claude-sonnet-4-6)
 */

import { OneCClient } from "@aibos/onec-client";
import { CatalogService } from "@aibos/services";
import { ReportsService } from "@aibos/services";
import { RegisterService } from "@aibos/services";
import { DocumentService } from "@aibos/services";
import type { ConnectionEntry } from "./connections-store.js";

// ── LLM config ────────────────────────────────────────────────────────────────

function resolveLlm(): { baseUrl: string; apiKey: string; model: string } | null {
  const baseUrl = (process.env["LLM_BASE_URL"] ?? "").replace(/\/$/, "");
  const apiKey  = process.env["LLM_API_KEY"] ?? "";
  const model   = process.env["LLM_MODEL"] ?? "";
  if (baseUrl && model) return { baseUrl, apiKey, model };
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    return { baseUrl: "https://api.anthropic.com/v1", apiKey: anthropicKey, model: model || "claude-sonnet-4-6" };
  }
  return null;
}

// ── Services factory ──────────────────────────────────────────────────────────

interface Services {
  client:   OneCClient;
  catalog:  CatalogService;
  reports:  ReportsService;
  register: RegisterService;
  docs:     DocumentService;
}

const _serviceCache = new Map<string, Services>();

function getServices(entry: ConnectionEntry): Services {
  const cached = _serviceCache.get(entry.name);
  if (cached) return cached;

  const client   = new OneCClient({ baseUrl: entry.baseUrl, username: entry.username, password: entry.password, timeoutMs: 30000, maxRetries: 2 });
  const services = {
    client,
    catalog:  new CatalogService(client),
    reports:  new ReportsService(client),
    register: new RegisterService(client),
    docs:     new DocumentService(client),
  };
  _serviceCache.set(entry.name, services);
  return services;
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_organizations",
      description: "Список всех организаций в базе 1С. Вызывай первым если нужен GUID организации.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_osv",
      description: "Оборотно-сальдовая ведомость (ОСВ) за период. Показывает обороты и остатки по всем счетам.",
      parameters: {
        type: "object",
        properties: {
          date_from:         { type: "string", description: "Начало периода YYYY-MM-DD" },
          date_to:           { type: "string", description: "Конец периода YYYY-MM-DD" },
          organization_guid: { type: "string", description: "GUID организации (из list_organizations)" },
        },
        required: ["date_from", "date_to"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_account_balance",
      description: "Остаток по конкретному счёту бухучёта на текущую дату.",
      parameters: {
        type: "object",
        properties: {
          account_code:      { type: "string", description: "Код счёта, например '1010', '3310', '1030'" },
          organization_guid: { type: "string", description: "GUID организации (опционально)" },
        },
        required: ["account_code"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_account_turnovers",
      description: "Обороты по счёту за период (дебет и кредит).",
      parameters: {
        type: "object",
        properties: {
          account_code:      { type: "string", description: "Код счёта" },
          date_from:         { type: "string", description: "Начало периода YYYY-MM-DD" },
          date_to:           { type: "string", description: "Конец периода YYYY-MM-DD" },
          organization_guid: { type: "string", description: "GUID организации (опционально)" },
        },
        required: ["account_code", "date_from", "date_to"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_documents",
      description: "Список документов 1С за период. Типы: РеализацияТоваровУслуг, ПоступлениеТоваровУслуг, ПлатежноеПоручениеИсходящее, ПлатежноеПоручениеВходящее, ПриходныйКассовыйОрдер, РасходныйКассовыйОрдер.",
      parameters: {
        type: "object",
        properties: {
          document_type:     { type: "string", description: "Тип документа 1С" },
          date_from:         { type: "string", description: "Начало периода YYYY-MM-DD" },
          date_to:           { type: "string", description: "Конец периода YYYY-MM-DD" },
          organization_guid: { type: "string", description: "GUID организации (опционально)" },
          contractor_guid:   { type: "string", description: "GUID контрагента (опционально)" },
          limit:             { type: "number", description: "Максимум документов (по умолчанию 20)" },
        },
        required: ["document_type", "date_from", "date_to"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_contractors",
      description: "Поиск контрагентов по названию или ИНН/РНН.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Название компании или ИНН/РНН" },
          limit: { type: "number", description: "Максимум результатов (по умолчанию 10)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_contractor_settlements",
      description: "Взаиморасчёты с контрагентами — дебиторская и кредиторская задолженность.",
      parameters: {
        type: "object",
        properties: {
          contractor_guid:   { type: "string", description: "GUID конкретного контрагента (опционально)" },
          organization_guid: { type: "string", description: "GUID организации (опционально)" },
        },
        required: [],
      },
    },
  },
];

// ── Tool execution ────────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>, svc: Services): Promise<string> {
  const today     = new Date().toISOString().slice(0, 10);
  const yearStart = `${today.slice(0, 4)}-01-01`;

  try {
    switch (name) {
      case "list_organizations": {
        const orgs = await svc.catalog.getOrganizations();
        return JSON.stringify(orgs.map(o => ({
          guid:     o.Ref_Key,
          name:     o.Description,
          fullName: o.НаименованиеПолное,
          inn:      o.ИдентификационныйНомер || o.РНН,
        })));
      }

      case "get_osv": {
        const from    = (args["date_from"] as string) ?? yearStart;
        const to      = (args["date_to"]   as string) ?? today;
        const orgGuid = args["organization_guid"] as string | undefined;
        const result  = await svc.reports.getOSV(from, to, orgGuid);
        const top = result.rows
          .filter(r => r.closingDr > 0 || r.closingCr > 0)
          .sort((a, b) => Math.max(b.closingDr, b.closingCr) - Math.max(a.closingDr, a.closingCr))
          .slice(0, 30);
        return JSON.stringify({ period: `${from} — ${to}`, rows: top, totals: result.totals });
      }

      case "get_account_balance": {
        const code    = args["account_code"]      as string;
        const orgGuid = args["organization_guid"] as string | undefined;
        const result  = await svc.register.getAccountBalance(code, orgGuid);
        return JSON.stringify(result);
      }

      case "get_account_turnovers": {
        const code    = args["account_code"]      as string;
        const from    = args["date_from"]         as string;
        const to      = args["date_to"]           as string;
        const orgGuid = args["organization_guid"] as string | undefined;
        const result  = await svc.register.getAccountTurnovers(code, from, to, orgGuid);
        return JSON.stringify(result);
      }

      case "list_documents": {
        const docs = await svc.docs.searchDocuments({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          documentType:     args["document_type"] as any,
          dateFrom:         args["date_from"]         as string | undefined,
          dateTo:           args["date_to"]           as string | undefined,
          organizationGuid: args["organization_guid"] as string | undefined,
          contractorGuid:   args["contractor_guid"]   as string | undefined,
          limit:            (args["limit"] as number | undefined) ?? 20,
        });
        return JSON.stringify(docs.map(d => ({
          guid:   d.Ref_Key,
          date:   d.Date,
          number: d.Number,
          amount: d.СуммаДокумента,
          posted: d.Posted,
        })));
      }

      case "search_contractors": {
        const list = await svc.catalog.searchContractors(
          args["query"] as string,
          (args["limit"] as number | undefined) ?? 10,
        );
        return JSON.stringify(list.map(c => ({
          guid: c.Ref_Key,
          name: c.Description,
          inn:  c.РНН || c.ИдентификационныйКодЛичности,
        })));
      }

      case "get_contractor_settlements": {
        const rows = await svc.register.getContractorSettlements(
          args["contractor_guid"]   as string | undefined,
          args["organization_guid"] as string | undefined,
        );
        return JSON.stringify(rows.slice(0, 50));
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ── Conversation history (per chat_id) ───────────────────────────────────────

type Role = "system" | "user" | "assistant" | "tool";
interface Message { role: Role; content: string; tool_call_id?: string; name?: string; }

const _history = new Map<number, Message[]>();
const MAX_HISTORY = 10;

export function clearHistory(chatId: number): void {
  _history.delete(chatId);
}

// ── Main chat function ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = [
  "Ты AI-ассистент бухгалтера для работы с 1С:Бухгалтерия Казахстан.",
  "У тебя есть инструменты для получения данных из базы 1С через OData.",
  "Отвечай строго на русском языке. Форматируй числа с разделителями (1 234 567).",
  "Если нужен GUID организации — сначала вызови list_organizations.",
  "Будь кратким и конкретным. Используй *жирный* текст для заголовков.",
  `Текущая дата: ${new Date().toLocaleDateString("ru-RU")}.`,
].join("\n");

export async function chat(chatId: number, userMessage: string, connection: ConnectionEntry): Promise<string> {
  const llm = resolveLlm();
  if (!llm) {
    return [
      "⚠️ LLM не настроен. Добавьте в .env на сервере:",
      "`LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`",
      "или `ANTHROPIC_API_KEY`",
    ].join("\n");
  }

  const svc = getServices(connection);

  if (!_history.has(chatId)) _history.set(chatId, []);
  const history = _history.get(chatId)!;

  history.push({ role: "user", content: userMessage });

  const messages: object[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-MAX_HISTORY * 2),
  ];

  let finalText = "";

  for (let i = 0; i < 6; i++) {
    const res = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${llm.apiKey}`,
        ...(llm.baseUrl.includes("anthropic.com") ? { "anthropic-version": "2023-06-01" } : {}),
      },
      body: JSON.stringify({
        model:       llm.model,
        messages,
        tools:       TOOLS,
        tool_choice: "auto",
        max_tokens:  1500,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`LLM ${res.status}: ${body.slice(0, 300)}`);
    }

    const json = await res.json() as {
      choices: Array<{
        finish_reason: string;
        message: {
          role: string;
          content: string | null;
          tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
        };
      }>;
    };

    const choice  = json.choices[0];
    const message = choice.message;

    messages.push({ role: "assistant", content: message.content ?? "", tool_calls: message.tool_calls });

    if (choice.finish_reason === "stop" || !message.tool_calls?.length) {
      finalText = message.content ?? "";
      break;
    }

    for (const call of message.tool_calls) {
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(call.function.arguments); } catch { /* noop */ }
      const result = await executeTool(call.function.name, args, svc);
      messages.push({ role: "tool", tool_call_id: call.id, content: result, name: call.function.name });
    }
  }

  if (finalText) {
    history.push({ role: "assistant", content: finalText });
    if (history.length > MAX_HISTORY * 2) history.splice(0, 2);
  }

  return finalText || "Не удалось получить ответ.";
}
