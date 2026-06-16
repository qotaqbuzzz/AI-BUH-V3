---
category: Document
properties: 27
relations: 6
---

# Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_НМА

**Category:** Document  
**Properties:** 27  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НематериальныйАктив_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| УплаченныйНДС | Edm.Double | true |
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
| СуммаСписанияСтоимостиДляВычисленияАмортизации | Edm.Double | true |
| АналитикаЗатратНДСБУ1_Type | Edm.String | true |
| АналитикаЗатратНДСБУ2_Type | Edm.String | true |
| АналитикаЗатратНДСБУ3_Type | Edm.String | true |
| АналитикаЗатратНДСНУ1_Type | Edm.String | true |
| АналитикаЗатратНДСНУ2_Type | Edm.String | true |
| АналитикаЗатратНДСНУ3_Type | Edm.String | true |
| ДокументНДС_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНДСНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратНДСБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
