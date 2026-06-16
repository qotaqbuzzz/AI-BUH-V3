---
category: Document
properties: 31
relations: 11
---

# Document_ЗаявлениеОВвозеТоваровИУплатеКосвенныхНалогов_Товары

**Category:** Document  
**Properties:** 31  
**Relations:** 11

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| НаименованиеТовара | Edm.String | true |
| КодТНВЭД | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Сумма | Edm.Double | true |
| Валюта_Key | Edm.Guid | true |
| КурсВалюты | Edm.Double | true |
| СуммаДополнительныхРасходов | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| НомерТранспортногоДокумента | Edm.String | true |
| ДатаТранспортногоДокумента | Edm.DateTime | true |
| НомерСчетаФактуры | Edm.String | true |
| ДатаСчетаФактуры | Edm.DateTime | true |
| ДатаПринятияНаУчет | Edm.DateTime | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| ВидНДС | Edm.String | true |
| НДСВидОборота | Edm.String | true |
| СчетУчетаНДСКВозмещению_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| СтранаПроисхождения_Key | Edm.Guid | true |
| ПризнакПроисхождения | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхождения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСКВозмещению
- [[Document_ПоступлениеТоваровУслуг]] — ДокументОснование
