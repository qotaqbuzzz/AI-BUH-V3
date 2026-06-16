---
category: InformationRegister
properties: 30
relations: 6
---

# InformationRegister_СпособыОтраженияКурсовойРазницы

**Category:** InformationRegister  
**Properties:** 30  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| Счет_Key | Edm.Guid | false |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СчетРасходовБУ_Key | Edm.Guid | true |
| СубконтоРасходовБУ1 | Edm.String | true |
| СубконтоРасходовБУ2 | Edm.String | true |
| СубконтоРасходовБУ3 | Edm.String | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СчетРасходовНУ_Key | Edm.Guid | true |
| СубконтоРасходовНУ1 | Edm.String | true |
| СубконтоРасходовНУ2 | Edm.String | true |
| СубконтоРасходовНУ3 | Edm.String | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоРасходовБУ1_Type | Edm.String | true |
| СубконтоРасходовБУ2_Type | Edm.String | true |
| СубконтоРасходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоРасходовНУ1_Type | Edm.String | true |
| СубконтоРасходовНУ2_Type | Edm.String | true |
| СубконтоРасходовНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетРасходовНУ
- [[ChartOfAccounts_Типовой]] — Счет
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетРасходовБУ
