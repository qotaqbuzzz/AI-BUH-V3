---
category: Document
properties: 18
relations: 8
---

# Document_ОтражениеЗарплатыВБухучете_УдержаннаяЗарплата

**Category:** Document  
**Properties:** 18  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Подразделение_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| Сумма | Edm.Double | true |
| Контрагент_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| КонтрагентОтправитель_Key | Edm.Guid | true |
| РаботникОрганизации_Key | Edm.Guid | true |
| СчетУчета_Key | Edm.Guid | true |
| Субконто1 | Edm.String | true |
| Субконто2 | Edm.String | true |
| Субконто3 | Edm.String | true |
| ДокументОснование_Key | Edm.Guid | true |
| Субконто1_Type | Edm.String | true |
| Субконто2_Type | Edm.String | true |
| Субконто3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Контрагенты]] — КонтрагентОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_ФизическиеЛица]] — РаботникОрганизации
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
- [[ChartOfAccounts_Типовой]] — СчетУчета
- [[Document_ИсполнительныйЛист]] — ДокументОснование
