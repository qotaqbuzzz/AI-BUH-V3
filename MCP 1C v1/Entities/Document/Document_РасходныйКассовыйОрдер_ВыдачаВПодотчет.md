---
category: Document
properties: 5
relations: 1
---

# Document_РасходныйКассовыйОрдер_ВыдачаВПодотчет

**Category:** Document  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидЗадолженностиПодотчетногоЛица | Edm.String | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СуммаПлатежа | Edm.Double | true |

## Related Entities

- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
