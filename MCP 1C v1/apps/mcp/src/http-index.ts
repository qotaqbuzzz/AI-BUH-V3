/**
 * HTTP entry point for the multi-user OData MCP server.
 *
 * Each independent user connects with their own 1C credentials. The server
 * creates a dedicated OneCClient + McpServer per session so user data is
 * fully isolated.
 *
 * Protocol:
 *   POST   /mcp   — MCP JSON-RPC request (initial connection or existing session)
 *   GET    /mcp   — SSE stream for server-to-client notifications
 *   DELETE /mcp   — Explicit session termination
 *   GET    /health — Liveness probe
 *
 * Initial connection headers — pick ONE method:
 *   X-Connection-Name: <name>                                 <- preferred: admin-registered connection
 *   — OR —
 *   Authorization:        Basic <base64(username:password)>   <- raw 1C credentials
 *   X-OnecUrl:            https://your-1c-host/               <- 1C base URL
 *   X-OnecDefaultOrgGuid: <guid>                              <- optional
 *
 * Subsequent requests need only:
 *   mcp-session-id: <uuid returned by the server on first response>
 */

import "dotenv/config";
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { loadConfigFromRequest, loadConfigFromConnectionEntry } from "./config.js";
import { getOrCreateSession, deleteSession, getSessionCount } from "./session-registry.js";
import { withOrgContext } from "./tools/utils.js";
import { getConnection } from "./connections-store.js";
import { startAdminBot } from "./telegram-bot.js";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

// ── Helpers ───────────────────────────────────────────────────────────────────

function header(req: IncomingMessage, name: string): string | undefined {
  const val = req.headers[name.toLowerCase()];
  return Array.isArray(val) ? val[0] : val;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) { resolve(undefined); return; }
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

// ── Request handler ───────────────────────────────────────────────────────────

async function handleMcp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionId = header(req, "mcp-session-id");

  // ── New session ─────────────────────────────────────────────────────────────
  if (!sessionId) {
    if (req.method !== "POST") {
      sendJson(res, 400, { error: "First request must be POST to establish a session" });
      return;
    }

    let config;
    try {
      const connName = header(req, "x-connection-name");
      if (connName) {
        const entry = getConnection(connName);
        if (!entry) throw new Error(`Unknown connection: "${connName}". Register it via the admin Telegram bot (/add).`);
        config = loadConfigFromConnectionEntry(entry);
      } else {
        config = loadConfigFromRequest(
          header(req, "authorization"),
          header(req, "x-onecurl"),
          header(req, "x-onecdefaultorgguid"),
        );
      }
    } catch (err) {
      sendJson(res, 401, { error: err instanceof Error ? err.message : String(err) });
      return;
    }

    const newId = randomUUID();
    let body: unknown;
    try { body = await readBody(req); } catch { sendJson(res, 400, { error: "Invalid JSON body" }); return; }

    try {
      const session = await getOrCreateSession(
        newId,
        config,
        (id) => new StreamableHTTPServerTransport({ sessionIdGenerator: () => id }),
      );

      await withOrgContext(session.orgCtx, () =>
        session.transport.handleRequest(req, res, body),
      );
    } catch (err) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  // ── Existing session ────────────────────────────────────────────────────────
  // For GET (SSE) and subsequent POST requests: look up the cached session only.
  // We pass a dummy config and a factory that throws — neither is called for
  // existing sessions because getOrCreateSession returns the cached entry first.
  let session;
  try {
    session = await getOrCreateSession(
      sessionId,
      undefined as never,
      () => { throw new Error("Unexpected: transport factory called for existing session"); },
    );
  } catch {
    sendJson(res, 404, { error: "Session not found or expired. Start a new session." });
    return;
  }

  if (req.method === "DELETE") {
    deleteSession(sessionId);
    res.writeHead(204).end();
    return;
  }

  let body: unknown;
  if (req.method === "POST") {
    try { body = await readBody(req); } catch { sendJson(res, 400, { error: "Invalid JSON body" }); return; }
  }

  try {
    await withOrgContext(session.orgCtx, () =>
      session.transport.handleRequest(req, res, body),
    );
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
  }
}

// ── HTTP server ───────────────────────────────────────────────────────────────

const httpServer = createHttpServer(async (req, res) => {
  const url = req.url?.split("?")[0] ?? "/";

  if (url === "/health") {
    sendJson(res, 200, { status: "ok", sessions: getSessionCount() });
    return;
  }

  if (url === "/mcp") {
    try {
      await handleMcp(req, res);
    } catch (err) {
      if (!res.headersSent) {
        sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
      }
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

startAdminBot();

httpServer.listen(PORT, () => {
  console.log(`onec-kz MCP HTTP server listening on port ${PORT}`);
  console.log(`  POST/GET/DELETE  http://localhost:${PORT}/mcp`);
  console.log(`  GET              http://localhost:${PORT}/health`);
});
