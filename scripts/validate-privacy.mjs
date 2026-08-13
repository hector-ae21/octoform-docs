import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'site');
const violations = [];

for (const file of walk(site)) {
  const extension = extname(file);
  if (extension !== '.html' && extension !== '.css') continue;

  const content = readFileSync(file, 'utf8');
  const patterns = extension === '.html'
    ? [
        /<(?:script|img|source|iframe)\b[^>]*\b(?:src|srcset)=["']([^"']+)["']/gi,
      ]
    : [/url\(\s*["']?(https?:\/\/[^)'"\s]+)/gi, /@import\s+["'](https?:\/\/[^"']+)/gi];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      if (/^https?:\/\//i.test(match[1])) {
        violations.push(`${relative(file)} -> ${match[1]}`);
      }
    }
  }

  if (extension === '.html') validateLinkElements(content, file);
}

if (violations.length > 0) {
  console.error('External runtime resources detected:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('No external runtime resources detected in the generated site.');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : statSync(path).isFile() ? [path] : [];
  });
}

function relative(file) {
  return file.slice(site.length + 1).replaceAll('\\', '/');
}

function validateLinkElements(content, file) {
  const resourceRelations = new Set([
    'apple-touch-icon',
    'icon',
    'manifest',
    'modulepreload',
    'preload',
    'stylesheet',
  ]);

  for (const match of content.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    const relations = tag.match(/\brel=["']([^"']+)["']/i)?.[1].split(/\s+/) ?? [];
    if (href && /^https?:\/\//i.test(href) && relations.some((relation) => resourceRelations.has(relation))) {
      violations.push(`${relative(file)} -> ${href}`);
    }
  }
}
