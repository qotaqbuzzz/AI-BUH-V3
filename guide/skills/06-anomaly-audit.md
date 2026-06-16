# SKILL: Аудит аномалий (Anomaly Audit)

**Trigger:** "аудит аномалий" / "проверить риски" / "подозрительные операции" / "anomaly audit"
**Role:** Внутренний аудитор, выявляющий нарушения в учёте по НК РК.

## Required inputs
```
organizationGuid, dateFrom, dateTo, tenantId
minSeverity: "high" (default) or "medium"
largeAmountThreshold: 50,000,000 ₸ (default)
```

## Workflow

**Step 1 — Full scan (entry point)**
```
onec_anomaly_full_scan(organizationGuid, dateFrom, dateTo,
                       minSeverity: "medium",
                       largeAmountThreshold: 50_000_000)
  → findings[] sorted by severity
  → process each finding by its toolHint (Steps 2–7)
```

**Step 2 — Large transactions (if LARGE_TX finding)**
```
onec_anomaly_large_tx(organizationGuid, dateFrom, dateTo, threshold: 50M)
  → for each transaction:
      interpret: state subsidy 6230? loan payment 3010? bank deposit?
      recorderGuid → onec_resolve_guid(recorderGuid)
      → document header + contractor + postings
```

**Step 3 — Duplicate payments (if DUPLICATES finding)**
```
onec_anomaly_duplicates(organizationGuid, dateFrom, dateTo,
                        windowHours: 48, onlyHighRisk: false)
  → high-risk pairs → onec_resolve_guid(pair.docGuid) for each
  → KZ context: same contractor + same amount + same day = likely duplicate
  → ask user: intentional? if not → flag for reversal
```

**Step 4 — Round amounts (if ML_ROUND finding)**
```
onec_anomaly_round_amounts(organizationGuid, dateFrom, dateTo,
                           minAmount: 10M, divisor: 1M)
  → riskLevel = critical (≥100M) or high (≥50M) → investigate
  → KZ context: round amounts common in loan tranches (normal)
                but rare in goods payments (suspicious)
```

**Step 5 — Night entries (if ML_NIGHT finding)**
```
onec_anomaly_night_entries(organizationGuid, dateFrom, dateTo)
  → likelyReglamenty = true → NORMAL (ЗакрытиеМесяца at night)
  → likelyReglamenty = false → INVESTIGATE: who posted, why
  → check byDocumentType for ОперацияБух at night → red flag
```

**Step 6 — Advances risk (if ADVANCES_1710)**
```
onec_anomaly_advances_risk(organizationGuid, asOfDate: dateTo, dateFrom)
  → 1710 > 1210 (AR) → CRITICAL liquidity risk
  → top contractor > 50% of total → concentration risk
  → onec_drill_stale_advances(date, "1710", organizationGuid, agingDays: 90)
```

**Step 7 — Unclosed periods (if UNCLOSED_PERIODS)**
```
onec_anomaly_unclosed_periods(organizationGuid, year)
  → list unclosed months
  → consequence: финансовый результат недостоверен
  → invoke skill 01-period-close.md for each unclosed month
```

**Step 8 — ML scan (supplementary)**
```
onec_ml_scan_anomalies(organizationGuid, dateFrom, dateTo,
                       minConfidence: 75)
  → anomalies[].confidence ≥ 90 → CRITICAL
  → cross-reference with manual findings from Steps 2–7
```

## KZ interpretation rules
```
Large amounts that are NORMAL in KZ:
  - State agro subsidies (6230): round amounts, often >50M ₸
  - Агросиндикат/КазАгроФинанс loans: large round tranches
  - Overnight bank deposits (overnight repo): money out+back in 24h

Large amounts that are SUSPICIOUS:
  - ОперацияБух with round amount and no clear description
  - Same contractor, same amount, different dates without contract
  - Payments to contractors with zero prior history
```

## Output format
```
## Аудит аномалий [dateFrom]–[dateTo]
Всего находок: N  (критических: X, высоких: Y, средних: Z)

🔴 КРИТИЧНО:
  [id] [title] — [amount] ₸ — [action]

🟠 ВЫСОКИЙ РИСК:
  [id] [title] — [action]

🟡 СРЕДНИЙ:
  [id] [title]

Рекомендуемые следующие шаги:
1. [specific action with tool name]
```
