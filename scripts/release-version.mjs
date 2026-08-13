const COMPLETE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

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
 * Resolves the immutable documentation release assigned to a source commit.
 *
 * @param {{applicationVersion: string, allTags: string[], commitTags: string[]}} input
 * @returns {{applicationVersion: string, docsVersion: string, docsTag: string, docsLine: string, reused: boolean, promoteAliases: boolean}}
 */
export function resolveDocumentationRelease({ applicationVersion, allTags, commitTags }) {
  const application = parseCompleteVersion(applicationVersion, 'Octoform version');
  const docsLine = `${application.major}.${application.minor}`;
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
    if (`${current.major}.${current.minor}` !== docsLine) {
      throw new Error(
        `Existing documentation tag ${current.tag} does not match Octoform release line ${docsLine}`,
      );
    }
    return {
      applicationVersion: application.version,
      docsVersion: current.version,
      docsTag: current.tag,
      docsLine,
      reused: true,
      promoteAliases: current.patch === Math.max(...linePatches),
    };
  }
  const patch = linePatches.length === 0 ? 0 : Math.max(...linePatches) + 1;
  if (!Number.isSafeInteger(patch)) throw new Error(`Documentation patch overflow for ${docsLine}`);
  const docsVersion = `${docsLine}.${patch}`;
  return {
    applicationVersion: application.version,
    docsVersion,
    docsTag: `v${docsVersion}`,
    docsLine,
    reused: false,
    promoteAliases: true,
  };
}
