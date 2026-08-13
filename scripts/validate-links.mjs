import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'site');
const files = await htmlFiles(site);
const pages = new Map();
const failures = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const relative = file.slice(site.length + 1).replaceAll('\\', '/');
  pages.set(relative, {
    source,
    ids: new Set([...source.matchAll(/\s(?:id|name)=["']([^"']+)["']/g)].map((match) => match[1])),
  });
}

for (const [file, page] of pages) {
  for (const match of page.source.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    const url = new URL(value, `https://docs.invalid/${file}`);
    let path = decodeURIComponent(url.pathname).replace(/^\/octoform-docs\//, '').replace(/^\//, '');
    if (!path || path.endsWith('/')) path += 'index.html';
    if (!extname(path)) path += '/index.html';
    const target = pages.get(path);
    if (!target && !existsSync(resolve(site, path))) {
      failures.push(`${file}: ${value} resolves to missing ${path}`);
      continue;
    }
    if (url.hash) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (fragment && target && !target.ids.has(fragment)) {
        failures.push(`${file}: ${value} references missing anchor ${fragment}`);
      }
    }
  }
}

if (failures.length) throw new Error(`Broken internal links:\n${failures.join('\n')}`);
console.log(`Validated internal links and anchors across ${pages.size} generated pages.`);

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}
