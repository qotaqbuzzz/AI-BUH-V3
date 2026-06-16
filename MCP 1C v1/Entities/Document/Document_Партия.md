---
category: Document
properties: 14
relations: 7
---

# Document_Партия

**Category:** Document  
**Properties:** 14  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ВалютаДокумента_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Склад_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Склады]] — Склад
