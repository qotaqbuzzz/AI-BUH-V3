---
category: InformationRegister
properties: 9
relations: 3
---

# InformationRegister_СостояниеПодписанияЭД

**Category:** InformationRegister  
**Properties:** 9  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Объект_Key | Edm.Guid | false |
| Идентификатор | Edm.String | false |
| ИдентификаторРодителя | Edm.String | true |
| Порядок | Edm.Int64 | true |
| Требование | Edm.String | true |
| Подписант_Key | Edm.Guid | true |
| Сертификат_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Текущий | Edm.Boolean | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_Пользователи]] — Подписант
- [[Catalog_СертификатыКлючейЭлектроннойПодписиИШифрования]] — Сертификат
