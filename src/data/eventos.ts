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
      { src: 'corporativo/ativacao-2.avif', alt: 'Grupo em atividade de alongamento no deck de madeira' },
      { src: 'corporativo/bar-networking.avif', alt: 'Convidados conversando no bar da casa' },
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
  {
    slug: 'confraternizacao-de-empresa',
    grupo: 'corporativo',
    nomeMenu: 'Confraternização de empresa',
    preset: 'corporativo',
    seo: {
      title: 'Confraternização de empresa nos Jardins | Casa Maria Jardins',
      description: 'Confraternização de fim de ano, festa de equipe e jantar de diretoria numa casa exclusiva nos Jardins, com jardim, bar, buffet, drinks, som e luz.',
    },
    card: { image: 'corporativo/bar-networking.avif', frase: 'Fim de ano, festa de equipe e celebração de metas.' },
    hero: {
      image: 'espaco/jardim-publico-noite.jpg',
      overline: 'Confraternização de empresa · Jardim Paulista',
      title: 'A festa da empresa com <em>cara de casa</em>',
      text: 'Jardim, bar e pista numa casa nos Jardins reservada só para a sua equipe. Uma noite que ninguém confunde com mais um salão de festas.',
      formNoHero: true,
    },
    intro: {
      title: 'O ano merece <em>uma boa noite</em>',
      text: 'Depois de um ano de entregas, a equipe quer celebrar num lugar à altura. Na Casa Maria a noite começa no jardim, passa pelo bar e termina na pista. A casa oferece buffet, drinks, som e luz e recebe até 250 convidados.',
      image: 'espaco/bar-evento-noite.jpg',
      imageAlt: 'Convidados brindando no bar com lustre de cristais',
    },
    formatos: [
      { icon: 'brinde', nome: 'Confraternização de fim de ano', texto: 'A celebração que fecha o ano da empresa.' },
      { icon: 'pessoas', nome: 'Festa de equipe', texto: 'Um encontro para o time comemorar junto.' },
      { icon: 'estrela', nome: 'Celebração de metas', texto: 'O resultado do ano ganha uma noite à altura.' },
      { icon: 'talheres', nome: 'Jantar de diretoria', texto: 'Mesa posta e serviço atento para um grupo seleto.' },
      { icon: 'musica', nome: 'Noite com música', texto: 'Som, luz e pista para a noite render.' },
    ],
    destaques: [
      { title: 'Uma festa, <em>não um salão</em>', text: 'Jardim iluminado, bar sob o lustre de cristais e ambientes com personalidade. A equipe sente que foi recebida numa casa.', image: 'espaco/jardim-evento-noite.jpg', imageAlt: 'Convidados no jardim em frente à casa à noite' },
      { title: 'Buffet, drinks e <em>pista</em>', text: 'A casa oferece buffet, bar de drinks, som e luz, montados conforme a proposta da festa.', image: 'servicos/buffet-canapes.avif', imageAlt: 'Canapés do buffet servidos em bandejas' },
      { title: 'Garanta a <em>sua data</em>', text: 'O fim do ano é a época mais disputada para confraternizações. Quanto antes a empresa falar com a equipe, mais opções de data.', image: 'servicos/drinks.avif', imageAlt: 'Drinks com limão servidos sobre bandeja de madeira' },
    ],
    galeria: [
      { src: 'corporativo/bar-networking.avif', alt: 'Convidados brindando no bar da casa' },
      { src: 'espaco/jardim-musica-ao-vivo.jpg', alt: 'Banda tocando ao vivo sob o teto de vidro' },
      { src: 'espaco/lounge-poltronas-noite.jpg', alt: 'Lounge com poltronas sob árvore iluminada' },
      { src: 'espaco/salao-luz-azul.jpg', alt: 'Hall com teto de vidro e convidados durante a festa' },
      { src: 'corporativo/show-cantora.avif', alt: 'Cantora se apresentando ao vivo no jardim à noite' },
      { src: 'servicos/bartender.avif', alt: 'Bartender finalizando um drink na taça' },
      { src: 'servicos/gastronomia-buffet.jpg', alt: 'Mesa de petiscos, frios e doces montada no evento' },
      { src: 'espaco/fachada-evento-noite.jpg', alt: 'Fachada da Casa Maria iluminada em noite de evento' },
    ],
    faq: [
      { q: 'Quantas pessoas cabem numa confraternização na Casa Maria?', a: 'A casa tem 500 m² e recebe até 250 convidados. A equipe indica a melhor montagem para o tamanho do grupo.' },
      { q: 'A casa fica exclusiva para a nossa festa?', a: 'Sim. Durante o evento a Casa Maria recebe apenas a sua empresa.' },
      { q: 'O que a casa oferece para a festa?', a: 'Buffet, bar de drinks, som e luz, decoração e equipe, montados conforme a proposta da confraternização.' },
      { q: 'Ainda tem data para o fim do ano?', a: 'A agenda de fim de ano muda rápido. Envie o formulário com a data desejada e a equipe confirma as opções disponíveis.' },
      { q: 'Onde fica a Casa Maria?', a: 'Na Praça das Guianas, 82, no Jardim Paulista, a 12 minutos da Avenida Paulista e 16 da Faria Lima.' },
      { q: 'Como recebo um orçamento?', a: 'O orçamento é personalizado. Preencha o formulário com a data e o número de convidados, e a equipe monta a proposta.' },
    ],
    contato: { title: 'Vamos garantir a <em>festa da sua equipe</em>?', text: 'Conte a data, o número de convidados e o clima que a empresa quer para a noite. Nossa equipe retorna com uma proposta sob medida.' },
    mostrarClientes: true,
  },
  {
    slug: 'offsite-e-happy-hour',
    grupo: 'corporativo',
    nomeMenu: 'Offsite e happy hour',
    preset: 'corporativo',
    seo: {
      title: 'Offsite e happy hour de empresa | Casa Maria Jardins',
      description: 'Offsite, planejamento estratégico e happy hour de equipe numa casa exclusiva nos Jardins. Sala climatizada para trabalhar, jardim e bar para o fim do dia.',
    },
    card: { image: 'corporativo/networking.avif', frase: 'Planejamento fora do escritório e happy hour de equipe.' },
    hero: {
      image: 'espaco/lounge-poltronas-noite.jpg',
      overline: 'Offsite e happy hour · Jardim Paulista',
      title: 'Sair do escritório <em>sem sair da cidade</em>',
      text: 'Uma casa nos Jardins para o time pensar com calma durante o dia e relaxar no fim da tarde, a 12 minutos da Paulista.',
      formNoHero: true,
    },
    intro: {
      title: 'Um dia de trabalho <em>com outro ritmo</em>',
      text: 'Longe da rotina do escritório, as conversas fluem melhor. A sala interna climatizada recebe as sessões de trabalho, o jardim acolhe as pausas e o bar abre quando a agenda termina.',
      image: 'espaco/hall-vertical.avif',
      imageAlt: 'Corredor interno com piso de madeira e luz quente levando ao jardim',
    },
    formatos: [
      { icon: 'ideia', nome: 'Offsite', texto: 'Um dia inteiro fora do escritório para pensar o próximo passo.' },
      { icon: 'quadro', nome: 'Planejamento estratégico', texto: 'Sala climatizada e silenciosa para as decisões do ano.' },
      { icon: 'coquetel', nome: 'Happy hour de equipe', texto: 'Bar aberto e jardim para fechar o dia juntos.' },
      { icon: 'pessoas', nome: 'Networking', texto: 'Ambientes que convidam a circular e conversar.' },
      { icon: 'taca', nome: 'Encontro de clientes', texto: 'Uma recepção nos Jardins para quem faz o negócio crescer.' },
    ],
    destaques: [
      { title: 'De dia, <em>foco</em>', text: 'A sala interna é climatizada e tem iluminação aconchegante. O grupo trabalha com conforto e sem interrupções de outros eventos.', image: 'servicos/assessoria.avif', imageAlt: 'Três pessoas revisando o planejamento num notebook' },
      { title: 'No fim do dia, <em>o bar abre</em>', text: 'Quando a pauta acaba, o jardim e o bar recebem o time para um happy hour sem precisar mudar de endereço.', image: 'espaco/bar-evento-noite.jpg', imageAlt: 'Convidados brindando no bar com lustre de cristais' },
    ],
    galeria: [
      { src: 'corporativo/networking.avif', alt: 'Colegas conversando e rindo durante encontro de empresa' },
      { src: 'corporativo/bar-networking.avif', alt: 'Convidados conversando e brindando no bar da casa' },
      { src: 'corporativo/ativacao-2.avif', alt: 'Grupo em atividade de alongamento no deck de madeira' },
      { src: 'espaco/bar-dia.jpg', alt: 'Bar com lustre de cristais e arranjos de flores' },
      { src: 'espaco/salao-azul-vertical.avif', alt: 'Sala interna com iluminação azul e sofás' },
      { src: 'espaco/jardim-caminho-noite.jpg', alt: 'Caminho do jardim iluminado à noite' },
      { src: 'servicos/drinks.avif', alt: 'Drinks com limão servidos sobre bandeja de madeira' },
      { src: 'servicos/gastronomia-buffet.jpg', alt: 'Mesa de petiscos e frios montada para o encontro' },
    ],
    faq: [
      { q: 'Dá para usar a casa durante o dia?', a: 'Sim. A Casa Maria recebe offsites e reuniões de trabalho, com sala interna climatizada e jardim para as pausas.' },
      { q: 'A casa fica exclusiva para o nosso grupo?', a: 'Sim. Durante o evento a Casa Maria recebe apenas a sua equipe.' },
      { q: 'Vocês oferecem alimentação e bar?', a: 'Sim. A casa oferece buffet, bar de drinks, som e luz, decoração e equipe, conforme a proposta do encontro.' },
      { q: 'Onde fica a Casa Maria?', a: 'Na Praça das Guianas, 82, no Jardim Paulista, a 12 minutos da Avenida Paulista, 15 da Rebouças e 16 da Faria Lima.' },
      { q: 'Como recebo um orçamento?', a: 'O orçamento é personalizado. Preencha o formulário com a data, o formato e o número de pessoas, e a equipe entra em contato.' },
    ],
    contato: { title: 'Vamos tirar o time <em>do escritório</em>?', text: 'Conte a data, a pauta do dia e o número de pessoas. Nossa equipe retorna com uma proposta sob medida.' },
    mostrarClientes: true,
  },
  {
    slug: 'casamentos',
    grupo: 'celebracoes',
    nomeMenu: 'Casamentos',
    preset: 'social',
    seo: {
      title: 'Espaço para casamentos nos Jardins | Casa Maria Jardins',
      description: 'Casamentos, mini weddings e cerimônia civil numa casa exclusiva nos Jardins. Cerimônia e festa no mesmo lugar, a 8 minutos da Igreja Nossa Senhora do Brasil.',
    },
    card: { image: 'casamentos/cerimonia-noivos-1.avif', frase: 'Cerimônia e festa no mesmo lugar, nos Jardins.' },
    hero: {
      image: 'casamentos/cerimonia-jardim.jpg',
      overline: 'Casamentos · Jardim Paulista',
      title: 'O sim no jardim, <em>a festa em casa</em>',
      text: 'Uma casa nos Jardins reservada só para o casal e os convidados, com cerimônia e festa no mesmo endereço.',
      formNoHero: false,
    },
    intro: {
      title: 'Um casamento com <em>alma de casa</em>',
      text: 'Na Casa Maria o casamento acontece num só lugar. A cerimônia no jardim, o jantar nos ambientes da casa e a pista à noite, sem deslocamento para os convidados. A casa recebe até 250 pessoas.',
      image: 'casamentos/cerimonia-corredor-1.jpg',
      imageAlt: 'Corredor da cerimônia com flores e cadeiras brancas',
    },
    formatos: [
      { icon: 'alianca', nome: 'Casamento', texto: 'Cerimônia e festa completas, do sim à pista.' },
      { icon: 'coracao', nome: 'Mini wedding', texto: 'Uma celebração íntima para os mais próximos.' },
      { icon: 'civil', nome: 'Cerimônia civil', texto: 'O casamento no civil com a casa como cenário.' },
      { icon: 'brinde', nome: 'Recepção pós-cartório', texto: 'Uma recepção para celebrar depois do cartório.' },
      { icon: 'casal', nome: 'Renovação de votos', texto: 'Uma nova cerimônia para reafirmar a história.' },
    ],
    destaques: [
      { title: 'Cerimônia e festa <em>no mesmo lugar</em>', text: 'Os convidados assistem ao sim no jardim e seguem para a festa a poucos passos, sem deslocamento.', image: 'casamentos/mesas-jantar-1.jpg', imageAlt: 'Mesas redondas postas para o jantar sob o teto de vidro' },
      { title: 'Perto da <em>igreja</em>', text: 'Para quem casa na igreja, a Casa Maria fica a 8 minutos da Igreja Nossa Senhora do Brasil.', image: 'casamentos/corredor-flores-vertical.avif', imageAlt: 'Corredor de entrada decorado com flores' },
      { title: 'A casa é <em>só de vocês</em>', text: 'Durante o casamento a Casa Maria recebe apenas os seus convidados, com buffet, bar, decoração e equipe da casa.', image: 'casamentos/mesa-bolo.jpg', imageAlt: 'Mesa do bolo com arranjos de flores' },
    ],
    galeria: [
      { src: 'casamentos/cerimonia-noivos-1.avif', alt: 'Noivos diante do celebrante na cerimônia sob as flores' },
      { src: 'casamentos/cerimonia-cadeiras.jpg', alt: 'Cadeiras brancas montadas para a cerimônia no deck' },
      { src: 'casamentos/cerimonia-corredor-2.avif', alt: 'Corredor da cerimônia com flores e altar ao fundo' },
      { src: 'casamentos/cerimonia-noivos-2.avif', alt: 'Noiva com véu longo ao lado do noivo no altar' },
      { src: 'casamentos/mesa-bolo-decoracao.jpg', alt: 'Mesa do bolo com doces e arranjos florais' },
      { src: 'casamentos/mesas-jantar-2.jpg', alt: 'Mesas de jantar com cadeiras brancas e centro de flores' },
      { src: 'casamentos/banquete-vertical.avif', alt: 'Salão montado para o banquete sob o teto de vidro' },
      { src: 'casamentos/recepcao-painel.avif', alt: 'Painel com o nome da casa e lustre de cristais na recepção' },
      { src: 'casamentos/festa-pista-vertical.avif', alt: 'Convidados reunidos na festa de casamento' },
      { src: 'casamentos/mesas-jantar-3.avif', alt: 'Mesa redonda posta com louça e flores para o jantar' },
    ],
    faq: [
      { q: 'Dá para fazer a cerimônia e a festa na Casa Maria?', a: 'Sim. A cerimônia acontece no jardim e a festa segue nos ambientes da casa, sem deslocamento.' },
      { q: 'Quantos convidados a casa recebe?', a: 'A casa tem 500 m² e recebe até 250 convidados.' },
      { q: 'A Casa Maria fica perto de qual igreja?', a: 'A 8 minutos da Igreja Nossa Senhora do Brasil.' },
      { q: 'Vocês fazem mini wedding e cerimônia civil?', a: 'Sim. A casa recebe mini weddings, cerimônias civis, recepções pós-cartório e renovações de votos.' },
      { q: 'O que a casa oferece para o casamento?', a: 'Buffet, bar de drinks, som e luz, decoração e equipe, montados conforme o estilo do casal.' },
      { q: 'Como recebo um orçamento?', a: 'O orçamento é personalizado. Preencha o formulário com a data e o número de convidados, e a equipe entra em contato.' },
    ],
    contato: { title: 'Vamos conversar sobre o <em>seu casamento</em>?', text: 'Conte a data, o formato e o número de convidados. Nossa equipe retorna com uma proposta feita para vocês.' },
    mostrarClientes: false,
  },
  {
    slug: 'aniversarios-e-celebracoes',
    grupo: 'celebracoes',
    nomeMenu: 'Aniversários e celebrações',
    preset: 'social',
    seo: {
      title: 'Espaço para aniversários nos Jardins | Casa Maria Jardins',
      description: 'Aniversários de 15, 50 e 60 anos, bodas, chá de bebê e jantares comemorativos numa casa exclusiva nos Jardins, com buffet, bar de drinks e equipe.',
    },
    card: { image: 'social/convidadas-lounge.jpg', frase: 'Aniversários, bodas, chás e jantares especiais.' },
    hero: {
      image: 'espaco/salao-lustre-jantar.jpg',
      overline: 'Aniversários e celebrações · Jardim Paulista',
      title: 'Celebrar como quem <em>recebe em casa</em>',
      text: 'Uma casa nos Jardins reservada só para você e os seus convidados, com jardim, bar e ambientes acolhedores.',
      formNoHero: false,
    },
    intro: {
      title: 'Uma data que <em>merece um lugar</em>',
      text: 'Algumas datas pedem mais do que um salão. Na Casa Maria a festa ganha jardim, bar sob o lustre de cristais e ambientes que acolhem do jantar íntimo à celebração para até 250 convidados.',
      image: 'espaco/lounge-poltronas-vertical.avif',
      imageAlt: 'Poltronas no jardim sob a árvore iluminada',
    },
    formatos: [
      { icon: 'bolo', nome: 'Aniversários', texto: 'Quinze, cinquenta, sessenta anos. Cada idade com a sua festa.' },
      { icon: 'alianca', nome: 'Bodas', texto: 'Uma celebração à altura dos anos juntos.' },
      { icon: 'presente', nome: 'Chá de bebê e chá revelação', texto: 'Um encontro delicado para receber quem está chegando.' },
      { icon: 'talheres', nome: 'Jantares comemorativos', texto: 'Mesa posta e serviço atento para uma noite especial.' },
      { icon: 'estrela', nome: 'Outras celebrações', texto: 'Conquistas e encontros que pedem uma comemoração.' },
    ],
    destaques: [
      { title: 'A casa é <em>só sua</em>', text: 'Durante a festa a Casa Maria recebe apenas os seus convidados. O jardim, o bar e a sala interna ficam reservados para a sua data.', image: 'espaco/jardim-evento-noite.jpg', imageAlt: 'Convidados no jardim em frente à casa à noite' },
      { title: 'Tudo pensado <em>para receber</em>', text: 'Buffet, bar de drinks, som e luz, decoração e equipe montados conforme o estilo da celebração.', image: 'servicos/gastronomia-buffet.jpg', imageAlt: 'Mesa de petiscos, frios e doces montada para a festa' },
    ],
    galeria: [
      { src: 'social/convidadas-lounge.jpg', alt: 'Convidadas sorrindo no lounge do jardim' },
      { src: 'espaco/bar-evento-noite.jpg', alt: 'Convidados brindando no bar com lustre de cristais' },
      { src: 'espaco/jardim-publico-noite.jpg', alt: 'Convidados no jardim sob as árvores iluminadas' },
      { src: 'espaco/lounge-tapete.jpg', alt: 'Lounge com tapete e instrumentos montados para show' },
      { src: 'servicos/decoracao-flores.avif', alt: 'Arranjo de orquídeas na decoração da festa' },
      { src: 'servicos/buffet-canapes.avif', alt: 'Canapés do buffet servidos em bandejas' },
      { src: 'servicos/bartender.avif', alt: 'Bartender finalizando um drink na taça' },
      { src: 'espaco/jardim-detalhe-noite.jpg', alt: 'Detalhe do jardim iluminado à noite' },
    ],
    faq: [
      { q: 'Quantos convidados a casa recebe?', a: 'A casa tem 500 m² e recebe até 250 convidados. Também recebe encontros menores, como jantares íntimos.' },
      { q: 'A casa fica exclusiva para a minha festa?', a: 'Sim. Durante o evento a Casa Maria recebe apenas os seus convidados.' },
      { q: 'Que tipos de celebração vocês recebem?', a: 'Aniversários de 15, 50 e 60 anos, bodas, chá de bebê, chá revelação, jantares comemorativos e outras celebrações.' },
      { q: 'O que a casa oferece para a festa?', a: 'Buffet, bar de drinks, som e luz, decoração e equipe, montados conforme o estilo da celebração.' },
      { q: 'Como recebo um orçamento?', a: 'O orçamento é personalizado. Preencha o formulário com a data e o número de convidados, e a equipe entra em contato.' },
    ],
    contato: { title: 'Vamos planejar a <em>sua celebração</em>?', text: 'Conte a data, o motivo da festa e o número de convidados. Nossa equipe retorna com uma proposta sob medida.' },
    mostrarClientes: false,
  },
];

export const eventoPorSlug = (slug: string) => eventos.find((e) => e.slug === slug);
export const eventosDoGrupo = (g: Grupo) => eventos.filter((e) => e.grupo === g);
