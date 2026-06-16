---
category: DocumentJournal
properties: 16
relations: 6
---

# DocumentJournal_СкладскиеДокументы

**Category:** DocumentJournal  
**Properties:** 16  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref | Edm.String | false |
| Type | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Number | Edm.String | true |
| Posted | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
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
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
