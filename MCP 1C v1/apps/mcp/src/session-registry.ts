import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { AppConfig } from "./config.js";
import { createServer } from "./server.js";
import type { OrgContext } from "./org-context.js";

export interface Session {
  server:    McpServer;
  transport: StreamableHTTPServerTransport;
  orgCtx:    OrgContext;
  lastUsed:  number;
}

const _sessions = new Map<string, Session>();

// Sessions idle longer than this are closed and removed.
const IDLE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Return an existing session for `sessionId`, or build a new one using `config`.
 * `config` is only consulted on the first call for a given `sessionId`.
 */
export async function getOrCreateSession(
  sessionId: string,
  config: AppConfig,
  transportFactory: (id: string) => StreamableHTTPServerTransport,
): Promise<Session> {
  const existing = _sessions.get(sessionId);
  if (existing) {
    existing.lastUsed = Date.now();
    return existing;
  }

  const { server, orgCtx } = await createServer(config);
  const transport = transportFactory(sessionId);
  await server.connect(transport);

  const session: Session = { server, transport, orgCtx, lastUsed: Date.now() };
  _sessions.set(sessionId, session);
  return session;
}

export function deleteSession(sessionId: string): void {
  const session = _sessions.get(sessionId);
  if (session) {
    session.transport.close();
    _sessions.delete(sessionId);
  }
}

export function getSessionCount(): number {
  return _sessions.size;
}

// Evict sessions that have been idle longer than IDLE_TTL_MS.
const _cleanupTimer = setInterval(() => {
  const cutoff = Date.now() - IDLE_TTL_MS;
  for (const [id, session] of _sessions) {
    if (session.lastUsed < cutoff) {
      session.transport.close();
      _sessions.delete(id);
    }
  }
}, 5 * 60 * 1000).unref(); // .unref() — don't keep the process alive for cleanup alone
void _cleanupTimer;
