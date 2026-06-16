---
category: Document
properties: 8
relations: 5
---

# Document_ПоступлениеИзПереработки_ИспользованныеМатериалы

**Category:** Document  
**Properties:** 8  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СтатьяЗатрат_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| ДоговорЗакупа_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтатьиЗатрат]] — СтатьяЗатрат
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
