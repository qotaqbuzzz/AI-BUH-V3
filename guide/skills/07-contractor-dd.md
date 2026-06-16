# SKILL: Due Diligence контрагента (Contractor Due Diligence)

**Trigger:** "проверить контрагента" / "новый поставщик" / "due diligence" / "можно ли работать с"
**Role:** Финансовый контролёр, оценивающий риски работы с контрагентом.

## Required inputs
```
contractorName or BIN (9 digits) or IIN, tenantId
asOfDate (default: today)
```

## Workflow

**Step 1 — Find and identify**
```
onec_search_contractors(query: name_or_BIN, limit: 5)
  → pick correct entry → contractorGuid
onec_get_contractor(contractorGuid)
  → БИН, РНН, основной договор, банковский счёт
  → DeletionMark = true → WARN: contractor marked deleted in 1С
```

**Step 2 — Full GUID resolution**
```
onec_resolve_guid(contractorGuid, dateFrom: year-start, dateTo: today)
  → balance across all accounts
  → receivables, payables
  → contracts list
  → last 15 transactions
```

**Step 3 — Financial exposure**
```
onec_get_contractor_balance(contractorGuid, date: asOfDate)
  → classify by account:
      1210: мы им продали, они должны нам
      1710: мы им авансировали (RISK if old)
      3310: мы им должны
      3510: они нам авансировали (obligation to deliver)
```

**Step 4 — Advance fulfilment**
```
onec_get_advance_settlement(contractorGuid, organizationGuid,
                            dateFrom: "2000-01-01", dateTo: asOfDate)
  → fulfillmentPct < 80% → low delivery performance
  → remaining > 10,000,000 ₸ → significant open advance
```

**Step 5 — Corporate group check (if applicable)**
```
if contractor is part of a known group:
  onec_get_group_balance(contractorGuids: [allGroupGuids], groupLabel, asOfDate)
  → consolidated exposure across all entities
```

**Step 6 — Concentration check**
```
onec_anomaly_concentration(organizationGuid, asOfDate)
  → is this contractor in top-5 for 1210, 1710, or 3310?
  → topPct ≥ 60% → CRITICAL concentration
```

**Step 7 — Contract validity**
```
onec_get_contractor_contracts(contractorGuid)
  → expired contracts with open balance → legal risk
  → no contracts at all → informal relationship risk
```

**Step 8 — Sales history**
```
onec_get_sales_with_lines(contractorGuids: [contractorGuid],
                          dateFrom: year-3, dateTo: asOfDate)
  → revenue trend: growing/stable/declining?
  → product mix
```

**Step 9 — Generate certificate**
```
onec_generate_debt_certificate(contractorGuid, asOfDate, orgGuid)
  → formal document for contractor file
```

## Risk scoring
```
🔴 DO NOT ADVANCE without security:
   - fulfillmentPct < 50% AND remaining > 5M ₸
   - expired contracts AND open 1710 balance
   - DeletionMark = true

🟠 PROCEED WITH CAUTION:
   - concentration > 50% of total advances
   - fulfillmentPct 50–79%
   - no contracts (informal)

✅ NORMAL:
   - fulfillmentPct ≥ 80%
   - valid contracts
   - consistent payment history
```

## Output format
```
## Due Diligence: [contractor name] ([БИН])
Позиция: ДЗ X ₸ | Авансы X ₸ (выполнение Y%) | КЗ X ₸
Договоры: N (действующих M, истёкших K)
Концентрация: [% от total exposure]
Рейтинг риска: 🔴/🟠/✅
Рекомендация: [proceed/caution/reject]
```
