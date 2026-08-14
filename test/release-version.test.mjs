import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  collectPatchDocumentationPaths,
  parseCompleteVersion,
  parseReleaseLine,
  parseTagReferences,
  resolveDocumentationRelease,
} from '../scripts/release-version.mjs';

test('preserves canonical and aliased patch paths when publishing a release line', () => {
  assert.deepEqual(
    collectPatchDocumentationPaths([
      { version: '0.3', aliases: ['0.3.0', 'latest'] },
      { version: '0.3.2', aliases: ['stable'] },
      { version: '0.4', aliases: ['0.4.0'] },
    ], '0.3'),
    { versions: ['0.3.2'], redirects: ['0.3.0', '0.3.2'] },
  );
});
import { validateReleaseIdentity } from '../scripts/validate-release.mjs';

test('selects patch zero for the first documentation release line', () => {
  assert.deepEqual(
    resolveDocumentationRelease({ applicationVersion: '0.3.1', allTags: [], commitTags: [] }),
    {
      applicationVersion: '0.3.1',
      applicationLine: '0.3',
      publicationVersion: '0.3.0',
      publicationTag: 'v0.3.0',
      reused: false,
      publishDocumentationLine: true,
    },
  );
});

test('increments only the patch within the matching release line', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.8',
    allTags: ['v0.2.9', 'v0.3.0', 'v0.3.4', 'not-a-release'],
    commitTags: [],
  });
  assert.equal(result.publicationVersion, '0.3.5');
  assert.equal(result.applicationVersion, '0.3.8');
  assert.equal(result.applicationLine, '0.3');
});

test('reuses the release assigned to the same source commit', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.9',
    allTags: ['v0.3.0', 'v0.3.1'],
    commitTags: ['v0.3.1'],
  });
  assert.equal(result.publicationVersion, '0.3.1');
  assert.equal(result.applicationVersion, '0.3.9');
  assert.equal(result.reused, true);
  assert.equal(result.publishDocumentationLine, true);
});

test('does not move aliases backwards when recovering an older tagged commit', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.9',
    allTags: ['v0.3.0', 'v0.3.1'],
    commitTags: ['v0.3.0'],
  });
  assert.equal(result.publicationVersion, '0.3.0');
  assert.equal(result.publishDocumentationLine, false);
});

test('resolves lightweight and annotated tags to their commits', () => {
  assert.deepEqual(
    parseTagReferences('v0.3.0\t\t1111\nv0.3.1\t2222\taaaa\n'),
    [
      { name: 'v0.3.0', target: '1111' },
      { name: 'v0.3.1', target: '2222' },
    ],
  );
});

test('rejects prerelease, build, and incomplete versions', () => {
  for (const version of ['0.3', '0.3.1-beta.1', '0.3.1+build']) {
    assert.throws(() => parseCompleteVersion(version), /complete stable/u);
  }
});

test('accepts only complete MAJOR.MINOR documentation lines', () => {
  assert.deepEqual(parseReleaseLine('0.3'), { major: 0, minor: 3, version: '0.3' });
  for (const version of ['0', '0.3.1', '0.3-beta']) {
    assert.throws(() => parseReleaseLine(version), /complete MAJOR\.MINOR/u);
  }
});

test('rejects a commit tagged for a different Octoform release line', () => {
  assert.throws(
    () => resolveDocumentationRelease({
      applicationVersion: '0.4.0',
      allTags: ['v0.3.2'],
      commitTags: ['v0.3.2'],
    }),
    /does not match/u,
  );
});

test('validates source metadata and exact Octoform dependency', () => {
  assert.doesNotThrow(() => validateReleaseIdentity({
    publicationVersion: '0.3.7',
    applicationVersion: '0.3.1',
    packageJson: JSON.stringify({ devDependencies: { '@hector21/octoform': '0.3.1' } }),
    releasePage: 'application_line: "0.3"\nvalidated_application_version: "0.3.1"',
  }));
});

test('rejects documentation and application release-line drift', () => {
  assert.throws(() => validateReleaseIdentity({
    publicationVersion: '0.4.0',
    applicationVersion: '0.3.1',
    packageJson: JSON.stringify({ devDependencies: { '@hector21/octoform': '0.3.1' } }),
    releasePage: 'application_line: "0.3"\nvalidated_application_version: "0.3.1"',
  }), /release lines do not match/u);
});

test('keeps the validation patch independent from a later editorial publication patch', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.1',
    allTags: Array.from({ length: 25 }, (_, patch) => `v0.3.${patch}`),
    commitTags: [],
  });
  assert.equal(result.publicationVersion, '0.3.25');
  assert.equal(result.publicationTag, 'v0.3.25');
  assert.equal(result.applicationVersion, '0.3.1');
  assert.equal(result.applicationLine, '0.3');
});

test('publishes the release line to Mike and uses the editorial version only for release records', () => {
  const workflow = readFileSync(new URL('../.github/workflows/publish.yml', import.meta.url), 'utf8');
  assert.match(workflow, /mike deploy[\s\S]*"\$APPLICATION_LINE"/u);
  assert.doesNotMatch(workflow, /mike deploy[\s\S]{0,180}"\$APPLICATION_VERSION"/u);
  assert.doesNotMatch(workflow, /mike deploy[\s\S]{0,180}"\$PUBLICATION_VERSION"/u);
  assert.match(workflow, /gh release create "\$PUBLICATION_TAG"/u);
  assert.match(workflow, /Documentation publication \$PUBLICATION_VERSION for Octoform \$APPLICATION_LINE/u);
  assert.match(workflow, /Convert exact patch paths to release-line redirects/u);
  assert.match(workflow, /validate-deployment\.mjs site[\s\S]*"\$APPLICATION_LINE"/u);
  assert.match(workflow, /"\$APPLICATION_LINE" "\$\{PATCH_REDIRECTS\[@\]\}" latest stable/u);
});
