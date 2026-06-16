---
category: DocumentJournal
properties: 21
relations: 6
---

# DocumentJournal_КассовыеДокументы

**Category:** DocumentJournal  
**Properties:** 21  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref | Edm.String | false |
| Type | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Number | Edm.String | true |
| Posted | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| Валюта_Key | Edm.Guid | true |
| Контрагент | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| Касса_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Ref_Type | Edm.String | false |
| Контрагент_Type | Edm.String | true |
| ВидОперации_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Кассы]] — Касса
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Ответственный
