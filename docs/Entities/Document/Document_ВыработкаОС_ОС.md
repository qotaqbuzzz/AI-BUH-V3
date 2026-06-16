---
category: Document
properties: 5
relations: 2
---

# Document_ВыработкаОС_ОС

**Category:** Document  
**Properties:** 5  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| ПараметрВыработки_Key | Edm.Guid | true |
| Количество | Edm.Double | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_ПараметрыВыработкиОС]] — ПараметрВыработки
