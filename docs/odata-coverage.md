# OData Coverage Audit — moskovskiy instance

**Audited:** 2026-06-19  
**Instance:** `https://1cstart.itsheff.cloud/moskovskiypa8x4/odata/standard.odata`  
**Method:** HTTP probe with `$format=json&$top=0`, timeout 30s

---

## Summary

| Category | Count |
|---|---|
| ✅ Available | 18 |
| ⚠️ Available but slow (>10s) | 5 |
| ❌ Not available (404) | 15 |
| 🐛 Wrong name fixed | 3 |

---

## ✅ Available Endpoints

| Entity | Notes |
|---|---|
| `AccountingRegister_Типовой_RecordType` | Fast |
| `AccountingRegister_Типовой/BalanceAndTurnovers` | Fast — preferred over Balance/Turnovers separately |
| `AccumulationRegister_ТоварыОрганизацийБУ/Balance` | Fast |
| `AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентамиФизЛицами/Balance` | Fast (individuals only) |
| `Catalog_Организации` | Fast |
| `Catalog_Номенклатура` | Fast |
| `Catalog_Склады` | Fast |
| `Catalog_ФизическиеЛица` | Fast |
| `Catalog_ДоговорыКонтрагентов` | Fast |
| `Catalog_СотрудникиОрганизаций` | Fast (see name fix below) |
| `Document_ПлатежноеПоручениеВходящее` | Fast |
| `Document_ПлатежноеПоручениеИсходящее` | Fast |
| `Document_ПоступлениеТоваровУслуг` | Fast |
| `Document_НачислениеЗарплатыРаботникамОрганизаций` | Fast |
| `Document_АвансовыйОтчет` | Fast |
| `Document_ПринятиеКУчетуОС` | Fast |
| `Document_ПриходныйКассовыйОрдер` | Fast (see name fix below) |
| `Document_РасходныйКассовыйОрдер` | Fast (see name fix below) |

---

## ⚠️ Available but Slow (>10s response)

These endpoints exist but take 10–30+ seconds to respond even with `$top=0`. Always filter tightly by period and account code.

| Entity | Typical latency | Mitigation |
|---|---|---|
| `AccountingRegister_Типовой/Balance` | >20s | Use `/BalanceAndTurnovers` instead |
| `AccountingRegister_Типовой/Turnovers` | >20s | Use `/BalanceAndTurnovers` instead |
| `Catalog_Контрагенты` | >10s | Filter by `Description` or `ИНН` |
| `Document_РеализацияТоваровУслуг` | >10s | Filter by `Date` range |
| `InformationRegister_КурсыВалют/SliceLast` | >10s | Filter by currency code |

---

## ❌ Not Available (404)

### Mutual Settlements Registers
Both accumulation registers for contractor mutual settlements return 404. Receivables/payables are read via `AccountingRegister_Типовой/BalanceAndTurnovers` filtered on accounts 1210 and 3310.

| Entity | Workaround |
|---|---|
| `AccumulationRegister_ВзаиморасчетыСКонтрагентами` | `AccountingRegister_Типовой/BalanceAndTurnovers` on 1210/3310 |
| `AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентами` | Same |

### Cash / Payroll Accumulation Registers
| Entity | Workaround |
|---|---|
| `AccumulationRegister_ДенежныеСредства` | `AccountingRegister_Типовой` on accounts 1010/1030 |
| `AccumulationRegister_ДенежныеСредстваОрганизаций` | Same |
| `AccumulationRegister_РасчетыСПерсоналомОрганизаций` | `AccountingRegister_Типовой` on account 3350 |
| `AccumulationRegister_ЗарплатаКВыплатеОрганизаций` | `Document_НачислениеЗарплатыРаботникамОрганизаций` |
| `AccumulationRegister_НачисленияИВыплатыПоЗарплате` | Same |
| `AccumulationRegister_НачисленияПоЕСН` | `AccountingRegister_Типовой` on accounts 3150/3120 |
| `AccumulationRegister_РасчетыСПокупателями` | `AccountingRegister_Типовой` on account 1210 |
| `AccumulationRegister_РасчетыСПоставщиками` | `AccountingRegister_Типовой` on account 3310 |

### Other
| Entity | Notes |
|---|---|
| `Document_СписаниеЗапасов` | Not in OData schema |
| `InformationRegister_ЖурналПроводок` | Not in OData schema — use `AccountingRegister_Типовой_RecordType` |

---

## 🐛 Wrong Entity Names Fixed (2026-06-19)

Three entity names in the codebase did not match the actual OData API, causing silent 404 errors caught by `.catch(() => [])` fallbacks.

| Wrong name (was in code) | Correct name | Files fixed |
|---|---|---|
| `Document_КассовыйОрдерПриходный` | `Document_ПриходныйКассовыйОрдер` | `ReportsService.ts:1458`, `GuidResolverService.ts:40` |
| `Document_КассовыйОрдерРасходный` | `Document_РасходныйКассовыйОрдер` | `ReportsService.ts:1459`, `GuidResolverService.ts:41` |
| `Catalog_Сотрудники` | `Catalog_СотрудникиОрганизаций` | `GuidResolverService.ts:21` |

**Impact of fixes:**
- `getCashFlowSummary()` now correctly fetches cash receipt and expense orders, previously returning zero for all cash transactions
- `resolveGuid()` can now resolve employee GUIDs and cash document GUIDs

---

## Capability Registry

The machine-readable version of this audit lives at:
`packages/onec-client/src/Capabilities.ts`

Import `isODataAvailable(entityName)` to check before recommending a tool that queries a given entity.
