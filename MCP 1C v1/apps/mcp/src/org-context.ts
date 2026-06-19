/**
 * OrgContext — server-side organizationGuid resolution.
 *
 * Resolves the organization list once at startup (per tenant process) so code,
 * not the LLM, decides which GUID is used. Eliminates the #1 hallucination bug:
 * the LLM reusing a stale GUID from conversation history → all-zero results.
 *
 * Usage in server.ts:
 *   const orgCtx = await buildOrgContext(catalogService, config.defaultOrgGuid);
 *   setOrgContext(orgCtx);   // from utils.ts, before any register*Tools call
 */

import type { CatalogService } from "@aibos/services";

export interface OrgInfo {
  guid: string;
  name: string;
}

export interface ResolveResult {
  guid: string;
  /** always false in v2 — unknown GUIDs now throw instead of being silently corrected */
  corrected: false;
}

/** Thrown when the caller passes an unknown, zero, or ambiguous organizationGuid. */
export class OrgContextError extends Error {
  readonly validOrgs: OrgInfo[];
  constructor(message: string, validOrgs: OrgInfo[]) {
    super(message);
    this.name = "OrgContextError";
    this.validOrgs = validOrgs;
  }
}

export interface OrgContext {
  orgs: OrgInfo[];
  defaultGuid: string;
  byGuid: Map<string, OrgInfo>;   // keyed by lowercase GUID
  /**
   * Decide the effective organizationGuid.
   * @param provided - whatever the LLM/caller passed (may be stale or hallucinated)
   * Behavior:
   *   - valid known GUID     → use it as-is, corrected:false
   *   - omitted/empty        → use defaultGuid, corrected:false
   *   - unknown/zero GUID    → throw OrgContextError with the list of valid orgs
   *   - multi-org, no default → throw OrgContextError
   */
  resolveOrgGuid(provided?: string): ResolveResult;
}

const ZERO_GUID = "00000000-0000-0000-0000-000000000000";

export async function buildOrgContext(
  catalog: CatalogService,
  configuredDefault?: string,
): Promise<OrgContext> {
  let orgs: OrgInfo[] = [];

  try {
    const raw = await catalog.getOrganizations();
    orgs = raw.map((o) => ({ guid: o.Ref_Key, name: o.Description ?? "" }));
  } catch (fetchErr) {
    // 1C unreachable at boot, or catalog entity not exposed via OData — start in degraded mode.
    // Tools requiring an org GUID will fail at call time rather than crashing the server.
    console.error("[OrgContext] Could not load organizations at startup:", (fetchErr as Error).message);
  }

  const byGuid = new Map<string, OrgInfo>(
    orgs.map((o) => [o.guid.toLowerCase(), o]),
  );

  let defaultGuid: string | undefined;
  if (configuredDefault) {
    const cfgLow = configuredDefault.toLowerCase();
    if (byGuid.has(cfgLow)) {
      defaultGuid = byGuid.get(cfgLow)!.guid;  // use canonical casing from 1C
    } else if (orgs.length === 0) {
      // fetch failed but env has a configured GUID — trust it
      defaultGuid = configuredDefault;
    }
    // else: configured but not found in known orgs; fall through to single-org check
  }
  if (!defaultGuid && orgs.length === 1) {
    defaultGuid = orgs[0].guid;
  }
  // multi-org, no configured default → defaultGuid stays undefined → resolveOrgGuid throws

  return {
    orgs,
    byGuid,
    defaultGuid: defaultGuid ?? "",

    resolveOrgGuid(provided?: string): ResolveResult {
      const norm = provided?.toLowerCase().trim();

      // Omitted or empty → use defaultGuid (or throw if multi-org with no default)
      if (!norm) {
        if (!defaultGuid) {
          const list = orgs.map((o) => `${o.name} (${o.guid})`).join("; ");
          throw new OrgContextError(
            `Multiple organizations found and ONEC_DEFAULT_ORG_GUID is not configured. ` +
            `Provide a valid organizationGuid from onec_get_organizations. Available: ${list}`,
            orgs,
          );
        }
        return { guid: defaultGuid, corrected: false };
      }

      // Valid known GUID → use canonical casing stored in the Map
      if (norm !== ZERO_GUID && byGuid.has(norm)) {
        return { guid: byGuid.get(norm)!.guid, corrected: false };
      }

      // Zero GUID or unknown GUID → strict reject (v1 silently corrected these; v2 does not)
      const isZero = norm === ZERO_GUID;
      console.warn(
        `[OrgContext][v1-telemetry] ${isZero ? "zero" : "unknown"} guid "${provided}" rejected` +
        (defaultGuid ? ` (would have silently corrected to "${defaultGuid}" before v2)` : ""),
      );
      const list = orgs.map((o) => `${o.name} (${o.guid})`).join("; ") ||
        "(none loaded — check 1C connectivity)";
      throw new OrgContextError(
        isZero
          ? `Zero GUID is not a valid organization identifier. Call onec_get_organizations to list valid GUIDs. Available: ${list}`
          : `Unknown organizationGuid "${provided}". Call onec_get_organizations to list valid GUIDs. Available: ${list}`,
        orgs,
      );
    },
  };
}
