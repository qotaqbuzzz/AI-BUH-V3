---
category: Document
properties: 16
relations: 4
---

# Document_АвансовыйОтчет_ОплатаПоставщикам

**Category:** Document  
**Properties:** 16  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидВходящегоДокумента | Edm.String | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| НомерВходящегоДокумента | Edm.String | true |
| Сумма | Edm.Double | true |
| Контрагент_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| СуммаВзаиморасчетов | Edm.Double | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| КурсВзаиморасчетов | Edm.Double | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| Сделка | Edm.String | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
