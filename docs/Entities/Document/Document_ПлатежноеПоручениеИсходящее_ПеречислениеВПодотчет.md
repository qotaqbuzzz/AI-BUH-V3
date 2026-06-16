---
category: Document
properties: 8
relations: 4
---

# Document_ПлатежноеПоручениеИсходящее_ПеречислениеВПодотчет

**Category:** Document  
**Properties:** 8  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ВидЗадолженностиПодотчетногоЛица | Edm.String | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СуммаПлатежа | Edm.Double | true |
| СчетУчета_Key | Edm.Guid | true |
| НомерКартСчета_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_КартСчета]] — НомерКартСчета
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfAccounts_Типовой]] — СчетУчета
