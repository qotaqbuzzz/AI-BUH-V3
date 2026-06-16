# SKILL: Отчёт для директора (Management Report)

**Trigger:** "отчёт директору" / "management report" / "сводка для руководства" / "как дела у бизнеса"
**Role:** CFO, переводящий бухгалтерские данные в язык бизнеса для директора.

## Required inputs
```
tenantId, organizationGuid
dateFrom (default: current year start), dateTo (default: today)
```

## Workflow (parallel where possible)

**Step 1 — Full data collection**
```
PARALLEL:
  onec_get_financial_summary(organizationGuid, date: dateTo)
  onec_get_monthly_trend(dateFrom, dateTo, organizationGuid)
  onec_get_all_debtors(organizationGuid, date: dateTo)
  onec_get_all_creditors(organizationGuid, date: dateTo)
  onec_anomaly_full_scan(organizationGuid, dateFrom, dateTo, minSeverity:"high")
```

**Step 2 — Full Markdown report**
```
onec_generate_full_report(organizationGuid, dateFrom, dateTo)
  → auto-detects industry (agro/manufacturing/trade/services)
  → 20-section report with benchmarks
  → saves to C:\Users\PC\Desktop\AI-BOS-2.0\Аналитика_[org]_[date].md
```

**Step 3 — Executive dashboard (extracted from report)**
```
Compute from collected data:

KEY METRICS:
  Revenue:          total sales (6010 Кт turnover)
  Gross profit:     revenue − COGS (7010)
  Gross margin %:   grossProfit / revenue × 100
  Net cash:         1010 + 1030
  AR days:          (1210 / revenue) × 365
  AP days:          (3310 / COGS) × 365
  Debt/equity:      (3010+3020+4010+4020) / equity5

TOP 3 RISKS (from anomaly scan findings):
  1. [highest severity finding]
  2. [second finding]
  3. [third finding]

TOP 3 ACTIONS (specific, 30-day horizon):
  Derived from findings + cash position + unclosed items
```

**Step 4 — Industry benchmarks**
```
Apply from onec_generate_full_report industry detection:
  agro:         liquidity >0.15x, leverage <40%, margin >20%
  manufacturing: liquidity >0.2x, leverage <60%, margin >15%
  trade:         liquidity >0.1x, leverage <70%, margin >8%
  services:      liquidity >0.3x, leverage <30%, margin >25%
Compare company ratios vs benchmarks → 🔴/🟠/✅
```

## Plain-language translation rules
```
"ДЗ"         → "деньги, которые нам должны клиенты"
"КЗ"         → "деньги, которые мы должны поставщикам"
"1710"        → "авансы поставщикам без поставки"
"8112"        → "затраты в поле (посевная/урожай)"
"ЗакрытиеМесяца не проведено" → "бухгалтерия не финализирована — цифры предварительные"
"НДС к уплате"  → "долг перед налоговой по НДС"
```

## Output format
```
## Управленческий отчёт: [org name]
## Период: [dateFrom] – [dateTo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 КЛЮЧЕВЫЕ ЦИФРЫ
  Выручка:            X ₸    (vs пред. период: ±Y%)
  Валовая прибыль:    X ₸    (маржа: Z%)
  Операционная прибыль: X ₸
  Деньги на счетах:   X ₸    [🔴/🟠/✅]
  Долг клиентов:      X ₸    (оборачиваемость: N дней)
  Долг поставщикам:   X ₸

📊 ИНДИКАТОРЫ  (отрасль: [industry])
  Ликвидность:   X  норма [benchmark]  [✅/⚠️]
  Долговая нагр: X% норма [benchmark]  [✅/⚠️]
  Рентабельность: X% норма [benchmark] [✅/⚠️]

🚨 ТОП-3 РИСКА
  🔴 [risk 1 in plain Russian]
  🟠 [risk 2]
  🟡 [risk 3]

✅ ТОП-3 ДЕЙСТВИЯ (следующие 30 дней)
  1. [specific action, person responsible, deadline]
  2. ...
  3. ...

📄 Полный отчёт: [file path]
```
