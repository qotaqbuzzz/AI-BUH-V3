---
category: ChartOfCalculationTypes
properties: 28
relations: 11
---

# ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций

**Category:** ChartOfCalculationTypes  
**Properties:** 28  
**Relations:** 11

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DataVersion | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| СпособРасчета | Edm.String | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| ВидПремии | Edm.String | true |
| ОблагаетсяИПН_Key | Edm.Guid | true |
| ОблагаетсяОПВ_Key | Edm.Guid | true |
| ОблагаетсяСН_Key | Edm.Guid | true |
| ОблагаетсяСО_Key | Edm.Guid | true |
| ЗачетОтработанногоВремени | Edm.Boolean | true |
| ФондВыплат_Key | Edm.Guid | true |
| ОбъединятьВРасчетномЛистке | Edm.Boolean | true |
| ЯвляетсяКомпенсациейЗаНеиспользованныйОтпуск | Edm.Boolean | true |
| УчетЗаработкаПриРасчетеСреднего | Edm.String | true |
| ОблагаетсяОППВ_Key | Edm.Guid | true |
| ОблагаетсяООСМС_Key | Edm.Guid | true |
| ОблагаетсяВОСМС_Key | Edm.Guid | true |
| ОблагаетсяОПВР_Key | Edm.Guid | true |
| ОблагаетсяЕП_Key | Edm.Guid | true |
| LeadingCalculationTypes | ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций_LeadingCalculationTypes | true |
| BaseCalculationTypes | ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций_BaseCalculationTypes | true |
| ВключаемыеВРасчетОтОбратногоВидыНачислений | ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций_ВключаемыеВРасчетОтОбратногоВидыНачислений_RowType | true |
| КомпенсируемыеРасчетомОтОбратногоВидыУдержаний | ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций_КомпенсируемыеРасчетомОтОбратногоВидыУдержаний_RowType | true |

## Related Entities

- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяВОСМС
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяЕП
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяИПН
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяООСМС
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяОПВ
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяОПВР
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяОППВ
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяСН
- [[Catalog_СпособыНалогообложенияДоходов]] — ОблагаетсяСО
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
- [[Catalog_ФондыВыплатОрганизаций]] — ФондВыплат
