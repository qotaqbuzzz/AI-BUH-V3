import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "./RegisterService.js";

export interface FAEntry {
  assetGuid: string;
  assetName: string;
  inventoryNumber: string;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLifeMonths: number;
  depreciationMethod: string;
  accumulatedDepreciation: number;
  netBookValue: number;
  location: string;
  status: string;
}

export interface DepreciationScheduleEntry {
  period: string;
  depreciationAmount: number;
  accumulated: number;
  remainingValue: number;
}

export interface ImpairmentIndicator {
  assetGuid: string;
  assetName: string;
  netBookValue: number;
  usefulLifeExceeded: boolean;
  ageMonths: number;
  usefulLifeMonths: number;
  flag: string;
}

export class FixedAssetService {
  constructor(
    private readonly client: OneCClient,
    private readonly register: RegisterService,
  ) {}

  async getFixedAssetRegister(
    asOfDate: string,
    organizationGuid?: string,
    departmentGuid?: string,
    status?: string,
  ): Promise<{ assets: FAEntry[]; glBalance2410: number; glBalance2420: number; registerTotal: number; glMismatch: boolean }> {
    const filters: string[] = ["DeletionMark eq false"];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const assets = await this.client.getCollection<{
      Ref_Key: string;
      Description: string;
      ИнвентарныйНомер?: string;
      ДатаПринятияКУчету?: string;
      ПервоначальнаяСтоимость?: number;
      СрокПолезногоИспользованияВМесяцах?: number;
      СпособНачисленияАмортизации?: string;
      Подразделение_Key?: string;
      Статус?: string;
    }>("Catalog_ОсновныеСредства", {
      filter: filters.join(" and "),
      select: "Ref_Key,Description,ИнвентарныйНомер,ДатаПринятияКУчету,ПервоначальнаяСтоимость,СрокПолезногоИспользованияВМесяцах,СпособНачисленияАмортизации,Подразделение_Key,Статус",
      top: 1000,
    });

    const [bal2410, bal2420] = await Promise.all([
      this.register.getAccountBalance("2410", organizationGuid, asOfDate),
      this.register.getAccountBalance("2420", organizationGuid, asOfDate),
    ]);

    let filtered = assets;
    if (departmentGuid) filtered = filtered.filter(a => a.Подразделение_Key === departmentGuid);
    if (status) filtered = filtered.filter(a => (a.Статус ?? "").toLowerCase() === status.toLowerCase());

    const entries: FAEntry[] = filtered.map(a => {
      const acqCost = a.ПервоначальнаяСтоимость ?? 0;
      return {
        assetGuid: a.Ref_Key,
        assetName: a.Description ?? "",
        inventoryNumber: a.ИнвентарныйНомер ?? "",
        acquisitionDate: a.ДатаПринятияКУчету?.slice(0, 10) ?? "",
        acquisitionCost: acqCost,
        usefulLifeMonths: a.СрокПолезногоИспользованияВМесяцах ?? 0,
        depreciationMethod: a.СпособНачисленияАмортизации ?? "",
        accumulatedDepreciation: 0,
        netBookValue: acqCost,
        location: a.Подразделение_Key ?? "",
        status: a.Статус ?? "active",
      };
    });

    const registerTotal = entries.reduce((s, a) => s + a.acquisitionCost, 0);
    const glBalance2410 = bal2410.debitBalance;
    const glBalance2420 = bal2420.debitBalance;
    const glMismatch = Math.abs(registerTotal - (glBalance2410 + glBalance2420)) > 0.01;

    return { assets: entries, glBalance2410, glBalance2420, registerTotal, glMismatch };
  }

  async getDepreciationSchedule(
    assetGuid: string,
    periodFrom: string,
    periodTo: string,
  ): Promise<{ assetGuid: string; entries: DepreciationScheduleEntry[] }> {
    const rows = await this.client.getCollection<{
      Период?: string;
      СуммаАмортизации?: number;
    }>("InformationRegister_НачислениеАмортизацииОСБухгалтерскийУчет", {
      filter: `ОсновноеСредство_Key eq guid'${assetGuid}' and Период ge datetime'${periodFrom}T00:00:00' and Период le datetime'${periodTo}T23:59:59'`,
      select: "Период,СуммаАмортизации",
      orderby: "Период asc",
      top: 120,
    }).catch(() => [] as { Период?: string; СуммаАмортизации?: number }[]);

    let accumulated = 0;
    const entries: DepreciationScheduleEntry[] = rows.map(r => {
      const amount = r.СуммаАмортизации ?? 0;
      accumulated += amount;
      return { period: r.Период?.slice(0, 10) ?? "", depreciationAmount: amount, accumulated, remainingValue: 0 };
    });

    return { assetGuid, entries };
  }

  async analyzeDepreciationImpact(
    periodFrom: string,
    periodTo: string,
    organizationGuid?: string,
  ): Promise<{ totalDepreciation: number; glExpense7210: number; glExpense8110: number; period: { from: string; to: string } }> {
    const [acc7210, acc8110, rows] = await Promise.all([
      this.register.getAccountTurnovers("7210", periodFrom, periodTo, organizationGuid),
      this.register.getAccountTurnovers("8110", periodFrom, periodTo, organizationGuid),
      this.client.getCollection<{ СуммаАмортизации?: number }>(
        "InformationRegister_НачислениеАмортизацииОСБухгалтерскийУчет",
        { filter: `Период ge datetime'${periodFrom}T00:00:00' and Период le datetime'${periodTo}T23:59:59'`, select: "СуммаАмортизации", top: 10000 },
      ).catch(() => [] as { СуммаАмортизации?: number }[]),
    ]);

    return {
      totalDepreciation: rows.reduce((s, r) => s + (r.СуммаАмортизации ?? 0), 0),
      glExpense7210: acc7210.debitTurnover,
      glExpense8110: acc8110.debitTurnover,
      period: { from: periodFrom, to: periodTo },
    };
  }

  async getImpairmentIndicators(asOfDate: string, organizationGuid?: string): Promise<ImpairmentIndicator[]> {
    const filters: string[] = ["DeletionMark eq false"];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const assets = await this.client.getCollection<{
      Ref_Key: string;
      Description: string;
      ДатаПринятияКУчету?: string;
      ПервоначальнаяСтоимость?: number;
      СрокПолезногоИспользованияВМесяцах?: number;
    }>("Catalog_ОсновныеСредства", {
      filter: filters.join(" and "),
      select: "Ref_Key,Description,ДатаПринятияКУчету,ПервоначальнаяСтоимость,СрокПолезногоИспользованияВМесяцах",
      top: 1000,
    });

    const now = new Date(asOfDate);
    return assets
      .filter(a => {
        const acqDate = a.ДатаПринятияКУчету ? new Date(a.ДатаПринятияКУчету) : null;
        if (!acqDate) return false;
        const ageMonths = Math.floor((now.getTime() - acqDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const usefulLife = a.СрокПолезногоИспользованияВМесяцах ?? 0;
        return usefulLife > 0 && ageMonths > usefulLife;
      })
      .map(a => {
        const acqDate = new Date(a.ДатаПринятияКУчету!);
        const ageMonths = Math.floor((now.getTime() - acqDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        return {
          assetGuid: a.Ref_Key,
          assetName: a.Description ?? "",
          netBookValue: a.ПервоначальнаяСтоимость ?? 0,
          usefulLifeExceeded: true,
          ageMonths,
          usefulLifeMonths: a.СрокПолезногоИспользованияВМесяцах ?? 0,
          flag: "USEFUL_LIFE_EXCEEDED",
        };
      });
  }

  async getDisposalCandidates(asOfDate: string, organizationGuid?: string): Promise<FAEntry[]> {
    const impaired = await this.getImpairmentIndicators(asOfDate, organizationGuid);
    return impaired.map(i => ({
      assetGuid: i.assetGuid,
      assetName: i.assetName,
      inventoryNumber: "",
      acquisitionDate: "",
      acquisitionCost: i.netBookValue,
      usefulLifeMonths: i.usefulLifeMonths,
      depreciationMethod: "",
      accumulatedDepreciation: 0,
      netBookValue: i.netBookValue,
      location: "",
      status: "disposal_candidate",
    }));
  }

  async getAssetLocationAudit(organizationGuid?: string): Promise<{
    assetGuid: string;
    assetName: string;
    registeredLocation: string;
    inventoryLocation: string;
    mismatch: boolean;
  }[]> {
    const filters: string[] = ["DeletionMark eq false"];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const [assets, locationRows] = await Promise.all([
      this.client.getCollection<{ Ref_Key: string; Description: string; Подразделение_Key?: string }>(
        "Catalog_ОсновныеСредства",
        { filter: filters.join(" and "), select: "Ref_Key,Description,Подразделение_Key", top: 1000 },
      ),
      this.client.getSliceLast<{ ОсновноеСредство_Key?: string; МестоНахождения_Key?: string }>(
        "InformationRegister_МестонахождениеОСБухгалтерскийУчет",
        { select: "ОсновноеСредство_Key,МестоНахождения_Key" },
      ).catch(() => [] as { ОсновноеСредство_Key?: string; МестоНахождения_Key?: string }[]),
    ]);

    const locationMap = new Map<string, string>();
    for (const r of locationRows) {
      if (r.ОсновноеСредство_Key) locationMap.set(r.ОсновноеСредство_Key, r.МестоНахождения_Key ?? "");
    }

    return assets.map(a => {
      const registered = a.Подразделение_Key ?? "";
      const inventory = locationMap.get(a.Ref_Key) ?? "";
      return {
        assetGuid: a.Ref_Key,
        assetName: a.Description ?? "",
        registeredLocation: registered,
        inventoryLocation: inventory,
        mismatch: inventory !== "" && registered !== inventory,
      };
    });
  }

  async validateFaCompleteness(asOfDate: string, organizationGuid?: string): Promise<{
    passed: boolean;
    registerTotal: number;
    glBalance: number;
    difference: number;
    assetsWithoutDepreciation: number;
    issues: string[];
  }> {
    const { registerTotal, glBalance2410, glBalance2420, assets } = await this.getFixedAssetRegister(asOfDate, organizationGuid);
    const glBalance = glBalance2410 + glBalance2420;
    const difference = Math.abs(registerTotal - glBalance);
    const issues: string[] = [];

    if (difference > 0.01) issues.push(`Расхождение между регистром ОС и счётами 2410/2420: ${difference.toFixed(2)} тг`);
    const assetsWithoutDepreciation = assets.filter(a => a.usefulLifeMonths > 0 && a.accumulatedDepreciation === 0).length;
    if (assetsWithoutDepreciation > 0) issues.push(`${assetsWithoutDepreciation} ОС с ненулевым СПИ не имеют начисленной амортизации`);

    return { passed: issues.length === 0, registerTotal, glBalance, difference, assetsWithoutDepreciation, issues };
  }
}
