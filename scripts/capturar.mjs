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
try {
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
} finally {
  await browser.close();
  server.close();
}
