---
category: Document
properties: 12
relations: 2
---

# Document_КорректировкаДолга_СуммыДолга

**Category:** Document  
**Properties:** 12  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Сделка | Edm.String | true |
| Сумма | Edm.Double | true |
| СуммаВзаиморасчетов | Edm.Double | true |
| КурсВзаиморасчетов | Edm.Double | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| СчетУчетаРасчетов_Key | Edm.Guid | true |
| ВидЗадолженности | Edm.String | true |
| СуммаНУ | Edm.Double | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетов
