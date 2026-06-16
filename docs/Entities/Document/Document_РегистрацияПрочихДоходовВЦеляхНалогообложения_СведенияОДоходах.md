---
category: Document
properties: 29
relations: 12
---

# Document_РегистрацияПрочихДоходовВЦеляхНалогообложения_СведенияОДоходах

**Category:** Document  
**Properties:** 29  
**Relations:** 12

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| СпособНалогообложенияИПН_Key | Edm.Guid | true |
| СпособНалогообложенияОПВ_Key | Edm.Guid | true |
| СпособНалогообложенияСН_Key | Edm.Guid | true |
| СпособНалогообложенияСО_Key | Edm.Guid | true |
| СпособНалогообложенияОППВ_Key | Edm.Guid | true |
| ДатаДохода | Edm.DateTime | true |
| УчитыватьИПН | Edm.Boolean | true |
| УчитыватьОПВ | Edm.Boolean | true |
| УчитыватьСН | Edm.Boolean | true |
| УчитыватьСО | Edm.Boolean | true |
| УчитыватьОППВ | Edm.Boolean | true |
| ВидРасчета_Key | Edm.Guid | true |
| СуммаДохода | Edm.Double | true |
| СуммаВычета | Edm.Double | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| СпособНалогообложенияВОСМС_Key | Edm.Guid | true |
| СпособНалогообложенияООСМС_Key | Edm.Guid | true |
| УчитыватьВОСМС | Edm.Boolean | true |
| УчитыватьООСМС | Edm.Boolean | true |
| УчитыватьОПВР | Edm.Boolean | true |
| СпособНалогообложенияОПВР_Key | Edm.Guid | true |
| УчитыватьЕП | Edm.Boolean | true |
| СпособНалогообложенияЕП_Key | Edm.Guid | true |
| ФизЛицо_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияВОСМС
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияЕП
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияИПН
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияООСМС
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияОПВ
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияОПВР
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияОППВ
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияСН
- [[Catalog_СпособыНалогообложенияДоходов]] — СпособНалогообложенияСО
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
- [[ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций]] — ВидРасчета
