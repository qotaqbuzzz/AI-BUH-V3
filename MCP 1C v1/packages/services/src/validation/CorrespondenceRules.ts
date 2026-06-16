/**
 * CorrespondenceRules — generic engine that flags unusual / erroneous
 * account correspondences for ANY account code.
 *
 * Rules are designed around the KZ standard chart of accounts (НК РК).
 * Each rule checks a corr-account entry and emits zero or more risks.
 *
 * Extending: add a new RuleDefinition to CORR_RULES. Each rule receives
 * the corr entry plus context (subject account code, all entries) and
 * returns CorrespondenceRisk[] (empty = no finding).
 */

export interface CorrEntry {
  corrAccount: string;        // e.g. "3131"
  corrAccountName: string;
  turnoverDr: number;         // amount where subject account is on Дт side
  turnoverCr: number;         // amount where subject account is on Кт side
  docTypes: string[];         // Recorder_Type values, prefix stripped
}

export interface CorrespondenceRisk {
  severity: "warn" | "error" | "critical";
  ruleId: string;
  corrAccount: string;
  corrAccountName: string;
  amount: number;             // absolute amount involved
  message: string;            // human-readable RU description
  suggestedFix: string;       // step-by-step 1C correction
}

type RuleDefinition = (
  entry: CorrEntry,
  accountCode: string,
  allEntries: CorrEntry[],
) => CorrespondenceRisk[];

// ── Helper ────────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

// Dominant net-effect of a corr entry on the subject account:
// positive → subject account's credit balance grows (or debit balance shrinks)
function netCreditEffect(e: CorrEntry): number { return e.turnoverCr - e.turnoverDr; }

// ── ALLOWED corr-account prefixes for EQUITY (5xxx) accounts ─────────────────
// 5xxx ↔ 5xxx : capital reform entries (реформация, перенос)
// 5xxx ↔ 6xxx : income close-out via ЗакрытиеМесяца
// 5xxx ↔ 7xxx : expense close-out via ЗакрытиеМесяца
// 5xxx ↔ 8xxx : production cost close-out
// 5xxx ↔ 3040 : dividends to participants (acceptable account, rules check doc type)
const EQUITY_ALLOWED_PREFIXES = ["5", "6", "7", "8"];
const EQUITY_ALLOWED_EXACT    = new Set(["3040"]);

// Document types that are NOT acceptable for dividend entries (3040)
const DIVIDEND_WRONG_DOCTYPES = new Set([
  "ОтражениеЗарплатыВРеглУчете",
  "НачислениеЗарплатыРаботникамОрганизаций",
]);

// ── RULE DEFINITIONS ──────────────────────────────────────────────────────────

const CORR_RULES: RuleDefinition[] = [

  // EQ-001a: Dividends booked via payroll document
  (entry, accountCode, _all) => {
    if (!accountCode.startsWith("5")) return [];
    if (entry.corrAccount !== "3040") return [];
    const wrongDocs = entry.docTypes.filter(d => DIVIDEND_WRONG_DOCTYPES.has(d));
    if (wrongDocs.length === 0) return [];
    const amt = Math.abs(entry.turnoverDr);
    return [{
      severity: "error",
      ruleId: "EQ-001a",
      corrAccount: entry.corrAccount,
      corrAccountName: entry.corrAccountName,
      amount: amt,
      message:
        `Дивиденды ${fmt(amt)} ₸ проведены через зарплатный документ` +
        ` (${wrongDocs.join(", ")}). Для распределения прибыли следует использовать` +
        ` «Операция (бухгалтерская)» или специализированный документ «Распределение прибыли».`,
      suggestedFix:
        `1C: Операции → Операции, введённые вручную → создайте «Операция (бухгалтерская)»` +
        ` Дт 5610 / Кт 3040 на сумму ${fmt(amt)} ₸.` +
        ` Затем сторнируйте неверные проводки в документе ${wrongDocs[0]}.`,
    }];
  },

  // EQ-001b: Dividends declared while current-year net result is a loss
  (entry, accountCode, allEntries) => {
    if (!accountCode.startsWith("5")) return [];
    if (entry.corrAccount !== "3040") return [];
    if (entry.turnoverDr <= 0) return [];
    // Look for 5710 (P&L summary) with net loss effect
    const plEntry = allEntries.find(e => e.corrAccount.startsWith("5710") || e.corrAccount === "5710");
    if (!plEntry) return [];
    const plNet = netCreditEffect(plEntry); // negative = loss
    if (plNet >= 0) return [];
    return [{
      severity: "critical",
      ruleId: "EQ-001b",
      corrAccount: entry.corrAccount,
      corrAccountName: entry.corrAccountName,
      amount: entry.turnoverDr,
      message:
        `🔴 Распределение дивидендов ${fmt(entry.turnoverDr)} ₸ при чистом убытке года` +
        ` ${fmt(Math.abs(plNet))} ₸ (счёт 5710 → ${accountCode}).` +
        ` В убыточный год распределение прибыли нарушает требования ГК РК и Налоговый кодекс.`,
      suggestedFix:
        `Проверьте решение учредителей/участников. Если дивиденды выплачены ошибочно —` +
        ` оформите возврат: Дт 3040 / Кт 5610. Проконсультируйтесь с аудитором` +
        ` относительно налоговых последствий (ИПН у источника выплаты).`,
    }];
  },

  // EQ-002: Tax accounts (31xx) directly to equity
  (entry, accountCode, _all) => {
    if (!accountCode.startsWith("5")) return [];
    if (!entry.corrAccount.startsWith("31")) return [];
    const amt = Math.abs(entry.turnoverDr - entry.turnoverCr);
    return [{
      severity: "error",
      ruleId: "EQ-002",
      corrAccount: entry.corrAccount,
      corrAccountName: entry.corrAccountName,
      amount: amt,
      message:
        `Налоговый счёт ${entry.corrAccount} («${entry.corrAccountName}») напрямую` +
        ` корреспондирует с капиталом ${accountCode} на сумму ${fmt(amt)} ₸.` +
        ` Налоги должны проходить через счета доходов/расходов (60xx/70xx),` +
        ` а не списываться напрямую с нераспределённой прибыли.`,
      suggestedFix:
        `Проверьте ЗакрытиеМесяца за период: возможно, настройка статей затрат` +
        ` ссылается на счёт капитала вместо расходного. Исправьте в 1С:` +
        ` Операции → Закрытие месяца → перепровести; убедитесь, что счёт ${entry.corrAccount}` +
        ` закрывается через 7xxx/6xxx, а не напрямую на ${accountCode}.`,
    }];
  },

  // EQ-003: Payroll/contribution accounts (32xx) directly to equity
  (entry, accountCode, _all) => {
    if (!accountCode.startsWith("5")) return [];
    if (!entry.corrAccount.startsWith("32")) return [];
    const amt = Math.abs(entry.turnoverDr - entry.turnoverCr);
    return [{
      severity: "warn",
      ruleId: "EQ-003",
      corrAccount: entry.corrAccount,
      corrAccountName: entry.corrAccountName,
      amount: amt,
      message:
        `Зарплатный/страховой счёт ${entry.corrAccount} («${entry.corrAccountName}»)` +
        ` списывается напрямую с капитала ${accountCode}: ${fmt(amt)} ₸.` +
        ` Обычно взносы начисляются через расходные счета (7310, 8110 и т.п.),` +
        ` а не с нераспределённой прибыли.`,
      suggestedFix:
        `Проверьте проводки с Recorder_Type ${entry.docTypes.join(", ")}.` +
        ` Убедитесь, что расходы по зарплате/взносам начислены в Дт 7310 (или 8110)` +
        ` и только затем включены в результат через ЗакрытиеМесяца.`,
    }];
  },

  // EQ-004: Any other non-standard corr with equity (catch-all for 5xxx subject)
  (entry, accountCode, _all) => {
    if (!accountCode.startsWith("5")) return [];
    // Skip allowed prefixes and explicitly allowed accounts
    if (EQUITY_ALLOWED_PREFIXES.some(p => entry.corrAccount.startsWith(p))) return [];
    if (EQUITY_ALLOWED_EXACT.has(entry.corrAccount)) return [];
    // Skip accounts already caught by EQ-002 / EQ-003
    if (entry.corrAccount.startsWith("31") || entry.corrAccount.startsWith("32")) return [];
    const amt = Math.abs(entry.turnoverDr - entry.turnoverCr);
    return [{
      severity: "warn",
      ruleId: "EQ-004",
      corrAccount: entry.corrAccount,
      corrAccountName: entry.corrAccountName,
      amount: amt,
      message:
        `Нетипичная корреспонденция счёт ${accountCode} ↔ ${entry.corrAccount}` +
        ` («${entry.corrAccountName}»): ${fmt(amt)} ₸.` +
        ` Ожидаются только счета 5xxx/6xxx/7xxx/8xxx и 3040 (дивиденды).`,
      suggestedFix:
        `Откройте карточку счёта ${accountCode} в 1С и проверьте проводки с` +
        ` корр. счётом ${entry.corrAccount}. Уточните экономический смысл операции;` +
        ` при необходимости — сторнируйте и перепровести через правильные счета.`,
    }];
  },

  // ── Non-equity rules (any subject account) ────────────────────────────────

  // GEN-001: Equity account (5xxx) as corr to an asset/liability — potential mispost
  (entry, accountCode, _all) => {
    if (accountCode.startsWith("5")) return [];          // handled by EQ-* above
    if (!entry.corrAccount.startsWith("5")) return [];
    // Exceptions: income/expense close-outs are normal on P&L accounts
    if (accountCode.startsWith("6") || accountCode.startsWith("7") || accountCode.startsWith("8")) return [];
    const amt = Math.abs(entry.turnoverDr - entry.turnoverCr);
    return [{
      severity: "warn",
      ruleId: "GEN-001",
      corrAccount: entry.corrAccount,
      corrAccountName: entry.corrAccountName,
      amount: amt,
      message:
        `Счёт капитала ${entry.corrAccount} («${entry.corrAccountName}») корреспондирует` +
        ` со счётом ${accountCode} напрямую: ${fmt(amt)} ₸.` +
        ` Для большинства операций изменение капитала должно проходить через` +
        ` счета доходов/расходов.`,
      suggestedFix:
        `Проверьте проводки Дт/Кт между счётом ${accountCode} и ${entry.corrAccount}.` +
        ` Убедитесь, что это не ошибочная запись; при сомнении — проконсультируйтесь` +
        ` с бухгалтером и при необходимости сторнируйте.`,
    }];
  },

];

// ── Public API ────────────────────────────────────────────────────────────────

export function detectCorrespondenceRisks(
  accountCode: string,
  byCorrAccount: CorrEntry[],
): CorrespondenceRisk[] {
  const risks: CorrespondenceRisk[] = [];
  for (const entry of byCorrAccount) {
    for (const rule of CORR_RULES) {
      risks.push(...rule(entry, accountCode, byCorrAccount));
    }
  }
  return risks;
}
