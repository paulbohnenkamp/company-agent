import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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

await server.connect(new StdioServerTransport());
