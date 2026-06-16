---
category: Document
properties: 36
relations: 7
---

# Document_ОтражениеЗарплатыВРеглУчете_ОтражениеВУчете

**Category:** Document  
**Properties:** 36  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СтруктурноеПодразделениеДт_Key | Edm.Guid | true |
| СчетДт_Key | Edm.Guid | true |
| СубконтоДт1 | Edm.String | true |
| СубконтоДт2 | Edm.String | true |
| СубконтоДт3 | Edm.String | true |
| СтруктурноеПодразделениеКт_Key | Edm.Guid | true |
| СчетКт_Key | Edm.Guid | true |
| СубконтоКт1 | Edm.String | true |
| СубконтоКт2 | Edm.String | true |
| СубконтоКт3 | Edm.String | true |
| Сумма | Edm.Double | true |
| ВидРасчета | Edm.String | true |
| ФизЛицо_Key | Edm.Guid | true |
| СчетДтНУ_Key | Edm.Guid | true |
| СубконтоДтНУ1 | Edm.String | true |
| СубконтоДтНУ2 | Edm.String | true |
| СубконтоДтНУ3 | Edm.String | true |
| СчетКтНУ_Key | Edm.Guid | true |
| СубконтоКтНУ1 | Edm.String | true |
| СубконтоКтНУ2 | Edm.String | true |
| СубконтоКтНУ3 | Edm.String | true |
| СубконтоДт1_Type | Edm.String | true |
| СубконтоДт2_Type | Edm.String | true |
| СубконтоДт3_Type | Edm.String | true |
| СубконтоКт1_Type | Edm.String | true |
| СубконтоКт2_Type | Edm.String | true |
| СубконтоКт3_Type | Edm.String | true |
| ВидРасчета_Type | Edm.String | true |
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |
| СубконтоКтНУ1_Type | Edm.String | true |
| СубконтоКтНУ2_Type | Edm.String | true |
| СубконтоКтНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеДт
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеКт
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfAccounts_Налоговый]] — СчетДтНУ
- [[ChartOfAccounts_Налоговый]] — СчетКтНУ
- [[ChartOfAccounts_Типовой]] — СчетДт
- [[ChartOfAccounts_Типовой]] — СчетКт
