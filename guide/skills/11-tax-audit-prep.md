# SKILL: Подготовка к налоговой проверке (Tax Audit Prep)

**Trigger:** "налоговая проверка" / "ГНС пришла" / "tax audit" / "проверка КГД"
**Role:** Налоговый консультант, готовящий компанию к проверке ДГД/КГД.

## Context: what КГД checks first in KZ
```
1. НДС: 300.00 vs ЭСФ реестр (most common finding)
2. КПН: расходы без документов, аффилированные платежи
3. Зарплата: МЗП соблюдение, неформальная занятость
4. Авансы >1 года без поставки → переквалификация в доход
5. Контрагенты с признаками "однодневок" (shell companies)
```

## Workflow

**Step 1 — Periods status**
```
onec_anomaly_unclosed_periods(organizationGuid, year)
  → any unclosed → CRITICAL: финансовый результат недостоверен для ГНС
  → close all months FIRST (skill 01)
```

**Step 2 — НДС compliance**
```
onec_validate_vat_charged_vs_revenue(dateFrom, dateTo, organizationGuid)
onec_validate_esf_coverage(dateFrom, dateTo, organizationGuid)
  → missingESF > 0 → штраф 50% от суммы реализации (НК РК Ст.280-2)
  → get full list: onec_drill_missing_esf
```

**Step 3 — Payroll compliance**
```
onec_validate_payroll_tax_rates(dateFrom, dateTo, organizationGuid)
onec_validate_payroll_deductions(dateFrom, dateTo, organizationGuid)
  → any below МЗП → штраф 100 МРП = 369,200 ₸ per violation
  → onec_drill_payroll_tax for each deviating account
```

**Step 4 — Document integrity**
```
onec_validate_double_entry(dateFrom, dateTo, organizationGuid)
onec_validate_account_signs(dateFrom, dateTo, organizationGuid)
onec_validate_extdimension(dateFrom, dateTo, organizationGuid)
  → missing ExtDimension on 1210/3310 → ГНС cannot reconcile contractors
```

**Step 5 — Advances audit (КГД focus area)**
```
onec_drill_stale_advances(date: dateTo, "1710", organizationGuid, agingDays: 365)
  → advances > 1 year without delivery
  → КГД may reclassify as income if no contract or delivery proof
onec_drill_stale_advances(date: dateTo, "3510", organizationGuid, agingDays: 365)
  → advances received without delivery → unrealized revenue risk
```

**Step 6 — Manual entries review**
```
onec_detect_anomalies(dateFrom, dateTo, organizationGuid)
  → ОперацияБух entries (manual journal) → each needs business justification
  → round amounts ≥1M without clear description → risk
```

**Step 7 — Contractor red flags**
```
onec_anomaly_concentration(organizationGuid, asOfDate: dateTo)
  → single contractor > 80% of AP or advances → ГНС: аффилированность?
onec_scan_documents(organizationGuid, dateFrom, dateTo,
                   docTypes: ["ПоступлениеТоваровУслуг"],
                   limitPerType: 200)
  → DOC-002 (missing contractor) → major ГНС finding
```

**Step 8 — КПН deductible expenses**
```
onec_get_cogs_composition(dateFrom, dateTo, organizationGuid)
  → verify all cost items have supporting documents
  → overhead (8412) allocation method documented?
onec_get_kpn_estimate(organizationGuid, dateFrom, dateTo, isAgro?)
  → compare accrued 3110 vs estimate
```

## KZ penalty reference
```
НДС: неначисленный/незарегистрированный ЭСФ → 50% от суммы (НК РК Ст.269)
КПН: занижение базы → 50% от суммы недоимки + пени 1.25× ставка НБРК
ОПВ: недоудержание → 20% от суммы + пени
МЗП нарушение: 100 МРП = 369,200 ₸ per employee per month (ТК РК)
Непостановка на учёт НДС: 200 МРП
```

## Output format
```
## Готовность к проверке КГД [org] [year]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Периоды закрыты: Y/N месяцев  [✅/🔴]
НДС / ЭСФ:      [N missing]  [✅/🔴]
Зарплата:        [N deviations] [✅/🔴]
Авансы > 1 год:  [N items, X ₸] [✅/🟠]
Ручные проводки: [N items]    [✅/🟠]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Оценка риска: 🔴 ВЫСОКИЙ / 🟠 СРЕДНИЙ / ✅ НИЗКИЙ
Приоритетные действия до проверки:
  1. [action — tool — deadline]
```
