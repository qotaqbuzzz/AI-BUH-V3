---
category: Catalog
properties: 22
relations: 2
---

# Catalog_СпособыОтраженияЗарплатыВБухУчете

**Category:** Catalog  
**Properties:** 22  
**Relations:** 2

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
| СчетБУ_Key | Edm.Guid | true |
| СубконтоБУ1 | Edm.String | true |
| СубконтоБУ2 | Edm.String | true |
| СубконтоБУ3 | Edm.String | true |
| СчетНУ_Key | Edm.Guid | true |
| СубконтоНУ1 | Edm.String | true |
| СубконтоНУ2 | Edm.String | true |
| СубконтоНУ3 | Edm.String | true |
| СубконтоБУ1_Type | Edm.String | true |
| СубконтоБУ2_Type | Edm.String | true |
| СубконтоБУ3_Type | Edm.String | true |
| СубконтоНУ1_Type | Edm.String | true |
| СубконтоНУ2_Type | Edm.String | true |
| СубконтоНУ3_Type | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
