import type { OneCClient } from "@aibos/onec-client";
import { validateAccountCode } from "@aibos/onec-client";
import { detectCorrespondenceRisks, type CorrespondenceRisk } from "./validation/CorrespondenceRules.js";

const r2 = (n: number) => Math.round(n * 100) / 100;

export type { CorrespondenceRisk };

export interface CorrAccountEntry {
  corrAccount: string;
  corrAccountName: string;
  turnoverDr: number;
  turnoverCr: number;
  shareDrPct: number;
  shareCrPct: number;
  /** Document types (Recorder_Type, prefix stripped) that drove these postings */
  docTypes: string[];
}

export interface SubcontoEntry {
  dim1: string;
  dim1Name: string;
  dim2: string;
  dim2Name: string;
  balanceDr: number;
  balanceCr: number;
  net: number;
}

export interface MonthEntry {
  month: string;
  turnoverDr: number;
  turnoverCr: number;
  closingBalance: number;
}

export interface AccountAnalysisResult {
  accountCode: string;
  accountName: string;
  period: { from: string; to: string };
  summary: {
    openingBalance: number;
    debitTurnover: number;
    creditTurnover: number;
    closingBalance: number;
  };
  byCorrAccount: CorrAccountEntry[];
  bySubconto: SubcontoEntry[];
  monthlyTrend: MonthEntry[];
  /**
   * Detected accounting errors / risks based on corr-account correspondences.
   * Empty array = no issues found. Non-empty = show every item to the user
   * with severity flag and suggestedFix.
   */
  risks: CorrespondenceRisk[];
  /**
   * Data-quality warnings emitted when the response contains suspicious inconsistencies
   * (e.g. non-zero turnovers but empty byCorrAccount — classic field-name bug signal).
   * Empty = clean. Non-empty = investigate before trusting the data.
   */
  dataWarnings: string[];
  meta: {
    recordsScanned: number;
    corrAccountTruncated: boolean;
  };
}

// Catalogs tried in order when resolving subconto GUIDs
const DIM_CATALOGS = [
  "Catalog_Номенклатура",
  "Catalog_Контрагенты",
  "Catalog_Подразделения",
  "Catalog_Склады",
  "Catalog_СтатьиЗатрат",
  "Catalog_ФизическиеЛица",
  "Catalog_ДоговорыКонтрагентов",
  "Catalog_ВидыОперацийДвиженияДенежныхСредств",
];

function buildMonthRange(dateFrom: string, dateTo: string): { label: string; from: string; to: string }[] {
  const months: { label: string; from: string; to: string }[] = [];
  const parts0 = dateFrom.split("-");
  const parts1 = dateTo.split("-");
  let y = parseInt(parts0[0] ?? "2025", 10);
  let m = parseInt(parts0[1] ?? "1", 10);
  const yEnd = parseInt(parts1[0] ?? "2025", 10);
  const mEnd = parseInt(parts1[1] ?? "12", 10);
  while (y < yEnd || (y === yEnd && m <= mEnd)) {
    const label = `${y}-${String(m).padStart(2, "0")}`;
    const lastDay = new Date(y, m, 0).getDate();
    months.push({ label, from: `${label}-01`, to: `${label}-${String(lastDay).padStart(2, "0")}` });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return months;
}

export class AccountAnalysisService {
  constructor(private readonly client: OneCClient) {}

  private async resolveAccount(accountCode: string): Promise<{ guid: string; name: string } | null> {
    const rows = await this.client.getCollection<{ Ref_Key: string; Code: string; Description: string }>(
      "ChartOfAccounts_Типовой",
      { filter: `Code eq '${validateAccountCode(accountCode)}'`, select: "Ref_Key,Code,Description", top: 1 },
    ).catch(() => []);
    if (!rows[0]) return null;
    return { guid: rows[0].Ref_Key, name: rows[0].Description ?? accountCode };
  }

  private async resolveAccountCodes(guids: string[]): Promise<Map<string, { code: string; name: string }>> {
    const map = new Map<string, { code: string; name: string }>();
    const unique = [...new Set(guids.filter(g => g && g !== "__unknown__"))];
    for (let i = 0; i < unique.length; i += 20) {
      const batch = unique.slice(i, i + 20);
      const rows = await this.client.getCollection<{ Ref_Key: string; Code: string; Description: string }>(
        "ChartOfAccounts_Типовой",
        { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Code,Description", top: 20 },
      ).catch(() => []);
      for (const r of rows) map.set(r.Ref_Key, { code: r.Code ?? "", name: r.Description ?? "" });
    }
    return map;
  }

  private async resolveDimNames(guids: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const unique = [...new Set(guids.filter(Boolean))];
    if (!unique.length) return map;

    for (let i = 0; i < unique.length; i += 10) {
      const batch = unique.slice(i, i + 10);
      const remaining = batch.filter(g => !map.has(g));
      if (!remaining.length) continue;
      const filter = remaining.map(g => `Ref_Key eq guid'${g}'`).join(" or ");

      for (const catalog of DIM_CATALOGS) {
        if (remaining.every(g => map.has(g))) break;
        const rows = await this.client.getCollection<{ Ref_Key: string; Description: string }>(
          catalog, { filter, select: "Ref_Key,Description", top: remaining.length },
        ).catch(() => []);
        for (const r of rows) if (!map.has(r.Ref_Key)) map.set(r.Ref_Key, r.Description ?? "");
      }
    }
    return map;
  }

  async analyzeAccount(
    accountCode: string,
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<AccountAnalysisResult> {
    const acc = await this.resolveAccount(accountCode);
    if (!acc) {
      return {
        accountCode, accountName: `Счёт ${accountCode} не найден`,
        period: { from: dateFrom, to: dateTo },
        summary: { openingBalance: 0, debitTurnover: 0, creditTurnover: 0, closingBalance: 0 },
        byCorrAccount: [], bySubconto: [], monthlyTrend: [],
        risks: [], dataWarnings: [`Счёт ${accountCode} не найден в ChartOfAccounts_Типовой`],
        meta: { recordsScanned: 0, corrAccountTruncated: false },
      };
    }

    const orgFilter = organizationGuid ? ` and Организация_Key eq guid'${organizationGuid}'` : "";
    const periodFrom = `${dateFrom}T00:00:00`;
    const periodTo   = `${dateTo}T23:59:59`;
    const RECORD_LIMIT = 5000;

    // ── 1. Summary ────────────────────────────────────────────────────────────
    // For equity/income accounts (5xxx, 6xxx, 7xxx) BalanceAndTurnovers often
    // returns zero opening balance because period-close entries bypass the normal
    // document flow. We use RegisterBalance at period boundaries instead.
    type BalSummaryRow = { СуммаBalanceDr?: number; СуммаBalanceCr?: number };

    const openDateObj = new Date(dateFrom);
    openDateObj.setDate(openDateObj.getDate() - 1);
    const openDateStr = openDateObj.toISOString().split("T")[0];

    const [openBalRows, summaryRows] = await Promise.all([
      this.client.getRegisterBalance<BalSummaryRow>("AccountingRegister_Типовой", {
        filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
        select: "СуммаBalanceDr,СуммаBalanceCr",
        Period: `${openDateStr}T23:59:59`,
      }).catch(() => [] as BalSummaryRow[]),
      this.client.getBalanceAndTurnovers<{
        СуммаTurnoverDr?: number;
        СуммаTurnoverCr?: number;
      }>("AccountingRegister_Типовой", {
        filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
        select: "СуммаTurnoverDr,СуммаTurnoverCr",
        StartPeriod: periodFrom,
        EndPeriod:   periodTo,
      }).catch(() => []),
    ]);

    const openDr  = openBalRows.reduce((s, r) => s + (r.СуммаBalanceDr ?? 0), 0);
    const openCr  = openBalRows.reduce((s, r) => s + (r.СуммаBalanceCr ?? 0), 0);
    const turnDr  = summaryRows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0);
    const turnCr  = summaryRows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0);

    // ── 2. Corr-account breakdown via RecordType ──────────────────────────────
    // Two separate queries: 1C OData does NOT support (A or B) in $filter at top level.
    // IMPORTANT: field names in AccountingRegister_Типовой_RecordType are English:
    //   Period (not Период), AccountDr_Key (not СчетДт_Key), AccountCr_Key (not СчетКт_Key).
    type RecordRow = {
      AccountDr_Key?: string;
      AccountCr_Key?: string;
      Сумма?: number;
      Recorder_Type?: string;
    };
    const recPeriod = `Period ge datetime'${periodFrom}' and Period le datetime'${periodTo}'`;

    const orgRecFilter = organizationGuid ? ` and Организация_Key eq guid'${organizationGuid}'` : "";
    const [drRecs, crRecs] = await Promise.all([
      this.client.getCollection<RecordRow>("AccountingRegister_Типовой_RecordType", {
        filter: `AccountDr_Key eq guid'${acc.guid}' and ${recPeriod}${orgRecFilter}`,
        select: "AccountDr_Key,AccountCr_Key,Сумма,Recorder_Type",
        top: RECORD_LIMIT,
      }).catch(() => [] as RecordRow[]),
      this.client.getCollection<RecordRow>("AccountingRegister_Типовой_RecordType", {
        filter: `AccountCr_Key eq guid'${acc.guid}' and ${recPeriod}${orgRecFilter}`,
        select: "AccountDr_Key,AccountCr_Key,Сумма,Recorder_Type",
        top: RECORD_LIMIT,
      }).catch(() => [] as RecordRow[]),
    ]);

    const stripDocPrefix = (s: string | undefined) =>
      s ? s.replace(/^StandardODATA\.Document_/, "") : "";

    const corrMap = new Map<string, { dr: number; cr: number; docTypes: Set<string> }>();
    for (const r of drRecs) {
      const k = r.AccountCr_Key ?? "__unknown__";
      const g = corrMap.get(k) ?? { dr: 0, cr: 0, docTypes: new Set() };
      g.dr += r.Сумма ?? 0;
      const dt = stripDocPrefix(r.Recorder_Type); if (dt) g.docTypes.add(dt);
      corrMap.set(k, g);
    }
    for (const r of crRecs) {
      const k = r.AccountDr_Key ?? "__unknown__";
      const g = corrMap.get(k) ?? { dr: 0, cr: 0, docTypes: new Set() };
      g.cr += r.Сумма ?? 0;
      const dt = stripDocPrefix(r.Recorder_Type); if (dt) g.docTypes.add(dt);
      corrMap.set(k, g);
    }

    const corrGuids = [...corrMap.keys()].filter(g => g !== "__unknown__");
    const corrNameMap = await this.resolveAccountCodes(corrGuids);

    const byCorrAccount: CorrAccountEntry[] = [...corrMap.entries()]
      .map(([guid, v]) => {
        const info = corrNameMap.get(guid);
        const label = info ? `${info.code} ${info.name}`.trim() : (guid === "__unknown__" ? "Не определён" : guid.slice(0, 8) + "…");
        return {
          corrAccount:     info?.code ?? "",
          corrAccountName: label,
          turnoverDr:      r2(v.dr),
          turnoverCr:      r2(v.cr),
          shareDrPct:      turnDr > 0 ? Math.round((v.dr / turnDr) * 100) : 0,
          shareCrPct:      turnCr > 0 ? Math.round((v.cr / turnCr) * 100) : 0,
          docTypes:        [...v.docTypes],
        };
      })
      .sort((a, b) => (b.turnoverDr + b.turnoverCr) - (a.turnoverDr + a.turnoverCr));

    // ── 3. Subconto balance breakdown ─────────────────────────────────────────
    type BalRow = {
      ExtDimension1?: string;
      ExtDimension2?: string;
      ExtDimension3?: string;
      СуммаBalanceDr?: number;
      СуммаBalanceCr?: number;
    };

    const balRows = await this.client.getRegisterBalance<BalRow>(
      "AccountingRegister_Типовой",
      {
        filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
        select: "ExtDimension1,ExtDimension2,ExtDimension3,СуммаBalanceDr,СуммаBalanceCr",
        top: 2000,
        Period: `${dateTo}T23:59:59`,
      },
    ).catch(() => [] as BalRow[]);

    const dimGuids = [
      ...new Set([
        ...balRows.map(r => r.ExtDimension1).filter(Boolean) as string[],
        ...balRows.map(r => r.ExtDimension2).filter(Boolean) as string[],
        ...balRows.map(r => r.ExtDimension3).filter(Boolean) as string[],
      ]),
    ];
    const dimNameMap = await this.resolveDimNames(dimGuids);
    const getName = (guid: string | undefined) =>
      guid ? (dimNameMap.get(guid) ?? guid.slice(0, 8) + "…") : "";

    const bySubconto: SubcontoEntry[] = balRows
      .filter(r => (r.СуммаBalanceDr ?? 0) !== 0 || (r.СуммаBalanceCr ?? 0) !== 0)
      .map(r => ({
        dim1:      r.ExtDimension1 ?? "",
        dim1Name:  getName(r.ExtDimension1),
        dim2:      r.ExtDimension2 ?? "",
        dim2Name:  getName(r.ExtDimension2),
        balanceDr: r2(r.СуммаBalanceDr ?? 0),
        balanceCr: r2(r.СуммаBalanceCr ?? 0),
        net:       r2((r.СуммаBalanceDr ?? 0) - (r.СуммаBalanceCr ?? 0)),
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

    // ── 4. Monthly trend ──────────────────────────────────────────────────────
    // Use RegisterBalance at month-end for closing balance (more reliable for equity accounts).
    const months = buildMonthRange(dateFrom, dateTo);
    const monthlyTrend = await Promise.all(months.map(async ({ label, from, to }) => {
      const [turnRows, closeRows] = await Promise.all([
        this.client.getBalanceAndTurnovers<{
          СуммаTurnoverDr?: number;
          СуммаTurnoverCr?: number;
        }>("AccountingRegister_Типовой", {
          filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
          select: "СуммаTurnoverDr,СуммаTurnoverCr",
          StartPeriod: `${from}T00:00:00`,
          EndPeriod:   `${to}T23:59:59`,
        }).catch(() => []),
        this.client.getRegisterBalance<{ СуммаBalanceDr?: number; СуммаBalanceCr?: number }>(
          "AccountingRegister_Типовой",
          { filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`, select: "СуммаBalanceDr,СуммаBalanceCr", Period: `${to}T23:59:59` },
        ).catch(() => []),
      ]);
      const tDr = r2(turnRows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0));
      const tCr = r2(turnRows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0));
      const cDr = closeRows.reduce((s, r) => s + (r.СуммаBalanceDr ?? 0), 0);
      const cCr = closeRows.reduce((s, r) => s + (r.СуммаBalanceCr ?? 0), 0);
      return { month: label, turnoverDr: tDr, turnoverCr: tCr, closingBalance: r2(cDr - cCr) };
    }));

    const closeDr = balRows.reduce((s, r) => s + (r.СуммаBalanceDr ?? 0), 0);
    const closeCr = balRows.reduce((s, r) => s + (r.СуммаBalanceCr ?? 0), 0);

    const risks = detectCorrespondenceRisks(accountCode, byCorrAccount);

    // ── Data-quality guard ────────────────────────────────────────────────────
    // If turnovers are non-zero but byCorrAccount is empty, this is the signature
    // of a silent data-layer bug (e.g. wrong OData field names → all records skipped).
    const dataWarnings: string[] = [];
    const hasTurnovers = turnDr !== 0 || turnCr !== 0;
    const hasCorrRows  = byCorrAccount.length > 0;
    if (hasTurnovers && !hasCorrRows) {
      dataWarnings.push(
        `byCorrAccount пуст (${drRecs.length + crRecs.length} записей проверено) ` +
        `при ненулевых оборотах (Дт ${r2(turnDr)}, Кт ${r2(turnCr)}). ` +
        `Возможен сбой запроса регистра бухгалтерии — проверьте имена полей в OData-запросе.`,
      );
    }

    return {
      accountCode,
      accountName: acc.name,
      period:  { from: dateFrom, to: dateTo },
      summary: {
        openingBalance: r2(openDr - openCr),
        debitTurnover:  r2(turnDr),
        creditTurnover: r2(turnCr),
        closingBalance: r2(closeDr - closeCr),
      },
      byCorrAccount,
      bySubconto,
      monthlyTrend,
      risks,
      dataWarnings,
      meta: {
        recordsScanned:        drRecs.length + crRecs.length,
        corrAccountTruncated:  drRecs.length >= RECORD_LIMIT || crRecs.length >= RECORD_LIMIT,
      },
    };
  }
}
