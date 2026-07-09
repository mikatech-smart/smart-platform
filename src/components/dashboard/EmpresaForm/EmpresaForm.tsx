import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

import {
  buscarEmpresaPorId,
  buscarEmpresaPorSlug,
  atualizarEmpresa,
} from "../../../services/empresa/empresa.service";

import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import UploadImagem from "../UploadImagem";
import QRCodeEmpresa from "../QRCodeEmpresa/QRCodeEmpresa";
import HeroEmpresa from "../../public/HeroEmpresa/HeroEmpresa";
import InformacoesEmpresa from "../../public/InformacoesEmpresa/InformacoesEmpresa";
import ContatosEmpresa from "../../public/ContatosEmpresa/ContatosEmpresa";
import {
  PublicLandingPageContent,
  type EmpresaLanding,
} from "../../../pages/PublicLandingPage/PublicLandingPage";

import "../../../pages/PublicEmpresaPage/PublicEmpresaPage.css";
import "../../../pages/PublicLandingPage/PublicLandingPage.css";

const categoriasEmpresa = [
  "Comunicação Visual",
  "Restaurante",
  "Lanchonete",
  "Pizzaria",
  "Barbearia",
  "Salão de Beleza",
  "Clínica",
  "Dentista",
  "Loja",
  "Oficina",
  "Borracharia",
  "Auto Center",
  "Pet Shop",
  "Academia",
  "Mercado",
  "Padaria",
  "Imobiliária",
  "Advogado",
  "Escola",
  "Igreja",
];

type AbaEmpresa =
  | "informacoes"
  | "aparencia"
  | "plano"
  | "landing"
  | "contato"
  | "endereco"
  | "redes"
  | "conectividade";

type LogoExibicao = "normal" | "hidden";
type TipoFundo = "solida" | "gradiente";
type DirecaoGradiente = "horizontal" | "vertical" | "diagonal";
type AparenciaConfig = {
  logoExibicao: LogoExibicao;
  corPrincipal: string;
  corSecundaria: string;
  corBotoes: string;
  corTextoBotoes: string;
  corFundoPagina: string;
  corAreaPrincipal: string;
  corFundoHero: string;
  tipoFundo: TipoFundo;
  gradienteInicio: string;
  gradienteFim: string;
  gradienteDirecao: DirecaoGradiente;
};

const abasEmpresa: Array<{
  id: AbaEmpresa;
  label: string;
  adminOnly?: boolean;
}> = [
  { id: "informacoes", label: "Informações" },
  { id: "aparencia", label: "Personalizar Página" },
  { id: "plano", label: "Plano e Recursos", adminOnly: true },
  { id: "landing", label: "Landing Page" },
  { id: "contato", label: "Contato" },
  { id: "endereco", label: "Endereço" },
  { id: "redes", label: "Redes Sociais" },
  { id: "conectividade", label: "Conectividade" },
];

type PlanoEmpresa = "starter" | "pro" | "premium";
type RecursoEmpresaId =
  | "pagina_publica"
  | "painel_cliente"
  | "landing_page"
  | "dominio_personalizado"
  | "cardapio_digital"
  | "wifi"
  | "google_reviews"
  | "nfc"
  | "qr_code";

type RecursosContratados = Record<RecursoEmpresaId, boolean>;

const planosEmpresa: Array<{
  id: PlanoEmpresa;
  nome: string;
  descricao: string;
}> = [
  {
    id: "starter",
    nome: "Starter",
    descricao: "Base para pagina publica, painel, NFC e QR Code.",
  },
  {
    id: "pro",
    nome: "Pro",
    descricao: "Preparado para modulos comerciais e relacionamento.",
  },
  {
    id: "premium",
    nome: "Premium",
    descricao: "Estrutura completa para recursos avancados e modulos avulsos.",
  },
];

const recursosPadrao: RecursosContratados = {
  pagina_publica: true,
  painel_cliente: true,
  landing_page: false,
  dominio_personalizado: false,
  cardapio_digital: false,
  wifi: false,
  google_reviews: false,
  nfc: true,
  qr_code: true,
};

const recursosEmpresa: Array<{
  id: RecursoEmpresaId;
  nome: string;
  descricao: string;
  statusInativo: "Em breve" | "Nao contratado";
}> = [
  {
    id: "pagina_publica",
    nome: "Pagina Publica",
    descricao: "Vitrine principal acessada por clientes.",
    statusInativo: "Nao contratado",
  },
  {
    id: "painel_cliente",
    nome: "Painel do Cliente",
    descricao: "Permite que o cliente edite dados da propria empresa.",
    statusInativo: "Nao contratado",
  },
  {
    id: "landing_page",
    nome: "Landing Page",
    descricao: "Modulo reservado para campanhas e ofertas.",
    statusInativo: "Em breve",
  },
  {
    id: "dominio_personalizado",
    nome: "Dominio Personalizado",
    descricao: "Uso de dominio proprio ou white label.",
    statusInativo: "Em breve",
  },
  {
    id: "cardapio_digital",
    nome: "Cardapio Digital",
    descricao: "Estrutura futura para produtos, categorias e pedidos.",
    statusInativo: "Em breve",
  },
  {
    id: "wifi",
    nome: "Wi-Fi",
    descricao: "Exibicao de dados de rede para clientes autorizados.",
    statusInativo: "Nao contratado",
  },
  {
    id: "google_reviews",
    nome: "Google Reviews",
    descricao: "Atalho para avaliacoes e reputacao no Google.",
    statusInativo: "Nao contratado",
  },
  {
    id: "nfc",
    nome: "NFC",
    descricao: "Link preparado para gravacao em etiquetas NFC.",
    statusInativo: "Nao contratado",
  },
  {
    id: "qr_code",
    nome: "QR Code",
    descricao: "Geracao e uso do QR Code da empresa.",
    statusInativo: "Nao contratado",
  },
];

function normalizarPlano(valor: unknown): PlanoEmpresa {
  return planosEmpresa.some((plano) => plano.id === valor)
    ? (valor as PlanoEmpresa)
    : "starter";
}

function normalizarRecursos(valor: unknown): RecursosContratados {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...recursosPadrao };
  }

  const recursosRecebidos = valor as Partial<Record<RecursoEmpresaId, unknown>>;

  return recursosEmpresa.reduce<RecursosContratados>(
    (recursos, recurso) => ({
      ...recursos,
      [recurso.id]:
        typeof recursosRecebidos[recurso.id] === "boolean"
          ? Boolean(recursosRecebidos[recurso.id])
          : recursosPadrao[recurso.id],
    }),
    { ...recursosPadrao }
  );
}

type LandingPageSecaoId =
  | "templates"
  | "ordenacao"
  | "hero"
  | "sobre"
  | "servicos"
  | "galeria"
  | "depoimentos"
  | "contato"
  | "cta"
  | "seo";

type LandingPageHeroConfig = {
  titulo: string;
  subtitulo: string;
  botaoTexto: string;
  botaoLink: string;
  imagemDestaque: string;
};

type LandingPageSobreConfig = {
  titulo: string;
  texto: string;
  imagem: string;
};

type LandingPageServicoConfig = {
  titulo: string;
  descricao: string;
};

type LandingPageGaleriaImagemConfig = {
  url: string;
  alt: string;
};

type LandingPageDepoimentoConfig = {
  nome: string;
  cargoEmpresa: string;
  texto: string;
};

type LandingPageContatoConfig = {
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
};

type LandingPageCtaConfig = {
  titulo: string;
  texto: string;
  botaoTexto: string;
  botaoLink: string;
};

type LandingPageSeoConfig = {
  titulo: string;
  descricao: string;
  palavrasChave: string;
  imagemCompartilhamento: string;
};

type LandingPageSecaoConteudoId =
  | "hero"
  | "sobre"
  | "servicos"
  | "galeria"
  | "depoimentos"
  | "contato"
  | "cta";

type LandingPageConfig = {
  publicada: boolean;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  galeria: LandingPageGaleriaImagemConfig[];
  depoimentos: LandingPageDepoimentoConfig[];
  contato: LandingPageContatoConfig;
  cta: LandingPageCtaConfig;
  seo: LandingPageSeoConfig;
  ordemSecoes: LandingPageSecaoConteudoId[];
  visibilidadeSecoes: Record<LandingPageSecaoConteudoId, boolean>;
  versaoPublicada: LandingPagePublicavelConfig | null;
  alteracoesNaoPublicadas: boolean;
  historicoVersoes: LandingPagePublicavelConfig[];
};

type LandingPagePublicavelConfig = Omit<
  LandingPageConfig,
  "versaoPublicada" | "alteracoesNaoPublicadas" | "historicoVersoes"
>;

type LandingPageSectionProps = {
  nome: string;
  descricao: string;
  landingPageContratada: boolean;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  galeria: LandingPageGaleriaImagemConfig[];
  depoimentos: LandingPageDepoimentoConfig[];
  contato: LandingPageContatoConfig;
  cta: LandingPageCtaConfig;
  seo: LandingPageSeoConfig;
  ordemSecoes: LandingPageSecaoConteudoId[];
  visibilidadeSecoes: Record<LandingPageSecaoConteudoId, boolean>;
  onHeroChange: (campo: keyof LandingPageHeroConfig, valor: string) => void;
  onSobreChange: (campo: keyof LandingPageSobreConfig, valor: string) => void;
  onServicoChange: (
    indice: number,
    campo: keyof LandingPageServicoConfig,
    valor: string
  ) => void;
  onServicoAdd: () => void;
  onServicoRemove: (indice: number) => void;
  onGaleriaImagemChange: (
    indice: number,
    campo: keyof LandingPageGaleriaImagemConfig,
    valor: string
  ) => void;
  onGaleriaImagemAdd: () => void;
  onGaleriaImagemRemove: (indice: number) => void;
  onDepoimentoChange: (
    indice: number,
    campo: keyof LandingPageDepoimentoConfig,
    valor: string
  ) => void;
  onDepoimentoAdd: () => void;
  onDepoimentoRemove: (indice: number) => void;
  onContatoChange: (campo: keyof LandingPageContatoConfig, valor: string) => void;
  onCtaChange: (campo: keyof LandingPageCtaConfig, valor: string) => void;
  onSeoChange: (campo: keyof LandingPageSeoConfig, valor: string) => void;
  onTemplateApply: (template: LandingPageTemplateConfig) => void;
  onSecaoMove: (secao: LandingPageSecaoConteudoId, direcao: "up" | "down") => void;
  onSecaoVisibilityChange: (
    secao: LandingPageSecaoConteudoId,
    visivel: boolean
  ) => void;
};

type LandingPageSecaoConfig = {
  id: LandingPageSecaoId;
  nome: string;
  descricao: string;
  ordem: number;
  Component: (props: LandingPageSectionProps) => ReactElement;
};

type LandingPageIaContexto = {
  nomeEmpresa: string;
  categoria: string;
  descricao: string;
  servicos: LandingPageServicoConfig[];
  contatos: LandingPageContatoConfig;
};

type LandingPageTemplateConfig = {
  id: string;
  nome: string;
  segmento: string;
  descricao: string;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  cta: LandingPageCtaConfig;
};

const landingPageHeroPadrao: LandingPageHeroConfig = {
  titulo: "",
  subtitulo: "",
  botaoTexto: "",
  botaoLink: "",
  imagemDestaque: "",
};

const landingPageHeroExemplo: LandingPageHeroConfig = {
  titulo: "Transforme visitantes em clientes",
  subtitulo:
    "Uma landing page objetiva, bonita e preparada para destacar sua empresa.",
  botaoTexto: "Falar agora",
  botaoLink: "#contato",
  imagemDestaque: "",
};

const landingPageSobrePadrao: LandingPageSobreConfig = {
  titulo: "",
  texto: "",
  imagem: "",
};

const landingPageSobreExemplo: LandingPageSobreConfig = {
  titulo: "Sobre a empresa",
  texto:
    "Apresente sua historia, seus diferenciais e o motivo pelo qual clientes devem escolher sua empresa.",
  imagem: "",
};

const landingPageServicosPadrao: LandingPageServicoConfig[] = [
  {
    titulo: "",
    descricao: "",
  },
];

const landingPageServicosExemplo: LandingPageServicoConfig[] = [
  {
    titulo: "Atendimento personalizado",
    descricao: "Solucoes pensadas para a necessidade de cada cliente.",
  },
  {
    titulo: "Entrega profissional",
    descricao: "Processo organizado para garantir qualidade do inicio ao fim.",
  },
  {
    titulo: "Suporte rapido",
    descricao: "Canais simples para tirar duvidas e solicitar atendimento.",
  },
];

const landingPageGaleriaPadrao: LandingPageGaleriaImagemConfig[] = [
  {
    url: "",
    alt: "",
  },
];

const landingPageGaleriaExemplo: LandingPageGaleriaImagemConfig[] = [
  {
    url: "",
    alt: "Ambiente preparado para receber clientes",
  },
  {
    url: "",
    alt: "Produto ou servico em destaque",
  },
  {
    url: "",
    alt: "Equipe realizando um atendimento",
  },
  {
    url: "",
    alt: "Detalhe visual do trabalho entregue",
  },
];

const landingPageDepoimentosPadrao: LandingPageDepoimentoConfig[] = [
  {
    nome: "",
    cargoEmpresa: "",
    texto: "",
  },
];

const landingPageDepoimentosExemplo: LandingPageDepoimentoConfig[] = [
  {
    nome: "Ana Martins",
    cargoEmpresa: "Cliente recorrente",
    texto:
      "O atendimento foi rapido, cuidadoso e resolveu exatamente o que eu precisava.",
  },
  {
    nome: "Carlos Silva",
    cargoEmpresa: "Empresario local",
    texto:
      "A experiencia foi simples do primeiro contato ate a entrega final.",
  },
  {
    nome: "Mariana Costa",
    cargoEmpresa: "",
    texto:
      "Recomendo para quem busca qualidade, organizacao e suporte de verdade.",
  },
];

const landingPageContatoPadrao: LandingPageContatoConfig = {
  telefone: "",
  whatsapp: "",
  email: "",
  endereco: "",
};

const landingPageCtaPadrao: LandingPageCtaConfig = {
  titulo: "",
  texto: "",
  botaoTexto: "",
  botaoLink: "",
};

const landingPageCtaExemplo: LandingPageCtaConfig = {
  titulo: "Pronto para comecar?",
  texto:
    "Fale com a nossa equipe e descubra como podemos ajudar sua empresa hoje.",
  botaoTexto: "Solicitar atendimento",
  botaoLink: "#contato",
};

const landingPageSeoPadrao: LandingPageSeoConfig = {
  titulo: "",
  descricao: "",
  palavrasChave: "",
  imagemCompartilhamento: "",
};

const landingPageOrdemSecoesPadrao: LandingPageSecaoConteudoId[] = [
  "hero",
  "sobre",
  "servicos",
  "galeria",
  "depoimentos",
  "contato",
  "cta",
];

const landingPageSecoesOrdenaveis: Array<{
  id: LandingPageSecaoConteudoId;
  nome: string;
}> = [
  { id: "hero", nome: "Hero" },
  { id: "sobre", nome: "Sobre" },
  { id: "servicos", nome: "Servicos" },
  { id: "galeria", nome: "Galeria" },
  { id: "depoimentos", nome: "Depoimentos" },
  { id: "contato", nome: "Contato" },
  { id: "cta", nome: "CTA" },
];

const landingPageVisibilidadeSecoesPadrao: Record<
  LandingPageSecaoConteudoId,
  boolean
> = {
  hero: true,
  sobre: true,
  servicos: true,
  galeria: true,
  depoimentos: true,
  contato: true,
  cta: true,
};

const landingPageTemplates: LandingPageTemplateConfig[] = [
  {
    id: "auto-center",
    nome: "Auto Center",
    segmento: "Automotivo",
    descricao: "Ideal para oficinas, auto centers, borracharias e mecanicas.",
    hero: {
      titulo: "Cuide do seu carro com quem entende",
      subtitulo:
        "Servicos automotivos com atendimento rapido, diagnostico claro e compromisso com a seguranca do seu veiculo.",
      botaoTexto: "Agendar atendimento",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Especialistas em manutencao automotiva",
      texto:
        "Atendemos motoristas que buscam confianca, transparencia e qualidade em cada etapa do servico, da avaliacao inicial ate a entrega do veiculo.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Revisao preventiva",
        descricao:
          "Checklist completo para identificar problemas antes que eles virem prejuizo.",
      },
      {
        titulo: "Freios e suspensao",
        descricao:
          "Manutencao essencial para conforto, estabilidade e seguranca na direcao.",
      },
      {
        titulo: "Troca de oleo e filtros",
        descricao:
          "Servicos rapidos com orientacao sobre o melhor cuidado para o motor.",
      },
    ],
    cta: {
      titulo: "Seu carro merece atencao hoje",
      texto:
        "Fale com a equipe e agende uma avaliacao para manter seu veiculo em dia.",
      botaoTexto: "Chamar no WhatsApp",
      botaoLink: "#contato",
    },
  },
  {
    id: "restaurante",
    nome: "Restaurante",
    segmento: "Alimentacao",
    descricao: "Pensado para restaurantes, lanchonetes, pizzarias e bares.",
    hero: {
      titulo: "Sabor que transforma qualquer momento",
      subtitulo:
        "Pratos preparados com cuidado, ingredientes selecionados e atendimento acolhedor para voce aproveitar sem pressa.",
      botaoTexto: "Ver atendimento",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Uma experiencia feita para receber bem",
      texto:
        "Unimos sabor, ambiente agradavel e uma equipe atenta para entregar uma experiencia simples, gostosa e memoravel.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Almoco e jantar",
        descricao:
          "Opcoes para diferentes momentos do dia, sempre com preparo cuidadoso.",
      },
      {
        titulo: "Pedidos e reservas",
        descricao:
          "Canais simples para pedir, reservar mesa ou tirar duvidas antes de vir.",
      },
      {
        titulo: "Eventos e grupos",
        descricao:
          "Atendimento preparado para encontros, comemoracoes e momentos especiais.",
      },
    ],
    cta: {
      titulo: "Bateu a vontade?",
      texto:
        "Entre em contato e descubra a melhor opcao para seu pedido ou reserva.",
      botaoTexto: "Falar com o restaurante",
      botaoLink: "#contato",
    },
  },
  {
    id: "clinica",
    nome: "Clinica",
    segmento: "Saude e bem-estar",
    descricao: "Base para clinicas, consultorios, dentistas e profissionais de saude.",
    hero: {
      titulo: "Cuidado profissional para sua saude",
      subtitulo:
        "Atendimento humanizado, estrutura organizada e orientacao clara para cada etapa do seu cuidado.",
      botaoTexto: "Agendar consulta",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Atendimento com proximidade e responsabilidade",
      texto:
        "A clinica foi preparada para receber cada paciente com atencao, respeito e foco em uma experiencia tranquila do agendamento ao retorno.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Consultas especializadas",
        descricao:
          "Avaliacoes feitas com escuta ativa, orientacao clara e plano de cuidado.",
      },
      {
        titulo: "Acompanhamento",
        descricao:
          "Suporte para acompanhar evolucao, retornos e proximos passos do tratamento.",
      },
      {
        titulo: "Atendimento preventivo",
        descricao:
          "Cuidados pensados para prevencao, bem-estar e qualidade de vida.",
      },
    ],
    cta: {
      titulo: "Agende seu atendimento",
      texto:
        "Fale com a equipe e encontre o melhor horario para cuidar da sua saude.",
      botaoTexto: "Marcar consulta",
      botaoLink: "#contato",
    },
  },
  {
    id: "barbearia",
    nome: "Barbearia",
    segmento: "Beleza masculina",
    descricao: "Template para barbearias, saloes masculinos e studios de beleza.",
    hero: {
      titulo: "Visual alinhado, atendimento de respeito",
      subtitulo:
        "Cortes, barba e cuidados masculinos em um ambiente confortavel, com profissionais atentos ao seu estilo.",
      botaoTexto: "Reservar horario",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Mais que corte, uma experiencia",
      texto:
        "A barbearia combina tecnica, conversa boa e um atendimento pontual para deixar cada cliente pronto para a rotina ou para uma ocasiao especial.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Corte masculino",
        descricao:
          "Do classico ao moderno, com acabamento pensado para o seu formato e estilo.",
      },
      {
        titulo: "Barba completa",
        descricao:
          "Modelagem, alinhamento e acabamento para valorizar o rosto.",
      },
      {
        titulo: "Pacotes de cuidado",
        descricao:
          "Combinacoes de corte, barba e tratamentos para manter o visual em dia.",
      },
    ],
    cta: {
      titulo: "Seu proximo horario esta aqui",
      texto:
        "Chame a equipe e reserve o melhor momento para renovar o visual.",
      botaoTexto: "Agendar agora",
      botaoLink: "#contato",
    },
  },
  {
    id: "pet-shop",
    nome: "Pet Shop",
    segmento: "Pets",
    descricao: "Feito para pet shops, banho e tosa, clinicas e servicos para pets.",
    hero: {
      titulo: "Cuidado carinhoso para seu pet",
      subtitulo:
        "Servicos pensados para bem-estar, higiene e conforto, com atendimento cuidadoso para cada bichinho.",
      botaoTexto: "Agendar para meu pet",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Seu pet tratado com carinho e seguranca",
      texto:
        "Nossa rotina valoriza atencao individual, ambiente limpo e comunicacao simples para que tutores fiquem tranquilos.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Banho e tosa",
        descricao:
          "Higiene, cuidado com pelagem e acabamento de acordo com cada pet.",
      },
      {
        titulo: "Produtos para pets",
        descricao:
          "Itens selecionados para alimentacao, conforto, diversao e cuidado diario.",
      },
      {
        titulo: "Atendimento personalizado",
        descricao:
          "Orientacao para escolher o melhor cuidado conforme porte, idade e rotina.",
      },
    ],
    cta: {
      titulo: "Seu pet merece esse cuidado",
      texto:
        "Fale com a equipe e confira horarios, servicos e opcoes disponiveis.",
      botaoTexto: "Chamar atendimento",
      botaoLink: "#contato",
    },
  },
  {
    id: "loja",
    nome: "Loja",
    segmento: "Varejo",
    descricao: "Base para lojas fisicas, boutiques, mercados e comercios locais.",
    hero: {
      titulo: "Encontre o que precisa com facilidade",
      subtitulo:
        "Produtos selecionados, atendimento proximo e uma experiencia de compra simples do primeiro contato ate a entrega.",
      botaoTexto: "Falar com a loja",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Uma loja feita para atender bem",
      texto:
        "Trabalhamos para oferecer boas escolhas, informacao clara e suporte para que cada cliente compre com confianca.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Produtos selecionados",
        descricao:
          "Curadoria de itens para facilitar sua decisao e valorizar sua rotina.",
      },
      {
        titulo: "Atendimento consultivo",
        descricao:
          "Ajuda para escolher a opcao ideal de acordo com sua necessidade.",
      },
      {
        titulo: "Compra simples",
        descricao:
          "Canais praticos para tirar duvidas, consultar disponibilidade e combinar entrega.",
      },
    ],
    cta: {
      titulo: "Vamos ajudar na sua escolha",
      texto:
        "Entre em contato e veja as melhores opcoes disponiveis para voce.",
      botaoTexto: "Consultar produtos",
      botaoLink: "#contato",
    },
  },
];

function criarLandingPageConfigPadrao(): LandingPageConfig {
  const rascunhoPadrao: LandingPagePublicavelConfig = {
    publicada: false,
    hero: { ...landingPageHeroPadrao },
    sobre: { ...landingPageSobrePadrao },
    servicos: landingPageServicosPadrao.map((servico) => ({ ...servico })),
    galeria: landingPageGaleriaPadrao.map((imagem) => ({ ...imagem })),
    depoimentos: landingPageDepoimentosPadrao.map((depoimento) => ({
      ...depoimento,
    })),
    contato: { ...landingPageContatoPadrao },
    cta: { ...landingPageCtaPadrao },
    seo: { ...landingPageSeoPadrao },
    ordemSecoes: [...landingPageOrdemSecoesPadrao],
    visibilidadeSecoes: { ...landingPageVisibilidadeSecoesPadrao },
  };

  return {
    ...rascunhoPadrao,
    versaoPublicada: { ...rascunhoPadrao },
    alteracoesNaoPublicadas: false,
    historicoVersoes: [],
  };
}

function lerCampoTexto(objeto: Record<string, unknown>, campo: string) {
  const valor = objeto[campo];

  return typeof valor === "string" ? valor : "";
}

function lerCampoBooleano(objeto: Record<string, unknown>, campo: string) {
  const valor = objeto[campo];

  return typeof valor === "boolean" ? valor : false;
}

function normalizarObjetoLanding<T extends Record<string, string>>(
  valor: unknown,
  padrao: T,
  campos: Array<keyof T>
): T {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...padrao };
  }

  const objeto = valor as Record<string, unknown>;

  return campos.reduce<T>(
    (config, campo) => ({
      ...config,
      [campo]: lerCampoTexto(objeto, String(campo)),
    }),
    { ...padrao }
  );
}

function normalizarListaLanding<T extends Record<string, string>>(
  valor: unknown,
  padrao: T[],
  campos: Array<keyof T>
): T[] {
  if (!Array.isArray(valor)) {
    return padrao.map((item) => ({ ...item }));
  }

  const itens = valor
    .slice(0, 6)
    .map((item) => normalizarObjetoLanding(item, padrao[0], campos));

  return itens.length > 0 ? itens : padrao.map((item) => ({ ...item }));
}

function normalizarOrdemSecoesLanding(valor: unknown): LandingPageSecaoConteudoId[] {
  if (!Array.isArray(valor)) {
    return [...landingPageOrdemSecoesPadrao];
  }

  const secoesValidas = new Set<LandingPageSecaoConteudoId>(
    landingPageOrdemSecoesPadrao
  );
  const ordemRecebida = valor.filter(
    (secao): secao is LandingPageSecaoConteudoId =>
      typeof secao === "string" &&
      secoesValidas.has(secao as LandingPageSecaoConteudoId)
  );
  const ordemSemDuplicidade = ordemRecebida.filter(
    (secao, indice, lista) => lista.indexOf(secao) === indice
  );
  const secoesFaltantes = landingPageOrdemSecoesPadrao.filter(
    (secao) => !ordemSemDuplicidade.includes(secao)
  );

  return [...ordemSemDuplicidade, ...secoesFaltantes];
}

function normalizarVisibilidadeSecoesLanding(
  valor: unknown
): Record<LandingPageSecaoConteudoId, boolean> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...landingPageVisibilidadeSecoesPadrao };
  }

  const visibilidadeRecebida = valor as Record<string, unknown>;

  return landingPageOrdemSecoesPadrao.reduce<
    Record<LandingPageSecaoConteudoId, boolean>
  >(
    (visibilidade, secao) => ({
      ...visibilidade,
      [secao]:
        typeof visibilidadeRecebida[secao] === "boolean"
          ? Boolean(visibilidadeRecebida[secao])
          : true,
    }),
    { ...landingPageVisibilidadeSecoesPadrao }
  );
}

function criarLandingPagePublicavel(config: LandingPagePublicavelConfig) {
  return {
    publicada: config.publicada,
    hero: { ...config.hero },
    sobre: { ...config.sobre },
    servicos: config.servicos.map((servico) => ({ ...servico })),
    galeria: config.galeria.map((imagem) => ({ ...imagem })),
    depoimentos: config.depoimentos.map((depoimento) => ({ ...depoimento })),
    contato: { ...config.contato },
    cta: { ...config.cta },
    seo: { ...config.seo },
    ordemSecoes: [...config.ordemSecoes],
    visibilidadeSecoes: { ...config.visibilidadeSecoes },
  };
}

function normalizarLandingPagePublicavelConfig(
  valor: unknown,
  fallback: LandingPagePublicavelConfig
): LandingPagePublicavelConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return criarLandingPagePublicavel(fallback);
  }

  const config = valor as Partial<Record<keyof LandingPagePublicavelConfig, unknown>>;
  const objetoRecebido = valor as Record<string, unknown>;

  return {
    publicada: lerCampoBooleano(objetoRecebido, "publicada"),
    hero: normalizarObjetoLanding(config.hero, fallback.hero, [
      "titulo",
      "subtitulo",
      "botaoTexto",
      "botaoLink",
      "imagemDestaque",
    ]),
    sobre: normalizarObjetoLanding(config.sobre, fallback.sobre, [
      "titulo",
      "texto",
      "imagem",
    ]),
    servicos: normalizarListaLanding(config.servicos, fallback.servicos, [
      "titulo",
      "descricao",
    ]),
    galeria: normalizarListaLanding(config.galeria, fallback.galeria, [
      "url",
      "alt",
    ]),
    depoimentos: normalizarListaLanding(
      config.depoimentos,
      fallback.depoimentos,
      ["nome", "cargoEmpresa", "texto"]
    ),
    contato: normalizarObjetoLanding(config.contato, fallback.contato, [
      "telefone",
      "whatsapp",
      "email",
      "endereco",
    ]),
    cta: normalizarObjetoLanding(config.cta, fallback.cta, [
      "titulo",
      "texto",
      "botaoTexto",
      "botaoLink",
    ]),
    seo: normalizarObjetoLanding(config.seo, fallback.seo, [
      "titulo",
      "descricao",
      "palavrasChave",
      "imagemCompartilhamento",
    ]),
    ordemSecoes: normalizarOrdemSecoesLanding(config.ordemSecoes),
    visibilidadeSecoes: normalizarVisibilidadeSecoesLanding(
      config.visibilidadeSecoes
    ),
  };
}

function normalizarLandingPageConfig(valor: unknown): LandingPageConfig {
  const configPadrao = criarLandingPageConfigPadrao();

  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return configPadrao;
  }

  const configRecebida = valor as Partial<Record<keyof LandingPageConfig, unknown>>;
  const objetoRecebido = valor as Record<string, unknown>;

  const rascunho: LandingPagePublicavelConfig = {
    publicada: lerCampoBooleano(objetoRecebido, "publicada"),
    hero: normalizarObjetoLanding(
      configRecebida.hero,
      landingPageHeroPadrao,
      ["titulo", "subtitulo", "botaoTexto", "botaoLink", "imagemDestaque"]
    ),
    sobre: normalizarObjetoLanding(
      configRecebida.sobre,
      landingPageSobrePadrao,
      ["titulo", "texto", "imagem"]
    ),
    servicos: normalizarListaLanding(
      configRecebida.servicos,
      landingPageServicosPadrao,
      ["titulo", "descricao"]
    ),
    galeria: normalizarListaLanding(
      configRecebida.galeria,
      landingPageGaleriaPadrao,
      ["url", "alt"]
    ),
    depoimentos: normalizarListaLanding(
      configRecebida.depoimentos,
      landingPageDepoimentosPadrao,
      ["nome", "cargoEmpresa", "texto"]
    ),
    contato: normalizarObjetoLanding(
      configRecebida.contato,
      landingPageContatoPadrao,
      ["telefone", "whatsapp", "email", "endereco"]
    ),
    cta: normalizarObjetoLanding(
      configRecebida.cta,
      landingPageCtaPadrao,
      ["titulo", "texto", "botaoTexto", "botaoLink"]
    ),
    seo: normalizarObjetoLanding(
      configRecebida.seo,
      landingPageSeoPadrao,
      ["titulo", "descricao", "palavrasChave", "imagemCompartilhamento"]
    ),
    ordemSecoes: normalizarOrdemSecoesLanding(configRecebida.ordemSecoes),
    visibilidadeSecoes: normalizarVisibilidadeSecoesLanding(
      configRecebida.visibilidadeSecoes
    ),
  };
  const versaoPublicada = normalizarLandingPagePublicavelConfig(
    configRecebida.versaoPublicada,
    rascunho
  );

  return {
    ...rascunho,
    versaoPublicada,
    alteracoesNaoPublicadas:
      JSON.stringify(rascunho) !== JSON.stringify(versaoPublicada),
    historicoVersoes: Array.isArray(configRecebida.historicoVersoes)
      ? configRecebida.historicoVersoes
          .slice(0, 10)
          .map((versao) =>
            normalizarLandingPagePublicavelConfig(versao, versaoPublicada)
          )
      : [],
  };
}

function LandingPageSectionPlaceholder({
  nome,
  descricao,
}: LandingPageSectionProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-green-700">
        {nome}
      </p>

      <h4 className="mt-2 text-lg font-bold text-slate-900">
        Esta seção será implementada nas próximas Sprints.
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {descricao}
      </p>
    </div>
  );
}

void LandingPageSectionPlaceholder;

function LandingSecaoVisibilitySwitch({
  secao,
  visivel,
  desabilitado,
  onChange,
}: {
  secao: LandingPageSecaoConteudoId;
  visivel: boolean;
  desabilitado: boolean;
  onChange: (secao: LandingPageSecaoConteudoId, visivel: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <input
        type="checkbox"
        checked={visivel}
        disabled={desabilitado}
        onChange={(e) => onChange(secao, e.target.checked)}
        className="h-5 w-5"
      />

      <span className="text-sm font-bold text-slate-700">
        Exibir secao
      </span>
    </label>
  );
}

function LandingHeroSection({
  landingPageContratada,
  hero,
  onHeroChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Hero
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Primeira seção real da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Configure a chamada principal que aparece no topo da landing.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Não contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Título principal"
          value={hero.titulo}
          onChange={(e) => onHeroChange("titulo", e.target.value)}
          placeholder={landingPageHeroExemplo.titulo}
        />

        <div>
          <label className="block font-medium text-slate-700">
            Subtítulo
          </label>

          <textarea
            value={hero.subtitulo}
            onChange={(e) => onHeroChange("subtitulo", e.target.value)}
            placeholder={landingPageHeroExemplo.subtitulo}
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Texto do botão principal"
            value={hero.botaoTexto}
            onChange={(e) => onHeroChange("botaoTexto", e.target.value)}
            placeholder={landingPageHeroExemplo.botaoTexto}
          />

          <Input
            label="Link do botão principal"
            value={hero.botaoLink}
            onChange={(e) => onHeroChange("botaoLink", e.target.value)}
            placeholder="https://wa.me/5500000000000"
          />
        </div>

        <Input
          label="Imagem de destaque"
          value={hero.imagemDestaque}
          onChange={(e) => onHeroChange("imagemDestaque", e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          helperText="Informe a URL da imagem. O upload sera preparado em uma sprint futura."
        />
      </fieldset>
    </div>
  );
}

function LandingSobreSection({
  landingPageContratada,
  sobre,
  onSobreChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Sobre
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Sobre a Empresa
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Conte a historia e destaque os diferenciais da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Não contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Título"
          value={sobre.titulo}
          onChange={(e) => onSobreChange("titulo", e.target.value)}
          placeholder={landingPageSobreExemplo.titulo}
        />

        <div>
          <label className="block font-medium text-slate-700">
            Texto descritivo
          </label>

          <textarea
            value={sobre.texto}
            onChange={(e) => onSobreChange("texto", e.target.value)}
            placeholder={landingPageSobreExemplo.texto}
            rows={5}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <Input
          label="Imagem"
          value={sobre.imagem}
          onChange={(e) => onSobreChange("imagem", e.target.value)}
          placeholder="https://exemplo.com/sobre.jpg"
          helperText="Informe a URL da imagem. Upload e biblioteca de midia ficam para uma sprint futura."
        />
      </fieldset>
    </div>
  );
}

function LandingServicosSection({
  landingPageContratada,
  servicos,
  onServicoChange,
  onServicoAdd,
  onServicoRemove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteServicos = 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Serviços
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Serviços da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre até 6 serviços para destacar no preview da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Não contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {servicos.map((servico, indice) => (
          <div
            key={`servico-${indice}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h5 className="font-bold text-slate-900">
                Serviço {indice + 1}
              </h5>

              {servicos.length > 1 && (
                <button
                  type="button"
                  onClick={() => onServicoRemove(indice)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 sm:w-auto"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              <Input
                label={`Título do serviço ${indice + 1}`}
                value={servico.titulo}
                onChange={(e) =>
                  onServicoChange(indice, "titulo", e.target.value)
                }
                placeholder={
                  landingPageServicosExemplo[indice]?.titulo ||
                  "Nome do serviço"
                }
              />

              <div>
                <label className="block font-medium text-slate-700">
                  Descrição curta
                </label>

                <textarea
                  value={servico.descricao}
                  onChange={(e) =>
                    onServicoChange(indice, "descricao", e.target.value)
                  }
                  placeholder={
                    landingPageServicosExemplo[indice]?.descricao ||
                    "Descreva este serviço em poucas palavras."
                  }
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onServicoAdd}
          disabled={camposDesabilitados || servicos.length >= limiteServicos}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar serviço
        </button>
      </fieldset>
    </div>
  );
}

function LandingGaleriaSection({
  landingPageContratada,
  galeria,
  onGaleriaImagemChange,
  onGaleriaImagemAdd,
  onGaleriaImagemRemove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteImagens = 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Galeria
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Galeria da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre ate 6 imagens por URL para exibir no preview da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {galeria.map((imagem, indice) => {
          const imagemUrl = imagem.url.trim();
          const textoAlternativo =
            imagem.alt.trim() ||
            landingPageGaleriaExemplo[indice]?.alt ||
            `Imagem da galeria ${indice + 1}`;

          return (
            <div
              key={`galeria-${indice}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h5 className="font-bold text-slate-900">
                  Imagem {indice + 1}
                </h5>

                {galeria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onGaleriaImagemRemove(indice)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 sm:w-auto"
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                <div className="grid gap-4">
                  <Input
                    label={`URL da imagem ${indice + 1}`}
                    value={imagem.url}
                    onChange={(e) =>
                      onGaleriaImagemChange(indice, "url", e.target.value)
                    }
                    placeholder="https://exemplo.com/galeria.jpg"
                    helperText="Informe a URL da imagem. O upload sera conectado a este campo em uma sprint futura."
                  />

                  <Input
                    label="Texto alternativo / descricao curta"
                    value={imagem.alt}
                    onChange={(e) =>
                      onGaleriaImagemChange(indice, "alt", e.target.value)
                    }
                    placeholder={
                      landingPageGaleriaExemplo[indice]?.alt ||
                      "Descricao curta da imagem"
                    }
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {imagemUrl ? (
                    <img
                      src={imagemUrl}
                      alt={textoAlternativo}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-white px-4 text-center text-sm font-semibold leading-5 text-slate-400">
                      {textoAlternativo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onGaleriaImagemAdd}
          disabled={camposDesabilitados || galeria.length >= limiteImagens}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar imagem
        </button>
      </fieldset>
    </div>
  );
}

function LandingDepoimentosSection({
  landingPageContratada,
  depoimentos,
  onDepoimentoChange,
  onDepoimentoAdd,
  onDepoimentoRemove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteDepoimentos = 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Depoimentos
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Depoimentos da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre ate 6 relatos de clientes para destacar no preview.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {depoimentos.map((depoimento, indice) => (
          <div
            key={`depoimento-${indice}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h5 className="font-bold text-slate-900">
                Depoimento {indice + 1}
              </h5>

              {depoimentos.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDepoimentoRemove(indice)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 sm:w-auto"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={`Nome ${indice + 1}`}
                  value={depoimento.nome}
                  onChange={(e) =>
                    onDepoimentoChange(indice, "nome", e.target.value)
                  }
                  placeholder={
                    landingPageDepoimentosExemplo[indice]?.nome ||
                    "Nome do cliente"
                  }
                />

                <Input
                  label="Cargo / Empresa (opcional)"
                  value={depoimento.cargoEmpresa}
                  onChange={(e) =>
                    onDepoimentoChange(
                      indice,
                      "cargoEmpresa",
                      e.target.value
                    )
                  }
                  placeholder={
                    landingPageDepoimentosExemplo[indice]?.cargoEmpresa ||
                    "Cliente, empresa ou funcao"
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700">
                  Texto do depoimento
                </label>

                <textarea
                  value={depoimento.texto}
                  onChange={(e) =>
                    onDepoimentoChange(indice, "texto", e.target.value)
                  }
                  placeholder={
                    landingPageDepoimentosExemplo[indice]?.texto ||
                    "Escreva o relato do cliente em poucas linhas."
                  }
                  rows={4}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onDepoimentoAdd}
          disabled={
            camposDesabilitados || depoimentos.length >= limiteDepoimentos
          }
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar depoimento
        </button>
      </fieldset>
    </div>
  );
}

function LandingContatoSection({
  landingPageContratada,
  contato,
  onContatoChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Contato
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Contato da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Defina canais especificos da landing ou deixe vazio para usar os dados da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Telefone"
            value={contato.telefone}
            onChange={(e) =>
              onContatoChange("telefone", formatarTelefone(e.target.value))
            }
            placeholder="Usar telefone da empresa"
            helperText="Se ficar vazio, o preview usa o telefone cadastrado na empresa."
          />

          <Input
            label="WhatsApp"
            value={contato.whatsapp}
            onChange={(e) =>
              onContatoChange("whatsapp", formatarTelefone(e.target.value))
            }
            placeholder="Usar WhatsApp da empresa"
            helperText="Se ficar vazio, o preview usa o WhatsApp cadastrado na empresa."
          />

          <Input
            label="E-mail"
            type="email"
            value={contato.email}
            onChange={(e) => onContatoChange("email", e.target.value)}
            placeholder="Usar e-mail da empresa"
          />

          <Input
            label="Endereco"
            value={contato.endereco}
            onChange={(e) => onContatoChange("endereco", e.target.value)}
            placeholder="Usar endereco da empresa"
          />
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h5 className="font-bold text-slate-900">
            Google Maps
          </h5>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Esta area fica preparada para receber mapa, coordenadas ou link incorporado em uma sprint futura.
          </p>
        </div>
      </fieldset>
    </div>
  );
}

function LandingCtaSection({
  landingPageContratada,
  cta,
  onCtaChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            CTA
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Chamada para Acao
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Configure a chamada final para conversao da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Titulo"
          value={cta.titulo}
          onChange={(e) => onCtaChange("titulo", e.target.value)}
          placeholder={landingPageCtaExemplo.titulo}
        />

        <div>
          <label className="block font-medium text-slate-700">
            Texto
          </label>

          <textarea
            value={cta.texto}
            onChange={(e) => onCtaChange("texto", e.target.value)}
            placeholder={landingPageCtaExemplo.texto}
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Texto do botao"
            value={cta.botaoTexto}
            onChange={(e) => onCtaChange("botaoTexto", e.target.value)}
            placeholder={landingPageCtaExemplo.botaoTexto}
          />

          <Input
            label="Link do botao"
            value={cta.botaoLink}
            onChange={(e) => onCtaChange("botaoLink", e.target.value)}
            placeholder="https://wa.me/5500000000000"
          />
        </div>
      </fieldset>
    </div>
  );
}

function LandingSeoSection({
  landingPageContratada,
  seo,
  onSeoChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            SEO
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Configuracoes para buscadores e compartilhamento
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Quando estes campos estiverem vazios, a Landing Page usa automaticamente nome, descricao e logo ou banner da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Titulo SEO"
          value={seo.titulo}
          onChange={(e) => onSeoChange("titulo", e.target.value)}
          placeholder="Nome da empresa ou campanha"
        />

        <div>
          <label className="block font-medium text-slate-700">
            Descricao SEO
          </label>

          <textarea
            value={seo.descricao}
            onChange={(e) => onSeoChange("descricao", e.target.value)}
            placeholder="Resumo curto exibido em buscadores e redes sociais."
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <Input
          label="Palavras-chave"
          value={seo.palavrasChave}
          onChange={(e) => onSeoChange("palavrasChave", e.target.value)}
          placeholder="servico, cidade, categoria"
        />

        <Input
          label="Imagem de compartilhamento (URL)"
          value={seo.imagemCompartilhamento}
          onChange={(e) =>
            onSeoChange("imagemCompartilhamento", e.target.value)
          }
          placeholder="https://exemplo.com/imagem.jpg"
        />

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h5 className="font-bold text-slate-900">
            Dominio personalizado
          </h5>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            A estrutura fica preparada para gerar as metas com o endereco publico atual e receber dominio proprio em uma etapa futura.
          </p>
        </div>
      </fieldset>
    </div>
  );
}

function LandingTemplatesSection({
  landingPageContratada,
  onTemplateApply,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Templates
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Modelos prontos por segmento
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Escolha um modelo para preencher Hero, Sobre, Servicos e CTA. A aplicacao sempre pede confirmacao antes de substituir dados existentes.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {landingPageTemplates.map((template) => (
          <article
            key={template.id}
            className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700">
                {template.segmento}
              </span>

              <h5 className="mt-3 text-base font-bold text-slate-900">
                {template.nome}
              </h5>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {template.descricao}
              </p>

              <ul className="mt-3 grid gap-1 text-sm text-slate-500">
                {template.servicos.slice(0, 3).map((servico) => (
                  <li key={servico.titulo}>
                    {servico.titulo}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={camposDesabilitados}
              onClick={() => onTemplateApply(template)}
              className="mt-4 w-full rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Aplicar template
            </button>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <h5 className="font-bold text-slate-900">
          Arquitetura preparada
        </h5>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Novos segmentos podem ser adicionados na lista de templates sem alterar a estrutura de edicao da Landing Page.
        </p>
      </div>
    </div>
  );
}

function LandingOrdenacaoSection({
  landingPageContratada,
  ordemSecoes,
  onSecaoMove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Ordenacao
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Ordem das secoes da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Mova as secoes para cima ou para baixo. A ordem atualiza o preview em tempo real e sera salva junto da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-2">
        {ordemSecoes.map((secao, indice) => {
          const secaoConfig = landingPageSecoesOrdenaveis.find(
            (item) => item.id === secao
          );

          return (
            <div
              key={secao}
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Secao {indice + 1}
                </p>

                <h5 className="mt-1 font-bold text-slate-900">
                  {secaoConfig?.nome || secao}
                </h5>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={camposDesabilitados || indice === 0}
                  onClick={() => onSecaoMove(secao, "up")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Subir
                </button>

                <button
                  type="button"
                  disabled={camposDesabilitados || indice === ordemSecoes.length - 1}
                  onClick={() => onSecaoMove(secao, "down")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Descer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const landingPageSections: LandingPageSecaoConfig[] = [
  {
    id: "ordenacao",
    nome: "Ordenacao",
    descricao: "Controle de ordem das secoes exibidas na Landing Page.",
    ordem: 4,
    Component: LandingOrdenacaoSection,
  },
  {
    id: "templates",
    nome: "Templates",
    descricao: "Modelos prontos por segmento para acelerar a criacao.",
    ordem: 5,
    Component: LandingTemplatesSection,
  },
  {
    id: "hero",
    nome: "Hero",
    descricao: "Area principal para promessa, imagem e chamada inicial.",
    ordem: 10,
    Component: LandingHeroSection,
  },
  {
    id: "sobre",
    nome: "Sobre",
    descricao: "Bloco institucional para apresentar a empresa.",
    ordem: 20,
    Component: LandingSobreSection,
  },
  {
    id: "servicos",
    nome: "Serviços",
    descricao: "Estrutura futura para listar servicos, planos ou ofertas.",
    ordem: 30,
    Component: LandingServicosSection,
  },
  {
    id: "galeria",
    nome: "Galeria",
    descricao: "Espaco reservado para imagens e provas visuais.",
    ordem: 40,
    Component: LandingGaleriaSection,
  },
  {
    id: "depoimentos",
    nome: "Depoimentos",
    descricao: "Area preparada para relatos, reviews e prova social.",
    ordem: 50,
    Component: LandingDepoimentosSection,
  },
  {
    id: "contato",
    nome: "Contato",
    descricao: "Base para canais de contato e atendimento.",
    ordem: 60,
    Component: LandingContatoSection,
  },
  {
    id: "cta",
    nome: "CTA",
    descricao: "Chamada final para conversao, agendamento ou compra.",
    ordem: 70,
    Component: LandingCtaSection,
  },
  {
    id: "seo",
    nome: "SEO",
    descricao: "Configuracoes basicas para buscadores e redes sociais.",
    ordem: 80,
    Component: LandingSeoSection,
  },
];

const landingPageSectionRegistry = [...landingPageSections].sort(
  (a, b) => a.ordem - b.ordem
);

const landingPageArquiteturaFutura = [
  "Publicacao independente",
  "Dominio personalizado",
  "IA",
  "Analytics",
  "SEO",
];

function LandingPagePreviewReal({
  empresa,
  landingPage,
}: {
  empresa: EmpresaLanding;
  landingPage: LandingPageConfig;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
          Preview em tempo real
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Mesma estrutura da Landing Page publica.
        </p>
      </div>

      <div className="public-landing-preview-frame max-h-[760px] overflow-y-auto bg-white">
        <PublicLandingPageContent
          empresa={empresa}
          landingPage={landingPage}
          exigirPublicacao={false}
        />
      </div>
    </div>
  );
}


type TemaOficial = {
  id:
    | "TemaPadraoMikatech"
    | "TemaAutoCenter"
    | "TemaRestaurante"
    | "TemaClinica"
    | "TemaBarbearia"
    | "TemaLoja"
    | "TemaPetShop"
    | "TemaPremiumEscuro";
  nome: string;
  descricao: string;
  categorias: string[];
  miniatura: {
    tipo: "faixas";
  };
  aparencia: AparenciaConfig;
};

const ThemeRegistry: Record<TemaOficial["id"], TemaOficial> = {
  TemaPadraoMikatech: {
    id: "TemaPadraoMikatech",
    nome: "Padrão Mikatech",
    descricao: "Visual institucional claro com destaque verde.",
    categorias: ["institucional", "padrao", "mikatech"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#1f3d36",
      corSecundaria: "#32bcad",
      corBotoes: "#ffffff",
      corTextoBotoes: "#1f3d36",
      corFundoPagina: "#f1eee8",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#f1eee8",
      tipoFundo: "solida",
      gradienteInicio: "#fbfaf8",
      gradienteFim: "#f1eee8",
      gradienteDirecao: "vertical",
    },
  },
  TemaAutoCenter: {
    id: "TemaAutoCenter",
    nome: "Auto Center / Borracharia",
    descricao: "Contraste forte, cinza técnico e detalhe amarelo.",
    categorias: ["oficina", "auto center", "borracharia"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#1f2937",
      corSecundaria: "#f59e0b",
      corBotoes: "#f59e0b",
      corTextoBotoes: "#111827",
      corFundoPagina: "#e5e7eb",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#d1d5db",
      tipoFundo: "solida",
      gradienteInicio: "#f9fafb",
      gradienteFim: "#d1d5db",
      gradienteDirecao: "vertical",
    },
  },
  TemaRestaurante: {
    id: "TemaRestaurante",
    nome: "Restaurante / Lanchonete",
    descricao: "Tons quentes para cardápios, lanches e delivery.",
    categorias: ["restaurante", "lanchonete", "padaria"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#7f1d1d",
      corSecundaria: "#f97316",
      corBotoes: "#c2410c",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#fff7ed",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#ffedd5",
      tipoFundo: "solida",
      gradienteInicio: "#fff7ed",
      gradienteFim: "#fed7aa",
      gradienteDirecao: "vertical",
    },
  },
  TemaClinica: {
    id: "TemaClinica",
    nome: "Clínica / Saúde",
    descricao: "Limpo, leve e confiável para atendimento profissional.",
    categorias: ["clinica", "saude", "consultorio", "farmacia"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#0f766e",
      corSecundaria: "#38bdf8",
      corBotoes: "#0f766e",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#ecfeff",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#cffafe",
      tipoFundo: "solida",
      gradienteInicio: "#f0fdfa",
      gradienteFim: "#cffafe",
      gradienteDirecao: "vertical",
    },
  },
  TemaBarbearia: {
    id: "TemaBarbearia",
    nome: "Salão / Barbearia",
    descricao: "Elegante, marcante e pronto para serviços de beleza.",
    categorias: ["salao", "barbearia", "beleza"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#581c87",
      corSecundaria: "#e879f9",
      corBotoes: "#581c87",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#faf5ff",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#f3e8ff",
      tipoFundo: "solida",
      gradienteInicio: "#faf5ff",
      gradienteFim: "#f3e8ff",
      gradienteDirecao: "vertical",
    },
  },
  TemaLoja: {
    id: "TemaLoja",
    nome: "Loja / Varejo",
    descricao: "Azul comercial com leitura rápida e visual organizado.",
    categorias: ["loja", "varejo", "papelaria", "imobiliaria"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#1d4ed8",
      corSecundaria: "#22c55e",
      corBotoes: "#1d4ed8",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#eff6ff",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#dbeafe",
      tipoFundo: "solida",
      gradienteInicio: "#ffffff",
      gradienteFim: "#dbeafe",
      gradienteDirecao: "vertical",
    },
  },
  TemaPetShop: {
    id: "TemaPetShop",
    nome: "Pet Shop",
    descricao: "Amigável, fresco e colorido para cuidados pet.",
    categorias: ["pet shop", "pet"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#166534",
      corSecundaria: "#facc15",
      corBotoes: "#15803d",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#f0fdf4",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#dcfce7",
      tipoFundo: "solida",
      gradienteInicio: "#f0fdf4",
      gradienteFim: "#dcfce7",
      gradienteDirecao: "vertical",
    },
  },
  TemaPremiumEscuro: {
    id: "TemaPremiumEscuro",
    nome: "Premium Escuro",
    descricao: "Escuro sofisticado com detalhe dourado.",
    categorias: ["premium", "hotel", "advocacia", "academia"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#f8fafc",
      corSecundaria: "#d4af37",
      corBotoes: "#d4af37",
      corTextoBotoes: "#111827",
      corFundoPagina: "#111827",
      corAreaPrincipal: "#1f2937",
      corFundoHero: "#0f172a",
      tipoFundo: "solida",
      gradienteInicio: "#111827",
      gradienteFim: "#0f172a",
      gradienteDirecao: "vertical",
    },
  },
};

const TemaPadraoMikatech = ThemeRegistry.TemaPadraoMikatech.aparencia;
const temasProntos = Object.values(ThemeRegistry);

const diasAtendimento = [
  { id: "segunda", label: "Segunda" },
  { id: "terca", label: "Terça" },
  { id: "quarta", label: "Quarta" },
  { id: "quinta", label: "Quinta" },
  { id: "sexta", label: "Sexta" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

type HorarioDia = {
  ativo: boolean;
  abertura: string;
  fechamento: string;
};

type HorariosAtendimento = Record<string, HorarioDia>;

function criarHorariosPadrao(): HorariosAtendimento {
  return diasAtendimento.reduce<HorariosAtendimento>((horarios, dia) => {
    horarios[dia.id] = {
      ativo: ["segunda", "terca", "quarta", "quinta", "sexta"].includes(
        dia.id
      ),
      abertura: "08:00",
      fechamento: "18:00",
    };

    return horarios;
  }, {});
}

function gerarTextoHorario(horarios: HorariosAtendimento) {
  return diasAtendimento
    .filter((dia) => horarios[dia.id]?.ativo)
    .map((dia) => {
      const horario = horarios[dia.id];
      return `${dia.label}: ${horario.abertura} às ${horario.fechamento}`;
    })
    .join("\n");
}

function lerTextoHorario(texto: string) {
  const horarios = criarHorariosPadrao();
  let encontrouHorario = false;

  Object.keys(horarios).forEach((diaId) => {
    horarios[diaId] = {
      ...horarios[diaId],
      ativo: false,
    };
  });

  texto.split("\n").forEach((linha) => {
    const dia = diasAtendimento.find((item) =>
      linha.toLowerCase().startsWith(item.label.toLowerCase())
    );
    const horario = linha.match(/(\d{2}:\d{2}).+?(\d{2}:\d{2})/);

    if (!dia || !horario) return;

    horarios[dia.id] = {
      ativo: true,
      abertura: horario[1],
      fechamento: horario[2],
    };
    encontrouHorario = true;
  });

  return encontrouHorario ? horarios : null;
}

function adicionarVersaoImagem(url: string) {
  if (!url) return url;

  const separador = url.includes("?") ? "&" : "?";

  return `${url}${separador}v=${Date.now()}`;
}

function gerarSlug(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function obterDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function obterTelefoneLocal(valor: string) {
  const digitos = obterDigitos(valor);

  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    return digitos.slice(2);
  }

  return digitos;
}

function formatarTelefone(valor: string) {
  const digitos = obterTelefoneLocal(valor).slice(0, 11);
  const ddd = digitos.slice(0, 2);
  const parteInicial = digitos.length > 10
    ? digitos.slice(2, 7)
    : digitos.slice(2, 6);
  const parteFinal = digitos.length > 10
    ? digitos.slice(7, 11)
    : digitos.slice(6, 10);

  if (digitos.length <= 2) return ddd;
  if (!parteFinal) return `(${ddd}) ${parteInicial}`;

  return `(${ddd}) ${parteInicial}-${parteFinal}`;
}

function normalizarUsuarioRedeSocial(valor: string) {
  const texto = valor.trim();

  if (!texto) return "";

  const textoSemArroba = texto.replace(/^@+/, "");
  const contemLink =
    /^https?:\/\//i.test(texto) ||
    /^www\./i.test(texto) ||
    /(^|\.)instagram\.com/i.test(texto) ||
    /(^|\.)facebook\.com/i.test(texto) ||
    /(^|\.)tiktok\.com/i.test(texto) ||
    /(^|\.)youtube\.com/i.test(texto) ||
    /(^|\.)youtu\.be/i.test(texto) ||
    /(^|\.)kwai\.com/i.test(texto) ||
    /(^|\.)k\.kwai\.com/i.test(texto);

  if (!contemLink) {
    return textoSemArroba.replace(/\s+/g, "");
  }

  try {
    const url = new URL(
      texto.startsWith("http://") || texto.startsWith("https://")
        ? texto
        : `https://${texto}`
    );
    const partes = url.pathname
      .split("/")
      .map((parte) => parte.trim())
      .filter(Boolean);
    const usuario = partes.find((parte) =>
      !["p", "reel", "reels", "tv", "channel", "c", "user"].includes(
        parte.toLowerCase()
      )
    );

    return (usuario || textoSemArroba).replace(/^@+/, "").split("?")[0];
  } catch {
    return textoSemArroba.replace(/\s+/g, "");
  }
}

interface EmpresaFormProps {
  empresaInicialId?: string;
  empresaInicialSlug?: string;
  modoCliente?: boolean;
  onSalvar?: () => void;
  onExcluir?: () => void | Promise<void>;
  onEmpresaAtualChange?: (empresa: {
    nome: string;
    logo?: string | null;
  }) => void;
}

export default function EmpresaForm({
  empresaInicialId,
  empresaInicialSlug,
  modoCliente = false,
  onSalvar,
  onExcluir,
  onEmpresaAtualChange,
}: EmpresaFormProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaEmpresa>("informacoes");
  const [empresaId, setEmpresaId] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAdmin, setSlugAdmin] = useState("");

  const [nome, setNome] = useState("");
  const [tipoGerenciamento, setTipoGerenciamento] = useState("mikatech");
  const [plano, setPlano] = useState<PlanoEmpresa>("starter");
  const [recursosContratados, setRecursosContratados] =
    useState<RecursosContratados>(() => ({ ...recursosPadrao }));
  const [landingPagePlaceholderAberto, setLandingPagePlaceholderAberto] =
    useState(false);
  const [landingPageIaModalAberto, setLandingPageIaModalAberto] =
    useState(false);
  const [landingPagePublicada, setLandingPagePublicada] = useState(false);
  const [landingPageSecaoAtiva, setLandingPageSecaoAtiva] =
    useState<LandingPageSecaoId>("templates");
  const [landingPageHero, setLandingPageHero] =
    useState<LandingPageHeroConfig>(() => ({ ...landingPageHeroPadrao }));
  const [landingPageSobre, setLandingPageSobre] =
    useState<LandingPageSobreConfig>(() => ({ ...landingPageSobrePadrao }));
  const [landingPageServicos, setLandingPageServicos] =
    useState<LandingPageServicoConfig[]>(() =>
      landingPageServicosPadrao.map((servico) => ({ ...servico }))
    );
  const [landingPageGaleria, setLandingPageGaleria] =
    useState<LandingPageGaleriaImagemConfig[]>(() =>
      landingPageGaleriaPadrao.map((imagem) => ({ ...imagem }))
    );
  const [landingPageDepoimentos, setLandingPageDepoimentos] =
    useState<LandingPageDepoimentoConfig[]>(() =>
      landingPageDepoimentosPadrao.map((depoimento) => ({ ...depoimento }))
    );
  const [landingPageContato, setLandingPageContato] =
    useState<LandingPageContatoConfig>(() => ({ ...landingPageContatoPadrao }));
  const [landingPageCta, setLandingPageCta] =
    useState<LandingPageCtaConfig>(() => ({ ...landingPageCtaPadrao }));
  const [landingPageSeo, setLandingPageSeo] =
    useState<LandingPageSeoConfig>(() => ({ ...landingPageSeoPadrao }));
  const [landingPageOrdemSecoes, setLandingPageOrdemSecoes] =
    useState<LandingPageSecaoConteudoId[]>(() => [
      ...landingPageOrdemSecoesPadrao,
    ]);
  const [landingPageVisibilidadeSecoes, setLandingPageVisibilidadeSecoes] =
    useState<Record<LandingPageSecaoConteudoId, boolean>>(() => ({
      ...landingPageVisibilidadeSecoesPadrao,
    }));
  const [landingPageVersaoPublicada, setLandingPageVersaoPublicada] =
    useState<LandingPagePublicavelConfig>(() =>
      criarLandingPagePublicavel(criarLandingPageConfigPadrao())
    );
  const [landingPageHistoricoVersoes, setLandingPageHistoricoVersoes] =
    useState<LandingPagePublicavelConfig[]>([]);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");

  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [site, setSite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [kwai, setKwai] = useState("");
  const [facebook, setFacebook] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numeroEndereco, setNumeroEndereco] = useState("");
  const [complementoEndereco, setComplementoEndereco] = useState("");
  const [cepErro, setCepErro] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [horarioAtendimento, setHorarioAtendimento] = useState("");
  const [horariosAtendimento, setHorariosAtendimento] =
    useState<HorariosAtendimento>(() => criarHorariosPadrao());
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  const [pix, setPix] = useState("");
  const [pixNome, setPixNome] = useState("");
  const [pixChave, setPixChave] = useState("");

  const [wifiNome, setWifiNome] = useState("");
  const [wifiSenha, setWifiSenha] = useState("");

  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [logoExibicao, setLogoExibicao] =
    useState<LogoExibicao>("normal");
  const [corPrincipal, setCorPrincipal] = useState("");
  const [corSecundaria, setCorSecundaria] = useState("");
  const [corBotoes, setCorBotoes] = useState("");
  const [corTextoBotoes, setCorTextoBotoes] = useState("");
  const [corFundoPagina, setCorFundoPagina] = useState("");
  const [corAreaPrincipal, setCorAreaPrincipal] = useState("");
  const [corFundoHero, setCorFundoHero] = useState("");
  const [suportaCorFundoHero, setSuportaCorFundoHero] = useState(false);
  const [tipoFundo, setTipoFundo] = useState<TipoFundo>("solida");
  const [gradienteInicio, setGradienteInicio] = useState("");
  const [gradienteFim, setGradienteFim] = useState("");
  const [gradienteDirecao, setGradienteDirecao] =
    useState<DirecaoGradiente>("vertical");
  const [aparenciaSalva, setAparenciaSalva] =
    useState<AparenciaConfig>(TemaPadraoMikatech);
  const categoriaSelecionada = categoriasEmpresa.includes(categoria)
    ? categoria
    : "Outra";
  const slugPublico = slugAdmin || slug;
  const aparenciaAtual: AparenciaConfig = {
    logoExibicao,
    corPrincipal,
    corSecundaria,
    corBotoes,
    corTextoBotoes,
    corFundoPagina,
    corAreaPrincipal,
    corFundoHero,
    tipoFundo,
    gradienteInicio,
    gradienteFim,
    gradienteDirecao,
  };
  const possuiAlteracoesAparencia =
    JSON.stringify(aparenciaAtual) !== JSON.stringify(aparenciaSalva);

  useEffect(() => {
    console.log("[Diagnóstico UPDATE] ID recebido no EmpresaForm:", {
      empresaInicialId,
      empresaInicialSlug,
    });

    carregarEmpresa({
      id: empresaInicialId,
      slug: empresaInicialSlug || "mikatech",
    });
  }, [empresaInicialId, empresaInicialSlug]);

  async function carregarEmpresa(empresa: { id?: string; slug: string }) {
    console.log("[Diagnóstico UPDATE] Carregando empresa para edição:", empresa);

    const { data, error } = empresa.id
      ? await buscarEmpresaPorId(empresa.id)
      : await buscarEmpresaPorSlug(empresa.slug);

    console.log("[Diagnóstico UPDATE] Resultado do SELECT no EmpresaForm:", {
      filtroUsado: empresa.id
        ? `id = ${empresa.id}`
        : `slug = ${empresa.slug}`,
      data,
      error,
    });

    if (error) {
      console.error("Erro ao carregar empresa:", error);
      return;
    }

    if (!data) return;

    setEmpresaId(data.id);
    setSlug(data.slug || "");
    setSlugAdmin(data.slug || "");

    const dadosComPlano = data as typeof data & {
      plano?: string | null;
      recursos_contratados?: unknown;
      landing_page_config?: unknown;
    };
    const landingPageConfig = normalizarLandingPageConfig(
      dadosComPlano.landing_page_config
    );

    setNome(data.nome || "");
    setTipoGerenciamento(data.tipo || "mikatech");
    setPlano(normalizarPlano(dadosComPlano.plano));
    setRecursosContratados(
      normalizarRecursos(dadosComPlano.recursos_contratados)
    );
    setLandingPagePlaceholderAberto(false);
    setLandingPagePublicada(landingPageConfig.publicada);
    setLandingPageSecaoAtiva("templates");
    setLandingPageHero(landingPageConfig.hero);
    setLandingPageSobre(landingPageConfig.sobre);
    setLandingPageServicos(landingPageConfig.servicos);
    setLandingPageGaleria(landingPageConfig.galeria);
    setLandingPageDepoimentos(landingPageConfig.depoimentos);
    setLandingPageContato(landingPageConfig.contato);
    setLandingPageCta(landingPageConfig.cta);
    setLandingPageSeo(landingPageConfig.seo);
    setLandingPageOrdemSecoes(landingPageConfig.ordemSecoes);
    setLandingPageVisibilidadeSecoes(landingPageConfig.visibilidadeSecoes);
    setLandingPageVersaoPublicada(
      landingPageConfig.versaoPublicada ||
        criarLandingPagePublicavel(landingPageConfig)
    );
    setLandingPageHistoricoVersoes(landingPageConfig.historicoVersoes);
    setCategoria(data.categoria || "");
    setDescricao(data.descricao || "");

    setTelefone(formatarTelefone(data.telefone || ""));
    setWhatsapp(formatarTelefone(data.whatsapp || ""));
    setEmail(data.email || "");

    setSite(data.site || "");
    setInstagram(normalizarUsuarioRedeSocial(data.instagram || ""));
    setTiktok(normalizarUsuarioRedeSocial(data.tiktok || ""));
    setYoutube(normalizarUsuarioRedeSocial(data.youtube || ""));
    setKwai(normalizarUsuarioRedeSocial(data.kwai || ""));
    setFacebook(normalizarUsuarioRedeSocial(data.facebook || ""));
    setEndereco(data.endereco || "");
    setHorarioAtendimento(data.horario_atendimento || "");
    const horarioCarregado = lerTextoHorario(data.horario_atendimento || "");

    if (horarioCarregado) {
      setHorariosAtendimento(horarioCarregado);
    }

    setGoogleReviewUrl(data.google_review_url || "");

    setPix(data.pix || "");
    setPixNome(data.pix_nome || "");
    setPixChave(data.pix_chave || "");

    setWifiNome(data.wifi_nome || "");
    setWifiSenha(data.wifi_senha || "");

    setLogo(data.logo || "");
    setBanner(data.banner || "");
    setLogoExibicao(data.logo_exibicao === "hidden" ? "hidden" : "normal");
    const dadosComAparencia = data as typeof data & {
      cor_fundo_hero?: string | null;
    };
    const possuiColunaCorFundoHero = "cor_fundo_hero" in dadosComAparencia;
    const aparenciaCarregada: AparenciaConfig = {
      logoExibicao: data.logo_exibicao === "hidden" ? "hidden" : "normal",
      corPrincipal: data.cor_principal || TemaPadraoMikatech.corPrincipal,
      corSecundaria: data.cor_secundaria || TemaPadraoMikatech.corSecundaria,
      corBotoes: data.cor_botoes || TemaPadraoMikatech.corBotoes,
      corTextoBotoes: data.cor_texto_botoes || TemaPadraoMikatech.corTextoBotoes,
      corFundoPagina: data.cor_fundo_pagina || TemaPadraoMikatech.corFundoPagina,
      corAreaPrincipal: data.cor_area_principal || TemaPadraoMikatech.corAreaPrincipal,
      corFundoHero:
        dadosComAparencia.cor_fundo_hero ||
        data.cor_fundo_pagina ||
        TemaPadraoMikatech.corFundoHero,
      tipoFundo: data.tipo_fundo === "gradiente" ? "gradiente" : "solida",
      gradienteInicio: data.gradiente_inicio || "",
      gradienteFim: data.gradiente_fim || "",
      gradienteDirecao: ["horizontal", "vertical", "diagonal"].includes(data.gradiente_direcao)
        ? data.gradiente_direcao
        : "vertical",
    };

    setCorPrincipal(aparenciaCarregada.corPrincipal);
    setCorSecundaria(aparenciaCarregada.corSecundaria);
    setCorBotoes(aparenciaCarregada.corBotoes);
    setCorTextoBotoes(aparenciaCarregada.corTextoBotoes);
    setCorFundoPagina(aparenciaCarregada.corFundoPagina);
    setCorAreaPrincipal(aparenciaCarregada.corAreaPrincipal);
    setCorFundoHero(aparenciaCarregada.corFundoHero);
    setSuportaCorFundoHero(possuiColunaCorFundoHero);
    setTipoFundo(aparenciaCarregada.tipoFundo);
    setGradienteInicio(aparenciaCarregada.gradienteInicio);
    setGradienteFim(aparenciaCarregada.gradienteFim);
    setGradienteDirecao(aparenciaCarregada.gradienteDirecao);
    setLogoExibicao(aparenciaCarregada.logoExibicao);
    setAparenciaSalva(aparenciaCarregada);
    onEmpresaAtualChange?.({
      nome: data.nome || "",
      logo: data.logo || "",
    });
  }

  function montarEnderecoCompleto(
    ruaAtual = rua,
    bairroAtual = bairro,
    cidadeAtual = cidade,
    estadoAtual = estado,
    numeroAtual = numeroEndereco,
    complementoAtual = complementoEndereco
  ) {
    return [
      [ruaAtual, numeroAtual].filter(Boolean).join(", "),
      complementoAtual,
      bairroAtual,
      [cidadeAtual, estadoAtual].filter(Boolean).join(" - "),
    ]
      .filter(Boolean)
      .join(" - ");
  }

  useEffect(() => {
    const cepNumerico = cep.replace(/\D/g, "");

    if (cepNumerico.length !== 8) {
      setCepErro("");
      return;
    }

    async function buscarCep() {
      try {
        setBuscandoCep(true);
        setCepErro("");

        const resposta = await fetch(
          `https://viacep.com.br/ws/${cepNumerico}/json/`
        );
        const dados = await resposta.json();

        if (dados.erro) {
        setCepErro("CEP não encontrado.");
          return;
        }

        const novaRua = dados.logradouro || "";
        const novoBairro = dados.bairro || "";
        const novaCidade = dados.localidade || "";
        const novoEstado = dados.uf || "";

        setRua(novaRua);
        setBairro(novoBairro);
        setCidade(novaCidade);
        setEstado(novoEstado);
        setEndereco(
          montarEnderecoCompleto(
            novaRua,
            novoBairro,
            novaCidade,
            novoEstado
          )
        );
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setCepErro("Não foi possível buscar este CEP.");
      } finally {
        setBuscandoCep(false);
      }
    }

    buscarCep();
  }, [cep]);

  useEffect(() => {
    if (!rua && !bairro && !cidade && !estado) return;

    setEndereco(montarEnderecoCompleto());
  }, [numeroEndereco, complementoEndereco]);

  function atualizarHorarioDia(
    diaId: string,
    campo: keyof HorarioDia,
    valor: boolean | string
  ) {
    const novosHorarios = {
      ...horariosAtendimento,
      [diaId]: {
        ...horariosAtendimento[diaId],
        [campo]: valor,
      },
    };

    setHorariosAtendimento(novosHorarios);
    setHorarioAtendimento(gerarTextoHorario(novosHorarios));
  }

  function alternarRecurso(recursoId: RecursoEmpresaId) {
    setRecursosContratados((recursosAtuais) => ({
      ...recursosAtuais,
      [recursoId]: !recursosAtuais[recursoId],
    }));
  }

  function atualizarLandingPageHero(
    campo: keyof LandingPageHeroConfig,
    valor: string
  ) {
    setLandingPageHero((heroAtual) => ({
      ...heroAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageSobre(
    campo: keyof LandingPageSobreConfig,
    valor: string
  ) {
    setLandingPageSobre((sobreAtual) => ({
      ...sobreAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageServico(
    indice: number,
    campo: keyof LandingPageServicoConfig,
    valor: string
  ) {
    setLandingPageServicos((servicosAtuais) =>
      servicosAtuais.map((servico, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...servico,
              [campo]: valor,
            }
          : servico
      )
    );
  }

  function adicionarLandingPageServico() {
    setLandingPageServicos((servicosAtuais) => {
      if (servicosAtuais.length >= 6) return servicosAtuais;

      return [
        ...servicosAtuais,
        {
          titulo: "",
          descricao: "",
        },
      ];
    });
  }

  function removerLandingPageServico(indice: number) {
    setLandingPageServicos((servicosAtuais) => {
      if (servicosAtuais.length <= 1) return servicosAtuais;

      return servicosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function atualizarLandingPageGaleriaImagem(
    indice: number,
    campo: keyof LandingPageGaleriaImagemConfig,
    valor: string
  ) {
    setLandingPageGaleria((galeriaAtual) =>
      galeriaAtual.map((imagem, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...imagem,
              [campo]: valor,
            }
          : imagem
      )
    );
  }

  function adicionarLandingPageGaleriaImagem() {
    setLandingPageGaleria((galeriaAtual) => {
      if (galeriaAtual.length >= 6) return galeriaAtual;

      return [
        ...galeriaAtual,
        {
          url: "",
          alt: "",
        },
      ];
    });
  }

  function removerLandingPageGaleriaImagem(indice: number) {
    setLandingPageGaleria((galeriaAtual) => {
      if (galeriaAtual.length <= 1) return galeriaAtual;

      return galeriaAtual.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function atualizarLandingPageDepoimento(
    indice: number,
    campo: keyof LandingPageDepoimentoConfig,
    valor: string
  ) {
    setLandingPageDepoimentos((depoimentosAtuais) =>
      depoimentosAtuais.map((depoimento, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...depoimento,
              [campo]: valor,
            }
          : depoimento
      )
    );
  }

  function adicionarLandingPageDepoimento() {
    setLandingPageDepoimentos((depoimentosAtuais) => {
      if (depoimentosAtuais.length >= 6) return depoimentosAtuais;

      return [
        ...depoimentosAtuais,
        {
          nome: "",
          cargoEmpresa: "",
          texto: "",
        },
      ];
    });
  }

  function removerLandingPageDepoimento(indice: number) {
    setLandingPageDepoimentos((depoimentosAtuais) => {
      if (depoimentosAtuais.length <= 1) return depoimentosAtuais;

      return depoimentosAtuais.filter(
        (_, indiceAtual) => indiceAtual !== indice
      );
    });
  }

  function atualizarLandingPageContato(
    campo: keyof LandingPageContatoConfig,
    valor: string
  ) {
    setLandingPageContato((contatoAtual) => ({
      ...contatoAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageCta(
    campo: keyof LandingPageCtaConfig,
    valor: string
  ) {
    setLandingPageCta((ctaAtual) => ({
      ...ctaAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageSeo(
    campo: keyof LandingPageSeoConfig,
    valor: string
  ) {
    setLandingPageSeo((seoAtual) => ({
      ...seoAtual,
      [campo]: valor,
    }));
  }

  function landingPageTemplatePodeSobrescrever() {
    const heroPreenchido = Object.values(landingPageHero).some((valor) =>
      valor.trim()
    );
    const sobrePreenchido = Object.values(landingPageSobre).some((valor) =>
      valor.trim()
    );
    const servicosPreenchidos = landingPageServicos.some((servico) =>
      Object.values(servico).some((valor) => valor.trim())
    );
    const ctaPreenchido = Object.values(landingPageCta).some((valor) =>
      valor.trim()
    );

    return heroPreenchido || sobrePreenchido || servicosPreenchidos || ctaPreenchido;
  }

  function aplicarLandingPageTemplate(template: LandingPageTemplateConfig) {
    const possuiDados = landingPageTemplatePodeSobrescrever();
    const mensagem = possuiDados
      ? `Aplicar o template "${template.nome}" vai substituir os dados atuais de Hero, Sobre, Servicos e CTA. Deseja continuar?`
      : `Deseja aplicar o template "${template.nome}" na Landing Page?`;

    if (!window.confirm(mensagem)) return;

    setLandingPageHero({ ...template.hero });
    setLandingPageSobre({ ...template.sobre });
    setLandingPageServicos(template.servicos.map((servico) => ({ ...servico })));
    setLandingPageCta({ ...template.cta });
    setLandingPageSecaoAtiva("hero");
  }

  function moverLandingPageSecao(
    secao: LandingPageSecaoConteudoId,
    direcao: "up" | "down"
  ) {
    setLandingPageOrdemSecoes((ordemAtual) => {
      const indiceAtual = ordemAtual.indexOf(secao);
      const novoIndice = direcao === "up" ? indiceAtual - 1 : indiceAtual + 1;

      if (
        indiceAtual < 0 ||
        novoIndice < 0 ||
        novoIndice >= ordemAtual.length
      ) {
        return ordemAtual;
      }

      const novaOrdem = [...ordemAtual];
      const [secaoMovida] = novaOrdem.splice(indiceAtual, 1);
      novaOrdem.splice(novoIndice, 0, secaoMovida);

      return novaOrdem;
    });
  }

  function atualizarLandingPageSecaoVisibilidade(
    secao: LandingPageSecaoConteudoId,
    visivel: boolean
  ) {
    setLandingPageVisibilidadeSecoes((visibilidadeAtual) => ({
      ...visibilidadeAtual,
      [secao]: visivel,
    }));
  }

  function montarLandingPageRascunho(): LandingPagePublicavelConfig {
    return {
      publicada: landingPagePublicada,
      hero: landingPageHero,
      sobre: landingPageSobre,
      servicos: landingPageServicos.slice(0, 6),
      galeria: landingPageGaleria.slice(0, 6),
      depoimentos: landingPageDepoimentos.slice(0, 6),
      contato: landingPageContato,
      cta: landingPageCta,
      seo: landingPageSeo,
      ordemSecoes: landingPageOrdemSecoes,
      visibilidadeSecoes: landingPageVisibilidadeSecoes,
    };
  }

  function montarLandingPageConfig(
    versaoPublicada = landingPageVersaoPublicada,
    historicoVersoes = landingPageHistoricoVersoes
  ): LandingPageConfig {
    const rascunho = montarLandingPageRascunho();

    return {
      ...rascunho,
      versaoPublicada,
      alteracoesNaoPublicadas:
        JSON.stringify(rascunho) !== JSON.stringify(versaoPublicada),
      historicoVersoes,
    };
  }

  function aplicarLandingPagePublicavel(config: LandingPagePublicavelConfig) {
    setLandingPagePublicada(config.publicada);
    setLandingPageHero(config.hero);
    setLandingPageSobre(config.sobre);
    setLandingPageServicos(config.servicos);
    setLandingPageGaleria(config.galeria);
    setLandingPageDepoimentos(config.depoimentos);
    setLandingPageContato(config.contato);
    setLandingPageCta(config.cta);
    setLandingPageSeo(config.seo);
    setLandingPageOrdemSecoes(config.ordemSecoes);
    setLandingPageVisibilidadeSecoes(config.visibilidadeSecoes);
  }

  async function publicarLandingPageAlteracoes() {
    if (!empresaId) {
      alert("Empresa ainda nao foi carregada. Tente novamente.");
      return;
    }

    const novaVersaoPublicada = criarLandingPagePublicavel(
      montarLandingPageRascunho()
    );
    const novoHistorico = [
      landingPageVersaoPublicada,
      ...landingPageHistoricoVersoes,
    ].slice(0, 10);
    const landingPageConfig = montarLandingPageConfig(
      novaVersaoPublicada,
      novoHistorico
    );
    const { error } = await atualizarEmpresa(empresaId, {
      landing_page_config: landingPageConfig,
    } as Parameters<typeof atualizarEmpresa>[1]);

    if (error) {
      alert(error.message || "Erro ao publicar alteracoes.");
      return;
    }

    setLandingPageVersaoPublicada(novaVersaoPublicada);
    setLandingPageHistoricoVersoes(novoHistorico);
    alert("Alteracoes publicadas com sucesso!");
  }

  async function descartarLandingPageAlteracoes() {
    if (!window.confirm("Descartar as alteracoes do rascunho e voltar para a versao publicada?")) {
      return;
    }

    aplicarLandingPagePublicavel(landingPageVersaoPublicada);

    if (!empresaId) return;

    const landingPageConfig: LandingPageConfig = {
      ...landingPageVersaoPublicada,
      versaoPublicada: landingPageVersaoPublicada,
      alteracoesNaoPublicadas: false,
      historicoVersoes: landingPageHistoricoVersoes,
    };
    const { error } = await atualizarEmpresa(empresaId, {
      landing_page_config: landingPageConfig,
    } as Parameters<typeof atualizarEmpresa>[1]);

    if (error) {
      alert(error.message || "Erro ao descartar alteracoes.");
    }
  }

  async function salvar() {
    const slugFinal = gerarSlug(slugAdmin || slug);

    if (!empresaId) {
      alert("Empresa ainda não foi carregada. Tente novamente.");
      return;
    }

    if (!slugFinal) {
      alert("Informe um slug válido antes de salvar.");
      return;
    }

    const whatsappLocal = obterTelefoneLocal(whatsapp);
    const telefoneLocal = obterTelefoneLocal(telefone);
    const landingPageConfig = montarLandingPageConfig();

    if (whatsappLocal && whatsappLocal.length < 10) {
      alert("Informe um WhatsApp válido com DDD.");
      return;
    }

    if (telefoneLocal && telefoneLocal.length < 10) {
      alert("Informe um telefone válido com DDD.");
      return;
    }

    const dadosEmpresa: Record<string, unknown> = {
      nome,
      slug: slugFinal,
      tipo: tipoGerenciamento,
      categoria,
      descricao,

      telefone: telefoneLocal,
      whatsapp: whatsappLocal ? `55${whatsappLocal}` : "",
      email,

      site,
      instagram: normalizarUsuarioRedeSocial(instagram),
      facebook: normalizarUsuarioRedeSocial(facebook),
      endereco,
      horario_atendimento: horarioAtendimento,
      google_review_url: googleReviewUrl,

      pix,
      pix_nome: pixNome,
      pix_chave: pixChave,

      wifi_nome: wifiNome,
      wifi_senha: wifiSenha,

      logo,
      banner,
      logo_exibicao: logoExibicao,
      cor_principal: corPrincipal,
      cor_secundaria: corSecundaria,
      cor_botoes: corBotoes,
      cor_texto_botoes: corTextoBotoes,
      cor_fundo_pagina: corFundoPagina,
      cor_area_principal: corAreaPrincipal,
      tipo_fundo: "solida",
      gradiente_inicio: gradienteInicio,
      gradiente_fim: gradienteFim,
      gradiente_direcao: gradienteDirecao,
      tiktok: normalizarUsuarioRedeSocial(tiktok),
      youtube: normalizarUsuarioRedeSocial(youtube),
      kwai: normalizarUsuarioRedeSocial(kwai),
      landing_page_config: landingPageConfig,
    };

    if (suportaCorFundoHero) {
      dadosEmpresa.cor_fundo_hero = corFundoHero;
    }

    if (!modoCliente) {
      dadosEmpresa.plano = plano;
      dadosEmpresa.recursos_contratados = recursosContratados;
    }

    console.log("[Diagnóstico UPDATE] Antes de chamar atualizarEmpresa:", {
      idRecebidoNoFormulario: empresaInicialId,
      idEnviadoAoService: empresaId,
      slugUsado: slugFinal,
      payloadEnviado: dadosEmpresa,
    });

    const { error } = await atualizarEmpresa(
      empresaId,
      dadosEmpresa as Parameters<typeof atualizarEmpresa>[1]
    );

    if (error) {
      console.error("Erro completo ao salvar empresa:", error);
      console.error("Contexto do update da empresa:", {
        idUsado: empresaId,
        slugUsado: slugFinal,
        payloadEnviado: dadosEmpresa,
      });
      alert(error.message || "Erro ao salvar.");
      return;
    }

    setSlug(slugFinal);
    setSlugAdmin(slugFinal);
    setAparenciaSalva({
      logoExibicao,
      corPrincipal,
      corSecundaria,
      corBotoes,
      corTextoBotoes,
      corFundoPagina,
      corAreaPrincipal,
      corFundoHero,
      tipoFundo,
      gradienteInicio,
      gradienteFim,
      gradienteDirecao,
    });
    onEmpresaAtualChange?.({
      nome,
      logo,
    });

    alert("Dados salvos com sucesso!");
    onSalvar?.();
  }

  async function salvarLogo(url: string) {
    if (!empresaId) {
      alert("Empresa ainda não foi carregada. Tente novamente antes de alterar a logo.");
      return;
    }

    setLogo(url);

    const { error } = await atualizarEmpresa(empresaId, {
      logo: url,
    });

    if (error) {
      const mensagemErro = [
        error.message,
        error.code ? `código ${error.code}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("Erro ao salvar logo no Supabase:", error);

      alert(`Erro ao salvar logo no Supabase: ${mensagemErro}`);
      return;
    }

    onEmpresaAtualChange?.({
      nome,
      logo: url,
    });
  }

  async function salvarBanner(url: string) {
    if (!empresaId) {
      alert("Empresa ainda não foi carregada. Tente novamente antes de alterar o banner.");
      return;
    }

    const bannerAtualizado = url ? adicionarVersaoImagem(url) : "";

    setBanner(bannerAtualizado);

    const { error } = await atualizarEmpresa(empresaId, {
      banner: bannerAtualizado,
    });

    if (error) {
      const mensagemErro = [
        error.message,
        error.code ? `código ${error.code}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("Erro ao salvar banner no Supabase:", error);

      alert(`Erro ao salvar banner no Supabase: ${mensagemErro}`);
    }
  }

  function aplicarTemaPronto(tema: TemaOficial) {
    aplicarAparencia({
      ...tema.aparencia,
      logoExibicao,
    });
  }

  function aplicarAparencia(aparencia: AparenciaConfig) {
    setLogoExibicao(aparencia.logoExibicao);
    setCorPrincipal(aparencia.corPrincipal);
    setCorSecundaria(aparencia.corSecundaria);
    setCorBotoes(aparencia.corBotoes);
    setCorTextoBotoes(aparencia.corTextoBotoes);
    setCorFundoPagina(aparencia.corFundoPagina);
    setCorAreaPrincipal(aparencia.corAreaPrincipal);
    setCorFundoHero(aparencia.corFundoHero);
    setTipoFundo(aparencia.tipoFundo);
    setGradienteInicio(aparencia.gradienteInicio);
    setGradienteFim(aparencia.gradienteFim);
    setGradienteDirecao(aparencia.gradienteDirecao);
  }

  function obterEstiloPreview(): CSSProperties {
    const estilo = {} as CSSProperties & Record<string, string>;
    const tema = {
      corPrincipal: corPrincipal || TemaPadraoMikatech.corPrincipal,
      corSecundaria: corSecundaria || TemaPadraoMikatech.corSecundaria,
      corBotoes: corBotoes || TemaPadraoMikatech.corBotoes,
      corTextoBotoes:
        corTextoBotoes || TemaPadraoMikatech.corTextoBotoes,
      corFundoPagina:
        corFundoPagina || TemaPadraoMikatech.corFundoPagina,
      corAreaPrincipal:
        corAreaPrincipal || TemaPadraoMikatech.corAreaPrincipal,
      corFundoHero: corFundoHero || TemaPadraoMikatech.corFundoHero,
      tipoFundo: tipoFundo || TemaPadraoMikatech.tipoFundo,
      gradienteInicio:
        gradienteInicio || TemaPadraoMikatech.gradienteInicio,
      gradienteFim: gradienteFim || TemaPadraoMikatech.gradienteFim,
      gradienteDirecao:
        gradienteDirecao || TemaPadraoMikatech.gradienteDirecao,
    };
    const direcaoGradiente = {
      horizontal: "90deg",
      vertical: "180deg",
      diagonal: "135deg",
    }[tema.gradienteDirecao];

    estilo["--mc-primary"] = tema.corPrincipal;
    estilo["--mc-text"] = tema.corPrincipal;
    estilo["--mc-secondary"] = tema.corSecundaria;
    estilo["--mc-accent"] = tema.corSecundaria;
    estilo["--mc-button-background"] = tema.corBotoes;
    estilo["--mc-button-text"] = tema.corTextoBotoes;
    estilo["--mc-background"] = tema.corFundoPagina;
    estilo["--mc-background-soft"] = tema.corFundoPagina;
    estilo["--mc-hero-background"] = tema.corFundoHero;
    estilo["--mc-content-background"] = tema.corAreaPrincipal;
    estilo["--mc-card"] = tema.corAreaPrincipal;
    estilo["--mc-surface"] = tema.corAreaPrincipal;
    estilo["--mc-page-background"] = tema.corFundoPagina;
    estilo["--mc-border"] = `color-mix(in srgb, ${tema.corPrincipal} 16%, transparent)`;
    estilo["--mc-border-strong"] = `color-mix(in srgb, ${tema.corPrincipal} 28%, transparent)`;

    if (tema.tipoFundo === "gradiente") {
      estilo["--mc-page-background"] =
        `linear-gradient(${direcaoGradiente}, ${tema.gradienteInicio} 0%, ${tema.gradienteFim} 100%)`;
    }

    return estilo;
  }

  function montarContextoLandingPageIa(): LandingPageIaContexto {
    const servicosPreenchidos = landingPageServicos.filter((servico) =>
      servico.titulo.trim() || servico.descricao.trim()
    );

    return {
      nomeEmpresa: nome.trim(),
      categoria: categoria.trim(),
      descricao: descricao.trim(),
      servicos:
        servicosPreenchidos.length > 0
          ? servicosPreenchidos
          : landingPageServicosExemplo,
      contatos: {
        telefone: landingPageContato.telefone.trim() || telefone.trim(),
        whatsapp: landingPageContato.whatsapp.trim() || whatsapp.trim(),
        email: landingPageContato.email.trim() || email.trim(),
        endereco: landingPageContato.endereco.trim() || endereco.trim(),
      },
    };
  }

  const contextoLandingPageIa = montarContextoLandingPageIa();
  const landingPageRascunhoAtual = montarLandingPageRascunho();
  const possuiAlteracoesNaoPublicadas =
    JSON.stringify(landingPageRascunhoAtual) !==
    JSON.stringify(landingPageVersaoPublicada);
  const landingPagePublicadaEfetiva = landingPageVersaoPublicada.publicada;
  const landingPagePreviewConfig = montarLandingPageConfig();
  const empresaLandingPreview: EmpresaLanding = {
    id: empresaId || "preview",
    nome: nome || "Landing Page",
    slug: slugPublico || "preview",
    categoria,
    tipo: tipoGerenciamento,
    descricao,
    telefone,
    whatsapp,
    email,
    instagram,
    tiktok,
    youtube,
    kwai,
    facebook,
    site,
    endereco,
    horario_atendimento: horarioAtendimento,
    google_review_url: googleReviewUrl,
    pix,
    pix_nome: pixNome,
    pix_chave: pixChave,
    wifi_nome: wifiNome,
    wifi_senha: wifiSenha,
    landing_page_config: landingPagePreviewConfig,
    logo,
    banner,
    ativo: true,
    logo_exibicao: logoExibicao,
    cor_principal: corPrincipal,
    cor_secundaria: corSecundaria,
    cor_botoes: corBotoes,
    cor_texto_botoes: corTextoBotoes,
    cor_fundo_pagina: corFundoPagina,
    cor_fundo_hero: corFundoHero,
    cor_area_principal: corAreaPrincipal,
    tipo_fundo: tipoFundo,
    gradiente_inicio: gradienteInicio,
    gradiente_fim: gradienteFim,
    gradiente_direcao: gradienteDirecao,
    recursos_contratados: recursosContratados,
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div className="flex max-w-full flex-wrap gap-2 overflow-x-auto rounded-2xl border bg-white p-2 shadow-sm">
        {abasEmpresa
          .filter((aba) => !aba.adminOnly || !modoCliente)
          .map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className={
              abaAtiva === aba.id
                ? "shrink-0 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white"
                : "shrink-0 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            }
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === "informacoes" && (
        <>
          <Card
        title="Identidade da Empresa"
        subtitle="Dados principais exibidos no painel e na página pública."
      >
        <div className="grid lg:grid-cols-3 gap-5">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <div>
            <label className="block mb-2 font-medium">
              Categoria
            </label>

            <select
              className="w-full border rounded-xl p-3 bg-white"
              value={categoriaSelecionada}
              onChange={(e) => {
                if (e.target.value === "Outra") {
                  setCategoria(categoriasEmpresa.includes(categoria) ? "" : categoria);
                  return;
                }

                setCategoria(e.target.value);
              }}
            >
              {categoriasEmpresa.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}

              <option value="Outra">
                Outra
              </option>
            </select>
          </div>

          {categoriaSelecionada === "Outra" && (
            <Input
              label="Categoria personalizada"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          )}

          {!modoCliente && (
            <>
              <div className="hidden">
                <Input
                  label="Slug administrativo"
                  value={slugAdmin}
                  onChange={(e) => setSlugAdmin(gerarSlug(e.target.value))}
                />

                <p className="mt-2 text-sm text-slate-500">
                  Campo reservado para o administrador Mikatech.
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Tipo de gerenciamento
                </label>

                <select
                  className="w-full border rounded-xl p-3 bg-white"
                  value={tipoGerenciamento}
                  onChange={(e) => setTipoGerenciamento(e.target.value)}
                >
                  <option value="mikatech">
                    Administrada pela Mikatech
                  </option>

                  <option value="cliente">
                    Cliente administra
                  </option>
                </select>
              </div>
            </>
          )}

          <div className="lg:col-span-3">
            <label className="block mb-2 font-medium">
              Descrição
            </label>

            <textarea
              className="w-full border rounded-xl p-3 h-24"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte em poucas palavras o que sua empresa oferece."
            />
          </div>
        </div>
      </Card>

          <QRCodeEmpresa
            slug={slugPublico}
            nomeEmpresa={nome}
            landingPageContratada={recursosContratados.landing_page}
            landingPagePublicada={landingPagePublicadaEfetiva}
          />

        </>
      )}

      {abaAtiva === "plano" && !modoCliente && (
        <Card
          title="Plano e Recursos"
          subtitle="Controle quais funcionalidades esta empresa possui contratadas."
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Plano contratado
              </h3>

              <div className="grid gap-3 md:grid-cols-3">
                {planosEmpresa.map((opcao) => (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => setPlano(opcao.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      plano === opcao.id
                        ? "border-green-600 bg-green-50 ring-4 ring-green-100"
                        : "border-slate-200 bg-white hover:border-green-200"
                    }`}
                  >
                    <span className="block font-bold text-slate-900">
                      {opcao.nome}
                    </span>

                    <span className="mt-2 block text-sm leading-6 text-slate-500">
                      {opcao.descricao}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3">
                <h3 className="font-bold text-slate-800">
                  Recursos contratados
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ative apenas os modulos liberados para esta empresa. Modulos futuros podem ser cadastrados aqui sem alterar a logica do painel.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recursosEmpresa.map((recurso) => {
                  const ativo = recursosContratados[recurso.id];

                  return (
                    <button
                      key={recurso.id}
                      type="button"
                      onClick={() => alternarRecurso(recurso.id)}
                      className={`flex min-h-32 flex-col justify-between rounded-2xl border p-4 text-left transition ${
                        ativo
                          ? "border-green-600 bg-green-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span>
                        <span className="flex items-start justify-between gap-3">
                          <span>
                            <span className="block font-bold text-slate-900">
                              {recurso.nome}
                            </span>

                            <span className="mt-1 block text-sm leading-6 text-slate-500">
                              {recurso.descricao}
                            </span>
                          </span>

                          <span
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                              ativo ? "bg-green-600" : "bg-slate-300"
                            }`}
                            aria-hidden="true"
                          >
                            <span
                              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                ativo ? "left-6" : "left-1"
                              }`}
                            />
                          </span>
                        </span>
                      </span>

                      <span
                        className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          ativo
                            ? "bg-green-700 text-white"
                            : recurso.statusInativo === "Em breve"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ativo ? "Ativo" : recurso.statusInativo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {abaAtiva === "landing" && (
        <Card
          title="Landing Page"
          subtitle="Estrutura base para uma landing independente, preparada para planos, IA, dominio e analytics."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.landing_page && landingPagePublicada
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.landing_page && landingPagePublicada
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.landing_page ? "Ativo" : "Não contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {recursosContratados.landing_page
                      ? "Landing Page liberada"
                      : "Landing Page ainda nao contratada"}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Este modulo foi preparado para funcionar separado da Pagina Publica, com estrutura propria para campanhas, dominios personalizados e leitura de resultados.
                  </p>

                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-3">
                    <input
                      type="checkbox"
                      checked={landingPagePublicada}
                      disabled={!recursosContratados.landing_page}
                      onChange={(e) => setLandingPagePublicada(e.target.checked)}
                      className="h-5 w-5"
                    />

                    <span>
                      <span className="block font-bold text-slate-900">
                        Publicar Landing Page
                      </span>

                      <span className="block text-sm leading-6 text-slate-600">
                        Quando desligada, o link publico mostra "Landing Page não publicada".
                      </span>
                    </span>
                  </label>

                  {possuiAlteracoesNaoPublicadas && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-white/80 p-3">
                      <p className="text-sm font-bold text-amber-800">
                        Existem alteracoes nao publicadas.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        O preview mostra o rascunho. A Landing Page publica continua usando a ultima versao publicada.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={!recursosContratados.landing_page}
                      onClick={publicarLandingPageAlteracoes}
                      className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Publicar alteracoes
                    </button>

                    <button
                      type="button"
                      disabled={!possuiAlteracoesNaoPublicadas}
                      onClick={descartarLandingPageAlteracoes}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Descartar alteracoes
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLandingPagePlaceholderAberto(true)}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white md:w-auto ${
                    recursosContratados.landing_page
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {recursosContratados.landing_page
                    ? "Configurar Landing Page"
                    : "Conhecer recurso"}
                </button>
              </div>
            </div>

            {landingPagePlaceholderAberto && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Editor da Landing Page
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      Estrutura de configuracao
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      O editor ainda nao publica a landing. Esta base prepara secoes independentes, preview em tempo real, ordenacao futura e integracoes de crescimento.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                    <button
                      type="button"
                      onClick={() => setLandingPageIaModalAberto(true)}
                      className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 md:w-auto"
                    >
                      Gerar Landing Page com IA
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandingPagePlaceholderAberto(false)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 md:w-auto"
                    >
                      Fechar
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
                  <aside className="rounded-2xl bg-slate-50 p-3">
                    <h4 className="font-bold text-slate-900">
                      Seções
                    </h4>

                    <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:flex-col">
                      {landingPageSectionRegistry.map((secao) => (
                        <button
                          key={secao.id}
                          type="button"
                          onClick={() => setLandingPageSecaoAtiva(secao.id)}
                          className={`min-w-0 rounded-xl border px-3 py-2 text-left text-sm font-bold transition xl:w-full ${
                            landingPageSecaoAtiva === secao.id
                              ? "border-green-600 bg-green-700 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-green-200"
                          }`}
                        >
                          {secao.nome}
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="min-w-0 space-y-4">
                    {landingPageSectionRegistry
                      .filter((secao) => secao.id === landingPageSecaoAtiva)
                      .map((secao) => {
                        const SecaoLanding = secao.Component;
                        const secaoConteudoAtiva =
                          landingPageOrdemSecoesPadrao.includes(
                            secao.id as LandingPageSecaoConteudoId
                          )
                            ? (secao.id as LandingPageSecaoConteudoId)
                            : null;

                        return (
                          <div key={secao.id} className="space-y-4">
                            {secaoConteudoAtiva && (
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <LandingSecaoVisibilitySwitch
                                  secao={secaoConteudoAtiva}
                                  visivel={
                                    landingPageVisibilidadeSecoes[
                                      secaoConteudoAtiva
                                    ]
                                  }
                                  desabilitado={
                                    !recursosContratados.landing_page
                                  }
                                  onChange={
                                    atualizarLandingPageSecaoVisibilidade
                                  }
                                />
                              </div>
                            )}

                            <SecaoLanding
                              nome={secao.nome}
                              descricao={secao.descricao}
                              landingPageContratada={
                                recursosContratados.landing_page
                              }
                              hero={landingPageHero}
                              sobre={landingPageSobre}
                              servicos={landingPageServicos}
                              galeria={landingPageGaleria}
                              depoimentos={landingPageDepoimentos}
                              contato={landingPageContato}
                              cta={landingPageCta}
                              seo={landingPageSeo}
                              ordemSecoes={landingPageOrdemSecoes}
                              visibilidadeSecoes={
                                landingPageVisibilidadeSecoes
                              }
                              onHeroChange={atualizarLandingPageHero}
                              onSobreChange={atualizarLandingPageSobre}
                              onServicoChange={atualizarLandingPageServico}
                              onServicoAdd={adicionarLandingPageServico}
                              onServicoRemove={removerLandingPageServico}
                              onGaleriaImagemChange={
                                atualizarLandingPageGaleriaImagem
                              }
                              onGaleriaImagemAdd={
                                adicionarLandingPageGaleriaImagem
                              }
                              onGaleriaImagemRemove={
                                removerLandingPageGaleriaImagem
                              }
                              onDepoimentoChange={
                                atualizarLandingPageDepoimento
                              }
                              onDepoimentoAdd={adicionarLandingPageDepoimento}
                              onDepoimentoRemove={
                                removerLandingPageDepoimento
                              }
                              onContatoChange={atualizarLandingPageContato}
                              onCtaChange={atualizarLandingPageCta}
                              onSeoChange={atualizarLandingPageSeo}
                              onTemplateApply={aplicarLandingPageTemplate}
                              onSecaoMove={moverLandingPageSecao}
                              onSecaoVisibilityChange={
                                atualizarLandingPageSecaoVisibilidade
                              }
                            />
                          </div>
                        );
                      })}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="font-bold text-slate-900">
                        Base preparada
                      </h4>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {landingPageArquiteturaFutura.map((item) => (
                          <span
                            key={item}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <LandingPagePreviewReal
                    empresa={empresaLandingPreview}
                    landingPage={landingPagePreviewConfig}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {abaAtiva === "aparencia" && (
        <Card
          title="Personalizar Página"
          subtitle="Escolha um tema pronto para a página pública desta empresa."
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] xl:items-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 font-bold text-slate-800">
                  Logo e Banner
                </h3>

                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      valor: "normal",
                      titulo: "Exibir logo",
                      descricao: "Mostra o logo na página pública.",
                    },
                    {
                      valor: "hidden",
                      titulo: "Não exibir logo",
                      descricao: "Mostra a página apenas com o banner.",
                    },
                  ].map((opcao) => (
                    <label
                      key={opcao.valor}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        logoExibicao === opcao.valor
                          ? "border-green-600 bg-green-50"
                          : "border-slate-200 bg-white hover:border-green-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="logoExibicao"
                        value={opcao.valor}
                        checked={logoExibicao === opcao.valor}
                        onChange={() =>
                          setLogoExibicao(opcao.valor as LogoExibicao)
                        }
                        className="mr-2"
                      />

                      <span className="font-bold text-slate-800">
                        {opcao.titulo}
                      </span>

                      <p className="mt-2 text-sm text-slate-500">
                        {opcao.descricao}
                      </p>
                    </label>
                  ))}
                </div>

                <div className="grid gap-4">
                  <UploadImagem
                    titulo="Logo"
                    imagem={logo}
                    pasta={empresaId ? `${empresaId}/logo` : undefined}
                    onUpload={salvarLogo}
                  />

                  <UploadImagem
                    titulo="Banner"
                    imagem={banner}
                    pasta={empresaId ? `${empresaId}/banner` : undefined}
                    onUpload={salvarBanner}
                  />
                </div>
              </div>
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Temas
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                {temasProntos.map((tema) => {
                  const aparenciaTema = tema.aparencia;
                  const temaSelecionado =
                    corPrincipal === aparenciaTema.corPrincipal &&
                    corSecundaria === aparenciaTema.corSecundaria &&
                    corBotoes === aparenciaTema.corBotoes &&
                    corTextoBotoes === aparenciaTema.corTextoBotoes &&
                    corFundoPagina === aparenciaTema.corFundoPagina &&
                    corAreaPrincipal === aparenciaTema.corAreaPrincipal &&
                    corFundoHero === aparenciaTema.corFundoHero &&
                    tipoFundo === aparenciaTema.tipoFundo &&
                    gradienteInicio === aparenciaTema.gradienteInicio &&
                    gradienteFim === aparenciaTema.gradienteFim &&
                    gradienteDirecao === aparenciaTema.gradienteDirecao;

                  return (
                    <button
                      key={tema.id}
                      type="button"
                      data-theme-id={tema.id}
                      onClick={() => aplicarTemaPronto(tema)}
                      className={`rounded-2xl border bg-white p-4 text-left transition hover:border-green-300 hover:shadow-sm ${
                        temaSelecionado
                          ? "border-green-600 shadow-sm ring-4 ring-green-100"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="font-bold text-slate-800">
                        {tema.nome}
                      </span>

                      <span className="mt-1 block text-sm text-slate-500">
                        {tema.descricao}
                      </span>

                      <span
                        className="mt-4 grid grid-cols-5 overflow-hidden rounded-xl border border-slate-200"
                        aria-hidden="true"
                        data-theme-thumbnail={tema.miniatura.tipo}
                      >
                        {[
                          aparenciaTema.corFundoPagina,
                          aparenciaTema.corAreaPrincipal,
                          aparenciaTema.corPrincipal,
                          aparenciaTema.corSecundaria,
                          aparenciaTema.corBotoes,
                        ].map((cor, indice) => (
                          <span
                            key={`${tema.id}-${cor}-${indice}`}
                            className="h-9"
                            style={{ backgroundColor: cor }}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {possuiAlteracoesAparencia && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                Você possui alterações não salvas.
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const confirmado = window.confirm(
                    "Deseja restaurar o tema padrão definido pela Mikatech?"
                  );

                  if (confirmado) {
                    aplicarAparencia(TemaPadraoMikatech);
                  }
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
              >
                Restaurar padrão Mikatech
              </button>

              <Button
                variant="primary"
                size="lg"
                onClick={salvar}
                className={
                  possuiAlteracoesAparencia
                    ? "shadow-lg ring-4 ring-green-100"
                    : "opacity-80"
                }
              >
                Salvar alterações
              </Button>
            </div>
            </div>

            <div className="xl:sticky xl:top-6">
              <h3 className="mb-3 font-bold text-slate-800">
                Preview em Tempo Real
              </h3>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner">
                <div
                  className="public-empresa-page public-empresa-page--preview"
                  style={obterEstiloPreview()}
                >
                  <section className="public-empresa-card">
                    <HeroEmpresa
                      banner={banner}
                      logo={logo}
                      nome={nome || "Empresa"}
                      logoExibicao={logoExibicao}
                      corFundoHero={corFundoHero || corFundoPagina}
                    />

                    <div className="public-empresa-content">
                      <section className="public-empresa-profile-card">
                        <InformacoesEmpresa
                          nome={nome || "Empresa"}
                          descricao={descricao}
                        />
                      </section>

                      <ContatosEmpresa
                        nome={nome || "Empresa"}
                        whatsapp={whatsapp}
                        telefone={telefone}
                        email={email}
                        instagram={instagram}
                        tiktok={tiktok}
                        youtube={youtube}
                        kwai={kwai}
                        site={site}
                        endereco={endereco}
                        horarioAtendimento={horarioAtendimento}
                        googleReviewUrl={googleReviewUrl}
                        wifiNome={wifiNome}
                        wifiSenha={wifiSenha}
                        pixNome={pixNome}
                        pixChave={pixChave || pix}
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>

          </div>
        </Card>
      )}

      {abaAtiva === "contato" && (
        <Card
        title="Contato"
        subtitle="Canais utilizados pelos clientes para falar com a empresa."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
            placeholder="(15) 99741-4078"
            helperText="Digite apenas os números."
          />

          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="(15) 3333-4444"
            helperText="Digite apenas os números."
          />

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          />
        </div>
      </Card>
      )}

      {abaAtiva === "endereco" && (
        <Card
        title="Endereço"
        subtitle="Localização e horário de atendimento exibidos para o cliente."
      >
        <div className="grid lg:grid-cols-2 gap-5">
          <div>
            <Input
              label="CEP"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
            />

            {buscandoCep && (
              <p className="mt-2 text-sm text-slate-500">
                Buscando endereço...
              </p>
            )}

            {cepErro && (
              <p className="mt-2 text-sm text-red-600">
                {cepErro}
              </p>
            )}
          </div>

          <Input
            label="Numero"
            value={numeroEndereco}
            onChange={(e) => setNumeroEndereco(e.target.value)}
          />

          <Input
            label="Complemento"
            value={complementoEndereco}
            onChange={(e) => setComplementoEndereco(e.target.value)}
          />

          <Input
            label="Rua"
            value={rua}
            onChange={(e) => {
              setRua(e.target.value);
              setEndereco(montarEnderecoCompleto(e.target.value));
            }}
          />

          <Input
            label="Bairro"
            value={bairro}
            onChange={(e) => {
              setBairro(e.target.value);
              setEndereco(
                montarEnderecoCompleto(
                  rua,
                  e.target.value
                )
              );
            }}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Cidade"
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value);
                  setEndereco(
                    montarEnderecoCompleto(
                      rua,
                      bairro,
                      e.target.value
                    )
                  );
                }}
              />
            </div>

            <Input
              label="Estado"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setEndereco(
                  montarEnderecoCompleto(
                    rua,
                    bairro,
                    cidade,
                    e.target.value
                  )
                );
              }}
            />
          </div>

          <Input
            label="Endereço atual"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <div className="lg:col-span-2">
            <div className="mb-3">
              <label className="block font-medium">
                Horário de atendimento
              </label>
              <p className="text-sm text-slate-500">
                Configure os dias ativos e os horários de abertura e fechamento.
              </p>
            </div>

            <div className="space-y-3">
              {diasAtendimento.map((dia) => {
                const horario = horariosAtendimento[dia.id];

                return (
                  <div
                    key={dia.id}
                    className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_120px_120px]"
                  >
                    <label className="flex items-center gap-3 font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={horario.ativo}
                        onChange={(e) =>
                          atualizarHorarioDia(
                            dia.id,
                            "ativo",
                            e.target.checked
                          )
                        }
                      />
                      {dia.label}
                    </label>

                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={horario.abertura}
                      disabled={!horario.ativo}
                      onChange={(e) =>
                        atualizarHorarioDia(
                          dia.id,
                          "abertura",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={horario.fechamento}
                      disabled={!horario.ativo}
                      onChange={(e) =>
                        atualizarHorarioDia(
                          dia.id,
                          "fechamento",
                          e.target.value
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>

            {horarioAtendimento && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 whitespace-pre-line">
                {horarioAtendimento}
              </div>
            )}
          </div>
        </div>
      </Card>
      )}

      {abaAtiva === "conectividade" && (
        <Card
        title="Conectividade"
        subtitle="Dados rápidos para Wi-Fi, PIX e avaliações no Google."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Nome da Rede Wi-Fi"
            value={wifiNome}
            onChange={(e) => setWifiNome(e.target.value)}
          />

          <Input
            label="Senha Wi-Fi"
            value={wifiSenha}
            onChange={(e) => setWifiSenha(e.target.value)}
          />

          <Input
            label="Nome do recebedor PIX"
            value={pixNome}
            onChange={(e) => setPixNome(e.target.value)}
          />

          <Input
            label="Chave PIX"
            value={pixChave}
            onChange={(e) => setPixChave(e.target.value)}
          />

          <Input
            label="PIX legado"
            value={pix}
            onChange={(e) => setPix(e.target.value)}
          />

          <Input
            label="Link para Avaliação Google"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
          />
        </div>
      </Card>
      )}

      {abaAtiva === "redes" && (
        <Card
        title="Redes Sociais"
        subtitle="Perfis sociais usados para relacionamento e divulgação."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setInstagram(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="TikTok"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setTiktok(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="YouTube"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setYoutube(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="Kwai"
            value={kwai}
            onChange={(e) => setKwai(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setKwai(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="Facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setFacebook(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Vitrine Digital será preparada em uma sprint futura.
          </div>
        </div>
      </Card>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={salvar}
        >
          Salvar alterações
        </Button>
      </div>

      {!modoCliente && onExcluir && (
        <Card
          title="Zona de Perigo"
          subtitle="Ações irreversíveis para esta empresa."
        >
          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-red-800">
                Excluir empresa
              </h3>

              <p className="mt-1 text-sm text-red-700">
                Esta ação remove a empresa e não poderá ser desfeita.
              </p>
            </div>

            <button
              type="button"
              onClick={onExcluir}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Excluir empresa
            </button>
          </div>
        </Card>
      )}

      {landingPageIaModalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-page-ia-titulo"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  IA para Landing Page
                </p>

                <h3
                  id="landing-page-ia-titulo"
                  className="mt-2 text-xl font-bold text-slate-900"
                >
                  Geracao automatica em breve
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Esta funcionalidade ainda nao gera conteudo. A estrutura abaixo mostra os dados que serao usados na futura integracao com IA.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLandingPageIaModalAberto(false)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 md:w-auto"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">
                  Dados da empresa
                </h4>

                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-bold text-slate-700">
                      Nome da empresa
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {contextoLandingPageIa.nomeEmpresa || "Nao informado"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-bold text-slate-700">
                      Categoria
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {contextoLandingPageIa.categoria || "Nao informada"}
                    </dd>
                  </div>

                  <div className="md:col-span-2">
                    <dt className="font-bold text-slate-700">
                      Descricao
                    </dt>
                    <dd className="mt-1 leading-6 text-slate-600">
                      {contextoLandingPageIa.descricao || "Nao informada"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="font-bold text-slate-900">
                  Servicos
                </h4>

                <div className="mt-3 grid gap-2">
                  {contextoLandingPageIa.servicos.map((servico, indice) => (
                    <div
                      key={`${servico.titulo}-${indice}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="font-bold text-slate-900">
                        {servico.titulo.trim() || `Servico ${indice + 1}`}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {servico.descricao.trim() || "Descricao nao informada"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="font-bold text-slate-900">
                  Contatos
                </h4>

                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  {[
                    ["Telefone", contextoLandingPageIa.contatos.telefone],
                    ["WhatsApp", contextoLandingPageIa.contatos.whatsapp],
                    ["E-mail", contextoLandingPageIa.contatos.email],
                    ["Endereco", contextoLandingPageIa.contatos.endereco],
                  ].map(([label, valor]) => (
                    <div key={label}>
                      <dt className="font-bold text-slate-700">
                        {label}
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {valor || "Nao informado"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">
                  Arquitetura futura
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Este ponto fica preparado para enviar o contexto acima a um provedor de IA e preencher as secoes da Landing Page em uma proxima sprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
