import { appendFile, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTagReferences, resolveDocumentationRelease } from './release-version.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceCommit = process.argv[2];
if (!/^[0-9a-f]{40}$/i.test(sourceCommit ?? '')) {
  throw new Error('Source commit must be a complete Git object ID');
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const applicationVersion = packageJson.devDependencies?.['@hector21/octoform'];
const tagReferences = readTagReferences();
const allTags = tagReferences.map(({ name }) => name);
const commitTags = tagReferences
  .filter(({ target }) => target.toLowerCase() === sourceCommit.toLowerCase())
  .map(({ name }) => name);
const release = resolveDocumentationRelease({ applicationVersion, allTags, commitTags });
const output = {
  application_version: release.applicationVersion,
  docs_version: release.docsVersion,
  docs_tag: release.docsTag,
  docs_line: release.docsLine,
  reused: String(release.reused),
  promote_aliases: String(release.promoteAliases),
};

if (process.env.GITHUB_OUTPUT) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `${Object.entries(output).map(([key, value]) => `${key}=${value}`).join('\n')}\n`,
  );
}
console.log(JSON.stringify(output));

function readTagReferences() {
  const format = '%(refname:strip=2)%09%(*objectname)%09%(objectname)';
  const result = spawnSync(
    'git',
    ['for-each-ref', `--format=${format}`, 'refs/tags/v*.*.*'],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Unable to inspect Git tags');
  return parseTagReferences(result.stdout);
}
