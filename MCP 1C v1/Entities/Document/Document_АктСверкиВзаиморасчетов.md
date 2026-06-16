---
category: Document
properties: 28
relations: 9
---

# Document_АктСверкиВзаиморасчетов

**Category:** Document  
**Properties:** 28  
**Relations:** 9

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
| ВключатьДочерние | Edm.Boolean | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| ОстатокНаНачало | Edm.Double | true |
| Ответственный_Key | Edm.Guid | true |
| ПредставительКонтрагента_Key | Edm.Guid | true |
| ПредставительОрганизации_Key | Edm.Guid | true |
| Расхождение | Edm.Double | true |
| СверкаСогласована | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ВключатьВнутренниеОбороты | Edm.Boolean | true |
| РазбитьПоДоговорам | Edm.Boolean | true |
| ПоДаннымОрганизации | Document_АктСверкиВзаиморасчетов_ПоДаннымОрганизации_RowType | true |
| ПоДаннымКонтрагента | Document_АктСверкиВзаиморасчетов_ПоДаннымКонтрагента_RowType | true |
| СписокСчетов | Document_АктСверкиВзаиморасчетов_СписокСчетов_RowType | true |
| СписокОрганизаций | Document_АктСверкиВзаиморасчетов_СписокОрганизаций_RowType | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_КонтактныеЛица]] — ПредставительКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ФизическиеЛица]] — ПредставительОрганизации
