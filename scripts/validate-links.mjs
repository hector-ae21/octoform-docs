import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'site');
const publishedBase = new URL('https://hector-ae21.github.io/octoform-docs/');
const files = await htmlFiles(site);
const pages = new Map();
const failures = [];
const externalLinks = new Set();

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
    let value = match[1];
    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    if (/^https?:/i.test(value)) {
      const absolute = new URL(value);
      if (absolute.origin !== publishedBase.origin || !absolute.pathname.startsWith(publishedBase.pathname)) {
        absolute.hash = '';
        externalLinks.add(absolute.href);
        continue;
      }
      value = `/${absolute.pathname.slice(publishedBase.pathname.length)}${absolute.search}${absolute.hash}`;
    }
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

for (const link of externalLinks) {
  const failure = await validateExternalLink(link);
  if (failure) failures.push(failure);
}

if (failures.length) throw new Error(`Broken links:\n${failures.join('\n')}`);
console.log(
  `Validated internal links and anchors across ${pages.size} generated pages and ` +
    `${externalLinks.size} external links.`,
);

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

async function validateExternalLink(url) {
  const target = externalValidationTarget(url);
  let lastFailure = '';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const head = await request(target, 'HEAD');
      if (head.ok || head.status < 400) return '';
      const response = head.status === 403 || head.status === 405 ? await request(target, 'GET') : head;
      if (response.ok || response.status < 400) return '';
      lastFailure = `${url} returned HTTP ${response.status}`;
      if (response.status !== 429 && response.status < 500) return lastFailure;
    } catch (error) {
      lastFailure = `${url} failed: ${error instanceof Error ? error.message : String(error)}`;
    }
    if (attempt < 3) await delay(250 * attempt);
  }
  return lastFailure;
}

function externalValidationTarget(url) {
  const parsed = new URL(url);
  if (parsed.hostname === 'www.npmjs.com' && parsed.pathname.startsWith('/package/')) {
    const packageName = decodeURIComponent(parsed.pathname.slice('/package/'.length));
    return `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
  }
  return url;
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    headers: { 'User-Agent': 'Octoform-Docs-Link-Check/1.0' },
    signal: AbortSignal.timeout(10_000),
  });
  if (method === 'GET') await response.body?.cancel();
  return response;
}
