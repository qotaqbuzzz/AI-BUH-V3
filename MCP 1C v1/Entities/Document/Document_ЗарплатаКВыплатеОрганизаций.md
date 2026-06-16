---
category: Document
properties: 23
relations: 7
---

# Document_ЗарплатаКВыплатеОрганизаций

**Category:** Document  
**Properties:** 23  
**Relations:** 7

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
| Банк_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодНачисленияДепонированнойЗарплаты | Edm.DateTime | true |
| ПериодНачисленияЗарплаты | Edm.DateTime | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| ПроцентВыплаты | Edm.Double | true |
| РазмерОкругления | Edm.Double | true |
| СпособВыплаты | Edm.String | true |
| СпособРасчетаСуммКВыплате | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Зарплата | Document_ЗарплатаКВыплатеОрганизаций_Зарплата_RowType | true |

## Related Entities

- [[Catalog_Банки]] — Банк
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[ChartOfCalculationTypes_ОсновныеНачисленияОрганизаций]] — ВидРасчета
