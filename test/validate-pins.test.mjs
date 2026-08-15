import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePins } from '../scripts/validate-pins.mjs';

test('accepts references that match the pinned package', () => {
  const pages = new Map([
    ['docs/getting-started/installation.md', 'npx @hector21/octoform@0.4.1 --help'],
    ['docs/releases/index.md', 'validated_application_version: "0.4.1"'],
  ]);
  assert.deepEqual(validatePins({ pinned: '0.4.1', pages }), { checked: 2 });
});

test('rejects an install command left on an older patch', () => {
  const pages = new Map([['docs/x.md', 'npm install @hector21/octoform@0.4.0']]);
  assert.throws(
    () => validatePins({ pinned: '0.4.1', pages }),
    /docs\/x\.md: install command names 0\.4\.0/u,
  );
});

test('rejects a release download left on an older patch', () => {
  const pages = new Map([['docs/x.md', 'releases/download/v0.4.0/SHA256SUMS']]);
  assert.throws(() => validatePins({ pinned: '0.4.1', pages }), /release download names 0\.4\.0/u);
});

test('rejects a stale validated-patch declaration', () => {
  const pages = new Map([['docs/releases/index.md', 'validated_application_version: "0.4.0"']]);
  assert.throws(
    () => validatePins({ pinned: '0.4.1', pages }),
    /validated patch declaration names 0\.4\.0/u,
  );
});

test('a page named for a version is checked against that version, not the pin', () => {
  const pages = new Map([
    ['docs/reference/v0.3.1-baseline.md', 'npx @hector21/octoform@0.3.1 audit'],
  ]);
  assert.deepEqual(validatePins({ pinned: '0.4.1', pages }), { checked: 1 });
});

test('a page named for a version still has to be internally consistent', () => {
  const pages = new Map([
    ['docs/reference/v0.3.1-baseline.md', 'npx @hector21/octoform@0.4.1 audit'],
  ]);
  assert.throws(
    () => validatePins({ pinned: '0.4.1', pages }),
    /the page documents 0\.3\.1/u,
  );
});
