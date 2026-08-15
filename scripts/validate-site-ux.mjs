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
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const tabs = await page.locator('.md-tabs__link').allTextContents();
  const normalizedTabs = tabs.map((tab) => tab.trim()).filter(Boolean);
  const expectedTabs = [
    'Home',
    'Get started',
    'Guides & examples',
    'Reference',
    'Architecture',
    'Security',
    'Releases',
  ];
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
      return {
        background: style.backgroundColor,
        position: style.position,
        shadow: style.boxShadow,
      };
    });
    if (liftedStyle.shadow !== 'none') {
      throw new Error(
        `Lifted primary section retains Material elevation: ${JSON.stringify(liftedStyle)}`,
      );
    }
    if (liftedStyle.position === 'sticky' && opacityOf(liftedStyle.background) < 1) {
      throw new Error(
        `Pinned primary section is not opaque, so navigation shows through it: ` +
          JSON.stringify(liftedStyle),
      );
    }
  }
  await page.goto(`${origin}/getting-started/first-policy/`, { waitUntil: 'networkidle' });
  const sidebarAlignment = await page.evaluate(() => {
    const visibleLink = (label) => [...document.querySelectorAll(
      '.md-sidebar--primary a.md-nav__link',
    )].find((link) => (
      link.textContent.trim() === label && link.getClientRects().length > 0
    ));
    const section = visibleLink('Get started');
    const child = visibleLink('Install Octoform');
    if (!section || !child) return undefined;
    return {
      childLeft: child.getBoundingClientRect().left,
      sectionLeft: section.getBoundingClientRect().left,
    };
  });
  if (!sidebarAlignment || sidebarAlignment.sectionLeft > sidebarAlignment.childLeft + 1) {
    throw new Error(`Primary sidebar hierarchy is reversed: ${JSON.stringify(sidebarAlignment)}`);
  }
  if (await page.locator('.md-footer__inner').count()) {
    throw new Error('Previous and next page navigation must not be rendered');
  }

  await page.goto(`${origin}/reference/`, { waitUntil: 'networkidle' });
  const tableGeometry = await page.evaluate(() => {
    const heading = document.querySelector('#programmatic-api');
    const tableWrapper = heading
      ? [...document.querySelectorAll('.md-typeset__table')]
        .find((wrapper) => heading.compareDocumentPosition(wrapper) & Node.DOCUMENT_POSITION_FOLLOWING)
      : undefined;
    const table = tableWrapper?.querySelector('table');
    const article = document.querySelector('.md-content__inner');
    if (!tableWrapper || !table || !article) return undefined;
    return {
      articleWidth: article.getBoundingClientRect().width,
      tableWidth: table.getBoundingClientRect().width,
      wrapperWidth: tableWrapper.getBoundingClientRect().width,
    };
  });
  if (
    !tableGeometry
    || Math.abs(tableGeometry.wrapperWidth - tableGeometry.tableWidth) > 2
    || tableGeometry.tableWidth >= tableGeometry.articleWidth - 20
  ) {
    throw new Error(`Desktop table does not fit its content: ${JSON.stringify(tableGeometry)}`);
  }

  const navigationMetrics = new Map();
  for (const path of [
    '/configuration/document-composition/',
    '/configuration/selection-and-precedence/',
  ]) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    navigationMetrics.set(path, await page.evaluate(() => Object.fromEntries(
      [...document.querySelectorAll('.md-sidebar--primary a.md-nav__link')]
        .filter((link) => link.getClientRects().length > 0)
        .filter((link) => ['Document composition', 'Selection and precedence'].includes(link.textContent.trim()))
        .map((link) => {
          const style = getComputedStyle(link);
          return [link.textContent.trim(), {
            fontWeight: style.fontWeight,
            height: link.getBoundingClientRect().height,
          }];
        }),
    )));
  }
  const firstNavigation = navigationMetrics.get('/configuration/document-composition/');
  const secondNavigation = navigationMetrics.get('/configuration/selection-and-precedence/');
  for (const label of ['Document composition', 'Selection and precedence']) {
    if (!firstNavigation?.[label] || !secondNavigation?.[label]) {
      throw new Error(`Unable to compare navigation metrics for ${label}`);
    }
    if (
      firstNavigation[label].fontWeight !== secondNavigation[label].fontWeight ||
      Math.abs(firstNavigation[label].height - secondNavigation[label].height) > 1
    ) {
      throw new Error(
        `${label} changes typography when selected: ` +
          `${JSON.stringify(firstNavigation[label])} -> ${JSON.stringify(secondNavigation[label])}`,
      );
    }
  }

  const securityPages = [
    ['Security', '/security/'],
    ['Trust and data boundaries', '/security/trust-and-data/'],
    ['Credentials and permissions', '/security/credentials-and-permissions/'],
    ['Secure automation', '/security/secure-automation/'],
    ['Incidents and recovery', '/security/incidents-and-recovery/'],
  ];
  for (const [label, path] of securityPages) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const securityTab = (await page.locator('.md-tabs__item--active .md-tabs__link').textContent())?.trim();
    if (securityTab !== 'Security') {
      throw new Error(`${path} is not represented inside Security navigation`);
    }
    if (!(await page.locator('.md-sidebar--primary:visible').count())) {
      throw new Error(`${path} does not expose the Security primary sidebar`);
    }
    const sidebarEntries = (await page
      .locator('.md-sidebar--primary a.md-nav__link:visible')
      .allTextContents())
      .map((entry) => entry.trim());
    for (const [expectedLabel] of securityPages) {
      if (!sidebarEntries.includes(expectedLabel)) {
        throw new Error(`${path} does not expose the ${expectedLabel} Security entry`);
      }
    }
    const activeEntry = (await page
      .locator('.md-sidebar--primary a.md-nav__link--active:visible')
      .first()
      .textContent())?.trim();
    if (activeEntry !== label) {
      throw new Error(`${path} selects ${activeEntry} instead of ${label}`);
    }
  }

  await page.goto(`${origin}/examples/minimal/`, { waitUntil: 'networkidle' });
  const activeTab = (await page.locator('.md-tabs__item--active .md-tabs__link').textContent())?.trim();
  if (activeTab !== 'Guides & examples') {
    throw new Error(`Expected Guides & examples to be active, received ${activeTab}`);
  }
  if (!(await page.locator('.md-sidebar--primary .md-nav__link--active:visible').count())) {
    throw new Error('Example page has no visible active entry in the primary sidebar');
  }

  const readExamplesSectionMetrics = () => page.evaluate(() => {
    const link = [...document.querySelectorAll('.md-sidebar--primary a.md-nav__link')]
      .find((candidate) => (
        candidate.textContent.trim() === 'Examples' && candidate.getClientRects().length > 0
      ));
    const child = [...document.querySelectorAll('.md-sidebar--primary a.md-nav__link')]
      .find((candidate) => (
        candidate.textContent.trim() === 'Minimal policy' && candidate.getClientRects().length > 0
      ));
    const textLeft = (element) => {
      const node = [...element.querySelectorAll('*')]
        .flatMap((descendant) => [...descendant.childNodes])
        .find((childNode) => childNode.nodeType === Node.TEXT_NODE && childNode.textContent.trim());
      if (!node) return undefined;
      const range = document.createRange();
      const firstCharacter = node.textContent.search(/\S/);
      range.setStart(node, firstCharacter);
      range.setEnd(node, firstCharacter + 1);
      return range.getBoundingClientRect().left;
    };
    if (!link || !child) return undefined;
    const style = getComputedStyle(link);
    return {
      active: link.classList.contains('md-nav__link--active'),
      childTextLeft: textLeft(child),
      fontWeight: style.fontWeight,
      height: link.getBoundingClientRect().height,
      markerGap: textLeft(link) - link.getBoundingClientRect().left,
      paddingLeft: Number.parseFloat(style.paddingLeft),
      sectionTextLeft: textLeft(link),
    };
  });
  const inactiveExamplesSection = await readExamplesSectionMetrics();
  await page.goto(`${origin}/examples/`, { waitUntil: 'networkidle' });
  const activeExamplesSection = await readExamplesSectionMetrics();
  if (
    !activeExamplesSection?.active
    || inactiveExamplesSection?.active
    || activeExamplesSection.markerGap < 6
    || activeExamplesSection.sectionTextLeft > activeExamplesSection.childTextLeft + 1
    || activeExamplesSection.paddingLeft !== inactiveExamplesSection.paddingLeft
    || activeExamplesSection.fontWeight !== inactiveExamplesSection.fontWeight
    || Math.abs(activeExamplesSection.height - inactiveExamplesSection.height) > 1
  ) {
    throw new Error(
      'Selected section marker overlaps or changes its label geometry: ' +
        `${JSON.stringify(activeExamplesSection)} -> ${JSON.stringify(inactiveExamplesSection)}`,
    );
  }
  await page.goto(`${origin}/examples/minimal/`, { waitUntil: 'networkidle' });

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
    const filename = code?.querySelector(':scope > .filename');
    const codeSurface = code?.querySelector(':scope > pre');
    if (!code || !download || !filename || !codeSurface) return undefined;
    const codeRect = code.getBoundingClientRect();
    const filenameRect = filename.getBoundingClientRect();
    const surfaceRect = codeSurface.getBoundingClientRect();
    const downloadRect = download.getBoundingClientRect();
    return {
      downloadBelowCode: downloadRect.top >= codeRect.bottom,
      filenameAboveCode: filenameRect.bottom <= surfaceRect.top,
      filenameBackground: getComputedStyle(filename).backgroundColor,
      surfaceShadow: getComputedStyle(codeSurface).boxShadow,
      wrapperShadow: getComputedStyle(code).boxShadow,
    };
  });
  if (
    !exampleGeometry?.downloadBelowCode
    || !exampleGeometry.filenameAboveCode
    || exampleGeometry.filenameBackground !== 'rgba(0, 0, 0, 0)'
    || exampleGeometry.surfaceShadow === 'none'
    || exampleGeometry.wrapperShadow !== 'none'
  ) {
    throw new Error(
      `Code filename and source do not use distinct surfaces: ${JSON.stringify(exampleGeometry)}`,
    );
  }
  const [download] = await Promise.all([page.waitForEvent('download'), downloadLink.click()]);
  if (download.suggestedFilename() !== 'octoform.yml') {
    throw new Error(`Unexpected downloaded filename: ${download.suggestedFilename()}`);
  }

  const examplePages = [
    ['/examples/audit-only/', 1],
    ['/examples/branch-patterns/', 1],
    ['/examples/organization/', 1],
    ['/examples/personal-account/', 1],
    ['/examples/scheduled-audit/', 1],
    ['/examples/shared-presets/', 4],
    ['/examples/teams-and-access/', 1],
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

  const linkedCardPages = [
    ['/getting-started/', 6],
    ['/guides/', 6],
    ['/examples/', 10],
    ['/reference/', 3],
    ['/security/', 4],
    ['/releases/', 4],
  ];
  for (const [path, expectedCards] of linkedCardPages) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const cardGeometry = await page.evaluate(() => [...document.querySelectorAll(
      '.octoform-card--linked',
    )].map((card) => {
      const heading = card.querySelector(':scope > h2, :scope > h3');
      const body = heading
        ? [...card.children].find((element) => (
          element.tagName === 'P'
          && (heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
        ))
        : undefined;
      const action = card.querySelector(':scope > p:last-child > a');
      const headingStyle = heading ? getComputedStyle(heading) : undefined;
      const dividerStyle = heading ? getComputedStyle(heading, '::after') : undefined;
      return {
        actionBottom: action?.getBoundingClientRect().bottom,
        cardTop: card.getBoundingClientRect().top,
        dividerContent: dividerStyle?.content,
        dividerDisplay: dividerStyle?.display,
        headingBeforeBody: Boolean(
          heading && body && (heading.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING),
        ),
        headingBorderTop: headingStyle?.borderTopWidth,
      };
    }));
    if (cardGeometry.length !== expectedCards) {
      throw new Error(`${path} exposes ${cardGeometry.length} linked cards; expected ${expectedCards}`);
    }
    if (cardGeometry.some((card) => (
      !card.headingBeforeBody
      || card.headingBorderTop !== '0px'
      || card.dividerDisplay !== 'block'
      || card.dividerContent === 'none'
      || card.actionBottom === undefined
    ))) {
      throw new Error(
        `${path} does not render title, divider, content, and action in order: ` +
          JSON.stringify(cardGeometry),
      );
    }
    const rows = Map.groupBy(cardGeometry, (card) => Math.round(card.cardTop ?? 0));
    for (const row of rows.values()) {
      const actionBottoms = row.map((card) => card.actionBottom);
      if (Math.max(...actionBottoms) - Math.min(...actionBottoms) > 2) {
        throw new Error(`${path} does not bottom-align actions within a card row`);
      }
    }
  }

  const cardGridPages = [
    '/',
    '/getting-started/',
    '/guides/',
    '/examples/',
    '/reference/',
    '/security/',
    '/releases/',
  ];
  for (const path of cardGridPages) {
    await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const gridVariants = await page.evaluate(() => [...document.querySelectorAll(
      '.octoform-grid',
    )].map((grid) => {
      const cards = [...grid.querySelectorAll(':scope > .octoform-card')];
      return {
        cards: cards.length,
        linked: new Set(cards.map((card) => card.classList.contains('octoform-card--linked'))).size,
        stepLabels: cards.filter((card) => card.querySelector(
          ':scope > .octoform-step-number, :scope > p > .octoform-step-number',
        )).length,
        steps: new Set(cards.map((card) => card.classList.contains('octoform-step'))).size,
        stepCards: cards.filter((card) => card.classList.contains('octoform-step')).length,
      };
    }));
    if (gridVariants.some((grid) => (
      grid.cards === 0
      || grid.linked !== 1
      || grid.steps !== 1
      || (grid.stepCards > 0 && grid.stepLabels !== grid.cards)
    ))) {
      throw new Error(`${path} mixes incompatible card variants in one grid: ${JSON.stringify(gridVariants)}`);
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
    '/security/',
    '/security/credentials-and-permissions/',
    '/getting-started/authentication/',
    '/examples/shared-presets/',
    '/configuration/branches-and-rulesets/',
    '/architecture/behavior/state-models/',
    '/reference/github-api-surface/',
    '/releases/',
  ];
  const viewports = [
    ['wide desktop', 1920, 1080],
    ['desktop', 1440, 1000],
    ['compact desktop', 1024, 900],
    ['tablet', 820, 1180],
    ['compact tablet', 768, 1024],
    ['mobile', 390, 844],
    ['compact mobile', 320, 720],
  ];
  for (const [name, width, height] of viewports) {
    await page.setViewportSize({ width, height });
    for (const path of responsivePages) {
      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => new Promise((resolveFrame) => {
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame));
      }));
      const geometry = await page.evaluate(() => {
        const clientWidth = document.documentElement.clientWidth;
        const visibleOverflow = [...document.querySelectorAll('header, main, main *, footer, footer *')]
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const scrollSurface = element.closest(
              '.highlight, .md-sidebar__scrollwrap, .md-typeset__table, .octoform-diagram',
            );
            return {
              element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[
                ...element.classList,
              ].map((name) => `.${name}`).join('')}`,
              insideScrollSurface: Boolean(scrollSurface && scrollSurface !== element),
              left: Math.round(rect.left * 10) / 10,
              right: Math.round(rect.right * 10) / 10,
            };
          })
          .filter(({ insideScrollSurface, left, right }) => !insideScrollSurface && (
            (left < -1 && right > 1) || (right > clientWidth + 1 && left < clientWidth - 1)
          ))
          .slice(0, 12);
        return {
          clientWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
          rootOverflowX: getComputedStyle(document.documentElement).overflowX,
          visibleOverflow,
        };
      });
      if (geometry.visibleOverflow.length > 0) {
        throw new Error(
          `${path} exposes content outside the ${name} viewport: ${JSON.stringify(geometry)}`,
        );
      }
      const containedSurfaces = await page.evaluate(() => [
        ...document.querySelectorAll('.highlight, .md-typeset__table, .octoform-diagram'),
      ].map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      }));
      if (containedSurfaces.some(({ left, right }) => left < -1 || right > width + 1)) {
        throw new Error(`${path} exposes code, table, or diagram content outside its viewport at ${name}`);
      }
      if ((await page.locator('main').count()) !== 1 || !(await page.locator('main h1').isVisible())) {
        throw new Error(`${path} does not expose one visible main heading at the ${name} viewport`);
      }
      if ((await page.locator('header').count()) !== 1 || (await page.locator('footer').count()) !== 1) {
        throw new Error(`${path} is missing a header or footer landmark at the ${name} viewport`);
      }
      const tabsVisible = await page.locator('.md-tabs').isVisible();
      if (!tabsVisible) {
        const drawerControl = page.locator('.md-header label[for="__drawer"]');
        if (!(await drawerControl.isVisible())) {
          throw new Error(`${path} has no visible navigation drawer control at the ${name} viewport`);
        }
        await drawerControl.click();
        if (!(await page.locator('.md-sidebar--primary').isVisible())) {
          throw new Error(`${path} navigation drawer does not open at the ${name} viewport`);
        }
        await page.keyboard.press('Escape');
      } else {
        if (await page.locator('.md-header label[for="__drawer"]:visible').count()) {
          throw new Error(`${path} unexpectedly exposes a drawer control at the ${name} viewport`);
        }
      }
    }
  }

  await context.close();
} finally {
  await browser.close();
  await new Promise((resolveClose, reject) => server.close((error) => (error ? reject(error) : resolveClose())));
}

console.log(
  'Validated selected navigation, uniform card grids, Security navigation, sidebar hierarchy, code actions, diagrams, and responsive layouts.',
);

/**
 * Reads the alpha channel out of a computed background colour.
 *
 * Computed values reach here in several notations. A colour mix resolves to
 * `color(srgb r g b)`, with `/ a` only when the result is translucent, while a
 * plain declaration resolves to `rgb()` or `rgba()`. A notation carrying no
 * alpha is opaque.
 *
 * @param {string} color
 * @returns {number}
 */
function opacityOf(color) {
  const slashed = /\/\s*([\d.]+)\s*\)\s*$/.exec(color);
  if (slashed) return Number(slashed[1]);
  const rgba = /^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)$/.exec(color);
  return rgba ? Number(rgba[1]) : 1;
}

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
