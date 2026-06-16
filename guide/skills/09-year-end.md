# SKILL: Закрытие года / Реформация баланса (Year-End Close)

**Trigger:** "закрытие года" / "реформация баланса" / "year-end close" / "закрыть декабрь"
**Role:** Главный бухгалтер, выполняющий годовое закрытие по НК РК и МСФО КЗ.

## Required inputs
```
year (e.g. 2025), tenantId, organizationGuid
```

## Workflow

**Step 1 — Verify all 12 months closed**
```
onec_anomaly_unclosed_periods(organizationGuid, year)
  → unclosedCount > 0 → STOP
  → for each unclosed month: invoke skill 01-period-close.md
  → do NOT proceed until all 12 months show ✅
```

**Step 2 — Full integrity check**
```
onec_validate_double_entry(YYYY-01-01, YYYY-12-31, organizationGuid)
onec_validate_account_signs(YYYY-01-01, YYYY-12-31, organizationGuid)
onec_validate_balance_arithmetic(YYYY-01-01, YYYY-12-31, organizationGuid)
  → ANY failure → fix before year-end reform
```

**Step 3 — Final tax position**
```
onec_get_kpn_estimate(organizationGuid, YYYY-01-01, YYYY-12-31, isAgro?)
  → taxableBase, кPNAmount
  → compare to 3110 Кт (accrued КПН)
  → delta → post КПН adjustment ОперацияБух ← CONFIRM
onec_validate_vat_charged_vs_revenue(YYYY-01-01, YYYY-12-31, organizationGuid)
onec_validate_payroll_tax_rates(YYYY-01-01, YYYY-12-31, organizationGuid)
```

**Step 4 — Fixed assets year-end**
```
onec_get_fixed_assets(organizationGuid, date: YYYY-12-31)
  → residualValue per asset
  → износ (wear) > 100% → должны быть списаны или переоценены
  → check: depreciation posted for ALL 12 months
```

**Step 5 — Final P&L**
```
onec_get_pl_summary(organizationGuid, YYYY-01-01, YYYY-12-31)
  → netProfit (5610 Кт balance)
  → if loss: 5610 Dr balance
```

**Step 6 — Реформация баланса**
```
netProfit = cr(5610) - dr(5610)
if netProfit > 0:
  → instruct user to post ОперацияБух:
    Дт 5610  Кт 5510   amount: netProfit
    (transfer current-year profit to retained earnings)
if netProfit < 0:
  → instruct user to post ОперацияБух:
    Дт 5510  Кт 5610   amount: abs(netProfit)
    (cover loss from retained earnings)
← CONFIRM WITH USER before creating document
```

**Step 7 — Final OSV**
```
onec_get_osv(YYYY-01-01, YYYY-12-31+1day, organizationGuid)
  → 5610 should be ZERO after reform
  → 5510 = accumulated retained earnings
  → generate final report
onec_generate_full_report(organizationGuid, YYYY-01-01, YYYY-12-31)
```

## KZ year-end deadlines
```
КПН declaration (100.00):   March 31 of following year
НДС Q4 declaration (300.00): January 15 of following year
ОПВ/СО/ВОСМС December:      January 25 of following year
Financial statements:        March 31 (ТОО), April 30 (АО)
Статистика (КИИС):          varies by form, typically Feb-Apr
```

## Output format
```
## Закрытие года [YYYY]  |  [org]
Статус месяцев: 12/12 закрыты ✅
Целостность учёта: ✅/❌
Годовой результат: +/− X ₸
Реформация: Дт 5610 / Кт 5510  X ₸  [posted/pending]
Отчётность: [saved to file]
Налоговые сроки: [reminder list]
```
