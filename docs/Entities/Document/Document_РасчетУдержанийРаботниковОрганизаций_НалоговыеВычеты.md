---
category: Document
properties: 7
relations: 3
---

# Document_РасчетУдержанийРаботниковОрганизаций_НалоговыеВычеты

**Category:** Document  
**Properties:** 7  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ВычетИПН_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| СуммаВычета | Edm.Double | true |

## Related Entities

- [[Catalog_ВычетыИПН]] — ВычетИПН
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[Document_ИПНЗаявлениеНаПредоставлениеВычета]] — ДокументОснование
