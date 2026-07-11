import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ExternalLink, Megaphone } from "lucide-react";
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
import "./PublicWifiMarketingPage.css";

type WifiMarketingConfig = {
  titulo: string;
  mensagem: string;
  imagemUrl: string;
  botaoTexto: string;
  botaoLink: string;
  ativo: boolean;
};

type EmpresaWifiMarketing = Empresa & {
  wifi_marketing_config?: unknown;
  recursos_contratados?: {
    wifi_marketing?: boolean;
  } | null;
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_area_principal?: string | null;
};

const wifiMarketingConfigPadrao: WifiMarketingConfig = {
  titulo: "",
  mensagem: "",
  imagemUrl: "",
  botaoTexto: "",
  botaoLink: "",
  ativo: false,
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function normalizarWifiMarketingConfig(valor: unknown): WifiMarketingConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return wifiMarketingConfigPadrao;
  }

  const config = valor as Record<string, unknown>;

  return {
    titulo: texto(config.titulo),
    mensagem: texto(config.mensagem),
    imagemUrl: texto(config.imagemUrl),
    botaoTexto: texto(config.botaoTexto),
    botaoLink: texto(config.botaoLink),
    ativo: typeof config.ativo === "boolean" ? config.ativo : false,
  };
}

function criarEstiloAparencia(empresa: EmpresaWifiMarketing): CSSProperties {
  const estilo = {} as CSSProperties & Record<string, string>;

  if (empresa.cor_principal) estilo["--wifi-primary"] = empresa.cor_principal;
  if (empresa.cor_secundaria) estilo["--wifi-secondary"] = empresa.cor_secundaria;
  if (empresa.cor_botoes) estilo["--wifi-button"] = empresa.cor_botoes;
  if (empresa.cor_texto_botoes) estilo["--wifi-button-text"] = empresa.cor_texto_botoes;
  if (empresa.cor_fundo_pagina) estilo["--wifi-background"] = empresa.cor_fundo_pagina;
  if (empresa.cor_area_principal) estilo["--wifi-surface"] = empresa.cor_area_principal;

  return estilo;
}

function possuiConteudoCampanha(campanha: WifiMarketingConfig) {
  return [
    campanha.titulo,
    campanha.mensagem,
    campanha.imagemUrl,
    campanha.botaoTexto,
    campanha.botaoLink,
  ].some((valor) => valor.trim());
}

function normalizarLinkDestino(valor: string) {
  const link = valor.trim();

  if (!link) return "";
  if (/^(https?:|mailto:|tel:|whatsapp:)/i.test(link)) return link;
  if (link.startsWith("/") || link.startsWith("#")) return link;

  return `https://${link}`;
}

function isLinkExterno(link: string) {
  return /^(https?:|mailto:|tel:|whatsapp:)/i.test(link);
}

function criarSeoWifiMarketing(
  empresa: EmpresaWifiMarketing,
  campanha: WifiMarketingConfig,
  campanhaPublicada: boolean
) {
  const tituloCampanha = campanha.titulo.trim();
  const titulo = tituloCampanha
    ? `${tituloCampanha} | ${empresa.nome || "MikaON"}`
    : `Wi-Fi Marketing de ${empresa.nome || "empresa"}`;
  const descricao = normalizeSeoDescription(
    campanha.mensagem ||
      empresa.descricao ||
      empresa.categoria ||
      `Confira a campanha de ${empresa.nome || "esta empresa"} na MikaON.`
  );
  const url = getPublicUrl(`/wifi/${empresa.slug}`);

  return {
    title: titulo,
    description: descricao,
    author: empresa.nome || "MikaON",
    keywords: createSeoKeywords([
      empresa.nome,
      empresa.categoria,
      "wifi marketing",
      "campanha",
      campanha.titulo,
    ]),
    image: campanha.imagemUrl || empresa.banner || empresa.logo || "",
    favicon: empresa.logo || "",
    jsonLd: createBusinessJsonLd({
      name: empresa.nome || titulo,
      description: descricao,
      url,
      logo: empresa.logo,
      image: campanha.imagemUrl || empresa.banner || empresa.logo,
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
    manifestUrl: getManifestUrl(empresa.slug, "wifi"),
    robots: campanhaPublicada ? ("index,follow" as const) : ("noindex,nofollow" as const),
    themeColor: empresa.cor_principal || empresa.cor_botoes || "",
    url,
  };
}

export default function PublicWifiMarketingPage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaWifiMarketing | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarCampanha() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar Wi-Fi Marketing publico:", error);
      }

      setEmpresa(data as EmpresaWifiMarketing | null);
      setCarregando(false);
    }

    carregarCampanha();
  }, [slug]);

  const campanha = useMemo(
    () => normalizarWifiMarketingConfig(empresa?.wifi_marketing_config),
    [empresa?.wifi_marketing_config]
  );
  const wifiMarketingContratado =
    empresa?.recursos_contratados?.wifi_marketing === true;
  const campanhaPublicada =
    Boolean(empresa) &&
    wifiMarketingContratado &&
    campanha.ativo &&
    possuiConteudoCampanha(campanha);
  const linkDestino = normalizarLinkDestino(campanha.botaoLink);
  const textoBotao = campanha.botaoTexto.trim() || "Acessar campanha";

  useEffect(() => {
    if (!empresa) return;

    applySeoMetadata(criarSeoWifiMarketing(empresa, campanha, campanhaPublicada));
  }, [empresa, campanha, campanhaPublicada]);

  if (carregando) {
    return (
      <main className="public-wifi public-wifi--center">
        <p>Carregando Wi-Fi Marketing...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-wifi public-wifi--center">
        <section className="public-wifi-message">
          <h1>Wi-Fi Marketing nao encontrado</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  if (!campanhaPublicada) {
    return (
      <main
        className="public-wifi public-wifi--center"
        style={criarEstiloAparencia(empresa)}
      >
        <section className="public-wifi-message">
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <h1>Wi-Fi Marketing indisponivel</h1>
          <p>{empresa.nome} ainda esta preparando a campanha.</p>
          <Link to={`/${empresa.slug}`}>Voltar para a pagina da empresa</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-wifi" style={criarEstiloAparencia(empresa)}>
      <header className="public-wifi-hero">
        <Link className="public-wifi-brand" to={`/${empresa.slug}`}>
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <span>{empresa.nome}</span>
        </Link>

        <div>
          <p>{empresa.categoria || "Wi-Fi Marketing"}</p>
          <h1>Wi-Fi Marketing</h1>
          {empresa.descricao && <span>{empresa.descricao}</span>}
        </div>
      </header>

      <section className="public-wifi-campaign" aria-label="Campanha ativa">
        {campanha.imagemUrl && (
          <div className="public-wifi-campaign__media">
            <img
              src={campanha.imagemUrl}
              alt={campanha.titulo || `Campanha de ${empresa.nome}`}
            />
          </div>
        )}

        <div className="public-wifi-campaign__content">
          <p>
            <Megaphone aria-hidden="true" size={16} strokeWidth={2.4} />
            Campanha ativa
          </p>
          <h2>{campanha.titulo || "Campanha"}</h2>
          {campanha.mensagem && <span>{campanha.mensagem}</span>}

          {linkDestino && (
            <a
              className="public-wifi-campaign__button"
              href={linkDestino}
              target={isLinkExterno(linkDestino) ? "_blank" : undefined}
              rel={isLinkExterno(linkDestino) ? "noreferrer" : undefined}
            >
              <ExternalLink aria-hidden="true" size={16} strokeWidth={2.4} />
              {textoBotao}
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
