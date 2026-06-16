---
category: Document
properties: 19
relations: 7
---

# Document_ОтражениеЗарплатыВБухучете_НачисленнаяЗарплатаИВзносы

**Category:** Document  
**Properties:** 19  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Подразделение_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| СпособОтраженияЗарплатыВБухучете_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СН | Edm.Double | true |
| СО | Edm.Double | true |
| ОППВ | Edm.Double | true |
| ООСМС | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Контрагент_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ОПВР | Edm.Double | true |
| Резерв_Key | Edm.Guid | true |
| РезервБУ | Edm.Boolean | true |
| РезервНУ | Edm.Boolean | true |
| ЕП | Edm.Double | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Резервы]] — Резерв
- [[Catalog_СпособыОтраженияЗарплатыВБухУчете]] — СпособОтраженияЗарплатыВБухучете
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
