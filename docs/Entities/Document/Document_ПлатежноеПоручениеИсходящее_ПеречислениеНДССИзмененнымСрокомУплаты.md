---
category: Document
properties: 12
relations: 7
---

# Document_ПлатежноеПоручениеИсходящее_ПеречислениеНДССИзмененнымСрокомУплаты

**Category:** Document  
**Properties:** 12  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Договор_Key | Edm.Guid | true |
| Контрагент_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| ГТД_Key | Edm.Guid | true |
| СрокПлатежа | Edm.DateTime | true |
| СуммаПлатежа | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ДоговорыКонтрагентов]] — Договор
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_НомераГТД]] — ГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
