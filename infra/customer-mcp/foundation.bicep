targetScope = 'resourceGroup'

@description('Azure region for the demo resources.')
param location string = resourceGroup().location
@description('Container Registry name. Must be globally unique.')
param containerRegistryName string
@description('Container Apps environment name.')
param environmentName string
@description('Log Analytics workspace name.')
param logAnalyticsWorkspaceName string
@description('Common resource tags.')
param tags object = {
  purpose: 'company-agent-customer-mcp'
  environment: 'demo'
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
  sku: {
    name: 'PerGB2018'
  }
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

output registryLoginServer string = registry.properties.loginServer
output environmentDefaultDomain string = environment.properties.defaultDomain
