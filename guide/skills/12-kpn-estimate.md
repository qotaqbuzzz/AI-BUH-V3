# SKILL: Расчёт КПН (Corporate Income Tax Estimate)

**Trigger:** "КПН" / "корпоративный подоходный налог" / "CIT estimate" / "налог на прибыль" / "авансы КПН"
**Role:** Налоговый бухгалтер, рассчитывающий КПН по НК РК Ст.313 (или Ст.285 для агро).

## Required inputs
```
tenantId, organizationGuid
dateFrom, dateTo (quarter or YTD)
isAgro: boolean (true if ≥90% revenue from agriculture — Art.285)
```

## КПН rules НК РК 2026
```
Standard rate:   20%  (Ст.313)
Agro reduction:  −70% → effective rate = 6%  (Ст.285, condition: ≥90% agro revenue)
Advance КПН:     monthly by 20th of each month, based on prior year ÷ 12
Annual КПН:      declaration 100.00 by March 31
Prepayments:     if advance > actual → refund or carry forward
Not deductible:  penalties, dividends, personal expenses of owners
```

## Workflow

**Step 1 — Revenue breakdown**
```
onec_get_monthly_trend(dateFrom, dateTo, organizationGuid)
  → revenue per month (6010)
  → agro revenue vs total: is share ≥ 90%?
  → if borderline: onec_get_sales_report to see product types
```

**Step 2 — P&L base**
```
onec_get_pl_summary(organizationGuid, dateFrom, dateTo)
  → revenue (6010 Кт)
  → COGS (7010 Дт)
  → overhead (7210 Дт)
  → grossProfit = revenue − COGS
  → operatingProfit = grossProfit − overhead
```

**Step 3 — Expense quality check**
```
onec_get_cogs_composition(dateFrom, dateTo, organizationGuid)
  → identify non-deductible items:
    - entertainment (> 1% of revenue → excess not deductible)
    - penalties to contractors (not deductible)
    - depreciation on personal-use assets (not deductible)
onec_detect_anomalies(dateFrom, dateTo, organizationGuid)
  → ОперацияБух entries without clear business purpose → potentially non-deductible
```

**Step 4 — KPH estimate**
```
onec_get_kpn_estimate(organizationGuid, dateFrom, dateTo, isAgro)
  → taxableBase
  → kpnAmount (at 20% or 6% agro)
  → compare to 3110 Кт closing balance (КПН начисленный)
  → delta:
      3110 > estimate → overpaid advances, refund possible
      3110 < estimate → underpaid → post additional 3110 accrual
```

**Step 5 — Advance payment check**
```
onec_get_account_balance("3110", organizationGuid, date: dateTo)
  → 3110 Кт balance = total КПН accrued
onec_get_accounting_turnovers("3110", dateFrom, dateTo, organizationGuid)
  → turnoverDr = КПН actually paid to budget
  → balance = outstanding
  → monthly advance due = annual КПН ÷ 12 (based on prior year)
```

**Step 6 — Agro eligibility verification**
```
if isAgro = true:
  onec_get_monthly_trend(dateFrom, dateTo, organizationGuid)
  → revenueFromAgro / totalRevenue ≥ 90% → Art.285 applies
  → < 90% → USE 20% rate, alert user
  Also check: agro revenue excludes processing/trade margins
```

**Step 7 — Payroll tax quick reconcile**
```
onec_calculate_payroll_taxes(grossSalary: avgMonthlyPayroll / headcount)
  → verify employer charges correctly estimated for КПН deduction base
  → employer charges (ОППВ, СО, ВОСМС, СН) ARE deductible from КПН base
```

## Output format
```
## КПН расчёт [dateFrom]–[dateTo]  |  [org]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Выручка:              X ₸
COGS + расходы:      (X) ₸
Налогооблагаемая база: X ₸
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ставка КПН: [20% / 6% агро (Ст.285)]
КПН к уплате: X ₸
Начислено (3110): X ₸
Уплачено в бюджет: X ₸
Остаток к уплате: ±X ₸  [дата следующего аванса]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Агро статус: ✅ ≥90% / ⚠️ < 90% — применить 20%
Ближайший срок: [20-е число следующего месяца]
```
