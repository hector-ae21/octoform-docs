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
  const activeHomeTab = page.locator('.md-tabs__item--active .md-tabs__link');
  const homeTabStyle = await activeHomeTab.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, decoration: style.textDecorationLine };
  });
  if (homeTabStyle.background === 'rgba(0, 0, 0, 0)' || homeTabStyle.decoration !== 'none') {
    throw new Error('The active primary tab must use a filled selected state without an underline');
  }
  const tabGeometry = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.md-tabs__link')];
    return links.slice(0, -1).map((link, index) => {
      const current = link.getBoundingClientRect();
      const next = links[index + 1].getBoundingClientRect();
      return next.left - current.right;
    });
  });
  if (tabGeometry.some((gap) => Math.abs(gap) > 1)) {
    throw new Error(`Primary tabs are not contiguous: ${tabGeometry.join(', ')}`);
  }
  const homeSpacing = await page.evaluate(() => {
    const tabs = document.querySelector('.md-tabs');
    const hero = document.querySelector('.octoform-hero');
    if (!tabs || !hero) return undefined;
    return hero.getBoundingClientRect().top - tabs.getBoundingClientRect().bottom;
  });
  if (homeSpacing === undefined || homeSpacing < 8 || homeSpacing > 55) {
    throw new Error(`Unexpected Home spacing below primary navigation: ${homeSpacing}`);
  }

  await page.goto(`${origin}/getting-started/`, { waitUntil: 'networkidle' });
  const journeyLinks = await page.locator('.octoform-grid--journey .octoform-card > p a').count();
  if (journeyLinks !== 6) throw new Error(`Get started exposes ${journeyLinks} journey links; expected 6`);
  const getStartedEntries = await page.locator('.md-sidebar--primary a.md-nav__link:visible').allTextContents();
  for (const expected of [
    'Install Octoform',
    'Authenticate safely',
    'Write the first policy',
    'Produce the first plan',
    'Apply and verify',
    'Core concepts',
  ]) {
    if (!getStartedEntries.some((entry) => entry.trim() === expected)) {
      throw new Error(`Get started sidebar does not expose ${expected}`);
    }
  }
  const activeSidebarShadow = await page
    .locator('.md-sidebar--primary .md-nav__link--active:visible')
    .first()
    .evaluate((element) => getComputedStyle(element).boxShadow);
  if (!activeSidebarShadow.includes('inset')) {
    throw new Error(`Primary sidebar active state retains an elevated title shadow: ${activeSidebarShadow}`);
  }
  const liftedSection = page.locator(
    '.md-sidebar--primary .md-nav--lifted > .md-nav__list > .md-nav__item--active > ' +
      '.md-nav__link.md-nav__container',
  );
  if (await liftedSection.count()) {
    const liftedStyle = await liftedSection.evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, shadow: style.boxShadow };
    });
    if (liftedStyle.shadow !== 'none' || liftedStyle.background !== 'rgba(0, 0, 0, 0)') {
      throw new Error(
        `Lifted primary section retains Material elevation: ${JSON.stringify(liftedStyle)}`,
      );
    }
  }
  if (await page.locator('.md-footer__inner').count()) {
    throw new Error('Previous and next page navigation must not be rendered');
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
  if ((await downloadLink.textContent())?.trim() !== 'Download YAML') {
    throw new Error('Minimal policy download must expose a readable action label');
  }
  const exampleGeometry = await page.evaluate(() => {
    const code = document.querySelector('.octoform-example .highlight');
    const download = document.querySelector('.octoform-example-download');
    if (!code || !download) return undefined;
    const codeRect = code.getBoundingClientRect();
    const downloadRect = download.getBoundingClientRect();
    return {
      downloadBelowCode: downloadRect.top >= codeRect.bottom,
      codeShadow: getComputedStyle(code).boxShadow,
    };
  });
  if (!exampleGeometry?.downloadBelowCode || exampleGeometry.codeShadow === 'none') {
    throw new Error('Code example and download action do not use the expected elevated layout');
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
    const sourceBelowDiagram = await page.evaluate(() => {
      const diagram = document.querySelector('.octoform-diagram');
      const source = diagram?.nextElementSibling?.querySelector('a[href*="/assets/diagrams/sources/"]');
      return Boolean(source);
    });
    if (!sourceBelowDiagram) throw new Error(`${path} does not group its diagram with the source action`);
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
  'Validated selected navigation, Get started, sidebar hierarchy, code actions, diagrams, and responsive layouts.',
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
