---
category: Document
properties: 14
relations: 1
---

# Document_ЗерноваяРасписка_Товары

**Category:** Document  
**Properties:** 14  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| ГодУрожая | Edm.Int16 | true |
| Влажность | Edm.Double | true |
| ПримесьСорная | Edm.Double | true |
| Натура | Edm.Double | true |
| Белок | Edm.Double | true |
| Клейковина | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС | Edm.String | true |
| СуммаНДС | Edm.Double | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
