---
category: Document
properties: 12
relations: 4
---

# Document_СчетНаОплатуПокупателю_Товары

**Category:** Document  
**Properties:** 12  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СтавкаАкциза_Key | Edm.Guid | true |
| СуммаАкциза | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Количество | Edm.Double | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
