export type RequestType = "Hardware" | "Software" | "Access" | "Other";

export type RawRequest = {
  employeeName: string;
  requestType: RequestType;
  description: string;
  isUrgent: boolean;
};

export type NormalizedRequest = RawRequest;

export function normalizeRequest(input: RawRequest): NormalizedRequest {
  const normalized = {
    employeeName: input.employeeName.trim(),
    requestType: input.requestType,
    description: input.description.trim(),
    isUrgent: input.isUrgent,
  };

  if (normalized.employeeName.length === 0) throw new Error("employeeName is required");
  if (normalized.description.length === 0) throw new Error("description is required");
  if (!["Hardware", "Software", "Access", "Other"].includes(normalized.requestType)) {
    throw new Error("requestType must be Hardware, Software, Access, or Other");
  }
  if (typeof normalized.isUrgent !== "boolean") throw new Error("isUrgent must be a Boolean");

  return normalized;
}

export function serviceRequestIdFromSharePointItemId(itemId: number): string {
  if (!Number.isInteger(itemId) || itemId < 1) throw new Error("SharePoint item ID must be a positive integer");
  return `SR-${itemId.toString().padStart(3, "0")}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const example: RawRequest = {
    employeeName: "  Alex Morgan ",
    requestType: "Access",
    description: "  Need access to the customer support portal. ",
    isUrgent: false,
  };
  console.log(JSON.stringify(normalizeRequest(example), null, 2));
}
