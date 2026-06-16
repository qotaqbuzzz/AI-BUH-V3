---
category: Document
properties: 12
relations: 4
---

# Document_ЗакрытиеДтКтЗадолженности_Задолженность

**Category:** Document  
**Properties:** 12  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Контрагент_Key | Edm.Guid | true |
| ДоговорКонтрагентаДт_Key | Edm.Guid | true |
| ДоговорКонтрагентаКт_Key | Edm.Guid | true |
| СделкаПоСчетуДебета | Edm.String | true |
| СделкаПоСчетуКредита | Edm.String | true |
| Сумма | Edm.Double | true |
| ВалютаВзаиморасчетов_Key | Edm.Guid | true |
| СуммаВзаиморасчетов | Edm.Double | true |
| СделкаПоСчетуДебета_Type | Edm.String | true |
| СделкаПоСчетуКредита_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаВзаиморасчетов
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагентаДт
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагентаКт
- [[Catalog_Контрагенты]] — Контрагент
