---
category: Document
properties: 33
relations: 12
---

# Document_ОплатаОтПокупателяПлатежнойКартой

**Category:** Document  
**Properties:** 33  
**Relations:** 12

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
| ДоговорЭквайринга_Key | Edm.Guid | true |
| ДоговорВзаиморасчетовЭквайрера_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| Эквайрер_Key | Edm.Guid | true |
| СчетУчетаРасчетовСЭквайрером_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ВидОплаты_Key | Edm.Guid | true |
| ПроцентТорговойУступки | Edm.Double | true |
| СуммаТорговойУступки | Edm.Double | true |
| НомерЧекаККМ | Edm.Int64 | true |
| НомерПлатежнойКарты | Edm.String | true |
| СсылочныйНомер | Edm.String | true |
| НомерЧекаЭТ | Edm.String | true |
| ДанныеПереданыВБанк | Edm.Boolean | true |
| РасшифровкаПлатежа | Document_ОплатаОтПокупателяПлатежнойКартой_РасшифровкаПлатежа_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыОплатЭквайринга]] — ВидОплаты
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорВзаиморасчетовЭквайрера
- [[Catalog_ДоговорыЭквайринга]] — ДоговорЭквайринга
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Контрагенты]] — Эквайрер
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСЭквайрером
