---
category: Document
properties: 7
relations: 1
---

# Document_ВводНачальныхОстатковПоЗарплате_ЗарплатаИНалоги

**Category:** Document  
**Properties:** 7  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ВзаиморасчетыСРаботниками | Edm.Double | true |
| ВзаиморасчетыСДепонентами | Edm.Double | true |
| ИПНРасчетыСБюджетом | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
