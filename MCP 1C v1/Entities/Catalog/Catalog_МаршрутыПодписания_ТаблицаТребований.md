---
category: Catalog
properties: 8
relations: 2
---

# Catalog_МаршрутыПодписания_ТаблицаТребований

**Category:** Catalog  
**Properties:** 8  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Идентификатор | Edm.String | true |
| ИдентификаторРодителя | Edm.String | true |
| Порядок | Edm.Int64 | true |
| Требование | Edm.String | true |
| Подписант_Key | Edm.Guid | true |
| Сертификат_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Пользователи]] — Подписант
- [[Catalog_СертификатыКлючейЭлектроннойПодписиИШифрования]] — Сертификат
