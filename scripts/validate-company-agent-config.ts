import { loadProductConfiguration } from "./company-agent-config.js";

const catalogPath = process.argv[2] ?? "copilot-studio/company-agent/catalog.yaml";
const configuration = await loadProductConfiguration({ catalogPath });
console.log(`Validated ${configuration.catalog.product.key}: ${configuration.graph.nodes.length} graph nodes, ${configuration.graph.edges.length} graph edges.`);
