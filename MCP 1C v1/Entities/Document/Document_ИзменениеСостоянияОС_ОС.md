---
category: Document
properties: 7
relations: 1
---

# Document_ИзменениеСостоянияОС_ОС

**Category:** Document  
**Properties:** 7  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| ОбъектИмущественногоНалога | Edm.Boolean | true |
| ОбъектТранспортногоНалога | Edm.Boolean | true |
| ОбъектЗемельногоНалога | Edm.Boolean | true |
| НачислятьАмортизацию | Edm.Boolean | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
