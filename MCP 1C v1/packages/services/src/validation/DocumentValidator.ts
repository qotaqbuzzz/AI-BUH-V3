import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
import { add, emptyReport, finalize, type ValidationReport } from "./types.js";

interface DocumentHeader {
  Ref_Key: string;
  Number: string;
  Date: string;
  СуммаДокумента?: number;
  СуммаНДС?: number;
}

interface DocumentLine {
  Ref_Key?: string; // parent
  LineNumber?: number;
  Количество?: number;
  Цена?: number;
  Сумма?: number;
  СтавкаНДС?: { Description?: string } | string;
  СуммаНДС?: number;
  Номенклатура_Key?: string;
}

export class DocumentValidator {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async validateLineTotals(
    documentType: "РеализацияТоваровУслуг" | "ПоступлениеТоваровУслуг",
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
    sampleLimit = 50,
  ): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport(`DocumentValidator.lineTotals.${documentType}`, { from: dateFrom, to: dateTo }, organizationGuid);

    const headerFilters: string[] = [
      `Posted eq true`,
      `DeletionMark eq false`,
      `Date ge datetime'${dateFrom}T00:00:00'`,
      `Date le datetime'${dateTo}T23:59:59'`,
    ];
    if (organizationGuid) headerFilters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const headers = await this.client.getCollection<DocumentHeader>(
      `Document_${documentType}`,
      { filter: headerFilters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента,СуммаНДС", top: sampleLimit, orderby: "Date desc" },
    ).catch(() => []);

    if (headers.length === 0) {
      add(report, {
        ruleId: "DOC-001",
        ruleName: "No documents to validate",
        severity: "info",
        category: "document",
        description: `Нет документов ${documentType} за период.`,
        affected: { documentType },
        suggestedFix: "Нет действий.",
        ruleSource: "kz-agro-validation-rules.md#A.5",
      });
      return finalize(report, start);
    }

    let checked = 0;
    let withLineErrors = 0;
    let withHeaderMismatch = 0;

    for (const hdr of headers) {
      const lines = await this.client.getCollection<DocumentLine>(
        `Document_${documentType}_Товары`,
        { filter: `Ref_Key eq guid'${hdr.Ref_Key}'`, select: "LineNumber,Количество,Цена,Сумма,СуммаНДС,Номенклатура_Key", top: 500 },
      ).catch(() => []);

      if (lines.length === 0) continue;
      checked++;

      let lineSum = 0;
      let lineVat = 0;
      let lineErrorCount = 0;

      for (const line of lines) {
        const qty = line.Количество ?? 0;
        const price = line.Цена ?? 0;
        const amount = line.Сумма ?? 0;
        const expected = qty * price;
        if (Math.abs(expected - amount) > 0.01 && qty > 0 && price > 0) {
          lineErrorCount++;
          add(report, {
            ruleId: "DOC-001a",
            ruleName: "Line amount ≠ qty × price",
            severity: "error",
            category: "document",
            description: `${documentType} ${hdr.Number} строка ${line.LineNumber}: ${qty} × ${price} = ${expected.toFixed(2)} ≠ ${amount.toFixed(2)}`,
            affected: {
              documentGuid: hdr.Ref_Key,
              documentNumber: hdr.Number,
              documentDate: hdr.Date,
              documentType,
              expected,
              actual: amount,
              deviation: amount - expected,
              extras: { lineNumber: line.LineNumber ?? 0, qty, price },
            },
            suggestedFix: "Открыть документ в 1С, исправить количество, цену или сумму в строке.",
            ruleSource: "kz-agro-validation-rules.md#A.5",
          });
        }
        lineSum += amount;
        lineVat += line.СуммаНДС ?? 0;
      }

      if (lineErrorCount > 0) withLineErrors++;

      // Header sum check
      const headerAmount = hdr.СуммаДокумента ?? 0;
      if (Math.abs(lineSum - headerAmount) > 1 && headerAmount > 0) {
        withHeaderMismatch++;
        add(report, {
          ruleId: "DOC-001b",
          ruleName: "Header СуммаДокумента ≠ Σ lines",
          severity: "error",
          category: "document",
          description: `${documentType} ${hdr.Number}: header ${headerAmount.toFixed(2)} ≠ Σ строк ${lineSum.toFixed(2)} (отклонение ${(lineSum - headerAmount).toFixed(2)} ₸).`,
          affected: {
            documentGuid: hdr.Ref_Key,
            documentNumber: hdr.Number,
            documentDate: hdr.Date,
            documentType,
            expected: lineSum,
            actual: headerAmount,
            deviation: headerAmount - lineSum,
          },
          suggestedFix: "Перепровести документ — заголовочная сумма должна автоматически пересчитаться.",
          ruleSource: "kz-agro-validation-rules.md#A.5",
        });
      }
    }

    add(report, {
      ruleId: "DOC-001-summary",
      ruleName: "Document line check summary",
      severity: "info",
      category: "document",
      description: `Проверено ${checked} документов: с ошибками строк ${withLineErrors}, с расхождением заголовка ${withHeaderMismatch}.`,
      affected: { actual: checked, extras: { withLineErrors, withHeaderMismatch, sampleLimit } },
      suggestedFix: `Увеличить sampleLimit (текущий ${sampleLimit}) для полной проверки всех документов.`,
      ruleSource: "kz-agro-validation-rules.md#A.5",
    });

    return finalize(report, start);
  }

  async validateNomenclatureAccounts(date: string, organizationGuid?: string): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DocumentValidator.nomenclatureAccounts", { from: date, to: date }, organizationGuid);

    // Sample check: items on 1320 (finished goods) should have ВидНоменклатуры = Продукция (or similar)
    const breakdown = await this.register.getAccountBreakdown("1320", date, organizationGuid).catch(() => []);

    if (breakdown.length === 0) {
      add(report, {
        ruleId: "DOC-002",
        ruleName: "Account 1320 empty",
        severity: "info",
        category: "document",
        description: "На 1320 (Готовая продукция) нет остатков.",
        affected: { accountCode: "1320" },
        suggestedFix: "Нет действий.",
        ruleSource: "kz-agro-validation-rules.md#A.5",
      });
      return finalize(report, start);
    }

    // Pull nomenclature types for items on 1320
    const nomGuids = [...new Set(breakdown.map(b => b.dim1).filter(Boolean))];
    if (nomGuids.length > 0) {
      const filter = nomGuids.slice(0, 50).map(g => `Ref_Key eq guid'${g}'`).join(" or ");
      const items = await this.client.getCollection<{ Ref_Key: string; Description: string; ВидНоменклатуры_Key?: string; Услуга?: boolean }>(
        "Catalog_Номенклатура",
        { filter, select: "Ref_Key,Description,Услуга", top: 50 },
      ).catch(() => []);

      const services = items.filter(i => i.Услуга === true);
      if (services.length > 0) {
        add(report, {
          ruleId: "DOC-002a",
          ruleName: "Services on 1320 (Готовая продукция)",
          severity: "error",
          category: "document",
          description: `На счёте 1320 числятся ${services.length} услуг — должна быть только готовая продукция.`,
          affected: { accountCode: "1320", actual: services.length, expected: 0 },
          suggestedFix: `Перенести услуги на 7xxx или 8xxx. Услуги: ${services.slice(0, 5).map(s => s.Description).join("; ")}.`,
          ruleSource: "kz-agro-validation-rules.md#A.5",
        });
      } else {
        add(report, {
          ruleId: "DOC-002-ok",
          ruleName: "Nomenclature accounts consistent",
          severity: "info",
          category: "document",
          description: `Проверено ${items.length} позиций на 1320 — услуг не найдено.`,
          affected: { accountCode: "1320", actual: items.length },
          suggestedFix: "OK.",
          ruleSource: "kz-agro-validation-rules.md#A.5",
        });
      }
    }

    return finalize(report, start);
  }

  async validateAdvanceAging(date: string, organizationGuid?: string, agingDays = 90): Promise<ValidationReport> {
    const start = Date.now();
    const report = emptyReport("DocumentValidator.advanceAging", { from: date, to: date }, organizationGuid);

    // Check 1710 (advances paid to suppliers) and 3510 (advances received from customers)
    const accounts: Array<{ code: string; direction: "paid" | "received"; description: string }> = [
      { code: "1710", direction: "paid", description: "Авансы выданные поставщикам" },
      { code: "3510", direction: "received", description: "Авансы полученные от покупателей" },
    ];

    for (const acc of accounts) {
      const breakdown = await this.register.getAccountBreakdown(acc.code, date, organizationGuid).catch(() => []);
      if (breakdown.length === 0) continue;

      const totalDr = breakdown.reduce((s, b) => s + (b.amountDr ?? 0), 0);
      const totalCr = breakdown.reduce((s, b) => s + (b.amountCr ?? 0), 0);
      const totalBalance = acc.direction === "paid" ? totalDr : totalCr;
      const contractorCount = breakdown.filter(b => b.dim1).length;

      // We can't determine aging from balance alone — flag for manual review if large
      if (totalBalance > 10_000_000) {
        add(report, {
          ruleId: "DOC-003",
          ruleName: `Large balance on ${acc.code} requires aging review`,
          severity: "warn",
          category: "document",
          description: `${acc.description} (${acc.code}): остаток ${totalBalance.toFixed(2)} ₸ по ${contractorCount} контрагентам.`,
          affected: { accountCode: acc.code, actual: totalBalance, extras: { contractorCount, agingThresholdDays: agingDays } },
          suggestedFix: acc.direction === "paid"
            ? `Запросить поставку или возврат аванса от контрагентов с давностью > ${agingDays} дней. Использовать onec_get_advance_settlement по каждому контрагенту.`
            : `Закрыть авансы реализацией или вернуть покупателям. Использовать onec_get_advance_settlement по каждому контрагенту.`,
          ruleSource: "kz-agro-validation-rules.md#A.6",
        });
      }

      // Top 3 contractors by balance
      const top = breakdown
        .map(b => ({ name: b.dim1Name || b.dim1.slice(0, 8) + "…", amount: acc.direction === "paid" ? b.amountDr : b.amountCr }))
        .filter(b => b.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      if (top.length > 0) {
        add(report, {
          ruleId: "DOC-003a",
          ruleName: `Top contractors on ${acc.code}`,
          severity: "info",
          category: "document",
          description: `${acc.code} топ-3: ${top.map(t => `${t.name} = ${t.amount.toFixed(0)} ₸`).join("; ")}.`,
          affected: { accountCode: acc.code, extras: { topContractors: JSON.stringify(top) } },
          suggestedFix: "Проверить эти позиции в первую очередь.",
          ruleSource: "kz-agro-validation-rules.md#A.6",
        });
      }
    }

    return finalize(report, start);
  }
}
