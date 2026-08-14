const COMPLETE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const RELEASE_LINE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * Parses a complete stable semantic version.
 *
 * @param {string} value Version without a `v` prefix.
 * @param {string} [label] Value name used in validation errors.
 * @returns {{major: number, minor: number, patch: number, version: string}}
 */
export function parseCompleteVersion(value, label = 'Version') {
  const match = COMPLETE_VERSION.exec(value ?? '');
  if (!match) {
    throw new Error(`${label} must be a complete stable MAJOR.MINOR.PATCH version`);
  }
  const [, major, minor, patch] = match;
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    version: `${major}.${minor}.${patch}`,
  };
}

/**
 * Parses a stable semantic-version release line.
 *
 * @param {string} value Version line without a `v` prefix.
 * @param {string} [label] Value name used in validation errors.
 * @returns {{major: number, minor: number, version: string}}
 */
export function parseReleaseLine(value, label = 'Release line') {
  const match = RELEASE_LINE.exec(value ?? '');
  if (!match) throw new Error(`${label} must be a complete MAJOR.MINOR release line`);
  const [, major, minor] = match;
  return { major: Number(major), minor: Number(minor), version: `${major}.${minor}` };
}

/**
 * Finds exact patch paths that must remain redirects for a documentation line.
 *
 * @param {Array<{version?: unknown, aliases?: unknown}>} entries Mike version records.
 * @param {string} releaseLine Documentation release line.
 * @returns {{versions: string[], redirects: string[]}}
 */
export function collectPatchDocumentationPaths(entries, releaseLine) {
  if (!Array.isArray(entries)) throw new Error('Mike versions must be an array');
  const { version: line } = parseReleaseLine(releaseLine);
  const escapedLine = line.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const exactPatch = new RegExp(`^${escapedLine}\\.\\d+$`, 'u');
  const versions = new Set();
  const redirects = new Set();

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    if (typeof entry.version === 'string' && exactPatch.test(entry.version)) {
      versions.add(entry.version);
      redirects.add(entry.version);
    }
    if (!Array.isArray(entry.aliases)) continue;
    for (const alias of entry.aliases) {
      if (typeof alias === 'string' && exactPatch.test(alias)) redirects.add(alias);
    }
  }

  const byPatch = (left, right) => Number(left.slice(line.length + 1)) - Number(right.slice(line.length + 1));
  return { versions: [...versions].sort(byPatch), redirects: [...redirects].sort(byPatch) };
}

/**
 * Returns the compatibility line for a complete semantic version.
 *
 * @param {string} version Complete stable semantic version.
 * @returns {string}
 */
export function releaseLine(version) {
  const parsed = parseCompleteVersion(version);
  return `${parsed.major}.${parsed.minor}`;
}

/**
 * Parses Git tag references, peeling annotated tags to their source commits.
 *
 * @param {string} output Tab-separated `git for-each-ref` output.
 * @returns {{name: string, target: string}[]}
 */
export function parseTagReferences(output) {
  return output.split(/\r?\n/u).filter(Boolean).map((line) => {
    const [name, peeledTarget, directTarget] = line.split('\t');
    if (!name || !(peeledTarget || directTarget)) throw new Error('Invalid Git tag reference');
    return { name, target: peeledTarget || directTarget };
  });
}

/**
 * Resolves the immutable publication assigned to a documentation source commit.
 *
 * @param {{applicationVersion: string, allTags: string[], commitTags: string[]}} input
 * @returns {{applicationVersion: string, applicationLine: string, publicationVersion: string, publicationTag: string, reused: boolean, publishDocumentationLine: boolean}}
 */
export function resolveDocumentationRelease({ applicationVersion, allTags, commitTags }) {
  const application = parseCompleteVersion(applicationVersion, 'Octoform version');
  const applicationLine = `${application.major}.${application.minor}`;
  const parseTag = (tag) => {
    if (!tag.startsWith('v')) return undefined;
    try {
      return { tag, ...parseCompleteVersion(tag.slice(1), 'Documentation tag') };
    } catch {
      return undefined;
    }
  };
  const existing = [...new Set(allTags)].map(parseTag).filter(Boolean);
  const onCommit = [...new Set(commitTags)].map(parseTag).filter(Boolean);
  const linePatches = existing
    .filter(({ major, minor }) => major === application.major && minor === application.minor)
    .map(({ patch }) => patch);
  if (onCommit.length > 1) {
    throw new Error('A documentation source commit cannot have multiple release tags');
  }
  if (onCommit.length === 1) {
    const current = onCommit[0];
    if (!existing.some(({ tag }) => tag === current.tag)) {
      throw new Error(`Commit tag ${current.tag} is missing from the repository tag set`);
    }
    if (`${current.major}.${current.minor}` !== applicationLine) {
      throw new Error(
        `Existing documentation tag ${current.tag} does not match Octoform release line ${applicationLine}`,
      );
    }
    return {
      applicationVersion: application.version,
      applicationLine,
      publicationVersion: current.version,
      publicationTag: current.tag,
      reused: true,
      publishDocumentationLine: current.patch === Math.max(...linePatches),
    };
  }
  const patch = linePatches.length === 0 ? 0 : Math.max(...linePatches) + 1;
  if (!Number.isSafeInteger(patch)) {
    throw new Error(`Documentation publication patch overflow for ${applicationLine}`);
  }
  const publicationVersion = `${applicationLine}.${patch}`;
  return {
    applicationVersion: application.version,
    applicationLine,
    publicationVersion,
    publicationTag: `v${publicationVersion}`,
    reused: false,
    publishDocumentationLine: true,
  };
}
