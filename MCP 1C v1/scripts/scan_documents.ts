/**
 * Full document scan — no limitPerType, results saved to JSON file.
 * Console output: summary only (minimal token usage).
 *
 * Usage:
 *   npx tsx scripts/scan_documents.ts [dateFrom] [dateTo] [orgGuid]
 *
 * Examples:
 *   npx tsx scripts/scan_documents.ts 2025-01-01 2025-12-31
 *   npx tsx scripts/scan_documents.ts 2026-01-01 2026-05-26
 */

import { writeFileSync } from "fs";
import { OneCClient } from "@aibos/onec-client";
import { DocumentScannerService } from "@aibos/services";
import { loadConfig } from "../apps/mcp/src/config.js";

const args = process.argv.slice(2);
const dateFrom = args[0] ?? "2025-01-01";
const dateTo   = args[1] ?? new Date().toISOString().slice(0, 10);
const orgGuid  = args[2] ?? "41c5d9a6-6d87-11e9-9f9f-80c5f26788b0";

const { onec } = loadConfig();
const client  = new OneCClient({ ...onec, timeoutMs: 90_000 });
const scanner = new DocumentScannerService(client);

console.log(`Scan: ${dateFrom} → ${dateTo}  org: ${orgGuid}`);

const result = await scanner.scanDocuments(orgGuid, dateFrom, dateTo, {
  maxFindingsPerCheck: 500,
});

const { summary } = result;

if (summary.total === 0) {
  console.log(`✓ No issues found  (${summary.documentsScanned} docs scanned)`);
} else {
  console.log(`Docs scanned : ${summary.documentsScanned}`);
  console.log(`Critical     : ${summary.critical}`);
  console.log(`Error        : ${summary.error}`);
  console.log(`Warn         : ${summary.warn}`);
  console.log(`Info         : ${summary.info}`);
  console.log(`Total issues : ${summary.total}${summary.truncated ? ` (truncated, full: ${summary.fullFindingCount})` : ""}`);
}

const outFile = `scan_results_${dateFrom.replace(/-/g, "")}_${dateTo.replace(/-/g, "")}.json`;
writeFileSync(outFile, JSON.stringify(result, null, 2), "utf8");
console.log(`Saved → ${outFile}`);
