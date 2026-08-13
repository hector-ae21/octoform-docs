import { readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.cache', '.git', '.venv', 'node_modules', 'site']);
const ignoredFiles = new Set(['package-lock.json', 'requirements.lock']);
const patterns = [
  { name: 'GitHub token', expression: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/g },
  { name: 'GitHub fine-grained token', expression: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: 'private key', expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'AWS access key', expression: /\bAKIA[0-9A-Z]{16}\b/g },
];
const findings = [];

for (const file of await sourceFiles(root)) {
  const source = await readFile(file, 'utf8');
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern.expression)) {
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      findings.push(`${relative(root, file)}:${line}: ${pattern.name}`);
    }
  }
}

if (findings.length) throw new Error(`Potential secrets detected:\n${findings.join('\n')}`);
console.log('No credential patterns detected.');

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    if (entry.isFile() && ignoredFiles.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

