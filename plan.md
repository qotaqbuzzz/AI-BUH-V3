# План: воркфлоу поиска ошибок в учёте (на примере счёта 5610)

## Context

Пользователь хочет формализовать аудиторский воркфлоу «поиск ошибок в учёте»: пройти по
ОСВ → найти счета с нетипичным знаком сальдо / сторно / нарушением арифметики → открыть
карточку и анализ счёта → проверить каждую проводку по GUID (должна ли она вообще быть на
этом счету и корректна ли корреспонденция) → посмотреть источник (документ) и комментарии.

Что выяснено при исследовании:

1. **Шаги уже частично покрыты тулзами**, но с пробелами:
   - `IntegrityValidator.validateAccountSigns` (INT-002a/b/c/d) и `validateBalanceArithmetic`
     (INT-003) делают шаг 1, но **классифицируют счета по regex** (`/^[12]/`=актив,
     `/^[34]/`=пассив). В плане счетов есть **реальное поле `Type`** со значениями
     `Active` (162), `Passive` (179), `ActivePassive` (19). Regex неверно судит 19
     активно-пассивных счетов и любую нестандартную нумерацию.
   - `detectCorrespondenceRisks` (CorrespondenceRules.ts) имеет правила только для капитала
     (EQ-*) + один GEN-001. Для шага 3 нужна расширенная матрица по всем разделам.

2. **Ключевая находка на 5610** (ядро воркфлоу): `onec_get_account_card` и summary
   `onec_analyze_account` возвращают **пусто/0**, а ОСВ `BalanceAndTurnovers` показывает
   `turnoverDr = 37 416 649`, `turnoverCr = −79 167 611`. **Отрицательный кредитовый оборот
   и есть сигнал красного сторно**, и виден он только через ОСВ (движения капитала идут через
   регламентные операции закрытия месяца, в карточке/RecordType не появляются). Вывод:
   **воркфлоу опирается на ОСВ как на источник истины, а не на карточку.**

Решения пользователя: **(1) скилл + новый MCP-тул**, **(2) расширить матрицу корреспонденций**.

Желаемый итог: новый оркестрирующий тул `onec_error_hunt` для шага 1 по всем счетам
(Type-aware), расширенная матрица корреспонденций для шага 3, и skill-документ,
связывающий все 4 шага с воркед-примером на 5610.

## Изменения

### 1. `getOSV` отдаёт реальный тип счёта
**Файл:** `MCP 1C v1/packages/services/src/ReportsService.ts`
- В `OSVRow` (строки 4–13) добавить `accountType?: "Active" | "Passive" | "ActivePassive"`.
- В `getOSV` (строка 58): добавить `Type` в `select` запроса `ChartOfAccounts_Типовой`;
  сохранить `Type` в `accountMap`; проставить `accountType` в каждую строку результата
  (строки 95–104). Тип запросом подтверждён: поле называется `Type`.

### 2. Новый оркестрирующий метод `huntErrors()` (шаг 1 по всем счетам)
**Файл:** `MCP 1C v1/packages/services/src/validation/IntegrityValidator.ts`
- Новый метод `async huntErrors(dateFrom, dateTo, organizationGuid?)` возвращает
  `ValidationReport` (использовать существующие `emptyReport`/`add`/`finalize` из `./types.js`).
- По каждой строке ОСВ классифицировать по **реальному `accountType`** (а не regex):
  - `Active` + закрытие Кт (netClose < −1) и не в `CONTRA_ASSETS` → кандидат «сторно-актив».
  - `Passive` + закрытие Дт (netClose > 1) и не в `PREPAID_LIABILITIES` → кандидат «сторно-пассив».
  - `ActivePassive` → правило знака пропустить (оба сальдо легитимны), но арифметику проверить.
  - `turnoverDr < −1` или `turnoverCr < −1` → флаг красного сторно (**ловит 5610**).
  - `openingNet + turnoverNet ≠ closingNet` (|diff|>1) → нарушение арифметики (как INT-003).
- Каждая находка несёт `affected.accountCode`, сумму, и `suggestedFix`/`nextTool`-подсказку
  на шаг 2: `onec_analyze_account(accountCode, dateFrom, dateTo)`.
- Находки отранжировать по |сумме| убыв. (приоритет drill-down).

### 3. `validateAccountSigns` — перевести на реальный тип
**Файл:** тот же `IntegrityValidator.ts` (строки 147–179)
- Заменить `isAsset = /^[12]/` и `isLiability = /^[34]/` на проверку `row.accountType`.
  Сохранить исключения `CONTRA_ASSETS` / `PREPAID_LIABILITIES`. `ActivePassive` — пропуск
  правила знака. Логику сторно (INT-002c/d) оставить как есть.

### 4. Расширить матрицу корреспонденций (шаг 3)
**Файл:** `MCP 1C v1/packages/services/src/validation/CorrespondenceRules.ts`
- Расширить массив `CORR_RULES` правилами «подозрительная пара» по разделам плана счетов
  (deny-style, чтобы не плодить ложные срабатывания), по образцу существующих EQ-*:
  - доход `6xxx` ↔ обязательство `3xxx` напрямую (выручка минуя расчёты/деньги);
  - расход `7xxx`/`8xxx` ↔ капитал `5xxx` напрямую (минуя финрезультат);
  - актив `1xxx` ↔ доход `6xxx` напрямую;
  - деньги `1010/1030` ↔ доход/расход напрямую (минуя расчёты);
  - НДС `31xx` в нетипичных парах.
- Для крупных разделов добавить catch-all (как `EQ-004`): «нетипичная корреспонденция
  раздел X ↔ раздел Y» с severity `warn`, чтобы шаг 3 автоматически отмечал спорные пары
  **для любого счёта, а не только 5xxx**.
- Движок `detectCorrespondenceRisks` и тип `CorrespondenceRisk` не меняются → новые риски
  **автоматически** появляются в `risks[]` у `onec_analyze_account` для всех счетов.

### 5. Регистрация тула `onec_error_hunt`
**Файл:** `MCP 1C v1/apps/mcp/src/tools/validation-integrity.tools.ts`
- Зарегистрировать `onec_error_hunt(dateFrom, dateTo, organizationGuid?)` →
  `validator.huntErrors(...)`. `organizationGuid` опциональный (резолвится сервером через
  `resolveOrg`, как в остальных тулзах). Описание: «Шаг 1 поиска ошибок: прогон по всей ОСВ,
  Type-aware — сторно, нетипичный знак сальдо, нарушение арифметики; возвращает
  отранжированных кандидатов на drill-down через onec_analyze_account».

### 6. Новый skill-документ + индекс + роутинг
- **Новый:** `guide/skills/22-error-hunt.md` — формат как у `06-anomaly-audit.md`
  (Trigger / Role / inputs / пошаговый Workflow / KZ-интерпретация / Output). 4 шага:
  1) `onec_error_hunt` → кандидаты; 2) по каждому `onec_analyze_account` (+ при наличии
  карточки `onec_get_account_card`); 3) разбор `risks[]` и `byCorrAccount` — «должна ли
  проводка быть здесь и корреспондируется ли»; 4) источник (docTypes/Recorder) + комментарии.
  Включить **воркед-пример на 5610**: карточка пуста, но ОСВ даёт отрицательный Кт-оборот →
  это регламентное закрытие, источник истины — ОСВ.
- **Обновить:** `guide/skills/00-skill-index.md` (добавить запись о новом скилле).
- **Обновить:** `guide/11-deepseek-system-prompt.md` — правило роутинга «найти ошибки» /
  «проверить учёт» / «аудит проводок» → skill 22 → `onec_error_hunt` → drill.

## Verification (end-to-end)

1. **Сборка:** пересобрать бандл (см. как собран `MCP 1C v1/dist/server.bundle.js`,
   обычно `npm run build` в `MCP 1C v1`). Бандл должен содержать `huntErrors` и `onec_error_hunt`.
2. **Прямой OData (без LLM):** подтвердить, что 5610 за 2025 даёт
   `turnoverCr ≈ −79 167 611` (отрицательный) — это вход для красного-сторно правила.
   (Проверено вручную ранее тем же запросом.)
3. **Тул onec_error_hunt:** прогнать за `2025-01-01..2025-12-31` — в находках должен быть
   5610 с флагом отрицательного кредитового оборота; активно-пассивные счета **не** должны
   ложно срабатывать по знаку.
4. **Type-aware регресс:** `onec_validate_account_signs` за тот же период не должен помечать
   19 ActivePassive-счетов как нарушение знака.
5. **Матрица:** `onec_analyze_account("5610", ...)` — в `risks[]` присутствуют корректные
   EQ-*/catch-all записи; для обычного счёта (напр. 1010) нет шквала ложных warn.
6. **Перезапуск бота** и проверка в Telegram: запрос «найди ошибки в учёте за 2025» должен
   запустить скилл 22, вызвать `onec_error_hunt`, затем drill по верхним кандидатам.
   (Тул `onec_get_accounting_turnovers` остаётся в denylist клиента — не мешает.)

## Файлы (сводка)
- `MCP 1C v1/packages/services/src/ReportsService.ts` — Type в OSVRow/getOSV
- `MCP 1C v1/packages/services/src/validation/IntegrityValidator.ts` — `huntErrors()` + Type-aware signs
- `MCP 1C v1/packages/services/src/validation/CorrespondenceRules.ts` — расширенная матрица
- `MCP 1C v1/apps/mcp/src/tools/validation-integrity.tools.ts` — тул `onec_error_hunt`
- `guide/skills/22-error-hunt.md` (новый), `guide/skills/00-skill-index.md`, `guide/11-deepseek-system-prompt.md`
