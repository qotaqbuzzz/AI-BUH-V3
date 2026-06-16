---
category: Document
properties: 10
relations: 5
---

# Document_ПеремещениеОС_ОС

**Category:** Document  
**Properties:** 10  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| МОЛОрганизации_Key | Edm.Guid | true |
| НовыйПодразделениеОрганизации_Key | Edm.Guid | true |
| НовыйМОЛОрганизации_Key | Edm.Guid | true |
| СтоимостьБУ | Edm.Double | true |
| АмортизацияБУ | Edm.Double | true |
| АмортизацияЗаМесяцБУ | Edm.Double | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_ПодразделенияОрганизаций]] — НовыйПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ФизическиеЛица]] — МОЛОрганизации
- [[Catalog_ФизическиеЛица]] — НовыйМОЛОрганизации
