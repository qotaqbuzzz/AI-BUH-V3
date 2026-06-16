---
category: AccountingRegister
properties: 3
relations: 7
---

# AccountingRegister_Налоговый

**Category:** AccountingRegister  
**Properties:** 3  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Recorder | Edm.String | false |
| RecordSet | AccountingRegister_Налоговый_RowType | false |
| Recorder_Type | Edm.String | false |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаCr
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаDr
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеCr
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеDr
- [[ChartOfAccounts_Налоговый]] — AccountCr
- [[ChartOfAccounts_Налоговый]] — AccountDr
