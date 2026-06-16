---
category: Document
properties: 15
relations: 4
---

# Document_ПриемНаРаботуВОрганизацию

**Category:** Document  
**Properties:** 15  
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
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| РаботникиОрганизации | Document_ПриемНаРаботуВОрганизацию_РаботникиОрганизации_RowType | true |
| ОсновныеНачисления | Document_ПриемНаРаботуВОрганизацию_ОсновныеНачисления_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
