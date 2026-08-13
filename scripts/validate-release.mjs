import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsVersion = process.argv[2];
const applicationVersion = process.argv[3];
if (!/^\d+\.\d+$/.test(docsVersion ?? '')) {
  throw new Error('Documentation version must be MAJOR.MINOR');
}
if (!/^\d+\.\d+\.\d+$/.test(applicationVersion ?? '')) {
  throw new Error('Application version must be MAJOR.MINOR.PATCH');
}
if (!applicationVersion.startsWith(`${docsVersion}.`)) {
  throw new Error('Documentation and application release lines do not match');
}

const releasePage = await readFile(resolve(root, 'docs/releases/index.md'), 'utf8');
if (!releasePage.includes(`docs_version: "${docsVersion}"`)) {
  throw new Error(`Release page does not declare documentation ${docsVersion}`);
}
if (!releasePage.includes(`application_version: "${applicationVersion}"`)) {
  throw new Error(`Release page does not declare application ${applicationVersion}`);
}
console.log(`Validated Octoform ${applicationVersion} documentation release ${docsVersion}.`);

