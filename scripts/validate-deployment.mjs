import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Validates the exact remote tree prepared for GitHub Pages.
 *
 * @param {{builtDirectory: string, publishedDirectory: string, version: string, aliases: string[]}} input
 */
export async function validateDeployment({ builtDirectory, publishedDirectory, version, aliases }) {
  const canonicalDirectory = resolve(publishedDirectory, version);
  const [builtFiles, canonicalFiles] = await Promise.all([
    listFiles(builtDirectory),
    listFiles(canonicalDirectory),
  ]);
  if (JSON.stringify(builtFiles) !== JSON.stringify(canonicalFiles)) {
    throw new Error(`Published ${version} file list differs from the generated site`);
  }
  for (const file of builtFiles) {
    const [builtDigest, publishedDigest] = await Promise.all([
      digest(resolve(builtDirectory, file)),
      digest(resolve(canonicalDirectory, file)),
    ]);
    if (builtDigest !== publishedDigest) {
      throw new Error(`Published ${version}/${file} differs from the generated site`);
    }
  }

  const versions = JSON.parse(await readFile(resolve(publishedDirectory, 'versions.json'), 'utf8'));
  const selected = versions.find((entry) => entry.version === version);
  if (!selected) throw new Error(`versions.json does not contain ${version}`);
  if (!versions.some((entry) => entry.aliases.includes('latest'))) {
    throw new Error('versions.json does not define the latest alias');
  }
  for (const alias of aliases) {
    if (!selected.aliases.includes(alias)) {
      throw new Error(`Alias ${alias} does not point to ${version} in versions.json`);
    }
    const aliasDirectory = resolve(publishedDirectory, alias);
    const info = await lstat(aliasDirectory);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      throw new Error(`Alias ${alias} must be a real redirect directory`);
    }
    const redirect = await readFile(resolve(aliasDirectory, 'index.html'), 'utf8');
    if (!redirect.includes(`../${version}/`)) {
      throw new Error(`Alias ${alias} does not redirect to ${version}`);
    }
  }
  const rootRedirect = await readFile(resolve(publishedDirectory, 'index.html'), 'utf8');
  if (!rootRedirect.includes('latest/')) throw new Error('Pages root does not redirect to latest');
  const latestInfo = await lstat(resolve(publishedDirectory, 'latest'));
  if (latestInfo.isSymbolicLink() || !latestInfo.isDirectory()) {
    throw new Error('Alias latest must be a real redirect directory');
  }
  const publishedFiles = await listFiles(publishedDirectory, { rejectLinks: true });
  if (publishedFiles.length === 0) throw new Error('Published tree is empty');
}

async function listFiles(root, options = {}) {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = resolve(directory, entry.name);
      if (entry.isSymbolicLink() && options.rejectLinks) {
        throw new Error(`Published tree contains symbolic link ${relative(root, absolute)}`);
      }
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) files.push(relative(root, absolute).split(sep).join('/'));
    }
  }
  await visit(root);
  return files.sort();
}

async function digest(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function main() {
  const [, , builtDirectory, publishedDirectory, version, ...aliases] = process.argv;
  if (!builtDirectory || !publishedDirectory || !version) {
    throw new Error('Usage: validate-deployment BUILT PUBLISHED VERSION [ALIAS...]');
  }
  await validateDeployment({ builtDirectory, publishedDirectory, version, aliases });
  console.log(`Validated remote Pages tree for documentation ${version}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
