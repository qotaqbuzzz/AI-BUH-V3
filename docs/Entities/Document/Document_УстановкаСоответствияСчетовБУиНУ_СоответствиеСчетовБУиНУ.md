---
category: Document
properties: 21
relations: 3
---

# Document_УстановкаСоответствияСчетовБУиНУ_СоответствиеСчетовБУиНУ

**Category:** Document  
**Properties:** 21  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетБУ_Key | Edm.Guid | true |
| СчетКоррБУ_Key | Edm.Guid | true |
| СубконтоБУ1 | Edm.String | true |
| СубконтоБУ2 | Edm.String | true |
| СубконтоБУ3 | Edm.String | true |
| ВидЗатратНУ | Edm.String | true |
| СчетНУ_Key | Edm.Guid | true |
| СубконтоНУ1 | Edm.String | true |
| СубконтоНУ2 | Edm.String | true |
| СубконтоНУ3 | Edm.String | true |
| Учитывается | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| СубконтоБУ1_Type | Edm.String | true |
| СубконтоБУ2_Type | Edm.String | true |
| СубконтоБУ3_Type | Edm.String | true |
| ВидЗатратНУ_Type | Edm.String | true |
| СубконтоНУ1_Type | Edm.String | true |
| СубконтоНУ2_Type | Edm.String | true |
| СубконтоНУ3_Type | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
- [[ChartOfAccounts_Типовой]] — СчетКоррБУ
