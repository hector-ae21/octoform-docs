import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'site');
const server = createServer(serveStaticFile);
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Unable to start accessibility server');
const origin = `http://127.0.0.1:${address.port}`;
const paths = [
  '/',
  '/getting-started/',
  '/configuration/',
  '/commands/',
  '/guides/plan-and-apply/',
  '/automation/',
  '/examples/',
  '/security/',
  '/architecture/',
  '/reference/github-api-surface/',
  '/troubleshooting/',
];
const browser = await chromium.launch({ headless: true });
const violations = [];

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const path of paths) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    for (const violation of result.violations) {
      for (const node of violation.nodes) {
        violations.push(
          `${path}: ${violation.id} (${violation.impact ?? 'unknown'}) ${violation.help}\n` +
            `  target: ${node.target.join(' ')}\n` +
            `  ${node.failureSummary ?? node.html}`,
        );
      }
    }
  }
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
}

if (violations.length) throw new Error(`Accessibility violations:\n${violations.join('\n')}`);
console.log(`Validated WCAG 2.2 AA accessibility on ${paths.length} representative pages.`);

function serveStaticFile(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  let file = join(site, safePath);
  if (requestPath.endsWith('/')) file = join(file, 'index.html');
  else if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(site) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
  };
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}
