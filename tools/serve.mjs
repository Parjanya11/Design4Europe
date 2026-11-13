// Local preview server.
//
//   npm run serve            then open http://localhost:8000
//
// Serves the site from the repo root and stands in for the Netlify
// Functions with FAKE data from ./fixtures, so the page renders fully
// without touching the live signature store. Nothing here is deployed.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
};

// Stand-ins for the functions. Shapes match the real responses.
const FUNCTIONS = {
  'GET /.netlify/functions/signatories': async () => [200, await readFile(path.join(FIXTURES, 'signatories.json'))],
  'POST /.netlify/functions/signon': async () => [200, JSON.stringify({ ok: true, fake: true })],
};

export function startServer(port = 8000) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const fn = FUNCTIONS[`${req.method} ${url.pathname}`];
    if (fn) {
      const [status, body] = await fn();
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(body);
    }
    if (url.pathname.startsWith('/.netlify/')) {
      res.writeHead(404, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'Not available in local preview' }));
    }
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404); res.end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8000;
  await startServer(port);
  console.log(`Local preview on http://localhost:${port}  (functions answer with fake data)`);
}
