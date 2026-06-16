---
category: Document
properties: 6
relations: 2
---

# Document_ИнвентаризацияДенежныхСредств_ДенежныеСредства

**Category:** Document  
**Properties:** 6  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сумма | Edm.Double | true |
| СуммаУчет | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| Валюта_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
