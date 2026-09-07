import { join, resolve } from "node:path";
import { definitionId, listValue, readYamlDefinition, yamlFiles, type YamlDefinition } from "./definitions";

export interface AgentDefinition {
  id: string;
  version: string;
  path: string;
  description: string;
  inputs: string[];
  outputs: string[];
  referencedSkills: string[];
  permittedTools: string[];
  body: string;
}

function required(definition: YamlDefinition, key: string): string {
  const value = definition.frontMatter[key];
  if (typeof value !== "string" || !value) throw new Error(`Agent ${definition.path} is missing ${key}`);
  return value;
}

export function toAgentDefinition(definition: YamlDefinition): AgentDefinition {
  return {
    id: definitionId(definition),
    version: required(definition, "version"),
    path: definition.path,
    description: required(definition, "description"),
    inputs: listValue(definition, "inputs"),
    outputs: listValue(definition, "outputs"),
    referencedSkills: listValue(definition, "referenced-skills"),
    permittedTools: listValue(definition, "permitted-tools"),
    body: definition.body,
  };
}

export async function loadAgents(root: string): Promise<Map<string, AgentDefinition>> {
  const files = await yamlFiles(join(resolve(root), "agents"), ".agent.yaml");
  const agents = new Map<string, AgentDefinition>();
  for (const path of files) {
    const agent = toAgentDefinition(await readYamlDefinition(path));
    if (agents.has(agent.id)) throw new Error(`Duplicate agent ID: ${agent.id}`);
    agents.set(agent.id, agent);
  }
  return agents;
}
