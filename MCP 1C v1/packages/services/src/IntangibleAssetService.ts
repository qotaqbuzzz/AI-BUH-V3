import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface NmaEntry {
  assetGuid: string;
  assetName: string;
  inventoryNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLifeMonths: number;
  amortizationMethod: string;
  accumulatedAmortization: number;
  netBookValue: number;
  status: string;
}

export interface NmaAmortizationEntry {
  period: string;
  amortizationAmount: number;
  accumulated: number;
  remainingValue: number;
}

type NmaRow = {
  Ref_Key: string;
  Description: string;
  ИнвентарныйНомер?: string;
  ДатаПринятияКУчету?: string;
  ПервоначальнаяСтоимость?: number;
  СрокПолезногоИспользованияВМесяцах?: number;
  СпособНачисленияАмортизации?: string;
  Статус?: string;
};

export class IntangibleAssetService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getNmaRegister(
    asOfDate: string,
    organizationGuid?: string,
  ): Promise<{ assets: NmaEntry[]; glBalance2700: number; registerTotal: number; glMismatch: boolean }> {
    const filters: string[] = ["DeletionMark eq false"];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const assets = await this.client.getCollection<NmaRow>("Catalog_НематериальныеАктивы", {
      filter: filters.join(" and "),
      select: "Ref_Key,Description,ИнвентарныйНомер,ДатаПринятияКУчету,ПервоначальнаяСтоимость,СрокПолезногоИспользованияВМесяцах,СпособНачисленияАмортизации,Статус",
      top: 1000,
    }).catch(() => [] as NmaRow[]);

    const bal2700 = await this.register.getAccountBalance("2700", organizationGuid, asOfDate).catch(() => ({ debitBalance: 0 }));

    const entries: NmaEntry[] = assets.map(a => {
      const cost = a.ПервоначальнаяСтоимость ?? 0;
      return {
        assetGuid: a.Ref_Key,
        assetName: a.Description ?? "",
        inventoryNumber: a.ИнвентарныйНомер ?? "",
        acquisitionDate: a.ДатаПринятияКУчету?.slice(0, 10) ?? "",
        acquisitionCost: cost,
        usefulLifeMonths: a.СрокПолезногоИспользованияВМесяцах ?? 0,
        amortizationMethod: a.СпособНачисленияАмортизации ?? "",
        accumulatedAmortization: 0,
        netBookValue: cost,
        status: a.Статус ?? "active",
      };
    });

    const registerTotal = entries.reduce((s, a) => s + a.acquisitionCost, 0);
    const glBalance2700 = bal2700.debitBalance;
    const glMismatch = Math.abs(registerTotal - glBalance2700) > 0.01;

    return { assets: entries, glBalance2700, registerTotal, glMismatch };
  }

  async getNmaAmortizationSchedule(
    assetGuid: string,
    periodFrom: string,
    periodTo: string,
  ): Promise<{ assetGuid: string; entries: NmaAmortizationEntry[] }> {
    const rows = await this.client.getCollection<{ Период?: string; СуммаАмортизации?: number }>(
      "InformationRegister_НачислениеАмортизацииНМАБухгалтерскийУчет",
      {
        filter: `НМА_Key eq guid'${assetGuid}' and Период ge datetime'${periodFrom}T00:00:00' and Период le datetime'${periodTo}T23:59:59'`,
        select: "Период,СуммаАмортизации",
        orderby: "Период asc",
        top: 120,
      },
    ).catch(() => [] as { Период?: string; СуммаАмортизации?: number }[]);

    let accumulated = 0;
    const entries: NmaAmortizationEntry[] = rows.map(r => {
      const amount = r.СуммаАмортизации ?? 0;
      accumulated += amount;
      return { period: r.Период?.slice(0, 10) ?? "", amortizationAmount: amount, accumulated, remainingValue: 0 };
    });

    return { assetGuid, entries };
  }
}
