import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCompleteVersion, releaseLine } from './release-version.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Validates that source metadata describes the selected documentation publication.
 *
 * @param {{publicationVersion: string, applicationVersion: string, packageJson: string, releasePage: string}} input
 */
export function validateReleaseIdentity({ publicationVersion, applicationVersion, packageJson, releasePage }) {
  parseCompleteVersion(publicationVersion, 'Documentation publication version');
  parseCompleteVersion(applicationVersion, 'Octoform version');
  const applicationLine = releaseLine(applicationVersion);
  if (releaseLine(publicationVersion) !== applicationLine) {
    throw new Error('Documentation publication and Octoform release lines do not match');
  }
  const packageData = JSON.parse(packageJson);
  if (packageData.devDependencies?.['@hector21/octoform'] !== applicationVersion) {
    throw new Error(`Package toolchain does not pin Octoform ${applicationVersion}`);
  }
  if (!releasePage.includes(`application_line: "${applicationLine}"`)) {
    throw new Error(`Release page does not declare Octoform release line ${applicationLine}`);
  }
  if (!releasePage.includes(`application_version: "${applicationVersion}"`)) {
    throw new Error(`Release page does not declare Octoform ${applicationVersion}`);
  }
}

async function main() {
  const publicationVersion = process.argv[2];
  const applicationVersion = process.argv[3];
  const [packageJson, releasePage] = await Promise.all([
    readFile(resolve(root, 'package.json'), 'utf8'),
    readFile(resolve(root, 'docs/releases/index.md'), 'utf8'),
  ]);
  validateReleaseIdentity({ publicationVersion, applicationVersion, packageJson, releasePage });
  console.log(
    `Validated documentation publication ${publicationVersion} for Octoform ${applicationVersion}.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
