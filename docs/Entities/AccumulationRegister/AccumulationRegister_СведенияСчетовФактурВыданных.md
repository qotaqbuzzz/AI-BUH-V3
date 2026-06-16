---
category: AccumulationRegister
properties: 3
relations: 8
---

# AccumulationRegister_СведенияСчетовФактурВыданных

**Category:** AccumulationRegister  
**Properties:** 3  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Recorder | Edm.String | false |
| RecordSet | AccumulationRegister_СведенияСчетовФактурВыданных_RowType | false |
| Recorder_Type | Edm.String | false |

## Related Entities

- [[Catalog_КлассификаторСтранМира]] — СтранаНазначения
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Контрагенты]] — Покупатель
- [[Catalog_Организации]] — Налогоплательщик
- [[Catalog_Организации]] — Организация
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Document_СчетФактураВыданный]] — СчетФактура
