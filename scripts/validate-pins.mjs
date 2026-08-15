import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Every place a documentation page names the exact application patch in a
 * form a reader can copy or follow.
 *
 * Prose about an earlier patch is legitimate and stays out of this: a page
 * saying what `0.4.0` introduced is history, not a stale pin. What is checked
 * is only what would send a reader to the wrong artefact — an install command,
 * a release download, and the frontmatter the publication workflow reads.
 */
const PINS = [
  { name: 'install command', pattern: /@hector21\/octoform@(\d+\.\d+\.\d+)/g },
  { name: 'release download', pattern: /releases\/download\/v(\d+\.\d+\.\d+)\//g },
  {
    name: 'validated patch declaration',
    pattern: /validated_application_version: "(\d+\.\d+\.\d+)"/g,
  },
];

/**
 * Check every copyable patch reference against the pinned package.
 *
 * @param {{pinned: string, pages: Map<string, string>}} input
 * @returns {{checked: number}}
 */
export function validatePins({ pinned, pages }) {
  const failures = [];
  let checked = 0;

  for (const [page, source] of pages) {
    /**
     * A page whose own filename declares a version documents that version —
     * an audited baseline of a patch that has since been superseded. Its
     * commands are supposed to name the patch they were audited against, so
     * that is what they are checked against instead of the current pin.
     */
    const documented = /\bv(\d+\.\d+\.\d+)\b/.exec(page)?.[1] ?? pinned;

    for (const { name, pattern } of PINS) {
      for (const match of source.matchAll(pattern)) {
        checked += 1;
        if (match[1] !== documented) {
          failures.push(`${page}: ${name} names ${match[1]}, but the page documents ${documented}`);
        }
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Stale application patch references:\n${failures.join('\n')}`);
  }
  return { checked };
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(path)));
    else if (entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}

async function main() {
  const packageData = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  const pinned = packageData.devDependencies?.['@hector21/octoform'];
  if (typeof pinned !== 'string') {
    throw new Error('package.json must pin @hector21/octoform exactly');
  }

  const docs = resolve(root, 'docs');
  const changelog = resolve(docs, 'releases/changelog.md');
  const pages = new Map();
  for (const file of await markdownFiles(docs)) {
    // The changelog is the one page whose job is to name older patches.
    if (file === changelog) continue;
    pages.set(file.slice(root.length + 1).replaceAll('\\', '/'), await readFile(file, 'utf8'));
  }

  const { checked } = validatePins({ pinned, pages });
  console.log(`Validated ${checked} copyable references to Octoform ${pinned}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
