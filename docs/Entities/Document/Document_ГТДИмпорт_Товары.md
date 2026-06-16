---
category: Document
properties: 28
relations: 9
---

# Document_ГТДИмпорт_Товары

**Category:** Document  
**Properties:** 28  
**Relations:** 9

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НомерРаздела | Edm.Int16 | true |
| Номенклатура_Key | Edm.Guid | true |
| НаименованиеТовара | Edm.String | true |
| КодТНВЭД | Edm.String | true |
| КоличествоМест | Edm.Double | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Коэффициент | Edm.Double | true |
| Количество | Edm.Double | true |
| ФактурнаяСтоимость | Edm.Double | true |
| СуммаПошлины | Edm.Double | true |
| СуммаСбора | Edm.Double | true |
| СуммаСбораВал | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СтранаПроисхождения_Key | Edm.Guid | true |
| ДокументПартии_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НДССрокПлатежа | Edm.DateTime | true |
| ВидНДС | Edm.String | true |
| НомерГТД_Key | Edm.Guid | true |
| ПризнакПроисхождения | Edm.String | true |
| ТаможеннаяСтоимость | Edm.Double | true |
| СуммаПошлиныСпец | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхождения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[Document_ПоступлениеТоваровУслуг]] — ДокументПартии
