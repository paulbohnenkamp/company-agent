import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { parse as parseYaml } from "yaml";

export type ConfigIssue = {
  code: string;
  message: string;
  file: string;
  path: string;
};

export type ProductCatalog = {
  schemaVersion: 1;
  product: { key: string; version: string; displayName: string; rootAgent: string };
  packages: Record<string, PackageDefinition>;
  agents: Record<string, AgentDefinition>;
  contracts: Record<string, ContractDefinition>;
  resources: Record<string, ResourceDefinition>;
  operations: Record<string, OperationDefinition>;
  solutions: Record<string, SolutionDefinition>;
};

export type PackageDefinition = {
  key: string;
  path: string;
  catalogPath: string;
  capabilities: Set<string>;
};

export type AgentDefinition = {
  key: string;
  source: string;
  package?: string;
  children: string[];
};

export type ContractOperation = {
  key: string;
  request: string;
  response: string;
};

export type ContractDefinition = {
  key: string;
  version: string;
  source: string;
  operations: Record<string, ContractOperation>;
};

export type ImplementationDefinition = {
  kind: "product-managed" | "customer-supplied" | "pre-existing";
  source: string;
};

export type ResourceDefinition = {
  key: string;
  contract: string;
  implementation: ImplementationDefinition;
};

export type OperationDefinition = {
  key: string;
  package: string;
  capability: string;
  resource: string;
  contractOperation: string;
};

export type SolutionDefinition = {
  key: string;
  kind: "resource" | "agent";
  dependsOn: string[];
};

export type GraphNode = {
  id: string;
  kind: "package" | "capability" | "operation" | "resource" | "contract" | "implementation" | "agent" | "solution";
};

export type GraphEdge = {
  from: string;
  to: string;
  kind: string;
  file: string;
  path: string;
};

export type DependencyGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  reverseDependencies: Record<string, string[]>;
  solutionOrder: string[];
  resourceReferenceCounts: Record<string, number>;
};

export type LoadedConfiguration = {
  catalog: ProductCatalog;
  graph: DependencyGraph;
  sourceFiles: string[];
};

export type PlanAction = {
  id: string;
  kind: "connector-binding" | "connection-reference-placeholder" | "environment-variable-placeholder" | "solution-import";
  key: string;
  dependsOn: string[];
  mutation: "none";
  reason: string;
};

export type DeploymentPlan = {
  schemaVersion: 1;
  productKey: string;
  environmentKey: string;
  desiredStateHash: string;
  planHash: string;
  actions: PlanAction[];
};

export type DeploymentState = {
  schemaVersion: 1;
  productKey: string;
  environmentKey: string;
  desiredStateHash: string;
  planHash: string;
  phase: "loaded" | "validated" | "planned" | "blocked";
  actions: Record<string, { status: "planned" | "blocked"; mutation: "none" }>;
  observed: Record<string, never>;
};

export type EnvironmentResourceBinding = {
  resourceKey: string;
  implementation: ImplementationDefinition["kind"];
  connectionReferenceKey: string;
  endpointRef?: string;
};

export type EnvironmentBinding = {
  schemaVersion: 1;
  environmentKey: string;
  powerPlatform: {
    environmentIdRef: string;
    solutionSettingsFile: string;
  };
  resources: Record<string, EnvironmentResourceBinding>;
};

export type ReleaseMode = "bootstrap" | "release";

export type LifecycleAction = {
  id: string;
  kind: "authentication-prerequisite" | "settings-resolution" | "solution-build" | "solution-import" | "publish" | "rollback-selection" | "cleanup-candidate";
  key: string;
  dependsOn: string[];
  mutation: "none";
  reason: string;
};

export type LifecyclePlan = {
  schemaVersion: 1;
  mode: ReleaseMode;
  basePlan: DeploymentPlan;
  environmentBinding: EnvironmentBinding;
  actions: LifecycleAction[];
  rollbackTarget?: string;
};

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const KEY = /^[a-z][A-Za-z0-9]*(?:[-_][a-z0-9]+)*$/;
const SECRET_KEY = /(secret|password|token|credential|privatekey|clientsecret)/i;

export class ConfigurationError extends Error {
  public constructor(public readonly issues: ConfigIssue[]) {
    super(issues.map((issue) => `${issue.code}: ${issue.file}:${issue.path}: ${issue.message}`).join("\n"));
    this.name = "ConfigurationError";
  }
}

function issue(code: string, message: string, file: string, path: string): ConfigIssue {
  return { code, message, file, path };
}

function objectValue(value: unknown, file: string, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ConfigurationError([issue("invalid-object", "expected an object", file, path)]);
  }
  return Object.fromEntries(Object.entries(value));
}

function requiredString(value: unknown, name: string, file: string, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ConfigurationError([issue("required-string", `${name} must be a non-empty string`, file, path)]);
  }
  return value;
}

function optionalString(value: unknown, name: string, file: string, path: string): string | undefined {
  if (value === undefined) return undefined;
  return requiredString(value, name, file, path);
}

function stringArray(value: unknown, name: string, file: string, path: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new ConfigurationError([issue("string-array", `${name} must be an array of strings`, file, path)]);
  }
  return [...value];
}

function mapValue(value: unknown, name: string, file: string, path: string): Record<string, unknown> {
  if (value === undefined) return {};
  try {
    return objectValue(value, file, path);
  } catch (error) {
    if (error instanceof ConfigurationError) throw error;
    throw new ConfigurationError([issue("invalid-map", `${name} must be an object map`, file, path)]);
  }
}

function parseDocument(source: string, file: string): unknown {
  try {
    const document = parseYaml(source, { uniqueKeys: true });
    const secretPath = findSecretKey(document, "$");
    if (secretPath) throw new ConfigurationError([issue("secret-shaped-value", "configuration must not contain credential material", file, secretPath)]);
    return document;
  } catch (error) {
    if (error instanceof ConfigurationError) throw error;
    throw new ConfigurationError([issue("yaml-parse", error instanceof Error ? error.message : "invalid YAML", file, "$")]);
  }
}

function findSecretKey(value: unknown, path: string): string | undefined {
  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      const found = findSecretKey(entry, `${path}[${index}]`);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof value !== "object" || value === null) return undefined;
  for (const [key, entry] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (SECRET_KEY.test(key)) return childPath;
    const found = findSecretKey(entry, childPath);
    if (found) return found;
  }
  return undefined;
}

function assertInside(root: string, target: string, file: string, path: string): void {
  const relativePath = relative(root, target);
  if (isAbsolute(relativePath) || relativePath === ".." || relativePath.startsWith(`..${sep}`)) {
    throw new ConfigurationError([issue("path-escape", "referenced path must remain inside the repository root", file, path)]);
  }
}

async function existingPath(path: string, file: string, fieldPath: string): Promise<void> {
  try {
    await access(path);
  } catch {
    throw new ConfigurationError([issue("missing-path", "referenced path does not exist", file, fieldPath)]);
  }
}

function sortedEntries<T>(value: Record<string, T>): Array<[string, T]> {
  return Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value instanceof Set) return [...value].sort().map(canonicalize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function sha256(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function checkKey(key: string, file: string, path: string, issues: ConfigIssue[]): void {
  if (!KEY.test(key)) issues.push(issue("invalid-key", "must use lowercase kebab-case, snake_case, or lower camel case", file, path));
}

function checkSemver(value: string, file: string, path: string, issues: ConfigIssue[]): void {
  if (!SEMVER.test(value)) issues.push(issue("invalid-version", "must use SemVer", file, path));
}

function detectCycle(nodes: string[], edges: Array<{ from: string; to: string }>): string[] | undefined {
  const outgoing = new Map<string, string[]>();
  for (const node of nodes) outgoing.set(node, []);
  for (const edge of edges) outgoing.get(edge.from)?.push(edge.to);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const visit = (node: string): string[] | undefined => {
    if (visiting.has(node)) return [...stack.slice(stack.indexOf(node)), node];
    if (visited.has(node)) return undefined;
    visiting.add(node);
    stack.push(node);
    for (const child of outgoing.get(node) ?? []) {
      const cycle = visit(child);
      if (cycle) return cycle;
    }
    stack.pop();
    visiting.delete(node);
    visited.add(node);
    return undefined;
  };
  for (const node of [...nodes].sort()) {
    const cycle = visit(node);
    if (cycle) return cycle;
  }
  return undefined;
}

function topologicalOrder(nodes: string[], edges: Array<{ from: string; to: string }>): string[] {
  const incoming = new Map(nodes.map((node) => [node, 0]));
  const outgoing = new Map(nodes.map((node) => [node, [] as string[]]));
  for (const edge of edges) {
    outgoing.get(edge.from)?.push(edge.to);
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
  }
  const ready = nodes.filter((node) => incoming.get(node) === 0).sort();
  const result: string[] = [];
  while (ready.length > 0) {
    const node = ready.shift();
    if (!node) continue;
    result.push(node);
    for (const child of [...(outgoing.get(node) ?? [])].sort()) {
      const count = (incoming.get(child) ?? 0) - 1;
      incoming.set(child, count);
      if (count === 0) ready.push(child);
    }
    ready.sort();
  }
  return result;
}

function parseImplementation(value: unknown, file: string, path: string): ImplementationDefinition {
  const raw = objectValue(value, file, path);
  const kind = requiredString(raw.kind, "implementation.kind", file, `${path}.kind`);
  if (kind !== "product-managed" && kind !== "customer-supplied" && kind !== "pre-existing") {
    throw new ConfigurationError([issue("invalid-implementation-kind", "unsupported implementation kind", file, `${path}.kind`)]);
  }
  return { kind, source: requiredString(raw.source, "implementation.source", file, `${path}.source`) };
}

export async function loadProductConfiguration(options: { catalogPath: string; repositoryRoot?: string }): Promise<LoadedConfiguration> {
  const repositoryRoot = resolve(options.repositoryRoot ?? process.cwd());
  const catalogPath = resolve(options.catalogPath);
  assertInside(repositoryRoot, catalogPath, options.catalogPath, "$");
  const sourceFiles = new Set<string>([catalogPath]);
  const catalogRaw = objectValue(parseDocument(await readFile(catalogPath, "utf8"), catalogPath), catalogPath, "$");
  if (catalogRaw.schemaVersion !== 1) throw new ConfigurationError([issue("schema-version", "schemaVersion must be 1", catalogPath, "$.schemaVersion")]);
  const productRaw = objectValue(catalogRaw.product, catalogPath, "$.product");
  const product = {
    key: requiredString(productRaw.key, "product.key", catalogPath, "$.product.key"),
    version: requiredString(productRaw.version, "product.version", catalogPath, "$.product.version"),
    displayName: requiredString(productRaw.displayName, "product.displayName", catalogPath, "$.product.displayName"),
    rootAgent: requiredString(productRaw.rootAgent, "product.rootAgent", catalogPath, "$.product.rootAgent"),
  };

  const packageMap = mapValue(catalogRaw.packages, "packages", catalogPath, "$.packages");
  const packages: Record<string, PackageDefinition> = {};
  for (const [key, value] of sortedEntries(packageMap)) {
    const raw = objectValue(value, catalogPath, `$.packages.${key}`);
    const pathValue = requiredString(raw.path, "package.path", catalogPath, `$.packages.${key}.path`);
    const packagePath = resolve(resolve(catalogPath, ".."), pathValue);
    assertInside(repositoryRoot, packagePath, catalogPath, `$.packages.${key}.path`);
    const catalogFile = resolve(packagePath, "catalog.yaml");
    await existingPath(catalogFile, catalogPath, `$.packages.${key}.path`);
    sourceFiles.add(catalogFile);
    const departmentRaw = objectValue(parseDocument(await readFile(catalogFile, "utf8"), catalogFile), catalogFile, "$");
    const capabilities = new Set<string>(stringArray(departmentRaw.capabilities, "capabilities", catalogFile, "$.capabilities"));
    for (const kind of ["skills", "flows"] as const) {
      const listed = departmentRaw[kind];
      const entries = Array.isArray(listed) ? listed : Object.values(mapValue(listed, kind, catalogFile, `$.${kind}`));
      for (const entry of entries) {
        if (typeof entry === "object" && entry !== null && !Array.isArray(entry)) {
          const entryObject = Object.fromEntries(Object.entries(entry));
          if (typeof entryObject.id === "string") capabilities.add(entryObject.id);
        }
      }
    }
    packages[key] = { key, path: packagePath, catalogPath: catalogFile, capabilities };
  }

  const agentMap = mapValue(catalogRaw.agents, "agents", catalogPath, "$.agents");
  const agents: Record<string, AgentDefinition> = {};
  for (const [key, value] of sortedEntries(agentMap)) {
    const raw = objectValue(value, catalogPath, `$.agents.${key}`);
    agents[key] = {
      key,
      source: resolve(resolve(catalogPath, ".."), requiredString(raw.source, "agent.source", catalogPath, `$.agents.${key}.source`)),
      package: optionalString(raw.package, "agent.package", catalogPath, `$.agents.${key}.package`),
      children: stringArray(raw.children, "agent.children", catalogPath, `$.agents.${key}.children`),
    };
    assertInside(repositoryRoot, agents[key].source, catalogPath, `$.agents.${key}.source`);
    await existingPath(agents[key].source, catalogPath, `$.agents.${key}.source`);
    sourceFiles.add(agents[key].source);
  }

  const contractMap = mapValue(catalogRaw.contracts, "contracts", catalogPath, "$.contracts");
  const contracts: Record<string, ContractDefinition> = {};
  for (const [key, value] of sortedEntries(contractMap)) {
    const raw = objectValue(value, catalogPath, `$.contracts.${key}`);
    const source = resolve(resolve(catalogPath, ".."), requiredString(raw.source, "contract.source", catalogPath, `$.contracts.${key}.source`));
    assertInside(repositoryRoot, source, catalogPath, `$.contracts.${key}.source`);
    await existingPath(source, catalogPath, `$.contracts.${key}.source`);
    sourceFiles.add(source);
    const contractRaw = objectValue(parseDocument(await readFile(source, "utf8"), source), source, "$");
    const operationMap = mapValue(contractRaw.operations, "contract.operations", source, "$.operations");
    const operations: Record<string, ContractOperation> = {};
    for (const [operationKey, operationValue] of sortedEntries(operationMap)) {
      const operationRaw = objectValue(operationValue, source, `$.operations.${operationKey}`);
      operations[operationKey] = {
        key: operationKey,
        request: requiredString(operationRaw.request, "operation.request", source, `$.operations.${operationKey}.request`),
        response: requiredString(operationRaw.response, "operation.response", source, `$.operations.${operationKey}.response`),
      };
    }
    contracts[key] = { key, version: requiredString(raw.version, "contract.version", catalogPath, `$.contracts.${key}.version`), source, operations };
  }

  const resourceMap = mapValue(catalogRaw.resources, "resources", catalogPath, "$.resources");
  const resources: Record<string, ResourceDefinition> = {};
  for (const [key, value] of sortedEntries(resourceMap)) {
    const raw = objectValue(value, catalogPath, `$.resources.${key}`);
    resources[key] = {
      key,
      contract: requiredString(raw.contract, "resource.contract", catalogPath, `$.resources.${key}.contract`),
      implementation: parseImplementation(raw.implementation, catalogPath, `$.resources.${key}.implementation`),
    };
    const implementationSource = resolve(resolve(catalogPath, ".."), resources[key].implementation.source);
    assertInside(repositoryRoot, implementationSource, catalogPath, `$.resources.${key}.implementation.source`);
    await existingPath(implementationSource, catalogPath, `$.resources.${key}.implementation.source`);
    sourceFiles.add(implementationSource);
  }

  const operationMap = mapValue(catalogRaw.operations, "operations", catalogPath, "$.operations");
  const operations: Record<string, OperationDefinition> = {};
  for (const [key, value] of sortedEntries(operationMap)) {
    const raw = objectValue(value, catalogPath, `$.operations.${key}`);
    operations[key] = {
      key,
      package: requiredString(raw.package, "operation.package", catalogPath, `$.operations.${key}.package`),
      capability: requiredString(raw.capability, "operation.capability", catalogPath, `$.operations.${key}.capability`),
      resource: requiredString(raw.resource, "operation.resource", catalogPath, `$.operations.${key}.resource`),
      contractOperation: requiredString(raw.contractOperation, "operation.contractOperation", catalogPath, `$.operations.${key}.contractOperation`),
    };
  }

  const solutionMap = mapValue(catalogRaw.solutions, "solutions", catalogPath, "$.solutions");
  const solutions: Record<string, SolutionDefinition> = {};
  for (const [key, value] of sortedEntries(solutionMap)) {
    const raw = objectValue(value, catalogPath, `$.solutions.${key}`);
    const kind = requiredString(raw.kind, "solution.kind", catalogPath, `$.solutions.${key}.kind`);
    if (kind !== "resource" && kind !== "agent") throw new ConfigurationError([issue("invalid-solution-kind", "solution kind must be resource or agent", catalogPath, `$.solutions.${key}.kind`)]);
    const solutionKey = requiredString(raw.key, "solution.key", catalogPath, `$.solutions.${key}.key`);
    if (solutions[solutionKey]) throw new ConfigurationError([issue("duplicate-key", `duplicate solution key ${solutionKey}`, catalogPath, `$.solutions.${key}.key`)]);
    solutions[solutionKey] = { key: solutionKey, kind, dependsOn: stringArray(raw.dependsOn, "solution.dependsOn", catalogPath, `$.solutions.${key}.dependsOn`) };
  }

  const catalog: ProductCatalog = { schemaVersion: 1, product, packages, agents, contracts, resources, operations, solutions };
  const issues = validateConfiguration(catalog, catalogPath, repositoryRoot);
  if (issues.length > 0) throw new ConfigurationError(issues);
  const graph = buildDependencyGraph(catalog, catalogPath);
  return { catalog, graph, sourceFiles: [...sourceFiles].sort() };
}

export function validateConfiguration(catalog: ProductCatalog, file: string, repositoryRoot = process.cwd()): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  checkKey(catalog.product.key, file, "$.product.key", issues);
  checkSemver(catalog.product.version, file, "$.product.version", issues);
  if (catalog.schemaVersion !== 1) issues.push(issue("schema-version", "schemaVersion must be 1", file, "$.schemaVersion"));
  if (!catalog.agents[catalog.product.rootAgent]) issues.push(issue("missing-root-agent", "rootAgent does not reference an agent", file, "$.product.rootAgent"));

  for (const [key, definition] of sortedEntries(catalog.packages)) {
    checkKey(key, definition.catalogPath, `$.packages.${key}`, issues);
    if (!definition.capabilities.size) issues.push(issue("empty-package", "package must expose at least one capability", definition.catalogPath, "$"));
    assertInside(repositoryRoot, definition.path, file, `$.packages.${key}.path`);
  }
  for (const [key, agent] of sortedEntries(catalog.agents)) {
    checkKey(key, file, `$.agents.${key}`, issues);
    if (agent.package && !catalog.packages[agent.package]) issues.push(issue("missing-package", `unknown package ${agent.package}`, file, `$.agents.${key}.package`));
    for (const child of agent.children) if (!catalog.agents[child]) issues.push(issue("missing-agent", `unknown child agent ${child}`, file, `$.agents.${key}.children`));
    if (!agent.source) issues.push(issue("missing-source", "agent source is required", file, `$.agents.${key}.source`));
  }
  const agentEdges = Object.values(catalog.agents).flatMap((agent) => agent.children.map((child) => ({ from: agent.key, to: child })));
  const agentCycle = detectCycle(Object.keys(catalog.agents), agentEdges);
  if (agentCycle) issues.push(issue("agent-cycle", `agent graph contains a cycle: ${agentCycle.join(" -> ")}`, file, "$.agents"));

  for (const [key, contract] of sortedEntries(catalog.contracts)) {
    checkKey(key, file, `$.contracts.${key}`, issues);
    checkSemver(contract.version, file, `$.contracts.${key}.version`, issues);
    for (const [operationKey, operation] of sortedEntries(contract.operations)) {
      checkKey(operationKey, contract.source, `$.operations.${operationKey}`, issues);
      if (!operation.request || !operation.response) issues.push(issue("contract-shape", "request and response shapes are required", contract.source, `$.operations.${operationKey}`));
    }
  }
  for (const [key, resource] of sortedEntries(catalog.resources)) {
    checkKey(key, file, `$.resources.${key}`, issues);
    if (!catalog.contracts[resource.contract]) issues.push(issue("missing-contract", `unknown contract ${resource.contract}`, file, `$.resources.${key}.contract`));
    if (SECRET_KEY.test(resource.implementation.source)) issues.push(issue("secret-shaped-value", "implementation source must not contain credential material", file, `$.resources.${key}.implementation.source`));
  }
  for (const [key, operation] of sortedEntries(catalog.operations)) {
    checkKey(key, file, `$.operations.${key}`, issues);
    const packageDefinition = catalog.packages[operation.package];
    if (!packageDefinition) issues.push(issue("missing-package", `unknown package ${operation.package}`, file, `$.operations.${key}.package`));
    else if (!packageDefinition.capabilities.has(operation.capability)) issues.push(issue("missing-capability", `package ${operation.package} does not expose capability ${operation.capability}`, file, `$.operations.${key}.capability`));
    const resource = catalog.resources[operation.resource];
    if (!resource) issues.push(issue("missing-resource", `unknown resource ${operation.resource}`, file, `$.operations.${key}.resource`));
    else {
      const contract = catalog.contracts[resource.contract];
      if (contract && !contract.operations[operation.contractOperation]) issues.push(issue("missing-contract-operation", `unknown contract operation ${operation.contractOperation}`, file, `$.operations.${key}.contractOperation`));
    }
  }
  for (const [key, solution] of sortedEntries(catalog.solutions)) {
    checkKey(key, file, `$.solutions.${key}`, issues);
    for (const dependency of solution.dependsOn) if (!catalog.solutions[dependency]) issues.push(issue("missing-solution", `unknown solution ${dependency}`, file, `$.solutions.${key}.dependsOn`));
  }
  const solutionEdges = Object.values(catalog.solutions).flatMap((solution) => solution.dependsOn.map((dependency) => ({ from: dependency, to: solution.key })));
  const solutionCycle = detectCycle(Object.keys(catalog.solutions), solutionEdges);
  if (solutionCycle) issues.push(issue("solution-cycle", `solution graph contains a cycle: ${solutionCycle.join(" -> ")}`, file, "$.solutions"));
  const resourceSolutions = Object.values(catalog.solutions).filter((solution) => solution.kind === "resource");
  const agentSolutions = Object.values(catalog.solutions).filter((solution) => solution.kind === "agent");
  if (resourceSolutions.length > 0 && agentSolutions.length > 0 && !agentSolutions.some((solution) => solution.dependsOn.some((dependency) => resourceSolutions.some((resource) => resource.key === dependency)))) {
    issues.push(issue("solution-order", "agent solutions must depend on a resource solution", file, "$.solutions"));
  }
  return issues.sort((left, right) => `${left.file}:${left.path}:${left.code}`.localeCompare(`${right.file}:${right.path}:${right.code}`));
}

export function buildDependencyGraph(catalog: ProductCatalog, file: string): DependencyGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const addNode = (kind: GraphNode["kind"], id: string): void => {
    nodes.push({ kind, id: `${kind}:${id}` });
  };
  const addEdge = (from: string, to: string, kind: string, path: string): void => {
    edges.push({ from, to, kind, file, path });
  };
  for (const key of Object.keys(catalog.packages).sort()) {
    addNode("package", key);
    for (const capability of [...catalog.packages[key].capabilities].sort()) {
      addNode("capability", `${key}.${capability}`);
      addEdge(`package:${key}`, `capability:${key}.${capability}`, "owns", `$.packages.${key}`);
    }
  }
  for (const key of Object.keys(catalog.agents).sort()) {
    addNode("agent", key);
    for (const child of catalog.agents[key].children.sort()) addEdge(`agent:${key}`, `agent:${child}`, "contains", `$.agents.${key}.children`);
  }
  for (const key of Object.keys(catalog.contracts).sort()) addNode("contract", key);
  for (const key of Object.keys(catalog.resources).sort()) {
    addNode("resource", key);
    addNode("implementation", `${key}.${catalog.resources[key].implementation.kind}`);
    addEdge(`resource:${key}`, `contract:${catalog.resources[key].contract}`, "selects", `$.resources.${key}.contract`);
    addEdge(`resource:${key}`, `implementation:${key}.${catalog.resources[key].implementation.kind}`, "binds", `$.resources.${key}.implementation`);
  }
  for (const key of Object.keys(catalog.operations).sort()) {
    const operation = catalog.operations[key];
    addNode("operation", key);
    addEdge(`capability:${operation.package}.${operation.capability}`, `operation:${key}`, "exposes", `$.operations.${key}`);
    addEdge(`operation:${key}`, `resource:${operation.resource}`, "requires", `$.operations.${key}.resource`);
  }
  for (const key of Object.keys(catalog.solutions).sort()) {
    addNode("solution", key);
    for (const dependency of catalog.solutions[key].dependsOn.sort()) addEdge(`solution:${dependency}`, `solution:${key}`, "dependsOn", `$.solutions.${key}.dependsOn`);
  }
  const solutionKeys = Object.keys(catalog.solutions).sort();
  const solutionEdges = edges.filter((edge) => edge.kind === "dependsOn").map((edge) => ({ from: edge.from.replace("solution:", ""), to: edge.to.replace("solution:", "") }));
  const reverseDependencies: Record<string, string[]> = {};
  for (const node of nodes) reverseDependencies[node.id] = [];
  for (const edge of edges) reverseDependencies[edge.to]?.push(edge.from);
  for (const values of Object.values(reverseDependencies)) values.sort();
  const resourceReferenceCounts: Record<string, number> = {};
  for (const operation of Object.values(catalog.operations)) resourceReferenceCounts[operation.resource] = (resourceReferenceCounts[operation.resource] ?? 0) + 1;
  return {
    nodes: nodes.sort((left, right) => left.id.localeCompare(right.id)),
    edges: edges.sort((left, right) => `${left.from}:${left.to}:${left.kind}`.localeCompare(`${right.from}:${right.to}:${right.kind}`)),
    reverseDependencies,
    solutionOrder: topologicalOrder(solutionKeys, solutionEdges),
    resourceReferenceCounts: Object.fromEntries(Object.entries(resourceReferenceCounts).sort(([left], [right]) => left.localeCompare(right))),
  };
}

export function createDeploymentPlan(configuration: LoadedConfiguration, environmentKey: string): DeploymentPlan {
  const desiredState = { catalog: configuration.catalog, graph: configuration.graph, sourceFiles: configuration.sourceFiles, environmentKey };
  const desiredStateHash = sha256(canonicalJson(desiredState));
  const actions: PlanAction[] = [];
  for (const resourceKey of Object.keys(configuration.catalog.resources).sort()) {
    actions.push({ id: `connector-binding:${resourceKey}`, kind: "connector-binding", key: resourceKey, dependsOn: [], mutation: "none", reason: "Resolve the logical resource to a connector implementation." });
    actions.push({ id: `connection-reference-placeholder:${resourceKey}`, kind: "connection-reference-placeholder", key: resourceKey, dependsOn: [`connector-binding:${resourceKey}`], mutation: "none", reason: "Reserve a logical connection-reference binding for a later provider adapter." });
    actions.push({ id: `environment-variable-placeholder:${resourceKey}`, kind: "environment-variable-placeholder", key: resourceKey, dependsOn: [], mutation: "none", reason: "Reserve environment-specific connector settings without storing values." });
  }
  for (const solutionKey of configuration.graph.solutionOrder) {
    const solution = configuration.catalog.solutions[solutionKey];
    actions.push({ id: `solution-import:${solutionKey}`, kind: "solution-import", key: solutionKey, dependsOn: solution.dependsOn.map((dependency) => `solution-import:${dependency}`).sort(), mutation: "none", reason: `Plan the ${solution.kind} solution dependency boundary.` });
  }
  const sortedActions = actions.sort((left, right) => left.id.localeCompare(right.id));
  const withoutHash = { schemaVersion: 1 as const, productKey: configuration.catalog.product.key, environmentKey, desiredStateHash, actions: sortedActions };
  return { ...withoutHash, planHash: sha256(canonicalJson(withoutHash)) };
}

export function createDeploymentState(plan: DeploymentPlan): DeploymentState {
  return {
    schemaVersion: 1,
    productKey: plan.productKey,
    environmentKey: plan.environmentKey,
    desiredStateHash: plan.desiredStateHash,
    planHash: plan.planHash,
    phase: "planned",
    actions: Object.fromEntries(plan.actions.map((action) => [action.id, { status: "planned" as const, mutation: "none" as const }])),
    observed: {},
  };
}

export function createDefaultEnvironmentBinding(configuration: LoadedConfiguration, environmentKey: string): EnvironmentBinding {
  const resources: Record<string, EnvironmentResourceBinding> = {};
  for (const [resourceKey, resource] of sortedEntries(configuration.catalog.resources)) {
    resources[resourceKey] = {
      resourceKey,
      implementation: resource.implementation.kind,
      connectionReferenceKey: resourceKey,
      endpointRef: `${resourceKey.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_ENDPOINT`,
    };
  }
  return {
    schemaVersion: 1,
    environmentKey,
    powerPlatform: {
      environmentIdRef: "COPILOT_ENVIRONMENT_ID",
      solutionSettingsFile: `.azure/${environmentKey}/company-agent/settings.json`,
    },
    resources,
  };
}

export function parseEnvironmentBinding(value: unknown, file: string, expectedEnvironmentKey?: string): EnvironmentBinding {
  const raw = objectValue(value, file, "$");
  if (raw.schemaVersion !== 1) throw new ConfigurationError([issue("schema-version", "environment schemaVersion must be 1", file, "$.schemaVersion")]);
  const environmentKey = requiredString(raw.environmentKey, "environmentKey", file, "$.environmentKey");
  if (expectedEnvironmentKey && environmentKey !== expectedEnvironmentKey) throw new ConfigurationError([issue("environment-mismatch", `expected environment ${expectedEnvironmentKey}`, file, "$.environmentKey")]);
  const powerPlatformRaw = objectValue(raw.powerPlatform, file, "$.powerPlatform");
  const resourceMap = mapValue(raw.resources, "resources", file, "$.resources");
  const resources: Record<string, EnvironmentResourceBinding> = {};
  for (const [key, value] of sortedEntries(resourceMap)) {
    const resourceRaw = objectValue(value, file, `$.resources.${key}`);
    const implementation = requiredString(resourceRaw.implementation, "resource.implementation", file, `$.resources.${key}.implementation`);
    if (implementation !== "product-managed" && implementation !== "customer-supplied" && implementation !== "pre-existing") {
      throw new ConfigurationError([issue("invalid-implementation-kind", "unsupported resource implementation", file, `$.resources.${key}.implementation`)]);
    }
    resources[key] = {
      resourceKey: key,
      implementation,
      connectionReferenceKey: requiredString(resourceRaw.connectionReferenceKey, "resource.connectionReferenceKey", file, `$.resources.${key}.connectionReferenceKey`),
      endpointRef: optionalString(resourceRaw.endpointRef, "resource.endpointRef", file, `$.resources.${key}.endpointRef`),
    };
  }
  return {
    schemaVersion: 1,
    environmentKey,
    powerPlatform: {
      environmentIdRef: requiredString(powerPlatformRaw.environmentIdRef, "powerPlatform.environmentIdRef", file, "$.powerPlatform.environmentIdRef"),
      solutionSettingsFile: requiredString(powerPlatformRaw.solutionSettingsFile, "powerPlatform.solutionSettingsFile", file, "$.powerPlatform.solutionSettingsFile"),
    },
    resources,
  };
}

export async function loadEnvironmentBinding(options: { path: string; expectedEnvironmentKey?: string }): Promise<EnvironmentBinding> {
  const value = parseDocument(await readFile(options.path, "utf8"), options.path);
  return parseEnvironmentBinding(value, options.path, options.expectedEnvironmentKey);
}

function lifecycleAction(action: Omit<LifecycleAction, "mutation">): LifecycleAction {
  return { ...action, mutation: "none" };
}

export function createLifecyclePlan(options: { configuration: LoadedConfiguration; environmentBinding: EnvironmentBinding; mode: ReleaseMode }): LifecyclePlan {
  const { configuration, environmentBinding, mode } = options;
  const resourceKeys = new Set(Object.keys(configuration.catalog.resources));
  const bindingKeys = new Set(Object.keys(environmentBinding.resources));
  const missingBindings = [...resourceKeys].filter((key) => !bindingKeys.has(key)).sort();
  const unknownBindings = [...bindingKeys].filter((key) => !resourceKeys.has(key)).sort();
  if (missingBindings.length > 0 || unknownBindings.length > 0) {
    throw new ConfigurationError([issue("environment-resource-bindings", `resource bindings must match the catalog; missing=${missingBindings.join(",") || "none"}, unknown=${unknownBindings.join(",") || "none"}`, "<environment>", "$.resources")]);
  }
  const basePlan = createDeploymentPlan(configuration, environmentBinding.environmentKey);
  const actions: LifecycleAction[] = [];
  actions.push(lifecycleAction({ id: `authentication-prerequisite:${mode}`, kind: "authentication-prerequisite", key: mode, dependsOn: [], reason: mode === "bootstrap" ? "Record the interactive consent prerequisite without starting a browser flow." : "Record the non-interactive release identity prerequisite without authenticating." }));
  actions.push(lifecycleAction({ id: "settings-resolution:environment", kind: "settings-resolution", key: environmentBinding.environmentKey, dependsOn: [], reason: "Resolve environment references without reading or storing secret values." }));
  for (const solutionKey of configuration.graph.solutionOrder) {
    const solution = configuration.catalog.solutions[solutionKey];
    const buildId = `solution-build:${solutionKey}`;
    actions.push(lifecycleAction({ id: buildId, kind: "solution-build", key: solutionKey, dependsOn: ["settings-resolution:environment"], reason: `Plan the ${solution.kind} solution artifact without packaging or importing it.` }));
    const importDependencies = solution.dependsOn.map((dependency) => `solution-import:${dependency}`);
    actions.push(lifecycleAction({ id: `solution-import:${solutionKey}`, kind: "solution-import", key: solutionKey, dependsOn: [buildId, ...importDependencies].sort(), reason: `Plan ordered import of the ${solution.kind} solution.` }));
  }
  const solutionImports = configuration.graph.solutionOrder.map((solutionKey) => `solution-import:${solutionKey}`);
  actions.push(lifecycleAction({ id: "publish:product", kind: "publish", key: configuration.catalog.product.key, dependsOn: solutionImports, reason: "Plan publication after all solution settings and imports are complete." }));
  return {
    schemaVersion: 1,
    mode,
    basePlan,
    environmentBinding,
    actions: actions.sort((left, right) => left.id.localeCompare(right.id)),
  };
}

export function createRollbackPlan(plan: Pick<DeploymentPlan, "planHash">, targetPlanHash: string): LifecycleAction {
  if (!/^sha256:[a-f0-9]{64}$/.test(targetPlanHash)) throw new ConfigurationError([issue("invalid-plan-hash", "rollback target must be a SHA-256 plan hash", "<argument>", "targetPlanHash")]);
  if (targetPlanHash === plan.planHash) throw new ConfigurationError([issue("same-plan-rollback", "rollback target must differ from the current plan", "<argument>", "targetPlanHash")]);
  return lifecycleAction({ id: `rollback-selection:${targetPlanHash}`, kind: "rollback-selection", key: targetPlanHash, dependsOn: [], reason: "Select a previously verified immutable plan; do not mutate the current plan." });
}

export function createCleanupPlan(configuration: LoadedConfiguration): LifecycleAction[] {
  return Object.keys(configuration.catalog.resources).sort().filter((resourceKey) => (configuration.graph.resourceReferenceCounts[resourceKey] ?? 0) === 0).map((resourceKey) => lifecycleAction({ id: `cleanup-candidate:resource:${resourceKey}`, kind: "cleanup-candidate", key: resourceKey, dependsOn: [], reason: "Resource has no operation dependents; ownership must still be verified by a provider adapter." }));
}

export function formatPlanSummary(plan: DeploymentPlan): string {
  return [
    `Product: ${plan.productKey}`,
    `Environment: ${plan.environmentKey}`,
    `Desired state: ${plan.desiredStateHash}`,
    `Plan: ${plan.planHash}`,
    `Actions: ${plan.actions.length}`,
    ...plan.actions.map((action) => `- ${action.id} [${action.mutation}]`),
  ].join("\n");
}
