---
category: Document
properties: 27
relations: 9
---

# Document_МодернизацияОС

**Category:** Document  
**Properties:** 27  
**Relations:** 9

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
| ВидУчетаНУ_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| ОбъектМодернизации_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СобытиеОС_Key | Edm.Guid | true |
| СтоимостьМодернизацииБУ | Edm.Double | true |
| СчетУчетаОбъектаМодернизацииБУ_Key | Edm.Guid | true |
| СчетУчетаОбъектаМодернизацииНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СубконтоОбъектаМодернизацииНУ1 | Edm.String | true |
| СубконтоОбъектаМодернизацииНУ2 | Edm.String | true |
| СубконтоОбъектаМодернизацииНУ3 | Edm.String | true |
| ОС | Document_МодернизацияОС_ОС_RowType | true |
| ИнвентаризационнаяКомиссия | Document_МодернизацияОС_ИнвентаризационнаяКомиссия_RowType | true |
| СубконтоОбъектаМодернизацииНУ1_Type | Edm.String | true |
| СубконтоОбъектаМодернизацииНУ2_Type | Edm.String | true |
| СубконтоОбъектаМодернизацииНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ОсновныеСредства]] — ОбъектМодернизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СобытияОС]] — СобытиеОС
- [[ChartOfAccounts_Налоговый]] — СчетУчетаОбъектаМодернизацииНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаОбъектаМодернизацииБУ
