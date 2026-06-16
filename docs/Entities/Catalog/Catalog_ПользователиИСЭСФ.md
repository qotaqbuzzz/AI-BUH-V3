---
category: Catalog
properties: 14
relations: 1
---

# Catalog_ПользователиИСЭСФ

**Category:** Catalog  
**Properties:** 14  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| Owner_Key | Edm.Guid | true |
| DeletionMark | Edm.Boolean | true |
| ИмяАутентификации | Edm.String | true |
| ПарольАутентификации | Edm.String | true |
| СертификатАутентификации_Base64Data | Edm.Binary | true |
| ОписаниеСертификата | Edm.String | true |
| СертификатАутентификации_Type | Edm.String | true |
| СертификатАутентификации | Edm.Stream | true |

## Related Entities

- [[Catalog_Пользователи]] — Owner
