---
category: Document
properties: 7
relations: 4
---

# Document_ВводСведенийОРеглУчетеПлановыхНачисленийРаботниковОрганизаций_ОсновныеНачисления

**Category:** Document  
**Properties:** 7  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сотрудник_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| ДатаНачала | Edm.DateTime | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_СотрудникиОрганизаций]] — Сотрудник
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций]] — ВидРасчета
