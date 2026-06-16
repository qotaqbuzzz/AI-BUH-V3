---
category: Document
properties: 9
relations: 4
---

# Document_ОтражениеЗарплатыВБухучете_ПеняПоВзносамИОтчислениям

**Category:** Document  
**Properties:** 9  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Подразделение_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| Сумма | Edm.Double | true |
| СпособОтраженияЗарплатыВБухучете_Key | Edm.Guid | true |
| ВидПлатежа | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_СпособыОтраженияЗарплатыВБухУчете]] — СпособОтраженияЗарплатыВБухучете
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
