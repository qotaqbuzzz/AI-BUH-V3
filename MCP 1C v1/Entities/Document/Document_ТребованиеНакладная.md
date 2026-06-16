---
category: Document
properties: 37
relations: 10
---

# Document_ТребованиеНакладная

**Category:** Document  
**Properties:** 37  
**Relations:** 10

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
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Материалы | Document_ТребованиеНакладная_Материалы_RowType | true |
| МатериалыЗаказчика | Document_ТребованиеНакладная_МатериалыЗаказчика_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ТребованиеНакладная_ИнвентаризационнаяКомиссия_RowType | true |
| НомераГТД | Document_ТребованиеНакладная_НомераГТД_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
