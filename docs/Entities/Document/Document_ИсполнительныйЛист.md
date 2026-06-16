---
category: Document
properties: 25
relations: 8
---

# Document_ИсполнительныйЛист

**Category:** Document  
**Properties:** 25  
**Relations:** 8

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
| ВидИсполнительногоДокумента | Edm.String | true |
| ВидРасчетаПочтовыйСбор_Key | Edm.Guid | true |
| ДатаДействия | Edm.DateTime | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| Получатель_Key | Edm.Guid | true |
| Размер | Edm.Double | true |
| РеквизитыИсполнительногоДокумента | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СпособПеречисления | Edm.String | true |
| СпособРасчетаИЛ | Edm.Int16 | true |
| Физлицо_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СозданПриОбмене | Edm.Boolean | true |
| ПлатежныйАгент_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Контрагенты]] — ПлатежныйАгент
- [[Catalog_Контрагенты]] — Получатель
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ФизическиеЛица]] — Физлицо
- [[ChartOfCalculationTypes_УдержанияОрганизаций]] — ВидРасчетаПочтовыйСбор
