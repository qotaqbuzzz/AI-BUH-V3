---
category: Document
properties: 9
relations: 2
---

# Document_СчетНаОплатуПоставщика_Услуги

**Category:** Document  
**Properties:** 9  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Содержание | Edm.String | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
