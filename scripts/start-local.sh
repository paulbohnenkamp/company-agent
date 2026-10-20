#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-${ROOT_DIR}/.venv/bin/python}"
LOG_DIR="${LOG_DIR:-/tmp/company-agent-logs}"
RUN_TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
PIDS=()

cleanup() {
  trap - EXIT INT TERM
  for pid in "${PIDS[@]:-}"; do
    kill "${pid}" 2>/dev/null || true
  done
  for pid in "${PIDS[@]:-}"; do
    wait "${pid}" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

if [[ ! -x "${PYTHON_BIN}" ]]; then
  echo "Missing ${PYTHON_BIN}. Create the virtual environment first." >&2
  exit 1
fi
if ! command -v dotnet >/dev/null 2>&1; then
  echo "dotnet is required to start customer-app." >&2
  exit 1
fi

cd "${ROOT_DIR}"
mkdir -p "${LOG_DIR}"
"${PYTHON_BIN}" -m pipeline_historian_mcp.simulator
"${PYTHON_BIN}" -m land_admin_mcp.bootstrap

start_process() {
  local label="$1"
  shift
  echo "Starting ${label}"
  "$@" >"${LOG_DIR}/company-agent-${label}-${RUN_TIMESTAMP}.log" 2>&1 &
  PIDS+=("$!")
}

start_process customer-app dotnet run --project customer-app/CustomerApp.csproj --urls http://localhost:5080
start_process customer-mcp env CUSTOMER_API_URL=http://localhost:5080 MCP_TRANSPORT=http PORT=3000 "${ROOT_DIR}/.venv/bin/customer-mcp"
start_process pipeline-mcp "${PYTHON_BIN}" -m pipeline_historian_mcp.server
start_process land-admin-mcp "${PYTHON_BIN}" -m land_admin_mcp.server

echo "Local services are running. Logs: ${LOG_DIR}/company-agent-*-${RUN_TIMESTAMP}.log. Press Ctrl+C to stop all services."
wait
