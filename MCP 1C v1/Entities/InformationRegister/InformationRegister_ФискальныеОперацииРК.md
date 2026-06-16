---
category: InformationRegister
properties: 11
relations: 1
---

# InformationRegister_ФискальныеОперацииРК

**Category:** InformationRegister  
**Properties:** 11  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ДокументОснование | Edm.String | false |
| ИдентификаторЗаписи | Edm.String | false |
| Организация_Key | Edm.Guid | true |
| ТорговыйОбъект | Edm.String | true |
| ДатаВремяЧека | Edm.DateTime | true |
| НомерЧека | Edm.String | true |
| ОбщаяСуммаЧека | Edm.Double | true |
| АвтономныйРежимРаботыКассы | Edm.Boolean | true |
| РегистрационныйНомерКассы | Edm.String | true |
| ДокументОснование_Type | Edm.String | false |
| ТорговыйОбъект_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
