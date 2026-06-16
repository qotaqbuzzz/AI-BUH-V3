/**
 * MCP tools for the ML anomaly detection layer.
 * Registers two new tools on top of the existing onec_detect_anomalies:
 *
 *   onec_ml_scan_anomalies  — full ML scan with z-score + confidence
 *   onec_build_baselines    — rebuild historical baselines from 12m of data
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AnomalyMLService } from "@aibos/services";
import { AlertService } from "@aibos/services";
import { ok, wrapError } from "./utils.js";

export function registerAnomalyMLTools(
  server: McpServer,
  service: AnomalyMLService,
  alerts: AlertService,
): void {

  // ── Full ML scan ────────────────────────────────────────────────
  server.tool(
    "onec_ml_scan_anomalies",
    "AI anomaly scan with z-score outlier detection and confidence scoring. "
    + "Returns anomalies ranked by severity and confidence. "
    + "Optionally sends Telegram/webhook alerts for critical findings.",
    {
      organizationGuid: z.string().uuid().describe("Organization GUID"),
      dateFrom:         z.string().describe("Start date YYYY-MM-DD"),
      dateTo:           z.string().describe("End date YYYY-MM-DD"),
      alertOnFindings:  z.boolean().optional().default(false)
                         .describe("Send Telegram/webhook alert if anomalies found"),
      minConfidence:    z.number().min(0).max(100).optional().default(50)
                         .describe("Only return anomalies above this confidence threshold"),
    },
    async ({ organizationGuid, dateFrom, dateTo, alertOnFindings, minConfidence }) => {
      try {
        const result = await service.scan(organizationGuid, dateFrom, dateTo);

        if (alertOnFindings && result.summary.total > 0) {
          await alerts.dispatch(result).catch(() => {/* non-fatal */});
        }

        const filtered = {
          ...result,
          anomalies: result.anomalies.filter(a => a.confidence >= minConfidence!),
        };

        return ok(filtered);
      } catch (e) {
        return wrapError(e);
      }
    },
  );

  // ── Build / refresh baselines ───────────────────────────────────
  server.tool(
    "onec_build_baselines",
    "Scan 12+ months of historical transactions and compute statistical baselines "
    + "(mean, std dev, p95, p99) per document type and calendar month. "
    + "Run this once, then pass the result to onec_ml_scan_anomalies for outlier detection.",
    {
      organizationGuid: z.string().uuid().describe("Organization GUID"),
      dateFrom:         z.string().describe("History start date YYYY-MM-DD (use 12m+ ago)"),
      dateTo:           z.string().describe("History end date YYYY-MM-DD"),
    },
    async ({ organizationGuid, dateFrom, dateTo }) => {
      try {
        const baselines = await service.buildBaselines(organizationGuid, dateFrom, dateTo);
        return ok({
          message:  `Built ${baselines.length} baselines from ${dateFrom} to ${dateTo}`,
          baselines,
        });
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
