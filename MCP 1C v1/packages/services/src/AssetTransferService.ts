import type { OneCClient } from "@aibos/onec-client";

export interface AssetTransfer {
  documentGuid: string;
  documentDate: string;
  documentNumber: string;
  assetGuid: string;
  fromDepartment: string;
  toDepartment: string;
  fromOrgGuid: string;
  toOrgGuid: string;
  transferType: "FA" | "NMA";
  amount: number;
}

type FaTransferRow = {
  Ref_Key: string;
  Date: string;
  Number: string;
  ОсновноеСредство_Key?: string;
  ПодразделениеОтправитель_Key?: string;
  ПодразделениеПолучатель_Key?: string;
  Организация_Key?: string;
  ОрганизацияПолучатель_Key?: string;
  Сумма?: number;
};

type NmaTransferRow = {
  Ref_Key: string;
  Date: string;
  Number: string;
  НМА_Key?: string;
  Организация_Key?: string;
  Сумма?: number;
};

export class AssetTransferService {
  constructor(private readonly client: OneCClient) {}

  async getFaTransfers(
    periodFrom: string,
    periodTo: string,
    organizationGuid?: string,
  ): Promise<{ transfers: AssetTransfer[]; totalTransferred: number; period: { from: string; to: string } }> {
    const filters = [
      `Date ge datetime'${periodFrom}T00:00:00'`,
      `Date le datetime'${periodTo}T23:59:59'`,
      "DeletionMark eq false",
      "Posted eq true",
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const docs = await this.client.getCollection<FaTransferRow>("Document_ПередачаОС", {
      filter: filters.join(" and "),
      select: "Ref_Key,Date,Number,ОсновноеСредство_Key,ПодразделениеОтправитель_Key,ПодразделениеПолучатель_Key,Организация_Key,ОрганизацияПолучатель_Key,Сумма",
      orderby: "Date desc",
      top: 500,
    }).catch(() => [] as FaTransferRow[]);

    const transfers: AssetTransfer[] = docs.map(d => ({
      documentGuid: d.Ref_Key,
      documentDate: d.Date?.slice(0, 10) ?? "",
      documentNumber: d.Number ?? "",
      assetGuid: d.ОсновноеСредство_Key ?? "",
      fromDepartment: d.ПодразделениеОтправитель_Key ?? "",
      toDepartment: d.ПодразделениеПолучатель_Key ?? "",
      fromOrgGuid: d.Организация_Key ?? "",
      toOrgGuid: d.ОрганизацияПолучатель_Key ?? "",
      transferType: "FA" as const,
      amount: d.Сумма ?? 0,
    }));

    return {
      transfers,
      totalTransferred: transfers.reduce((s, t) => s + t.amount, 0),
      period: { from: periodFrom, to: periodTo },
    };
  }

  async getNmaTransfers(
    periodFrom: string,
    periodTo: string,
    organizationGuid?: string,
  ): Promise<{ transfers: AssetTransfer[]; totalTransferred: number; period: { from: string; to: string } }> {
    const filters = [
      `Date ge datetime'${periodFrom}T00:00:00'`,
      `Date le datetime'${periodTo}T23:59:59'`,
      "DeletionMark eq false",
      "Posted eq true",
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const docs = await this.client.getCollection<NmaTransferRow>("Document_ПередачаНМА", {
      filter: filters.join(" and "),
      select: "Ref_Key,Date,Number,НМА_Key,Организация_Key,Сумма",
      orderby: "Date desc",
      top: 500,
    }).catch(() => [] as NmaTransferRow[]);

    const transfers: AssetTransfer[] = docs.map(d => ({
      documentGuid: d.Ref_Key,
      documentDate: d.Date?.slice(0, 10) ?? "",
      documentNumber: d.Number ?? "",
      assetGuid: d.НМА_Key ?? "",
      fromDepartment: "",
      toDepartment: "",
      fromOrgGuid: d.Организация_Key ?? "",
      toOrgGuid: "",
      transferType: "NMA" as const,
      amount: d.Сумма ?? 0,
    }));

    return {
      transfers,
      totalTransferred: transfers.reduce((s, t) => s + t.amount, 0),
      period: { from: periodFrom, to: periodTo },
    };
  }
}
