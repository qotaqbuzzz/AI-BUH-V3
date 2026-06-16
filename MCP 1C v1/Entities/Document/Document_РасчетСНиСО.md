---
category: Document
properties: 21
relations: 5
---

# Document_РасчетСНиСО

**Category:** Document  
**Properties:** 21  
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
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ИсчисленныйСН | Document_РасчетСНиСО_ИсчисленныйСН_RowType | true |
| ИсчисленныеСО | Document_РасчетСНиСО_ИсчисленныеСО_RowType | true |
| ИсчисленныйОППВ | Document_РасчетСНиСО_ИсчисленныйОППВ_RowType | true |
| ИсчисленныеООСМС | Document_РасчетСНиСО_ИсчисленныеООСМС_RowType | true |
| ИсчисленныйОПВР | Document_РасчетСНиСО_ИсчисленныйОПВР_RowType | true |
| ФизическиеЛица | Document_РасчетСНиСО_ФизическиеЛица_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
