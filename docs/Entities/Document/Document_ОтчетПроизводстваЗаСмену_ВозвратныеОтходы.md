---
category: Document
properties: 12
relations: 6
---

# Document_ОтчетПроизводстваЗаСмену_ВозвратныеОтходы

**Category:** Document  
**Properties:** 12  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| СчетБУ_Key | Edm.Guid | true |
| СтатьяЗатрат_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СчетНУ_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтатьиЗатрат]] — СтатьяЗатрат
- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
