import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const site = resolve(root, 'site');
const server = createServer(serveStaticFile);
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Unable to start UX validation server');
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    acceptDownloads: true,
    colorScheme: 'dark',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const tabs = await page.locator('.md-tabs__link').allTextContents();
  const normalizedTabs = tabs.map((tab) => tab.trim()).filter(Boolean);
  const expectedTabs = ['Home', 'Get started', 'Guides', 'Reference', 'Architecture', 'Security', 'Releases'];
  if (JSON.stringify(normalizedTabs) !== JSON.stringify(expectedTabs)) {
    throw new Error(`Unexpected primary navigation: ${normalizedTabs.join(', ')}`);
  }
  if (await page.locator('.md-sidebar:visible').count()) {
    throw new Error('Home must not render an empty sidebar');
  }

  await page.goto(`${origin}/examples/minimal/`, { waitUntil: 'networkidle' });
  const activeTab = (await page.locator('.md-tabs__item--active .md-tabs__link').textContent())?.trim();
  if (activeTab !== 'Guides') throw new Error(`Expected Guides to be active, received ${activeTab}`);
  if (!(await page.locator('.md-sidebar--primary .md-nav__link--active:visible').count())) {
    throw new Error('Example page has no visible active entry in the primary sidebar');
  }

  const downloadLink = page.locator('.octoform-example-download');
  if ((await downloadLink.getAttribute('download')) !== 'octoform.yml') {
    throw new Error('Minimal policy download does not declare the expected filename');
  }
  const [download] = await Promise.all([page.waitForEvent('download'), downloadLink.click()]);
  if (download.suggestedFilename() !== 'octoform.yml') {
    throw new Error(`Unexpected downloaded filename: ${download.suggestedFilename()}`);
  }

  const examplePages = [
    ['/examples/audit-only/', 1],
    ['/examples/branch-patterns/', 1],
    ['/examples/personal-account/', 1],
    ['/examples/scheduled-audit/', 1],
    ['/examples/shared-presets/', 4],
  ];
  for (const [path, expectedDownloads] of examplePages) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const links = page.locator('.octoform-example-download[download][aria-label]');
    const count = await links.count();
    if (count !== expectedDownloads) {
      throw new Error(`${path} exposes ${count} downloads; expected ${expectedDownloads}`);
    }
    for (let index = 0; index < count; index += 1) {
      const href = await links.nth(index).getAttribute('href');
      if (!href) throw new Error(`${path} has a download without an href`);
      const response = await page.request.get(new URL(href, page.url()).href);
      if (!response.ok()) throw new Error(`${path} download returned HTTP ${response.status()}`);
    }
  }

  const referencePages = [
    '/configuration/branches-and-rulesets/',
    '/commands/apply/',
  ];
  for (const path of referencePages) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const section = (await page.locator('.md-tabs__item--active .md-tabs__link').textContent())?.trim();
    if (section !== 'Reference') throw new Error(`${path} is not represented inside Reference navigation`);
    const activeLinks = await page.locator('.md-sidebar--primary .md-nav__link--active:visible').count();
    if (!activeLinks) throw new Error(`${path} has no visible active reference entry`);
  }

  const architecturePages = [
    '/architecture/requirements/actors-and-use-cases/',
    '/architecture/requirements/system-context/',
    '/architecture/software/container-view/',
    '/architecture/software/runtime-components/',
    '/architecture/software/domain-model/',
    '/architecture/behavior/configuration-loading/',
    '/architecture/behavior/policy-resolution/',
    '/architecture/behavior/repository-selection/',
    '/architecture/behavior/plan-and-apply/',
    '/architecture/behavior/state-models/',
    '/architecture/trust/trust-and-data-flow/',
    '/architecture/delivery/automation-patterns/',
    '/architecture/delivery/release-pipelines/',
  ];
  for (const path of architecturePages) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const section = (await page.locator('.md-tabs__item--active .md-tabs__link').textContent())?.trim();
    if (section !== 'Architecture') throw new Error(`${path} is not represented inside Architecture navigation`);
    if (!(await page.locator('.octoform-diagram img').count())) {
      throw new Error(`${path} does not expose its architecture diagram`);
    }
    if (!(await page.locator('a[href*="/assets/diagrams/sources/"]').count())) {
      throw new Error(`${path} does not link to reviewed PlantUML source`);
    }
  }

  const responsivePages = [
    '/',
    '/guides/',
    '/examples/shared-presets/',
    '/configuration/branches-and-rulesets/',
    '/architecture/behavior/state-models/',
    '/releases/',
  ];
  const viewports = [
    ['desktop', 1440, 1000],
    ['tablet', 820, 1180],
    ['mobile', 390, 844],
  ];
  for (const [name, width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const path of responsivePages) {
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      if (geometry.scrollWidth > geometry.clientWidth + 1) {
        throw new Error(`${path} overflows horizontally at the ${name} viewport`);
      }
      if ((await page.locator('main').count()) !== 1 || !(await page.locator('main h1').isVisible())) {
        throw new Error(`${path} does not expose one visible main heading at the ${name} viewport`);
      }
      if ((await page.locator('header').count()) !== 1 || (await page.locator('footer').count()) !== 1) {
        throw new Error(`${path} is missing a header or footer landmark at the ${name} viewport`);
      }
      if (width < 960) {
        const drawerControl = page.locator('.md-header label[for="__drawer"]');
        if (!(await drawerControl.isVisible())) {
          throw new Error(`${path} has no visible navigation drawer control at the ${name} viewport`);
        }
        await drawerControl.click();
        if (!(await page.locator('.md-sidebar--primary').isVisible())) {
          throw new Error(`${path} navigation drawer does not open at the ${name} viewport`);
        }
        await page.keyboard.press('Escape');
      }
    }
  }

  await context.close();
} finally {
  await browser.close();
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
}

console.log(
  'Validated primary navigation, active context, sparse sidebars, direct downloads, and responsive layouts.',
);

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
    '.yml': 'application/yaml; charset=utf-8',
  };
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}
