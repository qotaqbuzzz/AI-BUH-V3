---
category: DocumentJournal
properties: 22
relations: 7
---

# DocumentJournal_РасчетныеДокументыБанк

**Category:** DocumentJournal  
**Properties:** 22  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref | Edm.String | false |
| Type | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Number | Edm.String | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| Валюта_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| Оплачено | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетОрганизации_Key | Edm.Guid | true |
| СуммаКомиссии | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Ref_Type | Edm.String | false |
| ВидОперации_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетОрганизации
- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
