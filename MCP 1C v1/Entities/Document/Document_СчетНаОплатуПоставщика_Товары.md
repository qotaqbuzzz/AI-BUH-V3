---
category: Document
properties: 10
relations: 3
---

# Document_СчетНаОплатуПоставщика_Товары

**Category:** Document  
**Properties:** 10  
**Relations:** 3

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
| Коэффициент | Edm.Double | true |
| Количество | Edm.Double | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
