#!/usr/bin/env bash
set -euo pipefail

# Creates the contained SQL user that Entra-only Azure SQL needs after the
# API's managed identity exists. ARM role assignments do not grant database
# data access, so this explicit bootstrap is part of deployment verification.
# It requires sqlcmd with Entra access-token support and an authenticated az CLI.

resource_group="${1:?usage: bootstrap-azure-sql-identity.sh <resource-group> <server> <database> <principal-id> <principal-name>}"
server="${2:?missing server name}"
database="${3:?missing database name}"
principal_id="${4:?missing API managed-identity object ID}"
principal_name="${5:?missing API managed-identity display name}"

sqlcmd -S "${server}.database.windows.net" -d "${database}" -G -Q "IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = '${principal_name}') BEGIN CREATE USER [${principal_name}] FROM EXTERNAL PROVIDER WITH OBJECT_ID='${principal_id}'; ALTER ROLE db_datareader ADD MEMBER [${principal_name}]; ALTER ROLE db_datawriter ADD MEMBER [${principal_name}]; END"
verified="$(sqlcmd -S "${server}.database.windows.net" -d "${database}" -G -h -1 -W -Q "SELECT COUNT(*) FROM sys.database_principals WHERE name = '${principal_name}'" | awk '/^[[:space:]]*1[[:space:]]*$/ {print 1; exit}')"
if [[ "${verified}" != "1" ]]; then
  echo "SQL bootstrap did not verify contained user ${principal_name}." >&2
  exit 1
fi
echo "Configured contained Entra SQL user ${principal_name} (${principal_id}) with reader/writer access in ${database}."
