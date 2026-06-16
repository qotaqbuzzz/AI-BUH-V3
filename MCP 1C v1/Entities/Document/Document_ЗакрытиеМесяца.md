---
category: Document
properties: 48
relations: 4
---

# Document_ЗакрытиеМесяца

**Category:** Document  
**Properties:** 48  
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
| АмортизацияНМАБУ | Edm.Boolean | true |
| АмортизацияОСБУ | Edm.Boolean | true |
| АмортизацияФАНУ | Edm.Boolean | true |
| ВключениеВСтоимостныйБалансАктивовУчитываемыхОтдельно | Edm.Boolean | true |
| ЗакрытиеПодотчетныхСуммБУ | Edm.Boolean | true |
| ЗакрытиеПодотчетныхСуммНУ | Edm.Boolean | true |
| ЗакрытиеСчетовНУ | Edm.Boolean | true |
| ЗачетАвансовыхПлатежейПоНалогамИСборамБУ | Edm.Boolean | true |
| ЗачетАвансовыхПлатежейПоНалогамИСборамНУ | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПереносНЗПБУ | Edm.Boolean | true |
| ПереносНЗПНУ | Edm.Boolean | true |
| ПереоценкаВалютныхСредствБУ | Edm.Boolean | true |
| РасчетВременныхРазниц | Edm.Boolean | true |
| РасчетВычетаПоРеализованнымТоварам | Edm.Boolean | true |
| РасчетВычетовПоНалогам | Edm.Boolean | true |
| РасчетВычетовПоПреференциям | Edm.Boolean | true |
| РасчетВычетовПоРасходамНаРемонт | Edm.Boolean | true |
| РасчетДоходаОтПревышенияСтоимостиВыбывшихФА | Edm.Boolean | true |
| РасчетИтоговогоДоходаУбыткаБУ | Edm.Boolean | true |
| РасчетНалогаНаПрибыль | Edm.Boolean | true |
| РасчетНДСКЗачету | Edm.Boolean | true |
| КорректировкаСтоимостиСписанияТоваровБУ | Edm.Boolean | true |
| КорректировкаСтоимостиСписанияТоваровНУ | Edm.Boolean | true |
| РасчетСтоимостиПродукцииБУ | Edm.Boolean | true |
| РасчетСтоимостиПродукцииНУ | Edm.Boolean | true |
| РеформацияБалансаБУ | Edm.Boolean | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Состояние | Edm.String | true |
| СписаниеПриВыбытииВсехФАГруппы | Edm.Boolean | true |
| СписаниеРБПБУ | Edm.Boolean | true |
| СписаниеРезерваПоПереоценкеОСБУ | Edm.Boolean | true |
| СписаниеСтоимостногоБалансаГруппыМенееМинимума | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| РасчетИтоговогоДоходаУбыткаНУ | Edm.Boolean | true |
| РеформацияБалансаНУ | Edm.Boolean | true |
| ЗачетАвансовИПереплатПоНДС | Edm.Boolean | true |
| Ошибки | Document_ЗакрытиеМесяца_Ошибки_RowType | true |
| КурсыВалют | Document_ЗакрытиеМесяца_КурсыВалют_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
