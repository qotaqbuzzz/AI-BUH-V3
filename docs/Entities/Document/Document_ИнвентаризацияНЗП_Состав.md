---
category: Document
properties: 5
relations: 1
---

# Document_ИнвентаризацияНЗП_Состав

**Category:** Document  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НоменклатурнаяГруппа_Key | Edm.Guid | true |
| СуммаБУ | Edm.Double | true |
| СуммаНУ | Edm.Double | true |

## Related Entities

- [[Catalog_НоменклатурныеГруппы]] — НоменклатурнаяГруппа
