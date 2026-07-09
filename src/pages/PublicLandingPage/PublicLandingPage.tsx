import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

type LandingPageConfig = {
  publicada: boolean;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  galeria: LandingPageGaleriaImagemConfig[];
  depoimentos: LandingPageDepoimentoConfig[];
  contato: LandingPageContatoConfig;
  cta: LandingPageCtaConfig;
};

type EmpresaLanding = Empresa & {
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
};

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
    heroVisivel ||
    sobreVisivel ||
    servicos.length > 0 ||
    galeria.length > 0 ||
    depoimentos.length > 0 ||
    contatoVisivel ||
    ctaVisivel;
  const estiloAparencia = criarEstiloAparencia(empresa);
  const whatsappLink = criarWhatsappLink(contato.whatsapp);
  const mapsLink = criarMapsLink(contato.endereco);
  const logoVisivel =
    empresa.logo &&
    empresa.logo_exibicao !== "hidden" &&
    empresa.logo_exibicao !== "oculto";

  if (!landingPage.publicada || !possuiConteudo) {
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

          <h1>Landing Page não publicada</h1>
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

      {heroVisivel && (
        <section className="public-landing-hero">
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
      )}

      <div className="public-landing-content">
        {sobreVisivel && (
          <section className="public-landing-section public-landing-about">
            {landingPage.sobre.imagem && (
              <img src={landingPage.sobre.imagem} alt={landingPage.sobre.titulo} />
            )}

            <div>
              {landingPage.sobre.titulo && <h2>{landingPage.sobre.titulo}</h2>}
              {landingPage.sobre.texto && <p>{landingPage.sobre.texto}</p>}
            </div>
          </section>
        )}

        {servicos.length > 0 && (
          <section className="public-landing-section">
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
        )}

        {galeria.length > 0 && (
          <section className="public-landing-section">
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
        )}

        {depoimentos.length > 0 && (
          <section className="public-landing-section">
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
        )}

        {contatoVisivel && (
          <section className="public-landing-section public-landing-contact" id="contato">
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
        )}

        {ctaVisivel && (
          <section className="public-landing-cta">
            {landingPage.cta.titulo && <h2>{landingPage.cta.titulo}</h2>}
            {landingPage.cta.texto && <p>{landingPage.cta.texto}</p>}
            {landingPage.cta.botaoTexto && landingPage.cta.botaoLink && (
              <a className="public-landing-button" href={landingPage.cta.botaoLink}>
                {landingPage.cta.botaoTexto}
              </a>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
