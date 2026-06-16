---
category: DocumentJournal
properties: 17
relations: 7
---

# DocumentJournal_ДокументыПоОС

**Category:** DocumentJournal  
**Properties:** 17  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref | Edm.String | false |
| Type | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Number | Edm.String | true |
| Posted | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| ОбъектСтроительства_Key | Edm.Guid | true |
| СобытиеОС_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Ref_Type | Edm.String | false |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ОбъектыСтроительства]] — ОбъектСтроительства
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СобытияОС]] — СобытиеОС
