---
category: Document
properties: 17
relations: 6
---

# Document_ЗакрытиеДтКтЗадолженности

**Category:** Document  
**Properties:** 17  
**Relations:** 6

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
| РучнаяКорректировка | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетДт_Key | Edm.Guid | true |
| СчетКт_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| Задолженность | Document_ЗакрытиеДтКтЗадолженности_Задолженность_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[ChartOfAccounts_Типовой]] — СчетДт
- [[ChartOfAccounts_Типовой]] — СчетКт
