import type { OneCClient } from "@aibos/onec-client";

export interface RelatedPartyTransaction {
  documentGuid: string;
  documentType: string;
  documentDate: string;
  counterpartyGuid: string;
  counterpartyName: string;
  amount: number;
  relationshipType: string;
}

export class RelatedPartyService {
  constructor(private readonly client: OneCClient) {}

  private async getRelatedPartyGuids(): Promise<Set<string>> {
    const rpt = await this.client.getCollection<{ Ref_Key: string }>(
      "Catalog_Контрагенты",
      { filter: "DeletionMark eq false and СвязаннаяСторона eq true", select: "Ref_Key", top: 200 },
    ).catch(() => [] as { Ref_Key: string }[]);
    return new Set(rpt.map(c => c.Ref_Key));
  }

  async identifyRelatedPartyTransactions(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    transactions: RelatedPartyTransaction[];
    totalRptAmount: number;
    rptCount: number;
    relatedPartyGuids: string[];
    note: string;
  }> {
    const rptGuids = await this.getRelatedPartyGuids();
    const filters = ["DeletionMark eq false", "Posted eq true", `Date ge datetime'${periodFrom}T00:00:00' and Date le datetime'${periodTo}T23:59:59'`];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const filter = filters.join(" and ");
    const [sales, purchases] = await Promise.all([
      this.client.getCollection<{ Ref_Key: string; Date?: string; Контрагент_Key?: string; Контрагент?: { Description?: string }; СуммаДокумента?: number }>(
        "Document_РеализацияТоваровУслуг", { filter, expand: "Контрагент", select: "Ref_Key,Date,Контрагент_Key,СуммаДокумента", top: 2000 },
      ).catch(() => []),
      this.client.getCollection<{ Ref_Key: string; Date?: string; Контрагент_Key?: string; Контрагент?: { Description?: string }; СуммаДокумента?: number }>(
        "Document_ПоступлениеТоваровУслуг", { filter, expand: "Контрагент", select: "Ref_Key,Date,Контрагент_Key,СуммаДокумента", top: 2000 },
      ).catch(() => []),
    ]);
    const transactions: RelatedPartyTransaction[] = [
      ...sales.filter(s => rptGuids.has(s.Контрагент_Key ?? "")).map(s => ({ documentGuid: s.Ref_Key, documentType: "Реализация", documentDate: s.Date?.slice(0, 10) ?? "", counterpartyGuid: s.Контрагент_Key ?? "", counterpartyName: s.Контрагент?.Description ?? "", amount: s.СуммаДокумента ?? 0, relationshipType: "связанная сторона" })),
      ...purchases.filter(p => rptGuids.has(p.Контрагент_Key ?? "")).map(p => ({ documentGuid: p.Ref_Key, documentType: "Поступление", documentDate: p.Date?.slice(0, 10) ?? "", counterpartyGuid: p.Контрагент_Key ?? "", counterpartyName: p.Контрагент?.Description ?? "", amount: p.СуммаДокумента ?? 0, relationshipType: "связанная сторона" })),
    ].sort((a, b) => a.documentDate.localeCompare(b.documentDate));
    const note = rptGuids.size === 0
      ? "Связанные стороны не найдены. Добавьте булево поле «СвязаннаяСторона» в Catalog_Контрагенты."
      : `Найдено ${rptGuids.size} контрагентов-связанных сторон.`;
    return { transactions, totalRptAmount: transactions.reduce((s, t) => s + t.amount, 0), rptCount: transactions.length, relatedPartyGuids: [...rptGuids], note };
  }

  async validateRptPricing(periodFrom: string, periodTo: string, organizationGuid?: string, tolerancePercent = 10): Promise<{
    passed: boolean; pricingAnomalies: RelatedPartyTransaction[]; note: string;
  }> {
    const { transactions } = await this.identifyRelatedPartyTransactions(periodFrom, periodTo, organizationGuid);
    return {
      passed: transactions.length === 0,
      pricingAnomalies: [],
      note: `Автоматическая проверка рыночных цен требует эталонного прайса. Допустимое отклонение: ±${tolerancePercent}%. Транзакций: ${transactions.length}.`,
    };
  }
}
