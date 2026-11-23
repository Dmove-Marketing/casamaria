# Site Casa Maria: redesign (home, menu, páginas por tipo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home institucional com triagem, menu e 5 páginas de tipo de evento num sistema de design único que evolui a identidade do Astro atual.

**Architecture:** Tokens + CSS base em `src/styles/site/`; componentes de seção em `src/components/site/` (CSS escopado); fatos da casa em `src/data/casa.ts` e o registro dos 5 tipos em `src/data/eventos.ts`; uma rota dinâmica `src/pages/[evento].astro` renderiza `PaginaEvento.astro` para cada tipo. Testes = build + `astro check` + smoke Playwright sobre o `dist/` servido por um servidor estático próprio + contrato GTM v2 + Lighthouse.

**Tech Stack:** Astro 7.3 (estático), TypeScript, CSS puro, Playwright 1.60 (já em devDependencies), fontes @fontsource (já instaladas), Lighthouse via `npx`.

**Spec:** `docs/superpowers/specs/2026-11-22-site-casa-maria-redesign-design.md` (ler antes de qualquer tarefa).

## Global Constraints

- Repositório **público**: nunca escrever número de venda, receita, leads ou dado de CRM em nenhum arquivo do repo.
- Texto de site em pt-BR, frases curtas, **sem travessão** (nem `—` nem ` – `). Endereço com vírgulas.
- Só fatos da casa (ver `src/data/casa.ts`). Nada de preço, prêmio, número ou serviço inventado. Capacidade: **até 250 convidados**.
- Nenhuma fonte abaixo de `0.75rem`; contraste AA.
- Imagens só via `<Img src="pasta/arquivo.ext">` de `src/assets/images/` (lista na Task 4). Hero/LCP com `priority`.
- Formulário só via `src/components/LeadForm.astro` (não criar outro). Máx. 2 por página, `idPrefix`/`formId` distintos (`hero`/`hero-form` e padrão/`lead-form`).
- Não mexer em: `src/pages/casamentos-v1.astro`, `casamentos-v2.astro`, `bio.astro`, `politica-de-privacidade.astro`, `404.astro`, `src/components/lp/*`, `src/styles/lp.css`, `src/components/ui/*`, `src/layouts/Base.astro`, `src/scripts/*` (exceto onde a task manda).
- Sem Release, sem deploy, sem `npm run deploy`. Commits na branch `feat/unificacao-astro7`.
- Servidor para testes: `node scripts/serve-dist.mjs <porta>` (Task 1). **Não usar `astro preview`** (no Astro 7 vira daemon único por projeto e já há outros servidores locais nas portas 4321/4329/4330).
- Commits terminam com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Estrutura de arquivos

```
src/styles/site/tokens.css        variáveis (cores, tipos, espaço)
src/styles/site/base.css          reset leve, tipografia, .container, .section, .btn, .overline, .reveal
src/data/casa.ts                  fatos da casa (fonte única)
src/data/eventos.ts               tipos EventoTipo + registro dos 5 tipos (conteúdo)
src/components/site/icones.ts     SVGs de linha usados em FeatureList
src/components/site/SiteLayout.astro
src/components/site/SiteHeader.astro
src/components/site/SiteFooter.astro
src/components/site/Hero.astro
src/components/site/ProofBar.astro
src/components/site/SectionHeading.astro
src/components/site/SplitFeature.astro
src/components/site/FeatureList.astro
src/components/site/EventTypeGrid.astro
src/components/site/CtaBand.astro
src/components/site/ServicesGrid.astro
src/components/site/AmbientesMarquee.astro
src/components/site/Testimonials.astro
src/components/site/ClientLogos.astro
src/components/site/Gallery.astro
src/components/site/Faq.astro
src/components/site/ContactSection.astro
src/components/site/LocationMap.astro
src/components/site/PaginaEvento.astro
src/pages/[evento].astro          rota dos 5 tipos
src/pages/index.astro             home nova (reescrita)
src/pages/lab/*.astro             páginas de teste dos componentes (removidas na Task 7)
scripts/serve-dist.mjs            servidor estático do dist/
scripts/smoke.mjs                 smoke test Playwright
```

Ordem e paralelismo: **Task 1** → (**Task 2**, **Task 3**, **Task 4**, **Task 5** em paralelo: arquivos disjuntos) → (**Task 6**, **Task 7a** em paralelo) → **Task 7b**.

---

### Task 1: Fundação (tokens, base, dados da casa, tipos, servidor e smoke)

**Files:**
- Create: `src/styles/site/tokens.css`, `src/styles/site/base.css`, `src/data/casa.ts`, `src/data/eventos.ts` (só tipos + `eventos = []` provisório), `scripts/serve-dist.mjs`, `scripts/smoke.mjs`
- Modify: `config.json` (campo `social`), `package.json` (scripts `check`, `smoke`; devDependency `@astrojs/check` + `typescript`)

**Interfaces:**
- Produces:
  - `casa` (ver código), `EventoTipo`, `eventos: EventoTipo[]`, `eventoPorSlug(slug): EventoTipo | undefined`
  - `node scripts/serve-dist.mjs <porta>` serve `dist/` com `/x/` → `x/index.html`, 404 → `404.html`
  - `node scripts/smoke.mjs [--porta 4410] [--paginas /,/bio/]` → sai 0 se tudo OK, 1 se falhou; imprime `✓`/`✗` por verificação

- [ ] **Step 1: Criar `scripts/serve-dist.mjs`**

```js
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
```

- [ ] **Step 2: Criar `scripts/smoke.mjs`**

```js
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
```

- [ ] **Step 3: Rodar o smoke contra o build atual para ver que ele funciona e falha onde deve**

Run: `npm run build && node scripts/smoke.mjs --paginas /,/bio/`
Expected: roda até o fim; `/` passa em status/imagens; o resultado pode ter ✗ (a home atual não tem `data-site` e usa travessão no endereço). O script tem de terminar com código 0 ou 1, nunca com exceção.

- [ ] **Step 4: Criar `src/styles/site/tokens.css`**

```css
/* Casa Maria: tokens do sistema de design do site (spec seção 5) */
:root {
  --verde: #0d3b2e;
  --verde-mid: #1a5240;
  --verde-light: #234d3a;
  --creme: #e8dcc8;
  --creme-light: #f3ede1;
  --creme-dark: #c9b99a;
  --branco: #faf8f3;
  --tinta: #1c2a24;
  --tinta-suave: #4a5a52;
  --erro: #c0392b;

  --display: 'Distrampler', Georgia, serif;
  --serif: 'Cormorant Garamond', Georgia, serif;
  --sans: 'Inter Variable', 'Inter', system-ui, sans-serif;
  --font-display: var(--serif);
  --font-body: var(--sans);

  --fs-overline: 0.75rem;
  --fs-small: 0.875rem;
  --fs-body: 1rem;
  --fs-lead: 1.125rem;
  --fs-h3: clamp(1.35rem, 2vw, 1.6rem);
  --fs-h2: clamp(2rem, 3.6vw, 3.1rem);
  --fs-h1: clamp(2.4rem, 4.4vw, 4.4rem);

  --sec-y: clamp(4.5rem, 9vw, 8rem);
  --gutter: clamp(1.25rem, 6vw, 8rem);
  --max: 1240px;
  --header-h: 76px;
  --radius: 2px;
  --ease: cubic-bezier(.2, .7, .2, 1);
}
```

- [ ] **Step 5: Criar `src/styles/site/base.css`**

```css
/* Casa Maria: base do sistema de design (importado só pelo SiteLayout) */
@import './tokens.css';
@import '@fontsource/cormorant-garamond/300.css';
@import '@fontsource/cormorant-garamond/400.css';
@import '@fontsource/cormorant-garamond/500.css';
@import '@fontsource/cormorant-garamond/400-italic.css';
@import '@fontsource-variable/inter';

@font-face { font-family: 'Distrampler'; src: url('/fonts/Distrampler.woff2') format('woff2'); font-display: swap; }

body[data-site='casa-maria'] { margin: 0; background: var(--branco); color: var(--tinta); font: 400 var(--fs-body)/1.7 var(--sans); -webkit-font-smoothing: antialiased; }
body[data-site='casa-maria'] *, body[data-site='casa-maria'] *::before, body[data-site='casa-maria'] *::after { box-sizing: border-box; }
body[data-site='casa-maria'] h1, body[data-site='casa-maria'] h2, body[data-site='casa-maria'] h3 { font-family: var(--serif); font-weight: 400; line-height: 1.1; margin: 0; color: inherit; letter-spacing: 0; }
body[data-site='casa-maria'] p { margin: 0; color: inherit; }
body[data-site='casa-maria'] img { max-width: 100%; display: block; }
body[data-site='casa-maria'] a { color: inherit; }
body[data-site='casa-maria'] em { font-style: italic; }

.container { width: 100%; max-width: calc(var(--max) + 2 * var(--gutter)); margin: 0 auto; padding: 0 var(--gutter); }
.section { padding: var(--sec-y) 0; position: relative; }
.section--verde { background: var(--verde); color: var(--creme-light); }
.section--creme { background: var(--creme-light); }
.section--branco { background: var(--branco); }
.overline { display: block; font: 500 var(--fs-overline)/1.4 var(--sans); letter-spacing: .22em; text-transform: uppercase; color: var(--verde-mid); }
.section--verde .overline { color: var(--creme-dark); }
.h2 { font-size: var(--fs-h2); }
.lead { font-size: var(--fs-lead); line-height: 1.7; color: var(--tinta-suave); max-width: 62ch; }
.section--verde .lead { color: var(--creme); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: .6rem; min-height: 48px; padding: .95rem 2rem; font: 500 .8rem/1 var(--sans); letter-spacing: .18em; text-transform: uppercase; text-decoration: none; border: 1px solid transparent; border-radius: var(--radius); cursor: pointer; transition: background .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease); }
.btn--claro { background: var(--creme-light); color: var(--verde); }
.btn--claro:hover { background: #fff; }
.btn--verde { background: var(--verde); color: var(--creme-light); }
.btn--verde:hover { background: var(--verde-mid); }
.btn--linha { border-color: currentColor; color: inherit; background: transparent; }
.btn--linha:hover { background: rgba(255, 255, 255, .08); }
:focus-visible { outline: 2px solid var(--creme-dark); outline-offset: 3px; }

.reveal { opacity: 0; transform: translateY(16px); transition: opacity .8s var(--ease), transform .8s var(--ease); }
.reveal.visivel { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
html:not(.js) .reveal { opacity: 1; transform: none; }

/* formulário padrão (LeadForm) no visual do site */
body[data-site='casa-maria'] .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 1.2rem; }
body[data-site='casa-maria'] .form-group { display: flex; flex-direction: column; gap: .35rem; }
body[data-site='casa-maria'] .form-group.full,
body[data-site='casa-maria'] .form-group:has(textarea),
body[data-site='casa-maria'] .form-group:has([name='empresa']) { grid-column: 1 / -1; }
body[data-site='casa-maria'] .form-group label { font: 500 var(--fs-overline)/1.4 var(--sans); letter-spacing: .16em; text-transform: uppercase; color: var(--verde-mid); }
body[data-site='casa-maria'] .form-hint { text-transform: none; letter-spacing: 0; opacity: .75; }
body[data-site='casa-maria'] .form-group :is(input, select, textarea) { width: 100%; border: 0; border-bottom: 1px solid var(--creme-dark); background: transparent; padding: .7rem 0; font: 400 .95rem var(--sans); color: var(--tinta); border-radius: 0; appearance: none; -webkit-appearance: none; }
body[data-site='casa-maria'] .form-group :is(input, select, textarea):focus { outline: none; border-color: var(--verde); }
body[data-site='casa-maria'] .form-group .field-error { border-color: var(--erro); }
body[data-site='casa-maria'] .form-group textarea { resize: vertical; min-height: 4.5rem; }
body[data-site='casa-maria'] .form-error { color: var(--erro); font-size: var(--fs-small); margin-top: .6rem; }
body[data-site='casa-maria'] .form-submit { margin-top: 1.4rem; width: 100%; min-height: 52px; background: var(--verde); color: var(--creme-light); border: 0; font: 500 .8rem var(--sans); letter-spacing: .2em; text-transform: uppercase; cursor: pointer; }
body[data-site='casa-maria'] .form-submit:hover { background: var(--verde-mid); }
@media (max-width: 640px) { body[data-site='casa-maria'] .form-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 6: Criar `src/data/casa.ts`**

```ts
// Fatos da Casa Maria Jardins: fonte única para todas as páginas do site.
// Só fatos já aprovados (textos atuais do site). Nada de preço ou número inventado.
export const casa = {
  nome: 'Casa Maria Jardins',
  url: 'https://espacocasamaria.com.br',
  endereco: {
    rua: 'Praça das Guianas, 82',
    bairro: 'Jardim Paulista',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01428-030',
    linha: 'Praça das Guianas, 82, Jardim Paulista, São Paulo, SP',
  },
  mapa: {
    embed: 'https://maps.google.com/maps?q=Pra%C3%A7a+das+Guianas%2C+82%2C+Jardim+Paulista%2C+S%C3%A3o+Paulo%2C+SP&output=embed&z=17',
    link: 'https://maps.app.goo.gl/kGntB2mFiFncTfbs5',
  },
  numeros: [
    { valor: '500 m²', rotulo: 'de espaço exclusivo' },
    { valor: '250', rotulo: 'convidados' },
    { valor: 'Jardins', rotulo: 'localização nobre' },
    { valor: '12 min', rotulo: 'da Avenida Paulista' },
  ],
  distancias: [
    { via: 'Avenida Paulista', tempo: '12 minutos', km: '2,2 km' },
    { via: 'Avenida Rebouças', tempo: '15 minutos', km: '2,8 km' },
    { via: 'Avenida Brigadeiro Faria Lima', tempo: '16 minutos', km: '3,3 km' },
  ],
  igreja: 'A 8 minutos da Igreja Nossa Senhora do Brasil',
  ambientes: [
    { nome: 'Deck para recepção', texto: 'Área externa ampla, com estrutura de madeira e visual acolhedor, perfeita para criar uma primeira impressão marcante e receber com elegância.' },
    { nome: 'Sala interna', texto: 'Espaço climatizado, com acabamentos modernos e iluminação aconchegante, que oferece conforto e sofisticação em qualquer ocasião.' },
    { nome: 'Cozinha gourmet', texto: 'Ambiente funcional, equipado para operações profissionais, que proporciona praticidade e agilidade nos bastidores do evento.' },
    { nome: 'Jardim', texto: 'Área verde integrada à arquitetura do espaço, com paisagismo planejado e atmosfera tranquila, trazendo leveza e frescor ao ambiente.' },
    { nome: 'Bar', texto: 'Estrutura pronta para operação, com bancada, prateleiras e pontos de apoio, combinando praticidade com um toque de descontração.' },
  ],
  fotosAmbientes: [
    { src: 'espaco/lounge-poltronas-noite.jpg', alt: 'Lounge com poltronas sob árvore iluminada' },
    { src: 'espaco/bar-evento-noite.jpg', alt: 'Convidados brindando no bar com lustre de cristais' },
    { src: 'espaco/salao-luz-azul.jpg', alt: 'Hall com teto de vidro e convidados durante evento' },
    { src: 'espaco/jardim-musica-ao-vivo.jpg', alt: 'Banda tocando ao vivo sob o teto de vidro' },
    { src: 'espaco/jardim-evento-noite.jpg', alt: 'Convidados no jardim em frente à casa à noite' },
    { src: 'espaco/bar-dia.jpg', alt: 'Bar com lustre de cristais e arranjos de flores' },
    { src: 'espaco/lounge-tapete.jpg', alt: 'Lounge com tapete e instrumentos montados para show' },
    { src: 'espaco/hall-telao.jpg', alt: 'Entrada com telão da Casa Maria e piso de madeira' },
    { src: 'espaco/fachada-jardim-noite.jpg', alt: 'Caminho iluminado ao lado da casa' },
    { src: 'espaco/salao-lustre-jantar.jpg', alt: 'Convidados reunidos sob o lustre de cristais' },
    { src: 'espaco/jardim-publico-noite.jpg', alt: 'Convidados no jardim sob as árvores iluminadas' },
  ],
  servicos: [
    { nome: 'Buffet', texto: 'Menus personalizados e experiências gastronômicas alinhadas ao estilo do evento.', image: 'servicos/buffet-canapes.avif' },
    { nome: 'Bar de drinks', texto: 'Carta de drinks e bar montado para receber os convidados.', image: 'servicos/drinks.avif' },
    { nome: 'Som e luz', texto: 'Estrutura de som e iluminação para cada formato de evento.', image: 'servicos/dj-detalhe.avif' },
    { nome: 'Decoração', texto: 'Uma ambientação construída para traduzir o estilo e a proposta de cada evento.', image: 'servicos/decoracao-flores.avif' },
    { nome: 'Equipe', texto: 'Uma equipe preparada para acompanhar cada etapa com atenção e cuidado.', image: 'servicos/equipe.jpg' },
  ],
  depoimentos: [
    { texto: 'Lugar incrível, luxo e exclusividade e localização perfeita no Jardins.', autor: 'Bernardo Vettorazzi' },
    { texto: 'Lugar intimista e aconchegante. Ideal para festas pessoais. Atendimento ótimo e serviço muito bem executado.', autor: 'Marcelo Vicentini' },
    { texto: 'Chique, espaçoso e bem organizado. Excelente atendimento.', autor: 'Rafael Augusto' },
    { texto: 'Espaço delicioso, sofisticado e com uma atmosfera única.', autor: 'Lupe Lima' },
    { texto: 'Excelente local. Recomendo para quem busca qualidade e exclusividade.', autor: 'Alexandre Souza' },
    { texto: 'Excelente atendimento. Um espaço que encanta em cada detalhe.', autor: 'Francisco Souza' },
  ],
  clientes: [
    ['google', 'Google'], ['track-and-field', 'Track&Field'], ['vitacon', 'Vitacon'], ['esquadrao-da-moda', 'Esquadrão da Moda'],
    ['99', '99'], ['asus', 'Asus'], ['familhao', 'Familhão'], ['votorantim-cimentos', 'Votorantim Cimentos'],
    ['cielo', 'Cielo'], ['itau', 'Itaú'], ['porsche', 'Porsche'], ['cetaphil', 'Cetaphil'],
  ] as [string, string][],
  grupo: 'T.Venues',
} as const;
```

- [ ] **Step 7: Criar `src/data/eventos.ts` (tipos + registro vazio; a Task 4 preenche)**

```ts
// Registro dos tipos de evento do site. Cada item gera uma página em /<slug>/ (src/pages/[evento].astro).
export type Preset = 'social' | 'corporativo';
export type Grupo = 'corporativo' | 'celebracoes';
export interface Foto { src: string; alt: string }

export interface EventoTipo {
  slug: string;
  grupo: Grupo;
  nomeMenu: string;
  preset: Preset;
  seo: { title: string; description: string };
  card: { image: string; frase: string };
  hero: { image: string; overline: string; title: string; text: string; formNoHero: boolean };
  intro: { title: string; text: string; image: string; imageAlt: string };
  formatos: { icon: string; nome: string; texto: string }[];
  destaques: { title: string; text: string; image: string; imageAlt: string }[];
  galeria: Foto[];
  faq: { q: string; a: string }[];
  contato: { title: string; text: string };
  mostrarClientes: boolean;
}

export const eventos: EventoTipo[] = [];

export const eventoPorSlug = (slug: string) => eventos.find((e) => e.slug === slug);
export const eventosDoGrupo = (g: Grupo) => eventos.filter((e) => e.grupo === g);
```

- [ ] **Step 8: config, package.json e `astro check`**

Em `config.json`, adicionar após `"whatsapp"`:
```json
  "social": { "instagram": "" },
```
Depois:
```bash
npm install --silent -D @astrojs/check typescript
npm pkg set scripts.check="astro check" scripts.smoke="node scripts/smoke.mjs"
npx astro check 2>&1 | tail -5
```
Expected: `0 errors` (warnings/hints das páginas antigas são aceitáveis; anotar quantos).

- [ ] **Step 9: Build e commit**

```bash
npm run build 2>&1 | grep -E "error|page\(s\)"
git add scripts/serve-dist.mjs scripts/smoke.mjs src/styles/site src/data config.json package.json package-lock.json
git commit -m "feat(site): fundação do sistema de design (tokens, base, dados da casa, smoke test)"
```

---

### Task 2: Layout, menu e rodapé

**Files:**
- Create: `src/components/site/SiteLayout.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `src/pages/lab/layout.astro`

**Interfaces:**
- Consumes: `casa` (`src/data/casa.ts`), `eventosDoGrupo` (pode estar vazio: o menu usa a lista fixa `MENU` abaixo, não o registro), `Base.astro` props `title, description, ogImage, canonical, noIndex, theme, jsonLd`.
- Produces: `<SiteLayout title description canonical? ogImage? jsonLd? noIndex? current?>` com `<slot/>`; `<body data-site="casa-maria">` (o atributo é posto por script inline no início do slot, ver código); `[data-menu-gatilho]`, `[data-menu-abrir]`, `[data-menu-gaveta]` usados pelo smoke.

- [ ] **Step 1: Teste (página de laboratório + smoke falhando)**

`src/pages/lab/layout.astro`:
```astro
---
import SiteLayout from '../../components/site/SiteLayout.astro';
---
<SiteLayout title="Lab layout | Casa Maria" description="Página de teste do layout (removida antes da entrega)." noIndex current="/">
  <section class="section section--verde" style="min-height:120vh"><div class="container"><h1 class="h2">Teste do layout</h1><p class="lead reveal">Conteúdo de teste.</p></div></section>
  <section id="contato" class="section"><div class="container"><p>Contato</p></div></section>
</SiteLayout>
```
Run: `npm run build; node scripts/smoke.mjs --paginas /lab/layout/`
Expected: FAIL no build (componente não existe).

- [ ] **Step 2: `SiteLayout.astro`**

```astro
---
// Layout das páginas do site novo: Base (SEO/GTM/WhatsApp) + sistema de design + menu + rodapé.
import Base from '../../layouts/Base.astro';
import SiteHeader from './SiteHeader.astro';
import SiteFooter from './SiteFooter.astro';
import '../../styles/site/base.css';

interface Props {
  title: string; description: string; canonical?: string; ogImage?: string;
  jsonLd?: Record<string, any> | Record<string, any>[]; noIndex?: boolean; current?: string;
}
const { title, description, canonical, ogImage = '/images/og-casa-maria.jpg', jsonLd, noIndex = false, current = Astro.url.pathname } = Astro.props;
---
<Base title={title} description={description} canonical={canonical} ogImage={ogImage} jsonLd={jsonLd as any} noIndex={noIndex} theme="light">
  <script is:inline>document.body.dataset.site = 'casa-maria'; document.documentElement.classList.add('js');</script>
  <a class="pular" href="#conteudo">Pular para o conteúdo</a>
  <SiteHeader current={current} />
  <main id="conteudo"><slot /></main>
  <SiteFooter />
</Base>

<script>
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
</script>

<style is:global>
  .pular { position: absolute; left: -9999px; top: 0; z-index: 100; background: var(--creme-light); color: var(--verde); padding: .8rem 1.2rem; }
  .pular:focus { left: 1rem; top: 1rem; }
</style>
```

Nota para o implementador: `Base.astro` aceita `jsonLd?: Record<string, any>`; para mais de um bloco, passar um objeto `{ '@context': 'https://schema.org', '@graph': [...] }`. Não alterar `Base.astro`.

- [ ] **Step 3: `SiteHeader.astro`**

```astro
---
import Img from '../ui/Img.astro';
interface Props { current: string }
const { current } = Astro.props;
const MENU = [
  { rotulo: 'Corporativo', itens: [
    { href: '/eventos-corporativos/', nome: 'Eventos corporativos' },
    { href: '/confraternizacao-de-empresa/', nome: 'Confraternização de empresa' },
    { href: '/offsite-e-happy-hour/', nome: 'Offsite e happy hour' },
  ] },
  { rotulo: 'Celebrações', itens: [
    { href: '/casamentos/', nome: 'Casamentos' },
    { href: '/aniversarios-e-celebracoes/', nome: 'Aniversários e celebrações' },
  ] },
];
const ativo = (href: string) => current === href || current === href.slice(0, -1);
---
<header class="hdr" data-hdr>
  <div class="hdr__in">
    <a href="/" class="hdr__logo" aria-label="Casa Maria Jardins, página inicial">
      <Img src="marca/logo-branca.png" alt="" width={240} sizes="140px" priority />
    </a>
    <nav class="hdr__nav" aria-label="Principal">
      <ul>
        {MENU.map((g, i) => (
          <li class="hdr__grupo">
            <button type="button" class="hdr__gatilho" data-menu-gatilho aria-expanded="false" aria-controls={`sub-${i}`}>
              {g.rotulo}<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
            </button>
            <ul class="hdr__sub" id={`sub-${i}`} hidden>
              {g.itens.map((it) => <li><a href={it.href} aria-current={ativo(it.href) ? 'page' : undefined}>{it.nome}</a></li>)}
            </ul>
          </li>
        ))}
        <li><a class="hdr__link" href="/#espaco">O espaço</a></li>
      </ul>
    </nav>
    <a href="#contato" class="btn btn--claro hdr__cta">Solicitar orçamento</a>
    <button type="button" class="hdr__burger" data-menu-abrir aria-expanded="false" aria-controls="gaveta" aria-label="Abrir menu">
      <span></span><span></span><span></span>
    </button>
  </div>

  <div class="gaveta" id="gaveta" data-menu-gaveta hidden role="dialog" aria-modal="true" aria-label="Menu">
    <div class="gaveta__topo">
      <Img src="marca/logo-branca.png" alt="Casa Maria Jardins" width={240} sizes="120px" />
      <button type="button" class="gaveta__fechar" data-menu-fechar aria-label="Fechar menu">×</button>
    </div>
    {MENU.map((g) => (
      <div class="gaveta__grupo">
        <span class="overline">{g.rotulo}</span>
        <ul>{g.itens.map((it) => <li><a href={it.href} aria-current={ativo(it.href) ? 'page' : undefined}>{it.nome}</a></li>)}</ul>
      </div>
    ))}
    <a class="gaveta__link" href="/#espaco">O espaço</a>
    <a href="#contato" class="btn btn--claro gaveta__cta" data-menu-fechar>Solicitar orçamento</a>
  </div>
</header>

<script>
  const hdr = document.querySelector<HTMLElement>('[data-hdr]')!;
  const onScroll = () => hdr.classList.toggle('hdr--solido', window.scrollY > 60);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Submenus (desktop): hover + clique + teclado; Esc fecha
  const gatilhos = [...document.querySelectorAll<HTMLButtonElement>('[data-menu-gatilho]')];
  const setSub = (b: HTMLButtonElement, aberto: boolean) => {
    b.setAttribute('aria-expanded', String(aberto));
    (document.getElementById(b.getAttribute('aria-controls')!) as HTMLElement).hidden = !aberto;
  };
  const fecharTodos = (exceto?: HTMLButtonElement) => gatilhos.forEach((b) => b !== exceto && setSub(b, false));
  gatilhos.forEach((b) => {
    const li = b.parentElement!;
    b.addEventListener('click', () => { const v = b.getAttribute('aria-expanded') !== 'true'; fecharTodos(b); setSub(b, v); });
    li.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { fecharTodos(b); setSub(b, true); } });
    li.addEventListener('mouseleave', () => { if (matchMedia('(hover: hover)').matches) setSub(b, false); });
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget as Node)) setSub(b, false); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const aberto = gatilhos.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (aberto) { setSub(aberto, false); aberto.focus(); }
    if (!gaveta.hidden) fecharGaveta();
  });
  document.addEventListener('click', (e) => { if (!(e.target as Element).closest('.hdr__grupo')) fecharTodos(); });

  // Gaveta (celular): foco preso, rolagem travada
  const gaveta = document.querySelector<HTMLElement>('[data-menu-gaveta]')!;
  const abrir = document.querySelector<HTMLButtonElement>('[data-menu-abrir]')!;
  const focaveis = () => [...gaveta.querySelectorAll<HTMLElement>('a, button')];
  function abrirGaveta() { gaveta.hidden = false; abrir.setAttribute('aria-expanded', 'true'); document.documentElement.style.overflow = 'hidden'; focaveis()[0]?.focus(); }
  function fecharGaveta() { gaveta.hidden = true; abrir.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = ''; abrir.focus(); }
  abrir.addEventListener('click', abrirGaveta);
  gaveta.querySelectorAll('[data-menu-fechar], a').forEach((el) => el.addEventListener('click', () => fecharGaveta()));
  gaveta.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = focaveis(); const primeiro = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });
</script>

<style>
  .hdr { position: fixed; inset: 0 0 auto; z-index: 50; color: var(--creme-light); transition: background .35s var(--ease), box-shadow .35s var(--ease); }
  .hdr--solido { background: var(--verde); box-shadow: 0 1px 0 rgba(255,255,255,.06); }
  .hdr__in { height: var(--header-h); display: flex; align-items: center; gap: 2rem; padding: 0 var(--gutter); max-width: calc(var(--max) + 2 * var(--gutter)); margin: 0 auto; }
  .hdr__logo :global(img) { width: 132px; height: auto; }
  .hdr__nav { margin-left: auto; }
  .hdr__nav > ul { display: flex; gap: 2.2rem; list-style: none; margin: 0; padding: 0; align-items: center; }
  .hdr__grupo { position: relative; }
  .hdr__gatilho, .hdr__link { background: none; border: 0; color: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: .45rem; min-height: 44px; font: 500 .8rem var(--sans); letter-spacing: .16em; text-transform: uppercase; text-decoration: none; padding: 0; }
  .hdr__gatilho svg { width: 10px; transition: transform .25s; }
  .hdr__gatilho[aria-expanded='true'] svg { transform: rotate(180deg); }
  .hdr__sub { position: absolute; top: 100%; left: -1.2rem; min-width: 270px; list-style: none; margin: 0; padding: .8rem 0; background: var(--branco); color: var(--verde); box-shadow: 0 18px 40px rgba(13,59,46,.18); }
  .hdr__sub a { display: block; padding: .7rem 1.4rem; font: 400 1.15rem var(--serif); text-decoration: none; }
  .hdr__sub a:hover, .hdr__sub a[aria-current='page'] { background: var(--creme-light); }
  .hdr__cta { min-height: 44px; padding: .75rem 1.3rem; }
  .hdr__burger { display: none; margin-left: auto; width: 44px; height: 44px; background: none; border: 0; cursor: pointer; flex-direction: column; justify-content: center; gap: 6px; padding: 10px; }
  .hdr__burger span { display: block; height: 1.5px; background: currentColor; }
  .gaveta { position: fixed; inset: 0; background: var(--verde); color: var(--creme-light); padding: 1.2rem var(--gutter) 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.8rem; }
  .gaveta[hidden] { display: none; }
  .gaveta__topo { display: flex; justify-content: space-between; align-items: center; }
  .gaveta__topo :global(img) { width: 110px; height: auto; }
  .gaveta__fechar { background: none; border: 0; color: inherit; font-size: 2.4rem; line-height: 1; width: 48px; height: 48px; cursor: pointer; }
  .gaveta__grupo ul { list-style: none; margin: .6rem 0 0; padding: 0; }
  .gaveta__grupo a, .gaveta__link { display: block; padding: .5rem 0; font: 400 1.7rem var(--serif); text-decoration: none; }
  .gaveta__cta { margin-top: auto; }
  @media (max-width: 1023px) {
    .hdr__nav, .hdr__cta { display: none; }
    .hdr__burger { display: flex; }
    .hdr__in { height: 64px; }
  }
</style>
```

- [ ] **Step 4: `SiteFooter.astro`**

```astro
---
import Img from '../ui/Img.astro';
import config from '../../../config.json';
import { casa } from '../../data/casa';
const instagram = (config as any).social?.instagram as string | undefined;
const ano = new Date().getFullYear();
---
<footer class="ftr">
  <div class="container ftr__grid">
    <div class="ftr__marca">
      <Img src="marca/logo-branca.png" alt="Casa Maria Jardins" width={240} sizes="150px" />
      <p>{casa.endereco.linha}</p>
      <a href={casa.mapa.link} target="_blank" rel="noopener">Como chegar</a>
      {instagram && <a href={instagram} target="_blank" rel="noopener">Instagram</a>}
    </div>
    <nav aria-label="Rodapé" class="ftr__nav">
      <div><span class="overline">Corporativo</span><ul>
        <li><a href="/eventos-corporativos/">Eventos corporativos</a></li>
        <li><a href="/confraternizacao-de-empresa/">Confraternização de empresa</a></li>
        <li><a href="/offsite-e-happy-hour/">Offsite e happy hour</a></li>
      </ul></div>
      <div><span class="overline">Celebrações</span><ul>
        <li><a href="/casamentos/">Casamentos</a></li>
        <li><a href="/aniversarios-e-celebracoes/">Aniversários e celebrações</a></li>
      </ul></div>
      <div><span class="overline">Casa Maria</span><ul>
        <li><a href="/#espaco">O espaço</a></li>
        <li><a href="#contato">Solicitar orçamento</a></li>
        <li><a href="/politica-de-privacidade/">Política de privacidade</a></li>
      </ul></div>
    </nav>
  </div>
  <div class="container ftr__base">
    <p>© {ano} {casa.nome}. Todos os direitos reservados.</p>
    <Img src="marca/logos-rodape-think-tvenues.avif" alt="Think Design Eventos e T.Venues" width={260} sizes="200px" class="ftr__grupo" />
  </div>
</footer>

<style>
  .ftr { background: #082a20; color: var(--creme); padding: 4.5rem 0 2rem; }
  .ftr__grid { display: grid; grid-template-columns: 1.1fr 2fr; gap: 3rem; }
  .ftr__marca { display: flex; flex-direction: column; gap: .8rem; align-items: flex-start; }
  .ftr__marca :global(img) { width: 150px; height: auto; margin-bottom: .6rem; }
  .ftr__marca a, .ftr a { color: var(--creme-light); }
  .ftr__nav { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
  .ftr__nav ul { list-style: none; margin: .9rem 0 0; padding: 0; display: grid; gap: .5rem; }
  .ftr__nav a { text-decoration: none; }
  .ftr__nav a:hover { text-decoration: underline; }
  .ftr .overline { color: var(--creme-dark); }
  .ftr__base { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; margin-top: 3.5rem; padding-top: 1.6rem; border-top: 1px solid rgba(232,220,200,.15); font-size: var(--fs-small); }
  .ftr__base :global(.ftr__grupo) { width: 180px; height: auto; }
  @media (max-width: 860px) {
    .ftr__grid, .ftr__nav { grid-template-columns: 1fr; }
    .ftr__base { flex-direction: column; align-items: flex-start; }
  }
</style>
```

- [ ] **Step 5: Build + smoke**

Run: `npm run build 2>&1 | grep -E "error|page\(s\)|Img\]" ; node scripts/smoke.mjs --paginas /lab/layout/`
Expected: build ok; smoke com **todos ✓** em desktop e celular (o link `/confraternizacao-de-empresa/` etc. ainda não existe: os links internos dessas rotas falham até a Task 6; aceitável aqui **só** nessa seção "Links internos"). Corrigir qualquer outro ✗.

- [ ] **Step 6: Commit**

```bash
git add src/components/site/SiteLayout.astro src/components/site/SiteHeader.astro src/components/site/SiteFooter.astro src/pages/lab/layout.astro
git commit -m "feat(site): layout, menu com submenus e gaveta, rodapé"
```

---

### Task 3: Componentes de seção, parte 1 (estrutura)

**Files:**
- Create: `src/components/site/Hero.astro`, `ProofBar.astro`, `SectionHeading.astro`, `SplitFeature.astro`, `FeatureList.astro`, `EventTypeGrid.astro`, `CtaBand.astro`, `icones.ts`, `src/pages/lab/secoes-1.astro`

**Interfaces:**
- Consumes: `casa.numeros`; `LeadForm` props `idPrefix, formId, preset, submitLabel`; `Img` props `src, alt, width, sizes, priority, class`.
- Produces (assinaturas exatas):
  - `<Hero image imageAlt overline title text ctas={{label,href,variant:'claro'|'linha'}[]} form?={{preset}}>` (com `form` vira split e renderiza `<LeadForm idPrefix="hero" formId="hero-form" preset=... />`). `title` aceita HTML simples (`<em>`).
  - `<ProofBar items={{valor,rotulo}[]}>`
  - `<SectionHeading overline title text? align?='left'|'center' tone?='claro'|'escuro'>` (`title` aceita `<em>`; renderiza `<h2 class="h2">`)
  - `<SplitFeature image imageAlt title text reverse? overline?>` (com `<slot/>` opcional abaixo do texto)
  - `<FeatureList items={{icon,nome,texto}[]} colunas?=3>`; `icon` é chave de `icones`
  - `<EventTypeGrid items={{href,nome,frase,image,grupo}[]}>`
  - `<CtaBand title text? ctaLabel ctaHref='#contato'>`
  - `icones: Record<string,string>` com as chaves: `alianca, coracao, civil, brinde, casal, camera, taca, aviao, quadro, ideia, microfone, foguete, filmadora, bolo, estrela, presente, talheres, pessoas, coquetel, musica, sol, folha`

- [ ] **Step 1: Página de laboratório que usa todos (falha no build)**

`src/pages/lab/secoes-1.astro`:
```astro
---
import SiteLayout from '../../components/site/SiteLayout.astro';
import Hero from '../../components/site/Hero.astro';
import ProofBar from '../../components/site/ProofBar.astro';
import SectionHeading from '../../components/site/SectionHeading.astro';
import SplitFeature from '../../components/site/SplitFeature.astro';
import FeatureList from '../../components/site/FeatureList.astro';
import EventTypeGrid from '../../components/site/EventTypeGrid.astro';
import CtaBand from '../../components/site/CtaBand.astro';
import { casa } from '../../data/casa';
---
<SiteLayout title="Lab seções 1 | Casa Maria" description="Página de teste dos componentes de estrutura (removida antes da entrega)." noIndex>
  <Hero image="corporativo/jardim-evento-hero.avif" imageAlt="Evento no jardim" overline="Jardim Paulista · São Paulo" title="Uma casa nos Jardins para <em>eventos memoráveis</em>" text="Texto de teste do hero." ctas={[{ label: 'Escolha seu evento', href: '#eventos', variant: 'claro' }, { label: 'Solicitar orçamento', href: '#contato', variant: 'linha' }]} form={{ preset: 'corporativo' }} />
  <ProofBar items={[...casa.numeros]} />
  <section class="section"><div class="container"><SectionHeading overline="Teste" title="Um título <em>de teste</em>" text="Texto de apoio." /></div></section>
  <SplitFeature image="espaco/jardim-detalhe-noite.jpg" imageAlt="Jardim à noite" overline="O espaço" title="Split de teste" text="Texto do split." />
  <section class="section section--creme"><div class="container"><FeatureList items={[{ icon: 'taca', nome: 'Confraternização', texto: 'Uma linha.' }, { icon: 'quadro', nome: 'Treinamento', texto: 'Uma linha.' }, { icon: 'microfone', nome: 'Palestra', texto: 'Uma linha.' }]} /></div></section>
  <section class="section" id="eventos"><div class="container"><EventTypeGrid items={[{ href: '/casamentos/', nome: 'Casamentos', frase: 'Frase.', image: 'casamentos/cerimonia-jardim.jpg', grupo: 'celebracoes' }, { href: '/eventos-corporativos/', nome: 'Eventos corporativos', frase: 'Frase.', image: 'corporativo/show-cantora.avif', grupo: 'corporativo' }]} /></div></section>
  <CtaBand title="Vamos planejar o seu evento?" text="Texto." ctaLabel="Solicitar orçamento" />
  <section id="contato" class="section"><div class="container"><p>Contato</p></div></section>
</SiteLayout>
```
Run: `npm run build` → Expected: FAIL (componentes inexistentes).

- [ ] **Step 2: `icones.ts`** (traço 1.5, viewBox 24, `currentColor`)

```ts
const s = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const icones: Record<string, string> = {
  alianca: s('<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-1.5 3h-3z"/>'),
  coracao: s('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  civil: s('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 16c1-1.5 2-1.5 3 0s2 1.5 3 0"/>'),
  brinde: s('<path d="M8 3h4l-.5 6a2.5 2.5 0 0 1-3 0zM10 11v8M7.5 19h5M14 5h4l-.5 6a2.5 2.5 0 0 1-3 0zM16 13v6M13.5 19h5"/>'),
  casal: s('<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0"/>'),
  camera: s('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>'),
  taca: s('<path d="M7 3h10l-1 6a4 4 0 0 1-8 0zM12 13v7M8.5 20h7"/>'),
  aviao: s('<path d="M10.5 13.5 3 11l1.5-1.5 8 1 4-4a2 2 0 0 1 3 3l-4 4 1 8L16 23l-2.5-7.5"/>'),
  quadro: s('<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l4-4 4 4M7 9h6M7 12h9"/>'),
  ideia: s('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  microfone: s('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  foguete: s('<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-5-5z"/><circle cx="15" cy="9" r="1.5"/>'),
  filmadora: s('<rect x="3" y="7" width="13" height="10" rx="1.5"/><path d="m16 11 5-3v8l-5-3"/>'),
  bolo: s('<path d="M4 21h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zM4 16c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M12 12V8M12 8c-.8 0-1.5-.6-1.5-1.5S12 4 12 4s1.5 1.6 1.5 2.5S12.8 8 12 8z"/>'),
  estrela: s('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
  presente: s('<path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'),
  talheres: s('<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>'),
  pessoas: s('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  coquetel: s('<path d="M4 4h16l-8 9zM12 13v7M8 20h8"/>'),
  musica: s('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  sol: s('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  folha: s('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6"/>'),
};
```

- [ ] **Step 3: `Hero.astro`**

```astro
---
import Img from '../ui/Img.astro';
import LeadForm from '../LeadForm.astro';
interface Cta { label: string; href: string; variant: 'claro' | 'linha' }
interface Props { image: string; imageAlt: string; overline: string; title: string; text: string; ctas?: Cta[]; form?: { preset: 'social' | 'corporativo' } }
const { image, imageAlt, overline, title, text, ctas = [], form } = Astro.props;
---
<section class:list={['hero', { 'hero--split': !!form }]}>
  <Img src={image} alt={imageAlt} width={1920} priority sizes="100vw" class="hero__img" />
  <div class="hero__veu"></div>
  <div class="container hero__in">
    <div class="hero__texto">
      <span class="overline hero__over">{overline}</span>
      <h1 class="hero__h1" set:html={title} />
      <p class="hero__p">{text}</p>
      {ctas.length > 0 && <div class="hero__ctas">{ctas.map((c) => <a href={c.href} class:list={['btn', `btn--${c.variant}`]}>{c.label}</a>)}</div>}
    </div>
    {form && (
      <div class="hero__form">
        <p class="hero__form-titulo">Solicite seu orçamento</p>
        <LeadForm idPrefix="hero" formId="hero-form" preset={form.preset} submitLabel="Solicitar orçamento" />
      </div>
    )}
  </div>
</section>

<style>
  .hero { position: relative; min-height: min(100svh, 920px); display: flex; align-items: flex-end; color: var(--creme-light); overflow: hidden; padding: calc(var(--header-h) + 4rem) 0 clamp(3.5rem, 7vw, 6rem); }
  .hero :global(.hero__img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .hero__veu { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,42,32,.55) 0%, rgba(8,42,32,.35) 40%, rgba(8,42,32,.85) 100%); }
  .hero__in { position: relative; }
  .hero__over { color: var(--creme-dark); margin-bottom: 1.4rem; }
  .hero__h1 { font-family: var(--display) !important; font-size: var(--fs-h1); line-height: 1.04; max-width: 17ch; }
  .hero__h1 :global(em) { font-family: var(--serif); font-style: italic; }
  .hero__p { font-size: var(--fs-lead); max-width: 52ch; margin-top: 1.4rem; color: var(--creme); }
  .hero__ctas { display: flex; flex-wrap: wrap; gap: .9rem; margin-top: 2.2rem; }
  .hero--split .hero__in { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(2rem, 5vw, 5rem); align-items: end; }
  .hero--split .hero__h1 { font-size: clamp(2.2rem, 3.6vw, 3.6rem); }
  .hero__form { background: var(--branco); color: var(--tinta); padding: clamp(1.6rem, 3vw, 2.4rem); box-shadow: 0 30px 60px rgba(0,0,0,.25); }
  .hero__form-titulo { font: 400 1.6rem var(--serif); color: var(--verde); margin-bottom: 1.2rem !important; }
  @media (max-width: 960px) { .hero--split .hero__in { grid-template-columns: 1fr; } .hero--split { align-items: flex-start; } }
</style>
```

- [ ] **Step 4: `ProofBar.astro`, `SectionHeading.astro`, `SplitFeature.astro`**

```astro
---
// ProofBar.astro
interface Props { items: { valor: string; rotulo: string }[] }
const { items } = Astro.props;
---
<div class="proof"><ul class="container proof__in">
  {items.map((i) => <li class="reveal"><strong>{i.valor}</strong><span>{i.rotulo}</span></li>)}
</ul></div>
<style>
  .proof { background: var(--creme); color: var(--verde); }
  .proof__in { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); margin: 0 auto; padding-top: 2.2rem; padding-bottom: 2.2rem; }
  .proof li { display: flex; flex-direction: column; align-items: center; text-align: center; gap: .3rem; padding: 0 1rem; border-left: 1px solid rgba(13,59,46,.15); }
  .proof li:first-child { border-left: 0; }
  .proof strong { font: 400 clamp(1.7rem, 2.6vw, 2.3rem)/1 var(--display); }
  .proof span { font: 500 var(--fs-overline) var(--sans); letter-spacing: .18em; text-transform: uppercase; }
  @media (max-width: 720px) { .proof__in { grid-template-columns: 1fr 1fr; row-gap: 1.6rem; } .proof li:nth-child(3) { border-left: 0; } }
</style>
```

```astro
---
// SectionHeading.astro
interface Props { overline: string; title: string; text?: string; align?: 'left' | 'center' }
const { overline, title, text, align = 'left' } = Astro.props;
---
<header class:list={['sh', `sh--${align}`, 'reveal']}>
  <span class="overline">{overline}</span>
  <h2 class="h2" set:html={title} />
  {text && <p class="lead">{text}</p>}
</header>
<style>
  .sh { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: clamp(2.4rem, 5vw, 3.6rem); max-width: 760px; }
  .sh--center { align-items: center; text-align: center; margin-left: auto; margin-right: auto; }
  .sh :global(em) { font-style: italic; }
</style>
```

```astro
---
// SplitFeature.astro
import Img from '../ui/Img.astro';
interface Props { image: string; imageAlt: string; title: string; text: string; overline?: string; reverse?: boolean; tone?: 'branco' | 'creme' | 'verde' }
const { image, imageAlt, title, text, overline, reverse = false, tone = 'branco' } = Astro.props;
---
<section class:list={['section', `section--${tone}`]}>
  <div class:list={['container', 'sf', { 'sf--rev': reverse }]}>
    <div class="sf__img reveal"><Img src={image} alt={imageAlt} width={1100} sizes="(max-width: 860px) 100vw, 50vw" /></div>
    <div class="sf__txt reveal">
      {overline && <span class="overline">{overline}</span>}
      <h2 class="h2" set:html={title} />
      <p class="lead">{text}</p>
      <slot />
    </div>
  </div>
</section>
<style>
  .sf { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2.5rem, 6vw, 6rem); align-items: center; }
  .sf--rev .sf__img { order: 2; }
  .sf__img :global(img) { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }
  .sf__txt { display: flex; flex-direction: column; gap: 1.2rem; }
  .sf__txt :global(em) { font-style: italic; }
  @media (max-width: 860px) { .sf { grid-template-columns: 1fr; } .sf--rev .sf__img { order: 0; } .sf__img :global(img) { aspect-ratio: 4 / 3; } }
</style>
```

- [ ] **Step 5: `FeatureList.astro`, `EventTypeGrid.astro`, `CtaBand.astro`**

```astro
---
// FeatureList.astro
import { icones } from './icones';
interface Props { items: { icon: string; nome: string; texto: string }[]; colunas?: 2 | 3 | 4 }
const { items, colunas = 3 } = Astro.props;
---
<ul class="fl" style={`--cols:${colunas}`}>
  {items.map((i) => (
    <li class="reveal">
      <span class="fl__icon" set:html={icones[i.icon] ?? icones.estrela} />
      <h3>{i.nome}</h3>
      <p>{i.texto}</p>
    </li>
  ))}
</ul>
<style>
  .fl { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(var(--cols), 1fr); border-top: 1px solid rgba(13,59,46,.15); }
  .fl li { padding: 2rem 1.6rem 2rem 0; border-bottom: 1px solid rgba(13,59,46,.15); display: flex; flex-direction: column; gap: .7rem; }
  .fl__icon { width: 34px; height: 34px; color: var(--verde-mid); }
  .fl__icon :global(svg) { width: 100%; height: 100%; }
  .fl h3 { font-size: var(--fs-h3); color: var(--verde); }
  .fl p { color: var(--tinta-suave); font-size: .95rem; }
  :global(.section--verde) .fl, :global(.section--verde) .fl li { border-color: rgba(232,220,200,.18); }
  :global(.section--verde) .fl h3 { color: var(--creme-light); }
  :global(.section--verde) .fl p { color: var(--creme); }
  :global(.section--verde) .fl__icon { color: var(--creme-dark); }
  @media (max-width: 860px) { .fl { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 520px) { .fl { grid-template-columns: 1fr; } }
</style>
```

```astro
---
// EventTypeGrid.astro: cards da triagem
import Img from '../ui/Img.astro';
interface Item { href: string; nome: string; frase: string; image: string; grupo: 'corporativo' | 'celebracoes' }
interface Props { items: Item[] }
const { items } = Astro.props;
const rotulo = { corporativo: 'Corporativo', celebracoes: 'Celebrações' };
---
<ul class="etg">
  {items.map((i) => (
    <li class="reveal">
      <a href={i.href} class="etg__card">
        <Img src={i.image} alt="" width={800} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" class="etg__img" />
        <span class="etg__veu"></span>
        <span class="etg__txt">
          <span class="overline">{rotulo[i.grupo]}</span>
          <strong>{i.nome}</strong>
          <span class="etg__frase">{i.frase}</span>
          <span class="etg__mais">Conhecer <span aria-hidden="true">→</span></span>
        </span>
      </a>
    </li>
  ))}
</ul>
<style>
  .etg { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
  .etg li { grid-column: span 2; }
  .etg li:nth-child(4), .etg li:nth-child(5) { grid-column: span 3; }
  .etg__card { position: relative; display: block; height: 100%; min-height: 380px; overflow: hidden; color: var(--creme-light); text-decoration: none; }
  .etg__card :global(.etg__img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 1s var(--ease); }
  .etg__card:hover :global(.etg__img), .etg__card:focus-visible :global(.etg__img) { transform: scale(1.05); }
  .etg__veu { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,42,32,0) 30%, rgba(8,42,32,.88) 100%); }
  .etg__txt { position: absolute; inset: auto 0 0 0; padding: 1.8rem; display: flex; flex-direction: column; gap: .5rem; }
  .etg__txt .overline { color: var(--creme-dark); }
  .etg__txt strong { font: 400 clamp(1.6rem, 2.2vw, 2rem)/1.1 var(--serif); }
  .etg__frase { font-size: .95rem; color: var(--creme); }
  .etg__mais { font: 500 var(--fs-overline) var(--sans); letter-spacing: .18em; text-transform: uppercase; margin-top: .4rem; }
  @media (max-width: 1100px) { .etg { grid-template-columns: 1fr 1fr; } .etg li, .etg li:nth-child(4), .etg li:nth-child(5) { grid-column: span 1; } .etg li:last-child:nth-child(odd) { grid-column: 1 / -1; } }
  @media (max-width: 640px) { .etg { grid-template-columns: 1fr; } .etg__card { min-height: 300px; } }
</style>
```

```astro
---
// CtaBand.astro
interface Props { title: string; text?: string; ctaLabel: string; ctaHref?: string }
const { title, text, ctaLabel, ctaHref = '#contato' } = Astro.props;
---
<section class="section section--verde cta">
  <div class="container cta__in reveal">
    <h2 class="h2" set:html={title} />
    {text && <p class="lead">{text}</p>}
    <a href={ctaHref} class="btn btn--claro">{ctaLabel}</a>
  </div>
</section>
<style>
  .cta__in { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.4rem; }
  .cta__in :global(em) { font-style: italic; }
</style>
```

- [ ] **Step 6: Build + smoke + commit**

Run: `npm run build 2>&1 | grep -E "error|page\(s\)|Img\]"; node scripts/smoke.mjs --paginas /lab/secoes-1/`
Expected: build ok, sem `[Img]`; smoke ✓ (exceto "Links internos" para rotas da Task 6).
```bash
git add src/components/site/{Hero,ProofBar,SectionHeading,SplitFeature,FeatureList,EventTypeGrid,CtaBand}.astro src/components/site/icones.ts src/pages/lab/secoes-1.astro
git commit -m "feat(site): componentes de estrutura (hero, números, títulos, split, formatos, triagem, CTA)"
```

---

### Task 4: Conteúdo dos 5 tipos (`src/data/eventos.ts`)

**Files:**
- Modify: `src/data/eventos.ts` (preencher `eventos`)
- Test: `scripts/validar-conteudo.mjs` (novo)

**Interfaces:**
- Consumes: `EventoTipo` (Task 1), chaves de `icones` (lista na Task 3), imagens abaixo.
- Produces: `eventos` com 5 itens nesta ordem e slugs exatos: `eventos-corporativos`, `confraternizacao-de-empresa`, `offsite-e-happy-hour` (grupo `corporativo`, preset `corporativo`, `hero.formNoHero: true`, `mostrarClientes: true`), `casamentos`, `aniversarios-e-celebracoes` (grupo `celebracoes`, preset `social`, `formNoHero: false`, `mostrarClientes: false`).

Imagens disponíveis (usar só estas; caminho relativo a `src/assets/images/`):
`espaco/`: lounge-poltronas-noite.jpg, bar-evento-noite.jpg, salao-luz-azul.jpg, jardim-musica-ao-vivo.jpg, jardim-evento-noite.jpg, bar-dia.jpg, lounge-tapete.jpg, hall-telao.jpg, fachada-jardim-noite.jpg, salao-lustre-jantar.jpg, jardim-publico-noite.jpg, fachada-evento-noite.jpg, jardim-caminho-noite.jpg, jardim-detalhe-noite.jpg, lounge-poltronas-vertical.avif, hall-vertical.avif, jardim-entrada-vertical.avif, banheiro.avif, salao-azul-vertical.avif, cozinha.avif ·
`casamentos/`: cerimonia-jardim.jpg, mesa-bolo-decoracao.jpg, cerimonia-noivos-1.avif, cerimonia-noivos-2.avif, mesa-bolo.jpg, mesas-jantar-1.jpg, mesas-jantar-2.jpg, cerimonia-corredor-1.jpg, cerimonia-cadeiras.jpg, mesas-jantar-3.avif, cerimonia-corredor-2.avif, recepcao-painel.avif, banquete-vertical.avif, festa-pista-vertical.avif, corredor-flores-vertical.avif ·
`social/`: convidadas-lounge.jpg ·
`corporativo/`: jardim-evento-hero.avif, ativacao-1.avif, bar-networking.avif, jardim-publico.avif, show-cantora.avif, networking.avif, ativacao-2.avif ·
`servicos/`: equipe.jpg, gastronomia-buffet.jpg, dj.jpg, bartender.avif, decoracao-flores.avif, buffet-canapes.avif, assessoria.avif, drinks.avif, dj-detalhe.avif

Conteúdo por tipo (fatos permitidos: `casa.ts` + abaixo; escrever copy original, editorial, frases curtas, sem travessão, sem preço):
- **eventos-corporativos**: workshops, conferências e seminários; treinamentos e mentorias; palestras e masterclass; lançamentos de produto; filmagens e gravações; reuniões e apresentações. Argumentos: casa exclusiva (o evento é o único da casa), sala interna climatizada, jardim para pausas, perto da Paulista e da Faria Lima, buffet e bar próprios, equipe. Hero `corporativo/jardim-evento-hero.avif`. Card `corporativo/show-cantora.avif`.
- **confraternizacao-de-empresa**: confraternização de fim de ano, festa de equipe, celebração de metas, jantar de diretoria. Argumentos: festa com cara de casa e não de salão, jardim e bar para a noite, buffet e drinks, som e luz, DJ, espaço exclusivo, datas de fim de ano disputadas (convite a garantir a data sem prometer disponibilidade). Hero `espaco/jardim-publico-noite.jpg`. Card `corporativo/bar-networking.avif`.
- **offsite-e-happy-hour**: offsite e planejamento estratégico fora do escritório, happy hour de equipe, reunião de networking, encontro de clientes. Argumentos: sair do escritório sem sair da cidade, ambientes para trabalho de dia e para relaxar no fim, jardim, bar. Hero `espaco/lounge-poltronas-noite.jpg`. Card `corporativo/networking.avif`.
- **casamentos**: casamentos, mini weddings, cerimônia civil, recepção pós-cartório, renovação de votos; cerimônia e festa no mesmo lugar; 8 min da Igreja Nossa Senhora do Brasil. Hero `casamentos/cerimonia-jardim.jpg`. Card `casamentos/cerimonia-noivos-1.avif`.
- **aniversarios-e-celebracoes**: aniversários (15 anos, 50 e 60 anos), bodas, chá de bebê e chá revelação, jantares comemorativos, outras celebrações. Hero `espaco/salao-lustre-jantar.jpg`. Card `social/convidadas-lounge.jpg`.

Regras de cada item: `seo.title` ≤ 60 caracteres e termina com ` | Casa Maria Jardins` quando couber; `seo.description` 140–160 caracteres; `hero.title` pode ter um `<em>`; 4–6 `formatos`; 2–3 `destaques` (imagens diferentes entre si e do hero); 6–10 fotos na `galeria` (sem repetir); 4–6 `faq` (respostas só com fatos; para preço e disponibilidade, responder que o orçamento é personalizado e feito pela equipe a partir do formulário); `contato.title` e `contato.text` específicos do tipo.

- [ ] **Step 1: Escrever o validador (teste que falha)**

`scripts/validar-conteudo.mjs`:
```js
// Valida src/data/eventos.ts (via build do Astro não é necessário: importa com tsx-like eval simples).
import { readFile, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const out = await build({ entryPoints: ['src/data/eventos.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'));
const { eventos } = mod;
const icones = (await readFile('src/components/site/icones.ts', 'utf8').catch(() => '')).match(/^\s+(\w+):/gm)?.map((s) => s.trim().slice(0, -1)) ?? [];
let f = 0; const ok = (c, m) => { console.log(`${c ? '  ✓' : '  ✗'} ${m}`); if (!c) f++; };
const slugs = ['eventos-corporativos', 'confraternizacao-de-empresa', 'offsite-e-happy-hour', 'casamentos', 'aniversarios-e-celebracoes'];
ok(JSON.stringify(eventos.map((e) => e.slug)) === JSON.stringify(slugs), 'slugs e ordem');
const existe = async (p) => access('src/assets/images/' + p).then(() => true, () => false);
for (const e of eventos) {
  console.log('\n' + e.slug);
  const textos = JSON.stringify(e);
  ok(!/—| – /.test(textos), 'sem travessão');
  ok(!/R\$|reais|\bpre[çc]o de\b/i.test(textos), 'sem preço');
  ok(e.seo.title.length <= 60, `title ≤ 60 (${e.seo.title.length})`);
  ok(e.seo.description.length >= 140 && e.seo.description.length <= 160, `description 140–160 (${e.seo.description.length})`);
  ok(e.formatos.length >= 4 && e.formatos.length <= 6, `formatos 4–6 (${e.formatos.length})`);
  ok(e.destaques.length >= 2 && e.destaques.length <= 3, `destaques 2–3`);
  ok(e.galeria.length >= 6 && e.galeria.length <= 10, `galeria 6–10 (${e.galeria.length})`);
  ok(new Set(e.galeria.map((g) => g.src)).size === e.galeria.length, 'galeria sem repetição');
  ok(e.faq.length >= 4 && e.faq.length <= 6, `faq 4–6`);
  ok(e.preset === (e.grupo === 'corporativo' ? 'corporativo' : 'social'), 'preset do grupo');
  if (icones.length) for (const fm of e.formatos) ok(icones.includes(fm.icon), `ícone ${fm.icon}`);
  const imgs = [e.card.image, e.hero.image, e.intro.image, ...e.destaques.map((d) => d.image), ...e.galeria.map((g) => g.src)];
  for (const i of imgs) ok(await existe(i), `imagem ${i}`);
  ok(e.galeria.every((g) => g.alt.length > 10), 'alt descritivo na galeria');
}
console.log(f ? `\n${f} falha(s)` : '\nTudo certo'); process.exit(f ? 1 : 0);
```
Run: `node scripts/validar-conteudo.mjs` → Expected: FAIL (`slugs e ordem`, lista vazia). `esbuild` já vem com o Astro (`node_modules/esbuild`).

- [ ] **Step 2: Preencher os 5 itens em `src/data/eventos.ts`** seguindo o roteiro acima. Exemplo completo do primeiro item (os outros 4 no mesmo formato, com conteúdo próprio):

```ts
export const eventos: EventoTipo[] = [
  {
    slug: 'eventos-corporativos',
    grupo: 'corporativo',
    nomeMenu: 'Eventos corporativos',
    preset: 'corporativo',
    seo: {
      title: 'Espaço para eventos corporativos | Casa Maria Jardins',
      description: 'Workshops, treinamentos, palestras e lançamentos numa casa exclusiva nos Jardins, perto da Paulista e da Faria Lima, com buffet, bar e equipe própria.',
    },
    card: { image: 'corporativo/show-cantora.avif', frase: 'Workshops, treinamentos, palestras e lançamentos.' },
    hero: {
      image: 'corporativo/jardim-evento-hero.avif',
      overline: 'Eventos corporativos · Jardim Paulista',
      title: 'Exclusividade e versatilidade com o <em>conforto de estar em casa</em>',
      text: 'Uma casa de 500 m² nos Jardins, reservada só para o seu evento, a poucos minutos da Paulista e da Faria Lima.',
      formNoHero: true,
    },
    intro: {
      title: 'Um endereço que muda o <em>clima do encontro</em>',
      text: 'Sair do auditório e receber a equipe numa casa com jardim muda a energia de um treinamento, de uma palestra ou de um lançamento. A Casa Maria se adapta ao formato, com sala climatizada, jardim para as pausas e estrutura para receber até 250 convidados.',
      image: 'espaco/hall-telao.jpg',
      imageAlt: 'Entrada da Casa Maria com telão e piso de madeira',
    },
    formatos: [
      { icon: 'ideia', nome: 'Workshops e seminários', texto: 'Dias de imersão com sala montada e pausas no jardim.' },
      { icon: 'quadro', nome: 'Treinamentos e mentorias', texto: 'Ambiente climatizado e silencioso para o grupo render.' },
      { icon: 'microfone', nome: 'Palestras e masterclass', texto: 'Estrutura de som e luz para quem está no palco.' },
      { icon: 'foguete', nome: 'Lançamentos', texto: 'Uma casa nos Jardins como cenário da sua marca.' },
      { icon: 'filmadora', nome: 'Filmagens e gravações', texto: 'Ambientes com personalidade para conteúdo e publicidade.' },
    ],
    destaques: [
      { title: 'A casa é <em>só sua</em>', text: 'Durante o evento a Casa Maria recebe apenas o seu grupo. Sem divisão de espaço, sem circulação de outros eventos.', image: 'espaco/salao-azul-vertical.avif', imageAlt: 'Salão interno com iluminação azul' },
      { title: 'Perto de quem <em>vai chegar</em>', text: 'A 12 minutos da Avenida Paulista e a 16 da Faria Lima, num dos endereços mais nobres de São Paulo.', image: 'espaco/fachada-jardim-noite.jpg', imageAlt: 'Caminho iluminado ao lado da casa' },
    ],
    galeria: [
      { src: 'corporativo/ativacao-2.avif', alt: 'Atividade em grupo durante evento corporativo no jardim' },
      { src: 'corporativo/bar-networking.avif', alt: 'Convidados conversando no bar durante evento de empresa' },
      { src: 'corporativo/ativacao-1.avif', alt: 'Ativação de marca em evento corporativo na Casa Maria' },
      { src: 'corporativo/networking.avif', alt: 'Executivos em conversa durante evento corporativo' },
      { src: 'espaco/salao-luz-azul.jpg', alt: 'Hall com teto de vidro durante evento corporativo' },
      { src: 'corporativo/jardim-publico.avif', alt: 'Evento corporativo lotado no jardim à noite' },
      { src: 'espaco/jardim-musica-ao-vivo.jpg', alt: 'Apresentação de música ao vivo sob o teto de vidro' },
    ],
    faq: [
      { q: 'Quantas pessoas a Casa Maria recebe?', a: 'A casa tem 500 m² e recebe até 250 convidados. A montagem muda conforme o formato do evento, e a equipe indica a melhor configuração.' },
      { q: 'A casa fica exclusiva para o meu evento?', a: 'Sim. Durante o evento a Casa Maria recebe apenas o seu grupo.' },
      { q: 'Vocês oferecem buffet e bar?', a: 'Sim. Além da locação, a casa oferece buffet, bar de drinks, som e luz, decoração e equipe, montados conforme a proposta do evento.' },
      { q: 'Onde fica a Casa Maria?', a: 'Na Praça das Guianas, 82, no Jardim Paulista, a 12 minutos da Avenida Paulista, 15 da Rebouças e 16 da Faria Lima.' },
      { q: 'Como recebo um orçamento?', a: 'Preencha o formulário com a data e o número de convidados. A equipe monta uma proposta personalizada e entra em contato.' },
    ],
    contato: { title: 'Vamos planejar o seu <em>evento corporativo</em>?', text: 'Conte a data, o formato e o número de convidados. Nossa equipe retorna com uma proposta sob medida.' },
    mostrarClientes: true,
  },
  // ... confraternizacao-de-empresa, offsite-e-happy-hour, casamentos, aniversarios-e-celebracoes
];
```

- [ ] **Step 3: Rodar o validador até passar**

Run: `node scripts/validar-conteudo.mjs` → Expected: `Tudo certo`. (Se `icones.ts` ainda não existir porque a Task 3 corre em paralelo, o validador pula a checagem de ícone; rodar de novo depois da Task 3 e corrigir.)

- [ ] **Step 4: Commit**

```bash
git add src/data/eventos.ts scripts/validar-conteudo.mjs
git commit -m "feat(site): conteúdo dos 5 tipos de evento"
```

---

### Task 5: Componentes de seção, parte 2 (mídia e prova social)

**Files:**
- Create: `src/components/site/ServicesGrid.astro`, `AmbientesMarquee.astro`, `Testimonials.astro`, `ClientLogos.astro`, `Gallery.astro`, `Faq.astro`, `ContactSection.astro`, `LocationMap.astro`, `src/pages/lab/secoes-2.astro`

**Interfaces:**
- Consumes: `casa` (servicos, fotosAmbientes, depoimentos, clientes, endereco, mapa, distancias), `SectionHeading` (Task 3, se ainda não existir: usar markup equivalente inline `<span class="overline">` + `<h2 class="h2">`, sem importar), `LeadForm`, `StaticMap` (`src`, `height`), `Img`.
- Produces:
  - `<ServicesGrid />` (lê `casa.servicos`)
  - `<AmbientesMarquee overline title fotos?={Foto[]} />` (padrão `casa.fotosAmbientes`) + lista de ambientes (`casa.ambientes`) abaixo, `id` opcional (`<AmbientesMarquee id="espaco" .../>`)
  - `<Testimonials />` (lê `casa.depoimentos`)
  - `<ClientLogos />`
  - `<Gallery title fotos={Foto[]} />`
  - `<Faq items={{q,a}[]} />` (só o HTML; o JSON-LD é montado na página)
  - `<ContactSection title text preset />` com `id="contato"` e `<LeadForm preset submitLabel="Solicitar orçamento" />`
  - `<LocationMap />`

- [ ] **Step 1: Página de laboratório (falha no build)**

`src/pages/lab/secoes-2.astro`:
```astro
---
import SiteLayout from '../../components/site/SiteLayout.astro';
import ServicesGrid from '../../components/site/ServicesGrid.astro';
import AmbientesMarquee from '../../components/site/AmbientesMarquee.astro';
import Testimonials from '../../components/site/Testimonials.astro';
import ClientLogos from '../../components/site/ClientLogos.astro';
import Gallery from '../../components/site/Gallery.astro';
import Faq from '../../components/site/Faq.astro';
import ContactSection from '../../components/site/ContactSection.astro';
import LocationMap from '../../components/site/LocationMap.astro';
---
<SiteLayout title="Lab seções 2 | Casa Maria" description="Página de teste dos componentes de mídia (removida antes da entrega)." noIndex>
  <section class="section section--verde"><div class="container"><h1 class="h2">Lab seções 2</h1></div></section>
  <AmbientesMarquee id="espaco" overline="O espaço" title="Uma casa completa para <em>grandes momentos</em>" />
  <ServicesGrid />
  <Testimonials />
  <ClientLogos />
  <Gallery title="Galeria de teste" fotos={[{ src: 'casamentos/mesa-bolo.jpg', alt: 'Mesa de bolo decorada' }, { src: 'casamentos/cerimonia-noivos-1.avif', alt: 'Noivos na cerimônia' }, { src: 'corporativo/networking.avif', alt: 'Convidados conversando' }, { src: 'espaco/bar-dia.jpg', alt: 'Bar com lustre de cristais' }, { src: 'servicos/dj.jpg', alt: 'DJ tocando no jardim' }, { src: 'espaco/fachada-evento-noite.jpg', alt: 'Fachada iluminada durante evento' }]} />
  <section class="section"><div class="container"><Faq items={[{ q: 'Pergunta de teste?', a: 'Resposta de teste.' }, { q: 'Outra pergunta?', a: 'Outra resposta.' }]} /></div></section>
  <LocationMap />
  <ContactSection title="Vamos conversar?" text="Texto de teste." preset="social" />
</SiteLayout>
```

- [ ] **Step 2: `ServicesGrid.astro`, `Testimonials.astro`, `ClientLogos.astro`**

```astro
---
// ServicesGrid.astro
import Img from '../ui/Img.astro';
import { casa } from '../../data/casa';
---
<section class="section section--creme">
  <div class="container">
    <header class="reveal sg__hdr">
      <span class="overline">Além da locação</span>
      <h2 class="h2">Uma experiência <em>completa</em></h2>
      <p class="lead">Serviços próprios para que cada detalhe do evento fique no mesmo padrão da casa.</p>
    </header>
    <ul class="sg">
      {casa.servicos.map((s) => (
        <li class="reveal">
          <Img src={s.image} alt={s.nome} width={600} sizes="(max-width: 640px) 50vw, 20vw" />
          <h3>{s.nome}</h3>
          <p>{s.texto}</p>
        </li>
      ))}
    </ul>
  </div>
</section>
<style>
  .sg__hdr { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 3rem; max-width: 720px; }
  .sg__hdr :global(em) { font-style: italic; }
  .sg { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.2rem; }
  .sg li { display: flex; flex-direction: column; gap: .7rem; }
  .sg :global(img) { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; }
  .sg h3 { font-size: var(--fs-h3); color: var(--verde); }
  .sg p { font-size: .92rem; color: var(--tinta-suave); }
  @media (max-width: 1000px) { .sg { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 640px) { .sg { grid-template-columns: 1fr 1fr; } }
</style>
```

```astro
---
// Testimonials.astro
import { casa } from '../../data/casa';
---
<section class="section section--verde">
  <div class="container">
    <header class="reveal tm__hdr"><span class="overline">Depoimentos</span><h2 class="h2">Quem celebrou aqui <em>recomenda</em></h2></header>
    <ul class="tm">
      {casa.depoimentos.map((d) => (
        <li class="reveal">
          <span class="tm__estrelas" aria-label="5 de 5 estrelas">★★★★★</span>
          <blockquote>{d.texto}</blockquote>
          <cite>{d.autor}</cite>
        </li>
      ))}
    </ul>
  </div>
</section>
<style>
  .tm__hdr { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 3rem; }
  .tm__hdr :global(em) { font-style: italic; }
  .tm { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(232,220,200,.15); }
  .tm li { background: var(--verde); padding: 2.2rem 2rem; display: flex; flex-direction: column; gap: 1rem; }
  .tm__estrelas { color: var(--creme-dark); letter-spacing: .2em; font-size: .9rem; }
  .tm blockquote { margin: 0; font: italic 400 1.35rem/1.4 var(--serif); color: var(--creme-light); }
  .tm cite { font: 500 var(--fs-overline) var(--sans); font-style: normal; letter-spacing: .18em; text-transform: uppercase; color: var(--creme-dark); margin-top: auto; }
  @media (max-width: 900px) { .tm { grid-template-columns: 1fr; } }
</style>
```

```astro
---
// ClientLogos.astro
import Img from '../ui/Img.astro';
import { casa } from '../../data/casa';
---
<section class="section section--branco cl">
  <div class="container">
    <header class="reveal cl__hdr"><span class="overline">Empresas que já escolheram a casa</span></header>
    <ul class="cl__grid">
      {casa.clientes.map(([f, nome]) => <li><Img src={`clientes/${f}.avif`} alt={nome} width={240} sizes="140px" /></li>)}
    </ul>
  </div>
</section>
<style>
  .cl { padding: clamp(3.5rem, 6vw, 5rem) 0; }
  .cl__hdr { text-align: center; margin-bottom: 2.6rem; }
  .cl__grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, 1fr); gap: 2.4rem 2rem; align-items: center; }
  .cl__grid li { display: grid; place-items: center; }
  .cl__grid :global(img) { max-width: 120px; max-height: 56px; width: auto; height: auto; object-fit: contain; filter: grayscale(1); opacity: .75; transition: filter .3s, opacity .3s; }
  .cl__grid li:hover :global(img) { filter: none; opacity: 1; }
  @media (max-width: 900px) { .cl__grid { grid-template-columns: repeat(3, 1fr); } }
</style>
```

- [ ] **Step 3: `AmbientesMarquee.astro`, `Gallery.astro`**

```astro
---
// AmbientesMarquee.astro: faixa de fotos que rola sozinha + lista dos ambientes
import Img from '../ui/Img.astro';
import { casa } from '../../data/casa';
interface Props { overline: string; title: string; fotos?: { src: string; alt: string }[]; id?: string }
const { overline, title, fotos = [...casa.fotosAmbientes], id } = Astro.props;
---
<section class="section section--branco am" id={id}>
  <div class="container">
    <header class="reveal am__hdr"><span class="overline">{overline}</span><h2 class="h2" set:html={title} /></header>
  </div>
  <div class="am__faixa" aria-label="Fotos dos ambientes">
    <div class="am__trilho">
      {[...fotos, ...fotos].map((f, i) => (
        <div class="am__item" aria-hidden={i >= fotos.length ? 'true' : undefined}>
          <Img src={f.src} alt={i >= fotos.length ? '' : f.alt} width={800} sizes="(max-width: 640px) 80vw, 30vw" />
        </div>
      ))}
    </div>
  </div>
  <div class="container">
    <ul class="am__lista">
      {casa.ambientes.map((a) => <li class="reveal"><h3>{a.nome}</h3><p>{a.texto}</p></li>)}
    </ul>
  </div>
</section>
<style>
  .am__hdr { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 2.6rem; }
  .am__hdr :global(em) { font-style: italic; }
  .am__faixa { overflow: hidden; }
  .am__trilho { display: flex; gap: 8px; width: max-content; animation: am-rola 70s linear infinite; }
  .am__faixa:hover .am__trilho { animation-play-state: paused; }
  .am__item :global(img) { height: clamp(240px, 30vw, 380px); width: auto; aspect-ratio: auto; object-fit: cover; }
  @keyframes am-rola { to { transform: translateX(calc(-50% - 4px)); } }
  @media (prefers-reduced-motion: reduce) { .am__trilho { animation: none; } .am__faixa { overflow-x: auto; } }
  .am__lista { list-style: none; margin: 3rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.6rem; }
  .am__lista h3 { font-size: var(--fs-h3); color: var(--verde); margin-bottom: .5rem; }
  .am__lista p { font-size: .9rem; color: var(--tinta-suave); }
  @media (max-width: 1000px) { .am__lista { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .am__lista { grid-template-columns: 1fr; } }
</style>
```

```astro
---
// Gallery.astro: mosaico no desktop, rolagem horizontal com snap no celular
import Img from '../ui/Img.astro';
interface Props { title: string; fotos: { src: string; alt: string }[] }
const { title, fotos } = Astro.props;
---
<section class="section section--creme">
  <div class="container">
    <header class="reveal ga__hdr"><span class="overline">Galeria</span><h2 class="h2" set:html={title} /></header>
    <ul class="ga">
      {fotos.map((f) => <li><Img src={f.src} alt={f.alt} width={900} sizes="(max-width: 700px) 85vw, 33vw" /></li>)}
    </ul>
  </div>
</section>
<style>
  .ga__hdr { display: flex; flex-direction: column; gap: 1.1rem; margin-bottom: 2.6rem; }
  .ga__hdr :global(em) { font-style: italic; }
  .ga { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 260px; grid-auto-flow: dense; gap: 8px; }
  .ga li { overflow: hidden; }
  .ga li:nth-child(6n + 1) { grid-row: span 2; }
  .ga li:nth-child(6n + 5) { grid-column: span 2; }
  .ga :global(img) { width: 100%; height: 100%; object-fit: cover; transition: transform 1s var(--ease); }
  .ga li:hover :global(img) { transform: scale(1.04); }
  @media (max-width: 700px) {
    .ga { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 8px; margin-right: calc(-1 * var(--gutter)); padding-right: var(--gutter); }
    .ga li { flex: 0 0 82%; height: 340px; scroll-snap-align: start; }
  }
</style>
```

- [ ] **Step 4: `Faq.astro`, `LocationMap.astro`, `ContactSection.astro`**

```astro
---
// Faq.astro (o JSON-LD FAQPage é montado pela página)
interface Props { items: { q: string; a: string }[] }
const { items } = Astro.props;
---
<div class="faq">
  {items.map((i) => (
    <details class="reveal">
      <summary><span>{i.q}</span><span class="faq__mais" aria-hidden="true"></span></summary>
      <p>{i.a}</p>
    </details>
  ))}
</div>
<style>
  .faq { border-top: 1px solid rgba(13,59,46,.18); }
  .faq details { border-bottom: 1px solid rgba(13,59,46,.18); }
  .faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; gap: 1.5rem; padding: 1.5rem 0; font: 400 1.35rem/1.3 var(--serif); color: var(--verde); min-height: 44px; }
  .faq summary::-webkit-details-marker { display: none; }
  .faq__mais { position: relative; width: 14px; height: 14px; flex: none; margin-top: .45rem; }
  .faq__mais::before, .faq__mais::after { content: ''; position: absolute; left: 0; top: 6px; width: 14px; height: 1.5px; background: currentColor; transition: transform .3s; }
  .faq__mais::after { transform: rotate(90deg); }
  .faq details[open] .faq__mais::after { transform: rotate(0); }
  .faq p { padding: 0 0 1.6rem; max-width: 70ch; color: var(--tinta-suave); }
</style>
```

```astro
---
// LocationMap.astro
import StaticMap from '../ui/StaticMap.astro';
import { casa } from '../../data/casa';
---
<section class="section section--verde lm">
  <div class="container lm__in">
    <div class="lm__txt reveal">
      <span class="overline">Como chegar</span>
      <h2 class="h2">A praticidade de São Paulo com <em>atmosfera de refúgio</em></h2>
      <address>{casa.endereco.rua}<br />{casa.endereco.bairro}, {casa.endereco.cidade}, {casa.endereco.uf}<br />CEP {casa.endereco.cep}</address>
      <ul class="lm__dist">{casa.distancias.map((d) => <li><strong>{d.tempo}</strong> da {d.via} ({d.km})</li>)}</ul>
      <a class="btn btn--linha" href={casa.mapa.link} target="_blank" rel="noopener">Abrir no Google Maps</a>
    </div>
    <div class="lm__mapa reveal"><StaticMap src={casa.mapa.embed} height={440} /></div>
  </div>
</section>
<style>
  .lm__in { display: grid; grid-template-columns: 1fr 1.2fr; gap: clamp(2rem, 5vw, 5rem); align-items: center; }
  .lm__txt { display: flex; flex-direction: column; gap: 1.3rem; align-items: flex-start; }
  .lm__txt :global(em) { font-style: italic; }
  .lm address { font-style: normal; font-size: var(--fs-lead); color: var(--creme); }
  .lm__dist { list-style: none; margin: 0; padding: 0; display: grid; gap: .4rem; color: var(--creme); }
  .lm__dist strong { color: var(--creme-light); font-weight: 600; }
  @media (max-width: 900px) { .lm__in { grid-template-columns: 1fr; } }
</style>
```

```astro
---
// ContactSection.astro
import LeadForm from '../LeadForm.astro';
import { casa } from '../../data/casa';
interface Props { title: string; text: string; preset: 'social' | 'corporativo' }
const { title, text, preset } = Astro.props;
---
<section class="section section--creme ct" id="contato">
  <div class="container ct__in">
    <div class="ct__txt reveal">
      <span class="overline">Contato</span>
      <h2 class="h2" set:html={title} />
      <p class="lead">{text}</p>
      <p class="ct__end"><strong>Endereço</strong><br />{casa.endereco.linha}</p>
    </div>
    <div class="ct__form reveal">
      <p class="ct__titulo">Solicite seu orçamento</p>
      <LeadForm preset={preset} submitLabel="Solicitar orçamento" />
    </div>
  </div>
</section>
<style>
  .ct__in { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(2rem, 6vw, 6rem); align-items: start; }
  .ct__txt { display: flex; flex-direction: column; gap: 1.2rem; }
  .ct__txt :global(em) { font-style: italic; }
  .ct__end { font-size: .95rem; color: var(--tinta-suave); margin-top: 1rem !important; }
  .ct__form { background: var(--branco); padding: clamp(1.6rem, 3.5vw, 3rem); }
  .ct__titulo { font: 400 1.6rem var(--serif); color: var(--verde); margin-bottom: 1.4rem !important; }
  @media (max-width: 900px) { .ct__in { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Build + smoke + commit**

Run: `npm run build 2>&1 | grep -E "error|page\(s\)|Img\]"; node scripts/smoke.mjs --paginas /lab/secoes-2/`
Expected: build ok; smoke ✓ (exceto "Links internos" das rotas da Task 6).
```bash
git add src/components/site/{ServicesGrid,AmbientesMarquee,Testimonials,ClientLogos,Gallery,Faq,ContactSection,LocationMap}.astro src/pages/lab/secoes-2.astro
git commit -m "feat(site): componentes de mídia e prova social (serviços, ambientes, depoimentos, logos, galeria, FAQ, contato, mapa)"
```

---

### Task 6: Páginas de tipo (rota dinâmica)

**Files:**
- Create: `src/components/site/PaginaEvento.astro`, `src/pages/[evento].astro`
- Delete: `src/pages/casamentos.astro`, `src/pages/eventos-corporativos.astro`, `src/styles/casamentos.css`, `src/scripts/casa.js` **só se** nenhum outro arquivo importar (`grep -rn "casa.js\|casamentos.css" src`)

**Interfaces:**
- Consumes: tudo das Tasks 2–5; `eventos`, `eventoPorSlug`, `EventoTipo`; `casa`.
- Produces: URLs `/eventos-corporativos/`, `/confraternizacao-de-empresa/`, `/offsite-e-happy-hour/`, `/casamentos/`, `/aniversarios-e-celebracoes/`.

- [ ] **Step 1: Teste falhando**

Run: `npm run build && node scripts/smoke.mjs --paginas /confraternizacao-de-empresa/`
Expected: FAIL (`HTTP 200 (404)`).

- [ ] **Step 2: `PaginaEvento.astro`**

```astro
---
import SiteLayout from './SiteLayout.astro';
import Hero from './Hero.astro';
import ProofBar from './ProofBar.astro';
import SplitFeature from './SplitFeature.astro';
import SectionHeading from './SectionHeading.astro';
import FeatureList from './FeatureList.astro';
import AmbientesMarquee from './AmbientesMarquee.astro';
import ServicesGrid from './ServicesGrid.astro';
import ClientLogos from './ClientLogos.astro';
import Testimonials from './Testimonials.astro';
import Gallery from './Gallery.astro';
import Faq from './Faq.astro';
import LocationMap from './LocationMap.astro';
import ContactSection from './ContactSection.astro';
import EventTypeGrid from './EventTypeGrid.astro';
import { casa } from '../../data/casa';
import { eventos, type EventoTipo } from '../../data/eventos';

interface Props { evento: EventoTipo }
const { evento: e } = Astro.props;
const url = `${casa.url}/${e.slug}/`;
const semTags = (s: string) => s.replace(/<[^>]+>/g, '');
const irmaos = eventos.filter((x) => x.slug !== e.slug).sort((a, b) => Number(b.grupo === e.grupo) - Number(a.grupo === e.grupo)).slice(0, 3);

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', name: e.seo.title, description: e.seo.description, url },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Casa Maria Jardins', item: `${casa.url}/` },
      { '@type': 'ListItem', position: 2, name: e.nomeMenu, item: url },
    ] },
    { '@type': 'FAQPage', mainEntity: e.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};
const ctas = [{ label: 'Solicitar orçamento', href: '#contato', variant: 'claro' as const }, { label: 'Conhecer o espaço', href: '#espaco', variant: 'linha' as const }];
---
<SiteLayout title={e.seo.title} description={e.seo.description} canonical={url} jsonLd={jsonLd} current={`/${e.slug}/`}>
  <Hero image={e.hero.image} imageAlt={semTags(e.hero.title)} overline={e.hero.overline} title={e.hero.title} text={e.hero.text}
    ctas={e.hero.formNoHero ? [] : ctas} form={e.hero.formNoHero ? { preset: e.preset } : undefined} />
  <ProofBar items={[...casa.numeros]} />
  <SplitFeature image={e.intro.image} imageAlt={e.intro.imageAlt} overline={e.nomeMenu} title={e.intro.title} text={e.intro.text} />
  <section class="section section--creme">
    <div class="container">
      <SectionHeading overline="Formatos" title={`O que a casa <em>recebe</em>`} />
      <FeatureList items={e.formatos} />
    </div>
  </section>
  {e.destaques.map((d, i) => <SplitFeature image={d.image} imageAlt={d.imageAlt} title={d.title} text={d.text} reverse={i % 2 === 0} tone={i % 2 === 0 ? 'verde' : 'branco'} />)}
  <AmbientesMarquee id="espaco" overline="O espaço" title="Ambientes que se moldam <em>ao seu evento</em>" />
  <ServicesGrid />
  {e.mostrarClientes && <ClientLogos />}
  <Testimonials />
  <Gallery title={`Momentos na <em>Casa Maria</em>`} fotos={e.galeria} />
  <section class="section section--branco">
    <div class="container pe__faq">
      <SectionHeading overline="Perguntas frequentes" title="Tire suas <em>dúvidas</em>" />
      <Faq items={e.faq} />
    </div>
  </section>
  <LocationMap />
  <ContactSection title={e.contato.title} text={e.contato.text} preset={e.preset} />
  <section class="section section--branco">
    <div class="container">
      <SectionHeading overline="Outros eventos" title="A casa também <em>recebe</em>" />
      <EventTypeGrid items={irmaos.map((x) => ({ href: `/${x.slug}/`, nome: x.nomeMenu, frase: x.card.frase, image: x.card.image, grupo: x.grupo }))} />
    </div>
  </section>
</SiteLayout>
<style>
  .pe__faq { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(2rem, 5vw, 5rem); }
  @media (max-width: 900px) { .pe__faq { grid-template-columns: 1fr; } }
</style>
```

Nota: na seção "Outros eventos" com 3 cards, o `EventTypeGrid` coloca os 3 em `span 2` (linha única). Conferir na captura.

- [ ] **Step 3: `src/pages/[evento].astro` e remoção das páginas antigas**

```astro
---
import PaginaEvento from '../components/site/PaginaEvento.astro';
import { eventos, type EventoTipo } from '../data/eventos';
export function getStaticPaths() {
  return eventos.map((evento) => ({ params: { evento: evento.slug }, props: { evento } }));
}
const { evento } = Astro.props as { evento: EventoTipo };
---
<PaginaEvento evento={evento} />
```
```bash
git rm -q src/pages/casamentos.astro src/pages/eventos-corporativos.astro
grep -rn "casamentos.css\|scripts/casa.js" src || git rm -q src/styles/casamentos.css
```
(`src/scripts/casa.js` continua: a home antiga o usa até a Task 7a.)

- [ ] **Step 4: Build + smoke nas 5 páginas**

Run: `npm run build 2>&1 | grep -E "error|page\(s\)|Img\]"; node scripts/smoke.mjs --paginas /eventos-corporativos/,/confraternizacao-de-empresa/,/offsite-e-happy-hour/,/casamentos/,/aniversarios-e-celebracoes/`
Expected: todos ✓ (inclusive links internos, já que as 5 rotas existem; `/#espaco` só fica completo após a Task 7a, mas a raiz `/` responde 200).

- [ ] **Step 5: Commit**

```bash
git add -A src/pages src/components/site/PaginaEvento.astro src/styles
git commit -m "feat(site): páginas por tipo de evento (rota dinâmica) substituem as LPs antigas"
```

---

### Task 7a: Home nova + script de capturas

**Files:**
- Modify (reescrever): `src/pages/index.astro`
- Delete: `src/styles/home.css`, `src/scripts/casa.js`, `src/styles/marca.css` **se** nada mais importar (checar com `grep -rn`)
- Create: `scripts/capturar.mjs`

**Interfaces:**
- Consumes: componentes das Tasks 2–5, `eventos`, `casa`.
- Produces: `/` com `#eventos` (triagem), `#espaco`, `#contato`; `node scripts/capturar.mjs [paginas]` gera `capturas/<slug>-<vp>.png` (pasta no `.gitignore`).

- [ ] **Step 1: Teste falhando**

Run: `npm run build && node scripts/smoke.mjs --paginas /`
Expected: FAIL em "fontes do sistema"/"sem travessão" ou ausência de `data-site` (home antiga).

- [ ] **Step 2: Reescrever `src/pages/index.astro`**

```astro
---
// Home institucional + triagem (spec seção 7)
import SiteLayout from '../components/site/SiteLayout.astro';
import Hero from '../components/site/Hero.astro';
import ProofBar from '../components/site/ProofBar.astro';
import SectionHeading from '../components/site/SectionHeading.astro';
import EventTypeGrid from '../components/site/EventTypeGrid.astro';
import SplitFeature from '../components/site/SplitFeature.astro';
import AmbientesMarquee from '../components/site/AmbientesMarquee.astro';
import ServicesGrid from '../components/site/ServicesGrid.astro';
import Testimonials from '../components/site/Testimonials.astro';
import Gallery from '../components/site/Gallery.astro';
import ClientLogos from '../components/site/ClientLogos.astro';
import LocationMap from '../components/site/LocationMap.astro';
import ContactSection from '../components/site/ContactSection.astro';
import { casa } from '../data/casa';
import { eventos } from '../data/eventos';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EventVenue',
  name: casa.nome,
  url: `${casa.url}/`,
  image: `${casa.url}/images/og-casa-maria.jpg`,
  address: { '@type': 'PostalAddress', streetAddress: casa.endereco.rua, addressLocality: casa.endereco.cidade, addressRegion: casa.endereco.uf, postalCode: casa.endereco.cep, addressCountry: 'BR' },
  maximumAttendeeCapacity: 250,
};
const galeria = [
  { src: 'casamentos/cerimonia-jardim.jpg', alt: 'Cerimônia no jardim com cortinas brancas' },
  { src: 'corporativo/bar-networking.avif', alt: 'Convidados no bar durante evento de empresa' },
  { src: 'casamentos/mesa-bolo.jpg', alt: 'Mesa de bolo decorada com flores' },
  { src: 'espaco/fachada-evento-noite.jpg', alt: 'Fachada da Casa Maria iluminada durante evento' },
  { src: 'servicos/dj.jpg', alt: 'DJ tocando em meio aos jardins' },
  { src: 'casamentos/mesas-jantar-1.jpg', alt: 'Salão com mesas e lustre de cristais' },
  { src: 'corporativo/show-cantora.avif', alt: 'Apresentação musical durante evento' },
  { src: 'social/convidadas-lounge.jpg', alt: 'Convidadas em evento noturno na Casa Maria' },
];
---
<SiteLayout
  title="Casa Maria Jardins | Espaço para eventos nos Jardins, SP"
  description="Casa de eventos no Jardim Paulista: eventos corporativos, confraternizações, casamentos e celebrações em 500 m² de jardins e salões, para até 250 convidados."
  canonical={`${casa.url}/`}
  jsonLd={jsonLd}
  current="/"
>
  <Hero
    image="espaco/jardim-evento-noite.jpg"
    imageAlt="Convidados no jardim em frente à Casa Maria à noite"
    overline="Jardim Paulista · São Paulo"
    title="Uma casa em meio à cidade para <em>celebrar e reunir</em>"
    text="500 m² de jardins e salões nos Jardins, reservados só para o seu evento. Corporativo ou celebração, cada ocasião ganha ritmo e personalidade próprios."
    ctas={[{ label: 'Escolha seu evento', href: '#eventos', variant: 'claro' }, { label: 'Solicitar orçamento', href: '#contato', variant: 'linha' }]}
  />
  <section class="section section--branco" id="eventos">
    <div class="container">
      <SectionHeading overline="Para cada ocasião" title="Qual é o <em>seu evento</em>?" text="Escolha o tipo de evento e veja como a Casa Maria se prepara para ele." />
      <EventTypeGrid items={eventos.map((e) => ({ href: `/${e.slug}/`, nome: e.nomeMenu, frase: e.card.frase, image: e.card.image, grupo: e.grupo }))} />
    </div>
  </section>
  <ProofBar items={[...casa.numeros]} />
  <SplitFeature image="espaco/jardim-detalhe-noite.jpg" imageAlt="Detalhe do jardim iluminado à noite" overline="A casa" title="Alguns lugares recebem convidados. Outros fazem todos se sentirem <em>parte</em>." text="A Casa Maria foi pensada para quem valoriza presença, atmosfera e conexão. Ambientes que aproximam as pessoas e dão personalidade a cada ocasião. Não existem fórmulas prontas: cada evento ganha ritmo, estética e personalidade próprios." />
  <AmbientesMarquee id="espaco" overline="O espaço" title="Uma casa completa para <em>grandes momentos</em>" />
  <ServicesGrid />
  <Testimonials />
  <Gallery title="Momentos na <em>Casa Maria</em>" fotos={galeria} />
  <ClientLogos />
  <LocationMap />
  <ContactSection title="Vamos planejar o <em>seu evento</em>?" text="Conte o tipo de evento, a data e o número de convidados. Nossa equipe retorna com uma proposta personalizada." preset="social" />
</SiteLayout>
```

- [ ] **Step 3: Limpar arquivos da home antiga**

```bash
for f in src/styles/home.css src/scripts/casa.js src/styles/marca.css; do n=$(grep -rln "$(basename $f)" src | grep -v "^$f$" | wc -l); [ "$n" = 0 ] && git rm -q "$f" && echo "removido $f" || echo "mantido $f ($n referências)"; done
```

- [ ] **Step 4: `scripts/capturar.mjs`**

```js
// Capturas de tela (desktop 1440 e celular 390) das páginas, rolando para disparar o reveal.
// Uso: node scripts/capturar.mjs [/,/casamentos/]  → capturas/<slug>-<vp>.png
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { startServer } from './serve-dist.mjs';
const PORT = 4411;
const paginas = (process.argv[2] || '/,/eventos-corporativos/,/confraternizacao-de-empresa/,/offsite-e-happy-hour/,/casamentos/,/aniversarios-e-celebracoes/').split(',');
await mkdir('capturas', { recursive: true });
const server = await startServer(PORT);
const browser = await chromium.launch();
for (const [vp, size] of [['desktop', { width: 1440, height: 900 }], ['celular', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: size });
  await ctx.route(/cdn-cgi|googletagmanager|google\.com\/maps/, (r) => r.abort());
  for (const p of paginas) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${p}`, { waitUntil: 'networkidle' });
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 400) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80); }
    await page.evaluate(() => { document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visivel')); window.scrollTo(0, 0); });
    await page.waitForTimeout(500);
    const nome = (p.replace(/\//g, '') || 'home');
    await page.screenshot({ path: `capturas/${nome}-${vp}.png`, fullPage: true });
    console.log(`capturas/${nome}-${vp}.png`);
    await page.close();
  }
  await ctx.close();
}
await browser.close(); server.close();
```
```bash
grep -q "^capturas/" .gitignore || printf '\n# capturas de tela locais\ncapturas/\n' >> .gitignore
```

- [ ] **Step 5: Build + smoke + capturas + commit**

Run: `npm run build 2>&1 | grep -E "error|page\(s\)|Img\]"; node scripts/smoke.mjs --paginas /; node scripts/capturar.mjs /`
Expected: smoke ✓; abrir `capturas/home-desktop.png` e `capturas/home-celular.png` (Read) e conferir: hero legível, cards da triagem 3+2 no desktop, sem sobreposição, rodapé completo.
```bash
git add -A src/pages/index.astro src/styles src/scripts scripts/capturar.mjs .gitignore
git commit -m "feat(site): home institucional com triagem por tipo de evento"
```

---

### Task 7b: Validação final, limpeza e documentação

**Files:**
- Delete: `src/pages/lab/` (inteira), `_referencia/` (as páginas antigas já foram substituídas)
- Modify: `astro.config.mjs` (filtro do sitemap), `src/components/LeadForm.astro` (webhook de teste por variável de ambiente), `docs/gtm/testar.mjs` (usar `scripts/serve-dist.mjs`)
- Create: `CLAUDE.md` do repo (curto), `scripts/lighthouse.mjs`

- [ ] **Step 1: Remover laboratório e referência; sitemap**

```bash
git rm -rq src/pages/lab _referencia
```
Em `astro.config.mjs`, o filtro do sitemap passa a excluir também `/lab/`:
```js
integrations: [sitemap({ filter: (page) => !/\/(404|casamentos-v1|casamentos-v2|lab)\//.test(page) })],
```
Run: `npm run build && grep -o "<loc>[^<]*" dist/sitemap-0.xml`
Expected: exatamente `/`, `/aniversarios-e-celebracoes/`, `/bio/`, `/casamentos/`, `/confraternizacao-de-empresa/`, `/eventos-corporativos/`, `/offsite-e-happy-hour/`, `/politica-de-privacidade/`.

- [ ] **Step 2: Webhook de teste por variável de ambiente (sem tocar no config)**

Em `src/components/LeadForm.astro`, trocar `data-submit-url={formCfg.webhooks?.[0] || undefined}` por:
```astro
data-submit-url={formCfg.webhooks?.[0] || import.meta.env.PUBLIC_TEST_WEBHOOK || undefined}
```
Em `docs/gtm/testar.mjs`, trocar a linha `const preview = spawn(...)` e a `const encerrar = ...` por:
```js
const { startServer } = await import(join(SITE, 'scripts', 'serve-dist.mjs'));
const preview = await startServer(PORT);
const encerrar = () => preview.close();
```
(manter o restante; `BASE` usa `127.0.0.1`, que é onde o servidor escuta.)

Run:
```bash
PUBLIC_TEST_WEBHOOK=https://exemplo.invalid/webhook-test/casa-maria npm run build >/dev/null && node docs/gtm/testar.mjs 4406 | tail -30
```
Expected: termina com `Tudo certo`, cobrindo os formulários de todas as páginas (home, 5 tipos com hero-form nos 3 corporativos, v1, v2, bio). Depois **rebuild sem a variável**: `npm run build >/dev/null && grep -c "exemplo.invalid" -r dist || echo limpo` → Expected: `limpo`.

- [ ] **Step 3: Checagens completas**

```bash
npm run build 2>&1 | grep -E "error|warn|Img\]" | grep -v lightningcss
npx astro check 2>&1 | tail -3
node scripts/validar-conteudo.mjs | tail -2
node scripts/smoke.mjs
```
Expected: sem erro; `astro check` 0 errors; validador `Tudo certo`; smoke `Tudo certo` em todas as páginas do sitemap + v1/v2/bio, desktop e celular. Corrigir até passar (a correção entra no arquivo responsável, não no teste).

- [ ] **Step 4: Lighthouse**

`scripts/lighthouse.mjs`:
```js
// Lighthouse celular nas páginas-chave sobre o dist/. Uso: node scripts/lighthouse.mjs
import { execFileSync } from 'node:child_process';
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
  execFileSync('npx', ['-y', 'lighthouse@12', `http://127.0.0.1:${PORT}${p}`, '--quiet', '--output=json', `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo', `--chrome-path=${chromium.executablePath()}`,
    '--chrome-flags=--headless=new --no-sandbox', '--blocked-url-patterns=*cdn-cgi*'], { stdio: 'inherit' });
  const r = JSON.parse(readFileSync(out, 'utf8'));
  const notas = Object.fromEntries(Object.keys(metas).map((k) => [k, Math.round(r.categories[k].score * 100)]));
  const ok = Object.entries(metas).every(([k, m]) => notas[k] >= m);
  if (!ok) falhas++;
  console.log(`${ok ? '✓' : '✗'} ${p} ${JSON.stringify(notas)} LCP ${r.audits['largest-contentful-paint'].displayValue}`);
  if (!ok) for (const a of Object.values(r.audits).filter((a) => a.score !== null && a.score < 0.9 && a.details).slice(0, 8)) console.log(`    ${a.id}: ${a.title}`);
}
server.close();
process.exit(falhas ? 1 : 0);
```
Run: `node scripts/lighthouse.mjs`
Expected: ✓ nas 3 páginas (Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO ≥ 95). Se falhar, seguir `docs/performance.md` (LCP nunca lazy, `sizes` corretos, fontes) e repetir.

- [ ] **Step 5: Capturas e revisão visual**

Run: `node scripts/capturar.mjs` e abrir (Read) as 12 capturas (6 páginas × 2). Conferir: hierarquia, nada sobreposto, imagens certas por tipo, menu, formulário legível, rodapé. Corrigir o que estiver errado e repetir Steps 3–5.

- [ ] **Step 6: `CLAUDE.md` do repositório**

```markdown
# Casa Maria Jardins: site

Astro 7 estático. Site institucional da Casa Maria (grupo T.Venues). Repositório público: nunca versionar dado comercial do cliente.

## Comandos
- `npm run build` · `npm run check` (tipos) · `npm run smoke` (Playwright sobre o dist) · `node scripts/validar-conteudo.mjs` · `node scripts/lighthouse.mjs` · `node scripts/capturar.mjs`
- Testes de tracking: `PUBLIC_TEST_WEBHOOK=https://exemplo.invalid/webhook-test/x npm run build && node docs/gtm/testar.mjs 4406` (depois rebuild sem a variável)
- Servidor local do build: `node scripts/serve-dist.mjs 4410` (não usar `astro preview`)

## Estrutura
- Site novo: `src/components/site/*` + `src/styles/site/*` + dados em `src/data/casa.ts` (fatos da casa) e `src/data/eventos.ts` (um item por tipo de evento → página `/<slug>/` via `src/pages/[evento].astro`). Nova página de tipo = novo item em `eventos.ts`.
- LPs de anúncio (fora do menu, noindex): `/casamentos-v1/`, `/casamentos-v2/` com `src/components/lp/*` e `src/styles/lp.css`. `/bio/` e `/politica-de-privacidade/` também usam `lp.css`.
- Formulário: sempre `src/components/LeadForm.astro` (presets em `src/scripts/form-presets.ts`, contrato GTM v2 em `docs/tracking-gtm.md`).
- Mídia: `src/assets/images/<tema>/`; mapa de origem em `docs/midias-mapa.csv`; vídeos fora do git (`public/_dev-media/`, irão para o R2).

## Regras de texto
pt-BR, frases curtas, sem travessão, só fatos da casa, sem preço.

## Deploy
Ainda não: a hospedagem será no Cloudflare (ver especificação em `docs/superpowers/specs/`). Não criar Release.
```

- [ ] **Step 7: Commit e push**

```bash
git add -A
git status --short | head -40
git commit -m "chore(site): validação final (smoke, GTM v2, Lighthouse), limpeza do laboratório e CLAUDE.md"
git push
```
Expected: push na branch `feat/unificacao-astro7`; nenhuma Release.

---

## Self-review (feito)

- Cobertura da spec: §4 mapa/menu → Tasks 2, 6, 7a · §5 tokens → Task 1 · §6 componentes → Tasks 2, 3, 5 · §7 dados/rota/ordem → Tasks 1, 4, 6, 7a · §8 regras/SEO/JSON-LD/sitemap/links irmãos → Tasks 4, 6, 7a, 7b · §9 testes → Tasks 1 (smoke), 4 (validador), 7b (check, GTM, Lighthouse, capturas) · §10/§11 fora do escopo/pendências → nada a implementar.
- Tipos: `EventoTipo` (Task 1) usado igual em 4, 6, 7a; `hero.formNoHero` e `intro.imageAlt`/`destaques[].imageAlt` definidos na Task 1 e usados na 6.
- Paralelismo: Tasks 2, 3, 4, 5 tocam arquivos disjuntos; 5 pode rodar sem 3 (não importa `SectionHeading`: usa markup próprio); 4 valida ícones quando 3 existir.
