---
category: Document
properties: 16
relations: 8
---

# Document_ПоступлениеДопРасходов_ОС

**Category:** Document  
**Properties:** 16  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДокументПартии_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| ОсновноеСредство_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СуммаТовара | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СуммаРаспределения | Edm.Double | true |
| СуммаРаспределенияНДС | Edm.Double | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| МОЛОрганизации_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ФизическиеЛица]] — МОЛОрганизации
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[Document_ПоступлениеТоваровУслуг]] — ДокументПартии
