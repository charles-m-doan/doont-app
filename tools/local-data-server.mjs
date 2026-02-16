import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = 4173;
// Local dev default (Windows). Override via DOONT_LOCAL_DIR or argv[2] if needed.
const DEFAULT_ROOT_DIR = 'C:\\Users\\cmatt\\OneDrive\\doont';

function normalizeRelPath(p) {
  return p.split(path.sep).join('/');
}

async function listFilesRecursively(rootDir) {
  /** @type {string[]} */
  const out = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile()) {
        const rel = path.relative(rootDir, full);
        out.push(normalizeRelPath(rel));
      }
    }
  }

  await walk(rootDir);
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(text);
}

function getQueryParam(urlObj, key) {
  return urlObj.searchParams.get(key);
}

async function main() {
  const rootDir = process.env.DOONT_LOCAL_DIR || process.argv[2] || DEFAULT_ROOT_DIR;
  const port = Number(process.env.DOONT_LOCAL_PORT || process.argv[3] || DEFAULT_PORT);

  if (!process.env.DOONT_LOCAL_DIR && !process.argv[2]) {
    console.log(`Using default local data dir: ${DEFAULT_ROOT_DIR}`);
  }

  const resolvedRoot = path.resolve(rootDir);

  let cachedPaths = null;
  let cacheTimeMs = 0;
  const CACHE_TTL_MS = 2000;

  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) return sendJson(res, 400, { message: 'Missing url' });
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      // Basic CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        });
        return res.end();
      }

      if (req.method !== 'GET') return sendJson(res, 405, { message: 'Method not allowed' });

      if (urlObj.pathname === '/__tree') {
        const now = Date.now();
        if (!cachedPaths || (now - cacheTimeMs) > CACHE_TTL_MS) {
          cachedPaths = await listFilesRecursively(resolvedRoot);
          cacheTimeMs = now;
        }
        return sendJson(res, 200, { paths: cachedPaths });
      }

      if (urlObj.pathname === '/__file') {
        const rel = getQueryParam(urlObj, 'path');
        if (!rel) return sendJson(res, 400, { message: 'Missing query param: path' });

        // Prevent directory traversal
        const relNormalized = rel.replace(/\\/g, '/');
        if (relNormalized.includes('..')) return sendJson(res, 400, { message: 'Invalid path' });

        const fullPath = path.join(resolvedRoot, ...relNormalized.split('/'));
        const fullResolved = path.resolve(fullPath);
        if (!fullResolved.startsWith(resolvedRoot)) return sendJson(res, 400, { message: 'Invalid path' });

        const buf = await fs.readFile(fullResolved);
        return sendJson(res, 200, { path: relNormalized, base64: buf.toString('base64') });
      }

      return sendJson(res, 404, { message: 'Not found' });
    } catch (e) {
      return sendJson(res, 500, { message: e?.message ?? 'Server error' });
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Doont local data server running:`);
    console.log(`  root: ${resolvedRoot}`);
    console.log(`  url:  http://localhost:${port}`);
    console.log('  endpoints:');
    console.log('    GET /__tree');
    console.log('    GET /__file?path=Doont.xlsx');
    console.log('    GET /__file?path=screenshots/2025-01-01.png');
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
