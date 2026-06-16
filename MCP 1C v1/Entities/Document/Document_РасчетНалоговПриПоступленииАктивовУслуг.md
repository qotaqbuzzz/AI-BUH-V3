---
category: Document
properties: 51
relations: 13
---

# Document_РасчетНалоговПриПоступленииАктивовУслуг

**Category:** Document  
**Properties:** 51  
**Relations:** 13

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
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| СубконтоДт1 | Edm.String | true |
| СубконтоДт2 | Edm.String | true |
| СубконтоДт3 | Edm.String | true |
| СубконтоДтНУ1 | Edm.String | true |
| СубконтоДтНУ2 | Edm.String | true |
| СубконтоДтНУ3 | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СчетЗатрат_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| УчитыватьИПН | Edm.Boolean | true |
| УчитыватьСН | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УчитыватьВОСМС | Edm.Boolean | true |
| УчитыватьОПВ | Edm.Boolean | true |
| УчитыватьСО | Edm.Boolean | true |
| ИсчисленныйИПН | Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныйИПН_RowType | true |
| ИсчисленныйСН | Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныйСН_RowType | true |
| ИсчисленныеВОСМС | Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныеВОСМС_RowType | true |
| ВычетыИПН | Document_РасчетНалоговПриПоступленииАктивовУслуг_ВычетыИПН_RowType | true |
| ИсчисленныйОПВ | Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныйОПВ_RowType | true |
| ИсчисленныеСО | Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныеСО_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Сделка_Type | Edm.String | true |
| СубконтоДт1_Type | Edm.String | true |
| СубконтоДт2_Type | Edm.String | true |
| СубконтоДт3_Type | Edm.String | true |
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатрат
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
- [[ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций]] — ВидРасчета
