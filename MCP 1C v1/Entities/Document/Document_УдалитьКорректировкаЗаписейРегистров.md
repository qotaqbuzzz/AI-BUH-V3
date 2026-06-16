---
category: Document
properties: 13
relations: 4
---

# Document_УдалитьКорректировкаЗаписейРегистров

**Category:** Document  
**Properties:** 13  
**Relations:** 4

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
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ТаблицаРегистровНакопления | Document_УдалитьКорректировкаЗаписейРегистров_ТаблицаРегистровНакопления_RowType | true |
| ТаблицаРегистровСведений | Document_УдалитьКорректировкаЗаписейРегистров_ТаблицаРегистровСведений_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
