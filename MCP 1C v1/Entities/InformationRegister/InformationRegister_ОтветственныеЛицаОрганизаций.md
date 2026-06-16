---
category: InformationRegister
properties: 6
relations: 2
---

# InformationRegister_ОтветственныеЛицаОрганизаций

**Category:** InformationRegister  
**Properties:** 6  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| СтруктурнаяЕдиница | Edm.String | false |
| ОтветственноеЛицо | Edm.String | false |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Должность_Key | Edm.Guid | true |
| СтруктурнаяЕдиница_Type | Edm.String | false |

## Related Entities

- [[Catalog_ДолжностиОрганизаций]] — Должность
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
