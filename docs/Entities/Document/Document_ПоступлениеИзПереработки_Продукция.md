---
category: Document
properties: 11
relations: 6
---

# Document_ПоступлениеИзПереработки_Продукция

**Category:** Document  
**Properties:** 11  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Количество | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| СуммаПлановая | Edm.Double | true |
| ПлановаяСтоимость | Edm.Double | true |
| СчетБУ_Key | Edm.Guid | true |
| Спецификация_Key | Edm.Guid | true |
| СчетНУ_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| ДоговорЗакупа_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СпецификацииНоменклатуры]] — Спецификация
- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
