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
