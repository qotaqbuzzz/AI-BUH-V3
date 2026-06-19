import type { OneCClient } from "@aibos/onec-client";

export interface ImportSummary {
  documentGuid: string;
  documentDate: string;
  gtdNumber: string;
  supplierName: string;
  customsValue: number;
  dutyAmount: number;
  vatAmount: number;
  totalLanded: number;
}

const KZ_TARIFF_RATES: Record<string, number> = {
  "8471": 0, "8517": 0, "8701": 0.05, "8702": 0.05, "8703": 0.05, default: 0.05,
};

export class CustomsService {
  constructor(private readonly client: OneCClient) {}

  async getImportSummary(periodFrom: string, periodTo: string, organizationGuid?: string): Promise<{
    imports: ImportSummary[];
    totalCustomsValue: number;
    totalDuties: number;
    totalVat: number;
    totalLanded: number;
    documentCount: number;
  }> {
    const filters: string[] = ["DeletionMark eq false", "Posted eq true", `Date ge datetime'${periodFrom}T00:00:00' and Date le datetime'${periodTo}T23:59:59'`];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const docs = await this.client.getCollection<{
      Ref_Key: string; Date?: string; НомерГТД?: string; Контрагент?: { Description?: string }; СуммаДокумента?: number; СуммаТаможеннойПошлины?: number; СуммаНДС?: number;
    }>("Document_ГТДИмпорт", {
      filter: filters.join(" and "),
      expand: "Контрагент",
      select: "Ref_Key,Date,НомерГТД,СуммаДокумента,СуммаТаможеннойПошлины,СуммаНДС",
      top: 1000,
    }).catch(() => []);
    const imports: ImportSummary[] = docs.map(d => {
      const customs = d.СуммаДокумента ?? 0;
      const duty = d.СуммаТаможеннойПошлины ?? customs * 0.05;
      const vat = d.СуммаНДС ?? (customs + duty) * 0.12;
      return { documentGuid: d.Ref_Key, documentDate: d.Date?.slice(0, 10) ?? "", gtdNumber: d.НомерГТД ?? "", supplierName: d.Контрагент?.Description ?? "", customsValue: customs, dutyAmount: duty, vatAmount: vat, totalLanded: customs + duty + vat };
    });
    return { imports, totalCustomsValue: imports.reduce((s, i) => s + i.customsValue, 0), totalDuties: imports.reduce((s, i) => s + i.dutyAmount, 0), totalVat: imports.reduce((s, i) => s + i.vatAmount, 0), totalLanded: imports.reduce((s, i) => s + i.totalLanded, 0), documentCount: imports.length };
  }

  async calculateLandedCost(goodsValue: number, freightCost: number, insuranceCost: number, hsCode: string, quantity?: number): Promise<{
    cif: number; dutyRate: number; dutyAmount: number; vatBase: number; vatAmount: number; totalLandedCost: number; costPerUnit?: number;
    breakdown: { component: string; amount: number; percent: number }[];
  }> {
    const cif = goodsValue + freightCost + insuranceCost;
    const dutyRate = KZ_TARIFF_RATES[hsCode.slice(0, 4)] ?? KZ_TARIFF_RATES.default;
    const dutyAmount = cif * dutyRate;
    const vatBase = cif + dutyAmount;
    const vatAmount = vatBase * 0.12;
    const totalLandedCost = cif + dutyAmount + vatAmount;
    const breakdown = [
      { component: "Стоимость товара", amount: goodsValue, percent: (goodsValue / totalLandedCost) * 100 },
      { component: "Фрахт", amount: freightCost, percent: (freightCost / totalLandedCost) * 100 },
      { component: "Страхование", amount: insuranceCost, percent: (insuranceCost / totalLandedCost) * 100 },
      { component: "Таможенная пошлина", amount: dutyAmount, percent: (dutyAmount / totalLandedCost) * 100 },
      { component: "НДС", amount: vatAmount, percent: (vatAmount / totalLandedCost) * 100 },
    ];
    return { cif, dutyRate, dutyAmount, vatBase, vatAmount, totalLandedCost, costPerUnit: quantity && quantity > 0 ? totalLandedCost / quantity : undefined, breakdown };
  }
}
