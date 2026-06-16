---
category: Document
properties: 9
relations: 1
---

# Document_ПереоценкаВнеоборотныхАктивов_ОС

**Category:** Document  
**Properties:** 9  
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
| ПереоцененнаяСтоимостьБУ | Edm.Double | true |
| ЛиквидационнаяСтоимостьБУ | Edm.Double | true |
| СписываемаяСуммаРезерваЗаМесяцБУ | Edm.Double | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
