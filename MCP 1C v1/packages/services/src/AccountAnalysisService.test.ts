/**
 * Golden-value regression test for AccountAnalysisService.
 *
 * Uses a fake OneCClient (structural — no subclassing needed) that returns
 * deterministic fixture data matching the verified 1С etalon for account 5610,
 * ТОО «Московский», 2025-01-01 to 2025-12-31.
 *
 * Etalon (from direct 1С OData queries, 2026-06-05):
 *   Дт turnover:  37 416 649.57  (дивиденды 3040 + взносы 3250)
 *   Кт turnover:  корр-счета 3131 +25 642 639.95, 5710 -104 810 251.43
 *
 * Run: npm test   (tsx --test packages/services/src/**‌/*.test.ts)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AccountAnalysisService } from "./AccountAnalysisService.js";

// ── Fixture data ──────────────────────────────────────────────────────────────

const ORG_GUID = "41c5d9a6-6d87-11e9-9f9f-80c5f26788b0";
const ACC_5610_GUID = "aaa00001-0000-0000-0000-000000000001";
const ACC_3040_GUID = "aaa00002-0000-0000-0000-000000000002";
const ACC_3131_GUID = "aaa00003-0000-0000-0000-000000000003";
const ACC_3250_GUID = "aaa00004-0000-0000-0000-000000000004";
const ACC_5710_GUID = "aaa00005-0000-0000-0000-000000000005";

/**
 * RecordType rows: account 5610 appears as Дт or Кт, counterpart on the other side.
 * - 3040 (dividends, wrong doc type) → Дт 5610 (5610 is debited)
 * - 3250 (ОППВ contributions) → Дт 5610
 * - 3131 (VAT) → Кт 5610 (credit to equity)
 * - 5710 (P&L close) → Кт 5610 (net loss, negative)
 *
 * Amounts chosen to reproduce etalon turnovers exactly.
 */
const DR_RECORDS = [
  // AccountDr_Key = 5610 → corr side is AccountCr_Key
  { AccountDr_Key: ACC_5610_GUID, AccountCr_Key: ACC_3040_GUID, Сумма: 37_410_000.00, Recorder_Type: "StandardODATA.Document_ОтражениеЗарплатыВРеглУчете" },
  { AccountDr_Key: ACC_5610_GUID, AccountCr_Key: ACC_3250_GUID, Сумма:      6_649.57, Recorder_Type: "StandardODATA.Document_НачислениеЗарплатыРаботникамОрганизаций" },
];

const CR_RECORDS = [
  // AccountCr_Key = 5610 → corr side is AccountDr_Key
  { AccountDr_Key: ACC_3131_GUID, AccountCr_Key: ACC_5610_GUID, Сумма:  25_642_639.95, Recorder_Type: "StandardODATA.Document_ЗакрытиеМесяца" },
  { AccountDr_Key: ACC_5710_GUID, AccountCr_Key: ACC_5610_GUID, Сумма: 104_810_251.43, Recorder_Type: "StandardODATA.Document_ЗакрытиеМесяца" },
];

// ChartOfAccounts rows for GUID resolution
const COA_ROWS = [
  { Ref_Key: ACC_5610_GUID, Code: "5610", Description: "Нераспределенная прибыль непокрытый убыток отчетного года" },
  { Ref_Key: ACC_3040_GUID, Code: "3040", Description: "Краткосрочные обязательства по выплатам" },
  { Ref_Key: ACC_3131_GUID, Code: "3131", Description: "НДС к уплате" },
  { Ref_Key: ACC_3250_GUID, Code: "3250", Description: "Обязательства по ОППВ" },
  { Ref_Key: ACC_5710_GUID, Code: "5710", Description: "Итоговая прибыль убыток" },
];

// Balance rows (closing balance at dateTo): small Кт balance for 5610
const BALANCE_ROWS = [
  { СуммаBalanceDr: 0, СуммаBalanceCr: 1_855_000_000.00 },
];

// Opening balance (at dateFrom − 1)
const OPENING_ROWS = [
  { СуммаBalanceDr: 0, СуммаBalanceCr: 1_971_903_073.21 },
];

// ── Fake OneCClient ────────────────────────────────────────────────────────────

/**
 * Minimal fake that routes by entitySet / registerName.
 * Returns arrays (never rejects) — because AccountAnalysisService wraps each
 * call in .catch(()=>[]), a rejection would be silently swallowed into [].
 */
function makeFakeClient() {
  return {
    async getCollection(entitySet: string, params: Record<string, unknown>) {
      // ChartOfAccounts: account lookup by Code, or batch GUID lookup
      if (entitySet === "ChartOfAccounts_Типовой") {
        const filter = String(params.filter ?? "");
        if (filter.includes("Code eq '5610'")) {
          return [COA_ROWS.find((r) => r.Code === "5610")!];
        }
        if (filter.includes("Code eq '1010'")) {
          return [{ Ref_Key: "bbb00001-0000-0000-0000-000000000001", Code: "1010", Description: "Денежные средства в кассе" }];
        }
        // Batch GUID lookup (corr-account name resolution)
        return COA_ROWS.filter((r) => filter.includes(r.Ref_Key));
      }

      // RecordType: Dr-side records (AccountDr_Key = 5610)
      if (entitySet === "AccountingRegister_Типовой_RecordType") {
        const filter = String(params.filter ?? "");
        if (filter.startsWith(`AccountDr_Key eq guid'${ACC_5610_GUID}'`)) return DR_RECORDS;
        if (filter.startsWith(`AccountCr_Key eq guid'${ACC_5610_GUID}'`)) return CR_RECORDS;
        // Account 1010
        if (filter.startsWith(`AccountDr_Key eq guid'bbb00001`)) return [];
        if (filter.startsWith(`AccountCr_Key eq guid'bbb00001`)) return [];
        return [];
      }

      // Subconto catalogs: not needed for these tests
      return [];
    },

    async getRegisterBalance(registerName: string, params: Record<string, unknown>) {
      if (registerName !== "AccountingRegister_Типовой") return [];
      const filter = String(params.filter ?? "");
      const period = String(params.Period ?? "");

      if (filter.includes(ACC_5610_GUID)) {
        // Opening balance (called at dateFrom - 1)
        if (period.startsWith("2024-12-31")) return OPENING_ROWS;
        // Closing balance (at dateTo), used in subconto + monthly trend
        return BALANCE_ROWS;
      }
      // Account 1010
      if (filter.includes("bbb00001")) return [{ СуммаBalanceDr: 277_070.19, СуммаBalanceCr: 0 }];
      return [];
    },

    async getBalanceAndTurnovers(registerName: string, params: Record<string, unknown>) {
      if (registerName !== "AccountingRegister_Типовой") return [];
      const filter = String(params.filter ?? "");

      if (filter.includes(ACC_5610_GUID)) {
        // Full period turnovers (summary section)
        return [{ СуммаTurnoverDr: 37_416_649.57, СуммаTurnoverCr: 130_452_891.38 }];
      }
      // Account 1010: simple turnovers
      if (filter.includes("bbb00001")) {
        return [{ СуммаTurnoverDr: 74_040_682.30, СуммаTurnoverCr: 75_800_367.74 }];
      }
      return [];
    },
  } as unknown as import("@aibos/onec-client").OneCClient;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AccountAnalysisService", () => {

  describe("account 5610 — golden etalon (ТОО Московский, 2025)", () => {
    const svc = new AccountAnalysisService(makeFakeClient());
    let result: Awaited<ReturnType<typeof svc.analyzeAccount>>;

    it("resolves without error", async () => {
      result = await svc.analyzeAccount("5610", "2025-01-01", "2025-12-31", ORG_GUID);
      assert.ok(result);
    });

    it("returns correct account name", () => {
      assert.match(result.accountName, /Нераспределен/);
    });

    it("summary — debitTurnover matches etalon (37 416 649.57)", () => {
      assert.strictEqual(result.summary.debitTurnover, 37_416_649.57);
    });

    it("byCorrAccount is non-empty (field-name regression guard)", () => {
      // If this fails, the OData field names (AccountDr_Key / AccountCr_Key) regressed
      assert.ok(result.byCorrAccount.length > 0,
        `byCorrAccount is empty — possible field-name regression. ` +
        `meta.recordsScanned=${result.meta.recordsScanned}, ` +
        `dataWarnings=${JSON.stringify(result.dataWarnings)}`);
    });

    it("byCorrAccount contains 3040 (dividends)", () => {
      const entry = result.byCorrAccount.find((e) => e.corrAccount === "3040");
      assert.ok(entry, "Missing corr-account 3040 (dividends)");
      assert.ok(entry.turnoverDr > 0, "3040 should have Дт turnover on 5610");
    });

    it("byCorrAccount contains 3131 (VAT direct to equity)", () => {
      const entry = result.byCorrAccount.find((e) => e.corrAccount === "3131");
      assert.ok(entry, "Missing corr-account 3131 (VAT)");
    });

    it("byCorrAccount contains 5710 (P&L close)", () => {
      const entry = result.byCorrAccount.find((e) => e.corrAccount === "5710");
      assert.ok(entry, "Missing corr-account 5710 (P&L)");
    });

    it("risks[] contains EQ-001a (dividends via payroll doc)", () => {
      const r = result.risks.find((r) => r.ruleId === "EQ-001a");
      assert.ok(r, `EQ-001a not found. risks=${JSON.stringify(result.risks.map((r) => r.ruleId))}`);
      assert.strictEqual(r.severity, "error");
    });

    it("risks[] contains EQ-002 (tax account 3131 → equity)", () => {
      const r = result.risks.find((r) => r.ruleId === "EQ-002");
      assert.ok(r, `EQ-002 not found. risks=${JSON.stringify(result.risks.map((r) => r.ruleId))}`);
    });

    it("dataWarnings[] is empty (byCorrAccount is non-empty, no contradiction)", () => {
      assert.deepStrictEqual(result.dataWarnings, [],
        `Unexpected dataWarnings: ${JSON.stringify(result.dataWarnings)}`);
    });
  });


  describe("account 1010 — no false-positive risks", () => {
    const svc = new AccountAnalysisService(makeFakeClient());
    let result: Awaited<ReturnType<typeof svc.analyzeAccount>>;

    it("resolves without error", async () => {
      result = await svc.analyzeAccount("1010", "2025-01-01", "2025-12-31", ORG_GUID);
      assert.ok(result);
    });

    it("risks[] is empty for a normal asset account", () => {
      // GEN-001 and EQ-* rules must NOT fire for account 1010
      assert.deepStrictEqual(result.risks, [],
        `False-positive risks on 1010: ${JSON.stringify(result.risks.map((r) => r.ruleId))}`);
    });
  });


  describe("dataWarnings guard — turnovers present but byCorrAccount empty", () => {
    // Simulate the field-name bug: RecordType queries return [] even though turnovers ≠ 0
    const brokenClient = {
      ...makeFakeClient(),
      async getCollection(entitySet: string, params: Record<string, unknown>) {
        if (entitySet === "AccountingRegister_Типовой_RecordType") return []; // broken
        return (makeFakeClient() as unknown as { getCollection: typeof makeFakeClient }).getCollection
          ? (makeFakeClient() as unknown as Record<string, (e: string, p: Record<string, unknown>) => Promise<unknown[]>>).getCollection(entitySet, params)
          : [];
      },
    } as unknown as import("@aibos/onec-client").OneCClient;

    const brokenSvc = new AccountAnalysisService(
      (() => {
        const base = makeFakeClient() as Record<string, unknown>;
        return {
          ...base,
          getCollection: async (entitySet: string, params: Record<string, unknown>) => {
            if (entitySet === "AccountingRegister_Типовой_RecordType") return [];
            return (base.getCollection as (e: string, p: Record<string, unknown>) => Promise<unknown[]>)(entitySet, params);
          },
        } as unknown as import("@aibos/onec-client").OneCClient;
      })(),
    );

    it("emits dataWarnings when RecordType returns empty but turnovers are non-zero", async () => {
      const result = await brokenSvc.analyzeAccount("5610", "2025-01-01", "2025-12-31", ORG_GUID);
      assert.ok(result.dataWarnings.length > 0,
        "Expected dataWarnings to be non-empty when byCorrAccount is empty but turnovers ≠ 0");
      assert.ok(result.dataWarnings[0]!.includes("byCorrAccount пуст"),
        `Unexpected warning text: ${result.dataWarnings[0]}`);
    });
  });

});
