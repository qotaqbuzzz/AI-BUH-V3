---
category: Document
properties: 6
relations: 1
---

# Document_ИзменениеПараметровНачисленияАмортизацииНМА_НМА

**Category:** Document  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НематериальныйАктив_Key | Edm.Guid | true |
| СрокПолезногоИспользованияБУ | Edm.Int16 | true |
| ОбъемПродукцииРаботДляВычисленияАмортизацииБУ | Edm.Int64 | true |
| СтоимостьДляВычисленияАмортизацииБУ | Edm.Double | true |

## Related Entities

- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
