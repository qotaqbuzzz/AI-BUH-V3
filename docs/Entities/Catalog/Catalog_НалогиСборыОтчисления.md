---
category: Catalog
properties: 16
relations: 5
---

# Catalog_НалогиСборыОтчисления

**Category:** Catalog  
**Properties:** 16  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| КодБК | Edm.String | true |
| КодНазначенияПлатежа | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетКонтрагента_Key | Edm.Guid | true |
| НазначениеПлатежа | Edm.String | true |
| СтатьяЗатрат_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомНУ_Key | Edm.Guid | true |
| УдалитьОтноситьНаВычетыВПределахУплаченнойСуммы | Edm.Boolean | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_СтатьиЗатрат]] — СтатьяЗатрат
- [[ChartOfAccounts_Налоговый]] — СчетУчетаРасчетовСКонтрагентомНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомБУ
