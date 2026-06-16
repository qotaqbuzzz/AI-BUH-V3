---
category: Document
properties: 23
relations: 10
---

# Document_ГТДИмпорт_ОС

**Category:** Document  
**Properties:** 23  
**Relations:** 10

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НомерРаздела | Edm.Int16 | true |
| ОсновноеСредство_Key | Edm.Guid | true |
| ФактурнаяСтоимость | Edm.Double | true |
| СуммаПошлины | Edm.Double | true |
| СуммаСбора | Edm.Double | true |
| СуммаСбораВал | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СтранаПроисхождения_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НДССрокПлатежа | Edm.DateTime | true |
| ВидНДС | Edm.String | true |
| ДокументПартии_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| МОЛОрганизации_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| ТаможеннаяСтоимость | Edm.Double | true |
| СуммаПошлиныСпец | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхождения
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ФизическиеЛица]] — МОЛОрганизации
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[Document_ПоступлениеТоваровУслуг]] — ДокументПартии
