---
category: Document
properties: 21
relations: 5
---

# Document_ИнвентаризацияТоваровНаСкладе

**Category:** Document  
**Properties:** 21  
**Relations:** 5

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
| ВидОперации | Edm.String | true |
| ДатаНачалаИнвентаризации | Edm.DateTime | true |
| ДатаОкончанияИнвентаризации | Edm.DateTime | true |
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПричинаПроведенияИнвентаризации | Edm.String | true |
| Склад_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Товары | Document_ИнвентаризацияТоваровНаСкладе_Товары_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ИнвентаризацияТоваровНаСкладе_ИнвентаризационнаяКомиссия_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
