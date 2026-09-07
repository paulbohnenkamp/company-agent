import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

export class DefinitionError extends Error {}

export interface MarkdownDefinition {
  path: string;
  frontMatter: Record<string, string | string[]>;
  body: string;
}

/** A Microsoft AgentSchema YAML definition projected into the runtime shape. */
export interface YamlDefinition {
  path: string;
  frontMatter: Record<string, string | string[]>;
  body: string;
}

function parseScalar(value: string): string | string[] {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1).split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
  }
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function parseMarkdownDefinition(path: string, markdown: string): MarkdownDefinition {
  if (!markdown.startsWith("---\n")) throw new DefinitionError(`Missing front matter: ${path}`);
  const end = markdown.indexOf("\n---", 4);
  if (end < 0) throw new DefinitionError(`Unclosed front matter: ${path}`);
  const frontMatter: Record<string, string | string[]> = {};
  const lines = markdown.slice(4, end).split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const separator = line.indexOf(":");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (!rawValue) {
      const items: string[] = [];
      while (index + 1 < lines.length && /^\s+-\s+/.test(lines[index + 1])) {
        index += 1;
        items.push(lines[index].replace(/^\s+-\s+/, "").trim().replace(/^['"]|['"]$/g, ""));
      }
      frontMatter[key] = items;
    } else {
      frontMatter[key] = parseScalar(rawValue);
    }
  }
  return { path, frontMatter, body: markdown.slice(end + 4).trim() };
}

export async function readDefinition(path: string): Promise<MarkdownDefinition> {
  return parseMarkdownDefinition(path, await readFile(path, "utf8"));
}

/** Reads a canonical prompt-agent YAML file without inventing schema fields. */
export async function readYamlDefinition(path: string): Promise<YamlDefinition> {
  const document = parseYaml(await readFile(path, "utf8")) as Record<string, unknown>;
  const metadata = (document.metadata as Record<string, unknown> | undefined)?.businessAgent as Record<string, unknown> | undefined;
  const list = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : typeof value === "string" ? [value] : [];
  const scalar = (value: unknown): string => typeof value === "string" ? value : "";
  const frontMatter: Record<string, string | string[]> = {
    id: scalar(document.name),
    version: scalar(metadata?.version),
    description: scalar(document.description),
    inputs: list(metadata?.inputs),
    outputs: list(metadata?.outputs),
    "referenced-skills": list(metadata?.referencedSkills),
    "permitted-tools": list(metadata?.permittedTools),
  };
  if (document.kind !== "prompt" || !frontMatter.id || !frontMatter.version || !scalar(document.model) || !scalar(document.instructions)) throw new DefinitionError(`Invalid Microsoft AgentSchema prompt agent: ${path}`);
  return { path, frontMatter, body: scalar(document.instructions) };
}

export async function markdownFiles(root: string, suffix: string): Promise<string[]> {
  const results: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.name.endsWith(suffix)) results.push(path);
    }
  }
  await visit(resolve(root));
  return results.sort();
}

/** Finds canonical YAML artifacts with the requested suffix. */
export async function yamlFiles(root: string, suffix: string): Promise<string[]> {
  const results: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.name.endsWith(suffix)) results.push(path);
    }
  }
  await visit(resolve(root));
  return results.sort();
}

export function definitionId(definition: MarkdownDefinition): string {
  const id = definition.frontMatter.id ?? definition.frontMatter.name;
  if (typeof id !== "string" || !id) throw new DefinitionError(`Definition is missing id/name: ${definition.path}`);
  return id;
}

export function listValue(definition: MarkdownDefinition, key: string): string[] {
  const value = definition.frontMatter[key];
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function relativeDefinitionPath(from: string, to: string): string {
  return relative(resolve(from, ".."), resolve(to));
}
