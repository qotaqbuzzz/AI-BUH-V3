# SKILL: Проверка расчёта заработной платы (Payroll Check)

**Trigger:** "проверить зарплату" / "payroll check" / "расчёт ЗП" / "ОПВ не совпадает"
**Role:** Бухгалтер по заработной плате, проверяющий расчёт по НК РК 2026.

## Required inputs
```
dateFrom, dateTo (one calendar month), tenantId, organizationGuid
```

## НК РК 2026 payroll rates (hard-coded validation)
```
Employee deductions (withheld from gross):
  ОПВ     = gross × 10%              → account 3220
  ОСМС    = gross × 2%               → account 3212
  ИПН     = (gross − ОПВ − ОСМС − 14МРП) × 10%  (min base = 0)

Employer charges (on top of gross):
  ОППВ    = gross × 5%               → account 3250
  СО      = (gross − ОПВ) × 3.5%    → account 3211
  ВОСМС   = gross × 3%               → account 3213
  СН      = gross × 9.5% − СО        → account 3150

МЗП 2026 = 85,000 ₸   МРП 2026 = 3,692 ₸   14МРП = 51,688 ₸
```

## Workflow

**Step 1 — Get payroll documents**
```
onec_get_payroll_documents(dateFrom, dateTo, organizationGuid)
  → count = 0 ? → WARN: no payroll accruals this period
  → list docs, total amounts
```

**Step 2 — МЗП check**
```
onec_validate_payroll_deductions(dateFrom, dateTo, organizationGuid)
  → belowMZP: any employee with gross < 85,000 ₸ → CRITICAL per Art.24 ТК РК
  → show employee list with gross amounts
```

**Step 3 — Tax rate validation**
```
onec_validate_payroll_tax_rates(dateFrom, dateTo, organizationGuid)
  → deviations[] → for each:
      drill: onec_drill_payroll_tax(taxAccount, dateFrom, dateTo, organizationGuid)
      where taxAccount = "3220"|"3250"|"3211"|"3213"|"3212"|"3120"|"3150"
```

**Step 4 — 3350 reconciliation**
```
onec_validate_payroll_accrual_balance(dateFrom, dateTo, organizationGuid)
  → mismatch? → 3350 Кт ≠ ΣНачислений
  → likely cause: document not posted or deleted after posting
```

**Step 5 — Tax register check**
```
onec_get_payroll_taxes_summary(organizationGuid, dateFrom, dateTo)
  → for each tax account: accrued vs paid vs balance
  → balance > 0 at month end → payment due by 25th of next month
```

**Step 6 — Pure calculator (optional verification)**
```
onec_calculate_payroll_taxes(grossSalary: <any employee gross>)
  → compare to document values
  → delta > 1 ₸ → rounding or rate error in 1С
```

## Output format
```
## Зарплата [YYYY-MM]
Документов начислений:  N    Итого: X ₸
Ниже МЗП (85,000 ₸):   N сотрудников  ← CRITICAL if > 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Налоги/взносы:
  ОПВ  (3220): начислено X ₸  ✅/❌
  ОППВ (3250): начислено X ₸  ✅/❌
  СО   (3211): начислено X ₸  ✅/❌
  ИПН  (3120): начислено X ₸  ✅/❌
  ...
К уплате до 25-го: X ₸
Проблемы: [list or "нет"]
```
