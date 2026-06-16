---
category: Document
properties: 5
relations: 1
---

# Document_ВедомостьНаВозвратПрочихВыплат_ПрочиеВыплаты

**Category:** Document  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ПериодВзаиморасчетов | Edm.DateTime | true |
| Сумма | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
