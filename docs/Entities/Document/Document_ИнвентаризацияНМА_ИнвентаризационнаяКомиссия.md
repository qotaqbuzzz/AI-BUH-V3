---
category: Document
properties: 4
relations: 1
---

# Document_ИнвентаризацияНМА_ИнвентаризационнаяКомиссия

**Category:** Document  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| Председатель | Edm.Boolean | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
