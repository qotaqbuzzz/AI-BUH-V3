---
category: Document
properties: 33
relations: 8
---

# Document_АвансовыйОтчет_Прочее

**Category:** Document  
**Properties:** 33  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидВходящегоДокумента | Edm.String | true |
| НомерВходящегоДокумента | Edm.String | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| Поставщик_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| ВидЗадолженностиПодотчетногоЛица | Edm.String | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| СчетФактура_Key | Edm.Guid | true |
| ДатаСФ | Edm.DateTime | true |
| НомерСФ | Edm.String | true |
| ПредъявленСФ | Edm.Boolean | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_Контрагенты]] — Поставщик
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[Document_СчетФактураПолученный]] — СчетФактура
