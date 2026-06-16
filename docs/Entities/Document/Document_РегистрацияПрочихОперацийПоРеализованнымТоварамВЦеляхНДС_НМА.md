---
category: Document
properties: 9
relations: 4
---

# Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_НМА

**Category:** Document  
**Properties:** 9  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НематериальныйАктив_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| ОборотПоРеализации | Edm.Double | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
