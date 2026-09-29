#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/deploy-customer-mcp.sh [options]

Deploy the Customer MCP Azure boundary using values from the local .env file.

Options:
  --subscription ID       Azure subscription ID (default: current account)
  --resource-group NAME   Override AZURE_RESOURCE_GROUP from .env
  --location NAME         Override AZURE_LOCATION from .env
  --image-tag TAG         Build and deploy both images with TAG
  --api-image IMAGE       Use an existing API image and skip its build
  --mcp-image IMAGE       Use an existing MCP image and skip its build
  --create-foundation     Create the registry, workspace, and environment first
  --skip-build            Do not run az acr build; image values are required
  --what-if               Run Bicep what-if only; do not build or deploy
  --help                  Show this help
EOF
}

env_file="${CUSTOMER_MCP_ENV_FILE:-.env}"
if [[ -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
fi

subscription="${AZURE_SUBSCRIPTION_ID:-}"
resource_group="${AZURE_RESOURCE_GROUP:-}"
location="${AZURE_LOCATION:-}"
image_tag="$(date +%Y%m%d%H%M%S)"
api_image="${CUSTOMER_MCP_API_IMAGE:-}"
mcp_image="${CUSTOMER_MCP_IMAGE:-}"
api_image_provided=false
mcp_image_provided=false
create_foundation=false
manage_acr_pull=false
skip_build=false
what_if=false

while (($# > 0)); do
  case "$1" in
    --subscription) subscription="$2"; shift 2 ;;
    --resource-group) resource_group="$2"; shift 2 ;;
    --location) location="$2"; shift 2 ;;
    --image-tag) image_tag="$2"; shift 2 ;;
    --api-image) api_image="$2"; api_image_provided=true; shift 2 ;;
    --mcp-image) mcp_image="$2"; mcp_image_provided=true; shift 2 ;;
    --create-foundation) create_foundation=true; shift ;;
    --skip-build) skip_build=true; shift ;;
    --what-if) what_if=true; shift ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -n "$subscription" ]]; then
  az account set --subscription "$subscription"
fi

for required in resource_group location; do
  if [[ -z "${!required}" ]]; then
    echo "Missing $required. Set it in .env or pass the corresponding option." >&2
    exit 2
  fi
done

az group show --name "$resource_group" --output none

registry_name="${CUSTOMER_MCP_REGISTRY_NAME:-}"
environment_name="${CUSTOMER_MCP_ENVIRONMENT_NAME:-}"
workspace_name="${CUSTOMER_MCP_WORKSPACE_NAME:-}"
api_app_name="${CUSTOMER_MCP_API_APP_NAME:-}"
mcp_app_name="${CUSTOMER_MCP_APP_NAME:-}"
registry_server="${registry_name}.azurecr.io"

for required in registry_name environment_name workspace_name api_app_name mcp_app_name; do
  if [[ -z "${!required}" ]]; then
    echo "Missing $required. Set the matching CUSTOMER_MCP_* value in .env." >&2
    exit 2
  fi
done

if [[ "$skip_build" == true && ( -z "$api_image" || -z "$mcp_image" ) ]]; then
  echo "--skip-build requires both --api-image and --mcp-image." >&2
  exit 2
fi

if [[ -z "$api_image" ]]; then
  api_image="${registry_server}/customer-api:${image_tag}"
fi
if [[ -z "$mcp_image" ]]; then
  mcp_image="${registry_server}/customer-mcp:${image_tag}"
fi

for provider in Microsoft.App Microsoft.ContainerRegistry Microsoft.OperationalInsights; do
  state="$(az provider show --namespace "$provider" --query registrationState --output tsv)"
  if [[ "$state" != 'Registered' ]]; then
    if [[ "$what_if" == true ]]; then
      echo "Provider $provider is $state; what-if will not register providers." >&2
      exit 1
    fi
    az provider register --namespace "$provider" --wait
  fi
done

if [[ "$create_foundation" == true ]]; then
  manage_acr_pull=true
  if az acr show --name "$registry_name" --resource-group "$resource_group" --output none 2>/dev/null || \
     az containerapp env show --name "$environment_name" --resource-group "$resource_group" --output none 2>/dev/null; then
    echo "Foundation resource already exists; refusing to rerun --create-foundation." >&2
    exit 1
  fi

  az deployment group create \
    --resource-group "$resource_group" \
    --template-file infra/customer-mcp/foundation.bicep \
    --parameters location="$location" containerRegistryName="$registry_name" \
      environmentName="$environment_name" logAnalyticsWorkspaceName="$workspace_name" \
    --output none
fi

if [[ "$what_if" == true ]]; then
  az deployment group what-if \
    --resource-group "$resource_group" \
    --template-file infra/customer-mcp/main.bicep \
    --parameters containerRegistryName="$registry_name" environmentName="$environment_name" \
      apiAppName="$api_app_name" mcpAppName="$mcp_app_name" \
      apiImage="$api_image" mcpImage="$mcp_image" \
      manageAcrPullAssignments="$manage_acr_pull"
  exit 0
fi

if [[ "$skip_build" == false ]]; then
  if [[ "$api_image_provided" == false ]]; then
    az acr build --registry "$registry_name" --image "customer-api:${image_tag}" --file customer-app/Dockerfile .
  fi
  if [[ "$mcp_image_provided" == false ]]; then
    az acr build --registry "$registry_name" --image "customer-mcp:${image_tag}" --file customer-mcp/Dockerfile .
  fi
fi

az deployment group create \
  --resource-group "$resource_group" \
  --template-file infra/customer-mcp/main.bicep \
  --parameters containerRegistryName="$registry_name" environmentName="$environment_name" \
    apiAppName="$api_app_name" mcpAppName="$mcp_app_name" \
    apiImage="$api_image" mcpImage="$mcp_image" \
    manageAcrPullAssignments="$manage_acr_pull" \
  --query properties.outputs --output json

mcp_fqdn="$(az containerapp show --name "$mcp_app_name" --resource-group "$resource_group" --query properties.configuration.ingress.fqdn --output tsv)"
cat <<EOF

Copilot Studio values:
Server name: Customer MCP
Server description: Read-only customer and account lookup tools backed by the existing synthetic customer API. Returns only verified customer data and does not change customer state.
Server URL: https://${mcp_fqdn}/mcp
Authentication: None
EOF
