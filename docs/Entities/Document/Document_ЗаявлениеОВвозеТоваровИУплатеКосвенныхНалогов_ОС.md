---
category: Document
properties: 25
relations: 9
---

# Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов_ОС

**Category:** Document  
**Properties:** 25  
**Relations:** 9

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Валюта_Key | Edm.Guid | true |
| ДатаПринятияНаУчет | Edm.DateTime | true |
| ДатаСчетаФактуры | Edm.DateTime | true |
| ДатаТранспортногоДокумента | Edm.DateTime | true |
| ДокументОснование_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| КодТНВЭД | Edm.String | true |
| Количество | Edm.Double | true |
| КурсВалюты | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| НомерСчетаФактуры | Edm.String | true |
| НомерТранспортногоДокумента | Edm.String | true |
| ОборотПоРеализации | Edm.Double | true |
| ОсновноеСредство_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаДополнительныхРасходов | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| ВидНДС | Edm.String | true |
| НДСВидОборота | Edm.String | true |
| СчетУчетаНДСКВозмещению_Key | Edm.Guid | true |
| НДСВидПоступления_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСКВозмещению
- [[Document_ПоступлениеТоваровУслуг]] — ДокументОснование
