import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load @babel/standalone
const babelSandbox = {};
babelSandbox.globalThis = babelSandbox;
babelSandbox.self = babelSandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'babel.min.js'), 'utf-8'), babelSandbox);
const Babel = babelSandbox.Babel;

const distDir = path.join(__dirname, 'dist');

function rewriteJsxImports(code) {
  return code.replace(/(from\s+['"][^'"]+)\.jsx(['"])/g, '$1.js$2');
}

function copyAndCompileDir(srcDir, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const outPath = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      copyAndCompileDir(srcPath, outPath);
    } else if (entry.name.endsWith('.jsx')) {
      const raw = fs.readFileSync(srcPath, 'utf-8');
      const compiled = rewriteJsxImports(
        Babel.transform(raw, {
          presets: ['react'],
          sourceType: 'module',
          filename: entry.name,
        }).code
      );
      // Write both .js (standard MIME type on all CDNs/Vercel/Render) and .jsx
      const jsOutPath = outPath.replace(/\.jsx$/, '.js');
      fs.writeFileSync(jsOutPath, compiled, 'utf-8');
      fs.writeFileSync(outPath, compiled, 'utf-8');
    } else if (entry.name.endsWith('.js')) {
      const raw = fs.readFileSync(srcPath, 'utf-8');
      fs.writeFileSync(outPath, rewriteJsxImports(raw), 'utf-8');
    } else {
      fs.copyFileSync(srcPath, outPath);
    }
  }
}

// Clean & build dist/
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy index.html and point /src/main.jsx -> /src/main.js
const rawHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const distHtml = rawHtml.replace('/src/main.jsx', '/src/main.js');
fs.writeFileSync(path.join(distDir, 'index.html'), distHtml, 'utf-8');

// Compile src/ into dist/src/
copyAndCompileDir(path.join(__dirname, 'src'), path.join(distDir, 'src'));

console.log('Successfully built production frontend into frontend/dist/');
