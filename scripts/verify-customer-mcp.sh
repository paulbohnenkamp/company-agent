#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/verify-customer-mcp.sh [MCP_URL]

Verify health, MCP initialization, tools, known/missing lookups, and mutation refusal.
Provide the URL as the first argument or CUSTOMER_MCP_URL in the local .env file.
The URL may include or omit the /mcp suffix.
EOF
}

if [[ "${1:-}" == '--help' ]]; then usage; exit 0; fi
env_file="${CUSTOMER_MCP_ENV_FILE:-.env}"
if [[ -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
fi

mcp_url="${1:-${CUSTOMER_MCP_URL:-}}"
if [[ -z "$mcp_url" ]]; then
  echo "Provide the MCP URL as an argument or set CUSTOMER_MCP_URL in .env." >&2
  exit 2
fi
mcp_url="${mcp_url%/}"
if [[ "$mcp_url" != */mcp ]]; then mcp_url="${mcp_url}/mcp"; fi
health_url="${mcp_url%/mcp}/health"

echo '--- health ---'
curl --fail --silent --show-error "$health_url"
echo

post_json() {
  curl --fail --silent --show-error \
    -H 'content-type: application/json' \
    -H 'accept: application/json, text/event-stream' \
    -X POST "$mcp_url" \
    --data "$1"
  echo
}

echo '--- initialize ---'
post_json '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"deployment-script","version":"1.0.0"}}}'

echo '--- tools/list ---'
post_json '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

echo '--- known customer ---'
known="$(post_json '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"find_customer","arguments":{"customerId":"CUST-1001"}}}')"
printf '%s' "$known"
grep -q 'CUST-1001' <<<"$known"

echo '--- missing customer ---'
missing="$(post_json '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"find_customer","arguments":{"customerId":"CUST-9999"}}}')"
printf '%s' "$missing"
grep -q 'isError' <<<"$missing"

echo '--- mutation refusal ---'
mutation="$(post_json '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"update_customer","arguments":{"customerId":"CUST-1001","status":"Closed"}}}')"
printf '%s' "$mutation"
grep -q 'Unknown tool' <<<"$mutation"

echo 'Customer MCP verification passed.'
