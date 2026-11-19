import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Ajuste `site` para o domínio do projeto (usado em canonical/OG).
export default defineConfig({
  site: 'https://espacocasamaria.com.br',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !/\/(404|casamentos-v1|casamentos-v2)\//.test(page) })],
  prefetch: true,
  build: {
    inlineStylesheets: 'always',
  },
  server: {
    port: 4321,
  },
});
