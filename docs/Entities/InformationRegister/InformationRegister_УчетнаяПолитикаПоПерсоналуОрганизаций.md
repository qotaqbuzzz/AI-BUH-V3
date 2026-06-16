---
category: InformationRegister
properties: 6
relations: 1
---

# InformationRegister_УчетнаяПолитикаПоПерсоналуОрганизаций

**Category:** InformationRegister  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| ВестиУчетПоГоловнойОрганизации | Edm.Boolean | true |
| УчитыватьКадровыеПерестановкиПриРасчетеСреднегоЗаработка | Edm.Boolean | true |
| ВариантУчетаКадровыхПерестановок | Edm.String | true |
| РасчетКоэффициентаНарастающимИтогом | Edm.Boolean | true |
| РассчитыватьКоэффициентИндексацииВПределахКадровыхПерестановок | Edm.Boolean | true |

## Related Entities

- [[Catalog_Организации]] — Организация
