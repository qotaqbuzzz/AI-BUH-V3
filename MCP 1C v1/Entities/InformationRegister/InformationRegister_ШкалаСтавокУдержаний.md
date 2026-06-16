---
category: InformationRegister
properties: 7
relations: 1
---

# InformationRegister_ШкалаСтавокУдержаний

**Category:** InformationRegister  
**Properties:** 7  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| ВидРасчета_Key | Edm.Guid | false |
| НомерСтрокиШкалы | Edm.Int16 | false |
| НижнийПредел | Edm.Double | true |
| ВерхнийПредел | Edm.Double | true |
| Величина | Edm.Double | true |
| МинСумма | Edm.Double | true |

## Related Entities

- [[ChartOfCalculationTypes_УдержанияОрганизаций]] — ВидРасчета
