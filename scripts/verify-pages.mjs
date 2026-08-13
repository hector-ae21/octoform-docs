import { setTimeout as delay } from 'node:timers/promises';
import { parseCompleteVersion } from './release-version.mjs';

const [baseUrlInput, version, ...aliases] = process.argv.slice(2);
if (!baseUrlInput || !version) {
  throw new Error('Usage: verify-pages BASE_URL VERSION [ALIAS...]');
}
parseCompleteVersion(version, 'Documentation version');
const baseUrl = new URL(baseUrlInput.endsWith('/') ? baseUrlInput : `${baseUrlInput}/`);
await verifyText(new URL(`${version}/`, baseUrl), ['Octoform', new URL(`${version}/`, baseUrl).href]);
await verifyText(new URL(`${version}/configuration/`, baseUrl), ['Octoform', 'Configuration']);
await verifyBinary(new URL(`${version}/assets/brand/octoform-mark.png`, baseUrl));
for (const alias of aliases) {
  await verifyText(new URL(`${alias}/`, baseUrl), [`../${version}/`]);
}
await verifyText(baseUrl, ['latest/']);
console.log(`Verified documentation ${version} and aliases over HTTPS.`);

async function request(url) {
  let lastError;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok) return response;
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(Math.min(attempt * 5_000, 30_000));
  }
  throw lastError;
}

async function verifyText(url, fragments) {
  const response = await request(url);
  const content = await response.text();
  for (const fragment of fragments) {
    if (!content.includes(fragment)) throw new Error(`${url} does not contain ${fragment}`);
  }
}

async function verifyBinary(url) {
  const response = await request(url);
  if ((await response.arrayBuffer()).byteLength === 0) throw new Error(`${url} is empty`);
}
