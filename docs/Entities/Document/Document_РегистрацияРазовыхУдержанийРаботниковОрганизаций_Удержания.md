---
category: Document
properties: 7
relations: 3
---

# Document_РегистрацияРазовыхУдержанийРаботниковОрганизаций_Удержания

**Category:** Document  
**Properties:** 7  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Физлицо_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| Размер | Edm.Double | true |
| Результат | Edm.Double | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
- [[Catalog_ФизическиеЛица]] — Физлицо
- [[ChartOfCalculationTypes_УдержанияОрганизаций]] — ВидРасчета
