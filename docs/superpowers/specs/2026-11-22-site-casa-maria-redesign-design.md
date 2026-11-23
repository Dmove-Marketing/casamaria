# Site Casa Maria Jardins: redesign (home institucional, menu e páginas por tipo de evento)

Data: 22/11/2026 · Branch: `feat/unificacao-astro7` · Sem deploy (a hospedagem no Cloudflare é uma fase posterior).

## 1. Objetivo

Transformar o conjunto de LPs da Casa Maria em um site institucional com menu, uma home que apresenta a casa e encaminha cada visitante para o seu tipo de evento, e uma página por tipo de evento. As páginas de tipo substituem as LPs de anúncio que já existem nas mesmas URLs.

Critério de sucesso: 7 páginas novas (home + 5 tipos + menu em todas) num visual único que evolui a identidade do Astro, com formulário padrão Dmove (contrato GTM v2) e todos os testes da seção 9 passando.

## 2. Fatos que orientam o desenho

Os números comerciais ficam fora deste repositório (ele é público): análise completa no Cérebro da Dmove, `Clientes/T.Venues/Tecnologia/2026.11.22 - Site Casa Maria - especificação do redesign.md`.

- Corporativo, sobretudo a confraternização de fim de ano, é o que mais gera negócio. Casamento gera muita procura e converte pouco.
- A busca mais frequente no Google é a marca ("casa maria jardins").
- O público é empresa média e grande e celebração social de alto padrão.

## 3. Decisões (Michel, 22/11)

1. Páginas **por intenção**: 5 tipos; tipos pequenos viram seções dentro deles.
2. Visual: **evoluir a identidade do Astro atual** (Distrampler + Cormorant Garamond + Inter, verde #0d3b2e, creme, editorial).
3. Home: **institucional + triagem** (apresenta a casa e logo no topo pergunta "qual é o seu evento?").
4. As páginas novas **substituem as LPs** nas mesmas URLs (`/casamentos/`, `/eventos-corporativos/`). `/casamentos-v1/` e `/casamentos-v2/` seguem como estão, fora do menu, noindex, para anúncio.
5. **Sem filtro de orçamento** por enquanto: formulário padrão (preset social/corporativo). A v2 mantém o campo budget dela.
6. Caminho A: sistema de design + modelo único de página de tipo alimentado por arquivo de conteúdo.
7. Execução autônoma até o fim (sem aprovação intermediária em `/lab/`), validação feita pela própria execução.

## 4. Mapa do site e menu

```
/                                  Home institucional + triagem            (nova, substitui a home atual)
/eventos-corporativos/             Corporativo: workshops, treinamentos,   (nova, substitui a LP atual)
                                   palestras, lançamentos, gravações
/confraternizacao-de-empresa/      Confraternização de fim de ano          (nova)
/offsite-e-happy-hour/             Offsite, happy hour, networking         (nova)
/casamentos/                       Casamentos, mini wedding, civil,        (nova, substitui a LP atual)
                                   pós-cartório, renovação de votos
/aniversarios-e-celebracoes/       Aniversários (15 anos, 50 e 60 anos),   (nova)
                                   bodas, chás, jantares comemorativos
/casamentos-v1/  /casamentos-v2/   LPs de anúncio (inalteradas, noindex, sem menu)
/bio/  /politica-de-privacidade/  404   (inalteradas)
```

Menu (todas as páginas novas):
`Logo` · `Corporativo ▾` (Eventos corporativos · Confraternização de empresa · Offsite e happy hour) · `Celebrações ▾` (Casamentos · Aniversários e celebrações) · `O espaço` (`/#espaco`) · botão `Solicitar orçamento` (`#contato` da página).

- Desktop (≥ 1024px): barra fixa transparente sobre o hero, fica sólida (verde) após 60px de rolagem; submenus abrem no hover e no foco/teclado (`aria-expanded`), fecham com Esc.
- Celular: botão hambúrguer abre gaveta em tela cheia com os grupos expandidos, foco preso na gaveta, Esc/× fecham, rolagem do body travada.
- Item da página atual marcado (`aria-current="page"`).

## 5. Sistema de design

Arquivos: `src/styles/site/tokens.css` (variáveis), `src/styles/site/base.css` (tipografia, seções, botões, reveal) e CSS escopado em cada componente `.astro`. As páginas novas **não** usam `home.css`, `casamentos.css` nem `lp.css` (esses continuam servindo às páginas antigas que ficam).

Tokens (partem do `marca.css`):
- Cores: `--verde #0d3b2e`, `--verde-mid #1a5240`, `--verde-light #234d3a`, `--creme #e8dcc8`, `--creme-light #f3ede1`, `--creme-dark #c9b99a`, `--branco #faf8f3`, `--tinta #1c2a24` (texto em fundo claro), `--erro #c0392b`.
- Tipos: `--display` Distrampler (só H1 do hero e números), `--serif` Cormorant Garamond (H2/H3), `--sans` Inter Variable (texto, labels, botões).
- Escala: corpo 1rem/1.7; overline 0.75rem caixa-alta espaçada .22em (mínimo 0.75rem: nada abaixo disso, correção de acessibilidade em relação à home atual, que usa 0.6rem); H2 `clamp(2rem, 3.6vw, 3.1rem)`; H1 `clamp(2.4rem, 4.4vw, 4.4rem)`.
- Espaço: seções `clamp(4.5rem, 9vw, 8rem)` vertical; lateral `clamp(1.25rem, 6vw, 8rem)`; largura máxima de conteúdo 1240px.
- Contraste AA em todos os pares texto/fundo.
- Animação: `.reveal` (fade + translate 16px) via IntersectionObserver; desligada com `prefers-reduced-motion`.

## 6. Componentes (`src/components/site/`)

Cada componente: uma responsabilidade, props tipadas, CSS escopado, sem dependência de outra página.

| Componente | Faz | Props principais |
|---|---|---|
| `SiteLayout.astro` | Envolve `Base.astro`: tokens/base CSS, `SiteHeader`, `SiteFooter`, script de reveal | `title, description, canonical, ogImage, jsonLd, preset` |
| `SiteHeader.astro` | Menu da seção 4 (desktop + gaveta) | `current` (slug) |
| `SiteFooter.astro` | Logo, endereço, links do menu, Instagram (só se `config.social.instagram`, campo novo no `config.json`, vazio por ora), política, assinatura Think + T.Venues, ano | — |
| `Hero.astro` | Foto de fundo (LCP `priority`), véu, overline, H1, texto, até 2 CTAs; variante `split` com `LeadForm` à direita | `image, overline, title, text, ctas, form?` |
| `ProofBar.astro` | Números da casa (500 m², até 250 convidados, Jardim Paulista, 12 min da Paulista) | `items` |
| `SectionHeading.astro` | Overline + H2 + texto, alinhamento | `overline, title, text, align` |
| `EventTypeGrid.astro` | Cards de triagem (foto, nome, frase, link) para os 5 tipos | `items` (vêm do registro de tipos) |
| `FeatureList.astro` | Lista de formatos do tipo (ícone SVG + nome + 1 linha) | `items` |
| `SplitFeature.astro` | Foto + texto lado a lado (alternável) | `image, title, text, reverse` |
| `ServicesGrid.astro` | Serviços (buffet, bar, som e luz, decoração, equipe) com foto | `items` |
| `AmbientesMarquee.astro` | Faixa de fotos dos ambientes que rola sozinha (reaproveita a lógica da home atual) | `images` |
| `Testimonials.astro` | Depoimentos (os 6 da home atual) | `items` |
| `ClientLogos.astro` | Logos de empresas (corporativo) | — |
| `Gallery.astro` | Galeria em grade com carrossel no celular | `images` |
| `Faq.astro` | Perguntas frequentes em `<details>` + JSON-LD FAQPage gerado pela página | `items` |
| `ContactSection.astro` | Texto + `LeadForm` (preset da página) + endereço | `title, text, preset` |
| `LocationMap.astro` | Endereço, distâncias e mapa estático (`StaticMap`) | — |
| `CtaBand.astro` | Faixa de chamada final | `title, ctaLabel` |

Reaproveitados sem mudança: `LeadForm.astro`, `ui/Img.astro`, `ui/StaticMap.astro`, `ui/WhatsAppWidget.astro`, `layouts/Base.astro`.

## 7. Conteúdo como dado

`src/data/eventos.ts` exporta o registro dos 5 tipos (`EventoTipo[]`), tipado:

```ts
interface EventoTipo {
  slug: string;                 // 'confraternizacao-de-empresa'
  grupo: 'corporativo' | 'celebracoes';
  nomeMenu: string;             // 'Confraternização de empresa'
  preset: 'social' | 'corporativo';
  seo: { title: string; description: string };
  card: { image: string; frase: string };          // card da triagem na home
  hero: { image: string; overline: string; title: string; text: string };
  intro: { title: string; text: string; image: string };
  formatos: { icon: string; nome: string; texto: string }[];   // tipos que viraram seção
  destaques: { title: string; text: string; image: string }[]; // 2–3 SplitFeature
  galeria: { src: string; alt: string }[];         // 6–10 fotos, só fotos que existem em src/assets/images
  faq: { q: string; a: string }[];                 // 4–6 perguntas
  contato: { title: string; text: string };
  mostrarClientes: boolean;                        // logos de empresas (corporativos)
}
```

`src/data/casa.ts`: fatos da casa (endereço, números, distâncias, ambientes, serviços, depoimentos), fonte única para todas as páginas.

Rota: `src/pages/[evento].astro` com `getStaticPaths()` sobre o registro, renderizando `components/site/PaginaEvento.astro`. Os arquivos `src/pages/casamentos.astro` e `src/pages/eventos-corporativos.astro` são removidos (a rota dinâmica assume as URLs). A home nova é `src/pages/index.astro` reescrito.

### Ordem das seções

Home: Header → Hero (overline "Jardim Paulista · São Paulo", H1 institucional, CTAs "Escolha seu evento" e "Solicitar orçamento") → **Triagem** "Qual é o seu evento?" (`EventTypeGrid`, os 5 tipos) → ProofBar → O espaço (`#espaco`: SplitFeature + AmbientesMarquee) → Serviços → Depoimentos → Galeria → ClientLogos → Localização → Contato (preset social, tipo de evento livre) → Footer.

Página de tipo: Header → Hero (split com formulário nos corporativos; foto + CTA nos de celebração) → ProofBar → Intro → Formatos → Destaques (2–3) → AmbientesMarquee → Serviços → ClientLogos (se `mostrarClientes`) → Depoimentos → Galeria → FAQ → Localização → Contato (preset do tipo) → Footer.

Formulários por página: no máximo dois (`hero-form` no hero split, `lead-form` no contato), sempre via `LeadForm` com `idPrefix` distinto.

## 8. Regras de conteúdo e SEO

- Texto em pt-BR, frases curtas, **sem travessão** (regra da Dmove para texto de cliente). Endereço com vírgulas.
- Só fatos da casa (seção 2, `casa.ts`, textos já aprovados das páginas atuais). Nada de preço, prêmio, número ou serviço que não esteja no material. Conteúdo de concorrente não entra.
- Capacidade: **até 250 convidados** (texto mais recente aprovado, Astro de set/26). O WordPress dizia 300: registrar como pendência para o cliente confirmar.
- Cada página: `title` ≤ 60 caracteres, `description` 140–160, um H1, H2 por seção, `alt` descritivo em toda foto de conteúdo, `canonical` absoluto com barra no fim.
- JSON-LD: home = `EventVenue` (nome, endereço, geo, url, imagem, telefone só se configurado); tipo = `WebPage` + `BreadcrumbList` + `FAQPage`.
- Sitemap inclui home + 5 tipos + bio + política; exclui v1, v2, 404.
- Links internos: cards da home, menu, rodapé e "outros eventos" no fim de cada página de tipo (3 links para tipos irmãos).

## 9. Testes e validação (entrega)

1. `npm run build` sem erro e sem aviso de imagem faltando (`[Img] imagem não encontrada`).
2. `astro check` (tipos) sem erro.
3. Teste do contrato GTM v2 (`docs/gtm/testar.mjs`, com webhook fictício interceptado e config restaurada no fim): "Tudo certo" em todos os formulários de todas as páginas.
4. Smoke em Playwright (script `scripts/smoke.mjs`) sobre o build, desktop 1440 e celular 390, em todas as páginas do sitemap + v1/v2/bio: HTTP 200, zero erro de console (exceto `/cdn-cgi/trace`, que só existe no Cloudflare), zero imagem quebrada, zero link interno 404, um H1, `title`/`description` presentes, menu abre/fecha (hover, teclado, gaveta no celular), sem rolagem horizontal, fontes computadas só Distrampler/Cormorant/Inter nas páginas novas.
5. Lighthouse celular (home + 1 corporativo + 1 celebração): Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO ≥ 95.
6. Capturas desktop e celular de todas as páginas novas revisadas visualmente.
7. Nenhuma Release, nenhum deploy; commits na branch e push.

## 10. Fora do escopo

Filtro de orçamento, GTM/webhook/WhatsApp reais, Cloudflare, textos jurídicos da política (seguem [A CONFIRMAR]), blog, páginas de Mirante/Leopoldo, mudança nas LPs v1/v2/bio.

## 11. Pendências para o cliente

Confirmar capacidade (250 x 300), Instagram oficial, WhatsApp, dados da política de privacidade.
