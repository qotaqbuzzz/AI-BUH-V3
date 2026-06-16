# Session Handoff — 2026-06-05

## Project: onec-kz MCP Server + DeepSeek Agent + Telegram Bot

Root: `C:\Users\PC\Desktop\DevOPS\MCP metadata\`

---

## What Was Done This Session

### 1. Детектор ошибок учёта — `onec_analyze_account` + `CorrespondenceRules`

Выявлены реальные бухгалтерские ошибки в ТОО «Московский» за 2025:
- Дивиденды 37 410 000 ₸ проведены через зарплатный документ `ОтражениеЗарплатыВРеглУчете` (должно быть «Операция бухгалтерская»)
- НДС 3131 → 5610 напрямую в капитал 25 642 639,95 ₸ (должно через доходы/расходы)
- Убыточный год (5710 → −104 810 251,43 ₸) при распределении дивидендов

**Корневая причина бага бота:** `AccountAnalysisService` использовал русские имена полей (`Период`, `СчетДт_Key`, `СчетКт_Key`), которых нет в `AccountingRegister_Типовой_RecordType`. Реальные поля — `Period`, `AccountDr_Key`, `AccountCr_Key`. `byCorrAccount` всегда возвращался пустым.

**Новый файл:** `MCP 1C v1/packages/services/src/validation/CorrespondenceRules.ts`
- Чистая функция `detectCorrespondenceRisks(accountCode, byCorrAccount): CorrespondenceRisk[]`
- 6 обобщённых правил для ЛЮБОГО счёта:
  - `EQ-001a` — дивиденды через зарплатный документ → error
  - `EQ-001b` — дивиденды при убытке года → critical
  - `EQ-002` — налоговый счёт 31xx напрямую в капитал → error
  - `EQ-003` — зарплатный/взносы 32xx напрямую в капитал → warn
  - `EQ-004` — нетипичная корреспонденция с 5xxx → warn
  - `GEN-001` — капитал 5xxx ↔ активы/обязательства → warn

**Изменён:** `AccountAnalysisService.ts`
- Фикс полей OData (`AccountDr_Key`, `AccountCr_Key`, `Period`, `Recorder_Type`)
- Добавлено поле `docTypes: string[]` в `CorrAccountEntry`
- Добавлено поле `risks: CorrespondenceRisk[]` в результат
- Opening/closing balance переключены на `RegisterBalance` (BalanceAndTurnovers давал 0 для счетов 5xxx)

**Изменён:** `apps/mcp/src/tools/account-analysis.tools.ts`
- Описание инструмента расширено: обязательство LLM показывать каждый риск с severity и suggestedFix

**Изменён:** `guide/11-deepseek-system-prompt.md`
- Правило 9a: обязательный вызов `onec_analyze_account` перед любым выводом по счёту
- STRICT RULES блок: никогда не добавлять объяснения механизмов 1С из памяти; если `risks[]` непустой — показать каждый элемент с 🔴/🟠/🟡 и `suggestedFix`

---

### 2. Production-оптимизация: надёжность данных и устранение галлюцинаций

#### 2.1 Server-side инъекция organizationGuid (убивает баг #1)

**Проблема:** LLM сам передавал `organizationGuid` и переиспользовал протухший GUID из истории → все обороты нули → «данных нет». Реальный GUID: `41c5d9a6-6d87-11e9-9f9f-80c5f26788b0`.

**Новый файл:** `MCP 1C v1/apps/mcp/src/org-context.ts`
```typescript
buildOrgContext(catalog, configuredDefault?)  → OrgContext
// OrgContext.resolveOrgGuid(provided?):
//   валидный GUID → как есть
//   неизвестный/галлюцинация/zero → defaultGuid + corrected:true
//   пусто → defaultGuid
//   мульти-орг без конфига → throw со списком орг
```

**Изменён:** `MCP 1C v1/apps/mcp/src/config.ts`
- Новый параметр `ONEC_DEFAULT_ORG_GUID` → `config.defaultOrgGuid`
- Для баз с одной организацией — определяется автоматически

**Изменён:** `MCP 1C v1/apps/mcp/src/tools/utils.ts`
- `setOrgContext(ctx)` / `resolveOrg(provided?)` синглтон
- `ok(data, meta?)` расширен: поддержка `_meta: { orgGuid, orgGuidCorrected, rowCount, ... }`

**Изменён:** `MCP 1C v1/apps/mcp/src/server.ts`
- `await buildOrgContext(catalogService, config.defaultOrgGuid)` + `setOrgContext()` строго до `registerCatalogTools`

**Применён `resolveOrg()` в 25 хендлерах** (5 файлов):
- `account-analysis.tools.ts` — `onec_analyze_account`
- `register.tools.ts` — 7 инструментов (balance, turnovers, breakdown, card, contractor settlements, inventory)
- `reports.tools.ts` — 11 инструментов (osv, debtors, creditors, payments, purchases, sales, cash flow, fixed assets, payroll, anomalies, detailed reports)
- `analytics.tools.ts` — monthly trend + financial summary (снят `required` с GUID)
- `validation-drilldown.tools.ts` — drill_account_sign

**Изменён:** `agent-deepseek/mcp-client.mjs`
- `ONEC_DEFAULT_ORG_GUID` добавлен в `PARENT_PASSTHROUGH` (дочерний процесс теперь видит переменную)

#### 2.2 Провайдер + guard на тихие баги данных

**Изменён:** `AccountAnalysisService.ts`
- Новое поле `dataWarnings: string[]` в `AccountAnalysisResult`
- Guard: если обороты ≠ 0 AND `byCorrAccount` пуст → явное предупреждение (сигнатура field-name бага)

**Изменён:** `guide/11-deepseek-system-prompt.md`
- Если `dataWarnings[]` непустой → показать ⚠️ перед любыми числами

#### 2.3 Консолидация инструментов — TOOL_DENYLIST

**Изменён:** `agent-deepseek/mcp-client.mjs`
```javascript
static #TOOL_DENYLIST = new Set([
  "onec_get_accounting_turnovers",   // 100% дубликат analyze_account summary
  // Phase 2 (после добавления gross Дт/Кт + qty):
  // "onec_get_account_balance",
  // "onec_get_account_breakdown",
  // "onec_get_account_card",
]);
```
- `openaiTools` геттер фильтрует дублирующие инструменты ДО отправки LLM
- `toolCount` — количество видимых LLM инструментов; `toolCountRaw` — все зарегистрированные
- `onec_drill_account_sign` **оставлен видимым** — это валидационный вердикт (документы-нарушители по знаку), а не дубликат

**Изменён:** `guide/11-deepseek-system-prompt.md`
- Rule 9a: явный запрет звать `account_card / breakdown / balance / turnovers` для анализа счёта
- Обновлена Call discipline: organizationGuid инъектируется сервером, не нужно вызывать `onec_get_organizations` перед каждым запросом

#### 2.4 Golden-value тесты (регрессионный замок)

**Новый файл:** `MCP 1C v1/packages/services/src/AccountAnalysisService.test.ts`

**Новый скрипт:** `"test": "tsx --test packages/services/src/**/*.test.ts"` в root `package.json`

```
✔ AccountAnalysisService
  ✔ account 5610 — golden etalon (ТОО Московский, 2025)   [10 тестов]
  ✔ account 1010 — no false-positive risks                  [2 теста]
  ✔ dataWarnings guard — field-name regression              [1 тест]
ℹ tests 13 | pass 13 | fail 0
```

Тесты детерминированы: fake `OneCClient` (стабы 3 методов — `getCollection`, `getRegisterBalance`, `getBalanceAndTurnovers`), без сети, без `Date.now()`. Любая регрессия имён полей → красный тест.

---

## Эталонные данные (проверены прямыми OData-запросами)

| Показатель | Значение |
|-----------|---------|
| Tenant GUID реестра | `259740dc-943f-476e-a711-60539f60e68d` |
| Organization Ref_Key | `41c5d9a6-6d87-11e9-9f9f-80c5f26788b0` |
| Организация | ТОО «Московский» (ИИН 950640000038) |
| Счёт 5610, Дт оборот 2025 | 37 416 649,57 ₸ |
| Счёт 5610, Кт 3131 (НДС) | +25 642 639,95 ₸ |
| Счёт 5610, Кт 5710 (убыток) | −104 810 251,43 ₸ |
| Opening balance 5610 (01.01.2025) | −1 971 903 073,21 ₸ (Кт) |

---

## Состояние проекта

### MCP 1C v1 (onec-kz MCP server)
- **Инструменты:** ~130 (+ GUID resolver + analyze_account + corr-rules)
- **Сборка:** `cd "MCP 1C v1" && npm run build` → `dist/server.bundle.js` (648 кб, ~57 мс)
- **Тесты:** `npm test` → 13/13 зелёных
- **Новые env-переменные:** `ONEC_DEFAULT_ORG_GUID` (опционально; одна орг — автоопределяется)

### DeepSeek Agent / Telegram Bot
- **Расположение:** `agent-deepseek/`
- **Старт:** `node bot.mjs` (stdout → `bot.log`, stderr → `bot.err`)
- **Статус:** ✅ Работает. Bot PID обновился, все изменения применены.
- **Конфиг:** `agent-deepseek/.env` — `TELEGRAM_BOT_TOKEN`, `DEEPSEEK_API_KEY`, `APP_ENC_KEY`, `MCP_SERVER_DIR`

---

## Что НЕ сделано (следующие итерации)

### Phase 2 — раскомментировать в TOOL_DENYLIST после паритета
Перед сокрытием `onec_get_account_balance` / `onec_get_account_breakdown` / `onec_get_account_card` нужно добавить в `AccountAnalysisService.analyzeAccount`:
1. `summary.closingBalanceDr`, `summary.closingBalanceCr`, `summary.closingQuantity` — gross Дт/Кт сальдо + количество
2. `bySubconto[].qty` — `КоличествоBalance` (критично для товарных счетов 1310/1320)
3. Опциональный вид построчных проводок `{period, recorderKey, lineNum, amountDr, amountCr, corrAccountCode}` — паритет с account_card

### Остальной tool surface (~80 хендлеров)
`resolveOrg()` применён только к 25 горячим хендлерам. Аналогичный однострочный своп нужен в:
`auditor.tools.ts` (2), `production.tools.ts` (6), `costing.tools.ts`, `document.tools.ts`, `stock.tools.ts`, `scan.tools.ts`, `anomaly-ml.tools.ts`, `duediligence.tools.ts`, `fullreport.tools.ts`, `validation-integrity.tools.ts`, `validation-tax.tools.ts`, `validation-period-close.tools.ts` (2 — снять `required`), `validation-document.tools.ts`, `validation-reconciliation.tools.ts`.

### Defense-in-depth в parent (необязательно после server-side fix)
`mcp-client.mjs` `callTool` — перехват orgGuid в args на клиентской стороне перед отправкой. Дополнительный слой, если MCP-сервер не может сам резолвить (напр. при многоorg без конфига).

### Вне объёма (следующая итерация)
- Eval-harness: набор вопрос → ожидаемые инструменты/числа
- Grounding-guard: сверка чисел в ответе бота с выводом инструментов
- Слимминг системного промпта (сейчас ~130 строк)
- Реальный подсчёт токенов в `recordUsage` вместо `length` строки
- Кэш повторяющихся запросов (OSV за один период запрашивается несколько раз)
- Балансовый нюанс: `Balance()` virtual table показывает 2 066 / 1 810 млн, скриншот 1С — 1 972 / 1 855 млн. Оборотные показатели точные; источник сальдо — отдельная задача.

---

## Ключевые пути

```
MCP metadata/
├── MCP 1C v1/
│   ├── apps/mcp/src/
│   │   ├── org-context.ts              ← НОВЫЙ: server-side org resolution
│   │   ├── config.ts                   ← +ONEC_DEFAULT_ORG_GUID
│   │   ├── server.ts                   ← buildOrgContext + setOrgContext до tools
│   │   └── tools/
│   │       ├── utils.ts                ← setOrgContext/resolveOrg singleton + ok(meta)
│   │       ├── account-analysis.tools.ts
│   │       ├── register.tools.ts       ← все 7 хендлеров с resolveOrg
│   │       ├── reports.tools.ts        ← все 11 хендлеров с resolveOrg
│   │       ├── analytics.tools.ts      ← resolveOrg + GUID optional
│   │       └── validation-drilldown.tools.ts
│   ├── packages/services/src/
│   │   ├── AccountAnalysisService.ts   ← field-name фикс + risks + dataWarnings
│   │   ├── AccountAnalysisService.test.ts  ← НОВЫЙ: 13 golden тестов
│   │   └── validation/
│   │       └── CorrespondenceRules.ts  ← НОВЫЙ: 6 правил EQ-001..GEN-001
│   └── package.json                    ← +"test": "tsx --test ..."
├── agent-deepseek/
│   ├── bot.mjs
│   └── mcp-client.mjs                  ← TOOL_DENYLIST + ONEC_DEFAULT_ORG_GUID passthrough
├── guide/
│   └── 11-deepseek-system-prompt.md    ← org injection + dataWarnings + rule 9a v2
├── HANDOFF.md                           ← предыдущая сессия (2026-06-04)
└── HANDOFF2.md                          ← этот файл (2026-06-05)
```

---

## Быстрый старт для следующей сессии

```bash
# Пересборка после любых изменений в MCP 1C v1:
cd "MCP 1C v1" && npm run build

# Тесты:
npm test   # 13 golden tests, должны быть все зелёные

# Перезапуск бота:
node bot.mjs   # из папки agent-deepseek/
               # stdout → bot.log, stderr → bot.err

# Проверка org injection:
# Вызвать onec_analyze_account без organizationGuid →
# _meta.orgGuid должен быть 41c5d9a6-..., обороты ненулевые

# Проверить логи:
tail -f agent-deepseek/bot.log
tail -f agent-deepseek/bot.err
```
