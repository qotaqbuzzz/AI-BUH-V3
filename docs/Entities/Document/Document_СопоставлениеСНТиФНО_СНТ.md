---
category: Document
properties: 6
relations: 1
---

# Document_СопоставлениеСНТиФНО_СНТ

**Category:** Document  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| РегистрационныйНомер | Edm.String | true |
| Дата | Edm.DateTime | true |
| Сумма | Edm.Double | true |
| ДокументСНТ_Key | Edm.Guid | true |

## Related Entities

- [[Document_СНТ]] — ДокументСНТ
