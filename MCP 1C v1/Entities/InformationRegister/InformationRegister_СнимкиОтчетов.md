---
category: InformationRegister
properties: 14
relations: 2
---

# InformationRegister_СнимкиОтчетов

**Category:** InformationRegister  
**Properties:** 14  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Пользователь_Key | Edm.Guid | false |
| Отчет | Edm.String | false |
| Вариант_Key | Edm.Guid | false |
| ХешПользовательскойНастройки | Edm.String | false |
| РезультатОтчета_Base64Data | Edm.Binary | true |
| ДатаАктуальности | Edm.DateTime | true |
| ДатаПоследнегоПросмотра | Edm.DateTime | true |
| ПользовательскаяНастройка_Base64Data | Edm.Binary | true |
| ОшибкаОбновленияОтчета | Edm.Boolean | true |
| Отчет_Type | Edm.String | false |
| РезультатОтчета_Type | Edm.String | true |
| ПользовательскаяНастройка_Type | Edm.String | true |
| РезультатОтчета | Edm.Stream | true |
| ПользовательскаяНастройка | Edm.Stream | true |

## Related Entities

- [[Catalog_ВариантыОтчетов]] — Вариант
- [[Catalog_Пользователи]] — Пользователь
