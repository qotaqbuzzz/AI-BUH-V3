---
category: Document
properties: 13
relations: 4
---

# Document_СчетФактураПолученный_Товары

**Category:** Document  
**Properties:** 13  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| Цена | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| НомерГТД_Key | Edm.Guid | true |
| ДатаОборота | Edm.DateTime | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
