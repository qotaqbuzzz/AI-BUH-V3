import type { ReportsService, CatalogService } from "@aibos/services";
import type {
  ProvenanceRecord,
  ValueEntry,
  ComposedAnswer,
  AnswerContext,
} from "./ProvenanceRecord.js";
import { Reconciler } from "./Reconciler.js";

type Intent = "receivables" | "payables" | "cash" | "unknown";

function detectIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (/дебитор|receivable|owe us|owes us|debtors|задолженн|должн.{0,8}нам/.test(s)) return "receivables";
  if (/кредитор|payable|мы должны|owe them|creditor|payables/.test(s)) return "payables";
  if (/касс|cash|деньг|наличн/.test(s)) return "cash";
  return "receivables"; // safe fallback: receivables is the most common canonical query
}

function extractContractorHint(question: string, context?: AnswerContext): string | undefined {
  if (context?.subject?.type === "contractor") return context.subject.name;
  const clean = question.replace(/[?!.,;]+$/, "").trim();
  // "контрагент Агросиндикат", "company Foo Ltd"
  const m1 = clean.match(/(?:компания|контрагент|поставщик|клиент|contractor|company|supplier)\s+([А-ЯA-ZЁ][а-яА-ЯёЁa-zA-Z0-9\s\-«»"']{1,40})/i);
  if (m1) return m1[1].trim();
  // "Сколько X нам должен" or "Сколько нам должен X" or "X нам должен"
  const m2 = clean.match(/^(?:сколько\s+)?(?:[а-яёa-z]+\s+)*?([А-ЯA-ZЁ][а-яА-ЯёЁa-zA-Z0-9\s\-]{1,40?})\s+(?:нам|нас)\s+долж/i);
  if (m2) return m2[1].trim();
  // "нам должен/должна/должны X" — name comes after the verb
  const m3 = clean.match(/(?:нам|нас)\s+(?:долж\S+)\s+([А-ЯA-ZЁ][а-яА-ЯёЁa-zA-Z0-9\s\-]{1,40})/i);
  if (m3) return m3[1].trim();
  // "how much does X owe us"
  const m4 = clean.match(/(?:does|do)\s+([A-ZА-ЯЁ][a-zA-Zа-яёА-ЯЁ0-9\s\-]{1,40})\s+owe/i);
  if (m4) return m4[1].trim();
  return undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, durationMs: Date.now() - start };
}

export class AnswerComposer {
  private readonly reconciler = new Reconciler();

  constructor(
    private readonly reports: ReportsService,
    private readonly catalog: CatalogService,
  ) {}

  async compose(
    question: string,
    asOfDate: string,
    orgGuid: string,
    context?: AnswerContext,
  ): Promise<ComposedAnswer> {
    const intent = detectIntent(question);
    const contractorHint = extractContractorHint(question, context);
    const trail: ProvenanceRecord[] = [];
    const values: ValueEntry[] = [];
    const toolValues = new Map<string, ValueEntry[]>();

    if (intent === "receivables") {
      const { result, durationMs } = await timed(() =>
        this.reports.getAllDebtors(orgGuid, asOfDate),
      );

      trail.push({
        toolName: "onec_debtors_report",
        odataUrl: "AccumulationRegister_ВзаиморасчетыСКонтрагентами",
        asOf: nowIso(),
        orgGuid,
        rowCount: result.rows.length,
        durationMs,
        cacheHit: false,
      });

      let rows = result.rows;
      let subject = "Все дебиторы";

      if (contractorHint) {
        const hint = contractorHint.toLowerCase();
        const matched = rows.filter((r) => r.contractorName.toLowerCase().includes(hint));
        if (matched.length > 0) { rows = matched; subject = contractorHint; }
      } else if (context?.subject?.type === "contractor" && context.subject.guid) {
        rows = rows.filter((r) => r.contractorGuid === context.subject!.guid);
        subject = context.subject.name;
      }

      const total = Math.round(rows.reduce((s, r) => s + r.balanceDr - r.balanceCr, 0) * 100) / 100;

      const entry: ValueEntry = { label: subject, amount: total, currency: "KZT", asOf: asOfDate, source: "onec_debtors_report" };
      values.push(entry);
      toolValues.set("onec_debtors_report", [entry]);

      const topRows = rows
        .slice(0, 5)
        .map((r) => `• ${r.contractorName}: ${(r.balanceDr - r.balanceCr).toLocaleString("ru-KZ")} KZT`)
        .join("\n");

      const answerParts = [
        `Дебиторская задолженность (${subject}) на ${asOfDate}:`,
        `Итого: ${total.toLocaleString("ru-KZ")} KZT`,
      ];
      if (!contractorHint && rows.length > 0) {
        answerParts.push(`\nТоп-${Math.min(rows.length, 5)}:\n${topRows}`);
      }

      return {
        answer: answerParts.join("\n"),
        values,
        trail,
        conflicts: this.reconciler.reconcile(toolValues),
        followups: [
          "Показать авансы выданные?",
          "Уточнить задолженность по конкретному контрагенту?",
          "Сравнить с началом месяца?",
        ],
      };
    }

    if (intent === "payables") {
      const { result, durationMs } = await timed(() =>
        this.reports.getAllCreditors(orgGuid, asOfDate),
      );

      trail.push({
        toolName: "onec_creditors_report",
        odataUrl: "AccumulationRegister_ВзаиморасчетыСКонтрагентами",
        asOf: nowIso(),
        orgGuid,
        rowCount: result.rows.length,
        durationMs,
        cacheHit: false,
      });

      let rows = result.rows;
      let subject = "Все кредиторы";

      if (contractorHint) {
        const hint = contractorHint.toLowerCase();
        const matched = rows.filter((r) => r.contractorName.toLowerCase().includes(hint));
        if (matched.length > 0) { rows = matched; subject = contractorHint; }
      } else if (context?.subject?.type === "contractor" && context.subject.guid) {
        rows = rows.filter((r) => r.contractorGuid === context.subject!.guid);
        subject = context.subject.name;
      }

      const total = Math.round(rows.reduce((s, r) => s + r.balanceCr - r.balanceDr, 0) * 100) / 100;

      const entry: ValueEntry = { label: subject, amount: total, currency: "KZT", asOf: asOfDate, source: "onec_creditors_report" };
      values.push(entry);
      toolValues.set("onec_creditors_report", [entry]);

      return {
        answer: [
          `Кредиторская задолженность (${subject}) на ${asOfDate}:`,
          `Итого: ${total.toLocaleString("ru-KZ")} KZT`,
        ].join("\n"),
        values,
        trail,
        conflicts: this.reconciler.reconcile(toolValues),
        followups: [
          "Показать авансы полученные?",
          "Расшифровать по контрагентам?",
        ],
      };
    }

    return {
      answer: "Вопрос не распознан как канонический паттерн. Попробуйте уточнить: дебиторы, кредиторы или cash.",
      values: [],
      trail: [],
      conflicts: [],
      followups: ["Сколько дебиторской задолженности?", "Сколько кредиторской задолженности?"],
    };
  }
}
