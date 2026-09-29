using './main.bicep'

param containerRegistryName = 'acrnorthstarcust'
param environmentName = 'cae-northstar-customer'
param apiAppName = 'ca-northstar-customer-api'
param mcpAppName = 'ca-northstar-customer-mcp'
param apiImage = 'acrnorthstarcust.azurecr.io/customer-api:20260929'
param mcpImage = 'acrnorthstarcust.azurecr.io/customer-mcp:20260929-3'
