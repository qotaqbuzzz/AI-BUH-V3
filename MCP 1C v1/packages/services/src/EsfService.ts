import type { OneCClient } from "@aibos/onec-client";

export interface EsfStatusSummary {
  period: { from: string; to: string };
  total: number;
  submitted: number;
  rejected: number;
  pending: number;
  totalAmount: number;
  totalVat: number;
  rejectionRate: number;
}

export interface EsfError {
  documentGuid: string;
  documentNumber: string;
  documentDate: string;
  counterpartyGuid: string;
  errorCode: string;
  errorMessage: string;
  status: string;
}

type EsfRow = {
  Ref_Key: string;
  Number: string;
  Date: string;
  СтатусОбмена?: string;
  Статус?: string;
  Контрагент_Key?: string;
  Организация_Key?: string;
  СуммаДокумента?: number;
  СуммаНДС?: number;
};

type EsfErrorRow = {
  Ref_Key?: string;
  КодОшибки?: string;
  ТекстОшибки?: string;
  ОписаниеОшибки?: string;
};

const STATUS_SUBMITTED = ["отправлен", "принят", "submitted", "accepted", "доставлен"];
const STATUS_REJECTED  = ["отклонен", "rejected", "ошибка", "error", "отказ"];

function classifyStatus(raw?: string): "submitted" | "rejected" | "pending" {
  if (!raw) return "pending";
  const s = raw.toLowerCase();
  if (STATUS_REJECTED.some(r => s.includes(r)))  return "rejected";
  if (STATUS_SUBMITTED.some(r => s.includes(r))) return "submitted";
  return "pending";
}

export class EsfService {
  constructor(private readonly client: OneCClient) {}

  async getEsfSubmissionStatus(
    periodFrom: string,
    periodTo: string,
    organizationGuid?: string,
  ): Promise<EsfStatusSummary> {
    const filters = [
      `Date ge datetime'${periodFrom}T00:00:00'`,
      `Date le datetime'${periodTo}T23:59:59'`,
      "DeletionMark eq false",
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const rows = await this.client.getCollection<EsfRow>("Document_ЭСФ", {
      filter: filters.join(" and "),
      select: "Ref_Key,Number,Date,СтатусОбмена,Статус,Организация_Key,СуммаДокумента,СуммаНДС",
      top: 2000,
    }).catch(() => [] as EsfRow[]);

    let submitted = 0, rejected = 0, pending = 0;
    let totalAmount = 0, totalVat = 0;

    for (const r of rows) {
      const cls = classifyStatus(r.СтатусОбмена ?? r.Статус);
      if (cls === "submitted") submitted++;
      else if (cls === "rejected") rejected++;
      else pending++;
      totalAmount += r.СуммаДокумента ?? 0;
      totalVat    += r.СуммаНДС ?? 0;
    }

    return {
      period: { from: periodFrom, to: periodTo },
      total: rows.length,
      submitted,
      rejected,
      pending,
      totalAmount,
      totalVat,
      rejectionRate: rows.length > 0 ? Math.round((rejected / rows.length) * 10000) / 100 : 0,
    };
  }

  async getEsfErrors(
    periodFrom: string,
    periodTo: string,
    organizationGuid?: string,
  ): Promise<{ errors: EsfError[]; total: number; period: { from: string; to: string } }> {
    const filters = [
      `Date ge datetime'${periodFrom}T00:00:00'`,
      `Date le datetime'${periodTo}T23:59:59'`,
      "DeletionMark eq false",
    ];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    // Fetch rejected ESF documents first
    const docs = await this.client.getCollection<EsfRow>("Document_ЭСФ", {
      filter: filters.join(" and "),
      select: "Ref_Key,Number,Date,СтатусОбмена,Статус,Контрагент_Key",
      top: 500,
    }).catch(() => [] as EsfRow[]);

    const rejectedDocs = docs.filter(d => classifyStatus(d.СтатусОбмена ?? d.Статус) === "rejected");

    // Fetch error subtable entries for rejected docs (batch limited to 50 docs)
    const errorPromises = rejectedDocs.slice(0, 50).map(async doc => {
      const errs = await this.client.getCollection<EsfErrorRow>(
        "Document_ЭСФ_ЭСФ_Ошибки",
        {
          filter: `Ref_Key eq guid'${doc.Ref_Key}'`,
          select: "КодОшибки,ТекстОшибки,ОписаниеОшибки",
          top: 10,
        },
      ).catch(() => [] as EsfErrorRow[]);

      if (errs.length === 0) {
        return [{
          documentGuid: doc.Ref_Key,
          documentNumber: doc.Number ?? "",
          documentDate: doc.Date?.slice(0, 10) ?? "",
          counterpartyGuid: doc.Контрагент_Key ?? "",
          errorCode: "REJECTED",
          errorMessage: "ЭСФ отклонён — детали ошибок недоступны",
          status: doc.СтатусОбмена ?? doc.Статус ?? "",
        } as EsfError];
      }

      return errs.map(e => ({
        documentGuid: doc.Ref_Key,
        documentNumber: doc.Number ?? "",
        documentDate: doc.Date?.slice(0, 10) ?? "",
        counterpartyGuid: doc.Контрагент_Key ?? "",
        errorCode: e.КодОшибки ?? "",
        errorMessage: e.ТекстОшибки ?? e.ОписаниеОшибки ?? "",
        status: doc.СтатусОбмена ?? doc.Статус ?? "",
      } as EsfError));
    });

    const nested = await Promise.all(errorPromises);
    const errors = nested.flat();

    return { errors, total: errors.length, period: { from: periodFrom, to: periodTo } };
  }
}
