---
category: Document
properties: 14
relations: 5
---

# Document_НачислениеЗарплатыРаботникамОрганизаций_Начисления

**Category:** Document  
**Properties:** 14  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сотрудник_Key | Edm.Guid | true |
| Физлицо_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| Размер | Edm.Double | true |
| Результат | Edm.Double | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| ОтработаноДней | Edm.Double | true |
| ОтработаноЧасов | Edm.Double | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| ДополнительныеДанные | Edm.Double | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_СотрудникиОрганизаций]] — Сотрудник
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
- [[Catalog_ФизическиеЛица]] — Физлицо
- [[ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций]] — ВидРасчета
