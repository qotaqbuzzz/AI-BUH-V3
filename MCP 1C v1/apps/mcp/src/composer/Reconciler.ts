import type { ConflictReport, ValueEntry } from "./ProvenanceRecord.js";

interface ReconciliationPair {
  id: string;
  subject: string;
  toolA: string;
  toolB: string;
  tolerancePct: number;
  hypothesis?: string;
}

// Pairs sourced from reconciliation-pairs.json — inlined to avoid runtime file I/O in the bundle
const DEFAULT_PAIRS: ReconciliationPair[] = [
  {
    id: "AR-debtors-vs-contractor-balance",
    subject: "дебиторская задолженность контрагента",
    toolA: "onec_debtors_report",
    toolB: "onec_contractor_balance",
    tolerancePct: 1,
    hypothesis: "Возможно, в одном источнике зачтены авансы выданные (1610), а в другом — нет.",
  },
  {
    id: "AP-creditors-vs-contractor-balance",
    subject: "кредиторская задолженность контрагента",
    toolA: "onec_creditors_report",
    toolB: "onec_contractor_balance",
    tolerancePct: 1,
    hypothesis: "Возможно, в одном источнике зачтены авансы полученные (3510), а в другом — нет.",
  },
  {
    id: "cash-register-vs-accounting",
    subject: "остаток денежных средств",
    toolA: "onec_get_cash_position",
    toolB: "onec_analyze_account:1010",
    tolerancePct: 0.1,
    hypothesis: "Расхождение указывает на непроведённые кассовые ордера.",
  },
  {
    id: "payroll-accrual-vs-accounting",
    subject: "начисленная зарплата",
    toolA: "onec_get_payroll_summary",
    toolB: "onec_analyze_account:3350",
    tolerancePct: 1,
    hypothesis: "Расхождение может быть вызвано незакрытыми документами начисления или ручными корректировками.",
  },
];

/**
 * Compares values from two tools that should agree on the same figure.
 * Returns a ConflictReport if the delta exceeds the declared tolerance.
 */
export class Reconciler {
  private readonly pairs: ReconciliationPair[];

  constructor(pairs: ReconciliationPair[] = DEFAULT_PAIRS) {
    this.pairs = pairs;
  }

  /**
   * Given values collected from multiple tool calls, find declared pairs
   * where both sources are present and compute delta.
   *
   * @param toolValues  Map of toolName → ValueEntry[]
   */
  reconcile(toolValues: Map<string, ValueEntry[]>): ConflictReport[] {
    const conflicts: ConflictReport[] = [];

    for (const pair of this.pairs) {
      const valuesA = toolValues.get(pair.toolA);
      const valuesB = toolValues.get(pair.toolB);
      if (!valuesA?.length || !valuesB?.length) continue;

      const totalA = valuesA.reduce((s, v) => s + v.amount, 0);
      const totalB = valuesB.reduce((s, v) => s + v.amount, 0);
      const larger = Math.max(Math.abs(totalA), Math.abs(totalB));
      if (larger === 0) continue;

      const deltaPct = (Math.abs(totalA - totalB) / larger) * 100;

      if (deltaPct > pair.tolerancePct || Math.abs(totalA - totalB) > 1) {
        const currency = valuesA[0]?.currency ?? "KZT";
        conflicts.push({
          subject: pair.subject,
          sources: [
            { tool: pair.toolA, amount: Math.round(totalA * 100) / 100, currency, asOf: valuesA[0]?.asOf ?? "" },
            { tool: pair.toolB, amount: Math.round(totalB * 100) / 100, currency, asOf: valuesB[0]?.asOf ?? "" },
          ],
          delta_pct: Math.round(deltaPct * 100) / 100,
          hypothesis: pair.hypothesis,
        });
      }
    }

    return conflicts;
  }
}
