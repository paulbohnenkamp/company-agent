import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { createServer } from "node:http";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

type Customer = {
  id: string;
  name: string;
  status: string;
  openRequestCount: number;
};

function parseCustomer(value: unknown): Customer {
  if (typeof value !== "object" || value === null) {
    throw new Error("Customer API returned a non-object payload");
  }
  if (
    !("id" in value) ||
    !("name" in value) ||
    !("status" in value) ||
    !("openRequestCount" in value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.status !== "string" ||
    typeof value.openRequestCount !== "number"
  ) {
    throw new Error("Customer API returned an invalid customer payload");
  }
  return {
    id: value.id,
    name: value.name,
    status: value.status,
    openRequestCount: value.openRequestCount,
  };
}

const apiUrl = process.env.CUSTOMER_API_URL ?? "http://localhost:5080";

function createMcpServer() {
  const server = new Server(
    { name: "customer-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "find_customer",
        description: "Find a customer by the exact customer ID in the existing customer application.",
        inputSchema: {
          type: "object",
          properties: { customerId: { type: "string", description: "Customer ID such as CUST-1001." } },
          required: ["customerId"],
        },
      },
      {
        name: "get_customer_summary",
        description: "Retrieve a read-only customer account summary from the existing customer application.",
        inputSchema: {
          type: "object",
          properties: { customerId: { type: "string", description: "Customer ID such as CUST-1001." } },
          required: ["customerId"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "find_customer" && request.params.name !== "get_customer_summary") {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }
    const customerId = request.params.arguments?.customerId;
    if (typeof customerId !== "string" || customerId.length === 0) {
      throw new Error("customerId is required");
    }

    const response = await fetch(`${apiUrl}/api/customers/${encodeURIComponent(customerId)}`);
    if (!response.ok) {
      return { content: [{ type: "text", text: `Customer lookup failed with HTTP ${response.status}.` }], isError: true };
    }
    const customer = parseCustomer(await response.json());
    const text = request.params.name === "get_customer_summary"
      ? `${customer.name} (${customer.id}) is ${customer.status} with ${customer.openRequestCount} open request(s).`
      : JSON.stringify(customer);
    return { content: [{ type: "text", text }] };
  });

  return server;
}

async function startStdioServer() {
  await createMcpServer().connect(new StdioServerTransport());
}

async function startHttpServer() {
  const port = Number(process.env.PORT ?? "3000");
  const httpServer = createServer(async (request, response) => {
    console.error(`MCP HTTP request ${request.method} ${request.url}`);
    if (request.url === "/health" && request.method === "GET") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok", service: "customer-mcp" }));
      return;
    }

    // Copilot Studio may probe the server origin during connector creation;
    // accept the root as an alias while retaining the documented /mcp path.
    if (request.url !== "/mcp" && request.url !== "/") {
      response.writeHead(404);
      response.end();
      return;
    }

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-headers": "content-type, mcp-session-id, mcp-protocol-version",
        "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
        "access-control-allow-origin": "*",
      });
      response.end();
      return;
    }

    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-expose-headers", "Mcp-Session-Id");
    // The SDK's published types currently omit the explicit stateless option
    // under exactOptionalPropertyTypes, so keep this compatibility cast local.
    try {
      const transport = new StreamableHTTPServerTransport(
        { sessionIdGenerator: undefined } as never,
      );
      const server = createMcpServer();
      await server.connect(transport as never);
      await transport.handleRequest(request, response);
    } catch (error) {
      console.error("MCP HTTP request failed", error);
      if (!response.headersSent) {
        response.writeHead(500, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "mcp_request_failed" }));
      }
    }
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.error(`Customer MCP HTTP server listening on port ${port}`);
  });
}

if (process.env.MCP_TRANSPORT === "http") {
  await startHttpServer();
} else {
  await startStdioServer();
}
