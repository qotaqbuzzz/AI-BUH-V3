---
category: InformationRegister
properties: 10
relations: 1
---

# InformationRegister_СведенияОНоменклатуреГСВС

**Category:** InformationRegister  
**Properties:** 10  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| НоменклатураГСВС_Key | Edm.Guid | false |
| ПризнакУчетаНаВиртуальномСкладе | Edm.Boolean | true |
| ПризнакТовараДвойногоНазначения | Edm.Boolean | true |
| ПризнакУникальногоТовара | Edm.Boolean | true |
| ПризнакПеречняИзьятий | Edm.Boolean | true |
| ПолныйКодГСВС | Edm.String | true |
| ПризнакАктивности | Edm.Boolean | true |
| ДействиеЗаписиНачальнаяДата | Edm.DateTime | true |
| ДействиеЗаписиКонечнаяДата | Edm.DateTime | true |

## Related Entities

- [[Catalog_НоменклатураГСВС]] — НоменклатураГСВС
