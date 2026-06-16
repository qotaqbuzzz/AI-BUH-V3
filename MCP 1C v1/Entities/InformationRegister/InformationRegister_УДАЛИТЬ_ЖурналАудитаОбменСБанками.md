---
category: InformationRegister
properties: 7
relations: 1
---

# InformationRegister_УДАЛИТЬ_ЖурналАудитаОбменСБанками

**Category:** InformationRegister  
**Properties:** 7  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| НастройкаОбмена_Key | Edm.Guid | false |
| ИдентификаторСобытия | Edm.String | false |
| Пользователь_Key | Edm.Guid | false |
| Метод | Edm.String | true |
| Запрос | Edm.String | true |
| Ответ | Edm.String | true |

## Related Entities

- [[Catalog_Пользователи]] — Пользователь
