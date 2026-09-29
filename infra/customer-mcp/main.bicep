targetScope = 'resourceGroup'

@description('Existing Container Registry containing the API and MCP images.')
param containerRegistryName string
@description('Existing Container Apps environment for this demo.')
param environmentName string
@description('Container App name for the private customer API.')
param apiAppName string
@description('Container App name for the public MCP endpoint.')
param mcpAppName string
@description('Full API image reference, including an immutable tag.')
param apiImage string
@description('Full MCP image reference, including an immutable tag.')
param mcpImage string
@description('Create deterministic ACR pull assignments. Keep false when adopting an existing Container Apps foundation.')
param manageAcrPullAssignments bool = false
@description('Common resource tags.')
param tags object = {
  purpose: 'company-agent-customer-mcp'
  environment: 'demo'
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}
resource environment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {
  name: environmentName
}

var acrPullRoleDefinitionId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  '7f951dda-4ed3-4680-a7ca-43fe172d538d'
)
var apiInternalUrl = format('http://{0}.internal.{1}', apiAppName, environment.properties.defaultDomain)

resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: apiAppName
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  tags: union(tags, { component: 'api' })
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        transport: 'http'
        targetPort: 8080
        allowInsecure: false
      }
      registries: [
        {
          server: registry.properties.loginServer
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: apiAppName
          image: apiImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'ASPNETCORE_URLS'
              value: 'http://0.0.0.0:8080'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

resource apiAcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (manageAcrPullAssignments) {
  name: guid(registry.id, apiApp.id, acrPullRoleDefinitionId)
  scope: registry
  properties: {
    principalId: apiApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: acrPullRoleDefinitionId
  }
}

resource mcpApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: mcpAppName
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  tags: union(tags, { component: 'mcp' })
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        transport: 'http'
        targetPort: 3000
        allowInsecure: false
      }
      registries: [
        {
          server: registry.properties.loginServer
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: mcpAppName
          image: mcpImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'MCP_TRANSPORT'
              value: 'http'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'CUSTOMER_API_URL'
              value: apiInternalUrl
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

resource mcpAcrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (manageAcrPullAssignments) {
  name: guid(registry.id, mcpApp.id, acrPullRoleDefinitionId)
  scope: registry
  properties: {
    principalId: mcpApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: acrPullRoleDefinitionId
  }
}

output mcpFqdn string = mcpApp.properties.configuration.ingress.fqdn
output mcpUrl string = format('https://{0}/mcp', mcpApp.properties.configuration.ingress.fqdn)
output apiInternalUrl string = apiInternalUrl
