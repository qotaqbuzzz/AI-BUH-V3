import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppConfig } from "./config.js";
import { OneCClient } from "@aibos/onec-client";
import { DocflowClient } from "@aibos/onec-client";
import { CatalogService } from "@aibos/services";
import { DocumentService } from "@aibos/services";
import { RegisterService } from "@aibos/services";
import { ProductionService } from "@aibos/services";
import { AuditorService } from "@aibos/services";
import { MetadataService } from "@aibos/services";
import { AnalyticsService } from "@aibos/services";
import { ReportsService } from "@aibos/services";
import { DocflowService } from "@aibos/services";
import { DocumentGeneratorService } from "@aibos/services";
import { registerCatalogTools } from "./tools/catalog.tools.js";
import { registerDocumentTools } from "./tools/document.tools.js";
import { registerRegisterTools } from "./tools/register.tools.js";
import { registerProductionTools } from "./tools/production.tools.js";
import { registerAuditorTools } from "./tools/auditor.tools.js";
import { registerAnalyticsTools } from "./tools/analytics.tools.js";
import { registerMetadataTools } from "./tools/metadata.tools.js";
import { registerReportsTools } from "./tools/reports.tools.js";
import { registerDocflowTools } from "./tools/docflow.tools.js";
import { registerGeneratorTools } from "./tools/generator.tools.js";
import { AnomalyMLService } from "@aibos/services";
import { AlertService } from "@aibos/services";
import { registerAnomalyMLTools } from "./tools/anomaly-ml.tools.js";
import { InvestigationService } from "@aibos/services";
import { registerInvestigationTools } from "./tools/investigation.tools.js";
import { registerDueDiligenceTools } from "./tools/duediligence.tools.js";
import { registerStockTools } from "./tools/stock.tools.js";
import { AccountsService } from "@aibos/kz-accounts";
import { registerAccountsTools } from "./tools/accounts.tools.js";
import { AccountAnalysisService } from "@aibos/services";
import { registerAccountAnalysisTools } from "./tools/account-analysis.tools.js";
import { IntegrityValidator, TaxValidator, PeriodCloseValidator, DocumentValidator, ReconciliationValidator, DrillDownService, CostingService, DocumentScannerService } from "@aibos/services";
import { registerIntegrityValidationTools } from "./tools/validation-integrity.tools.js";
import { registerTaxValidationTools } from "./tools/validation-tax.tools.js";
import { registerPeriodCloseValidationTools } from "./tools/validation-period-close.tools.js";
import { registerDocumentValidationTools } from "./tools/validation-document.tools.js";
import { registerReconciliationValidationTools } from "./tools/validation-reconciliation.tools.js";
import { registerDrillDownTools } from "./tools/validation-drilldown.tools.js";
import { registerCostingTools } from "./tools/costing.tools.js";
import { registerScanTools } from "./tools/scan.tools.js";
import { registerFullReportTools } from "./tools/fullreport.tools.js";
import { EntitySchemaService } from "@aibos/services";
import { registerEntitySchemaTools } from "./tools/entity-schema.tools.js";
import { GuidResolverService } from "@aibos/services";
import { registerGuidResolverTools } from "./tools/guid-resolver.tools.js";
import type { OrgContext } from "./org-context.js";
import { buildOrgContext } from "./org-context.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export async function createServer(config: AppConfig): Promise<{ server: McpServer; orgCtx: OrgContext }> {
  const client = new OneCClient(config.onec);
  const docflowClient = new DocflowClient(config.docflow);

  const catalogService = new CatalogService(client);
  const documentService = new DocumentService(client);
  const registerService = new RegisterService(client);
  const productionService = new ProductionService(client, registerService);
  const auditorService = new AuditorService(client, documentService);
  const metadataService = new MetadataService(client);
  const analyticsService = new AnalyticsService(client, registerService);
  const reportsService = new ReportsService(client);
  const docflowService = new DocflowService(docflowClient);
  const generatorService = new DocumentGeneratorService(reportsService, catalogService);
  const anomalyMLService    = new AnomalyMLService(client);
  const alertService        = new AlertService();
  const investigationService = new InvestigationService(client);
  const accountsService = new AccountsService();
  const integrityValidator = new IntegrityValidator(client, reportsService, registerService);
  const taxValidator = new TaxValidator(client, registerService);
  const periodCloseValidator = new PeriodCloseValidator(client, registerService, auditorService);
  const documentValidator = new DocumentValidator(client, registerService);
  const reconciliationValidator = new ReconciliationValidator(client, registerService);
  const drillDownService = new DrillDownService(client, registerService);
  const costingService = new CostingService(client, registerService);
  const accountAnalysisService = new AccountAnalysisService(client);
  const documentScannerService = new DocumentScannerService(client);
  // Entities/ folder — 889 .md files with full 1C KZ OData schema (offline, no network needed)
  const entitiesDir = config.entitiesDir || resolve(__dirname, "../../../Entities");
  const entitySchemaService = new EntitySchemaService(entitiesDir);
  const guidResolverService = new GuidResolverService(client, entitySchemaService);

  // ── Resolve organization list once at startup ─────────────────────────────
  // This eliminates the LLM-stale-GUID bug: all handlers call resolveOrg(provided)
  // instead of using the LLM-supplied GUID directly. An unknown/hallucinated GUID is
  // silently replaced with the tenant default. Set ONEC_DEFAULT_ORG_GUID in .env for
  // multi-org databases; single-org databases are detected automatically.
  const orgCtx = await buildOrgContext(catalogService, config.defaultOrgGuid);

  const server = new McpServer({
    name: "onec-kz",
    version: "1.0.0",
  });

  registerCatalogTools(server, catalogService);
  registerDocumentTools(server, documentService);
  registerRegisterTools(server, registerService);
  registerProductionTools(server, productionService);
  registerAuditorTools(server, auditorService, registerService, reportsService);
  registerAnalyticsTools(server, analyticsService);
  registerMetadataTools(server, metadataService);
  registerReportsTools(server, reportsService);
  registerAnomalyMLTools(server, anomalyMLService, alertService);
  registerInvestigationTools(server, investigationService);
  registerDocflowTools(server, docflowService);
  registerGeneratorTools(server, generatorService);
  registerDueDiligenceTools(server, reportsService);
  registerStockTools(server, reportsService);
  registerAccountsTools(server, accountsService);
  registerIntegrityValidationTools(server, integrityValidator);
  registerTaxValidationTools(server, taxValidator);
  registerPeriodCloseValidationTools(server, periodCloseValidator);
  registerDocumentValidationTools(server, documentValidator);
  registerReconciliationValidationTools(server, reconciliationValidator);
  registerDrillDownTools(server, drillDownService);
  registerCostingTools(server, costingService);
  registerAccountAnalysisTools(server, accountAnalysisService);
  registerScanTools(server, documentScannerService);
  registerFullReportTools(server, reportsService, catalogService, accountsService);
  registerEntitySchemaTools(server, entitySchemaService);
  registerGuidResolverTools(server, guidResolverService);

  // ── Resources — static and live URIs ──────────────────────────────────────

  server.resource(
    "onec-organizations",
    "onec://organizations",
    { description: "List of all organizations in the 1C database" },
    async () => {
      const orgs = await catalogService.getOrganizations();
      return { contents: [{ uri: "onec://organizations", text: JSON.stringify(orgs, null, 2), mimeType: "application/json" }] };
    },
  );

  server.resource(
    "onec-chart-of-accounts",
    "onec://chart-of-accounts",
    { description: "Kazakhstan chart of accounts (ChartOfAccounts_Типовой)" },
    async () => {
      const accounts = await client.getCollection("ChartOfAccounts_Типовой", {
        filter: "DeletionMark eq false",
        select: "Ref_Key,Code,Description,Type,OffBalance",
        orderby: "Code asc",
        top: 500,
      });
      return { contents: [{ uri: "onec://chart-of-accounts", text: JSON.stringify(accounts, null, 2), mimeType: "application/json" }] };
    },
  );

  server.resource(
    "onec-currencies",
    "onec://currencies",
    { description: "Available currencies with current exchange rates" },
    async () => {
      const [currencies, rates] = await Promise.all([
        client.getCollection("Catalog_Валюты", { filter: "DeletionMark eq false", select: "Ref_Key,Description,Code" }),
        registerService.getExchangeRates(),
      ]);
      return { contents: [{ uri: "onec://currencies", text: JSON.stringify({ currencies, rates }, null, 2), mimeType: "application/json" }] };
    },
  );

  server.resource(
    "kz-standard-chart-of-accounts",
    "accounts://kz-chart",
    { description: "Kazakhstan regulatory chart of accounts (Типовой план счетов РК) — static reference with full descriptions for all sections, subsections, and account groups" },
    async () => ({
      contents: [{ uri: "accounts://kz-chart", text: JSON.stringify(accountsService.getFullChart(), null, 2), mimeType: "application/json" }],
    }),
  );

  server.resource(
    "onec-kz-workflow",
    "onec://kz-workflow",
    { description: "Kazakhstan accounting workflow reference: production cycle, НК РК 2026 tax rates, key account mappings" },
    async () => {
      const workflow = `# KZ 1C:Бухгалтерия — Universal Workflow Reference

## Production Cycle (any industry)
1.  Purchases: 1310→3310 (materials/goods/services)
2.  Inventory transfer: 1310→1310 (between warehouses)
3.  Materials to production: 8110→1310
4.  Payroll (production): 8110→3350
5.  Payroll (admin): 7210→3350
6.  Social contributions: 8110/7210→3210,3220,3250
7.  Depreciation (production assets): 8110→2420
8.  Overhead allocation: 8410→8110
9.  WIP balance: 8110 accumulates until output is ready
10. Finished goods: 1320→8110 (capitalize output)
11. Sales revenue: 1210→6010
12. COGS: 7010→1320
13. Period close: ЗакрытиеМесяца document
14. Year-end reform: 5610→5510

## Agro-Specific Additions
- Account 8110 НЗП: do NOT close until harvest (Aug–Sep)
- Harvest: 1320←8110 at actual production cost
- Biological assets: 2521 (main herd), 2950 (growing livestock)
- КПН agro reduction: 70% per Ст.285 НК РК → set isAgro=true in onec_get_kpn_estimate

## НК РК 2026
КПН: 20% (agro: −70%, Ст.285) | НДС: 12% | ИПН: 10%
ОПВ: 10% (employee) + ОППВ: 5% (employer)
СО: 3.5% | ВОСМС: 3% | ООСМС: 2% | СН: 9.5%−СО
МРП: 3,692 тг | МЗП: 85,000 тг | ИПН standard deduction: 14 МРП = 51,688 тг

## Key Accounts
1010 Cash | 1030 Bank | 1210 AR | 1310 Materials | 1320 Finished goods
3110 CIT payable | 3130 VAT payable | 3310 AP | 3350 Payroll
6010 Revenue | 7010 COGS | 7210 Admin | 8110 WIP`;
      return { contents: [{ uri: "onec://kz-workflow", text: workflow, mimeType: "text/markdown" }] };
    },
  );

  // ── Entity schema resources (offline, from Entities/ folder) ─────────────────

  if (entitySchemaService.isAvailable) {
    server.resource(
      "onec-entity-index",
      "onec://entities",
      {
        description: `Index of all ${entitySchemaService.size} 1C OData entities available in this database, grouped by category (Catalog, Document, AccumulationRegister, InformationRegister, etc.). Use to browse available entities before calling onec_get_entity_schema.`,
      },
      async () => {
        const categories = [
          "Catalog", "Document", "AccumulationRegister", "InformationRegister",
          "AccountingRegister", "ChartOfAccounts", "DocumentJournal",
          "ChartOfCalculationTypes", "ChartOfCharacteristicTypes",
        ];
        const byCategory: Record<string, string[]> = {};
        for (const cat of categories) {
          const names = entitySchemaService.listEntities(cat);
          if (names.length) byCategory[cat] = names;
        }
        return {
          contents: [{
            uri:      "onec://entities",
            text:     JSON.stringify({ total: entitySchemaService.size, byCategory }, null, 2),
            mimeType: "application/json",
          }],
        };
      },
    );
  }

  return { server, orgCtx };
}
