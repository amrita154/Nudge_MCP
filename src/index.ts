import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { randomUUID } from "crypto";
import { createServer } from "./server.js";

const PORT = process.env.PORT;

// ── stdio mode — Claude Desktop ───────────────────────────────────────────────
async function startStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Keep process alive; stdio transport manages lifecycle
}

// ── HTTP mode — Claude.ai remote MCP ─────────────────────────────────────────
async function startHTTP(port: number) {
  const app = express();
  app.use(express.json());

  // Session store: sessionId → transport
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  async function getOrCreateTransport(sessionId?: string): Promise<StreamableHTTPServerTransport> {
    if (sessionId) {
      const existing = sessions.get(sessionId);
      if (existing) return existing;
    }

    const newId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newId,
      onsessioninitialized: (id) => {
        sessions.set(id, transport);
      },
    });

    // Clean up on close
    transport.onclose = () => sessions.delete(newId);

    const server = createServer();
    await server.connect(transport);
    return transport;
  }

  // POST /mcp — client → server messages
  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    try {
      const transport = await getOrCreateTransport(sessionId);
      await transport.handleRequest(req, res, req.body);
    } catch (e) {
      if (!res.headersSent) {
        res.status(500).json({ error: (e as Error).message });
      }
    }
  });

  // GET /mcp — SSE stream for server → client messages
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).json({ error: "Missing or unknown mcp-session-id" });
      return;
    }
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // DELETE /mcp — session cleanup
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId) {
      const transport = sessions.get(sessionId);
      if (transport) {
        await transport.close();
        sessions.delete(sessionId);
      }
    }
    res.status(204).send();
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "nudge-mcp", sessions: sessions.size });
  });

  app.listen(port, () => {
    console.error(`nudge-mcp HTTP server running on port ${port}`);
    console.error(`MCP endpoint: http://localhost:${port}/mcp`);
    console.error(`Health check: http://localhost:${port}/health`);
  });
}

// ── Entry point ───────────────────────────────────────────────────────────────
if (PORT) {
  startHTTP(Number(PORT)).catch((e) => {
    console.error("Failed to start HTTP server:", e);
    process.exit(1);
  });
} else {
  startStdio().catch((e) => {
    console.error("Failed to start stdio server:", e);
    process.exit(1);
  });
}
