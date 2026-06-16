---
category: Document
properties: 8
relations: 1
---

# Document_СписаниеОС_ОС

**Category:** Document  
**Properties:** 8  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| СтоимостьБУ | Edm.Double | true |
| АмортизацияБУ | Edm.Double | true |
| АмортизацияЗаМесяцБУ | Edm.Double | true |
| СтоимостьНУ | Edm.Double | true |
| СнятьСУчетаПоНалогам | Edm.Boolean | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
