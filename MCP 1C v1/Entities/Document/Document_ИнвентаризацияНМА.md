---
category: Document
properties: 19
relations: 4
---

# Document_ИнвентаризацияНМА

**Category:** Document  
**Properties:** 19  
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
| ДатаНачалаИнвентаризации | Edm.DateTime | true |
| ДатаОкончанияИнвентаризации | Edm.DateTime | true |
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПричинаПроведенияИнвентаризации | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| НМА | Document_ИнвентаризацияНМА_НМА_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ИнвентаризацияНМА_ИнвентаризационнаяКомиссия_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
