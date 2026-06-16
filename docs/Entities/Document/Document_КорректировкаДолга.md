---
category: Document
properties: 52
relations: 14
---

# Document_КорректировкаДолга

**Category:** Document  
**Properties:** 52  
**Relations:** 14

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
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ИспользоватьВспомогательныйСчет | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| КонтрагентДебитор_Key | Edm.Guid | true |
| КонтрагентКредитор_Key | Edm.Guid | true |
| КратностьДокумента | Edm.Int64 | true |
| КурсДокумента | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СубконтоДт1 | Edm.String | true |
| СубконтоДт2 | Edm.String | true |
| СубконтоДт3 | Edm.String | true |
| СубконтоДтНУ1 | Edm.String | true |
| СубконтоДтНУ2 | Edm.String | true |
| СубконтоДтНУ3 | Edm.String | true |
| СубконтоКт1 | Edm.String | true |
| СубконтоКт2 | Edm.String | true |
| СубконтоКт3 | Edm.String | true |
| СубконтоКтНУ1 | Edm.String | true |
| СубконтоКтНУ2 | Edm.String | true |
| СубконтоКтНУ3 | Edm.String | true |
| СчетДт_Key | Edm.Guid | true |
| СчетДтНУ_Key | Edm.Guid | true |
| СчетКт_Key | Edm.Guid | true |
| СчетКтНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СуммыДолга | Document_КорректировкаДолга_СуммыДолга_RowType | true |
| СубконтоДт1_Type | Edm.String | true |
| СубконтоДт2_Type | Edm.String | true |
| СубконтоДт3_Type | Edm.String | true |
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |
| СубконтоКт1_Type | Edm.String | true |
| СубконтоКт2_Type | Edm.String | true |
| СубконтоКт3_Type | Edm.String | true |
| СубконтоКтНУ1_Type | Edm.String | true |
| СубконтоКтНУ2_Type | Edm.String | true |
| СубконтоКтНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — КонтрагентДебитор
- [[Catalog_Контрагенты]] — КонтрагентКредитор
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfAccounts_Налоговый]] — СчетДтНУ
- [[ChartOfAccounts_Налоговый]] — СчетКтНУ
- [[ChartOfAccounts_Типовой]] — СчетДт
- [[ChartOfAccounts_Типовой]] — СчетКт
