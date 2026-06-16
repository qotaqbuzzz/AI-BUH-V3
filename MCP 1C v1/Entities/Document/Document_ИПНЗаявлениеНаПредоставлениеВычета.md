---
category: Document
properties: 21
relations: 7
---

# Document_ИПНЗаявлениеНаПредоставлениеВычета

**Category:** Document  
**Properties:** 21  
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
| ВычетИПН_Key | Edm.Guid | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| ДокументОснование_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| НомерВходящегоДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ФизЛицо_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ГрафикПлатежей | Document_ИПНЗаявлениеНаПредоставлениеВычета_ГрафикПлатежей_RowType | true |

## Related Entities

- [[Catalog_ВычетыИПН]] — ВычетИПН
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ФизическиеЛица]] — ФизЛицо
