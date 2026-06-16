---
category: DocumentJournal
properties: 21
relations: 10
---

# DocumentJournal_ПроизводственныеДокументы

**Category:** DocumentJournal  
**Properties:** 21  
**Relations:** 10

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref | Edm.String | false |
| Type | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Number | Edm.String | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ВалютаДокумента_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Ref_Type | Edm.String | false |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
