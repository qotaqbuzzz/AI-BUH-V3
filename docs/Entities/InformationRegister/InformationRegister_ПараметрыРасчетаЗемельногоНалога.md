---
category: InformationRegister
properties: 16
relations: 4
---

# InformationRegister_ПараметрыРасчетаЗемельногоНалога

**Category:** InformationRegister  
**Properties:** 16  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ОсновноеСредство_Key | Edm.Guid | false |
| Организация_Key | Edm.Guid | false |
| БазоваяСтавкаНалога | Edm.Double | true |
| БаллБонитета | Edm.Int16 | true |
| ДатаВозникновенияПрава | Edm.DateTime | true |
| ДатаПрекращенияПрава | Edm.DateTime | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| КадастровыйНомер | Edm.String | true |
| КатегорияЗемель_Key | Edm.Guid | true |
| КорректировкаБазовойСтавкиНалога | Edm.Double | true |
| КорректировкаБазовойСтавкиНалогаНаТерриторияхСЭЗ | Edm.Double | true |
| КорректировкаБазовойСтавкиНалогаПоРешениюМестныхОрганов | Edm.Double | true |
| МестонахождениеУчастка | Edm.String | true |
| ПлощадьНеОблагаемая | Edm.Double | true |
| ПлощадьОблагаемая | Edm.Double | true |
| ПроцентИзмененияБазовойСтавкиНалога | Edm.Double | true |

## Related Entities

- [[Catalog_КатегорииЗемель]] — КатегорияЗемель
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Организации]] — Организация
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
