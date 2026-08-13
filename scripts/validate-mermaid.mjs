import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = await markdownFiles(resolve(root, 'docs'));
const diagrams = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const matches = source.matchAll(/^```mermaid\s*\r?\n([\s\S]*?)^```\s*$/gm);
  for (const match of matches) diagrams.push({ file, source: match[1] });
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: resolve(root, 'node_modules/mermaid/dist/mermaid.min.js') });
  await page.evaluate(() => window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' }));
  for (const diagram of diagrams) {
    try {
      await page.evaluate((source) => window.mermaid.parse(source), diagram.source);
    } catch (error) {
      throw new Error(`Invalid Mermaid diagram in ${diagram.file}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

console.log(`Validated ${diagrams.length} Mermaid diagram${diagrams.length === 1 ? '' : 's'}.`);

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(path)));
    else if (extname(entry.name) === '.md') files.push(path);
  }
  return files;
}
