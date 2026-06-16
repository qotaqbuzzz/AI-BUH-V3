---
category: Document
properties: 11
relations: 2
---

# Document_СчетФактураПолученный_Услуги

**Category:** Document  
**Properties:** 11  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Количество | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| Цена | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| ДатаОборота | Edm.DateTime | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
