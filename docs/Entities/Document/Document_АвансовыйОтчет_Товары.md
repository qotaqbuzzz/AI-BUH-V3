---
category: Document
properties: 24
relations: 10
---

# Document_АвансовыйОтчет_Товары

**Category:** Document  
**Properties:** 24  
**Relations:** 10

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидВходящегоДокумента | Edm.String | true |
| НомерВходящегоДокумента | Edm.String | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| Поставщик_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Коэффициент | Edm.Double | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СчетФактура_Key | Edm.Guid | true |
| ДатаСФ | Edm.DateTime | true |
| НомерСФ | Edm.String | true |
| ПредъявленСФ | Edm.Boolean | true |
| НомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Контрагенты]] — Поставщик
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[Document_СчетФактураПолученный]] — СчетФактура
