---
category: Document
properties: 9
relations: 5
---

# Document_ОтражениеЗарплатыВБухучете_РегламентированныеУдержания

**Category:** Document  
**Properties:** 9  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Подразделение_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| Сумма | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Контрагент_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
