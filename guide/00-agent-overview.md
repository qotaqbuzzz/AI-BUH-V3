# onec-kz MCP — Agent Overview

## Server identity
```
name: onec-kz  version: 2.0.0  transport: stdio
```

## Tenant model
```
tenantId  → required on every per-tenant tool
omit      → defaults to "moskovskiy"
```
| tenantId | Company | OData |
|---|---|---|
| `moskovskiy` | ТОО «Московский» | ✅ active |
| `pushkinskoye` | Pushkinskoye | ❌ OData disabled |

**Discover:** `onec_list_tenants` → lists all tenants + default

## Service layers
```
TenantPool           — OneCClient per tenant (HTTP OData)
TenantServicePool    — 20 services, lazy init, cached per tenant
GlobalServices       — DocflowService, AlertService, AccountsService,
                       EntitySchemaService (shared, no tenantId)
```

## Tool domains  (65+ tools total)
| prefix | domain | count |
|---|---|---|
| `onec_anomaly_*` | Anomaly detection | 10 |
| `onec_validate_*` + `onec_drill_*` | Validation + drill-down | 19 |
| `onec_get_*` / `onec_detect_*` | Reports & analytics | 15 |
| `onec_search_*` / `onec_get_contractor*` | Catalog | 6 |
| `onec_*document*` + `onec_post_*` | Documents | 4 |
| `kz_chart_*` | KZ standard chart of accounts | 5 |
| `onec_resolve_guid` | Universal GUID resolver | 1 |
| `onec_audit_*` / `onec_verify_*` / `onec_get_esf_*` | Auditor | 6 |
| `onec_analyze_account` | Account analysis | 1 |
| misc (scan, costing, production, stock…) | Other | ~8 |

## Resources (read-only, no params)
```
onec://organizations         — all orgs in default company
onec://chart-of-accounts     — 1C ChartOfAccounts_Типовой
onec://currencies            — currencies + exchange rates
onec://tenants               — configured tenant list
onec://kz-workflow           — KZ tax rates + account mapping
onec://entities              — index of all 889 OData entities
accounts://kz-chart          — KZ regulatory chart of accounts
```
