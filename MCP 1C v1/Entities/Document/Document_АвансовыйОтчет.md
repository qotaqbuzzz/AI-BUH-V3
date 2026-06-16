---
category: Document
properties: 42
relations: 11
---

# Document_АвансовыйОтчет

**Category:** Document  
**Properties:** 42  
**Relations:** 11

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
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| КоличествоДокументов | Edm.String | true |
| КоличествоЛистов | Edm.String | true |
| Комментарий | Edm.String | true |
| КратностьДокумента | Edm.Int64 | true |
| КурсДокумента | Edm.Double | true |
| НазначениеАванса | Edm.String | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетРасчетовСПодотчетнымЛицом_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| ФизЛицо_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДатаНачалаОтчетногоПериода | Edm.DateTime | true |
| ДатаОкончанияОтчетногоПериода | Edm.DateTime | true |
| ОтложитьПринятиеНДСКЗачету | Edm.Boolean | true |
| ДоговорЗакупа_Key | Edm.Guid | true |
| ВыданныеАвансы | Document_АвансовыйОтчет_ВыданныеАвансы_RowType | true |
| Товары | Document_АвансовыйОтчет_Товары_RowType | true |
| ОплатаПоставщикам | Document_АвансовыйОтчет_ОплатаПоставщикам_RowType | true |
| ВыплатаЗаработнойПлаты | Document_АвансовыйОтчет_ВыплатаЗаработнойПлаты_RowType | true |
| ОплатаПоИсполнительнымЛистам | Document_АвансовыйОтчет_ОплатаПоИсполнительнымЛистам_RowType | true |
| ПеречислениеПенсионныхВзносов | Document_АвансовыйОтчет_ПеречислениеПенсионныхВзносов_RowType | true |
| ПеречислениеСоциальныхОтчислений | Document_АвансовыйОтчет_ПеречислениеСоциальныхОтчислений_RowType | true |
| Прочее | Document_АвансовыйОтчет_Прочее_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfAccounts_Типовой]] — СчетРасчетовСПодотчетнымЛицом
