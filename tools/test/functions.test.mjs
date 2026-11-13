// Offline tests for the Netlify Functions.
//
//   npm run test:functions        (from tools/)
//
// Bundles each function with @netlify/blobs swapped for an in-memory fake,
// then exercises it in production and preview contexts. No network, no
// real data, no email: SMTP points at a closed local port, so sends fail
// fast and are logged, exactly as a real SMTP outage would be.

import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, '../out/test-bundle');
mkdirSync(OUT, { recursive: true });

async function bundle(name, source) {
  const outfile = path.join(OUT, `${name}.mjs`);
  await build({
    ...(source
      ? { stdin: { contents: source, resolveDir: path.join(ROOT, 'netlify/functions'), loader: 'js' } }
      : { entryPoints: [path.join(ROOT, `netlify/functions/${name}.js`)] }),
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    logLevel: 'error',
    alias: { '@netlify/blobs': path.join(HERE, 'fake-blobs.js') },
    nodePaths: [path.join(ROOT, 'node_modules')],
  });
  return (await import(pathToFileURL(outfile).href)).default;
}

const fake = await import(pathToFileURL(path.join(HERE, 'fake-blobs.js')).href);
const prod = { deploy: { context: 'production' } };
const preview = { deploy: { context: 'deploy-preview' } };
const unknown = {};
process.env.EXPORT_TOKEN = 'test-token';
process.env.SMTP_HOST = '127.0.0.1';
process.env.SMTP_PORT = '9';
// The functions log every failed email; that is expected here, so mute it.
console.error = () => {};

const signon = await bundle('signon');
const signatories = await bundle('signatories');
const exporter = await bundle('export');
// The list endpoint as it was before the index, to prove the refactor changed
// nothing visible. Refactor guard only: when the list's output is meant to
// change (e.g. how institutional signatories are shown), delete this and the
// 'matches the previous implementation' test below.
const oldSource = execSync('git show 08b8f7b:netlify/functions/signatories.js', { cwd: ROOT }).toString();
const signatoriesBefore = await bundle('signatories-before', oldSource);

let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
};
const form = (fields) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request('http://x/.netlify/functions/signon', { method: 'POST', body: fd });
};
const person = (i, extra = {}) => ({
  name: `Person ${i}`,
  role: 'Researcher',
  country: ['Netherlands', 'nederland', 'Germany'][i % 3],
  category: 'Design Research faculty',
  email: `p${i}@example.org`,
  signing_as: i % 4 === 0 ? 'On behalf of an institution' : 'An individual',
  organisation: i % 4 === 0 ? `Institute ${i % 7}` : i % 2 ? '' : `Uni ${i}`,
  name_visibility: i % 3 === 0 ? 'private' : 'public',
  ...extra,
});
const get = async (fn, ctx, url = 'http://x/') => {
  const r = await fn(new Request(url), ctx);
  return { status: r.status, headers: r.headers, body: await r.json() };
};
const store = (n) => [...(globalThis.__fakeStores.get(n) || new Map()).values()];

console.log('sign-on');
await test('production writes to the live store', async () => {
  const r = await signon(form(person(1)), prod);
  assert.equal(r.status, 200);
  assert.equal(store('signatures').length, 1);
});
await test('preview writes to its own store and sends no email', async () => {
  const r = await (await signon(form(person(2)), preview)).json();
  assert.deepEqual(r, { ok: true, preview: true });
  assert.equal(store('signatures').length, 1);
  assert.equal(store('signatures-preview').length, 1);
});
await test('an unknown context behaves as production', async () => {
  await signon(form(person(3)), unknown);
  assert.equal(store('signatures').length, 2);
});
await test('the honeypot stores nothing', async () => {
  await signon(form(person(4, { _gotcha: 'bot' })), prod);
  assert.equal(store('signatures').length, 2);
});

console.log('public list');
for (let i = 5; i < 848; i++) await signon(form(person(i)), prod); // 845 in total
await test('output matches the previous implementation, minus the internal field', async () => {
  const before = await get(signatoriesBefore, prod);
  const after = await get(signatories, prod);
  const strip = (b) => ({ ...b, signatories: b.signatories.map(({ institutional, ...r }) => r) });
  assert.deepEqual(after.body, strip(before.body));
  assert.ok(after.body.signatories.length > 400);
  assert.ok(after.body.signatories.every((r) => !('institutional' in r)));
});
await test('never returns an email address', async () => {
  const { body } = await get(signatories, prod);
  assert.ok(!JSON.stringify(body).includes('@'));
});
await test('a repeat request reads only the index: 1 read, not 845', async () => {
  fake.reads.count = 0;
  await get(signatories, prod);
  assert.equal(fake.reads.count, 1);
});
await test('a new signature is fetched on its own and appears', async () => {
  await signon(form(person(9001, { name: 'Brand New' })), prod);
  fake.reads.count = 0;
  const { body } = await get(signatories, prod);
  assert.equal(fake.reads.count, 2); // the index, plus the one new record
  assert.ok(body.signatories.some((r) => r.name === 'Brand New'));
});
await test('a deleted signature disappears', async () => {
  const m = globalThis.__fakeStores.get('signatures');
  const key = [...m.entries()].find(([, v]) => v.name === 'Brand New')[0];
  m.delete(key);
  const { body } = await get(signatories, prod);
  assert.ok(!body.signatories.some((r) => r.name === 'Brand New'));
});
await test('the index never holds an email address', async () => {
  assert.ok(!JSON.stringify(store('signatures-index')).includes('@example.org'));
});
await test('responses opt into the durable edge cache', async () => {
  const { headers } = await get(signatories, prod);
  assert.match(headers.get('netlify-cdn-cache-control'), /durable/);
});
await test('a preview lists only preview signatures', async () => {
  const { body } = await get(signatories, preview);
  assert.equal(body.total, 1);
});

console.log('export');
await test('exports the live store with the right token', async () => {
  const r = await exporter(new Request('http://x/?token=test-token&format=json'), prod);
  assert.equal((await r.json()).count, 845);
});
await test('refuses a wrong token', async () => {
  const r = await exporter(new Request('http://x/?token=nope'), prod);
  assert.equal(r.status, 401);
});

console.log(`\n${passed} passed`);
