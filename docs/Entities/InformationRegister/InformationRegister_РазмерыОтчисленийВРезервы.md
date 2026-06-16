---
category: InformationRegister
properties: 10
relations: 3
---

# InformationRegister_РазмерыОтчисленийВРезервы

**Category:** InformationRegister  
**Properties:** 10  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| Резерв_Key | Edm.Guid | false |
| Размер | Edm.Double | true |
| РазмерСоциальногоНалога | Edm.Double | true |
| РазмерСоциальныхОтчислений | Edm.Double | true |
| СчетУчета_Key | Edm.Guid | true |
| РазмерПрофессиональныхПенсионныхВзносов | Edm.Double | true |
| РазмерОтчисленийОСМС | Edm.Double | true |
| РазмерПенсионныхВзносовРаботодателя | Edm.Double | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_Резервы]] — Резерв
- [[ChartOfAccounts_Типовой]] — СчетУчета
