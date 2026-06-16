---
category: Document
properties: 26
relations: 4
---

# Document_ВводНачальныхОстатков

**Category:** Document  
**Properties:** 26  
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
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РазделУчета | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ОтражатьВБухгалтерскомУчете | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ПоказыватьДанныеБУ | Edm.Boolean | true |
| СписокСчетовБУПрочихРазделов_Base64Data | Edm.Binary | true |
| ОтражатьПоСпециальнымРегистрам | Edm.Boolean | true |
| РасчетыСКонтрагентами | Document_ВводНачальныхОстатков_РасчетыСКонтрагентами_RowType | true |
| РасчетыПоНалогамИСборам | Document_ВводНачальныхОстатков_РасчетыПоНалогамИСборам_RowType | true |
| БухСправка | Document_ВводНачальныхОстатков_БухСправка_RowType | true |
| РасчетыСПодотчетнымиЛицами | Document_ВводНачальныхОстатков_РасчетыСПодотчетнымиЛицами_RowType | true |
| Запасы | Document_ВводНачальныхОстатков_Запасы_RowType | true |
| ТоварыОрганизаций | Document_ВводНачальныхОстатков_ТоварыОрганизаций_RowType | true |
| СписокСчетовБУПрочихРазделов_Type | Edm.String | true |
| СписокСчетовБУПрочихРазделов | Edm.Stream | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
