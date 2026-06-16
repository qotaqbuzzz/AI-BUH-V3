---
category: Document
properties: 8
relations: 1
---

# Document_ВводНачальныхОстатковПоЗарплате_ОПВПодлежитПеречислению

**Category:** Document  
**Properties:** 8  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ВидПлатежа | Edm.String | true |
| МесяцВыплатыДоходов | Edm.DateTime | true |
| ОПВПодлежитПеречислениюВФонды | Edm.Double | true |
| ВОСМСПодлежитПеречислениюВФонды | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
