// Servidor estático mínimo do dist/ para testes (substitui o astro preview, que no Astro 7 é daemon único).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const PORT = Number(process.argv[2] || 4410);
const ROOT = join(process.cwd(), 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.mp4': 'video/mp4' };

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const candidates = clean.endsWith('/') ? [join(ROOT, clean, 'index.html')] : [join(ROOT, clean), join(ROOT, clean, 'index.html')];
  for (const c of candidates) { try { if ((await stat(c)).isFile()) return c; } catch {} }
  return null;
}

export function startServer(port = PORT) {
  const server = http.createServer(async (req, res) => {
    const file = await resolve(req.url || '/');
    if (!file) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      try { res.end(await readFile(join(ROOT, '404.html'))); } catch { res.end('404'); }
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startServer();
  console.log(`dist/ em http://127.0.0.1:${PORT}`);
}
