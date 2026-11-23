// Lighthouse celular nas páginas-chave sobre o dist/. Uso: node scripts/lighthouse.mjs
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { startServer } from './serve-dist.mjs';
const PORT = 4412;
const paginas = ['/', '/confraternizacao-de-empresa/', '/casamentos/'];
const metas = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 };
mkdirSync('capturas/lighthouse', { recursive: true });
const server = await startServer(PORT);
let falhas = 0;
for (const p of paginas) {
  const out = `capturas/lighthouse/${p.replace(/\//g, '') || 'home'}.json`;
  // execFile assíncrono: o servidor roda neste mesmo processo e precisa do event loop livre para responder.
  await promisify(execFile)('npx', ['-y', 'lighthouse@12', `http://127.0.0.1:${PORT}${p}`, '--quiet', '--output=json', `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo', `--chrome-path=${chromium.executablePath()}`,
    '--chrome-flags=--headless=new --no-sandbox', '--blocked-url-patterns=*cdn-cgi*'], { maxBuffer: 64 * 1024 * 1024 });
  const r = JSON.parse(readFileSync(out, 'utf8'));
  const notas = Object.fromEntries(Object.keys(metas).map((k) => [k, Math.round(r.categories[k].score * 100)]));
  const ok = Object.entries(metas).every(([k, m]) => notas[k] >= m);
  if (!ok) falhas++;
  console.log(`${ok ? '✓' : '✗'} ${p} ${JSON.stringify(notas)} LCP ${r.audits['largest-contentful-paint'].displayValue}`);
  if (!ok) for (const a of Object.values(r.audits).filter((a) => a.score !== null && a.score < 0.9 && a.details).slice(0, 8)) console.log(`    ${a.id}: ${a.title}`);
}
server.close();
process.exit(falhas ? 1 : 0);
