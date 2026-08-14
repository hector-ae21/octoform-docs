import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const pullRequestWorkflow = readFileSync('.github/workflows/pull-request.yml', 'utf8');
const publishWorkflow = readFileSync('.github/workflows/publish.yml', 'utf8');

test('runs complete documentation verification only before merge', () => {
  assert.match(pullRequestWorkflow, /^  pull_request:$/mu);
  assert.match(pullRequestWorkflow, /^  workflow_dispatch:$/mu);
  assert.doesNotMatch(pullRequestWorkflow, /^  push:$/mu);
  assert.match(pullRequestWorkflow, /^    name: Verify documentation$/mu);
  assert.match(pullRequestWorkflow, /^        run: npm run verify$/mu);

  const completeVerificationRuns = `${pullRequestWorkflow}\n${publishWorkflow}`
    .match(/run: npm run verify/gu) ?? [];
  assert.equal(completeVerificationRuns.length, 1);
});

test('builds publication artifacts without repeating browser verification', () => {
  assert.match(publishWorkflow, /^  push:$/mu);
  assert.match(publishWorkflow, /^        run: npm run build$/mu);
  assert.doesNotMatch(publishWorkflow, /npm run verify/u);
  assert.doesNotMatch(publishWorkflow, /playwright install/u);
  assert.match(publishWorkflow, /scripts\/validate-deployment\.mjs/u);
  assert.match(publishWorkflow, /scripts\/verify-pages\.mjs/u);
});
