# Anomaly Domain — onec_anomaly_*

**Entry point:** always start with `onec_anomaly_full_scan`.
Each finding has a `toolHint` pointing to the focused drill-down tool.

## Tool map
```
onec_anomaly_full_scan          — all 10 contexts in one call → prioritized findings[]
  ├── ML z-score               → onec_anomaly_duplicates / onec_anomaly_round_amounts
  ├── large transactions       → onec_anomaly_large_tx
  ├── duplicate payments       → onec_anomaly_duplicates
  ├── advances 1710 >100M      → onec_anomaly_advances_risk
  ├── unclosed periods         → onec_anomaly_unclosed_periods
  └── ESF gaps                 → onec_drill_missing_esf
```

## 1. onec_anomaly_full_scan
```typescript
input:  { tenantId, organizationGuid, dateFrom, dateTo,
          minSeverity?: "critical"|"high"|"medium"|"low"|"info",
          largeAmountThreshold?: number }   // default 50_000_000 ₸
output: { findings: AnomalyFinding[], bySeverity, errors[] }
```
`AnomalyFinding` shape:
```typescript
{
  id:            string;
  severity:      "critical"|"high"|"medium"|"low"|"info";
  context:       string;
  title:         string;
  description:   string;
  action:        string;   // required — what to do about this finding
  amount?:       number;
  guid?:         string;
  date?:         string;
  counterparty?: string;
  toolHint?:     string;   // next tool to call for drill-down
}
```

## 2. onec_anomaly_large_tx
```typescript
input:  { tenantId, organizationGuid, dateFrom, dateTo,
          threshold?: number, topN?: number }
output: { transactions[{date,amount,documentType,recorderGuid,content}],
          byDocumentType[], nextStep }
// recorderGuid → onec_resolve_guid
```

## 3. onec_anomaly_duplicates
```typescript
input:  { tenantId, organizationGuid, dateFrom, dateTo,
          windowHours?: number, onlyHighRisk?: boolean, minAmount?: number }
output: { pairs[{riskLevel,amount,dates,docGuids}], summary }
// pair.docGuid → onec_resolve_guid
```

## 4. onec_anomaly_round_amounts
```typescript
input:  { tenantId, organizationGuid, dateFrom, dateTo,
          minAmount?: number,   // default 10M
          divisor?:   number }  // default 1M
output: { items[{amount,count,riskLevel,occurrences[{recorderGuid}]}] }
```

## 5. onec_anomaly_night_entries
```typescript
input:  { tenantId, organizationGuid, dateFrom, dateTo,
          workdayStart?: 0-23, workdayEnd?: 0-23, minAmount?: number }
output: { nightEntriesCount, likelyReglamenty, byHour[], byDocumentType[], topEntries[] }
// likelyReglamenty=true → normal (ЗакрытиеМесяца etc.)
```

## 6. onec_anomaly_transit
```typescript
input:  { tenantId, organizationGuid, dateFrom, dateTo,
          windowDays?: 1-30, minAmount?: number }
output: { pairs[{amount,outDate,inDate,daysDiff,outGuid,inGuid,interpretation}] }
```

## 7. onec_anomaly_concentration
```typescript
input:  { tenantId, organizationGuid?, asOfDate,
          warnThresholdPct?: number, critThresholdPct?: number }
output: { analyses[{label,topContractor,topPct,riskLevel,top5[]}], overallRisk }
// covers: AR 1210, AP 3310, Advances 1710
```

## 8. onec_anomaly_advances_risk
```typescript
input:  { tenantId, organizationGuid?, asOfDate, dateFrom, agingDays?: number }
output: { total1710, totalAR1210, ratio, riskFlag, breakdown[{contractor,pct,risk}] }
// riskFlag set when 1710 > 1210 — critical liquidity signal
```

## 9. onec_anomaly_loan_analysis
```typescript
input:  { tenantId, organizationGuid?, asOfDate, dateFrom }
output: { summary{shortTerm,longTerm,total,leveragePct,riskLevel},
          shortTermLoans[], longTermLoans[], flags[] }
// accounts: 3010,3020,3030 (short) + 4010,4020,4030,4150 (long)
```

## 10. onec_anomaly_unclosed_periods
```typescript
input:  { tenantId, organizationGuid, year: number }
output: { unclosedCount, riskLevel, months[{period,closed,issues[]}], closingPlan[] }
```

## Severity ladder
```
critical → immediate action
high     → investigate this week
medium   → include in next audit
low/info → informational
```
