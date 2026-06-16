---
category: Document
properties: 31
relations: 8
---

# Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_Товары

**Category:** Document  
**Properties:** 31  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| УплаченныйНДС | Edm.Double | true |
| НомерГТД_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| СчетЗатратНДСБУ_Key | Edm.Guid | true |
| АналитикаЗатратНДСБУ1 | Edm.String | true |
| АналитикаЗатратНДСБУ2 | Edm.String | true |
| АналитикаЗатратНДСБУ3 | Edm.String | true |
| СчетЗатратНДСНУ_Key | Edm.Guid | true |
| АналитикаЗатратНДСНУ1 | Edm.String | true |
| АналитикаЗатратНДСНУ2 | Edm.String | true |
| АналитикаЗатратНДСНУ3 | Edm.String | true |
| ДокументНДС | Edm.String | true |
| АналитикаЗатратНДСБУ1_Type | Edm.String | true |
| АналитикаЗатратНДСБУ2_Type | Edm.String | true |
| АналитикаЗатратНДСБУ3_Type | Edm.String | true |
| АналитикаЗатратНДСНУ1_Type | Edm.String | true |
| АналитикаЗатратНДСНУ2_Type | Edm.String | true |
| АналитикаЗатратНДСНУ3_Type | Edm.String | true |
| ДокументНДС_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНДСНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратНДСБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
