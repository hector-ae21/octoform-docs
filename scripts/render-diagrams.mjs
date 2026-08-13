import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = resolve(root, 'docs/assets/diagrams/sources');
const outputDirectory = resolve(root, 'docs/assets/diagrams');
const image = 'plantuml/plantuml@sha256:47870c1f76cfb3747bc7090bfe83013a4e3105b5a0bb1515e2baf5d3e2b3ee9d';
const sources = readdirSync(sourceDirectory)
  .filter((file) => file.endsWith('.puml'))
  .sort();

if (sources.length === 0) throw new Error('No PlantUML sources were found.');

const previous = process.argv.includes('--check')
  ? new Map(sources.map((source) => [outputName(source), readOutput(outputName(source))]))
  : null;

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--volume',
    `${root}:/workspace`,
    '--workdir',
    '/workspace',
    image,
    '-tsvg',
    '-charset',
    'UTF-8',
    '-o',
    '..',
    ...sources.map((source) => `docs/assets/diagrams/sources/${source}`),
  ],
  { cwd: root, encoding: 'utf8' },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

if (previous) {
  const changed = sources
    .map(outputName)
    .filter((output) => !previous.get(output)?.equals(readOutput(output)));
  if (changed.length > 0) {
    throw new Error(`Generated diagrams were stale: ${changed.join(', ')}`);
  }
}

console.log(`${previous ? 'Validated' : 'Rendered'} ${sources.length} PlantUML diagram${sources.length === 1 ? '' : 's'}.`);

function outputName(source) {
  return source.replace(/\.puml$/, '.svg');
}

function readOutput(output) {
  const path = resolve(outputDirectory, output);
  return existsSync(path) ? readFileSync(path) : undefined;
}
