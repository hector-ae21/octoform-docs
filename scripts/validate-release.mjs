import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCompleteVersion, releaseLine } from './release-version.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Validates that source metadata describes the selected documentation release.
 *
 * @param {{docsVersion: string, applicationVersion: string, packageJson: string, releasePage: string}} input
 */
export function validateReleaseIdentity({ docsVersion, applicationVersion, packageJson, releasePage }) {
  parseCompleteVersion(docsVersion, 'Documentation version');
  parseCompleteVersion(applicationVersion, 'Octoform version');
  const docsLine = releaseLine(docsVersion);
  if (releaseLine(applicationVersion) !== docsLine) {
    throw new Error('Documentation and Octoform release lines do not match');
  }
  const packageData = JSON.parse(packageJson);
  if (packageData.devDependencies?.['@hector21/octoform'] !== applicationVersion) {
    throw new Error(`Package toolchain does not pin Octoform ${applicationVersion}`);
  }
  if (!releasePage.includes(`docs_line: "${docsLine}"`)) {
    throw new Error(`Release page does not declare documentation line ${docsLine}`);
  }
  if (!releasePage.includes(`application_version: "${applicationVersion}"`)) {
    throw new Error(`Release page does not declare Octoform ${applicationVersion}`);
  }
}

async function main() {
  const docsVersion = process.argv[2];
  const applicationVersion = process.argv[3];
  const [packageJson, releasePage] = await Promise.all([
    readFile(resolve(root, 'package.json'), 'utf8'),
    readFile(resolve(root, 'docs/releases/index.md'), 'utf8'),
  ]);
  validateReleaseIdentity({ docsVersion, applicationVersion, packageJson, releasePage });
  console.log(`Validated Octoform ${applicationVersion} documentation release ${docsVersion}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
