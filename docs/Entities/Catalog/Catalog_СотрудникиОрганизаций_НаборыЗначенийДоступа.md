---
category: Catalog
properties: 8
relations: 1
---

# Catalog_СотрудникиОрганизаций_НаборыЗначенийДоступа

**Category:** Catalog  
**Properties:** 8  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НомерНабора | Edm.Int64 | true |
| ЗначениеДоступа | Edm.String | true |
| Чтение | Edm.Boolean | true |
| Изменение | Edm.Boolean | true |
| Уточнение_Key | Edm.Guid | true |
| ЗначениеДоступа_Type | Edm.String | true |

## Related Entities

- [[Catalog_ИдентификаторыОбъектовМетаданных]] — Уточнение
