---
category: InformationRegister
properties: 10
relations: 9
---

# InformationRegister_СчетаУчетаРасчетовСКонтрагентами

**Category:** InformationRegister  
**Properties:** 10  
**Relations:** 9

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| Контрагент_Key | Edm.Guid | false |
| Договор_Key | Edm.Guid | false |
| ВидРасчетовПоДоговору | Edm.String | false |
| СчетУчетаРасчетовСПоставщиком_Key | Edm.Guid | true |
| СчетУчетаАвансовВыданных_Key | Edm.Guid | true |
| СчетУчетаРасчетовСПокупателем_Key | Edm.Guid | true |
| СчетУчетаАвансовПолученных_Key | Edm.Guid | true |
| СчетУчетаРасчетовСПоставщикомПоВозвратам_Key | Edm.Guid | true |
| СчетРасчетовСПокупателемПоВозвратам_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — Договор
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[ChartOfAccounts_Типовой]] — СчетРасчетовСПокупателемПоВозвратам
- [[ChartOfAccounts_Типовой]] — СчетУчетаАвансовВыданных
- [[ChartOfAccounts_Типовой]] — СчетУчетаАвансовПолученных
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСПокупателем
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСПоставщиком
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСПоставщикомПоВозвратам
