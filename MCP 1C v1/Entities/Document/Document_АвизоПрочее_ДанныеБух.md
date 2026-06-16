---
category: Document
properties: 37
relations: 7
---

# Document_АвизоПрочее_ДанныеБух

**Category:** Document  
**Properties:** 37  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетОтправительБУ_Key | Edm.Guid | true |
| СубконтоОтправительБУ1 | Edm.String | true |
| СубконтоОтправительБУ2 | Edm.String | true |
| СубконтоОтправительБУ3 | Edm.String | true |
| СчетОтправительНУ_Key | Edm.Guid | true |
| СубконтоОтправительНУ1 | Edm.String | true |
| СубконтоОтправительНУ2 | Edm.String | true |
| СубконтоОтправительНУ3 | Edm.String | true |
| Количество | Edm.Double | true |
| Валюта_Key | Edm.Guid | true |
| ВалютнаяСумма | Edm.Double | true |
| Сумма | Edm.Double | true |
| СчетПолучательБУ_Key | Edm.Guid | true |
| СубконтоПолучательБУ1 | Edm.String | true |
| СубконтоПолучательБУ2 | Edm.String | true |
| СубконтоПолучательБУ3 | Edm.String | true |
| СчетПолучательНУ_Key | Edm.Guid | true |
| СубконтоПолучательНУ1 | Edm.String | true |
| СубконтоПолучательНУ2 | Edm.String | true |
| СубконтоПолучательНУ3 | Edm.String | true |
| Содержание | Edm.String | true |
| ВидУчетаНУОтправитель_Key | Edm.Guid | true |
| ВидУчетаНУПолучатель_Key | Edm.Guid | true |
| СубконтоОтправительБУ1_Type | Edm.String | true |
| СубконтоОтправительБУ2_Type | Edm.String | true |
| СубконтоОтправительБУ3_Type | Edm.String | true |
| СубконтоОтправительНУ1_Type | Edm.String | true |
| СубконтоОтправительНУ2_Type | Edm.String | true |
| СубконтоОтправительНУ3_Type | Edm.String | true |
| СубконтоПолучательБУ1_Type | Edm.String | true |
| СубконтоПолучательБУ2_Type | Edm.String | true |
| СубконтоПолучательБУ3_Type | Edm.String | true |
| СубконтоПолучательНУ1_Type | Edm.String | true |
| СубконтоПолучательНУ2_Type | Edm.String | true |
| СубконтоПолучательНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУОтправитель
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУПолучатель
- [[ChartOfAccounts_Налоговый]] — СчетОтправительНУ
- [[ChartOfAccounts_Налоговый]] — СчетПолучательНУ
- [[ChartOfAccounts_Типовой]] — СчетОтправительБУ
- [[ChartOfAccounts_Типовой]] — СчетПолучательБУ
