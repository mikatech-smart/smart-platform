import {
  useEffect,
  useMemo,
  type CSSProperties,
  type FormEvent,
  useState,
} from "react";
import { CalendarCheck, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import type { Empresa } from "../../models/Empresa";
import {
  buscarEmpresaPorSlug,
  registrarLeadNoCrm,
} from "../../services/empresa/empresa.service";
import {
  applySeoMetadata,
  createBusinessJsonLd,
  createSeoKeywords,
  getManifestUrl,
  getPublicUrl,
  normalizeSeoDescription,
} from "../../utils/seo";

import "../PublicModulePage/PublicModulePage.css";
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

function obterTelefoneWhatsApp(empresa: EmpresaAgendamento) {
  const telefone = (empresa.whatsapp || empresa.telefone || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");

  return telefone
    ? telefone.startsWith("55")
      ? telefone
      : `55${telefone}`
    : "";
}

function criarLinkAgendamento(
  empresa: EmpresaAgendamento,
  servico: AgendamentoServicoConfig,
  dadosCliente: {
    nome: string;
    telefone: string;
    data: string;
    horario: string;
  }
) {
  const telefoneComPais = obterTelefoneWhatsApp(empresa);

  if (!telefoneComPais) return "";

  const mensagem = [
    `Ola, gostaria de solicitar um agendamento com ${empresa.nome}.`,
    `Servico: ${servico.nome || "Servico"}.`,
    servico.duracaoMinutos ? `Duracao: ${servico.duracaoMinutos} minutos.` : "",
    servico.valor ? `Valor informado: ${servico.valor}.` : "",
    `Nome: ${dadosCliente.nome}.`,
    `Telefone: ${dadosCliente.telefone}.`,
    `Data desejada: ${dadosCliente.data}.`,
    `Horario desejado: ${dadosCliente.horario}.`,
    "Aguardo confirmacao de disponibilidade.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${telefoneComPais}?text=${encodeURIComponent(mensagem)}`;
}

export default function PublicAgendamentoPage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaAgendamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [dataDesejada, setDataDesejada] = useState("");
  const [horarioDesejado, setHorarioDesejado] = useState("");
  const [erroSolicitacao, setErroSolicitacao] = useState("");

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
  const servicosAtivos = useMemo(
    () =>
      agendamento.servicos.filter(
        (servico) =>
          servico.ativo &&
          [
            servico.nome,
            servico.descricao,
            servico.duracaoMinutos,
            servico.valor,
          ].some((valor) => valor.trim())
      ),
    [agendamento.servicos]
  );
  const agendamentoContratado =
    empresa?.recursos_contratados?.agendamento === true;
  const servicoSelecionado =
    servicosAtivos.find((servico) => servico.id === servicoSelecionadoId) ||
    servicosAtivos[0];

  useEffect(() => {
    if (!servicoSelecionadoId && servicosAtivos[0]) {
      setServicoSelecionadoId(servicosAtivos[0].id);
    }
  }, [servicoSelecionadoId, servicosAtivos]);

  function selecionarServicoParaSolicitacao(servicoId: string) {
    setServicoSelecionadoId(servicoId);
    setErroSolicitacao("");

    window.setTimeout(() => {
      document.getElementById("solicitar-agendamento")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function enviarSolicitacaoAgendamento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!empresa || !servicoSelecionado) return;

    if (!obterTelefoneWhatsApp(empresa)) {
      setErroSolicitacao(
        "Esta empresa ainda nao possui WhatsApp ou telefone para receber solicitacoes."
      );
      return;
    }

    if (
      !nomeCliente.trim() ||
      !telefoneCliente.trim() ||
      !dataDesejada ||
      !horarioDesejado
    ) {
      setErroSolicitacao("Preencha nome, telefone, data e horario desejados.");
      return;
    }

    const link = criarLinkAgendamento(empresa, servicoSelecionado, {
      nome: nomeCliente.trim(),
      telefone: telefoneCliente.trim(),
      data: dataDesejada,
      horario: horarioDesejado,
    });

    if (!link) {
      setErroSolicitacao("Nao foi possivel gerar a mensagem para WhatsApp.");
      return;
    }

    const { error } = await registrarLeadNoCrm({
      empresaId: empresa.id,
      nome: nomeCliente.trim(),
      telefone: telefoneCliente.trim(),
      observacoes: [
        "Solicitacao de agendamento.",
        `Servico: ${servicoSelecionado.nome || "Servico"}.`,
        servicoSelecionado.duracaoMinutos
          ? `Duracao: ${servicoSelecionado.duracaoMinutos} minutos.`
          : "",
        servicoSelecionado.valor
          ? `Valor informado: ${servicoSelecionado.valor}.`
          : "",
        `Data desejada: ${dataDesejada}.`,
        `Horario desejado: ${horarioDesejado}.`,
      ]
        .filter(Boolean)
        .join(" "),
      origem: "agendamento",
      tags: ["agendamento", servicoSelecionado.nome],
    });

    if (error) {
      console.warn("Nao foi possivel registrar o lead do Agendamento no CRM:", error);
    }

    setErroSolicitacao("");
    window.open(link, "_blank", "noopener,noreferrer");
  }

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

      <section
        className="public-agendamento-request"
        id="solicitar-agendamento"
        aria-label="Solicitar agendamento"
      >
        <div>
          <p>Solicitacao de horario</p>
          <h2>Solicitar Agendamento</h2>
          <span>
            Informe seus dados e envie a solicitacao pelo WhatsApp. O horario
            sera confirmado pela equipe.
          </span>
        </div>

        <form onSubmit={enviarSolicitacaoAgendamento}>
          <label>
            <span>Servico</span>
            <select
              value={servicoSelecionado?.id || ""}
              onChange={(event) => {
                setServicoSelecionadoId(event.target.value);
                setErroSolicitacao("");
              }}
              required
            >
              {servicosAtivos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome || "Servico"}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Nome</span>
            <input
              type="text"
              value={nomeCliente}
              onChange={(event) => setNomeCliente(event.target.value)}
              placeholder="Seu nome"
              required
            />
          </label>

          <label>
            <span>Telefone</span>
            <input
              type="tel"
              value={telefoneCliente}
              onChange={(event) => setTelefoneCliente(event.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
          </label>

          <div className="public-agendamento-request__row">
            <label>
              <span>Data desejada</span>
              <input
                type="date"
                value={dataDesejada}
                onChange={(event) => setDataDesejada(event.target.value)}
                required
              />
            </label>

            <label>
              <span>Horario desejado</span>
              <input
                type="time"
                value={horarioDesejado}
                onChange={(event) => setHorarioDesejado(event.target.value)}
                required
              />
            </label>
          </div>

          {erroSolicitacao && (
            <p className="public-agendamento-request__error">
              {erroSolicitacao}
            </p>
          )}

          <button type="submit">
            <Send aria-hidden="true" size={16} strokeWidth={2.4} />
            Solicitar Agendamento
          </button>
        </form>
      </section>

      <section className="public-agendamento-content" aria-label="Servicos para agendamento">
        {servicosAtivos.map((servico, indice) => (
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

                <button
                    className="public-agendamento-service__button"
                    type="button"
                    onClick={() => selecionarServicoParaSolicitacao(servico.id)}
                  >
                    <CalendarCheck aria-hidden="true" size={16} strokeWidth={2.4} />
                    Solicitar Agendamento
                  </button>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}
