---
category: Document
properties: 16
relations: 4
---

# Document_ПринятиеКУчетуНМА

**Category:** Document  
**Properties:** 16  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СпособПоступления | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| НМА | Document_ПринятиеКУчетуНМА_НМА_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
