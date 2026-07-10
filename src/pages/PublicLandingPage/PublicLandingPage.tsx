import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactElement,
} from "react";
import { useParams } from "react-router-dom";

import type { Empresa } from "../../models/Empresa";
import {
  buscarLandingPagePorSlug,
  salvarLeadLandingPage,
} from "../../services/empresa/empresa.service";
import {
  applySeoMetadata,
  createBusinessJsonLd,
  createSeoKeywords,
  getManifestUrl,
  getPublicUrl,
  normalizeSeoDescription,
} from "../../utils/seo";

import "./PublicLandingPage.css";

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

type LandingPageAudioConfig = {
  titulo: string;
  descricao: string;
  arquivoUrl: string;
  visivel: boolean;
};

type LandingPageProdutoDigitalConfig = {
  titulo: string;
  descricao: string;
  preco: string;
  imagemUrl: string;
  linkCompra: string;
  categoria: string;
  visivel: boolean;
};

type LandingPageContatoConfig = {
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
};

type LandingPageFormularioCampoId =
  | "nome"
  | "telefone"
  | "whatsapp"
  | "email"
  | "mensagem";

type LandingPageFormularioCampoConfig = {
  ativo: boolean;
  obrigatorio: boolean;
};

type LandingPageFormularioContatoConfig = Record<
  LandingPageFormularioCampoId,
  LandingPageFormularioCampoConfig
>;

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
  | "audios"
  | "produtosDigitais"
  | "contato"
  | "cta";

export type LandingPageConfig = {
  publicada: boolean;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  galeria: LandingPageGaleriaImagemConfig[];
  depoimentos: LandingPageDepoimentoConfig[];
  audios: LandingPageAudioConfig[];
  produtosDigitais: LandingPageProdutoDigitalConfig[];
  categoriasProdutosDigitais: string[];
  contato: LandingPageContatoConfig;
  formularioContato: LandingPageFormularioContatoConfig;
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

type LandingPageRecursoExtraId =
  | "landing_page_audios"
  | "landing_page_produtos_digitais";

export type EmpresaLanding = Empresa & {
  logo_exibicao?: "normal" | "small" | "hidden" | "pequeno" | "oculto" | null;
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_fundo_hero?: string | null;
  cor_area_principal?: string | null;
  tipo_fundo?: string | null;
  gradiente_inicio?: string | null;
  gradiente_fim?: string | null;
  gradiente_direcao?: string | null;
  recursos_contratados?:
    | ({
        landing_page?: boolean;
      } & Partial<Record<LandingPageRecursoExtraId, boolean>>)
    | null;
};

const landingPageConfigPadrao: LandingPageConfig = {
  publicada: false,
  hero: {
    titulo: "",
    subtitulo: "",
    botaoTexto: "",
    botaoLink: "",
    imagemDestaque: "",
  },
  sobre: {
    titulo: "",
    texto: "",
    imagem: "",
  },
  servicos: [
    {
      titulo: "",
      descricao: "",
    },
  ],
  galeria: [
    {
      url: "",
      alt: "",
    },
  ],
  depoimentos: [
    {
      nome: "",
      cargoEmpresa: "",
      texto: "",
    },
  ],
  audios: [
    {
      titulo: "",
      descricao: "",
      arquivoUrl: "",
      visivel: true,
    },
  ],
  produtosDigitais: [
    {
      titulo: "",
      descricao: "",
      preco: "",
      imagemUrl: "",
      linkCompra: "",
      categoria: "",
      visivel: true,
    },
  ],
  categoriasProdutosDigitais: [],
  contato: {
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
  },
  formularioContato: {
    nome: { ativo: true, obrigatorio: true },
    telefone: { ativo: true, obrigatorio: false },
    whatsapp: { ativo: false, obrigatorio: false },
    email: { ativo: true, obrigatorio: true },
    mensagem: { ativo: true, obrigatorio: true },
  },
  cta: {
    titulo: "",
    texto: "",
    botaoTexto: "",
    botaoLink: "",
  },
  seo: {
    titulo: "",
    descricao: "",
    palavrasChave: "",
    imagemCompartilhamento: "",
  },
  ordemSecoes: [
    "hero",
    "sobre",
    "servicos",
    "galeria",
    "depoimentos",
    "audios",
    "produtosDigitais",
    "contato",
    "cta",
  ],
  visibilidadeSecoes: {
    hero: true,
    sobre: true,
    servicos: true,
    galeria: true,
    depoimentos: true,
    audios: true,
    produtosDigitais: true,
    contato: true,
    cta: true,
  },
  versaoPublicada: null,
  alteracoesNaoPublicadas: false,
  historicoVersoes: [],
};

const landingPageOrdemSecoesPadrao = landingPageConfigPadrao.ordemSecoes;
const landingPageVisibilidadeSecoesPadrao =
  landingPageConfigPadrao.visibilidadeSecoes;
const landingPageFormularioCampos: Array<{
  id: LandingPageFormularioCampoId;
  label: string;
  type: string;
  placeholder: string;
}> = [
  { id: "nome", label: "Nome", type: "text", placeholder: "Seu nome" },
  {
    id: "telefone",
    label: "Telefone",
    type: "tel",
    placeholder: "(00) 0000-0000",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    type: "tel",
    placeholder: "(00) 00000-0000",
  },
  { id: "email", label: "E-mail", type: "email", placeholder: "seu@email.com" },
  {
    id: "mensagem",
    label: "Mensagem",
    type: "textarea",
    placeholder: "Como podemos ajudar?",
  },
];

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function booleano(valor: unknown) {
  return typeof valor === "boolean" ? valor : false;
}

function temTexto(...valores: string[]) {
  return valores.some((valor) => valor.trim());
}

function normalizarObjeto<T extends Record<string, string>>(
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
      [campo]: texto(objeto[String(campo)]),
    }),
    { ...padrao }
  );
}

function normalizarLista<T extends Record<string, string>>(
  valor: unknown,
  padrao: T[],
  campos: Array<keyof T>
): T[] {
  if (!Array.isArray(valor)) {
    return padrao.map((item) => ({ ...item }));
  }

  const itens = valor
    .slice(0, 6)
    .map((item) => normalizarObjeto(item, padrao[0], campos));

  return itens.length > 0 ? itens : padrao.map((item) => ({ ...item }));
}

function normalizarFormularioContato(
  valor: unknown,
  fallback: LandingPageFormularioContatoConfig
): LandingPageFormularioContatoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(fallback);
  }

  const formularioRecebido = valor as Record<string, unknown>;

  return landingPageFormularioCampos.reduce<LandingPageFormularioContatoConfig>(
    (formulario, campo) => {
      const configCampo = formularioRecebido[campo.id];
      const fallbackCampo = fallback[campo.id];

      if (!configCampo || typeof configCampo !== "object" || Array.isArray(configCampo)) {
        return {
          ...formulario,
          [campo.id]: { ...fallbackCampo },
        };
      }

      const configRecebida = configCampo as Record<string, unknown>;

      return {
        ...formulario,
        [campo.id]: {
          ativo:
            typeof configRecebida.ativo === "boolean"
              ? configRecebida.ativo
              : fallbackCampo.ativo,
          obrigatorio:
            typeof configRecebida.obrigatorio === "boolean"
              ? configRecebida.obrigatorio
              : fallbackCampo.obrigatorio,
        },
      };
    },
    structuredClone(fallback)
  );
}

function normalizarAudios(valor: unknown): LandingPageAudioConfig[] {
  const padrao = landingPageConfigPadrao.audios;

  if (!Array.isArray(valor)) {
    return padrao.map((audio) => ({ ...audio }));
  }

  const audios = valor.slice(0, 10).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ...padrao[0] };
    }

    const audio = item as Record<string, unknown>;

    return {
      titulo: texto(audio.titulo),
      descricao: texto(audio.descricao),
      arquivoUrl: texto(audio.arquivoUrl),
      visivel:
        typeof audio.visivel === "boolean" ? audio.visivel : true,
    };
  });

  return audios.length > 0 ? audios : padrao.map((audio) => ({ ...audio }));
}

function normalizarProdutosDigitais(
  valor: unknown
): LandingPageProdutoDigitalConfig[] {
  const padrao = landingPageConfigPadrao.produtosDigitais;

  if (!Array.isArray(valor)) {
    return padrao.map((produto) => ({ ...produto }));
  }

  const produtos = valor.slice(0, 20).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ...padrao[0] };
    }

    const produto = item as Record<string, unknown>;

    return {
      titulo: texto(produto.titulo),
      descricao: texto(produto.descricao),
      preco: texto(produto.preco),
      imagemUrl: texto(produto.imagemUrl),
      linkCompra: texto(produto.linkCompra),
      categoria: texto(produto.categoria),
      visivel:
        typeof produto.visivel === "boolean" ? produto.visivel : true,
    };
  });

  return produtos.length > 0
    ? produtos
    : padrao.map((produto) => ({ ...produto }));
}

function normalizarCategoriasProdutosDigitais(valor: unknown): string[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .filter((categoria): categoria is string => typeof categoria === "string")
    .map((categoria) => categoria.trim())
    .filter(Boolean)
    .filter((categoria, indice, lista) => lista.indexOf(categoria) === indice);
}

function normalizarOrdemSecoes(valor: unknown): LandingPageSecaoConteudoId[] {
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

function normalizarVisibilidadeSecoes(
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
    audios: config.audios.map((audio) => ({ ...audio })),
    produtosDigitais: config.produtosDigitais.map((produto) => ({
      ...produto,
    })),
    categoriasProdutosDigitais: [...config.categoriasProdutosDigitais],
    contato: { ...config.contato },
    formularioContato: structuredClone(config.formularioContato),
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

  return {
    publicada: booleano((valor as Record<string, unknown>).publicada),
    hero: normalizarObjeto(config.hero, fallback.hero, [
      "titulo",
      "subtitulo",
      "botaoTexto",
      "botaoLink",
      "imagemDestaque",
    ]),
    sobre: normalizarObjeto(config.sobre, fallback.sobre, [
      "titulo",
      "texto",
      "imagem",
    ]),
    servicos: normalizarLista(config.servicos, fallback.servicos, [
      "titulo",
      "descricao",
    ]),
    galeria: normalizarLista(config.galeria, fallback.galeria, [
      "url",
      "alt",
    ]),
    depoimentos: normalizarLista(config.depoimentos, fallback.depoimentos, [
      "nome",
      "cargoEmpresa",
      "texto",
    ]),
    audios: normalizarAudios(config.audios),
    produtosDigitais: normalizarProdutosDigitais(config.produtosDigitais),
    categoriasProdutosDigitais: normalizarCategoriasProdutosDigitais(
      config.categoriasProdutosDigitais
    ),
    contato: normalizarObjeto(config.contato, fallback.contato, [
      "telefone",
      "whatsapp",
      "email",
      "endereco",
    ]),
    formularioContato: normalizarFormularioContato(
      config.formularioContato,
      fallback.formularioContato
    ),
    cta: normalizarObjeto(config.cta, fallback.cta, [
      "titulo",
      "texto",
      "botaoTexto",
      "botaoLink",
    ]),
    seo: normalizarObjeto(config.seo, fallback.seo, [
      "titulo",
      "descricao",
      "palavrasChave",
      "imagemCompartilhamento",
    ]),
    ordemSecoes: normalizarOrdemSecoes(config.ordemSecoes),
    visibilidadeSecoes: normalizarVisibilidadeSecoes(
      config.visibilidadeSecoes
    ),
  };
}

function normalizarLandingPageConfig(valor: unknown): LandingPageConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(landingPageConfigPadrao);
  }

  const config = valor as Partial<Record<keyof LandingPageConfig, unknown>>;

  const rascunho: LandingPagePublicavelConfig = {
    publicada: booleano((valor as Record<string, unknown>).publicada),
    hero: normalizarObjeto(config.hero, landingPageConfigPadrao.hero, [
      "titulo",
      "subtitulo",
      "botaoTexto",
      "botaoLink",
      "imagemDestaque",
    ]),
    sobre: normalizarObjeto(config.sobre, landingPageConfigPadrao.sobre, [
      "titulo",
      "texto",
      "imagem",
    ]),
    servicos: normalizarLista(config.servicos, landingPageConfigPadrao.servicos, [
      "titulo",
      "descricao",
    ]),
    galeria: normalizarLista(config.galeria, landingPageConfigPadrao.galeria, [
      "url",
      "alt",
    ]),
    depoimentos: normalizarLista(
      config.depoimentos,
      landingPageConfigPadrao.depoimentos,
      ["nome", "cargoEmpresa", "texto"]
    ),
    audios: normalizarAudios(config.audios),
    produtosDigitais: normalizarProdutosDigitais(config.produtosDigitais),
    categoriasProdutosDigitais: normalizarCategoriasProdutosDigitais(
      config.categoriasProdutosDigitais
    ),
    contato: normalizarObjeto(config.contato, landingPageConfigPadrao.contato, [
      "telefone",
      "whatsapp",
      "email",
      "endereco",
    ]),
    formularioContato: normalizarFormularioContato(
      config.formularioContato,
      landingPageConfigPadrao.formularioContato
    ),
    cta: normalizarObjeto(config.cta, landingPageConfigPadrao.cta, [
      "titulo",
      "texto",
      "botaoTexto",
      "botaoLink",
    ]),
    seo: normalizarObjeto(config.seo, landingPageConfigPadrao.seo, [
      "titulo",
      "descricao",
      "palavrasChave",
      "imagemCompartilhamento",
    ]),
    ordemSecoes: normalizarOrdemSecoes(config.ordemSecoes),
    visibilidadeSecoes: normalizarVisibilidadeSecoes(
      config.visibilidadeSecoes
    ),
  };
  const versaoPublicada = normalizarLandingPagePublicavelConfig(
    config.versaoPublicada,
    rascunho
  );

  return {
    ...rascunho,
    versaoPublicada,
    alteracoesNaoPublicadas:
      JSON.stringify(rascunho) !== JSON.stringify(versaoPublicada),
    historicoVersoes: Array.isArray(config.historicoVersoes)
      ? config.historicoVersoes
          .slice(0, 10)
          .map((versao) =>
            normalizarLandingPagePublicavelConfig(versao, versaoPublicada)
          )
      : [],
  };
}

function obterDirecaoGradiente(direcao?: string | null) {
  if (direcao === "horizontal") return "90deg";
  if (direcao === "diagonal") return "135deg";

  return "180deg";
}

function criarEstiloAparencia(empresa: EmpresaLanding): CSSProperties {
  const estilo = {} as CSSProperties & Record<string, string>;
  const corPrincipal = empresa.cor_principal?.trim();
  const corSecundaria = empresa.cor_secundaria?.trim();
  const corBotoes = empresa.cor_botoes?.trim();
  const corTextoBotoes = empresa.cor_texto_botoes?.trim();
  const corFundoPagina = empresa.cor_fundo_pagina?.trim();
  const corFundoHero = empresa.cor_fundo_hero?.trim();
  const corAreaPrincipal = empresa.cor_area_principal?.trim();
  const gradienteInicio = empresa.gradiente_inicio?.trim();
  const gradienteFim = empresa.gradiente_fim?.trim();

  function aplicarVariavel(nome: string, valor?: string) {
    if (valor) estilo[nome] = valor;
  }

  aplicarVariavel("--ml-primary", corPrincipal);
  aplicarVariavel("--ml-secondary", corSecundaria);
  aplicarVariavel("--ml-button-background", corBotoes);
  aplicarVariavel("--ml-button-text", corTextoBotoes);
  aplicarVariavel("--ml-background", corFundoPagina);
  aplicarVariavel("--ml-hero-background", corFundoHero || corFundoPagina);
  aplicarVariavel("--ml-surface", corAreaPrincipal);

  if (corPrincipal) {
    estilo["--ml-border"] =
      `color-mix(in srgb, ${corPrincipal} 18%, transparent)`;
    estilo["--ml-border-strong"] =
      `color-mix(in srgb, ${corPrincipal} 34%, transparent)`;
  }

  if (empresa.tipo_fundo === "gradiente" && gradienteInicio && gradienteFim) {
    estilo["--ml-page-background"] =
      `linear-gradient(${obterDirecaoGradiente(empresa.gradiente_direcao)}, ${gradienteInicio} 0%, ${gradienteFim} 100%)`;
  } else {
    aplicarVariavel("--ml-page-background", corFundoPagina);
  }

  return estilo;
}

function criarWhatsappLink(valor: string) {
  const numeros = valor.replace(/\D/g, "");

  if (!numeros) return "";

  return `https://wa.me/${numeros.startsWith("55") ? numeros : `55${numeros}`}`;
}

function criarMapsLink(endereco: string) {
  const enderecoLimpo = endereco.trim();

  if (!enderecoLimpo) return "";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    enderecoLimpo
  )}`;
}

function criarSeoLandingPage(empresa: EmpresaLanding, landingPage: LandingPageConfig) {
  const titulo =
    landingPage.seo.titulo.trim() ||
    landingPage.hero.titulo.trim() ||
    empresa.nome ||
    "Landing Page";
  const descricao = normalizeSeoDescription(
    landingPage.seo.descricao.trim() ||
    empresa.descricao ||
    landingPage.hero.subtitulo.trim() ||
    `Conheca ${titulo} na MikaON.`
  );
  const imagem =
    landingPage.seo.imagemCompartilhamento.trim() ||
    empresa.banner ||
    landingPage.hero.imagemDestaque.trim() ||
    empresa.logo ||
    "";
  const urlPublica = getPublicUrl(`/landing/${empresa.slug}`);

  return {
    title: titulo,
    description: descricao,
    author: empresa.nome || "MikaON",
    keywords: createSeoKeywords([
      landingPage.seo.palavrasChave,
      empresa.nome,
      empresa.categoria,
      empresa.descricao,
      landingPage.hero.titulo,
      landingPage.hero.subtitulo,
      landingPage.sobre.titulo,
      landingPage.sobre.texto,
    ]),
    image: imagem,
    favicon: empresa.logo || "",
    jsonLd: createBusinessJsonLd({
      name: empresa.nome || titulo,
      description: descricao,
      url: urlPublica,
      logo: empresa.logo,
      image: imagem,
      category: empresa.categoria,
      telephone: empresa.telefone,
      whatsapp: empresa.whatsapp,
      email: empresa.email,
      address: empresa.endereco,
      website: empresa.site,
      sameAs: [
        empresa.instagram,
        empresa.facebook,
        empresa.tiktok,
        empresa.youtube,
        empresa.kwai,
      ],
    }),
    manifestUrl: getManifestUrl(empresa.slug, "landing"),
    robots: landingPage.publicada ? "index,follow" as const : "noindex,nofollow" as const,
    themeColor: empresa.cor_principal || empresa.cor_botoes || "",
    url: urlPublica,
  };
}

export function PublicLandingPageContent({
  empresa,
  landingPage,
  exigirPublicacao = true,
}: {
  empresa: EmpresaLanding;
  landingPage: LandingPageConfig;
  exigirPublicacao?: boolean;
}) {
  const heroVisivel = temTexto(
    landingPage.hero.titulo,
    landingPage.hero.subtitulo,
    landingPage.hero.botaoTexto,
    landingPage.hero.botaoLink,
    landingPage.hero.imagemDestaque
  );
  const sobreVisivel = temTexto(
    landingPage.sobre.titulo,
    landingPage.sobre.texto,
    landingPage.sobre.imagem
  );
  const servicos = landingPage.servicos.filter((servico) =>
    temTexto(servico.titulo, servico.descricao)
  );
  const galeria = landingPage.galeria.filter((imagem) => imagem.url.trim());
  const depoimentos = landingPage.depoimentos.filter((depoimento) =>
    temTexto(depoimento.nome, depoimento.cargoEmpresa, depoimento.texto)
  );
  const audios = landingPage.audios.filter(
    (audio) => audio.visivel && audio.arquivoUrl.trim()
  );
  const produtosDigitais = landingPage.produtosDigitais.filter(
    (produto) =>
      produto.visivel &&
      temTexto(
        produto.titulo,
        produto.descricao,
        produto.preco,
        produto.imagemUrl,
        produto.linkCompra
      )
  );
  const categoriasProdutosDigitais = landingPage.categoriasProdutosDigitais
    .filter((categoria) =>
      produtosDigitais.some((produto) => produto.categoria === categoria)
    );
  const [categoriaProdutoAtiva, setCategoriaProdutoAtiva] = useState("todos");
  const categoriaProdutoAtivaValida =
    categoriaProdutoAtiva === "todos" ||
    categoriasProdutosDigitais.includes(categoriaProdutoAtiva);
  const categoriaProdutoSelecionada = categoriaProdutoAtivaValida
    ? categoriaProdutoAtiva
    : "todos";
  const produtosDigitaisFiltrados =
    categoriaProdutoSelecionada === "todos"
      ? produtosDigitais
      : produtosDigitais.filter(
          (produto) => produto.categoria === categoriaProdutoSelecionada
        );
  const contato = {
    telefone: landingPage.contato.telefone.trim() || empresa.telefone || "",
    whatsapp: landingPage.contato.whatsapp.trim() || empresa.whatsapp || "",
    email: landingPage.contato.email.trim() || empresa.email || "",
    endereco: landingPage.contato.endereco.trim() || empresa.endereco || "",
  };
  const camposFormularioContato = landingPageFormularioCampos.filter(
    (campo) => landingPage.formularioContato[campo.id]?.ativo
  );
  const contatoVisivel = temTexto(
    contato.telefone,
    contato.whatsapp,
    contato.email,
    contato.endereco
  ) || camposFormularioContato.length > 0;
  const ctaVisivel = temTexto(
    landingPage.cta.titulo,
    landingPage.cta.texto,
    landingPage.cta.botaoTexto,
    landingPage.cta.botaoLink
  );
  const possuiConteudo =
    (landingPage.visibilidadeSecoes.hero && heroVisivel) ||
    (landingPage.visibilidadeSecoes.sobre && sobreVisivel) ||
    (landingPage.visibilidadeSecoes.servicos && servicos.length > 0) ||
    (landingPage.visibilidadeSecoes.galeria && galeria.length > 0) ||
    (landingPage.visibilidadeSecoes.depoimentos && depoimentos.length > 0) ||
    (landingPage.visibilidadeSecoes.audios && audios.length > 0) ||
    (landingPage.visibilidadeSecoes.produtosDigitais &&
      produtosDigitais.length > 0) ||
    (landingPage.visibilidadeSecoes.contato && contatoVisivel) ||
    (landingPage.visibilidadeSecoes.cta && ctaVisivel);
  const estiloAparencia = criarEstiloAparencia(empresa);
  const whatsappLink = criarWhatsappLink(contato.whatsapp);
  const mapsLink = criarMapsLink(contato.endereco);
  const logoVisivel =
    empresa.logo &&
    empresa.logo_exibicao !== "hidden" &&
    empresa.logo_exibicao !== "oculto";
  const [leadEnviando, setLeadEnviando] = useState(false);
  const [leadMensagem, setLeadMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);

  async function enviarFormularioContato(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (leadEnviando) return;

    if (!exigirPublicacao) {
      setLeadMensagem({
        tipo: "erro",
        texto: "O envio fica ativo na Landing Page publicada.",
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const valores: Record<LandingPageFormularioCampoId, string> = {
      nome: String(formData.get("nome") || "").trim(),
      telefone: String(formData.get("telefone") || "").trim(),
      whatsapp: String(formData.get("whatsapp") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      mensagem: String(formData.get("mensagem") || "").trim(),
    };
    const campoObrigatorioVazio = camposFormularioContato.find(
      (campo) =>
        landingPage.formularioContato[campo.id]?.obrigatorio &&
        !valores[campo.id]
    );

    if (campoObrigatorioVazio) {
      setLeadMensagem({
        tipo: "erro",
        texto: `Preencha o campo ${campoObrigatorioVazio.label}.`,
      });
      return;
    }

    setLeadEnviando(true);
    setLeadMensagem(null);

    const { error } = await salvarLeadLandingPage({
      empresa_id: empresa.id,
      nome: valores.nome,
      telefone: valores.telefone,
      whatsapp: valores.whatsapp,
      email: valores.email,
      mensagem: valores.mensagem,
      origem: "landing_page",
      data_hora: new Date().toISOString(),
    });

    setLeadEnviando(false);

    if (error) {
      setLeadMensagem({
        tipo: "erro",
        texto:
          error.message ||
          "Nao foi possivel enviar sua mensagem agora. Tente novamente em alguns instantes.",
      });
      return;
    }

    event.currentTarget.reset();
    setLeadMensagem({
      tipo: "sucesso",
      texto: "Mensagem enviada com sucesso. Em breve entraremos em contato.",
    });
  }

  function renderizarSecao(secao: LandingPageSecaoConteudoId) {
    if (!landingPage.visibilidadeSecoes[secao]) {
      return null;
    }

    switch (secao) {
      case "hero":
        return heroVisivel ? (
          <section className="public-landing-hero" key="hero">
            <div className="public-landing-hero__content">
              <p className="public-landing-kicker">{empresa.categoria || "Landing Page"}</p>

              {landingPage.hero.titulo && (
                <h1>{landingPage.hero.titulo}</h1>
              )}

              {landingPage.hero.subtitulo && (
                <p>{landingPage.hero.subtitulo}</p>
              )}

              {landingPage.hero.botaoTexto && landingPage.hero.botaoLink && (
                <a className="public-landing-button" href={landingPage.hero.botaoLink}>
                  {landingPage.hero.botaoTexto}
                </a>
              )}
            </div>

            {landingPage.hero.imagemDestaque ? (
              <img
                className="public-landing-hero__image"
                src={landingPage.hero.imagemDestaque}
                alt={landingPage.hero.titulo || empresa.nome}
              />
            ) : empresa.banner ? (
              <img
                className="public-landing-hero__image"
                src={empresa.banner}
                alt={empresa.nome}
              />
            ) : null}
          </section>
        ) : null;
      case "sobre":
        return sobreVisivel ? (
          <section className="public-landing-section public-landing-about" key="sobre">
            {landingPage.sobre.imagem && (
              <img src={landingPage.sobre.imagem} alt={landingPage.sobre.titulo} />
            )}

            <div>
              {landingPage.sobre.titulo && <h2>{landingPage.sobre.titulo}</h2>}
              {landingPage.sobre.texto && <p>{landingPage.sobre.texto}</p>}
            </div>
          </section>
        ) : null;
      case "servicos":
        return servicos.length > 0 ? (
          <section className="public-landing-section" key="servicos">
            <div className="public-landing-section__heading">
              <span>Servicos</span>
              <h2>O que oferecemos</h2>
            </div>

            <div className="public-landing-grid">
              {servicos.map((servico, indice) => (
                <article className="public-landing-card" key={`${servico.titulo}-${indice}`}>
                  {servico.titulo && <h3>{servico.titulo}</h3>}
                  {servico.descricao && <p>{servico.descricao}</p>}
                </article>
              ))}
            </div>
          </section>
        ) : null;
      case "galeria":
        return galeria.length > 0 ? (
          <section className="public-landing-section" key="galeria">
            <div className="public-landing-section__heading">
              <span>Galeria</span>
              <h2>Imagens em destaque</h2>
            </div>

            <div className="public-landing-gallery">
              {galeria.map((imagem, indice) => (
                <img
                  key={`${imagem.url}-${indice}`}
                  src={imagem.url}
                  alt={imagem.alt || `Imagem ${indice + 1} de ${empresa.nome}`}
                />
              ))}
            </div>
          </section>
        ) : null;
      case "depoimentos":
        return depoimentos.length > 0 ? (
          <section className="public-landing-section" key="depoimentos">
            <div className="public-landing-section__heading">
              <span>Depoimentos</span>
              <h2>O que clientes dizem</h2>
            </div>

            <div className="public-landing-grid">
              {depoimentos.map((depoimento, indice) => (
                <article className="public-landing-card" key={`${depoimento.nome}-${indice}`}>
                  {depoimento.texto && <p>"{depoimento.texto}"</p>}
                  <footer>
                    {depoimento.nome && <strong>{depoimento.nome}</strong>}
                    {depoimento.cargoEmpresa && <span>{depoimento.cargoEmpresa}</span>}
                  </footer>
                </article>
              ))}
            </div>
          </section>
        ) : null;
      case "audios":
        return audios.length > 0 ? (
          <section className="public-landing-section" key="audios">
            <div className="public-landing-section__heading">
              <span>Audios</span>
              <h2>Ouça diretamente por aqui</h2>
            </div>

            <div className="public-landing-audio-list">
              {audios.map((audio, indice) => (
                <article
                  className="public-landing-audio-card"
                  key={`${audio.arquivoUrl}-${indice}`}
                >
                  <div>
                    {audio.titulo && <h3>{audio.titulo}</h3>}
                    {audio.descricao && <p>{audio.descricao}</p>}
                  </div>

                  <audio src={audio.arquivoUrl} controls preload="metadata">
                    Seu navegador nao suporta audio HTML5.
                  </audio>
                </article>
              ))}
            </div>
          </section>
        ) : null;
      case "produtosDigitais":
        return produtosDigitais.length > 0 ? (
          <section className="public-landing-section" key="produtosDigitais">
            <div className="public-landing-section__heading">
              <span>Produtos Digitais</span>
              <h2>Partituras e materiais</h2>
            </div>

            {categoriasProdutosDigitais.length > 0 && (
              <div className="public-landing-product-filters">
                <button
                  type="button"
                  className={
                    categoriaProdutoSelecionada === "todos"
                      ? "public-landing-product-filter public-landing-product-filter--active"
                      : "public-landing-product-filter"
                  }
                  onClick={() => setCategoriaProdutoAtiva("todos")}
                >
                  Todos
                </button>

                {categoriasProdutosDigitais.map((categoria) => (
                  <button
                    key={categoria}
                    type="button"
                    className={
                      categoriaProdutoSelecionada === categoria
                        ? "public-landing-product-filter public-landing-product-filter--active"
                        : "public-landing-product-filter"
                    }
                    onClick={() => setCategoriaProdutoAtiva(categoria)}
                  >
                    {categoria}
                  </button>
                ))}
              </div>
            )}

            <div className="public-landing-products">
              {produtosDigitaisFiltrados.map((produto, indice) => (
                <article
                  className="public-landing-product-card"
                  key={`${produto.titulo}-${indice}`}
                >
                  {produto.imagemUrl ? (
                    <img
                      src={produto.imagemUrl}
                      alt={produto.titulo || `Produto ${indice + 1}`}
                    />
                  ) : (
                    <div className="public-landing-product-card__placeholder">
                      Material digital
                    </div>
                  )}

                  <div className="public-landing-product-card__body">
                    {produto.titulo && <h3>{produto.titulo}</h3>}
                    {produto.descricao && <p>{produto.descricao}</p>}
                    {produto.preco && <strong>{produto.preco}</strong>}

                    {produto.linkCompra && (
                      <a
                        className="public-landing-button"
                        href={produto.linkCompra}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Comprar
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null;
      case "contato":
        return contatoVisivel ? (
          <section className="public-landing-section public-landing-contact" id="contato" key="contato">
            <div className="public-landing-section__heading">
              <span>Contato</span>
              <h2>Fale conosco</h2>
            </div>

            <div className="public-landing-contact__wrap">
              <div className="public-landing-contact__list">
                {contato.telefone && (
                  <a href={`tel:${contato.telefone.replace(/\D/g, "")}`}>
                    <span>Telefone</span>
                    <strong>{contato.telefone}</strong>
                  </a>
                )}

                {contato.whatsapp && (
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    <span>WhatsApp</span>
                    <strong>{contato.whatsapp}</strong>
                  </a>
                )}

                {contato.email && (
                  <a href={`mailto:${contato.email}`}>
                    <span>E-mail</span>
                    <strong>{contato.email}</strong>
                  </a>
                )}

                {contato.endereco && (
                  <a href={mapsLink} target="_blank" rel="noreferrer">
                    <span>Endereco</span>
                    <strong>{contato.endereco}</strong>
                  </a>
                )}
              </div>

              {camposFormularioContato.length > 0 && (
                <form
                  className="public-landing-contact__form"
                  onSubmit={enviarFormularioContato}
                >
                  {camposFormularioContato.map((campo) => {
                    const configCampo = landingPage.formularioContato[campo.id];

                    return (
                      <label key={campo.id}>
                        <span>
                          {campo.label}
                          {configCampo.obrigatorio && " *"}
                        </span>

                        {campo.type === "textarea" ? (
                          <textarea
                            name={campo.id}
                            required={configCampo.obrigatorio}
                            placeholder={campo.placeholder}
                            rows={4}
                          />
                        ) : (
                          <input
                            name={campo.id}
                            type={campo.type}
                            required={configCampo.obrigatorio}
                            placeholder={campo.placeholder}
                          />
                        )}
                      </label>
                    );
                  })}

                  {leadMensagem && (
                    <p
                      className={`public-landing-contact__feedback public-landing-contact__feedback--${leadMensagem.tipo}`}
                    >
                      {leadMensagem.texto}
                    </p>
                  )}

                  <button type="submit" disabled={leadEnviando}>
                    {leadEnviando ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </form>
              )}
            </div>
          </section>
        ) : null;
      case "cta":
        return ctaVisivel ? (
          <section className="public-landing-cta" key="cta">
            {landingPage.cta.titulo && <h2>{landingPage.cta.titulo}</h2>}
            {landingPage.cta.texto && <p>{landingPage.cta.texto}</p>}
            {landingPage.cta.botaoTexto && landingPage.cta.botaoLink && (
              <a className="public-landing-button" href={landingPage.cta.botaoLink}>
                {landingPage.cta.botaoTexto}
              </a>
            )}
          </section>
        ) : null;
      default:
        return null;
    }
  }

  const secoesOrdenadas: Array<ReactElement | null> = [];
  let grupoConteudo: LandingPageSecaoConteudoId[] = [];

  function adicionarGrupoConteudo() {
    if (grupoConteudo.length === 0) return;

    const secoesDoGrupo = [...grupoConteudo];

    secoesOrdenadas.push(
      <div
        className="public-landing-content"
        key={`grupo-${secoesOrdenadas.length}`}
      >
        {secoesDoGrupo.map((secao) => renderizarSecao(secao))}
      </div>
    );
    grupoConteudo = [];
  }

  landingPage.ordemSecoes.forEach((secao) => {
    if (secao === "hero") {
      adicionarGrupoConteudo();
      secoesOrdenadas.push(renderizarSecao(secao));
      return;
    }

    grupoConteudo.push(secao);
  });
  adicionarGrupoConteudo();

  if ((exigirPublicacao && !landingPage.publicada) || !possuiConteudo) {
    return (
      <main className="public-landing public-landing--center" style={estiloAparencia}>
        <section className="public-landing-message">
          {logoVisivel && (
            <img
              className="public-landing-message__logo"
              src={empresa.logo}
              alt={empresa.nome}
            />
          )}

          <h1>Landing Page nao publicada</h1>
          <p>
            {empresa.nome} ainda esta preparando esta pagina. Volte em breve.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="public-landing" style={estiloAparencia}>
      <header className="public-landing-header">
        <a className="public-landing-brand" href={`/${empresa.slug}`}>
          {logoVisivel && (
            <img src={empresa.logo} alt={empresa.nome} />
          )}
          <span>{empresa.nome}</span>
        </a>
      </header>

      {secoesOrdenadas}
    </main>
  );
}

export default function PublicLandingPage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaLanding | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarLandingPage() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarLandingPagePorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar Landing Page publica:", error);
      }

      setEmpresa(data as EmpresaLanding | null);
      setCarregando(false);
    }

    carregarLandingPage();
  }, [slug]);

  const landingPage = useMemo(
    () => normalizarLandingPageConfig(empresa?.landing_page_config),
    [empresa?.landing_page_config]
  );
  const landingPagePublica = useMemo(
    () =>
      landingPage.versaoPublicada
        ? {
            ...landingPage,
            ...landingPage.versaoPublicada,
          }
        : landingPage,
    [landingPage]
  );

  useEffect(() => {
    if (!empresa) return;

    const seo = criarSeoLandingPage(empresa, landingPagePublica);
    applySeoMetadata(seo);
  }, [empresa, landingPagePublica]);

  if (carregando) {
    return (
      <main className="public-landing public-landing--center">
        <p>Carregando Landing Page...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-landing public-landing--center">
        <section className="public-landing-message">
          <h1>Landing Page nao encontrada</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }
  return (
    <PublicLandingPageContent
      empresa={empresa}
      landingPage={landingPagePublica}
    />
  );
}
