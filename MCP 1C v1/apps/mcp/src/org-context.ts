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
  /** true when the LLM passed an unknown/hallucinated GUID and we substituted the default */
  corrected: boolean;
  /** the original GUID the caller supplied (present only when corrected=true, for logging) */
  provided?: string;
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
   *   - unknown/zero GUID    → ignore, use defaultGuid, corrected:true
   *   - omitted              → use defaultGuid, corrected:false
   *   - multi-org, no default → throw with the list of valid orgs
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
    // 1C unreachable at boot — tolerate if a default GUID is pre-configured via env.
    // The server will start in "default-only" mode: resolveOrgGuid always returns that GUID.
    if (!configuredDefault) throw fetchErr;
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

      if (norm && norm !== ZERO_GUID && byGuid.has(norm)) {
        // Valid, recognized GUID — use canonical casing stored in the Map
        return { guid: byGuid.get(norm)!.guid, corrected: false };
      }

      if (!defaultGuid) {
        const list = orgs.map((o) => `${o.name} (${o.guid})`).join("; ");
        throw new Error(
          `Multiple organizations found and ONEC_DEFAULT_ORG_GUID is not configured. ` +
          `Provide a valid organizationGuid from onec_get_organizations, or set ` +
          `ONEC_DEFAULT_ORG_GUID in .env. Available: ${list}`,
        );
      }

      // Unknown/hallucinated/zero/omitted → substitute default
      const corrected = !!(norm && norm !== ZERO_GUID);
      return {
        guid: defaultGuid,
        corrected,
        provided: corrected ? provided : undefined,
      };
    },
  };
}
