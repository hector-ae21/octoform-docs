import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseCompleteVersion,
  parseTagReferences,
  resolveDocumentationRelease,
} from '../scripts/release-version.mjs';
import { validateReleaseIdentity } from '../scripts/validate-release.mjs';

test('selects patch zero for the first documentation release line', () => {
  assert.deepEqual(
    resolveDocumentationRelease({ applicationVersion: '0.3.1', allTags: [], commitTags: [] }),
    {
      applicationVersion: '0.3.1',
      docsVersion: '0.3.0',
      docsTag: 'v0.3.0',
      docsLine: '0.3',
      reused: false,
      promoteAliases: true,
    },
  );
});

test('increments only the patch within the matching release line', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.8',
    allTags: ['v0.2.9', 'v0.3.0', 'v0.3.4', 'not-a-release'],
    commitTags: [],
  });
  assert.equal(result.docsVersion, '0.3.5');
  assert.equal(result.docsLine, '0.3');
});

test('reuses the release assigned to the same source commit', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.9',
    allTags: ['v0.3.0', 'v0.3.1'],
    commitTags: ['v0.3.1'],
  });
  assert.equal(result.docsVersion, '0.3.1');
  assert.equal(result.reused, true);
  assert.equal(result.promoteAliases, true);
});

test('does not move aliases backwards when recovering an older tagged commit', () => {
  const result = resolveDocumentationRelease({
    applicationVersion: '0.3.9',
    allTags: ['v0.3.0', 'v0.3.1'],
    commitTags: ['v0.3.0'],
  });
  assert.equal(result.docsVersion, '0.3.0');
  assert.equal(result.promoteAliases, false);
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
    docsVersion: '0.3.7',
    applicationVersion: '0.3.1',
    packageJson: JSON.stringify({ devDependencies: { '@hector21/octoform': '0.3.1' } }),
    releasePage: 'docs_line: "0.3"\napplication_version: "0.3.1"',
  }));
});

test('rejects documentation and application release-line drift', () => {
  assert.throws(() => validateReleaseIdentity({
    docsVersion: '0.4.0',
    applicationVersion: '0.3.1',
    packageJson: JSON.stringify({ devDependencies: { '@hector21/octoform': '0.3.1' } }),
    releasePage: 'docs_line: "0.4"\napplication_version: "0.3.1"',
  }), /release lines do not match/u);
});
