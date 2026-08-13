import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const windowsMkDocs = resolve(root, '.venv/Scripts/mkdocs.exe');
const unixMkDocs = resolve(root, '.venv/bin/mkdocs');
const mkdocs = process.env.MKDOCS ??
  (existsSync(windowsMkDocs) ? windowsMkDocs : existsSync(unixMkDocs) ? unixMkDocs : 'mkdocs');

process.env.NO_MKDOCS_2_WARNING = 'true';
runNpm('prepare:privacy');
run(mkdocs, ['build', '--strict']);

function runNpm(script) {
  if (!process.env.npm_execpath) throw new Error('npm_execpath is unavailable');
  run(process.execPath, [process.env.npm_execpath, 'run', script]);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
