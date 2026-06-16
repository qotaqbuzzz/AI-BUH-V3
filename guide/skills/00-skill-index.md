# onec-kz Agent Skills — Index

## How to invoke
User says trigger phrase → agent runs that skill end-to-end.
Each skill is a sequential tool-call program, not a description.

## Skill routing table
| Trigger phrase (RU / EN) | Skill file |
|---|---|
| "закрыть месяц" / "period close" / "ЗакрытиеМесяца" | `01-period-close.md` |
| "НДС 300" / "подготовить декларацию НДС" / "VAT return" | `02-vat-300.md` |
| "проверить зарплату" / "payroll check" / "расчёт ЗП" | `03-payroll.md` |
| "акт сверки" / "reconciliation act" / "сверка с контрагентом" | `04-act-sverki.md` |
| "агро" / "НЗП" / "урожай" / "agro cycle" / "8112" | `05-agro-cycle.md` |
| "аудит аномалий" / "проверить риски" / "anomaly audit" | `06-anomaly-audit.md` |
| "due diligence" / "проверить контрагента" / "новый поставщик" | `07-contractor-dd.md` |
| "еженедельный мониторинг" / "weekly monitor" / "Monday report" | `08-weekly-monitor.md` |
| "закрытие года" / "year-end close" / "реформация баланса" | `09-year-end.md` |
| "отчёт директору" / "management report" / "сводка" | `10-management-report.md` |
| "налоговая проверка" / "ГНС" / "tax audit prep" | `11-tax-audit-prep.md` |
| "КПН" / "корпоративный подоходный налог" / "CIT estimate" | `12-kpn-estimate.md` |

## Shared pre-conditions (apply to every skill)
```
1. If organizationGuid unknown → call onec_get_organizations() first
2. If tenantId unclear → omit (defaults to moskovskiy)
3. Date defaults: dateFrom = YYYY-01-01, dateTo = today
4. Any GUID in a result → pass to onec_resolve_guid if context is needed
5. Write tools (post, create, docflow write) → always confirm with user first
```

## НК РК 2026 constants (used across all skills)
```
МРП = 3,692 ₸   МЗП = 85,000 ₸   ИПН deduction = 14 МРП = 51,688 ₸
НДС = 12%         КПН = 20%          КПН agro = 6% effective (Art.285 −70%)
ОПВ = 10%         ОППВ = 5%         СО = 3.5%
ВОСМС = 3%        ОСМС = 2%         ИПН = 10%    СН = 9.5% − СО
Payment deadline: 25th of following month for all social/tax payments
```
