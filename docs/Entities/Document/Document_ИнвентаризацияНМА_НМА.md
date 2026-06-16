---
category: Document
properties: 7
relations: 1
---

# Document_ИнвентаризацияНМА_НМА

**Category:** Document  
**Properties:** 7  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НематериальныйАктив_Key | Edm.Guid | true |
| НаличиеПоДаннымУчета | Edm.Boolean | true |
| СтоимостьПоДаннымУчета | Edm.Double | true |
| НаличиеФактическое | Edm.Boolean | true |
| СтоимостьФактическая | Edm.Double | true |

## Related Entities

- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
