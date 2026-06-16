---
category: Catalog
properties: 19
relations: 2
---

# Catalog_МетодыРаспределенияКосвенныхРасходов_АналитикаРаспределения

**Category:** Catalog  
**Properties:** 19  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетЗакрытияБУ_Key | Edm.Guid | true |
| СубконтоБУ1 | Edm.String | true |
| СубконтоБУ2 | Edm.String | true |
| СубконтоБУ3 | Edm.String | true |
| СчетЗакрытияНУ_Key | Edm.Guid | true |
| СубконтоНУ1 | Edm.String | true |
| СубконтоНУ2 | Edm.String | true |
| СубконтоНУ3 | Edm.String | true |
| ПроцентРаспределения | Edm.Double | true |
| СтруктурноеПодразделение | Edm.String | true |
| СубконтоБУ1_Type | Edm.String | true |
| СубконтоБУ2_Type | Edm.String | true |
| СубконтоБУ3_Type | Edm.String | true |
| СубконтоНУ1_Type | Edm.String | true |
| СубконтоНУ2_Type | Edm.String | true |
| СубконтоНУ3_Type | Edm.String | true |
| СтруктурноеПодразделение_Type | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетЗакрытияНУ
- [[ChartOfAccounts_Типовой]] — СчетЗакрытияБУ
