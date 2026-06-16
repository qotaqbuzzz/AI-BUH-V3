---
category: Document
properties: 22
relations: 9
---

# Document_Доверенность

**Category:** Document  
**Properties:** 22  
**Relations:** 9

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
| ДатаДействия | Edm.DateTime | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| НаПолучениеОт | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПоДокументу | Edm.String | true |
| Сделка | Edm.String | true |
| СтруктурнаяЕдиница_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| Товары | Document_Доверенность_Товары_RowType | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СтруктурнаяЕдиница
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[Document_СчетНаОплатуПоставщика]] — ДокументОснование
