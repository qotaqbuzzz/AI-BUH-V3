---
category: Document
properties: 11
relations: 3
---

# Document_ВводСведенийОПлановыхУдержанияхРаботниковОрганизаций_Удержания

**Category:** Document  
**Properties:** 11  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| Действие | Edm.String | true |
| ДатаДействия | Edm.DateTime | true |
| ДатаДействияКонец | Edm.DateTime | true |
| Размер | Edm.Double | true |
| ДокументОснование | Edm.String | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfCalculationTypes_УдержанияОрганизаций]] — ВидРасчета
