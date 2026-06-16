---
category: Document
properties: 12
relations: 4
---

# Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_Услуги

**Category:** Document  
**Properties:** 12  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Количество | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| ОборотПоРеализации | Edm.Double | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| Цена | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
