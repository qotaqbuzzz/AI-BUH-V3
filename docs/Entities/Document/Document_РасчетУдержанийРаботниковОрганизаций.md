---
category: Document
properties: 23
relations: 6
---

# Document_РасчетУдержанийРаботниковОрганизаций

**Category:** Document  
**Properties:** 23  
**Relations:** 6

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
| ВидРасчета_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ИсчисленныйИПН | Document_РасчетУдержанийРаботниковОрганизаций_ИсчисленныйИПН_RowType | true |
| ИсчисленныйОПВ | Document_РасчетУдержанийРаботниковОрганизаций_ИсчисленныйОПВ_RowType | true |
| Удержания | Document_РасчетУдержанийРаботниковОрганизаций_Удержания_RowType | true |
| НалоговыеВычеты | Document_РасчетУдержанийРаботниковОрганизаций_НалоговыеВычеты_RowType | true |
| ИсчисленныеВОСМС | Document_РасчетУдержанийРаботниковОрганизаций_ИсчисленныеВОСМС_RowType | true |
| ФизическиеЛица | Document_РасчетУдержанийРаботниковОрганизаций_ФизическиеЛица_RowType | true |
| ВычетыИПН | Document_РасчетУдержанийРаботниковОрганизаций_ВычетыИПН_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfCalculationTypes_УдержанияОрганизаций]] — ВидРасчета
