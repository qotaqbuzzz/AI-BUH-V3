---
category: Document
properties: 38
relations: 8
---

# Document_СписаниеТоваров

**Category:** Document  
**Properties:** 38  
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
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| КорректироватьНДС | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Основание | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СубконтоЗатратНДСБУ1 | Edm.String | true |
| СубконтоЗатратНДСБУ2 | Edm.String | true |
| СубконтоЗатратНДСБУ3 | Edm.String | true |
| СубконтоЗатратНДСНУ1 | Edm.String | true |
| СубконтоЗатратНДСНУ2 | Edm.String | true |
| СубконтоЗатратНДСНУ3 | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СчетЗатратНДСБУ_Key | Edm.Guid | true |
| СчетЗатратНДСНУ_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Товары | Document_СписаниеТоваров_Товары_RowType | true |
| ИнвентаризационнаяКомиссия | Document_СписаниеТоваров_ИнвентаризационнаяКомиссия_RowType | true |
| НомераГТД | Document_СписаниеТоваров_НомераГТД_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| СубконтоЗатратНДСБУ1_Type | Edm.String | true |
| СубконтоЗатратНДСБУ2_Type | Edm.String | true |
| СубконтоЗатратНДСБУ3_Type | Edm.String | true |
| СубконтоЗатратНДСНУ1_Type | Edm.String | true |
| СубконтоЗатратНДСНУ2_Type | Edm.String | true |
| СубконтоЗатратНДСНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНДСНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратНДСБУ
