---
category: Document
properties: 42
relations: 17
---

# Document_ГТДИмпорт

**Category:** Document  
**Properties:** 42  
**Relations:** 17

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
| ВалютаВзаиморасчетов_Key | Edm.Guid | true |
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КратностьДокумента | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| КурсДокумента | Edm.Double | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| УдалитьНомерГТД_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомВал_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| НомерВходящегоДокумента | Edm.String | true |
| ВидВходящегоДокумента | Edm.String | true |
| УчитыватьКПН | Edm.Boolean | true |
| НомерГТД | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ТаможенныйСбор | Edm.Double | true |
| ВариантОтражения | Edm.Int16 | true |
| ВидНалогаТаможеннойПошлины_Key | Edm.Guid | true |
| ВидНалогаТаможенногоСбора_Key | Edm.Guid | true |
| ВидНалогаНДСПоИмпорту_Key | Edm.Guid | true |
| ВидНалогаСпециальнойПошлины_Key | Edm.Guid | true |
| Товары | Document_ГТДИмпорт_Товары_RowType | true |
| Разделы | Document_ГТДИмпорт_Разделы_RowType | true |
| ОС | Document_ГТДИмпорт_ОС_RowType | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаВзаиморасчетов
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_НалогиСборыОтчисления]] — ВидНалогаНДСПоИмпорту
- [[Catalog_НалогиСборыОтчисления]] — ВидНалогаСпециальнойПошлины
- [[Catalog_НалогиСборыОтчисления]] — ВидНалогаТаможенногоСбора
- [[Catalog_НалогиСборыОтчисления]] — ВидНалогаТаможеннойПошлины
- [[Catalog_НомераГТД]] — УдалитьНомерГТД
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомВал
- [[Document_ПоступлениеТоваровУслуг]] — ДокументОснование
