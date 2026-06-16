# Session Handoff — 2026-06-04

## Project: onec-kz MCP Server + DeepSeek Agent + Telegram Bot

Root: `C:\Users\PC\Desktop\DevOPS\MCP metadata\`

---

## What Was Done This Session

### Telegram Bot — регистрация внутри бота + фикс краша

#### 1. `/register` wizard (bot.mjs)

Добавлена пошаговая регистрация прямо через Telegram — больше не нужен CLI `onboard.mjs`.

**Флоу (4 шага):**
1. Название компании
2. HTTPS URL 1C OData (валидация схемы + DNS resolve + SSRF-guard — приватные IP запрещены)
3. Логин 1C
4. Пароль 1C → тест подключения через McpClient → `createTenant` + `linkUser`

**Новые команды:**
- `/register` — старт wizard (если уже зарегистрирован — показывает статус)
- `/cancel` — отмена в любой момент
- `/start` — теперь предлагает `/register` для новых пользователей

**Изменения в `bot.mjs`:**
- Импорты: добавлены `dns`, `McpClient`, `createTenant`, `linkUser`
- Функции: `isPrivateIp()`, `validateOdataUrl()`, `handleRegStep()`
- Map `regStates` для хранения состояния wizard по chatId
- Перехват wizard-шагов в обработчике сообщений (до tenant-check)

#### 2. Фикс краша на таймауте DeepSeek (bot.mjs)

**Проблема:** При таймауте DeepSeek API (90 сек) ошибка не перехватывалась Telegraf → `main().catch()` → `process.exit(1)` → бот падал насмерть.

**Фикс:**
- Добавлен `bot.catch((err, ctx) => {...})` — глобальный обработчик ошибок Telegraf
- Явный `timeout: 120_000` на `new OpenAI({...})` клиенте

#### 3. Найденный тенант

В SQLite реестре уже существует тенант:
- Компания: **"Московский"**
- `tenant_id`: `259740dc-943f-476e-a711-60539f60e68d`
- `telegram_id`: `978519052` (username: yosoyra / Raimbek)

#### 4. Важное открытие: bot.launch() никогда не резолвится

В Telegraf v4 `await bot.launch()` блокирует поток до `bot.stop()`. Строка `"✅ Telegram bot running"` в коде никогда не печатается при нормальной работе. **Одна строка** `"✅ Registry loaded. Starting Telegram bot…"` — это норма.

---

### GUID Resolver — новый инструмент

**Цель:** Разрешать GUIDы (Ref_Key) из 1C в читаемые названия и тип сущности.

**Созданные файлы:**

| Файл | Назначение |
|------|-----------|
| `MCP 1C v1/packages/services/src/GuidResolverService.ts` | Сервис поиска GUID по всем entity set |
| `MCP 1C v1/apps/mcp/src/tools/guid-resolver.tools.ts` | Два MCP-инструмента: `onec_resolve_guid` и `onec_resolve_guids` |

**Изменённые файлы:**

| Файл | Изменение |
|------|----------|
| `packages/services/src/index.ts` | Экспорт `GuidResolverService` и `GuidResolution` |
| `apps/mcp/src/server.ts` | Импорт + инстанцирование + регистрация инструментов |

**Как работает поиск (3 слоя):**
1. `hint` параметр → проверяет сразу нужный entity set (быстрый путь)
2. 30 приоритетных entity set (Контрагенты, Номенклатура, Сотрудники, Документы…) — параллельные батчи по 8
3. Полный перебор всех 889 сущностей из EntitySchemaService (запасной вариант)

**MCP-инструменты:**
- `onec_resolve_guid` — один GUID + необязательный `hint`
- `onec_resolve_guids` — массив до 50 GUIDов параллельно

**Ответ:**
```json
{
  "guid": "9b2e4f3c-...",
  "found": true,
  "entityType": "Catalog",
  "entityName": "Контрагенты",
  "fullEntitySet": "Catalog_Контрагенты",
  "presentation": "ТОО Ромашка",
  "fields": { "Ref_Key": "...", "Наименование": "ТОО Ромашка" }
}
```

**TypeScript компилируется без ошибок** (`tsc --noEmit` → 0 errors).

---

## Состояние проекта

### MCP 1C v1 (onec-kz MCP server)
- **Расположение:** `MCP 1C v1/`
- **Инструменты:** ~122 (120 было + 2 новых GUID resolver)
- **Старт:** `cd "MCP 1C v1" && npm run start` или `npx tsx apps/mcp/src/index.ts`
- **Конфиг:** `.env` в папке `MCP 1C v1/` (не в git, ONEC_BASE_URL, ONEC_USERNAME, ONEC_PASSWORD)

### DeepSeek Agent
- **Расположение:** `agent-deepseek/`
- **Старт:** `cd agent-deepseek && node agent.mjs`
- **Конфиг:** `agent-deepseek/.env` (DEEPSEEK_API_KEY, MCP_SERVER_DIR)
- **Статус:** Работает, 20 локальных скиллов, протестирован E2E

### Telegram Bot
- **Расположение:** `agent-deepseek/bot.mjs`
- **Старт:** `cd agent-deepseek && node bot.mjs`
- **Конфиг:** `agent-deepseek/.env` — `TELEGRAM_BOT_TOKEN`, `DEEPSEEK_API_KEY`, `APP_ENC_KEY`, `MCP_SERVER_DIR`
- **Статус:** ✅ Работает в фоне. Multi-tenant. `/register` wizard активен. `bot.catch()` защищает от краша.
- **Известная проблема:** DeepSeek API иногда не отвечает за 120 сек — проверить баланс/сеть на аккаунте DeepSeek.

---

## Что осталось / возможные следующие шаги

1. **Проверить DeepSeek API** — если таймауты продолжаются, проверить баланс на platform.deepseek.com и доступность API из текущей сети
2. **Протестировать `/register` wizard** — пройти полный флоу в Telegram с реальным 1C URL
3. **Протестировать GUID resolver** с реальным 1C сервером (`onec_resolve_guid` с известным GUID)
4. **`MCP 1C v 2/`** — папка существует, но не исследована. Возможно новая версия сервера?
5. **`docs/` и `guide/`** — документация DeepSeek-ориентированная, можно доработать под новые инструменты

---

## Ключевые пути

```
MCP metadata/
├── MCP 1C v1/               ← основной MCP сервер
│   ├── apps/mcp/src/
│   │   ├── server.ts        ← регистрация всех инструментов
│   │   └── tools/           ← 27 файлов *.tools.ts
│   ├── packages/services/src/
│   │   ├── GuidResolverService.ts   ← НОВЫЙ
│   │   └── index.ts
│   └── Entities/            ← 889 .md файлов с OData схемой
├── agent-deepseek/          ← DeepSeek CLI + Telegram bot
│   ├── agent.mjs
│   ├── bot.mjs
│   └── skills/              ← 20 локальных workflow скиллов
├── MCP 1C v 2/              ← не исследовано
└── HANDOFF.md               ← этот файл
```
