import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules/mermaid/dist/mermaid.min.js');
const target = resolve(
  root,
  '.cache/plugin/privacy/assets/external/unpkg.com/mermaid@11/dist/mermaid.min.js',
);

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log('Prepared the pinned Mermaid runtime for the privacy plugin.');
