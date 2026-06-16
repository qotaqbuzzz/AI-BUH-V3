---
category: Document
properties: 17
relations: 8
---

# Document_ИнвентаризацияНЗП

**Category:** Document  
**Properties:** 17  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| Состав | Document_ИнвентаризацияНЗП_Состав_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
