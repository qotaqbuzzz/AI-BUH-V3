---
category: Document
properties: 9
relations: 1
---

# Document_ВедомостьПрочихДоходов_Выплаты

**Category:** Document  
**Properties:** 9  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Физлицо | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| СуммаКВыплате | Edm.Double | true |
| НомерСчета | Edm.String | true |
| ПериодВзаиморасчетов | Edm.DateTime | true |
| Физлицо_Type | Edm.String | true |
| НомерСчета_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
