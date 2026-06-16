---
category: Document
properties: 15
relations: 6
---

# Document_ОплатаОтПокупателяПлатежнойКартой_РасшифровкаПлатежа

**Category:** Document  
**Properties:** 15  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Сделка | Edm.String | true |
| КурсВзаиморасчетов | Edm.Double | true |
| СуммаПлатежа | Edm.Double | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| СуммаВзаиморасчетов | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетНаОплату_Key | Edm.Guid | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомБУ
- [[Document_СчетНаОплатуПокупателю]] — СчетНаОплату
