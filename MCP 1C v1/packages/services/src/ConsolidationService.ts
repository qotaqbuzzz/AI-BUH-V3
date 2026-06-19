import type { OneCClient } from "@aibos/onec-client";

export interface InterOrgTransaction {
  sellerOrgGuid: string;
  buyerOrgGuid: string;
  documentGuid: string;
  documentDate: string;
  amount: number;
  type: "sale" | "purchase";
}

export interface ConsolidationElimination {
  sellerGuid: string;
  buyerGuid: string;
  revenue: number;
  cogs: number;
  eliminationEntry: { debit: string; credit: string; amount: number }[];
}

export class ConsolidationService {
  constructor(private readonly client: OneCClient) {}

  async getInterOrgTransactions(periodFrom: string, periodTo: string, orgGuids: string[]): Promise<InterOrgTransaction[]> {
    if (orgGuids.length < 2) return [];
    const orgSet = new Set(orgGuids);
    const orgFilter = orgGuids.map(g => `Организация_Key eq guid'${g}'`).join(" or ");
    const filters = [
      "DeletionMark eq false", "Posted eq true",
      `Date ge datetime'${periodFrom}T00:00:00' and Date le datetime'${periodTo}T23:59:59'`,
      `(${orgFilter})`,
    ];
    const sales = await this.client.getCollection<{
      Ref_Key: string; Date?: string; Организация_Key?: string; Контрагент_Key?: string; СуммаДокумента?: number;
    }>("Document_РеализацияТоваровУслуг", {
      filter: filters.join(" and "),
      select: "Ref_Key,Date,Организация_Key,Контрагент_Key,СуммаДокумента",
      top: 2000,
    }).catch(() => []);
    return sales
      .filter(s => s.Контрагент_Key && orgSet.has(s.Контрагент_Key))
      .map(s => ({
        sellerOrgGuid: s.Организация_Key ?? "",
        buyerOrgGuid: s.Контрагент_Key!,
        documentGuid: s.Ref_Key,
        documentDate: s.Date?.slice(0, 10) ?? "",
        amount: s.СуммаДокумента ?? 0,
        type: "sale" as const,
      }))
      .sort((a, b) => a.documentDate.localeCompare(b.documentDate));
  }

  async calculateConsolidationEliminations(periodFrom: string, periodTo: string, orgGuids: string[]): Promise<{
    eliminations: ConsolidationElimination[];
    totalIntercompanyRevenue: number;
    totalIntercompanyCogs: number;
    balanced: boolean;
  }> {
    const txns = await this.getInterOrgTransactions(periodFrom, periodTo, orgGuids);
    const totalRevenue = txns.reduce((s, t) => s + t.amount, 0);
    const eliminations: ConsolidationElimination[] = txns.map(t => ({
      sellerGuid: t.sellerOrgGuid,
      buyerGuid: t.buyerOrgGuid,
      revenue: t.amount,
      cogs: t.amount,
      eliminationEntry: [{ debit: "6010", credit: "7010", amount: t.amount }],
    }));
    return { eliminations, totalIntercompanyRevenue: totalRevenue, totalIntercompanyCogs: totalRevenue, balanced: true };
  }
}
