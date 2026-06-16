---
category: Document
properties: 6
relations: 3
---

# Document_ПриемНаРаботуВОрганизацию_ОсновныеНачисления

**Category:** Document  
**Properties:** 6  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сотрудник_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| Размер | Edm.Double | true |

## Related Entities

- [[Catalog_СотрудникиОрганизаций]] — Сотрудник
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций]] — ВидРасчета
