---
category: Document
properties: 5
relations: 1
---

# Document_ЗакрытиеМесяца_КурсыВалют

**Category:** Document  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Валюта_Key | Edm.Guid | true |
| Курс | Edm.Double | true |
| Кратность | Edm.Int64 | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
