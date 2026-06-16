---
category: Document
properties: 9
relations: 5
---

# Document_ДвижениеНЗП_Состав

**Category:** Document  
**Properties:** 9  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетЗатратБУ_Key | Edm.Guid | true |
| НоменклатурнаяГруппа_Key | Edm.Guid | true |
| СтатьяЗатрат_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СуммаНУ | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_НоменклатурныеГруппы]] — НоменклатурнаяГруппа
- [[Catalog_СтатьиЗатрат]] — СтатьяЗатрат
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
