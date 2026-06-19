# KZ Agro Costing Flow Reference

## Cost Flow (8110/8112 → 1320 → 7010)

```
Inputs into production (Дт 8110/8112):
  ← 1310  Сырьё и материалы (семена, удобрения, ГСМ, запчасти) — ТребованиеНакладная
  ← 3350  Зарплата полевого персонала — НачислениеЗарплатыРаботникамОрганизаций
  ← 3211  СО работодателя — НачислениеЗарплаты…
  ← 3213  ВОСМС работодателя — то же
  ← 3250  ОППВ работодателя — то же
  ← 2420  Амортизация производственной техники — ЗакрытиеМесяца
  ← 8412  Распределённые накладные растениеводства — ЗакрытиеМесяца

Harvest capitalisation (Дт 1320 ← Кт 8112):
  Document: ОприходованиеИзПроизводства / ЗакрытиеМесяца (расчёт себестоимости)
  ExtDimension1 = Номенклатура (пшеница, ячмень, …)
  ExtDimension2 = Склад
  ← HERE 1С computes the unit cost per nomenclature

COGS on sale (Дт 7010 ← Кт 1320):
  Document: РеализацияТоваровУслуг
  ExtDimension1 = Номенклатура
```

## Account Roles

| Account | Role | Subconto (ExtDimension1) |
|---------|------|--------------------------|
| 8110 | Основное производство (агро) | Нет (cost is NOT split by nomenclature here) |
| 8112 | НЗП растениеводства (субсчёт 8110 в КЗ-плане) | Нет |
| 1320 | Готовая продукция | **Номенклатура** + Склад |
| 7010 | Себестоимость реализации | Номенклатура |

**Key**: account 8110/8112 has **no nomenclature subconto** in the Kazakhstan standard chart of accounts. Cost attribution to a specific crop (пшеница, ячмень) happens only after 1С runs "Расчёт себестоимости" inside ЗакрытиеМесяца, which writes 1320 ← 8112 and attaches the nomenclature dimension.

## Unit Cost Formulas

```
production_unit_cost(nom, period) =
    Σ СуммаTurnoverDr  on 1320 where ExtDimension1 = nom
  / Σ КоличествоTurnoverDr on 1320 where ExtDimension1 = nom

cogs_unit_cost(nom, period) =
    Σ СуммаTurnoverDr  on 7010 where ExtDimension1 = nom
  / Σ КоличествоTurnoverCr on 1320 where ExtDimension1 = nom   (qty sold)
```

**Difference**: `production_unit_cost` = cost capitalised at harvest time. `cogs_unit_cost` = cost expensed when sold. They should be materially equal under weighted-average (FIFO) with a stable cost base. A large divergence (>5 %) indicates an inventory layer problem or a revaluation.

## COGS Composition Categories

| Corr-account | Category | Label | Typical document |
|---|---|---|---|
| 1310 | materials | Сырьё и материалы | ТребованиеНакладная |
| 3350 | payroll | Зарплата персонала | НачислениеЗарплатыРаботникамОрганизаций |
| 3211 | payroll-tax | СО работодателя | НачислениеЗарплаты… |
| 3213 | payroll-tax | ВОСМС работодателя | то же |
| 3250 | payroll-tax | ОППВ работодателя | то же |
| 2420 | depreciation | Амортизация техники | ЗакрытиеМесяца |
| 8412 | overhead | Накладные растениеводства | ЗакрытиеМесяца |

Typical KZ-agro cost structure: **materials 50–65 %**, payroll (incl. taxes) 15–25 %, depreciation 5–15 %, overhead 5–10 %.

## Tolerances and Cross-Checks

- `Σ(producedCost across all nomenclatures)` ≈ `Σ(8112 Кт turnover)` within ±1 % — confirms harvest capitalisation is complete.
- `production.unitCost` ≈ `inventory.avgCostAtClose` — large gap means a cost-revaluation or inventory write-down was posted.
- `production.qty` ≥ `cogs.qty` — sold quantity should not exceed produced quantity for the same period (unless opening inventory existed).

## KZ Specifics

- **8110 vs 8112**: in Kazakhstan the standard plan uses 8110 as the parent and 8112 as the sub-account for растениеводство. Both behave identically for costing purposes.
- **Агро-льгота КПН 70 %**: this is a tax reduction, not a costing topic — see `kz-agro-validation-rules.md#A.3`.
- **МЗП / МРП**: salary-related rules are in the validation rulebook, not here.
