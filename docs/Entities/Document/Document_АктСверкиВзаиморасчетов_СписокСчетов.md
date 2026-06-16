---
category: Document
properties: 4
relations: 1
---

# Document_АктСверкиВзаиморасчетов_СписокСчетов

**Category:** Document  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Счет_Key | Edm.Guid | true |
| УчаствуетВРасчетах | Edm.Boolean | true |

## Related Entities

- [[ChartOfAccounts_Типовой]] — Счет
