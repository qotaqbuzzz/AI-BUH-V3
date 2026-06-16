---
category: InformationRegister
properties: 13
relations: 2
---

# InformationRegister_СобытияКалендаряБухгалтера

**Category:** InformationRegister  
**Properties:** 13  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ДатаПоказа | Edm.DateTime | false |
| ЗаПериодПо | Edm.DateTime | false |
| ЗаПериодС | Edm.DateTime | false |
| ИсточникОтчета | Edm.String | false |
| Организация_Key | Edm.Guid | false |
| Пользователь_Key | Edm.Guid | false |
| ПоследняяДатаДействия | Edm.DateTime | false |
| Состояние | Edm.String | false |
| ТипСообщения | Edm.String | false |
| ФормаОтчета | Edm.String | true |
| Периодичность | Edm.String | true |
| Название | Edm.String | true |
| Налогоплательщик | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_Пользователи]] — Пользователь
