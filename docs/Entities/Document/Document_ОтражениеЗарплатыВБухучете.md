---
category: Document
properties: 25
relations: 5
---

# Document_ОтражениеЗарплатыВБухучете

**Category:** Document  
**Properties:** 25  
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
| ПериодРегистрации | Edm.DateTime | true |
| Организация_Key | Edm.Guid | true |
| ЗарплатаОтраженаВБухучете | Edm.Boolean | true |
| Бухгалтер_Key | Edm.Guid | true |
| Автор_Key | Edm.Guid | true |
| КраткийСоставДокумента | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ВидОперации | Edm.String | true |
| Резерв_Key | Edm.Guid | true |
| ВидОперацииРезервовПоОплатеТруда | Edm.String | true |
| НачисленнаяЗарплатаИВзносы | Document_ОтражениеЗарплатыВБухучете_НачисленнаяЗарплатаИВзносы_RowType | true |
| УдержаннаяЗарплата | Document_ОтражениеЗарплатыВБухучете_УдержаннаяЗарплата_RowType | true |
| ФизическиеЛица | Document_ОтражениеЗарплатыВБухучете_ФизическиеЛица_RowType | true |
| РегламентированныеУдержания | Document_ОтражениеЗарплатыВБухучете_РегламентированныеУдержания_RowType | true |
| ПеняПоВзносамИОтчислениям | Document_ОтражениеЗарплатыВБухучете_ПеняПоВзносамИОтчислениям_RowType | true |
| ОценочныеОбязательства | Document_ОтражениеЗарплатыВБухучете_ОценочныеОбязательства_RowType | true |
| ОборотПоПриобретеннымУслугамГПХВЦеляхНДС | Document_ОтражениеЗарплатыВБухучете_ОборотПоПриобретеннымУслугамГПХВЦеляхНДС_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Бухгалтер
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Резервы]] — Резерв
