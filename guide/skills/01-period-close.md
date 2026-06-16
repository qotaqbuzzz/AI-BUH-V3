# SKILL: Закрытие месяца (Period Close)

**Trigger:** "закрыть месяц" / "period close" / "ЗакрытиеМесяца" / "готов ли месяц к закрытию"
**Role:** Главный бухгалтер, готовящий месяц к закрытию по НК РК.

## Required inputs
```
year, month, tenantId, organizationGuid
```

## Workflow

**Step 1 — Pre-flight**
```
onec_validate_period_close_readiness(year, month, organizationGuid)
  → unpostedDocs.total > 0 ?  → Step 2
  → depreciation.isPosted = false ? → Step 3
  → monthClose.isClosed = true ? → DONE (already closed)
```

**Step 2 — Fix unposted documents**
```
For each type in unpostedDocs.byType:
  onec_drill_unposted_documents(documentType, month dates, organizationGuid)
  → list GUIDs → ask user to post or explain
onec_post_document(documentType, guid, action:"post")  ← CONFIRM FIRST
```

**Step 3 — Depreciation check**
```
onec_validate_depreciation_completeness(dateFrom, dateTo, organizationGuid)
  → isPosted = false AND fixedAssets > 0 → alert user to post НачислениеАмортизации
  → onec_get_fixed_assets(organizationGuid) → show assets needing depreciation
```

**Step 4 — Agro WIP check (skip if not agro)**
```
onec_validate_wip_closure(year, month, organizationGuid)
  → month 11-12 AND 8112 balance > 0 → WARN: урожай не оприходован
  → month 1-3 AND 8112 > 0 → OK (перезимовавшие затраты)
  → month 10 AND 8112 > 0 → CRITICAL: harvest must be capitalized (8112→1320)
```

**Step 5 — Accrual alignment**
```
onec_validate_accrual_alignment(dateFrom, dateTo, organizationGuid)
  → revenue without VAT → alert
  → salary without ОПВ → alert
```

**Step 6 — COGS basis**
```
onec_validate_cogs_basis(dateFrom, dateTo, organizationGuid)
  → 7010 ≠ 1320 Кт turnover → mismatch, check ЗакрытиеМесяца routing
```

**Step 7 — Confirm close**
```
onec_get_month_close_status(organizationGuid, year, month)
  → isClosed = true → ✅ report complete
  → isClosed = false → instruct user to post ЗакрытиеМесяца in 1С UI
```

**Step 8 — Post-close audit**
```
onec_audit_period_quality(organizationGuid, year, month)
  → show structured ✅/⚠️/❌ report
```

## Output format
```
## Закрытие [YYYY-MM] — [status]
Проблемы до закрытия: N
- ❌ [issue] → [action]
✅ Месяц закрыт / ⚠️ Требуются действия: [list]
```

## KZ rule: months MUST be closed sequentially
If month M is not closed, do NOT close M+1. Check all prior months first.
