import "dotenv/config";
import type { OneCConfig } from "@aibos/onec-client";
import type { DocflowConfig } from "@aibos/onec-client";

function require(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}\nAdd it to your .env file.`);
  return val;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export interface AppConfig {
  onec:        OneCConfig;
  docflow:     DocflowConfig;
  logLevel:    string;
  /** Absolute path to the Entities/ folder. Set ENTITIES_DIR in .env, or defaults to <project-root>/Entities. */
  entitiesDir: string;
  /**
   * Default organization Ref_Key. Set ONEC_DEFAULT_ORG_GUID in .env when the database
   * has multiple organizations. Single-org databases don't need this — the only org is
   * used automatically. OrgContext uses this to resolve organizationGuid server-side.
   */
  defaultOrgGuid?: string;
}

/**
 * Build an AppConfig from per-request HTTP headers.
 * Called once when a new HTTP session is established; credentials are never
 * stored beyond the session lifetime managed by session-registry.ts.
 *
 * Expected headers:
 *   Authorization: Basic <base64(username:password)>
 *   X-OnecUrl:     https://host/path  (must be HTTPS unless ONEC_ALLOW_HTTP=true)
 *   X-OnecDefaultOrgGuid: <guid>      (optional, same as ONEC_DEFAULT_ORG_GUID)
 */
export function loadConfigFromRequest(
  authHeader: string | undefined,
  onecUrlHeader: string | undefined,
  defaultOrgGuidHeader?: string | undefined,
): AppConfig {
  if (!authHeader?.startsWith("Basic ")) {
    throw new Error("Missing or invalid Authorization header — expected: Basic <base64(user:pass)>");
  }
  if (!onecUrlHeader) {
    throw new Error("Missing X-OnecUrl header");
  }

  const baseUrlRaw = onecUrlHeader.replace(/\/$/, "");
  if (!baseUrlRaw.startsWith("https://") && process.env.ONEC_ALLOW_HTTP !== "true") {
    throw new Error(
      `X-OnecUrl must use HTTPS (got: ${baseUrlRaw.slice(0, 60)}…). ` +
      "Set ONEC_ALLOW_HTTP=true to override for local testing only."
    );
  }

  const baseUrl = baseUrlRaw.includes("/odata/standard.odata")
    ? baseUrlRaw
    : `${baseUrlRaw}/odata/standard.odata`;

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const colonIdx = decoded.indexOf(":");
  if (colonIdx === -1) {
    throw new Error("Authorization header is not valid Basic auth — expected base64(username:password)");
  }
  const username = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);

  return {
    onec: {
      baseUrl,
      username,
      password,
      timeoutMs:  parseInt(optional("ONEC_TIMEOUT_MS", "30000"), 10),
      maxRetries: parseInt(optional("ONEC_MAX_RETRIES", "3"), 10),
    },
    docflow: {
      baseUrl:    optional("DOCFLOW_BASE_URL", "not-configured").replace(/\/$/, ""),
      username:   optional("DOCFLOW_USERNAME", ""),
      password:   optional("DOCFLOW_PASSWORD", ""),
      timeoutMs:  parseInt(optional("DOCFLOW_TIMEOUT_MS", "30000"), 10),
      maxRetries: parseInt(optional("DOCFLOW_MAX_RETRIES", "3"), 10),
    },
    logLevel:       optional("ONEC_LOG_LEVEL", "info"),
    entitiesDir:    optional("ENTITIES_DIR", ""),
    defaultOrgGuid: defaultOrgGuidHeader || undefined,
  };
}

export function loadConfig(): AppConfig {
  const baseUrlRaw = require("ONEC_BASE_URL").replace(/\/$/, "");

  // Security: enforce HTTPS — basic auth over plain HTTP leaks the 1C password in transit.
  // Set ONEC_ALLOW_HTTP=true only for localhost/test environments.
  if (!baseUrlRaw.startsWith("https://") && process.env.ONEC_ALLOW_HTTP !== "true") {
    throw new Error(
      `ONEC_BASE_URL must use HTTPS (got: ${baseUrlRaw.slice(0, 60)}…). ` +
      "Sending 1C credentials over plain HTTP is insecure. " +
      "Set ONEC_ALLOW_HTTP=true to override for local testing only."
    );
  }

  const baseUrl = baseUrlRaw.includes("/odata/standard.odata")
    ? baseUrlRaw
    : `${baseUrlRaw}/odata/standard.odata`;

  const docflowBaseRaw = optional("DOCFLOW_BASE_URL", "not-configured");

  return {
    onec: {
      baseUrl,
      username:   require("ONEC_USERNAME"),
      password:   require("ONEC_PASSWORD"),
      timeoutMs:  parseInt(optional("ONEC_TIMEOUT_MS", "30000"), 10),
      maxRetries: parseInt(optional("ONEC_MAX_RETRIES", "3"), 10),
    },
    docflow: {
      baseUrl:    docflowBaseRaw.replace(/\/$/, ""),
      username:   optional("DOCFLOW_USERNAME", ""),
      password:   optional("DOCFLOW_PASSWORD", ""),
      timeoutMs:  parseInt(optional("DOCFLOW_TIMEOUT_MS", "30000"), 10),
      maxRetries: parseInt(optional("DOCFLOW_MAX_RETRIES", "3"), 10),
    },
    logLevel:      optional("ONEC_LOG_LEVEL", "info"),
    entitiesDir:   optional("ENTITIES_DIR", ""),
    defaultOrgGuid: optional("ONEC_DEFAULT_ORG_GUID", "") || undefined,
  };
}
