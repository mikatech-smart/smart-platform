import { useEffect, useMemo, type CSSProperties, useState } from "react";
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

import "./PublicAgendamentoPage.css";

type AgendamentoServicoConfig = {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: string;
  valor: string;
  ativo: boolean;
};

type AgendamentoConfig = {
  servicos: AgendamentoServicoConfig[];
};

type EmpresaAgendamento = Empresa & {
  agendamento_config?: unknown;
  recursos_contratados?: {
    agendamento?: boolean;
  } | null;
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_area_principal?: string | null;
};

const agendamentoConfigPadrao: AgendamentoConfig = {
  servicos: [],
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function normalizarAgendamentoConfig(valor: unknown): AgendamentoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return agendamentoConfigPadrao;
  }

  const config = valor as Record<string, unknown>;
  const servicos = Array.isArray(config.servicos)
    ? config.servicos.slice(0, 100).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            id: `servico-${indice + 1}`,
            nome: "",
            descricao: "",
            duracaoMinutos: "",
            valor: "",
            ativo: true,
          };
        }

        const servico = item as Record<string, unknown>;

        return {
          id: texto(servico.id) || `servico-${indice + 1}`,
          nome: texto(servico.nome),
          descricao: texto(servico.descricao),
          duracaoMinutos: texto(servico.duracaoMinutos) || texto(servico.duracao),
          valor: texto(servico.valor),
          ativo: typeof servico.ativo === "boolean" ? servico.ativo : true,
        };
      })
    : [];

  return { servicos };
}

function criarEstiloAparencia(empresa: EmpresaAgendamento): CSSProperties {
  const estilo = {} as CSSProperties & Record<string, string>;

  if (empresa.cor_principal) estilo["--schedule-primary"] = empresa.cor_principal;
  if (empresa.cor_secundaria) estilo["--schedule-secondary"] = empresa.cor_secundaria;
  if (empresa.cor_botoes) estilo["--schedule-button"] = empresa.cor_botoes;
  if (empresa.cor_texto_botoes) estilo["--schedule-button-text"] = empresa.cor_texto_botoes;
  if (empresa.cor_fundo_pagina) estilo["--schedule-background"] = empresa.cor_fundo_pagina;
  if (empresa.cor_area_principal) estilo["--schedule-surface"] = empresa.cor_area_principal;

  return estilo;
}

function criarSeoAgendamento(empresa: EmpresaAgendamento) {
  const titulo = `Agendamento de ${empresa.nome || "empresa"}`;
  const descricao = normalizeSeoDescription(
    empresa.descricao ||
      empresa.categoria ||
      `Veja os servicos disponiveis para agendamento de ${empresa.nome || "esta empresa"} na MikaON.`
  );
  const url = getPublicUrl(`/agendamento/${empresa.slug}`);

  return {
    title: titulo,
    description: descricao,
    author: empresa.nome || "MikaON",
    keywords: createSeoKeywords([
      empresa.nome,
      empresa.categoria,
      "agendamento",
      "servicos",
      "horarios",
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
    manifestUrl: getManifestUrl(empresa.slug, "agendamento"),
    robots: "index,follow" as const,
    themeColor: empresa.cor_principal || empresa.cor_botoes || "",
    url,
  };
}

function criarLinkAgendamento(empresa: EmpresaAgendamento, servico: AgendamentoServicoConfig) {
  const telefone = (empresa.whatsapp || empresa.telefone || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
  const telefoneComPais = telefone
    ? telefone.startsWith("55")
      ? telefone
      : `55${telefone}`
    : "";

  if (!telefoneComPais) return "";

  const mensagem = [
    `Ola, gostaria de agendar ${servico.nome || "um servico"} com ${empresa.nome}.`,
    servico.duracaoMinutos ? `Duracao: ${servico.duracaoMinutos} minutos.` : "",
    servico.valor ? `Valor informado: ${servico.valor}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `https://wa.me/${telefoneComPais}?text=${encodeURIComponent(mensagem)}`;
}

export default function PublicAgendamentoPage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaAgendamento | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarAgendamento() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar agendamento publico:", error);
      }

      setEmpresa(data as EmpresaAgendamento | null);
      setCarregando(false);
    }

    carregarAgendamento();
  }, [slug]);

  useEffect(() => {
    if (!empresa) return;

    applySeoMetadata(criarSeoAgendamento(empresa));
  }, [empresa]);

  const agendamento = useMemo(
    () => normalizarAgendamentoConfig(empresa?.agendamento_config),
    [empresa?.agendamento_config]
  );
  const servicosAtivos = agendamento.servicos.filter(
    (servico) =>
      servico.ativo &&
      [
        servico.nome,
        servico.descricao,
        servico.duracaoMinutos,
        servico.valor,
      ].some((valor) => valor.trim())
  );
  const agendamentoContratado =
    empresa?.recursos_contratados?.agendamento === true;

  if (carregando) {
    return (
      <main className="public-agendamento public-agendamento--center">
        <p>Carregando agendamento...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-agendamento public-agendamento--center">
        <section className="public-agendamento-message">
          <h1>Agendamento nao encontrado</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  if (!agendamentoContratado || servicosAtivos.length === 0) {
    return (
      <main
        className="public-agendamento public-agendamento--center"
        style={criarEstiloAparencia(empresa)}
      >
        <section className="public-agendamento-message">
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <h1>Agendamento indisponivel</h1>
          <p>{empresa.nome} ainda esta preparando os servicos para agendamento.</p>
          <Link to={`/${empresa.slug}`}>Voltar para a pagina da empresa</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-agendamento" style={criarEstiloAparencia(empresa)}>
      <header className="public-agendamento-hero">
        <Link className="public-agendamento-brand" to={`/${empresa.slug}`}>
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <span>{empresa.nome}</span>
        </Link>

        <div>
          <p>{empresa.categoria || "Agendamento"}</p>
          <h1>Agendamento</h1>
          {empresa.descricao && <span>{empresa.descricao}</span>}
        </div>
      </header>

      <section className="public-agendamento-content" aria-label="Servicos para agendamento">
        {servicosAtivos.map((servico, indice) => {
          const linkAgendamento = criarLinkAgendamento(empresa, servico);

          return (
            <article className="public-agendamento-service" key={servico.id}>
              <div className="public-agendamento-service__index">
                {String(indice + 1).padStart(2, "0")}
              </div>

              <div>
                <h2>{servico.nome || "Servico"}</h2>
                {servico.descricao && <p>{servico.descricao}</p>}

                <dl>
                  {servico.duracaoMinutos && (
                    <div>
                      <dt>Duracao</dt>
                      <dd>{servico.duracaoMinutos} min</dd>
                    </div>
                  )}

                  {servico.valor && (
                    <div>
                      <dt>Valor</dt>
                      <dd>{servico.valor}</dd>
                    </div>
                  )}
                </dl>

                {linkAgendamento && (
                  <a
                    className="public-agendamento-service__button"
                    href={linkAgendamento}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Agendar
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
