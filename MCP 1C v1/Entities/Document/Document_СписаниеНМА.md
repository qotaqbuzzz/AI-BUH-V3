---
category: Document
properties: 33
relations: 9
---

# Document_СписаниеНМА

**Category:** Document  
**Properties:** 33  
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
| НематериальныйАктив_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СнятьСУчетаПоНалогам | Edm.Boolean | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| СуммаНУ | Edm.Double | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| ИнвентаризационнаяКомиссия | Document_СписаниеНМА_ИнвентаризационнаяКомиссия_RowType | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[Document_ИнвентаризацияНМА]] — ДокументОснование
