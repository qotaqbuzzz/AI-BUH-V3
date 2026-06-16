---
category: Document
properties: 10
relations: 5
---

# Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_ОС

**Category:** Document  
**Properties:** 10  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| ГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_НомераГТД]] — ГТД
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
