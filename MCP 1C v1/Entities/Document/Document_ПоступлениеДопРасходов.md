---
category: Document
properties: 59
relations: 14
---

# Document_ПоступлениеДопРасходов

**Category:** Document  
**Properties:** 59  
**Relations:** 14

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
| ВидВходящегоДокумента | Edm.String | true |
| ВидОперации | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| НомерВходящегоДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| Содержание | Edm.String | true |
| СпособРаспределения | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| СубконтоБУ1 | Edm.String | true |
| СубконтоБУ2 | Edm.String | true |
| СубконтоБУ3 | Edm.String | true |
| СубконтоНУ1 | Edm.String | true |
| СубконтоНУ2 | Edm.String | true |
| СубконтоНУ3 | Edm.String | true |
| СчетБУ_Key | Edm.Guid | true |
| СчетНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| ОтложитьПринятиеНДСКЗачету | Edm.Boolean | true |
| НаличиеОригинала | Edm.Boolean | true |
| Товары | Document_ПоступлениеДопРасходов_Товары_RowType | true |
| ОС | Document_ПоступлениеДопРасходов_ОС_RowType | true |
| НМА | Document_ПоступлениеДопРасходов_НМА_RowType | true |
| УчастникиСовместнойДеятельности | Document_ПоступлениеДопРасходов_УчастникиСовместнойДеятельности_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Сделка_Type | Edm.String | true |
| СубконтоБУ1_Type | Edm.String | true |
| СубконтоБУ2_Type | Edm.String | true |
| СубконтоБУ3_Type | Edm.String | true |
| СубконтоНУ1_Type | Edm.String | true |
| СубконтоНУ2_Type | Edm.String | true |
| СубконтоНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
