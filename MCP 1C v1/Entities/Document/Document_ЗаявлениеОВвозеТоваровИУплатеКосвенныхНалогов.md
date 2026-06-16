---
category: Document
properties: 44
relations: 13
---

# Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов

**Category:** Document  
**Properties:** 44  
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
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СубконтоЗатратНДСБУ1 | Edm.String | true |
| СубконтоЗатратНДСБУ2 | Edm.String | true |
| СубконтоЗатратНДСБУ3 | Edm.String | true |
| СубконтоЗатратНДСНУ1 | Edm.String | true |
| СубконтоЗатратНДСНУ2 | Edm.String | true |
| СубконтоЗатратНДСНУ3 | Edm.String | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетЗатратНДСБУ_Key | Edm.Guid | true |
| СчетЗатратНДСНУ_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| ВидНалогаНДС_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| РегистрационныйНомер | Edm.String | true |
| НалоговыйПериод | Edm.DateTime | true |
| Товары | Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов_Товары_RowType | true |
| ОС | Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов_ОС_RowType | true |
| СубконтоЗатратНДСБУ1_Type | Edm.String | true |
| СубконтоЗатратНДСБУ2_Type | Edm.String | true |
| СубконтоЗатратНДСБУ3_Type | Edm.String | true |
| СубконтоЗатратНДСНУ1_Type | Edm.String | true |
| СубконтоЗатратНДСНУ2_Type | Edm.String | true |
| СубконтоЗатратНДСНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_НалогиСборыОтчисления]] — ВидНалогаНДС
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНДСНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратНДСБУ
- [[Document_ПоступлениеТоваровУслуг]] — ДокументОснование
