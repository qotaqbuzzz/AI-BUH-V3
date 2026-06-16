# SKILL: Агропромышленный цикл (Agro Production Cycle)

**Trigger:** "агро" / "НЗП растениеводства" / "урожай" / "8112" / "посевная" / "уборка"
**Role:** Бухгалтер АПК, контролирующий производственный цикл по НК РК Ст.285.

## Seasonal decision table
```
Month   Action
──────────────────────────────────────────────────────────
Jan-Feb  8112 ~ 0 (яровые) or small (озимые) — verify
Mar-Apr  8112 grows: seeds (1310→8112), fuel, fertilizer
May-Jun  8112 continues growing: labor (3350→8112), SX
Jul-Oct  HARVEST: 8112→1320 capitalization, compute unit cost
Nov-Dec  8112 must be ~0 for яровые; озимые → small balance OK
```

## Workflow

**Step 1 — Determine current season**
```
currentMonth = today.month
if 11 ≤ month ≤ 12 OR month ≤ 2 → winter check (Step 2)
if 3 ≤ month ≤ 6 → spring check (Step 3)
if 7 ≤ month ≤ 10 → harvest check (Step 4)
```

**Step 2 — Winter check**
```
onec_validate_wip_closure(year, currentMonth, organizationGuid)
  → 8112 > 5,000,000 ₸ AND month = Nov/Dec → CRITICAL: урожай не оприходован
  → onec_drill_wip_documents(dateFrom, dateTo, organizationGuid)
    → shows inputs vs outputs for 8112
    → identify missing 8112→1320 document
```

**Step 3 — Spring check**
```
onec_get_production_costs(organizationGuid, date: today)
  → wip8110/8112 growing → normal
onec_get_cogs_composition(dateFrom, dateTo, organizationGuid)
  → verify cost structure: materials 40-60%, labor 15-25%, fuel 10-20%
onec_get_real_production_costs(dateFrom, dateTo, organizationGuid)
  → real costs excluding internal transfers
```

**Step 4 — Harvest check**
```
onec_get_nomenclature_unit_cost(nomenclatureGuid: wheatGuid, dateFrom, dateTo)
  → productionUnitCost = cost per tonne (typical KZ: 15,000–35,000 ₸/т)
  → if > 60,000 ₸/т → WARN: abnormally high, check НЗП routing

onec_analyze_account("8112", dateFrom, dateTo, organizationGuid)
  → byCorrAccount: materials %, labor %, overhead %
  → turnoverCr (=harvest to 1320): matches physical harvest?

onec_get_finished_goods_balance(organizationGuid, date: today)
  → 1320 should grow during harvest months
```

**Step 5 — КПН agro estimate**
```
onec_get_kpn_estimate(organizationGuid, dateFrom, dateTo, isAgro: true)
  → effective rate = 6% (not 20%) per Art.285 −70% reduction
  → condition: ≥90% revenue from agricultural activities
  → check: onec_get_monthly_trend → revenue split agro vs non-agro
```

**Step 6 — Biological assets**
```
onec_get_osv(dateFrom, dateTo, organizationGuid)
  → 2521 (основное стадо КРС) — cattle herd
  → 2950 (животные на откорме)
  → check fair value revaluation posted if livestock company
```

## Output format
```
## Агро цикл — [season] [YYYY]
Текущая фаза: [весенняя посевная / уборка урожая / зимний период]
НЗП 8112: X ₸  — [✅ норма / ⚠️ проверить / 🔴 критично]
Себестоимость 1 тонны: X ₸/т  (норма КЗ: 15–35 тыс ₸/т)
КПН агро (Ст.285): X ₸ @ 6%  (экономия vs 20%: Y ₸)
Биоактивы: X ₸ (КРС + откорм)
```

## KZ agro specifics
```
Art.285 НК РК: КПН −70% if ≥90% revenue is agricultural
Crops: пшеница, ячмень, лён, рапс, подсолнечник, чечевица
Livestock: КРС (крупный рогатый скот), ЛПХ
Harvest season KZ: July (ранние) → September (поздние)
8112 vs 8110: 8112 = растениеводство specifically, 8110 = general WIP
```
