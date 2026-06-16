import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import type { AuditorService } from "../AuditorService.js";
import { add, emptyReport, finalize, type ValidationReport } from "./types.js";

const UNPOSTED_DOC_TYPES = [
  "РеализацияТоваровУслуг",
  "ПоступлениеТоваровУслуг",
  "ПлатежноеПоручениеИсходящее",
  "ПлатежноеПоручениеВходящее",
  "НачислениеЗарплатыРаботникамОрганизаций",
];

const WIP_TOLERANCE = 100_000; // ₸ — допустимый остаток 8112 после уборки

export class PeriodCloseValidator {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
    private readonly auditor: AuditorService,
  ) {}

  async validatePeriodCloseReadiness(year: number, month: number, organizationGuid: string): Promise<ValidationReport> {
    const start = Date.now();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateFrom = `${year}-${pad(month)}-01`;
    const lastDay = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
    const report = emptyReport("PeriodCloseValidator.readiness", { from: dateFrom, to: lastDay }, organizationGuid);

    const closeStatus = await this.auditor.getMonthCloseStatus(organizationGuid, year, month);
    if (closeStatus.found && closeStatus.posted) {
      add(report, {
        ruleId: "PC-001",
        ruleName: "ЗакрытиеМесяца already posted",
        severity: "info",
        category: "period-close",
        description: `Период ${year}-${pad(month)} уже закрыт (${closeStatus.date?.slice(0, 10)}).`,
        affected: { documentGuid: closeStatus.guid ?? undefined, documentDate: closeStatus.date ?? undefined },
        suggestedFix: "Период закрыт. Изменения требуют распроведения.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    }

    // Unposted documents per type
    const unpostedSummary: Record<string, number> = {};
    await Promise.all(UNPOSTED_DOC_TYPES.map(async (t) => {
      const rows = await this.auditor.getUnpostedDocuments(t, dateFrom, lastDay, organizationGuid).catch(() => []);
      unpostedSummary[t] = rows.length;
    }));

    const totalUnposted = Object.values(unpostedSummary).reduce((s, n) => s + n, 0);
    if (totalUnposted === 0) {
      add(report, {
        ruleId: "PC-002",
        ruleName: "All documents posted",
        severity: "info",
        category: "period-close",
        description: "Все документы периода проведены.",
        affected: {},
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    } else {
      const detail = Object.entries(unpostedSummary).filter(([_, n]) => n > 0).map(([t, n]) => `${t}:${n}`).join(", ");
      add(report, {
        ruleId: "PC-002a",
        ruleName: "Unposted documents block period close",
        severity: "error",
        category: "period-close",
        description: `Непроведённых документов: ${totalUnposted} (${detail}).`,
        affected: { actual: totalUnposted, expected: 0, extras: unpostedSummary },
        suggestedFix: "Провести все документы. Использовать onec_get_unposted_documents для деталей по каждому типу.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    }

    // Depreciation accrual check — амортизация ОС обычно идёт через ЗакрытиеМесяца
    const t2420 = await this.register.getAccountTurnovers("2420", dateFrom, lastDay, organizationGuid).catch(() => null);
    if (!t2420 || t2420.creditTurnover === 0) {
      add(report, {
        ruleId: "PC-003",
        ruleName: "No depreciation accrued",
        severity: "warn",
        category: "period-close",
        description: "В периоде нет оборотов по 2420 (амортизация ОС). Возможно: нет ОС или забыли провести амортизацию.",
        affected: { accountCode: "2420", actual: 0 },
        suggestedFix: "Проверить наличие ОС (счёт 2410). Если есть — провести ЗакрытиеМесяца или ручную амортизацию.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    } else {
      add(report, {
        ruleId: "PC-003a",
        ruleName: "Depreciation accrued",
        severity: "info",
        category: "period-close",
        description: `Амортизация 2420: Кт ${t2420.creditTurnover.toFixed(2)} ₸ за период.`,
        affected: { accountCode: "2420", actual: t2420.creditTurnover },
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    }

    return finalize(report, start);
  }

  async validateAccrualAlignment(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("PeriodCloseValidator.accrualAlignment", { from: dateFrom, to: dateTo }, organizationGuid);

    // Check that tax accruals are present when there's salary or revenue activity
    const [t6010, t3131, t3350, t3220] = await Promise.all([
      this.register.getAccountTurnovers("6010", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3131", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3350", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("3220", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    if ((t6010?.creditTurnover ?? 0) > 0 && (t3131?.creditTurnover ?? 0) === 0) {
      add(report, {
        ruleId: "PC-004",
        ruleName: "Revenue without VAT accrual",
        severity: "error",
        category: "period-close",
        description: `Выручка ${t6010!.creditTurnover.toFixed(2)} ₸, но НДС 3131 не начислен.`,
        affected: { accountCode: "3131", actual: 0, expected: t6010!.creditTurnover * 12 / 112 },
        suggestedFix: "Если продажи облагались НДС — начислить 1210→3131 на 12/112 от выручки.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    if ((t3350?.creditTurnover ?? 0) > 0 && (t3220?.creditTurnover ?? 0) === 0) {
      add(report, {
        ruleId: "PC-004a",
        ruleName: "Salary accrued without ОПВ",
        severity: "error",
        category: "period-close",
        description: `Зарплата 3350 ${t3350!.creditTurnover.toFixed(2)} ₸, но ОПВ 3220 = 0.`,
        affected: { accountCode: "3220", actual: 0, expected: t3350!.creditTurnover * 0.10 },
        suggestedFix: "Перепровести НачислениеЗарплаты — ОПВ должен начисляться автоматически (10 % от базы).",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    if (report.findings.length === 0) {
      add(report, {
        ruleId: "PC-004-ok",
        ruleName: "Accruals aligned",
        severity: "info",
        category: "period-close",
        description: "Налоги и взносы начислены пропорционально базам.",
        affected: {},
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }

  async validateDepreciationCompleteness(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("PeriodCloseValidator.depreciationCompleteness", { from: dateFrom, to: dateTo }, organizationGuid);

    const [b2410, t2420] = await Promise.all([
      this.register.getAccountBalance("2410", organizationGuid, dateTo).catch(() => null),
      this.register.getAccountTurnovers("2420", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const osCost = b2410?.debitBalance ?? 0;
    const depPosted = t2420?.creditTurnover ?? 0;

    if (osCost === 0) {
      add(report, {
        ruleId: "PC-005",
        ruleName: "No fixed assets",
        severity: "info",
        category: "period-close",
        description: "Счёт 2410 пуст — амортизация не требуется.",
        affected: { accountCode: "2410", actual: 0 },
        suggestedFix: "Нет действий.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    } else if (depPosted === 0) {
      add(report, {
        ruleId: "PC-005a",
        ruleName: "Fixed assets exist but no depreciation",
        severity: "error",
        category: "period-close",
        description: `ОС на ${osCost.toFixed(2)} ₸, но в периоде нет оборотов по 2420 — амортизация не начислена.`,
        affected: { accountCode: "2420", actual: 0, extras: { osCost } },
        suggestedFix: "Выполнить регламентную операцию 'Амортизация ОС' в составе ЗакрытиеМесяца.",
        ruleSource: "kz-agro-validation-rules.md#A.4",
      });
    } else {
      // Sanity check: monthly depreciation typically 0.5–3 % of asset cost
      const ratio = depPosted / osCost;
      if (ratio < 0.001) {
        add(report, {
          ruleId: "PC-005b",
          ruleName: "Depreciation suspiciously low",
          severity: "warn",
          category: "period-close",
          description: `Амортизация ${depPosted.toFixed(2)} ₸ = ${(ratio * 100).toFixed(3)} % от стоимости ОС ${osCost.toFixed(2)} ₸.`,
          affected: { accountCode: "2420", actual: depPosted, expected: osCost * 0.01 },
          suggestedFix: "Проверить срок полезного использования и метод амортизации в карточке каждого ОС.",
          ruleSource: "kz-agro-validation-rules.md#A.4",
        });
      } else {
        add(report, {
          ruleId: "PC-005-ok",
          ruleName: "Depreciation reasonable",
          severity: "info",
          category: "period-close",
          description: `Амортизация ${depPosted.toFixed(2)} ₸ = ${(ratio * 100).toFixed(2)} % от ОС ${osCost.toFixed(2)} ₸.`,
          affected: { accountCode: "2420", actual: depPosted, extras: { osCost, ratio } },
          suggestedFix: "OK.",
          ruleSource: "kz-agro-validation-rules.md#A.4",
        });
      }
    }

    return finalize(report, start);
  }

  async validateWIPClosure(year: number, month: number, organizationGuid: string): Promise<ValidationReport> {
    const start = Date.now();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateFrom = `${year}-${pad(month)}-01`;
    const lastDay = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
    const report = emptyReport("PeriodCloseValidator.wipClosure", { from: dateFrom, to: lastDay }, organizationGuid);

    // Check both 8110 (general WIP) and 8112 (растениеводство)
    const accounts = ["8110", "8112", "8111", "8412"];
    const balances = await Promise.all(
      accounts.map(c => this.register.getAccountBalance(c, organizationGuid, lastDay).catch(() => null)),
    );

    for (let i = 0; i < accounts.length; i++) {
      const code = accounts[i];
      const bal = balances[i];
      if (!bal) continue;
      const net = bal.debitBalance - bal.creditBalance;

      // Winter months (Jan-Mar, Nov-Dec) — WIP should be ≈ 0
      const isWinter = month <= 3 || month >= 11;
      // Pre-harvest (Apr-Jul) — WIP accumulates, can be large
      const isGrowing = month >= 4 && month <= 7;
      // Harvest (Aug-Oct) — WIP closes to 1320; should decrease, target ~0
      const isHarvest = month >= 8 && month <= 10;

      if (isWinter && net > WIP_TOLERANCE) {
        add(report, {
          ruleId: "PC-006",
          ruleName: `${code} WIP not closed (winter)`,
          severity: "warn",
          category: "period-close",
          description: `Счёт ${code} = ${net.toFixed(2)} ₸ в зимний месяц (${month}) — ожидается ≈ 0 после уборки.`,
          affected: { accountCode: code, actual: net, expected: 0 },
          suggestedFix: "Провести оприходование готовой продукции (1320 ← 8112) для закрытия НЗП.",
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      } else if (isHarvest && net > 5_000_000) {
        add(report, {
          ruleId: "PC-006a",
          ruleName: `${code} WIP large during harvest`,
          severity: "warn",
          category: "period-close",
          description: `Счёт ${code} = ${net.toFixed(2)} ₸ в месяц ${month} (уборка) — урожай оприходован в 1320?`,
          affected: { accountCode: code, actual: net },
          suggestedFix: "Проверить документы 'Оприходование товаров' с проводкой 1320←8112.",
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      } else if (isGrowing && net === 0 && code === "8112") {
        add(report, {
          ruleId: "PC-006b",
          ruleName: `${code} WIP zero during growing season`,
          severity: "warn",
          category: "period-close",
          description: `Счёт ${code} = 0 в месяц ${month} (вегетация) — затраты на посев/удобрения не накапливаются?`,
          affected: { accountCode: code, actual: 0 },
          suggestedFix: "Проверить, что затраты на семена, удобрения, ГСМ списываются на 8112 через ТребованиеНакладная.",
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      } else {
        add(report, {
          ruleId: "PC-006-ok",
          ruleName: `${code} WIP normal for month`,
          severity: "info",
          category: "period-close",
          description: `Счёт ${code} = ${net.toFixed(2)} ₸ — нормально для месяца ${month}.`,
          affected: { accountCode: code, actual: net },
          suggestedFix: "OK.",
          ruleSource: "kz-agro-validation-rules.md#A.3",
        });
      }
    }

    return finalize(report, start);
  }

  async validateCOGSBasis(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("PeriodCloseValidator.cogsBasis", { from: dateFrom, to: dateTo }, organizationGuid);

    const [t7010, t1320] = await Promise.all([
      this.register.getAccountTurnovers("7010", dateFrom, dateTo, organizationGuid).catch(() => null),
      this.register.getAccountTurnovers("1320", dateFrom, dateTo, organizationGuid).catch(() => null),
    ]);

    const cogs = t7010?.debitTurnover ?? 0;
    const fgOut = t1320?.creditTurnover ?? 0;

    if (cogs === 0 && fgOut === 0) {
      add(report, {
        ruleId: "PC-007",
        ruleName: "No COGS / no FG dispatch",
        severity: "info",
        category: "period-close",
        description: "Нет оборотов ни по 7010, ни по 1320 — продажи не происходили.",
        affected: {},
        suggestedFix: "Нет действий.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
      return finalize(report, start);
    }

    const diff = cogs - fgOut;
    const diffPct = fgOut > 0 ? (diff / fgOut) * 100 : 100;

    if (Math.abs(diffPct) > 2) {
      add(report, {
        ruleId: "PC-007a",
        ruleName: "COGS ≠ FG outflow",
        severity: "error",
        category: "period-close",
        description: `7010 Дт ${cogs.toFixed(2)} ₸ ≠ 1320 Кт ${fgOut.toFixed(2)} ₸ (отклонение ${diffPct.toFixed(2)} %).`,
        affected: { accountCode: "7010", expected: fgOut, actual: cogs, deviation: diff, deviationPct: diffPct },
        suggestedFix: "Проверить документы Реализация: проводка 7010←1320 должна формироваться по фактической себестоимости.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    } else {
      add(report, {
        ruleId: "PC-007-ok",
        ruleName: "COGS matches FG dispatch",
        severity: "info",
        category: "period-close",
        description: `7010 Дт ${cogs.toFixed(2)} ≈ 1320 Кт ${fgOut.toFixed(2)} (отклонение ${diffPct.toFixed(2)} %).`,
        affected: { expected: fgOut, actual: cogs, deviationPct: diffPct },
        suggestedFix: "OK.",
        ruleSource: "kz-agro-validation-rules.md#A.3",
      });
    }

    return finalize(report, start);
  }
}
