// Smoke test do site buildado: status, console, imagens, links internos, H1, title/description,
// rolagem horizontal, fontes e menu. Uso: node scripts/smoke.mjs [--porta 4410] [--paginas /,/bio/]
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { startServer } from './serve-dist.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const PORT = Number(arg('--porta', 4410));
const BASE = `http://127.0.0.1:${PORT}`;

async function paginasDoSitemap() {
  const xml = await readFile('dist/sitemap-0.xml', 'utf8');
  const urls = [...xml.matchAll(/<loc>https:\/\/espacocasamaria\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
  return [...new Set([...urls, '/casamentos-v1/', '/casamentos-v2/', '/bio/'])];
}
const paginas = arg('--paginas', null)?.split(',') ?? (await paginasDoSitemap());
// Páginas do sistema novo: as que usam o SiteLayout (marcadas com data-site="casa-maria" no <body>).
const FONTES_OK = /Distrampler|Cormorant|Inter/;
const IGNORAR = /\/cdn-cgi\/trace|googletagmanager|google-analytics|facebook|doubleclick|google\.com\/maps|gstatic|googleapis/;

const server = await startServer(PORT);
const browser = await chromium.launch();
let falhas = 0;
const check = (ok, msg) => { console.log(`${ok ? '  ✓' : '  ✗'} ${msg}`); if (!ok) falhas++; };
const linksVistos = new Set();

for (const vp of [{ nome: 'desktop', width: 1440, height: 900 }, { nome: 'celular', width: 390, height: 844 }]) {
  for (const p of paginas) {
    console.log(`\n${p} (${vp.nome})`);
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.route(IGNORAR, (r) => r.abort());
    const page = await ctx.newPage();
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !IGNORAR.test(m.text()) && !/ERR_FAILED|net::/.test(m.text())) erros.push(m.text()); });
    const resp = await page.goto(BASE + p, { waitUntil: 'networkidle' });
    check(resp?.status() === 200, `HTTP 200 (${resp?.status()})`);
    // rola até o fim para disparar lazy/reveal
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(400);
    check(erros.length === 0, `sem erro de console ${erros.length ? JSON.stringify(erros.slice(0, 3)) : ''}`);
    const r = await page.evaluate(() => ({
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      quebradas: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.getAttribute('src')),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      site: document.body.dataset.site === 'casa-maria',
      fontes: [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button,label,li')].map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim()))],
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]).filter(Boolean),
      travessao: /—| – /.test(document.body.innerText),
    }));
    check(r.h1 === 1, `um H1 (${r.h1})`);
    check(!!r.title && !!r.desc, 'title e description');
    check(r.quebradas.length === 0, `sem imagem quebrada ${r.quebradas.slice(0, 3).join(' ')}`);
    check(r.overflow <= 1, `sem rolagem horizontal (${r.overflow}px)`);
    if (r.site) {
      check(r.fontes.every((f) => FONTES_OK.test(f)), `fontes do sistema (${r.fontes.join(', ')})`);
      check(!r.travessao, 'sem travessão no texto');
      // menu
      if (vp.nome === 'desktop') {
        const gatilho = page.locator('[data-menu-gatilho]').first();
        await gatilho.focus(); await page.keyboard.press('Enter');
        check((await gatilho.getAttribute('aria-expanded')) === 'true', 'submenu abre pelo teclado');
        await page.keyboard.press('Escape');
        check((await gatilho.getAttribute('aria-expanded')) === 'false', 'submenu fecha com Esc');
      } else {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.locator('[data-menu-abrir]').click();
        check(await page.locator('[data-menu-gaveta]').isVisible(), 'gaveta do menu abre no celular');
        await page.keyboard.press('Escape');
        check(!(await page.locator('[data-menu-gaveta]').isVisible()), 'gaveta fecha com Esc');
      }
    }
    r.links.forEach((l) => linksVistos.add(l));
    await ctx.close();
  }
}

console.log('\nLinks internos');
for (const l of linksVistos) {
  if (/\.(jpg|png|webp|avif|ico|xml|txt)$/.test(l)) continue;
  const res = await fetch(BASE + l);
  check(res.status === 200, `${l} → ${res.status}`);
}

await browser.close();
server.close();
console.log(falhas ? `\n${falhas} falha(s)` : '\nTudo certo');
process.exit(falhas ? 1 : 0);
