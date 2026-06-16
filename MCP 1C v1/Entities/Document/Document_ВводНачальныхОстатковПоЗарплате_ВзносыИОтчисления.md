---
category: Document
properties: 12
relations: 1
---

# Document_ВводНачальныхОстатковПоЗарплате_ВзносыИОтчисления

**Category:** Document  
**Properties:** 12  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ВидПлатежа | Edm.String | true |
| ОПВРасчетыСБюджетом | Edm.Double | true |
| ОПВПодлежитПеречислениюВФонды | Edm.Double | true |
| СОРасчетыСФондами | Edm.Double | true |
| ОППВРасчетыСФондами | Edm.Double | true |
| ВОСМСРасчетыСФондами | Edm.Double | true |
| ООСМСРасчетыСФондами | Edm.Double | true |
| ОПВРРасчетыСФондами | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
