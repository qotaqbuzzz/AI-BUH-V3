---
category: Document
properties: 12
relations: 4
---

# Document_ОтражениеЗарплатыВБухучете_ОценочныеОбязательства

**Category:** Document  
**Properties:** 12  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Подразделение_Key | Edm.Guid | true |
| СпособОтраженияЗарплатыВБухучете_Key | Edm.Guid | true |
| СуммаРезерва | Edm.Double | true |
| СуммаРезерваСН | Edm.Double | true |
| СуммаРезерваСО | Edm.Double | true |
| СуммаРезерваОППВ | Edm.Double | true |
| СуммаРезерваОтчисленияОСМС | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СуммаРезерваОПВР | Edm.Double | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_СпособыОтраженияЗарплатыВБухУчете]] — СпособОтраженияЗарплатыВБухучете
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
