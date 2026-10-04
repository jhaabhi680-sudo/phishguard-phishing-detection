import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load @babel/standalone in an isolated context so UMD attaches to globalThis.Babel
const babelSandbox = {};
babelSandbox.globalThis = babelSandbox;
babelSandbox.self = babelSandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'babel.min.js'), 'utf-8'), babelSandbox);
const Babel = babelSandbox.Babel;

const PORT = Number(process.env.PORT || 5173);
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 8000;

const jsxCache = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function compileJsxFile(filePath) {
  const stat = fs.statSync(filePath);
  const cached = jsxCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.code;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const result = Babel.transform(raw, {
    presets: ['react'],
    sourceType: 'module',
    filename: path.basename(filePath),
  });
  jsxCache.set(filePath, { mtimeMs: stat.mtimeMs, code: result.code });
  return result.code;
}

// Verify all JSX files on startup
function verifyAllJsxFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      verifyAllJsxFiles(fullPath);
    } else if (entry.name.endsWith('.jsx')) {
      compileJsxFile(fullPath);
    }
  }
}

if (process.argv.includes('--verify-only')) {
  try {
    verifyAllJsxFiles(path.join(__dirname, 'src'));
    console.log('All JSX files compiled and verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error('JSX Verification Error:', err);
    process.exit(1);
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Proxy /api/* requests to FastAPI backend on port 8000
  if (pathname.startsWith('/api/')) {
    const proxyReq = http.request(
      {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ detail: `Backend API proxy error: ${err.message}` }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // Serve static or JSX files
  let targetPath = pathname === '/' ? '/index.html' : pathname;
  let filePath = path.join(__dirname, targetPath);

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // SPA fallback for client routes
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.jsx') {
      const compiledCode = compileJsxFile(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(compiledCode);
      return;
    }

    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  } catch (err) {
    console.error(`Error serving ${filePath}:`, err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal Server Error: ${err.message}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  PhishGuard React Frontend Server running at:`);
  console.log(`  > Local:   http://localhost:${PORT}/`);
  console.log(`  > API Proxy: /api/* -> http://${BACKEND_HOST}:${BACKEND_PORT}/api/*\n`);
});
