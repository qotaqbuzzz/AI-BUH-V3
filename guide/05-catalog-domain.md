# Catalog & Document Domain

## Catalog tools (readOnlyHint: true)

### Contractors (Контрагенты)
```typescript
// Search by name, РНН (9 digits), or IIN
onec_search_contractors({ tenantId, query: string, limit?: 1-100 })
→ [{ Ref_Key, Description, ИдентификационныйНомер, РНН, ... }]

// Full details + main contract + bank account
onec_get_contractor({ tenantId, guid: UUID })

// All contracts for a contractor
onec_get_contractor_contracts({ tenantId, contractorGuid: UUID })
```

### Organizations & Warehouses
```typescript
// All orgs with BIN + РНН — use Ref_Key as organizationGuid elsewhere
onec_get_organizations({ tenantId })
→ [{ Ref_Key, Description, ИНН, КПП, ... }]

// All warehouses
onec_get_warehouses({ tenantId })
```

### Nomenclature
```typescript
// Search by name or article (Артикул)
onec_search_nomenclature({ tenantId, query, isService?: boolean, limit?: 1-100 })
// isService: true=services, false=goods, omit=both
```

## Document tools

### Search & Read
```typescript
// Search any document type with filters
onec_search_documents({
  tenantId, documentType: DocumentType,
  dateFrom?, dateTo?, contractorGuid?, organizationGuid?,
  posted?: boolean, limit?: 1-500
})

// Full document with all tabular sections
onec_get_document({ tenantId, documentType: DocumentType, guid: UUID })
```

### Write (destructiveHint: true)
```typescript
// Create catalog element or document header (does NOT post)
onec_create_document({ tenantId, entitySet: string, data: Record<string,unknown> })

// Post or unpost a document
onec_post_document({ tenantId, documentType: string, guid: UUID,
                     action: "post" | "unpost" })
```

## Supported DocumentType values
```
ПлатежноеПоручениеИсходящее   ПлатежноеПоручениеВходящее
РеализацияТоваровУслуг        ПоступлениеТоваровУслуг
ПлатежныйОрдерСписание        ПлатежныйОрдерПоступление
ПриходныйКассовыйОрдер        РасходныйКассовыйОрдер
НачислениеЗарплатыРаботникамОрганизаций
ОперацияБух  КорректировкаДолга  ЗакрытиеМесяца
ВводНачальныхОстатков  АвансовыйОтчет
СписаниеТоваров  ОприходованиеТоваров  ПеремещениеТоваров
```

## Auditor tools (document-level)
```typescript
// All Дт/Кт postings for a document
onec_get_document_journal_entries({ tenantId, documentGuid })

// Both balance + turnovers for one account code
onec_verify_account_balance({ tenantId, accountCode, organizationGuid?, dateFrom, dateTo })

// ЭСФ status from InformationRegister_АктуальныеЭСФ
onec_get_esf_status({ tenantId, organizationGuid, dateFrom, dateTo })

// Unposted docs for a type
onec_get_unposted_documents({ tenantId, documentType, dateFrom, dateTo, organizationGuid? })

// ЗакрытиеМесяца posted status
onec_get_month_close_status({ tenantId, organizationGuid, year, month })

// Full 5-block quality audit for a month
onec_audit_period_quality({ tenantId, organizationGuid, year, month })
→ { blocks[{name, status:"✅"|"⚠️"|"❌", findings[]}] }
```

## Tenant tools
```typescript
onec_list_tenants()  // → [{ id, label, isDefault }]
```

## Account analysis
```typescript
// Universal — works for ANY account code
// Returns: summary + byCorrAccount + bySubconto + monthlyTrend
onec_analyze_account({ tenantId, accountCode, dateFrom, dateTo, organizationGuid? })
```
