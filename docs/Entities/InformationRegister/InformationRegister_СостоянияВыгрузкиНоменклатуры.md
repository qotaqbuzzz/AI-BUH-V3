---
category: InformationRegister
properties: 11
relations: 3
---

# InformationRegister_СостоянияВыгрузкиНоменклатуры

**Category:** InformationRegister  
**Properties:** 11  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| Номенклатура_Key | Edm.Guid | false |
| ХарактеристикаНоменклатуры_Key | Edm.Guid | false |
| ИдентификаторПакетаДанных | Edm.String | true |
| Состояние | Edm.String | true |
| ДатаСостояния | Edm.DateTime | true |
| ОписаниеОшибки | Edm.String | true |
| Хеш | Edm.String | true |
| РасшифровкаПроблемы | Edm.String | true |
| ВыгружатьНоменклатуру | Edm.Boolean | true |
| ВыгружатьВНациональныйКаталог | Edm.Boolean | true |

## Related Entities

- [[Catalog_ИдентификаторыОбъектовМетаданных]] — ХарактеристикаНоменклатуры
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_Организации]] — Организация
