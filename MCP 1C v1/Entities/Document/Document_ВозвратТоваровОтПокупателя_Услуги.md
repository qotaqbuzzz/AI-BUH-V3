---
category: Document
properties: 25
relations: 6
---

# Document_ВозвратТоваровОтПокупателя_Услуги

**Category:** Document  
**Properties:** 25  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
