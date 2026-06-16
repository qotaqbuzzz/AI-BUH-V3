import type { OneCClient } from "@aibos/onec-client";
import type { AccountingBalance, AccountingTurnover, ExchangeRate, InventoryBalance, ContractorSettlement } from "@aibos/onec-client";
import { validateAccountCode } from "@aibos/onec-client";

export interface AccountCodeResult {
  accountCode: string;
  accountGuid: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
  quantity: number;
}

export interface AccountTurnoverResult {
  accountCode: string;
  accountGuid: string;
  debitTurnover: number;
  creditTurnover: number;
  netTurnover: number;
}

export class RegisterService {
  private accountCache: Map<string, string> = new Map();

  constructor(private readonly client: OneCClient) {}

  async resolveAccountGuid(accountCode: string): Promise<string | null> {
    if (this.accountCache.has(accountCode)) return this.accountCache.get(accountCode)!;
    const rows = await this.client.getCollection<{ Ref_Key: string; Code: string }>(
      "ChartOfAccounts_Типовой",
      { filter: `Code eq '${validateAccountCode(accountCode)}'`, select: "Ref_Key,Code", top: 1 },
    );
    const guid = rows[0]?.Ref_Key ?? null;
    if (guid) this.accountCache.set(accountCode, guid);
    return guid;
  }

  async getAccountBalance(accountCode: string, organizationGuid?: string, _date?: string): Promise<AccountCodeResult> {
    const accountGuid = await this.resolveAccountGuid(accountCode);
    if (!accountGuid) return { accountCode, accountGuid: "", debitBalance: 0, creditBalance: 0, netBalance: 0, quantity: 0 };

    const filters: string[] = [`Account_Key eq guid'${accountGuid}'`];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const rows = await this.client.getRegisterBalance<AccountingBalance>(
      "AccountingRegister_Типовой",
      {
        filter: filters.join(" and "),
        select: "Account_Key,Организация_Key,СуммаBalanceDr,СуммаBalanceCr,СуммаBalance,КоличествоBalance",
      },
    );

    const debitBalance = rows.reduce((s, r) => s + (r.СуммаBalanceDr ?? 0), 0);
    const creditBalance = rows.reduce((s, r) => s + (r.СуммаBalanceCr ?? 0), 0);
    const quantity = rows.reduce((s, r) => s + (r.КоличествоBalance ?? 0), 0);
    return { accountCode, accountGuid, debitBalance, creditBalance, netBalance: debitBalance - creditBalance, quantity };
  }

  async getAccountTurnovers(accountCode: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<AccountTurnoverResult> {
    const accountGuid = await this.resolveAccountGuid(accountCode);
    if (!accountGuid) return { accountCode, accountGuid: "", debitTurnover: 0, creditTurnover: 0, netTurnover: 0 };

    const filters: string[] = [`Account_Key eq guid'${accountGuid}'`];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    const rows = await this.client.getRegisterTurnovers<AccountingTurnover>(
      "AccountingRegister_Типовой",
      {
        filter: filters.join(" and "),
        StartPeriod: `${dateFrom}T00:00:00`,
        EndPeriod: `${dateTo}T23:59:59`,
        select: "Account_Key,СуммаTurnoverDr,СуммаTurnoverCr,СуммаTurnover",
      },
    );

    const debitTurnover = rows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0);
    const creditTurnover = rows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0);
    return { accountCode, accountGuid, debitTurnover, creditTurnover, netTurnover: debitTurnover - creditTurnover };
  }

  async getExchangeRates(currencyCode?: string, date?: string): Promise<ExchangeRate[]> {
    const rows = await this.client.getSliceLast<ExchangeRate & { Валюта?: { Code?: string } }>(
      "InformationRegister_КурсыВалют",
      {
        ...(date ? { Period: `${date}T23:59:59` } : {}),
        expand: "Валюта",
        select: "Period,Валюта_Key,Курс,Кратность",
      },
    );
    if (currencyCode) return rows.filter(r => r.Валюта?.Code === currencyCode);
    return rows;
  }

  async getContractorSettlements(contractorGuid?: string, organizationGuid?: string): Promise<ContractorSettlement[]> {
    const filters: string[] = [];
    if (contractorGuid) filters.push(`Контрагент_Key eq guid'${contractorGuid}'`);
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    return this.client.getRegisterBalance<ContractorSettlement>(
      "AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентамиФизЛицами",
      {
        filter: filters.length ? filters.join(" and ") : undefined,
        select: "Контрагент_Key,Организация_Key,СуммаВзаиморасчетовBalance,ПериодВзаиморасчетов",
      },
    );
  }

  async getAccountBreakdown(
    accountCode: string,
    date: string,
    organizationGuid?: string,
  ): Promise<{ dim1: string; dim1Name: string; dim2: string; dim2Name: string; qty: number; amountDr: number; amountCr: number }[]> {
    const accountGuid = await this.resolveAccountGuid(accountCode);
    if (!accountGuid) return [];

    const filters: string[] = [`Account_Key eq guid'${accountGuid}'`];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);

    type BalRow = {
      СуммаBalanceDr?: number;
      СуммаBalanceCr?: number;
      КоличествоBalance?: number;
      ExtDimension1?: string;
      ExtDimension1_Type?: string;
      ExtDimension2?: string;
      ExtDimension2_Type?: string;
    };

    const rows = await this.client.getRegisterBalance<BalRow>(
      "AccountingRegister_Типовой",
      {
        filter: filters.join(" and "),
        select: "СуммаBalanceDr,СуммаBalanceCr,КоличествоBalance,ExtDimension1,ExtDimension1_Type,ExtDimension2,ExtDimension2_Type",
        top: 500,
        Period: `${date}T23:59:59`,
      },
    );

    // Catalog map for dim1 by account prefix
    const DIM1_CATALOG: Record<string, string> = {
      "1310": "Catalog_Номенклатура",
      "1320": "Catalog_Номенклатура",
      "1330": "Catalog_Номенклатура",
      "1210": "Catalog_Контрагенты",
      "1710": "Catalog_Контрагенты",
      "3310": "Catalog_Контрагенты",
      "3510": "Catalog_Контрагенты",
    };
    const DIM2_CATALOG: Record<string, string> = {
      "1310": "Catalog_Склады",
      "1320": "Catalog_Склады",
      "1330": "Catalog_Склады",
      "1210": "Catalog_ДоговорыКонтрагентов",
      "1710": "Catalog_ДоговорыКонтрагентов",
      "3310": "Catalog_ДоговорыКонтрагентов",
      "3510": "Catalog_ДоговорыКонтрагентов",
    };

    const resolveNames = async (guids: string[], catalog: string): Promise<Map<string, string>> => {
      const map = new Map<string, string>();
      if (!guids.length || !catalog) return map;
      const filter = guids.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
      const items = await this.client.getCollection<{ Ref_Key: string; Description: string }>(catalog, {
        filter,
        select: "Ref_Key,Description",
        top: guids.length + 10,
      }).catch(() => [] as { Ref_Key: string; Description: string }[]);
      for (const item of items) map.set(item.Ref_Key, item.Description);
      return map;
    };

    const dim1Guids = [...new Set(rows.map(r => r.ExtDimension1).filter(Boolean) as string[])];
    const dim2Guids = [...new Set(rows.map(r => r.ExtDimension2).filter(Boolean) as string[])];
    const [dim1Map, dim2Map] = await Promise.all([
      resolveNames(dim1Guids, DIM1_CATALOG[accountCode] ?? ""),
      resolveNames(dim2Guids, DIM2_CATALOG[accountCode] ?? ""),
    ]);

    const getName = (guid: string | undefined, map: Map<string, string>) =>
      guid ? (map.get(guid) ?? guid.slice(0, 8) + "…") : "";

    return rows
      .filter(r => (r.СуммаBalanceDr ?? 0) !== 0 || (r.СуммаBalanceCr ?? 0) !== 0)
      .sort((a, b) => (b.СуммаBalanceDr ?? 0) - (a.СуммаBalanceDr ?? 0))
      .map(r => ({
        dim1: r.ExtDimension1 ?? "",
        dim1Name: getName(r.ExtDimension1, dim1Map),
        dim2: r.ExtDimension2 ?? "",
        dim2Name: getName(r.ExtDimension2, dim2Map),
        qty: r.КоличествоBalance ?? 0,
        amountDr: r.СуммаBalanceDr ?? 0,
        amountCr: r.СуммаBalanceCr ?? 0,
      }));
  }

  async getAccountCard(
    accountCode: string,
    dateFrom: string,
    dateTo: string,
    organizationGuid?: string,
  ): Promise<{
    accountCode: string;
    period: { from: string; to: string };
    rows: { period: string; recorderKey: string; lineNum: number; amountDr: number; amountCr: number; corrAccountCode: string }[];
    totals: { debitTurnover: number; creditTurnover: number; netTurnover: number };
    meta: { rowsAvailable: boolean; note?: string };
  }> {
    const r2 = (n: number) => Math.round(n * 100) / 100;

    // Resolving the account is mandatory. A query error here propagates to the
    // caller (→ the tool reports an error); a genuine "code not in the chart" is
    // also an explicit error. We must NEVER return silent zeros the model could
    // mistake for "this account had no movement".
    const accountGuid = await this.resolveAccountGuid(accountCode);
    if (!accountGuid) {
      throw new Error(`Счёт ${accountCode} не найден в плане счетов (ChartOfAccounts_Типовой).`);
    }

    // ── Authoritative totals: virtual /Turnovers table (reliable). ──────────────
    // NO error swallowing — if this fails, the failure surfaces as a tool error
    // instead of a misleading zero turnover. This is the number that matters for
    // P&L, so it must be correct-or-error, never silently empty.
    const turnoverFilters = [`Account_Key eq guid'${accountGuid}'`];
    if (organizationGuid) turnoverFilters.push(`Организация_Key eq guid'${organizationGuid}'`);
    const turnoverRows = await this.client.getRegisterTurnovers<AccountingTurnover>(
      "AccountingRegister_Типовой",
      {
        filter: turnoverFilters.join(" and "),
        StartPeriod: `${dateFrom}T00:00:00`,
        EndPeriod: `${dateTo}T23:59:59`,
        select: "Account_Key,СуммаTurnoverDr,СуммаTurnoverCr,СуммаTurnover",
      },
    );
    const debitTurnover = r2(turnoverRows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0));
    const creditTurnover = r2(turnoverRows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0));

    // ── Best-effort line detail: raw postings from RecordType. ──────────────────
    // This virtual entity is known to be flaky on some 1C configs. If it fails we
    // STILL return correct totals and flag the detail as unavailable (honest) —
    // we do not pretend the account is empty.
    type RecordRow = {
      Период?: string;
      Регистратор?: string;
      НомерСтроки?: number;
      СчетДт_Key?: string;
      СчетКт_Key?: string;
      Сумма?: number;
    };
    // 1C OData does not support (A or B) in $filter — use two separate queries
    const recPeriod = `Период ge datetime'${dateFrom}T00:00:00' and Период le datetime'${dateTo}T23:59:59'`;
    const recSelect = "Период,Регистратор,НомерСтроки,СчетДт_Key,СчетКт_Key,Сумма";

    let rowsAvailable = true;
    let rawRows: RecordRow[] = [];
    try {
      const [drRows, crRows] = await Promise.all([
        this.client.getCollection<RecordRow>("AccountingRegister_Типовой_RecordType", {
          filter: `СчетДт_Key eq guid'${accountGuid}' and ${recPeriod}`,
          select: recSelect,
          orderby: "Период asc,НомерСтроки asc",
          top: 2000,
        }),
        this.client.getCollection<RecordRow>("AccountingRegister_Типовой_RecordType", {
          filter: `СчетКт_Key eq guid'${accountGuid}' and ${recPeriod}`,
          select: recSelect,
          orderby: "Период asc,НомерСтроки asc",
          top: 2000,
        }),
      ]);
      rawRows = [...drRows, ...crRows].sort((a, b) =>
        (a.Период ?? "").localeCompare(b.Период ?? "") || (a.НомерСтроки ?? 0) - (b.НомерСтроки ?? 0),
      );
    } catch {
      rowsAvailable = false;
    }

    const corrGuids = new Set<string>();
    for (const r of rawRows) {
      if (r.СчетДт_Key && r.СчетДт_Key !== accountGuid) corrGuids.add(r.СчетДт_Key);
      if (r.СчетКт_Key && r.СчетКт_Key !== accountGuid) corrGuids.add(r.СчетКт_Key);
    }

    const accCodeMap = new Map<string, string>();
    const corrGuidArr = [...corrGuids];
    for (let i = 0; i < corrGuidArr.length; i += 20) {
      const batch = corrGuidArr.slice(i, i + 20);
      const accRows = await this.client.getCollection<{ Ref_Key: string; Code: string }>(
        "ChartOfAccounts_Типовой",
        { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Code", top: 20 },
      ).catch(() => []);
      for (const a of accRows) accCodeMap.set(a.Ref_Key, a.Code ?? "");
    }

    const rows = rawRows.map(r => {
      const isDr = r.СчетДт_Key === accountGuid;
      const corrGuid = isDr ? (r.СчетКт_Key ?? "") : (r.СчетДт_Key ?? "");
      const amt = r.Сумма ?? 0;
      return {
        period: r.Период?.slice(0, 10) ?? "",
        recorderKey: r.Регистратор ?? "",
        lineNum: r.НомерСтроки ?? 0,
        amountDr: isDr ? amt : 0,
        amountCr: isDr ? 0 : amt,
        corrAccountCode: accCodeMap.get(corrGuid) ?? corrGuid.slice(0, 8),
      };
    });

    const detailMissing = rowsAvailable && rows.length === 0 && (debitTurnover !== 0 || creditTurnover !== 0);
    const note = !rowsAvailable
      ? "Детализация проводок недоступна (RecordType вернул ошибку); итоги рассчитаны по виртуальной таблице оборотов и достоверны."
      : detailMissing
        ? "Построчная детализация по этому счёту недоступна (RecordType пуст); итоги рассчитаны по виртуальной таблице оборотов и достоверны."
        : undefined;

    return {
      accountCode,
      period: { from: dateFrom, to: dateTo },
      rows,
      totals: { debitTurnover, creditTurnover, netTurnover: r2(debitTurnover - creditTurnover) },
      meta: { rowsAvailable, note },
    };
  }

  async getInventoryBalance(organizationGuid?: string, nomenclatureGuid?: string, _date?: string): Promise<InventoryBalance[]> {
    const filters: string[] = [];
    if (organizationGuid) filters.push(`Организация_Key eq guid'${organizationGuid}'`);
    if (nomenclatureGuid) filters.push(`Номенклатура_Key eq guid'${nomenclatureGuid}'`);

    return this.client.getRegisterBalance<InventoryBalance>(
      "AccumulationRegister_ТоварыОрганизацийБУ",
      { filter: filters.length ? filters.join(" and ") : undefined },
    );
  }
}
