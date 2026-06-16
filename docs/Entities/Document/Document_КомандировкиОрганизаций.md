---
category: Document
properties: 16
relations: 4
---

# Document_КомандировкиОрганизаций

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
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| ОрганизацияНазначения | Edm.String | true |
| ОснованиеКомандировки | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| СтранаНазначения | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| РаботникиОрганизации | Document_КомандировкиОрганизаций_РаботникиОрганизации_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
