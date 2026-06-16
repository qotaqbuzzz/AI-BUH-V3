---
category: InformationRegister
properties: 10
relations: 1
---

# InformationRegister_ТаблицыГруппДоступа

**Category:** InformationRegister  
**Properties:** 10  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Таблица | Edm.String | false |
| ГруппаДоступа_Key | Edm.Guid | false |
| ПравоИзменение | Edm.Boolean | true |
| ПравоДобавление | Edm.Boolean | true |
| ПравоЧтениеБезОграничения | Edm.Boolean | true |
| ПравоИзменениеБезОграничения | Edm.Boolean | true |
| ПравоДобавлениеБезОграничения | Edm.Boolean | true |
| ТипТаблицы | Edm.String | true |
| Таблица_Type | Edm.String | false |
| ТипТаблицы_Type | Edm.String | true |

## Related Entities

- [[Catalog_ГруппыДоступа]] — ГруппаДоступа
