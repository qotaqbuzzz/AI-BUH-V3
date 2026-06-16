---
category: Document
properties: 15
relations: 8
---

# Document_ПоступлениеТоваровУслуг_ОС

**Category:** Document  
**Properties:** 15  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| МОЛОрганизации_Key | Edm.Guid | true |
| СуммаНУ | Edm.Double | true |
| СуммаПР | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Catalog_ФизическиеЛица]] — МОЛОрганизации
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
