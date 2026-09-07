#!/usr/bin/env bash
set -euo pipefail

# Azure App Service uses a documented set of outbound IPs. Allow only those
# addresses to reach Azure SQL; do not use the broad 0.0.0.0 Azure-services
# rule. The list can change when the hosting plan changes, so rerun this during
# deployment and review stale rules during infrastructure maintenance.

resource_group="${1:?usage: configure-azure-sql-firewall.sh <resource-group> <sql-server> <api-app-service> }"
server="${2:?missing SQL server name}"
app="${3:?missing API App Service name}"

outbound_ips="$(az webapp show -g "${resource_group}" -n "${app}" --query outboundIpAddresses -o tsv)"
if [[ -z "${outbound_ips}" ]]; then
  echo "No App Service outbound IPs were returned." >&2
  exit 1
fi

IFS=',' read -r -a ip_list <<< "${outbound_ips}"
for ip in "${ip_list[@]}"; do
  rule_name="appservice-${ip//./-}"
  az sql server firewall-rule create -g "${resource_group}" -s "${server}" -n "${rule_name}" --start-ip-address "${ip}" --end-ip-address "${ip}" -o none
done
echo "Configured ${#ip_list[@]} narrow App Service SQL firewall rules."
