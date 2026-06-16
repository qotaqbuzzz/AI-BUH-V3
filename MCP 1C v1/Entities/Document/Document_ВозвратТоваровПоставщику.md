---
category: Document
properties: 57
relations: 17
---

# Document_ВозвратТоваровПоставщику

**Category:** Document  
**Properties:** 57  
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
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| Грузополучатель_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| Склад_Key | Edm.Guid | true |
| СобытиеОС_Key | Edm.Guid | true |
| СубконтоОтнесенияСебестоимостиБУ1 | Edm.String | true |
| СубконтоОтнесенияСебестоимостиБУ2 | Edm.String | true |
| СубконтоОтнесенияСебестоимостиБУ3 | Edm.String | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетОтнесенияСебестоимостиБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоВозвратам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| НомерВходящегоДокумента | Edm.String | true |
| ВидВходящегоДокумента | Edm.String | true |
| УчитыватьКПН | Edm.Boolean | true |
| СчетОтнесенияСебестоимостиНУ_Key | Edm.Guid | true |
| СубконтоОтнесенияСебестоимостиНУ1 | Edm.String | true |
| СубконтоОтнесенияСебестоимостиНУ2 | Edm.String | true |
| СубконтоОтнесенияСебестоимостиНУ3 | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОтложитьПринятиеНДСКЗачету | Edm.Boolean | true |
| ДоговорЗакупа_Key | Edm.Guid | true |
| Товары | Document_ВозвратТоваровПоставщику_Товары_RowType | true |
| Услуги | Document_ВозвратТоваровПоставщику_Услуги_RowType | true |
| ОС | Document_ВозвратТоваровПоставщику_ОС_RowType | true |
| УчастникиСовместнойДеятельности | Document_ВозвратТоваровПоставщику_УчастникиСовместнойДеятельности_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Сделка_Type | Edm.String | true |
| СубконтоОтнесенияСебестоимостиБУ1_Type | Edm.String | true |
| СубконтоОтнесенияСебестоимостиБУ2_Type | Edm.String | true |
| СубконтоОтнесенияСебестоимостиБУ3_Type | Edm.String | true |
| СубконтоОтнесенияСебестоимостиНУ1_Type | Edm.String | true |
| СубконтоОтнесенияСебестоимостиНУ2_Type | Edm.String | true |
| СубконтоОтнесенияСебестоимостиНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Грузополучатель
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_СобытияОС]] — СобытиеОС
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Налоговый]] — СчетОтнесенияСебестоимостиНУ
- [[ChartOfAccounts_Типовой]] — СчетОтнесенияСебестоимостиБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоВозвратам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
