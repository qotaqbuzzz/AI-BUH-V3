---
category: Document
properties: 15
relations: 7
---

# Document_ДокументРасчетовСКонтрагентом

**Category:** Document  
**Properties:** 15  
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
| Ответственный_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
