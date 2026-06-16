---
category: Document
properties: 5
relations: 2
---

# Document_УстановкаЦенНоменклатуры_Товары

**Category:** Document  
**Properties:** 5  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Валюта_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_Номенклатура]] — Номенклатура
