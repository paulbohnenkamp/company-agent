import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const environmentName = process.env.AZURE_ENV_NAME ?? 'companyagent-dev';
const outputDir = join(root, '.azure', environmentName, 'connector-create');
const iconSource = join(root, 'docs', 'copilot-studio', 'assets', 'connector-icon.png');
const iconTarget = join(outputDir, 'connector-icon.png');

await mkdir(outputDir, { recursive: true });
await copyFile(iconSource, iconTarget);
await writeFile(
  join(outputDir, 'apiProperties.json'),
  `${JSON.stringify(
    {
      properties: {
        connectionParameters: {},
        iconBrandColor: '#0078D4',
        scriptOperations: [],
        capabilities: [],
        policyTemplateInstances: [],
      },
    },
    null,
    2,
  )}\n`,
);

console.log(`Prepared connector properties: ${join(outputDir, 'apiProperties.json')}`);
console.log(`Prepared connector icon: ${iconTarget}`);
