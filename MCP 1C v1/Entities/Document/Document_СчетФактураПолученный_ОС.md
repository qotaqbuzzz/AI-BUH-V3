---
category: Document
properties: 8
relations: 2
---

# Document_СчетФактураПолученный_ОС

**Category:** Document  
**Properties:** 8  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| ДатаОборота | Edm.DateTime | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_СтавкиНДС]] — СтавкаНДС
