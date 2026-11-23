# Casa Maria Jardins: site

Astro 7 estático. Site institucional da Casa Maria (grupo T.Venues). Repositório público: nunca versionar dado comercial do cliente.

## Comandos
- `npm run build` · `npm run check` (tipos) · `npm run smoke` (Playwright sobre o dist) · `node scripts/validar-conteudo.mjs` · `node scripts/lighthouse.mjs` · `node scripts/capturar.mjs`
- Testes de tracking: `npm run test:gtm` (build com webhook fictício `exemplo.invalid`, roda `docs/gtm/testar.mjs 4406` e refaz o build limpo no fim). O teste intercepta o envio (nenhum lead sai da máquina). Depois, conferir que `grep -rl exemplo.invalid dist` não acha nada.
- Servidor local do build: `node scripts/serve-dist.mjs 4410` (não usar `astro preview`). Os scripts de teste sobem o próprio servidor.

## Estrutura
- Site novo: `src/components/site/*` + `src/styles/site/*` + dados em `src/data/casa.ts` (fatos da casa) e `src/data/eventos.ts` (um item por tipo de evento → página `/<slug>/` via `src/pages/[evento].astro`). Nova página de tipo = novo item em `eventos.ts`.
- LPs de anúncio (fora do menu, noindex): `/casamentos-v1/`, `/casamentos-v2/` com `src/components/lp/*` e `src/styles/lp.css`. `/bio/` e `/politica-de-privacidade/` também usam `lp.css`.
- Formulário: sempre `src/components/LeadForm.astro` (presets em `src/scripts/form-presets.ts`, contrato GTM v2 em `docs/tracking-gtm.md`).
- Mídia: `src/assets/images/<tema>/`; mapa de origem em `docs/midias-mapa.csv`; vídeos fora do git (`public/_dev-media/`, irão para o R2).

## Regras de texto
pt-BR, frases curtas, sem travessão, só fatos da casa, sem preço.

## Deploy
Ainda não: a hospedagem será no Cloudflare (ver especificação em `docs/superpowers/specs/`). Não criar Release.
