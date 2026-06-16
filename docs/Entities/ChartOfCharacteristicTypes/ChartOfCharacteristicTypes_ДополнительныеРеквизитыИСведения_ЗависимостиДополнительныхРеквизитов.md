---
category: ChartOfCharacteristicTypes
properties: 9
relations: 1
---

# ChartOfCharacteristicTypes_ДополнительныеРеквизитыИСведения_ЗависимостиДополнительныхРеквизитов

**Category:** ChartOfCharacteristicTypes  
**Properties:** 9  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЗависимоеСвойство | Edm.String | true |
| НаборСвойств_Key | Edm.Guid | true |
| Реквизит | Edm.String | true |
| Условие | Edm.String | true |
| Значение | Edm.String | true |
| Реквизит_Type | Edm.String | true |
| Значение_Type | Edm.String | true |

## Related Entities

- [[Catalog_НаборыДополнительныхРеквизитовИСведений]] — НаборСвойств
