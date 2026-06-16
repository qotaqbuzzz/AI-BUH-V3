---
category: Document
properties: 16
relations: 7
---

# Document_ИзменениеСпособовОтраженияРасходовПоАмортизацииОС

**Category:** Document  
**Properties:** 16  
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
| ДокументОснование_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СобытиеОС_Key | Edm.Guid | true |
| СпособОтраженияРасходовПоАмортизации_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОС | Document_ИзменениеСпособовОтраженияРасходовПоАмортизацииОС_ОС_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СобытияОС]] — СобытиеОС
- [[Catalog_СпособыОтраженияРасходовПоАмортизации]] — СпособОтраженияРасходовПоАмортизации
- [[Document_ПеремещениеОС]] — ДокументОснование
