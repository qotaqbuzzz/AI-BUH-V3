---
category: Document
properties: 24
relations: 10
---

# Document_ОтчетПроизводстваЗаСмену

**Category:** Document  
**Properties:** 24  
**Relations:** 10

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
| ВводитьСтатьиЗатратПоСтрокам | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| НоменклатурнаяГруппа_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| Продукция | Document_ОтчетПроизводстваЗаСмену_Продукция_RowType | true |
| Услуги | Document_ОтчетПроизводстваЗаСмену_Услуги_RowType | true |
| ВозвратныеОтходы | Document_ОтчетПроизводстваЗаСмену_ВозвратныеОтходы_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_НоменклатурныеГруппы]] — НоменклатурнаяГруппа
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
