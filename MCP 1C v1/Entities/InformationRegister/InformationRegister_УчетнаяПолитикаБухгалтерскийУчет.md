---
category: InformationRegister
properties: 9
relations: 2
---

# InformationRegister_УчетнаяПолитикаБухгалтерскийУчет

**Category:** InformationRegister  
**Properties:** 9  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| СпособРасчетаСебестоимостиПроизводства | Edm.String | true |
| УчетВременныхРазницПоНалогуНаПрибыль | Edm.Boolean | true |
| ПодразделениеДляРеглОпераций_Key | Edm.Guid | true |
| ОпределятьСтоимостьПриобретенияПоКурсуАванса | Edm.Boolean | true |
| ПрименятьПараметрыНачисленияАмортизацииВМесяцеИзменения | Edm.Boolean | true |
| ВедениеУчетаВременныхРазницБалансовымМетодом | Edm.Boolean | true |
| ОпределятьДоходОтРеализацииПоКурсуАванса | Edm.Boolean | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеДляРеглОпераций
