import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Gift, Stamp } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import type { Empresa } from "../../models/Empresa";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  applySeoMetadata,
  createBusinessJsonLd,
  createSeoKeywords,
  getManifestUrl,
  getPublicUrl,
  normalizeSeoDescription,
} from "../../utils/seo";

import "../PublicModulePage/PublicModulePage.css";
import "./PublicFidelidadePage.css";

type FidelidadeConfig = {
  titulo: string;
  descricao: string;
  recompensa: string;
  quantidade: string;
  tipoAcumulo: "pontos" | "carimbos";
  ativo: boolean;
};

type EmpresaFidelidade = Empresa & {
  fidelidade_config?: unknown;
  recursos_contratados?: {
    fidelidade?: boolean;
  } | null;
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_area_principal?: string | null;
};

const fidelidadeConfigPadrao: FidelidadeConfig = {
  titulo: "",
  descricao: "",
  recompensa: "",
  quantidade: "",
  tipoAcumulo: "carimbos",
  ativo: false,
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function normalizarFidelidadeConfig(valor: unknown): FidelidadeConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return fidelidadeConfigPadrao;
  }

  const config = valor as Record<string, unknown>;
  const tipoAcumulo = texto(config.tipoAcumulo);

  return {
    titulo: texto(config.titulo),
    descricao: texto(config.descricao),
    recompensa: texto(config.recompensa),
    quantidade:
      texto(config.quantidade) ||
      texto(config.quantidadePontos) ||
      texto(config.quantidadeCarimbos),
    tipoAcumulo: tipoAcumulo === "pontos" ? "pontos" : "carimbos",
    ativo: typeof config.ativo === "boolean" ? config.ativo : false,
  };
}

function criarEstiloAparencia(empresa: EmpresaFidelidade): CSSProperties {
  const estilo = {} as CSSProperties & Record<string, string>;

  if (empresa.cor_principal) estilo["--loyalty-primary"] = empresa.cor_principal;
  if (empresa.cor_secundaria) estilo["--loyalty-secondary"] = empresa.cor_secundaria;
  if (empresa.cor_botoes) estilo["--loyalty-button"] = empresa.cor_botoes;
  if (empresa.cor_texto_botoes) estilo["--loyalty-button-text"] = empresa.cor_texto_botoes;
  if (empresa.cor_fundo_pagina) estilo["--loyalty-background"] = empresa.cor_fundo_pagina;
  if (empresa.cor_area_principal) estilo["--loyalty-surface"] = empresa.cor_area_principal;

  return estilo;
}

function possuiConteudoFidelidade(config: FidelidadeConfig) {
  return [
    config.titulo,
    config.descricao,
    config.recompensa,
    config.quantidade,
  ].some((valor) => valor.trim());
}

function rotuloTipoAcumulo(config: FidelidadeConfig) {
  return config.tipoAcumulo === "pontos" ? "pontos" : "carimbos";
}

function criarSeoFidelidade(
  empresa: EmpresaFidelidade,
  config: FidelidadeConfig,
  publicada: boolean
) {
  const tituloPrograma = config.titulo.trim();
  const titulo = tituloPrograma
    ? `${tituloPrograma} | ${empresa.nome || "MikaON"}`
    : `Programa de Fidelidade de ${empresa.nome || "empresa"}`;
  const descricao = normalizeSeoDescription(
    config.descricao ||
      empresa.descricao ||
      empresa.categoria ||
      `Confira o programa de fidelidade de ${empresa.nome || "esta empresa"} na MikaON.`
  );
  const url = getPublicUrl(`/fidelidade/${empresa.slug}`);

  return {
    title: titulo,
    description: descricao,
    author: empresa.nome || "MikaON",
    keywords: createSeoKeywords([
      empresa.nome,
      empresa.categoria,
      "programa de fidelidade",
      "pontos",
      "carimbos",
      config.titulo,
      config.recompensa,
    ]),
    image: empresa.banner || empresa.logo || "",
    favicon: empresa.logo || "",
    jsonLd: createBusinessJsonLd({
      name: empresa.nome || titulo,
      description: descricao,
      url,
      logo: empresa.logo,
      image: empresa.banner || empresa.logo,
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
    manifestUrl: getManifestUrl(empresa.slug, "fidelidade"),
    robots: publicada ? ("index,follow" as const) : ("noindex,nofollow" as const),
    themeColor: empresa.cor_principal || empresa.cor_botoes || "",
    url,
  };
}

export default function PublicFidelidadePage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaFidelidade | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarFidelidade() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar programa de fidelidade publico:", error);
      }

      setEmpresa(data as EmpresaFidelidade | null);
      setCarregando(false);
    }

    carregarFidelidade();
  }, [slug]);

  const fidelidade = useMemo(
    () => normalizarFidelidadeConfig(empresa?.fidelidade_config),
    [empresa?.fidelidade_config]
  );
  const fidelidadeContratada =
    empresa?.recursos_contratados?.fidelidade === true;
  const programaPublicado =
    Boolean(empresa) &&
    fidelidadeContratada &&
    fidelidade.ativo &&
    possuiConteudoFidelidade(fidelidade);
  const tipoAcumulo = rotuloTipoAcumulo(fidelidade);

  useEffect(() => {
    if (!empresa) return;

    applySeoMetadata(criarSeoFidelidade(empresa, fidelidade, programaPublicado));
  }, [empresa, fidelidade, programaPublicado]);

  if (carregando) {
    return (
      <main className="public-fidelidade public-fidelidade--center">
        <p>Carregando programa de fidelidade...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-fidelidade public-fidelidade--center">
        <section className="public-fidelidade-message">
          <h1>Programa de Fidelidade nao encontrado</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  if (!programaPublicado) {
    return (
      <main
        className="public-fidelidade public-fidelidade--center"
        style={criarEstiloAparencia(empresa)}
      >
        <section className="public-fidelidade-message">
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <h1>Programa de Fidelidade indisponivel</h1>
          <p>{empresa.nome} ainda esta preparando a campanha.</p>
          <Link to={`/${empresa.slug}`}>Voltar para a pagina da empresa</Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className="public-fidelidade"
      style={criarEstiloAparencia(empresa)}
    >
      <header className="public-fidelidade-hero">
        <Link className="public-fidelidade-brand" to={`/${empresa.slug}`}>
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <span>{empresa.nome}</span>
        </Link>

        <div>
          <p>{empresa.categoria || "Programa de Fidelidade"}</p>
          <h1>Programa de Fidelidade</h1>
          {empresa.descricao && <span>{empresa.descricao}</span>}
        </div>
      </header>

      <section
        className="public-fidelidade-campaign"
        aria-label="Campanha de fidelidade ativa"
      >
        <div className="public-fidelidade-campaign__badge">
          <Gift aria-hidden="true" size={28} strokeWidth={2.3} />
        </div>

        <div className="public-fidelidade-campaign__content">
          <p>
            <Stamp aria-hidden="true" size={16} strokeWidth={2.4} />
            Campanha ativa
          </p>
          <h2>{fidelidade.titulo || "Programa de Fidelidade"}</h2>
          {fidelidade.descricao && <span>{fidelidade.descricao}</span>}

          <dl className="public-fidelidade-campaign__details">
            {fidelidade.quantidade && (
              <div>
                <dt>Meta</dt>
                <dd>
                  {fidelidade.quantidade} {tipoAcumulo}
                </dd>
              </div>
            )}

            {fidelidade.recompensa && (
              <div>
                <dt>Recompensa</dt>
                <dd>{fidelidade.recompensa}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </main>
  );
}
