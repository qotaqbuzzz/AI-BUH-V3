---
category: Document
properties: 22
relations: 3
---

# Document_СопоставлениеСНТиФНО

**Category:** Document  
**Properties:** 22  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| ИдентификационныйНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| ЭЦП | Edm.String | true |
| ТипПодписи | Edm.String | true |
| Статус | Edm.String | true |
| Идентификатор | Edm.String | true |
| УполномоченныйСотрудник | Edm.String | true |
| РегистрационныйНомер | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ФНО | Document_СопоставлениеСНТиФНО_ФНО_RowType | true |
| СНТ | Document_СопоставлениеСНТиФНО_СНТ_RowType | true |
| ТоварыФНО | Document_СопоставлениеСНТиФНО_ТоварыФНО_RowType | true |
| ТоварыСНТ | Document_СопоставлениеСНТиФНО_ТоварыСНТ_RowType | true |
| Ошибки | Document_СопоставлениеСНТиФНО_Ошибки_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
