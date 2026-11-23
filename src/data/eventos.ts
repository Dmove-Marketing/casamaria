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
