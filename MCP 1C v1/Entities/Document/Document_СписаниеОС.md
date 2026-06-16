---
category: Document
properties: 51
relations: 12
---

# Document_СписаниеОС

**Category:** Document  
**Properties:** 51  
**Relations:** 12

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
| ДокументОснование_Key | Edm.Guid | true |
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПричинаСписания_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СобытиеОС_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОС | Document_СписаниеОС_ОС_RowType | true |
| Товары | Document_СписаниеОС_Товары_RowType | true |
| ИнвентаризационнаяКомиссия | Document_СписаниеОС_ИнвентаризационнаяКомиссия_RowType | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ПричиныСписанияОС]] — ПричинаСписания
- [[Catalog_СобытияОС]] — СобытиеОС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[Document_ИнвентаризацияОС]] — ДокументОснование
