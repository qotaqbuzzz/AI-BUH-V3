---
category: Document
properties: 18
relations: 5
---

# Document_ЧекККМ_Услуги

**Category:** Document  
**Properties:** 18  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Количество | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
