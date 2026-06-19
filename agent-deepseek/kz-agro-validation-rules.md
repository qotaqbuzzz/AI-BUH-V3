# kz-agro-validation-rules

**Rulebook of accounting invariants and cross-checks for 1C:Бухгалтерия KZ (agricultural farm).**
Source of truth for all `onec_validate_*` MCP tools — every finding cites a section of this file.

---

## A.1 Fundamental invariants (must always hold)

### Double-entry
- Per document (recorder): `Σ Дт = Σ Кт` across all journal lines
- Trial balance totals: `Σ openDr = Σ openCr`, `Σ turnDr = Σ turnCr`, `Σ closeDr = Σ closeCr`
- Per account: `opening + turnover_Дт − turnover_Кт = closing` (with sign convention: assets/expenses Дт positive, liabilities/equity/revenue Кт positive)

### Account-sign convention
- **Assets** (1xxx, 2xxx) — closing should be Дт ≥ 0. Кт balance is anomaly *unless*:
  - 1090, 1170, 1280, 1360, 1530, 1630, 1740, 2080, 2180, 2230, 2330, 2430, 2540, 2630, 2750, 2950 → these are contra-asset reserves (Кт is normal)
  - 1421 → may have small Кт during refund period
- **Liabilities** (3xxx, 4xxx) — closing should be Кт ≥ 0. Дт balance is anomaly *unless*:
  - 3110, 3120, 3130 → may show Дт if overpaid in advance to budget
- **Capital** (5xxx) — closing should be Кт ≥ 0 (5210 contra-capital — Дт is normal)
- **Revenue/Expense** (6xxx, 7xxx) — closing = 0 at year-end (after реформация)
- **Production** (8xxx) — closing = 0 at end of harvest cycle (after `1320 ← 8112`)

### ExtDimension (sub-account) consistency
- Contractor sub-account required on: 1210, 1220, 1710, 2110, 3310, 3320, 3510, 4110
- Employee (физ. лицо) sub-account required on: 1251, 1254, 3350, 3385
- Nomenclature required on: 1310, 1320, 1330, 1340, 1341

---

## A.2 Standard transaction flows (Дт → Кт)

| # | Operation | Document | Дт | Кт |
|---|-----------|----------|----|----|
| **Purchase cycle** | | | | |
| 1 | Receipt of materials | ПоступлениеТоваровУслуг | 1310 | 3310 |
| 2 | Receipt of admin services | ПоступлениеТоваровУслуг | 7210 | 3310 |
| 3 | Receipt of production services | ПоступлениеТоваровУслуг | 8112 / 8412 | 3310 |
| 4 | Recoverable VAT | ПоступлениеТоваровУслуг | 1421 | 3310 |
| 5 | Payment to supplier | ПлатежноеПоручениеИсходящее | 3310 | 1030 |
| **Production (растениеводство)** | | | | |
| 6 | Seeds to field | ТребованиеНакладная | 8112 | 1310 |
| 7 | Fertilizer / chemistry | ТребованиеНакладная | 8112 | 1310 |
| 8 | Fuel (ГСМ) | ТребованиеНакладная | 8112 | 1310 |
| 9 | Field payroll (gross) | НачислениеЗарплаты | 8112 | 3350 |
| 10 | Admin payroll (gross) | НачислениеЗарплаты | 7210 | 3350 |
| 11 | Withholdings (ИПН, ОПВ, ОСМС-раб) | НачислениеЗарплаты | 3350 | 3120, 3220, 3212 |
| 12 | Employer charges (СО, ВОСМС, ОППВ) | НачислениеЗарплаты | 8112 / 7210 | 3211, 3213, 3250 |
| 13 | Social tax (СН) | НачислениеЗарплаты | 8112 / 7210 | 3150 |
| 14 | Depreciation (production OS) | ЗакрытиеМесяца | 8112 | 2420 |
| 15 | Indirect production overhead | ЗакрытиеМесяца | 8412 | 3310 |
| 16 | НЗП accumulates all season on 8112 | — | — | — |
| **Harvest** | | | | |
| 17 | Finished grain to warehouse | ОприходованиеИзПроизводства | 1320 | 8112 |
| **Sales cycle** | | | | |
| 18 | Sale (gross w/ VAT) | РеализацияТоваровУслуг | 1210 | 6010 |
| 19 | VAT charged | РеализацияТоваровУслуг | 1210 | 3131 |
| 20 | COGS | РеализацияТоваровУслуг | 7010 | 1320 |
| 21 | Customer payment | ПлатежноеПоручениеВходящее | 1030 | 1210 |
| 22 | Advance received | ПлатежноеПоручениеВходящее | 1030 | 3510 |
| **Tax cycle** | | | | |
| 23 | КПН accrual (year-end) | ОперацияБух | 7710 | 3110 |
| 24 | VAT payment | ПлатежноеПоручениеИсходящее | 3131 | 1030 |
| 25 | ОПВ payment | ПлатежноеПоручениеИсходящее | 3220 | 1030 |
| 26 | СО payment | ПлатежноеПоручениеИсходящее | 3211 | 1030 |
| 27 | ИПН payment | ПлатежноеПоручениеИсходящее | 3120 | 1030 |
| 28 | КПН payment | ПлатежноеПоручениеИсходящее | 3110 | 1030 |
| **Fixed assets** | | | | |
| 29 | Acquisition | ПринятиеКУчетуОС | 2410 | 3310 |
| 30 | Non-production depreciation | ЗакрытиеМесяца | 7210 | 2420 |
| **Year-end (реформация)** | | | | |
| 31 | Close revenue | ЗакрытиеМесяца | 6010 | 5710 |
| 32 | Close COGS / admin / interest / other | ЗакрытиеМесяца | 5710 | 7010, 7210, 7310, 7480 |
| 33 | Close КПН | ЗакрытиеМесяца | 5710 | 7710 |
| 34 | Реформация (profit) | ЗакрытиеМесяца | 5710 | 5610 |
| 35 | Carry to prior years | (next year open) | 5610 | 5620 |

---

## A.3 Cross-account validation rules

### VAT (НК РК Гл. 35 — НДС 12 %)

> ⚠️ **Convention in KZ 1С**: account `6010` stores **net** revenue (without VAT), account `3131` stores VAT separately. Account `3310` (suppliers) stores **gross** purchases (with VAT).

- `Σ 3131 (Кт turnover) ≈ Σ 6010 (Кт turnover, net) × 12 %` (tolerance ±1 %)
- `Σ 1421 (Дт turnover) ≈ Σ 3310 (Кт turnover, gross) × 12 / 112` (only for VAT-payer suppliers)
- Σ ЭСФ выданные ≈ Σ (6010 + 3131) per period
- НДС к уплате = `3131 Кт turnover − 1421 Дт turnover`

### Payroll (НК РК Гл. 19 + Закон о пенсии 2026)
For salary base `B` per employee per accrual:
- ОПВ (3220 Кт) = `B × 10 %`  (МЗП ≤ B ≤ 50 × МЗП)
- ОППВ (3250 Кт) = `B × 5 %` (employer; introduced 01.01.2025)
- СО (3211 Кт) = `(B − ОПВ) × 3.5 %` (base bounded 1×МЗП…7×МЗП)
- ВОСМС (3213 Кт) = `B × 3 %` (employer)
- ОСМС-раб (3212 Кт) = `B × 2 %` (employee)
- ИПН (3120 Кт) = `max(0, B − ОПВ − ОСМС − 14×МРП) × 10 %`
- СН (3150 Кт) = `max(0, (B − ОПВ − ОСМС) × 9.5 % − СО)`

Constants 2026: **МРП = 3 692 ₸**, **МЗП = 85 000 ₸**, standard ИПН deduction = `14 × МРП = 51 688 ₸`.

### Production & COGS
- During harvest: `Δ(1320 Дт turnover) = Δ(8112 Кт turnover)` per period
- During sales: `Δ(7010 Дт turnover) = Δ(1320 Кт turnover)`
- 8112 Дт turnover ≈ Σ (materials + payroll + employer charges + depreciation + overhead from 8412)
- After harvest: 8112 closing → 0 (tolerance: ≤ 100 000 ₸)

### КПН (Ст. 285 — agro reduction 70 %)
- Прибыль до налогов = `Σ доходы (6xxx Кт turnover) − Σ расходы (7010 + 7210 + 7310 + 7410 + 7480 Дт turnover)`
- КПН расчётный = `Прибыль × 20 % × 30 %`  *(20% nominal × 30% remaining after −70% agro reduction)*
- 3110 Кт turnover (December) should equal КПН расчётный ± 0.5 %

---

## A.4 Period-close readiness checklist

Before posting `ЗакрытиеМесяца`:
1. All Реализация posted (Posted = true)
2. All Поступление posted
3. All ПлатежноеПоручение posted
4. All НачислениеЗарплаты posted
5. All ОперацияБух reviewed (no unjustified manual entries)
6. Depreciation calculated for current month (производственная + админ)
7. ЭСФ registered for every Реализация
8. Bank statement reconciled (no orphan 1030 movements)
9. 8112 status correct (carry during season, close at harvest)
10. 3350 balance reconciles with payroll docs
11. Tax accruals match calculations (3220, 3211, 3212, 3213, 3250, 3120, 3150)
12. VAT register consistent (3131 vs 6010, 1421 vs purchases)

---

## A.5 Document-line integrity rules

**Per line:**
- `amount ≈ qty × price` (±0.01)
- VAT exclusive (Сумма without НДС): `total = amount + amount × rate / 100`
- VAT inclusive (Сумма with НДС): `vat = total × rate / (100 + rate)`

**Per document header:**
- `Σ line.amount = header.СуммаДокумента` (within ±1 ₸ rounding tolerance)
- `Σ line.НДС = header.СуммаНДС`

**Per nomenclature → account mapping:**
- Готовая продукция → 1320
- Сырьё / материалы → 1310
- Товары → 1330
- Услуги → 7xxx (admin) or 8xxx (production)

---

## A.6 Reconciliation rules

### Contractor
- A/R 1210 closing Дт > 0 → contractor must have invoice (Реализация) within last 12 months
- A/R aging > 60 days → flag (configurable per contract)
- A/P 3310 closing Кт > 0 → contractor must have receipt (Поступление) within last 12 months
- 3510 advances older than 90 days without offsetting delivery → flag for return/supply

### Bank
- Every posted ПлатежноеПоручениеИсходящее with date ≤ today must have `Оплачено = true` within 3 days
- 1030 daily closing balance never < 0 (within working hours)

---

## A.7 Finding format (output contract)

Every validator returns `ValidationReport`:

```json
{
  "ruleSet": "IntegrityValidator",
  "period": { "from": "2025-01-01", "to": "2025-12-31" },
  "organizationGuid": "41c5d9a6-...",
  "findings": [
    {
      "ruleId": "INT-002",
      "ruleName": "Atypical credit balance on asset account",
      "severity": "warn",
      "category": "integrity",
      "description": "Account 3050 closing Кт = −5 318 ₸ (negative credit balance on liability)",
      "affected": {
        "accountCode": "3050",
        "actual": -5318,
        "expected": 0
      },
      "suggestedFix": "Review ОперацияБух entries on account 3050 in the period — likely a sign error in a manual posting.",
      "ruleSource": "kz-agro-validation-rules.md#A.1"
    }
  ],
  "summary": { "info": 0, "warn": 1, "error": 0, "critical": 0 },
  "executionMs": 423
}
```

Severity levels:
- `info` — informational, no action required
- `warn` — likely issue, manual review recommended
- `error` — confirmed accounting violation, must fix
- `critical` — financial-statement or tax-return impact
