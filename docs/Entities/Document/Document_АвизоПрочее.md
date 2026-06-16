---
category: Document
properties: 16
relations: 5
---

# Document_АвизоПрочее

**Category:** Document  
**Properties:** 16  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| Автор_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| Ответственный_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| ОтображатьРеквизитыПолучателя | Edm.Boolean | true |
| ПредставлениеСпискаСчетовБУ | Edm.String | true |
| ДанныеБух | Document_АвизоПрочее_ДанныеБух_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
