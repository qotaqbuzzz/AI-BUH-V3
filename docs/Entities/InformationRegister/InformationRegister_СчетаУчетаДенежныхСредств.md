---
category: InformationRegister
properties: 4
relations: 2
---

# InformationRegister_СчетаУчетаДенежныхСредств

**Category:** InformationRegister  
**Properties:** 4  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ОбъектУчета | Edm.String | false |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| ОбъектУчета_Type | Edm.String | false |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
