import type { OneCClient } from "@aibos/onec-client";

export interface SupplierPerformance {
  supplierGuid: string;
  supplierName: string;
  totalPurchases: number;
  documentCount: number;
  averageInvoiceAmount: number;
  returnCount: number;
  returnAmount: number;
  returnRate: number;
}

export class SupplyChainAnalyticsService {
  constructor(private readonly client: OneCClient) {}

  private baseFilters(periodFrom: string, periodTo: string, organizationGuid?: string): string {
    const f = ["DeletionMark eq false", "Posted eq true", `Date ge datetime'${periodFrom}T00:00:00' and Date le datetime'${periodTo}T23:59:59'`];
    if (organizationGuid) f.push(`Организация_Key eq guid'${organizationGuid}'`);
    return f.join(" and ");
  }

  async getSupplierPerformance(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<SupplierPerformance[]> {
    const filter = this.baseFilters(periodFrom, periodTo, organizationGuid);
    const [purchases, returns] = await Promise.all([
      this.client.getCollection<{ Ref_Key: string; Контрагент_Key?: string; Контрагент?: { Description?: string }; СуммаДокумента?: number }>(
        "Document_ПоступлениеТоваровУслуг",
        { filter, expand: "Контрагент", select: "Ref_Key,Контрагент_Key,СуммаДокумента", top: 5000 },
      ).catch(() => []),
      this.client.getCollection<{ Ref_Key: string; Контрагент_Key?: string; СуммаДокумента?: number }>(
        "Document_ВозвратТоваровПоставщику",
        { filter, select: "Ref_Key,Контрагент_Key,СуммаДокумента", top: 1000 },
      ).catch(() => []),
    ]);
    const supplierMap = new Map<string, { name: string; total: number; count: number; returns: number; returnAmt: number }>();
    for (const p of purchases) {
      const key = p.Контрагент_Key ?? "unknown";
      const ex = supplierMap.get(key);
      const amt = p.СуммаДокумента ?? 0;
      if (ex) { ex.total += amt; ex.count++; }
      else { supplierMap.set(key, { name: p.Контрагент?.Description ?? key.slice(0, 8), total: amt, count: 1, returns: 0, returnAmt: 0 }); }
    }
    for (const r of returns) {
      const key = r.Контрагент_Key ?? "unknown";
      const ex = supplierMap.get(key);
      if (ex) { ex.returns++; ex.returnAmt += r.СуммаДокумента ?? 0; }
    }
    return [...supplierMap.entries()]
      .map(([guid, v]) => ({
        supplierGuid: guid, supplierName: v.name, totalPurchases: v.total, documentCount: v.count,
        averageInvoiceAmount: v.count > 0 ? v.total / v.count : 0,
        returnCount: v.returns, returnAmount: v.returnAmt, returnRate: v.total > 0 ? (v.returnAmt / v.total) * 100 : 0,
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases);
  }

  async getSpendByCategory(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    categories: { groupName: string; totalAmount: number; count: number; percentOfTotal: number }[];
    grandTotal: number;
  }> {
    const filter = this.baseFilters(periodFrom, periodTo, organizationGuid);
    const docs = await this.client.getCollection<{ Ref_Key: string; СуммаДокумента?: number }>(
      "Document_ПоступлениеТоваровУслуг",
      { filter, select: "Ref_Key,СуммаДокумента", top: 5000 },
    ).catch(() => [] as { Ref_Key: string; СуммаДокумента?: number }[]);
    const grandTotal = docs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0);
    return { categories: [{ groupName: "Все категории", totalAmount: grandTotal, count: docs.length, percentOfTotal: 100 }], grandTotal };
  }

  async getSupplierConcentration(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    top10Suppliers: SupplierPerformance[];
    top10Percent: number;
    grandTotal: number;
    hhi: number;
  }> {
    const all = await this.getSupplierPerformance(periodFrom, periodTo, organizationGuid);
    const grandTotal = all.reduce((s, p) => s + p.totalPurchases, 0);
    const top10 = all.slice(0, 10);
    const top10Total = top10.reduce((s, p) => s + p.totalPurchases, 0);
    const hhi = all.reduce((s, p) => s + Math.pow((p.totalPurchases / (grandTotal || 1)) * 100, 2), 0);
    return { top10Suppliers: top10, top10Percent: grandTotal > 0 ? (top10Total / grandTotal) * 100 : 0, grandTotal, hhi };
  }
}
