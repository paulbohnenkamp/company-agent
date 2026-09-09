targetScope = 'resourceGroup'

// Mountaineer is isolated in its own resource group. Resource names use the
// Mountaineer deployment prefix; LandOps remains a compatibility identifier in
// the application and historical records.

@description('The deployment location.')
param location string = resourceGroup().location
@description('The AZD environment name.')
param environmentName string = 'dev'
@description('The object ID of the Entra user who will administer Azure SQL.')
param sqlAdminObjectId string
@description('The display name of the Entra SQL administrator.')
param sqlAdminLogin string = 'LandOps SQL Administrator'
@description('The existing Foundry/Azure AI account resource group.')
param existingFoundryResourceGroupName string = 'rg-land-ai-engineering-foundry'
@description('The existing Foundry/Azure AI account name.')
param existingFoundryAccountName string = 'ai-account-7b7o3sct37fgg'
@description('The existing model deployment name.')
param foundryModelName string = 'land-model'
@description('Optional Entra API client ID used by the API JWT validation. v2 access tokens use the API client GUID as aud.')
param entraAudience string = ''
@description('The existing API container image tag supplied by AZD.')
param serviceApiImageName string = ''

var suffix = uniqueString(subscription().id, resourceGroup().id)
var shortSuffix = toLower(substring(suffix, 0, 8))
var prefix = 'mountaineer-${shortSuffix}'
var apiName = '${prefix}-api'
var planName = '${prefix}-plan'
var registryName = replace('${prefix}cr', '-', '')
var sqlServerName = '${prefix}-sql'
var databaseName = 'Mountaineer'
var storageName = replace('${prefix}stg', '-', '')
var keyVaultName = '${prefix}-kv'
var insightsName = '${prefix}-insights'
var apiImage = !empty(serviceApiImageName) ? serviceApiImageName : '${registryName}.azurecr.io/mountaineer-api:latest'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${prefix}-logs'
  location: location
  properties: { retentionInDays: 30 }
  // Bicep's current type metadata omits the documented workspace SKU field.
  #disable-next-line BCP187
  sku: { name: 'PerGB2018' }
}

resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: registryName
  location: location
  sku: { name: 'Basic' }
  properties: { adminUserEnabled: false }
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: { name: 'B1', tier: 'Basic', size: 'B1', family: 'B', capacity: 1 }
  properties: { reserved: true }
}

// User-assigned identities make the external permissions stable across App
// Service restarts and deployments. App Service uses the client IDs below for
// ACR image pulls; the API identity is also the SQL and Foundry workload identity.
resource apiIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${apiName}-id'
  location: location
}

resource api 'Microsoft.Web/sites@2023-12-01' = {
  name: apiName
  location: location
  kind: 'app,linux,container'
  identity: { type: 'UserAssigned', userAssignedIdentities: { '${apiIdentity.id}': {} } }
  tags: { 'azd-env-name': environmentName, 'azd-service-name': 'api' }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${apiImage}'
      alwaysOn: true
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: apiIdentity.properties.clientId
      appSettings: [
        { name: 'WEBSITES_PORT', value: '8080' }
        { name: 'ASPNETCORE_HTTP_PORTS', value: '8080' }
        { name: 'PORT', value: '8080' }
        { name: 'WEBSITES_CONTAINER_START_TIME_LIMIT', value: '1800' }
        { name: 'BusinessAgent__IdentityMode', value: 'entra' }
        { name: 'BusinessAgent__WorkroomPersistence', value: 'sql' }
        { name: 'BusinessAgent__WorkroomExecutionProvider', value: 'foundry' }
        { name: 'BusinessAgent__ConversationProvider', value: 'foundry' }
        { name: 'BusinessAgent__ApplyMigrations', value: 'false' }
        { name: 'LandOps__IdentityMode', value: 'entra' }
        { name: 'LandOps__WorkroomPersistence', value: 'sql' }
        { name: 'LandOps__WorkroomExecutionProvider', value: 'foundry' }
        { name: 'LandOps__ConversationProvider', value: 'foundry' }
        // Schema changes run as an explicit deployment step, not as the
        // least-privileged runtime identity during every container startup.
        { name: 'LandOps__ApplyMigrations', value: 'false' }
        { name: 'Entra__TenantId', value: subscription().tenantId }
        #disable-next-line no-hardcoded-env-urls
        { name: 'Entra__Authority', value: 'https://login.microsoftonline.com/${subscription().tenantId}/v2.0' }
        { name: 'Entra__Audience', value: entraAudience }
        { name: 'Foundry__Endpoint', value: foundry.properties.endpoint }
        { name: 'Foundry__Model', value: foundryModelName }
        { name: 'Foundry__UseManagedIdentity', value: 'true' }
        { name: 'Foundry__Scope', value: 'https://cognitiveservices.azure.com/.default' }
        { name: 'AZURE_CLIENT_ID', value: apiIdentity.properties.clientId }
        // Azure SQL's public hostname is stable across Azure clouds for this deployment target.
        #disable-next-line no-hardcoded-env-urls
        { name: 'ConnectionStrings__LandOps', value: 'Server=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=${databaseName};Authentication=Active Directory Managed Identity;User Id=${apiIdentity.properties.clientId};Encrypt=True;TrustServerCertificate=False;' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: insights.properties.ConnectionString }
      ]
    }
  }
}

resource registryApiPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, apiIdentity.id, 'AcrPull')
  scope: registry
  properties: { roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d'), principalId: apiIdentity.properties.principalId, principalType: 'ServicePrincipal' }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: { allowBlobPublicAccess: false, minimumTlsVersion: 'TLS1_2' }
}
resource blobReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, apiIdentity.id, 'StorageBlobDataReader')
  scope: storage
  properties: { roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1'), principalId: apiIdentity.properties.principalId, principalType: 'ServicePrincipal' }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: { tenantId: subscription().tenantId, enableRbacAuthorization: true, publicNetworkAccess: 'Enabled', sku: { family: 'A', name: 'standard' }, softDeleteRetentionInDays: 7 }
}
resource keyVaultSecrets 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, apiIdentity.id, 'KeyVaultSecretsUser')
  scope: keyVault
  properties: { roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6'), principalId: apiIdentity.properties.principalId, principalType: 'ServicePrincipal' }
}

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administrators: { administratorType: 'ActiveDirectory', azureADOnlyAuthentication: true, login: sqlAdminLogin, sid: sqlAdminObjectId, tenantId: subscription().tenantId }
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: { name: 'Basic', tier: 'Basic', capacity: 5 }
  properties: { collation: 'SQL_Latin1_General_CP1_CI_AS' }
}
resource foundry 'Microsoft.CognitiveServices/accounts@2025-06-01' existing = {
  name: existingFoundryAccountName
  scope: resourceGroup(existingFoundryResourceGroupName)
}
module foundryUser 'modules/foundry-role.bicep' = {
  name: 'foundry-api-user-role'
  scope: resourceGroup(existingFoundryResourceGroupName)
  params: {
    foundryAccountName: existingFoundryAccountName
    principalId: apiIdentity.properties.principalId
  }
}

output apiUrl string = 'https://${api.properties.defaultHostName}'
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = registry.properties.loginServer
output foundryEndpoint string = foundry.properties.endpoint
output sqlServerName string = sqlServer.name
output keyVaultName string = keyVault.name
output apiManagedIdentityPrincipalId string = apiIdentity.properties.principalId
