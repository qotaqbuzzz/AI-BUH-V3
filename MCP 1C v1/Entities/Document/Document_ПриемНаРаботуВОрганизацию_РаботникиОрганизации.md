---
category: Document
properties: 8
relations: 4
---

# Document_ПриемНаРаботуВОрганизацию_РаботникиОрганизации

**Category:** Document  
**Properties:** 8  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сотрудник_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| Должность_Key | Edm.Guid | true |
| ДатаПриема | Edm.DateTime | true |
| ИсчислятьОППВ | Edm.Boolean | true |

## Related Entities

- [[Catalog_ДолжностиОрганизаций]] — Должность
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_СотрудникиОрганизаций]] — Сотрудник
- [[Catalog_ФизическиеЛица]] — ФизЛицо
