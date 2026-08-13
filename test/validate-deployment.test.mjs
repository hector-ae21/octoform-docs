import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { validateDeployment } from '../scripts/validate-deployment.mjs';

test('accepts an exact immutable tree with redirect aliases', async (context) => {
  const fixture = await createFixture(context);
  await assert.doesNotReject(() => validateDeployment(fixture));
});

test('accepts an older immutable tree without moving current aliases', async (context) => {
  const fixture = await createFixture(context, { aliases: [] });
  await mkdir(resolve(fixture.publishedDirectory, 'latest'), { recursive: true });
  await writeFile(resolve(fixture.publishedDirectory, 'latest', 'index.html'), '../0.3.1/');
  await writeFile(
    resolve(fixture.publishedDirectory, 'versions.json'),
    `${JSON.stringify([
      { version: '0.3.1', title: '0.3.1', aliases: ['latest'] },
      { version: fixture.version, title: fixture.version, aliases: [] },
    ], undefined, 2)}\n`,
  );
  await assert.doesNotReject(() => validateDeployment(fixture));
});

test('rejects stale canonical content', async (context) => {
  const fixture = await createFixture(context);
  await writeFile(resolve(fixture.publishedDirectory, fixture.version, 'index.html'), 'stale');
  await assert.rejects(() => validateDeployment(fixture), /differs from the generated site/u);
});

test('rejects symbolic-link aliases', async (context) => {
  const fixture = await createFixture(context, { aliases: [] });
  const alias = 'latest';
  try {
    await symlink(fixture.version, resolve(fixture.publishedDirectory, alias), 'dir');
  } catch (error) {
    if (error.code === 'EPERM') {
      context.skip('Creating symbolic links requires elevated Windows privileges');
      return;
    }
    throw error;
  }
  await writeVersions(fixture.publishedDirectory, fixture.version, [alias]);
  await assert.rejects(
    () => validateDeployment({ ...fixture, aliases: [alias] }),
    /real redirect directory/u,
  );
});

async function createFixture(context, { aliases = ['0.3', 'latest', 'stable'] } = {}) {
  const root = await mkdtemp(resolve(tmpdir(), 'octoform-docs-release-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  const builtDirectory = resolve(root, 'site');
  const publishedDirectory = resolve(root, 'published');
  const version = '0.3.0';
  await mkdir(resolve(builtDirectory, 'configuration'), { recursive: true });
  await writeFile(resolve(builtDirectory, 'index.html'), '<h1>Octoform</h1>');
  await writeFile(resolve(builtDirectory, 'configuration', 'index.html'), 'Configuration');
  await mkdir(resolve(publishedDirectory, version), { recursive: true });
  await mkdir(resolve(publishedDirectory, version, 'configuration'), { recursive: true });
  await writeFile(resolve(publishedDirectory, version, 'index.html'), '<h1>Octoform</h1>');
  await writeFile(resolve(publishedDirectory, version, 'configuration', 'index.html'), 'Configuration');
  for (const alias of aliases) {
    await mkdir(resolve(publishedDirectory, alias), { recursive: true });
    await writeFile(resolve(publishedDirectory, alias, 'index.html'), `../${version}/`);
  }
  await writeFile(resolve(publishedDirectory, 'index.html'), 'latest/');
  await writeVersions(publishedDirectory, version, aliases);
  return { builtDirectory, publishedDirectory, version, aliases };
}

async function writeVersions(directory, version, aliases) {
  await writeFile(
    resolve(directory, 'versions.json'),
    `${JSON.stringify([{ version, title: version, aliases }], undefined, 2)}\n`,
  );
}
