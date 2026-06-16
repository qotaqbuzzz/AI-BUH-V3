---
category: Document
properties: 4
relations: 1
---

# Document_ПлатежноеПоручениеВходящее_ВозвратСоциальныхОтчислений

**Category:** Document  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Документ_Key | Edm.Guid | true |
| СуммаВозврата | Edm.Double | true |

## Related Entities

- [[Document_СОВозвратОтчислений]] — Документ
