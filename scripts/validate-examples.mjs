import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '@hector21/octoform';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const examples = resolve(root, 'docs/examples/files');
const roots = [
  'audit-only/octoform.yml',
  'branch-patterns/octoform.yml',
  'minimal/octoform.yml',
  'personal-account/octoform.yml',
  'self-audit/octoform.yml',
  'shared-presets/org.octoform.yml',
  'shared-presets/personal.octoform.yml',
];
const forbiddenIdentities = ['didactika', 'hector-ae21', 'resilientmq'];

for (const relative of roots) {
  const path = resolve(examples, relative);
  const source = readFileSync(path, 'utf8').toLowerCase();
  const identity = forbiddenIdentities.find((candidate) => source.includes(candidate));
  if (identity) throw new Error(`${relative} contains the non-fictitious identity ${identity}`);
  loadConfig(path);
}

console.log(`Validated ${roots.length} example roots with @hector21/octoform@0.3.1.`);
