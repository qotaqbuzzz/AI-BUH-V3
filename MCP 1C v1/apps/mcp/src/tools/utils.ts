import { AsyncLocalStorage } from "node:async_hooks";
import { OneCError } from "@aibos/onec-client";
import type { OrgContext } from "../org-context.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolResult = any;

export function wrapError(e: unknown): ToolResult {
  const text = e instanceof OneCError
    ? e.message
    : (e instanceof Error ? e.message : String(e));
  return { isError: true, content: [{ type: "text" as const, text }] };
}

/** Provenance metadata attached to every tool response. */
export interface ResponseMeta {
  orgGuid?:          string;
  orgGuidCorrected?: boolean;
  orgGuidProvided?:  string;   // original hallucinated value, for debugging
  rowCount?:         number;
  truncated?:        boolean;
  note?:             string;
}

/**
 * Wrap a successful tool result.
 * Optionally attach `_meta` provenance so the LLM (and logs) can see *why* a result
 * looks the way it does (which org was actually queried, row count, etc.).
 */
export function ok(data: unknown, meta?: ResponseMeta): ToolResult {
  let payload: unknown = data;
  if (meta && Object.keys(meta).some((k) => meta[k as keyof ResponseMeta] !== undefined)) {
    // Attach _meta to the top-level object without mutating the original data
    payload = typeof data === "object" && data !== null
      ? { ...(data as object), _meta: meta }
      : { _data: data, _meta: meta };
  }
  return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
}

// ── OrgContext resolution ─────────────────────────────────────────────────────
// HTTP mode: each request runs inside withOrgContext(), which stores the
// per-session OrgContext in AsyncLocalStorage — zero cross-session leakage.
// stdio mode: setOrgContext() fills a process-wide fallback (single tenant).

const _orgStorage = new AsyncLocalStorage<OrgContext>();
let _fallbackCtx: OrgContext | null = null;

/** stdio compatibility — call once after createServer() in index.ts. */
export function setOrgContext(ctx: OrgContext): void {
  _fallbackCtx = ctx;
}

/**
 * Run `fn` with `ctx` bound as the active OrgContext for every async
 * descendant. Used by the HTTP session handler, once per incoming request.
 */
export function withOrgContext<T>(ctx: OrgContext, fn: () => T): T {
  return _orgStorage.run(ctx, fn);
}

/**
 * Resolve the effective organizationGuid for a tool handler.
 * Pass whatever the LLM supplied; returns the correct GUID (injecting the
 * tenant default if the provided value is missing or unrecognized).
 *
 * Returns `{ guid, corrected, provided? }` so handlers can attach a note
 * to the response when the GUID was corrected.
 */
export function resolveOrg(provided?: string): { guid: string; corrected: boolean; provided?: string } {
  const ctx = _orgStorage.getStore() ?? _fallbackCtx;
  if (!ctx) throw new Error("OrgContext not initialized — server startup error");
  return ctx.resolveOrgGuid(provided);
}
