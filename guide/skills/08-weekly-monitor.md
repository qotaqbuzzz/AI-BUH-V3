# SKILL: Еженедельный мониторинг (Weekly Financial Monitor)

**Trigger:** "еженедельный мониторинг" / "Monday report" / "сводка за неделю" / "как дела у компании"
**Role:** CFO-ассистент, делающий еженедельный срез состояния компании.

## Required inputs
```
tenantId, organizationGuid
weekFrom = last Monday, weekTo = today
ytdFrom = YYYY-01-01
```

## Workflow (all calls in parallel where possible)

**Step 1 — Cash position (CRITICAL first)**
```
onec_get_financial_summary(organizationGuid, date: today)
  → cash (1010+1030): current balance
  → if cash < monthly_payroll_estimate → ALERT: liquidity risk
```

**Step 2 — Overdue receivables**
```
onec_get_all_debtors(organizationGuid, date: today)
  → total AR, top 5 contractors
onec_drill_stale_advances(date: today, "1710", organizationGuid, agingDays: 90)
  → advances older than 90 days without delivery
```

**Step 3 — Payments this week**
```
onec_get_payments_in(weekFrom, weekTo, organizationGuid)
  → total received, top payors
onec_get_payments_out(weekFrom, weekTo, organizationGuid)
  → total paid, top payees
  → net cash flow this week
```

**Step 4 — Anomaly quick scan (last 7 days)**
```
onec_anomaly_full_scan(organizationGuid, weekFrom, weekTo,
                       minSeverity: "high",
                       largeAmountThreshold: 20_000_000)
  → critical/high findings only
  → if critical → escalate immediately
```

**Step 5 — Unposted documents check**
```
onec_get_unposted_documents("РеализацияТоваровУслуг",
                            weekFrom, weekTo, organizationGuid)
  → count > 0 → revenue not in books
onec_get_unposted_documents("ПоступлениеТоваровУслуг",
                            weekFrom, weekTo, organizationGuid)
  → count > 0 → expenses not recognized
```

**Step 6 — Docflow tasks (if configured)**
```
onec_docflow_get_overdue(top: 20)
  → overdue approvals, contracts waiting signature
```

**Step 7 — YTD P&L pulse**
```
onec_get_monthly_trend(ytdFrom, today, organizationGuid)
  → last month: revenue vs prior month delta %
  → operating profit trend: improving or declining?
```

## Traffic light thresholds
```
Cash:       🔴 < 1 month payroll | 🟠 1–3 months | ✅ > 3 months
AR overdue: 🔴 > 30% total AR | 🟠 15–30% | ✅ < 15%
Anomalies:  🔴 any critical | 🟠 >3 high | ✅ 0–2 medium
Unposted:   🔴 > 10 docs | 🟠 1–10 | ✅ 0
```

## Output format
```
## Мониторинг [date]  |  [org name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 ДЕНЬГИ
  Остаток сейчас:    X ₸   [🔴/🟠/✅]
  Поступило (неделя): +X ₸
  Выплачено (неделя): −X ₸
  Нетто:              ±X ₸

📋 ДЕБИТОРЫ
  Всего ДЗ:   X ₸  |  Топ: [name] X ₸
  Авансы >90д: X ₸  [🔴/✅]

⚡ АНОМАЛИИ (неделя)
  [count] находок — [🔴/🟠/✅]
  [top finding if any]

📝 НЕПРОВЕДЁННЫЕ ДОКУМЕНТЫ: N  [🔴/✅]

📊 P&L ТРЕНД (последний месяц)
  Выручка: X ₸  (Δ vs пред. мес.: ±Y%)
  Операционная прибыль: X ₸

⚠️  ТРЕБУЕТ ВНИМАНИЯ:
  [prioritized action list]
```
