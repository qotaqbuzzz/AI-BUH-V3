---
category: Document
properties: 49
relations: 15
---

# Document_ПринятиеКУчетуОС

**Category:** Document  
**Properties:** 49  
**Relations:** 15

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
| ВидОперации | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| КорСубконтоОприходованияБУ1 | Edm.String | true |
| КорСубконтоОприходованияБУ2 | Edm.String | true |
| КорСубконтоОприходованияБУ3 | Edm.String | true |
| КорСубконтоОприходованияНУ1 | Edm.String | true |
| КорСубконтоОприходованияНУ2 | Edm.String | true |
| КорСубконтоОприходованияНУ3 | Edm.String | true |
| КорСчетОприходованияБУ_Key | Edm.Guid | true |
| КорСчетОприходованияНУ_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| ОбъектСтроительства_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СобытиеОС_Key | Edm.Guid | true |
| СпособПоступления | Edm.String | true |
| СтоимостьОбъектаСтроительстваБУ | Edm.Double | true |
| СчетУчетаНоменклатурыБУ_Key | Edm.Guid | true |
| СчетУчетаНоменклатурыНУ_Key | Edm.Guid | true |
| СчетУчетаОбъектаСтроительстваБУ_Key | Edm.Guid | true |
| СчетУчетаОбъектаСтроительстваНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| КраткийСоставМОЛ | Edm.String | true |
| КраткийСоставПодразделений | Edm.String | true |
| ОС | Document_ПринятиеКУчетуОС_ОС_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ПринятиеКУчетуОС_ИнвентаризационнаяКомиссия_RowType | true |
| НомераГТД | Document_ПринятиеКУчетуОС_НомераГТД_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| КорСубконтоОприходованияБУ1_Type | Edm.String | true |
| КорСубконтоОприходованияБУ2_Type | Edm.String | true |
| КорСубконтоОприходованияБУ3_Type | Edm.String | true |
| КорСубконтоОприходованияНУ1_Type | Edm.String | true |
| КорСубконтоОприходованияНУ2_Type | Edm.String | true |
| КорСубконтоОприходованияНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_ОбъектыСтроительства]] — ОбъектСтроительства
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_СобытияОС]] — СобытиеОС
- [[ChartOfAccounts_Налоговый]] — КорСчетОприходованияНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНоменклатурыНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаОбъектаСтроительстваНУ
- [[ChartOfAccounts_Типовой]] — КорСчетОприходованияБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНоменклатурыБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаОбъектаСтроительстваБУ
