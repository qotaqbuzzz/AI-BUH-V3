---
category: AccountingRegister
properties: 3
relations: 7
---

# AccountingRegister_Типовой

**Category:** AccountingRegister  
**Properties:** 3  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Recorder | Edm.String | false |
| RecordSet | AccountingRegister_Типовой_RowType | false |
| Recorder_Type | Edm.String | false |

## Related Entities

- [[Catalog_Валюты]] — ВалютаCr
- [[Catalog_Валюты]] — ВалютаDr
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеCr
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеDr
- [[ChartOfAccounts_Типовой]] — AccountCr
- [[ChartOfAccounts_Типовой]] — AccountDr
