# SKILL: Акт сверки взаиморасчётов (Reconciliation Act)

**Trigger:** "акт сверки" / "сверка с контрагентом" / "reconciliation act" / "сколько должен контрагент"
**Role:** Бухгалтер, готовящий акт сверки и анализирующий взаиморасчёты.

## Required inputs
```
contractorName or contractorGuid, dateFrom, dateTo, tenantId
orgGuid (optional — defaults to primary org)
```

## Workflow

**Step 1 — Find contractor**
```
if contractorGuid unknown:
  onec_search_contractors(query: contractorName, limit: 5)
  → pick Ref_Key → contractorGuid
```

**Step 2 — Full context**
```
onec_resolve_guid(guid: contractorGuid)
  → resolvedAs = "catalog_контрагенты"
  → shows: balance, contracts, receivables, payables, last 15 docs
```

**Step 3 — Balance by account**
```
onec_get_contractor_balance(contractorGuid, date: dateTo)
  → rows with non-zero (balanceDr - balanceCr)
  → classify: 1210=ДЗ, 1710=авансы выданные, 3310=КЗ, 3510=авансы полученные
```

**Step 4 — Advance fulfillment**
```
onec_get_advance_settlement(contractorGuid, organizationGuid, dateFrom, dateTo)
  → fulfillmentPct < 100% → open advance exists
  → remaining > 0 AND age > 90 days → RISK flag
```

**Step 5 — Contract validity**
```
onec_validate_contract_terms_compliance(dateFrom, dateTo, organizationGuid)
  → check if this contractor has expired contracts
  → expired contract with balance → legal risk
```

**Step 6 — Generate document**
```
onec_generate_act_sverki(contractorGuid, dateFrom, dateTo, orgGuid)
  → saves HTML to reports/generated/
  → user prints and sends to contractor for signature
```

**Step 7 — If overdue balance > threshold**
```
if net balance owed to us > 500,000 ₸ AND age > 90 days:
  onec_generate_obligation_notice(contractorGuid, date, orgGuid)
  → formal demand letter
```

## Output format
```
## Акт сверки: [contractor name]
Период: [dateFrom] – [dateTo]

Позиция по счетам:
  1210 (ДЗ):   X ₸   — [contractor] нам должен
  1710 (авансы нам):  X ₸  — выданы авансы, выполнение Y%
  3310 (КЗ):   X ₸   — мы должны [contractor]
  3510 (авансы от них): X ₸

Нетто позиция: ±X ₸  ([кто кому должен])
Договоры: [valid/expired]
Акт сохранён: reports/generated/[filename]
```

## KZ legal notes
```
- Срок исковой давности: 3 года с момента возникновения долга (ГК РК)
- Акт сверки прерывает срок исковой давности при подписании обеими сторонами
- Авансы без поставки > 1 года → рассмотреть провизию на потери
- При споре: арбитраж или суд (г. Алматы/Астана)
```
