---
category: Document
properties: 30
relations: 8
---

# Document_ЗерноваяРасписка

**Category:** Document  
**Properties:** 30  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| ДержательЗР_Key | Edm.Guid | true |
| ДоговорДЗР_Key | Edm.Guid | true |
| СуммаЗР | Edm.Double | true |
| Поступление_Key | Edm.Guid | true |
| Реализация_Key | Edm.Guid | true |
| Склад_Key | Edm.Guid | true |
| Статус | Edm.String | true |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| ГодУрожая | Edm.Int16 | true |
| Влажность | Edm.Double | true |
| ПримесьСорная | Edm.Double | true |
| Натура | Edm.Double | true |
| Белок | Edm.Double | true |
| Клейковина | Edm.Double | true |
| Цена | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| ДатаИсполненияПриказа | Edm.DateTime | true |
| НаличиеОригинала | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| ДокументОснование_Key | Edm.Guid | true |
| ОтветственныйСотрудник_Key | Edm.Guid | true |
| Товары | Document_ЗерноваяРасписка_Товары_RowType | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорДЗР
- [[Catalog_Контрагенты]] — ДержательЗР
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_Склады]] — Склад
- [[Catalog_СотрудникиОрганизаций]] — ОтветственныйСотрудник
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Document_ПоступлениеТоваровУслуг]] — Поступление
- [[Document_РеализацияТоваровУслуг]] — Реализация
