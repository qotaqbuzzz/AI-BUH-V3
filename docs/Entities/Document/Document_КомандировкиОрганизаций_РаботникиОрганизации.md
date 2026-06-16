---
category: Document
properties: 8
relations: 2
---

# Document_КомандировкиОрганизаций_РаботникиОрганизации

**Category:** Document  
**Properties:** 8  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сотрудник_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| Цель | Edm.String | true |
| ИсточникФинансирования | Edm.String | true |

## Related Entities

- [[Catalog_СотрудникиОрганизаций]] — Сотрудник
- [[Catalog_ФизическиеЛица]] — ФизЛицо
