---
category: InformationRegister
properties: 16
relations: 3
---

# InformationRegister_ПараметрыРасчетаТранспортногоНалога

**Category:** InformationRegister  
**Properties:** 16  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ОсновноеСредство_Key | Edm.Guid | false |
| Организация_Key | Edm.Guid | false |
| ВидТранспортногоСредства | Edm.String | true |
| Грузоподъемность | Edm.Double | true |
| ДатаВыпуска | Edm.DateTime | true |
| ДатаПриобретения | Edm.DateTime | true |
| КоличествоПосадочныхМест | Edm.Int16 | true |
| МощностьВКиловаттах | Edm.Int64 | true |
| МощностьВЛошадиныхСилах | Edm.Int64 | true |
| НомерТранспортногоСредства | Edm.String | true |
| ОбъемДвигателя | Edm.Int64 | true |
| ПроизводствоСтранСНГ | Edm.Boolean | true |
| ЭксплуатацияВРКдо1апреля1999г | Edm.Boolean | true |
| СтранаПроизводитель_Key | Edm.Guid | true |
| ДатаВвозаНаТерриториюРК | Edm.DateTime | true |
| ЕдиницаИзмеренияНалоговойБазы | Edm.String | true |

## Related Entities

- [[Catalog_КлассификаторСтранМира]] — СтранаПроизводитель
- [[Catalog_Организации]] — Организация
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
