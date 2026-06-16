import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";

const BATCH = 20;

type TurnoverRow = {
  Account_Key?: string;
  ExtDimension1?: string;
  ExtDimension1_Type?: string;
  Организация_Key?: string;
  СуммаTurnoverDr?: number;
  СуммаTurnoverCr?: number;
  КоличествоTurnoverDr?: number;
  КоличествоTurnoverCr?: number;
};

type BalanceRow = {
  Account_Key?: string;
  ExtDimension1?: string;
  ExtDimension1_Type?: string;
  Организация_Key?: string;
  СуммаBalanceDr?: number;
  СуммаBalanceCr?: number;
  КоличествоBalanceDr?: number;
  КоличествоBalanceCr?: number;
};

export interface NomenclatureUnitCostResult {
  nomenclatureGuid: string;
  nomenclatureName: string;
  unit: string;
  period: { from: string; to: string };
  production: { qty: number; cost: number; unitCost: number };
  cogs:       { qty: number; cost: number; unitCost: number };
  inventory:  { openingQty: number; openingCost: number; closingQty: number; closingCost: number; avgCostAtClose: number };
  note: string;
}

export interface COGSCompositionSource {
  corrAccountCode: string;
  accountName: string;
  category: string;
  totalAmount: number;
  pctOfTotal: number;
  sampleDocuments: { guid: string; number: string; date: string; type: string; contractor?: string }[];
}

export interface COGSCompositionResult {
  period: { from: string; to: string };
  organizationGuid?: string;
  sources: COGSCompositionSource[];
  total: number;
  note: string;
}

export interface CostItemEntry {
  costItemGuid: string;
  costItemName: string;
  amount: number;
  pctOfTotal: number;
}

export interface HarvestEntry {
  productGroupGuid: string;
  productGroupName: string;
  amount: number;
  pctOfTotal: number;
}

export interface RealProductionCostsResult {
  period: { from: string; to: string };
  productionAccount: string;
  wipAccount: string;
  finishedGoodsAccount: string;
  realCosts: { total: number; byCostItem: CostItemEntry[] };
  wipPingPong: { reOpening: number; closingToWip: number };
  harvestCapitalized: { total: number; byProduct: HarvestEntry[] };
  crossCheck: { realCosts: number; harvestCapitalized: number; wipNetIncrease: number; note: string };
  totalRawDebitTurnover: number;
  note: string;
}

const ACCOUNT_CATEGORY: Record<string, { name: string; category: string }> = {
  "1310": { name: "Сырьё и материалы (семена, удобрения, ГСМ, запчасти)", category: "materials" },
  "3350": { name: "Зарплата производственного персонала", category: "payroll" },
  "3211": { name: "Соц. отчисления работодателя (СО)", category: "payroll-tax" },
  "3213": { name: "ВОСМС работодателя", category: "payroll-tax" },
  "3250": { name: "ОППВ работодателя", category: "payroll-tax" },
  "2420": { name: "Амортизация производственной техники", category: "depreciation" },
  "8412": { name: "Распределённые накладные растениеводства", category: "overhead" },
};

// Document types to probe when resolving recorder metadata, in priority order
const RECORDER_DOC_TYPES = [
  "ТребованиеНакладная",
  "НачислениеЗарплатыРаботникамОрганизаций",
  "ЗакрытиеМесяца",
  "ОперацияБух",
];

export class CostingService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getNomenclatureUnitCost(
    nomenclatureGuid: string,
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<NomenclatureUnitCostResult> {
    const [guid1320, guid7010] = await Promise.all([
      this.register.resolveAccountGuid("1320"),
      this.register.resolveAccountGuid("7010"),
    ]);

    // Fetch turnovers for 1320 and 7010
    const fetchTurnovers = async (accountGuid: string) => {
      if (!accountGuid) return [] as TurnoverRow[];
      const filters: string[] = [`Account_Key eq guid'${accountGuid}'`];
      if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
      return this.client.getRegisterTurnovers<TurnoverRow>("AccountingRegister_Типовой", {
        filter: filters.join(" and "),
        select: "Account_Key,ExtDimension1,ExtDimension1_Type,СуммаTurnoverDr,СуммаTurnoverCr,КоличествоTurnoverDr,КоличествоTurnoverCr",
        StartPeriod: `${dateFrom}T00:00:00`,
        EndPeriod: `${dateTo}T23:59:59`,
        top: 5000,
      }).catch(() => [] as TurnoverRow[]);
    };

    // Fetch balance for 1320 (opening = day before dateFrom, closing = dateTo)
    const openingDate = new Date(dateFrom);
    openingDate.setDate(openingDate.getDate() - 1);
    const openingDateStr = openingDate.toISOString().slice(0, 10);

    const fetchBalance = async (accountGuid: string, date: string) => {
      if (!accountGuid) return [] as BalanceRow[];
      const filters: string[] = [`Account_Key eq guid'${accountGuid}'`];
      if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
      return this.client.getRegisterBalance<BalanceRow>("AccountingRegister_Типовой", {
        filter: filters.join(" and "),
        select: "Account_Key,ExtDimension1,ExtDimension1_Type,СуммаBalanceDr,СуммаBalanceCr,КоличествоBalanceDr,КоличествоBalanceCr",
        Period: `${date}T23:59:59`,
        top: 5000,
      }).catch(() => [] as BalanceRow[]);
    };

    const [rows1320, rows7010, openRows, closeRows, nomDetails] = await Promise.all([
      fetchTurnovers(guid1320 ?? ""),
      fetchTurnovers(guid7010 ?? ""),
      fetchBalance(guid1320 ?? "", openingDateStr),
      fetchBalance(guid1320 ?? "", dateTo),
      this.resolveNomenclatureDetails(nomenclatureGuid),
    ]);

    const isTargetNom = (r: { ExtDimension1?: string; ExtDimension1_Type?: string }) =>
      r.ExtDimension1 === nomenclatureGuid && r.ExtDimension1_Type?.includes("Catalog_Номенклатура");

    const sum1320 = rows1320.filter(isTargetNom).reduce(
      (a, r) => ({ dr: a.dr + (r.СуммаTurnoverDr ?? 0), cr: a.cr + (r.СуммаTurnoverCr ?? 0), qDr: a.qDr + (r.КоличествоTurnoverDr ?? 0), qCr: a.qCr + (r.КоличествоTurnoverCr ?? 0) }),
      { dr: 0, cr: 0, qDr: 0, qCr: 0 },
    );

    const sum7010 = rows7010.filter(isTargetNom).reduce(
      (a, r) => ({ dr: a.dr + (r.СуммаTurnoverDr ?? 0), qDr: a.qDr + (r.КоличествоTurnoverDr ?? 0) }),
      { dr: 0, qDr: 0 },
    );

    const sumBal = (rows: BalanceRow[]) => rows.filter(isTargetNom).reduce(
      (a, r) => {
        const qty  = (r.КоличествоBalanceDr ?? 0) - (r.КоличествоBalanceCr ?? 0);
        const cost = (r.СуммаBalanceDr ?? 0) - (r.СуммаBalanceCr ?? 0);
        return { qty: a.qty + qty, cost: a.cost + cost };
      },
      { qty: 0, cost: 0 },
    );

    const opening = sumBal(openRows);
    const closing = sumBal(closeRows);

    const r2 = (n: number) => Math.round(n * 100) / 100;

    return {
      nomenclatureGuid,
      nomenclatureName: nomDetails.name,
      unit: nomDetails.unit,
      period: { from: dateFrom, to: dateTo },
      production: {
        qty: r2(sum1320.qDr),
        cost: r2(sum1320.dr),
        unitCost: sum1320.qDr > 0 ? r2(sum1320.dr / sum1320.qDr) : 0,
      },
      cogs: {
        qty: r2(sum1320.qCr),
        cost: r2(sum7010.dr),
        unitCost: sum1320.qCr > 0 ? r2(sum7010.dr / sum1320.qCr) : 0,
      },
      inventory: {
        openingQty: r2(opening.qty),
        openingCost: r2(opening.cost),
        closingQty: r2(closing.qty),
        closingCost: r2(closing.cost),
        avgCostAtClose: closing.qty > 0 ? r2(closing.cost / closing.qty) : 0,
      },
      note: "production.unitCost = что 1С капитализировал при оприходовании урожая (Дт 1320 / qty). cogs.unitCost = что списано в финрезультат при продаже (Дт 7010 / qty Кт 1320). Равны при weighted-avg/FIFO со стабильной себестоимостью. See kz-agro-costing-flow.md.",
    };
  }

  async getCOGSCompositionWithDocs(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
    perCategoryDocLimit = 10,
  ): Promise<COGSCompositionResult> {
    // Pull 8110 and 8112 line-level card
    const [card8110, card8112] = await Promise.all([
      this.register.getAccountCard("8110", dateFrom, dateTo, organizationGuid),
      this.register.getAccountCard("8112", dateFrom, dateTo, organizationGuid),
    ]);

    // Combine all rows where account 8110/8112 is on Дт side (inputs into production)
    const allRows = [
      ...card8110.rows.filter(r => r.amountDr > 0),
      ...card8112.rows.filter(r => r.amountDr > 0),
    ];

    // Group by corr-account code
    const byCorr = new Map<string, { total: number; recorders: Set<string> }>();
    for (const r of allRows) {
      const code = r.corrAccountCode;
      const existing = byCorr.get(code) ?? { total: 0, recorders: new Set() };
      existing.total += r.amountDr;
      if (r.recorderKey) existing.recorders.add(r.recorderKey);
      byCorr.set(code, existing);
    }

    const total = [...byCorr.values()].reduce((s, v) => s + v.total, 0);

    // Resolve recorder metadata for each group
    const sources: COGSCompositionSource[] = [];
    for (const [code, data] of [...byCorr.entries()].sort((a, b) => b[1].total - a[1].total)) {
      const meta = ACCOUNT_CATEGORY[code] ?? { name: `Счёт ${code}`, category: "other" };
      const guids = [...data.recorders].slice(0, perCategoryDocLimit);
      const docs = await this.resolveRecorderDocs(guids);
      sources.push({
        corrAccountCode: code,
        accountName: meta.name,
        category: meta.category,
        totalAmount: Math.round(data.total * 100) / 100,
        pctOfTotal: total > 0 ? Math.round((data.total / total) * 1000) / 10 : 0,
        sampleDocuments: docs,
      });
    }

    return {
      period: { from: dateFrom, to: dateTo },
      organizationGuid,
      sources,
      total: Math.round(total * 100) / 100,
      note: "Суммы показывают, что входило в 8110/8112 (Дт) и было впоследствии капитализировано в 1320 при оприходовании урожая. See kz-agro-costing-flow.md.",
    };
  }

  private async resolveCatalogNames(guids: string[], catalog: string): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const unique = [...new Set(guids.filter(Boolean))];
    for (let i = 0; i < unique.length; i += BATCH) {
      const batch = unique.slice(i, i + BATCH);
      const rows = await this.client.getCollection<{ Ref_Key: string; Description?: string }>(
        catalog,
        { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH },
      ).catch(() => []);
      for (const r of rows) map.set(r.Ref_Key, r.Description ?? r.Ref_Key.slice(0, 8));
    }
    return map;
  }

  async getRealProductionCosts(
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
    productionAccountCode = "8112",
    wipAccountCode = "1341",
    finishedGoodsAccountCode = "1320",
  ): Promise<RealProductionCostsResult> {
    const [guidProd, guidWip, guidFG] = await Promise.all([
      this.register.resolveAccountGuid(productionAccountCode),
      this.register.resolveAccountGuid(wipAccountCode),
      this.register.resolveAccountGuid(finishedGoodsAccountCode),
    ]);
    if (!guidProd) throw new Error(`Account ${productionAccountCode} not found`);

    const orgFilter = organizationGuid ? ` and Организация_Key eq guid'${organizationGuid}'` : "";
    type TRow = { BalancedAccount_Key?: string; ExtDimension2?: string; ExtDimension3?: string; СуммаTurnoverDr?: number; СуммаTurnoverCr?: number };
    const rows = await this.client.getRegisterTurnovers<TRow>("AccountingRegister_Типовой", {
      filter: `Account_Key eq guid'${guidProd}'${orgFilter}`,
      select: "BalancedAccount_Key,ExtDimension2,ExtDimension3,СуммаTurnoverDr,СуммаTurnoverCr",
      StartPeriod: `${dateFrom}T00:00:00`,
      EndPeriod:   `${dateTo}T23:59:59`,
      top: 10000,
    }).catch(() => [] as TRow[]);

    const r2 = (n: number) => Math.round(n * 100) / 100;
    let reOpening = 0, closingToWip = 0, totalRawDr = 0;
    const costMap = new Map<string, number>();
    const harvestMap = new Map<string, number>();

    for (const row of rows) {
      const dr = row.СуммаTurnoverDr ?? 0;
      const cr = row.СуммаTurnoverCr ?? 0;
      const bal = row.BalancedAccount_Key ?? "";
      totalRawDr += dr;

      if (dr > 0) {
        if (bal === guidWip) {
          reOpening += dr;
        } else {
          const key = row.ExtDimension3 ?? "__none__";
          costMap.set(key, (costMap.get(key) ?? 0) + dr);
        }
      }
      if (cr > 0 && bal === guidWip) closingToWip += cr;
      if (cr > 0 && bal === guidFG) {
        const key = row.ExtDimension2 ?? "__none__";
        harvestMap.set(key, (harvestMap.get(key) ?? 0) + cr);
      }
    }

    const [costNames, harvestNames] = await Promise.all([
      this.resolveCatalogNames([...costMap.keys()].filter(k => k !== "__none__"), "Catalog_СтатьиЗатрат"),
      this.resolveCatalogNames([...harvestMap.keys()].filter(k => k !== "__none__"), "Catalog_НоменклатурныеГруппы"),
    ]);

    const realTotal = [...costMap.values()].reduce((s, v) => s + v, 0);
    const harvestTotal = [...harvestMap.values()].reduce((s, v) => s + v, 0);

    const byCostItem: CostItemEntry[] = [...costMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([guid, amt]) => ({
        costItemGuid: guid === "__none__" ? "" : guid,
        costItemName: guid === "__none__" ? "Без статьи затрат" : (costNames.get(guid) ?? guid.slice(0, 8)),
        amount: r2(amt),
        pctOfTotal: realTotal > 0 ? Math.round((amt / realTotal) * 1000) / 10 : 0,
      }));

    const byProduct: HarvestEntry[] = [...harvestMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([guid, amt]) => ({
        productGroupGuid: guid === "__none__" ? "" : guid,
        productGroupName: guid === "__none__" ? "Без группы" : (harvestNames.get(guid) ?? guid.slice(0, 8)),
        amount: r2(amt),
        pctOfTotal: harvestTotal > 0 ? Math.round((amt / harvestTotal) * 1000) / 10 : 0,
      }));

    return {
      period: { from: dateFrom, to: dateTo },
      productionAccount: productionAccountCode,
      wipAccount: wipAccountCode,
      finishedGoodsAccount: finishedGoodsAccountCode,
      realCosts: { total: r2(realTotal), byCostItem },
      wipPingPong: { reOpening: r2(reOpening), closingToWip: r2(closingToWip) },
      harvestCapitalized: { total: r2(harvestTotal), byProduct },
      crossCheck: {
        realCosts: r2(realTotal),
        harvestCapitalized: r2(harvestTotal),
        wipNetIncrease: r2(realTotal - harvestTotal),
        note: "wipNetIncrease = costs that stayed in WIP (pre-season НЗП) = WIP balance increase for the period.",
      },
      totalRawDebitTurnover: r2(totalRawDr),
      note: `realCosts excludes НЗП re-opening (${productionAccountCode}←${wipAccountCode}) to eliminate ping-pong inflation. Works for any 1C manufacturing: set productionAccountCode to 2010/2020/etc, wipAccountCode to 2110/2120/etc, finishedGoodsAccountCode to 4300/etc.`,
    };
  }

  private async resolveNomenclatureDetails(guid: string): Promise<{ name: string; unit: string }> {
    const rows = await this.client.getCollection<{
      Ref_Key: string;
      Description?: string;
      БазоваяЕдиницаИзмерения_Key?: string;
    }>("Catalog_Номенклатура", {
      filter: `Ref_Key eq guid'${guid}'`,
      select: "Ref_Key,Description,БазоваяЕдиницаИзмерения_Key",
      top: 1,
    }).catch(() => []);

    if (!rows.length) return { name: guid.slice(0, 8), unit: "" };
    const row = rows[0];
    const unitKey = row.БазоваяЕдиницаИзмерения_Key ?? "";
    let unit = "";
    if (unitKey) {
      const uRows = await this.client.getCollection<{ Ref_Key: string; Description?: string }>(
        "Catalog_ЕдиницыИзмерения",
        { filter: `Ref_Key eq guid'${unitKey}'`, select: "Ref_Key,Description", top: 1 },
      ).catch(() => []);
      unit = uRows[0]?.Description ?? "";
    }
    return { name: row.Description ?? guid.slice(0, 8), unit };
  }

  private async resolveRecorderDocs(
    guids: string[],
  ): Promise<{ guid: string; number: string; date: string; type: string; contractor?: string }[]> {
    if (!guids.length) return [];
    const found = new Map<string, { number: string; date: string; type: string; contractor?: string }>();

    for (const docType of RECORDER_DOC_TYPES) {
      const remaining = guids.filter(g => !found.has(g));
      if (!remaining.length) break;

      for (let i = 0; i < remaining.length; i += BATCH) {
        const batch = remaining.slice(i, i + BATCH);
        const filter = batch.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
        const rows = await this.client.getCollection<{
          Ref_Key: string;
          Number?: string;
          Date?: string;
          Контрагент_Key?: string;
        }>(`Document_${docType}`, {
          filter,
          select: "Ref_Key,Number,Date,Контрагент_Key",
          top: BATCH,
        }).catch(() => []);

        for (const r of rows) {
          if (!found.has(r.Ref_Key)) {
            found.set(r.Ref_Key, {
              number:     r.Number ?? "",
              date:       r.Date?.slice(0, 10) ?? "",
              type:       docType,
              contractor: r.Контрагент_Key,
            });
          }
        }
      }
    }

    // Resolve contractor names for found docs
    const contractorGuids = [...new Set([...found.values()].map(d => d.contractor).filter(Boolean) as string[])];
    const contractorNames = new Map<string, string>();
    for (let i = 0; i < contractorGuids.length; i += BATCH) {
      const batch = contractorGuids.slice(i, i + BATCH);
      const rows = await this.client.getCollection<{ Ref_Key: string; Description?: string }>(
        "Catalog_Контрагенты",
        { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH },
      ).catch(() => []);
      for (const r of rows) contractorNames.set(r.Ref_Key, r.Description ?? "");
    }

    return guids
      .filter(g => found.has(g))
      .map(g => {
        const d = found.get(g)!;
        return {
          guid:       g,
          number:     d.number,
          date:       d.date,
          type:       d.type,
          contractor: d.contractor ? contractorNames.get(d.contractor) : undefined,
        };
      });
  }
}
