---
category: Document
properties: 13
relations: 5
---

# Document_ПоступлениеИзПереработки_Услуги

**Category:** Document  
**Properties:** 13  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| СтатьяЗатрат_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| Содержание | Edm.String | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Catalog_СтатьиЗатрат]] — СтатьяЗатрат
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
