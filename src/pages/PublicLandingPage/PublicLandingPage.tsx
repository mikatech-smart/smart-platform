import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import { useParams } from "react-router-dom";

import type { Empresa } from "../../models/Empresa";
import { buscarLandingPagePorSlug } from "../../services/empresa/empresa.service";

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

export type LandingPageConfig = {
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
};

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
  recursos_contratados?: {
    landing_page?: boolean;
  } | null;
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
  contato: {
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
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
    "contato",
    "cta",
  ],
  visibilidadeSecoes: {
    hero: true,
    sobre: true,
    servicos: true,
    galeria: true,
    depoimentos: true,
    contato: true,
    cta: true,
  },
};

const landingPageOrdemSecoesPadrao = landingPageConfigPadrao.ordemSecoes;
const landingPageVisibilidadeSecoesPadrao =
  landingPageConfigPadrao.visibilidadeSecoes;

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

function normalizarLandingPageConfig(valor: unknown): LandingPageConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(landingPageConfigPadrao);
  }

  const config = valor as Partial<Record<keyof LandingPageConfig, unknown>>;

  return {
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
    contato: normalizarObjeto(config.contato, landingPageConfigPadrao.contato, [
      "telefone",
      "whatsapp",
      "email",
      "endereco",
    ]),
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

function atualizarMetaSeo(
  atributo: "name" | "property",
  chave: string,
  conteudo: string
) {
  const valor = conteudo.trim();
  const seletor = `meta[${atributo}="${chave}"]`;
  const metaExistente = document.head.querySelector<HTMLMetaElement>(seletor);

  if (!valor) {
    metaExistente?.remove();
    return;
  }

  const meta = metaExistente || document.createElement("meta");
  meta.setAttribute(atributo, chave);
  meta.setAttribute("content", valor);

  if (!metaExistente) {
    document.head.appendChild(meta);
  }
}

function criarSeoLandingPage(empresa: EmpresaLanding, landingPage: LandingPageConfig) {
  const titulo =
    landingPage.seo.titulo.trim() ||
    landingPage.hero.titulo.trim() ||
    empresa.nome ||
    "Landing Page";
  const descricao =
    landingPage.seo.descricao.trim() ||
    empresa.descricao ||
    landingPage.hero.subtitulo.trim() ||
    "";
  const imagem =
    landingPage.seo.imagemCompartilhamento.trim() ||
    empresa.logo ||
    empresa.banner ||
    landingPage.hero.imagemDestaque.trim() ||
    "";
  const urlPublica = typeof window !== "undefined" ? window.location.href : "";

  return {
    titulo,
    descricao,
    palavrasChave: landingPage.seo.palavrasChave.trim(),
    imagem,
    urlPublica,
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
  const contato = {
    telefone: landingPage.contato.telefone.trim() || empresa.telefone || "",
    whatsapp: landingPage.contato.whatsapp.trim() || empresa.whatsapp || "",
    email: landingPage.contato.email.trim() || empresa.email || "",
    endereco: landingPage.contato.endereco.trim() || empresa.endereco || "",
  };
  const contatoVisivel = temTexto(
    contato.telefone,
    contato.whatsapp,
    contato.email,
    contato.endereco
  );
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
    (landingPage.visibilidadeSecoes.contato && contatoVisivel) ||
    (landingPage.visibilidadeSecoes.cta && ctaVisivel);
  const estiloAparencia = criarEstiloAparencia(empresa);
  const whatsappLink = criarWhatsappLink(contato.whatsapp);
  const mapsLink = criarMapsLink(contato.endereco);
  const logoVisivel =
    empresa.logo &&
    empresa.logo_exibicao !== "hidden" &&
    empresa.logo_exibicao !== "oculto";

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
      case "contato":
        return contatoVisivel ? (
          <section className="public-landing-section public-landing-contact" id="contato" key="contato">
            <div className="public-landing-section__heading">
              <span>Contato</span>
              <h2>Fale conosco</h2>
            </div>

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

  useEffect(() => {
    if (!empresa) return;

    const seo = criarSeoLandingPage(empresa, landingPage);

    document.title = seo.titulo;
    atualizarMetaSeo("name", "description", seo.descricao);
    atualizarMetaSeo("name", "keywords", seo.palavrasChave);
    atualizarMetaSeo("property", "og:title", seo.titulo);
    atualizarMetaSeo("property", "og:description", seo.descricao);
    atualizarMetaSeo("property", "og:image", seo.imagem);
    atualizarMetaSeo("property", "og:type", "website");
    atualizarMetaSeo("property", "og:url", seo.urlPublica);
  }, [empresa, landingPage]);

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
      landingPage={landingPage}
    />
  );
}
