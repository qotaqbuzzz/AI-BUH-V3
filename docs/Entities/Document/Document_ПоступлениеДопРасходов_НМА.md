---
category: Document
properties: 14
relations: 6
---

# Document_ПоступлениеДопРасходов_НМА

**Category:** Document  
**Properties:** 14  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДокументПартии_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НематериальныйАктив_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СуммаТовара | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СуммаРаспределения | Edm.Double | true |
| СуммаРаспределенияНДС | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[Document_ПоступлениеНМА]] — ДокументПартии
