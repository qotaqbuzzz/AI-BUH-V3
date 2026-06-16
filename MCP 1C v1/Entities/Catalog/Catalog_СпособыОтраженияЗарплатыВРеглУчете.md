---
category: Catalog
properties: 36
relations: 4
---

# Catalog_СпособыОтраженияЗарплатыВРеглУчете

**Category:** Catalog  
**Properties:** 36  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| СчетДт_Key | Edm.Guid | true |
| СубконтоДт1 | Edm.String | true |
| СубконтоДт2 | Edm.String | true |
| СубконтоДт3 | Edm.String | true |
| СчетКт_Key | Edm.Guid | true |
| СубконтоКт1 | Edm.String | true |
| СубконтоКт2 | Edm.String | true |
| СубконтоКт3 | Edm.String | true |
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
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |
| СубконтоКтНУ1_Type | Edm.String | true |
| СубконтоКтНУ2_Type | Edm.String | true |
| СубконтоКтНУ3_Type | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетДтНУ
- [[ChartOfAccounts_Налоговый]] — СчетКтНУ
- [[ChartOfAccounts_Типовой]] — СчетДт
- [[ChartOfAccounts_Типовой]] — СчетКт
