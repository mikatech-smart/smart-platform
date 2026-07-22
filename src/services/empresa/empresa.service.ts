import { supabase } from "../../lib/supabase";
import { isPlatformEnvironment } from "../../auth/RuntimeEnvironment";
import type { Empresa } from "../../models/Empresa";

const recursosContratadosPadrao = {
  pagina_publica: true,
  painel_cliente: true,
  landing_page: false,
  dominio_personalizado: false,
  cardapio_digital: false,
  catalogo: false,
  agendamento: false,
  wifi_marketing: false,
  fidelidade: false,
  crm: false,
  erp_pdv: false,
  wifi: false,
  google_reviews: false,
  nfc: true,
  qr_code: true,
};

function erroColunaLandingPageConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("landing_page_config") ||
    (error.code === "PGRST204" && mensagem.includes("landing"))
  );
}

function erroColunaCardapioConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("cardapio_config") ||
    (error.code === "PGRST204" && mensagem.includes("cardapio"))
  );
}

function erroColunaCatalogoConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("catalogo_config") ||
    (error.code === "PGRST204" && mensagem.includes("catalogo"))
  );
}

function erroColunaAgendamentoConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("agendamento_config") ||
    (error.code === "PGRST204" && mensagem.includes("agendamento"))
  );
}

function erroColunaWifiMarketingConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("wifi_marketing_config") ||
    (error.code === "PGRST204" && mensagem.includes("wifi_marketing")) ||
    (error.code === "PGRST204" && mensagem.includes("wifi marketing"))
  );
}

function erroColunaFidelidadeConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("fidelidade_config") ||
    (error.code === "PGRST204" && mensagem.includes("fidelidade"))
  );
}

function erroColunaCrmConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("crm_config") ||
    (error.code === "PGRST204" && mensagem.includes("crm"))
  );
}

function erroColunaIaConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("ia_config") ||
    (error.code === "PGRST204" && mensagem.includes("ia_config")) ||
    (error.code === "PGRST204" && mensagem.includes("assistente"))
  );
}

function erroColunaErpPdvConfig(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    mensagem.includes("erp_pdv_config") ||
    (error.code === "PGRST204" && mensagem.includes("erp_pdv")) ||
    (error.code === "PGRST204" && mensagem.includes("erp pdv"))
  );
}

const colunasConfigOpcionais = [
  {
    campo: "erp_pdv_config",
    erro: erroColunaErpPdvConfig,
    nome: "ERP/PDV",
  },
  {
    campo: "ia_config",
    erro: erroColunaIaConfig,
    nome: "Assistente de IA",
  },
  {
    campo: "crm_config",
    erro: erroColunaCrmConfig,
    nome: "CRM",
  },
  {
    campo: "fidelidade_config",
    erro: erroColunaFidelidadeConfig,
    nome: "Programa de Fidelidade",
  },
  {
    campo: "wifi_marketing_config",
    erro: erroColunaWifiMarketingConfig,
    nome: "Wi-Fi Marketing",
  },
  {
    campo: "agendamento_config",
    erro: erroColunaAgendamentoConfig,
    nome: "Agendamento",
  },
  {
    campo: "catalogo_config",
    erro: erroColunaCatalogoConfig,
    nome: "Catalogo",
  },
  {
    campo: "cardapio_config",
    erro: erroColunaCardapioConfig,
    nome: "Cardapio Digital",
  },
  {
    campo: "landing_page_config",
    erro: erroColunaLandingPageConfig,
    nome: "Landing Page",
  },
] as const;

function erroEstruturaLeads(error: { message?: string; code?: string }) {
  const mensagem = error.message?.toLowerCase() || "";

  return (
    error.code === "42P01" ||
    error.code === "PGRST204" ||
    mensagem.includes("leads") ||
    mensagem.includes("schema cache")
  );
}

export type LandingPageLeadPayload = {
  empresa_id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  email: string;
  mensagem: string;
  origem: "landing_page";
  data_hora: string;
};

export type CrmLeadOrigem =
  | "landing_page"
  | "catalogo"
  | "agendamento"
  | "fidelidade";

export type CrmLeadPayload = {
  empresaId: string;
  nome: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  origem: CrmLeadOrigem;
  tags?: string[];
  status?: "prospect" | "ativo" | "inativo";
};

type CrmPipelineEtapa =
  | "novo_lead"
  | "em_atendimento"
  | "proposta"
  | "fechado"
  | "perdido";

type CrmInteracaoOrigem =
  | CrmLeadOrigem
  | "manual"
  | "sistema"
  | "whatsapp"
  | "telefone"
  | "email"
  | "reuniao";

type CrmInteracaoConfig = {
  id: string;
  texto: string;
  origem: CrmInteracaoOrigem;
  dataHora: string;
};

type CrmTarefaPrioridade = "baixa" | "media" | "alta";

type CrmTarefaStatus = "pendente" | "concluida";

type CrmTarefaConfig = {
  id: string;
  titulo: string;
  descricao: string;
  vencimento: string;
  prioridade: CrmTarefaPrioridade;
  status: CrmTarefaStatus;
  criadoEm?: string;
  concluidoEm?: string;
};

type CrmAutomacaoEvento =
  | "novo_lead"
  | "mudanca_etapa"
  | "tarefa_vencida";

type CrmAutomacaoAcao =
  | "registrar_historico"
  | "preparar_whatsapp"
  | "preparar_email";

type CrmAutomacaoConfig = {
  id: string;
  evento: CrmAutomacaoEvento;
  titulo: string;
  mensagem: string;
  acao: CrmAutomacaoAcao;
  ativa: boolean;
};

type CrmClienteConfig = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  observacoes: string;
  tags: string[];
  status: "prospect" | "ativo" | "inativo";
  etapaPipeline: CrmPipelineEtapa;
  origem?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  movimentadoEm?: string;
  interacoes: CrmInteracaoConfig[];
  tarefas: CrmTarefaConfig[];
};

type CrmConfig = {
  clientes: CrmClienteConfig[];
  automacoes: CrmAutomacaoConfig[];
};

const crmAutomacoesPadrao: CrmAutomacaoConfig[] = [
  {
    id: "automacao-novo-lead",
    evento: "novo_lead",
    titulo: "Boas-vindas ao novo lead",
    mensagem:
      "Lead recebido no CRM. Proxima acao sugerida: iniciar atendimento.",
    acao: "registrar_historico",
    ativa: true,
  },
  {
    id: "automacao-mudanca-etapa",
    evento: "mudanca_etapa",
    titulo: "Acompanhamento de pipeline",
    mensagem: "Lead movimentado no pipeline. Revisar proximos passos.",
    acao: "registrar_historico",
    ativa: true,
  },
  {
    id: "automacao-tarefa-vencida",
    evento: "tarefa_vencida",
    titulo: "Tarefa vencida",
    mensagem:
      "Existe tarefa pendente vencida. Priorize o contato com este lead.",
    acao: "registrar_historico",
    ativa: true,
  },
];

function normalizarContatoLead(valor?: string) {
  return String(valor || "").trim();
}

function normalizarTelefoneLead(valor?: string) {
  return normalizarContatoLead(valor).replace(/\D/g, "");
}

function normalizarEmailLead(valor?: string) {
  return normalizarContatoLead(valor).toLowerCase();
}

function normalizarTagsLead(tags?: string[]) {
  return Array.from(
    new Set(
      (tags || [])
        .map((tag) => normalizarContatoLead(tag))
        .filter(Boolean)
    )
  ).slice(0, 20);
}

function normalizarCrmPipelineEtapa(valor: unknown): CrmPipelineEtapa {
  const etapas: CrmPipelineEtapa[] = [
    "novo_lead",
    "em_atendimento",
    "proposta",
    "fechado",
    "perdido",
  ];

  return etapas.includes(valor as CrmPipelineEtapa)
    ? (valor as CrmPipelineEtapa)
    : "novo_lead";
}

function normalizarCrmInteracoes(valor: unknown): CrmInteracaoConfig[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .slice(0, 100)
    .map((item, indice) => {
      const interacao =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      const origem: CrmInteracaoOrigem =
        interacao.origem === "landing_page" ||
        interacao.origem === "catalogo" ||
        interacao.origem === "agendamento" ||
        interacao.origem === "fidelidade" ||
        interacao.origem === "sistema" ||
        interacao.origem === "whatsapp" ||
        interacao.origem === "telefone" ||
        interacao.origem === "email" ||
        interacao.origem === "reuniao"
          ? interacao.origem
          : "manual";

      return {
        id:
          typeof interacao.id === "string" && interacao.id.trim()
            ? interacao.id
            : `interacao-${indice + 1}`,
        texto:
          typeof interacao.texto === "string"
            ? interacao.texto
            : typeof interacao.anotacao === "string"
              ? interacao.anotacao
              : "",
        origem,
        dataHora:
          typeof interacao.dataHora === "string"
            ? interacao.dataHora
            : typeof interacao.criadoEm === "string"
              ? interacao.criadoEm
              : "",
      };
    })
    .filter((interacao) => interacao.texto.trim())
    .sort((a, b) => {
      const dataA = new Date(a.dataHora).getTime();
      const dataB = new Date(b.dataHora).getTime();

      return (
        (Number.isNaN(dataA) ? 0 : dataA) -
        (Number.isNaN(dataB) ? 0 : dataB)
      );
    });
}

function normalizarCrmTarefaPrioridade(valor: unknown): CrmTarefaPrioridade {
  return valor === "media" || valor === "alta" ? valor : "baixa";
}

function normalizarCrmTarefaStatus(valor: unknown): CrmTarefaStatus {
  return valor === "concluida" ? "concluida" : "pendente";
}

function ordenarCrmTarefas(tarefas: CrmTarefaConfig[]) {
  return [...tarefas].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pendente" ? -1 : 1;

    const dataA = new Date(a.vencimento).getTime();
    const dataB = new Date(b.vencimento).getTime();

    return (
      (Number.isNaN(dataA) ? 0 : dataA) -
      (Number.isNaN(dataB) ? 0 : dataB)
    );
  });
}

function normalizarCrmTarefas(valor: unknown): CrmTarefaConfig[] {
  if (!Array.isArray(valor)) return [];

  return ordenarCrmTarefas(
    valor
      .slice(0, 100)
      .map((item, indice) => {
        const tarefa =
          item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};

        return {
          id:
            typeof tarefa.id === "string" && tarefa.id.trim()
              ? tarefa.id
              : `tarefa-${indice + 1}`,
          titulo:
            typeof tarefa.titulo === "string"
              ? tarefa.titulo
              : typeof tarefa.nome === "string"
                ? tarefa.nome
                : "",
          descricao:
            typeof tarefa.descricao === "string" ? tarefa.descricao : "",
          vencimento:
            typeof tarefa.vencimento === "string"
              ? tarefa.vencimento
              : typeof tarefa.dataVencimento === "string"
                ? tarefa.dataVencimento
                : "",
          prioridade: normalizarCrmTarefaPrioridade(tarefa.prioridade),
          status: normalizarCrmTarefaStatus(tarefa.status),
          criadoEm:
            typeof tarefa.criadoEm === "string" ? tarefa.criadoEm : "",
          concluidoEm:
            typeof tarefa.concluidoEm === "string" ? tarefa.concluidoEm : "",
        };
      })
      .filter((tarefa) => tarefa.titulo.trim())
  );
}

function normalizarCrmAutomacaoEvento(valor: unknown): CrmAutomacaoEvento {
  return valor === "mudanca_etapa" || valor === "tarefa_vencida"
    ? valor
    : "novo_lead";
}

function normalizarCrmAutomacaoAcao(valor: unknown): CrmAutomacaoAcao {
  return valor === "preparar_whatsapp" || valor === "preparar_email"
    ? valor
    : "registrar_historico";
}

function normalizarCrmAutomacoes(valor: unknown): CrmAutomacaoConfig[] {
  if (!Array.isArray(valor)) {
    return crmAutomacoesPadrao.map((automacao) => ({ ...automacao }));
  }

  const automacoes = valor
    .slice(0, 20)
    .map((item, indice) => {
      const automacao =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      const evento = normalizarCrmAutomacaoEvento(automacao.evento);
      const automacaoPadrao = crmAutomacoesPadrao.find(
        (padrao) => padrao.evento === evento
      );

      return {
        id:
          typeof automacao.id === "string" && automacao.id.trim()
            ? automacao.id
            : `automacao-${indice + 1}`,
        evento,
        titulo:
          typeof automacao.titulo === "string" && automacao.titulo.trim()
            ? automacao.titulo
            : automacaoPadrao?.titulo || "Automacao CRM",
        mensagem:
          typeof automacao.mensagem === "string" &&
          automacao.mensagem.trim()
            ? automacao.mensagem
            : automacaoPadrao?.mensagem || "Automacao registrada no CRM.",
        acao: normalizarCrmAutomacaoAcao(automacao.acao),
        ativa:
          typeof automacao.ativa === "boolean"
            ? automacao.ativa
            : automacaoPadrao?.ativa ?? true,
      };
    })
    .filter((automacao) => automacao.titulo.trim());

  return crmAutomacoesPadrao.map((automacaoPadrao) => {
    const automacaoSalva = automacoes.find(
      (automacao) => automacao.evento === automacaoPadrao.evento
    );

    return automacaoSalva || { ...automacaoPadrao };
  });
}

function criarCrmInteracoesAutomacao(
  automacoes: CrmAutomacaoConfig[],
  evento: CrmAutomacaoEvento,
  contexto: string
): CrmInteracaoConfig[] {
  const agora = new Date().toISOString();

  return automacoes
    .filter((automacao) => automacao.ativa && automacao.evento === evento)
    .map((automacao, indice) => ({
      id: `interacao-automacao-${Date.now()}-${indice}`,
      texto: `[Automacao: ${automacao.titulo}] ${automacao.mensagem} ${contexto}`.trim(),
      origem: "sistema" as CrmInteracaoOrigem,
      dataHora: agora,
    }));
}

function normalizarCrmConfig(valor: unknown): CrmConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return {
      clientes: [],
      automacoes: crmAutomacoesPadrao.map((automacao) => ({ ...automacao })),
    };
  }

  const config = valor as Record<string, unknown>;
  const clientes = Array.isArray(config.clientes)
    ? config.clientes.slice(0, 500).map((item, indice) => {
        const cliente =
          item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
        const tags = Array.isArray(cliente.tags)
          ? cliente.tags
              .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
              .filter(Boolean)
          : [];
        const status: CrmClienteConfig["status"] =
          cliente.status === "ativo" || cliente.status === "inativo"
            ? cliente.status
            : "prospect";

        return {
          id:
            typeof cliente.id === "string" && cliente.id.trim()
              ? cliente.id
              : `cliente-${indice + 1}`,
          nome: typeof cliente.nome === "string" ? cliente.nome : "",
          telefone:
            typeof cliente.telefone === "string" ? cliente.telefone : "",
          email: typeof cliente.email === "string" ? cliente.email : "",
          observacoes:
            typeof cliente.observacoes === "string"
              ? cliente.observacoes
              : "",
          tags,
          status,
          etapaPipeline: normalizarCrmPipelineEtapa(
            cliente.etapaPipeline || cliente.pipeline
          ),
          origem: typeof cliente.origem === "string" ? cliente.origem : "",
          criadoEm: typeof cliente.criadoEm === "string" ? cliente.criadoEm : "",
          atualizadoEm:
            typeof cliente.atualizadoEm === "string"
              ? cliente.atualizadoEm
              : "",
          movimentadoEm:
            typeof cliente.movimentadoEm === "string"
              ? cliente.movimentadoEm
              : "",
          interacoes: normalizarCrmInteracoes(cliente.interacoes),
          tarefas: normalizarCrmTarefas(cliente.tarefas),
        };
      })
    : [];

  return {
    clientes,
    automacoes: normalizarCrmAutomacoes(config.automacoes),
  };
}

function mesclarTextoObservacao(atual: string, novo: string) {
  const observacaoAtual = normalizarContatoLead(atual);
  const novaObservacao = normalizarContatoLead(novo);

  if (!novaObservacao) return observacaoAtual;
  if (!observacaoAtual) return novaObservacao;
  if (observacaoAtual.includes(novaObservacao)) return observacaoAtual;

  return `${observacaoAtual}\n${novaObservacao}`;
}

function mesclarOrigemLead(atual: string | undefined, origem: CrmLeadOrigem) {
  const origens = normalizarTagsLead([
    ...(atual || "").split(","),
    origem,
  ]);

  return origens.join(", ");
}

export async function buscarEmpresaPorSlug(slug: string) {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("slug", slug)
    .single();

  return {
    data,
    error,
  };
}

export async function buscarLandingPagePorSlug(slug: string) {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("slug", slug)
    .single();

  return {
    data,
    error,
  };
}

export async function salvarLeadLandingPage(dados: LandingPageLeadPayload) {
  const { data, error } = await supabase
    .from("leads")
    .insert(dados)
    .select()
    .single();

  if (error) {
    if (erroEstruturaLeads(error)) {
      return {
        data: null,
        error: {
          ...error,
          message:
            "A tabela leads ainda nao esta configurada no Supabase para receber contatos da Landing Page.",
        },
      };
    }

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function registrarLeadNoCrm(payload: CrmLeadPayload) {
  const empresaId = normalizarContatoLead(payload.empresaId);

  if (!empresaId) {
    return {
      data: null,
      error: {
        message: "Empresa nao informada para registrar o lead no CRM.",
      },
    };
  }

  const { data: empresa, error: erroEmpresa } = await buscarEmpresaPorId(empresaId);

  if (erroEmpresa || !empresa) {
    return {
      data: null,
      error:
        erroEmpresa || {
          message: "Empresa nao encontrada para registrar o lead no CRM.",
        },
    };
  }

  const agora = new Date().toISOString();
  const crmConfig = normalizarCrmConfig((empresa as Empresa).crm_config);
  const telefoneNormalizado = normalizarTelefoneLead(payload.telefone);
  const emailNormalizado = normalizarEmailLead(payload.email);
  const indiceExistente = crmConfig.clientes.findIndex((cliente) => {
    const telefoneCliente = normalizarTelefoneLead(cliente.telefone);
    const emailCliente = normalizarEmailLead(cliente.email);

    return Boolean(
      (telefoneNormalizado && telefoneCliente === telefoneNormalizado) ||
        (emailNormalizado && emailCliente === emailNormalizado)
    );
  });
  const tags = normalizarTagsLead([payload.origem, ...(payload.tags || [])]);
  const textoInteracao = normalizarContatoLead(payload.observacoes)
    ? `Novo contato recebido: ${normalizarContatoLead(payload.observacoes)}`
    : `Novo contato recebido por ${payload.origem}.`;
  const interacaoLead: CrmInteracaoConfig = {
    id: `interacao-${Date.now()}`,
    texto: textoInteracao,
    origem: payload.origem,
    dataHora: agora,
  };
  const interacoesNovoLead = [
    interacaoLead,
    ...criarCrmInteracoesAutomacao(
      crmConfig.automacoes,
      "novo_lead",
      `Origem: ${payload.origem}.`
    ),
  ];
  const leadBase: CrmClienteConfig = {
    id: `lead-${Date.now()}`,
    nome: normalizarContatoLead(payload.nome) || "Lead sem nome",
    telefone: normalizarContatoLead(payload.telefone),
    email: normalizarContatoLead(payload.email),
    observacoes: normalizarContatoLead(payload.observacoes),
    tags,
    status: payload.status || "prospect",
    etapaPipeline: "novo_lead",
    origem: payload.origem,
    criadoEm: agora,
    atualizadoEm: agora,
    movimentadoEm: agora,
    interacoes: interacoesNovoLead,
    tarefas: [],
  };
  const clientes =
    indiceExistente >= 0
      ? crmConfig.clientes.map((cliente, indice) =>
          indice === indiceExistente
            ? {
                ...cliente,
                nome: cliente.nome || leadBase.nome,
                telefone: cliente.telefone || leadBase.telefone,
                email: cliente.email || leadBase.email,
                observacoes: mesclarTextoObservacao(
                  cliente.observacoes,
                  leadBase.observacoes
                ),
                tags: normalizarTagsLead([...cliente.tags, ...leadBase.tags]),
                status: cliente.status || leadBase.status,
                etapaPipeline:
                  cliente.etapaPipeline || leadBase.etapaPipeline,
                origem: mesclarOrigemLead(cliente.origem, payload.origem),
                criadoEm: cliente.criadoEm || leadBase.criadoEm,
                atualizadoEm: agora,
                movimentadoEm:
                  cliente.movimentadoEm || leadBase.movimentadoEm,
                interacoes: [
                  ...cliente.interacoes,
                  ...interacoesNovoLead,
                ].slice(-100),
              }
            : cliente
        )
      : [leadBase, ...crmConfig.clientes].slice(0, 500);
  const crmConfigAtualizado: CrmConfig = {
    ...crmConfig,
    clientes,
  };

  return atualizarEmpresa(empresaId, {
    crm_config: crmConfigAtualizado,
  } as Partial<Empresa>);
}

export async function buscarEmpresaPorId(id: string) {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data,
    error,
  };
}

export async function listarEmpresas() {
  const { data, error } = await supabase
    .from("empresas")
    .select("id,nome,slug,categoria,logo,ativo,tipo,plano")
    .order("nome", { ascending: true });

  return {
    data,
    error,
  };
}

export async function criarEmpresa(dados: {
  nome: string;
  slug: string;
  tipoGerenciamento: string;
}) {
  const tipoGerenciamento = dados.tipoGerenciamento || "mikatech";
  const dadosEmpresa = {
      nome: dados.nome,
      slug: dados.slug,
      tipo: tipoGerenciamento,
      categoria: "",
      descricao: "",
      telefone: "",
      whatsapp: "",
      email: "",
      instagram: "",
      facebook: "",
      site: "",
      endereco: "",
      pix: "",
      pix_nome: "",
      pix_chave: "",
      wifi_nome: "",
      wifi_senha: "",
      logo: "",
      banner: "",
      plano: "starter",
      recursos_contratados: recursosContratadosPadrao,
      ativo: true,
  };

  if (isPlatformEnvironment()) {
    return supabase.rpc("platform_admin_create_empresa", {
      p_dados: dadosEmpresa,
    });
  }

  return supabase.from("empresas").insert(dadosEmpresa).select().single();
}

export async function excluirEmpresa(id: string) {
  const { error } = await supabase
    .from("empresas")
    .delete()
    .eq("id", id);

  return {
    error,
  };
}

export async function atualizarEmpresa(
  id: string,
  dados: Partial<Empresa>
) {
  const sqlSelect =
    `select * from empresas where id = '${id}' limit 1;`;
  const sqlUpdate =
    `update empresas set <payload> where id = '${id}' returning *;`;

  console.log("[Diagnóstico UPDATE] SQL SELECT antes do UPDATE:", sqlSelect);

  const {
    data: empresaAntesDoUpdate,
    error: erroSelectAntesDoUpdate,
  } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  console.log("[Diagnóstico UPDATE] Resultado do SELECT antes do UPDATE:", {
    idUsado: id,
    slugUsado: dados.slug,
    sqlExecutado: sqlSelect,
    data: empresaAntesDoUpdate,
    error: erroSelectAntesDoUpdate,
  });

  console.log("[Diagnóstico UPDATE] Antes do UPDATE:", {
    idUsado: id,
    slugUsado: dados.slug,
    payloadEnviado: dados,
    sqlExecutado: sqlUpdate,
  });

  const { data, error } = isPlatformEnvironment()
    ? await supabase.rpc("platform_admin_update_empresa", {
        p_empresa_id: id,
        p_dados: dados,
      })
    : await supabase
        .from("empresas")
        .update(dados)
        .eq("id", id)
        .select();

  console.log("[Diagnóstico UPDATE] Resultado do UPDATE:", {
    idUsado: id,
    slugUsado: dados.slug,
    payloadEnviado: dados,
    sqlExecutado: sqlUpdate,
    data,
    error,
    linhasAfetadas: Array.isArray(data) ? data.length : data ? 1 : 0,
  });

  if (error) {
    const payloadSemConfigsAusentes = { ...(dados as Record<string, unknown>) };
    const configsRemovidas: string[] = [];
    let erroAtual: typeof error | null = error;

    while (erroAtual) {
      const configAusente = colunasConfigOpcionais.find(
        (config) =>
          config.campo in payloadSemConfigsAusentes && config.erro(erroAtual!)
      );

      if (!configAusente) break;

      delete payloadSemConfigsAusentes[configAusente.campo];
      configsRemovidas.push(configAusente.nome);

      const { data: dataSemConfig, error: errorSemConfig } = await supabase
        .from("empresas")
        .update(payloadSemConfigsAusentes)
        .eq("id", id)
        .select();

      if (!errorSemConfig && dataSemConfig?.length) {
        console.warn(
          `Colunas opcionais ausentes no Supabase (${configsRemovidas.join(
            ", "
          )}); demais dados foram salvos.`
        );

        return {
          data: dataSemConfig[0],
          error: null,
        };
      }

      erroAtual = errorSemConfig;
    }

    if (erroColunaIaConfig(error)) {
      if ("ia_config" in dados) {
        const dadosSemIa = { ...(dados as Record<string, unknown>) };
        delete dadosSemIa.ia_config;
        const { data: dataSemIa, error: errorSemIa } =
          await supabase
            .from("empresas")
            .update(dadosSemIa)
            .eq("id", id)
            .select();

        if (!errorSemIa && dataSemIa?.length) {
          console.warn(
            "ia_config ainda nao existe no Supabase; demais dados foram salvos sem o Assistente de IA."
          );

          return {
            data: dataSemIa[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna ia_config ainda nao existe na tabela empresas. Crie a coluna JSONB para salvar o Assistente de IA.",
        },
      };
    }

    if (erroColunaCrmConfig(error)) {
      if ("crm_config" in dados) {
        const dadosSemCrm = { ...(dados as Record<string, unknown>) };
        delete dadosSemCrm.crm_config;
        const { data: dataSemCrm, error: errorSemCrm } =
          await supabase
            .from("empresas")
            .update(dadosSemCrm)
            .eq("id", id)
            .select();

        if (!errorSemCrm && dataSemCrm?.length) {
          console.warn(
            "crm_config ainda nao existe no Supabase; demais dados foram salvos sem o CRM."
          );

          return {
            data: dataSemCrm[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna crm_config ainda nao existe na tabela empresas. Crie a coluna JSONB para salvar o CRM.",
        },
      };
    }

    if (erroColunaFidelidadeConfig(error)) {
      if ("fidelidade_config" in dados) {
        const dadosSemFidelidade = { ...(dados as Record<string, unknown>) };
        delete dadosSemFidelidade.fidelidade_config;
        const { data: dataSemFidelidade, error: errorSemFidelidade } =
          await supabase
            .from("empresas")
            .update(dadosSemFidelidade)
            .eq("id", id)
            .select();

        if (!errorSemFidelidade && dataSemFidelidade?.length) {
          console.warn(
            "fidelidade_config ainda nao existe no Supabase; demais dados foram salvos sem o Programa de Fidelidade."
          );

          return {
            data: dataSemFidelidade[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna fidelidade_config ainda nao existe na tabela empresas. Crie a coluna JSONB para salvar o Programa de Fidelidade.",
        },
      };
    }

    if (erroColunaWifiMarketingConfig(error)) {
      if ("wifi_marketing_config" in dados) {
        const dadosSemWifiMarketing = { ...(dados as Record<string, unknown>) };
        delete dadosSemWifiMarketing.wifi_marketing_config;
        const {
          data: dataSemWifiMarketing,
          error: errorSemWifiMarketing,
        } = await supabase
          .from("empresas")
          .update(dadosSemWifiMarketing)
          .eq("id", id)
          .select();

        if (!errorSemWifiMarketing && dataSemWifiMarketing?.length) {
          console.warn(
            "wifi_marketing_config ainda nao existe no Supabase; demais dados foram salvos sem o Wi-Fi Marketing."
          );

          return {
            data: dataSemWifiMarketing[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna wifi_marketing_config ainda nao existe na tabela empresas. Crie a coluna JSONB para salvar o Wi-Fi Marketing.",
        },
      };
    }

    if (erroColunaAgendamentoConfig(error)) {
      if ("agendamento_config" in dados) {
        const dadosSemAgendamento = { ...(dados as Record<string, unknown>) };
        delete dadosSemAgendamento.agendamento_config;
        const { data: dataSemAgendamento, error: errorSemAgendamento } =
          await supabase
            .from("empresas")
            .update(dadosSemAgendamento)
            .eq("id", id)
            .select();

        if (!errorSemAgendamento && dataSemAgendamento?.length) {
          console.warn(
            "agendamento_config ainda nao existe no Supabase; demais dados foram salvos sem o Agendamento."
          );

          return {
            data: dataSemAgendamento[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna agendamento_config ainda nao existe na tabela empresas. Crie a coluna JSONB para salvar o Agendamento.",
        },
      };
    }

    if (erroColunaCatalogoConfig(error)) {
      if ("catalogo_config" in dados) {
        const dadosSemCatalogo = { ...(dados as Record<string, unknown>) };
        delete dadosSemCatalogo.catalogo_config;
        const { data: dataSemCatalogo, error: errorSemCatalogo } =
          await supabase
            .from("empresas")
            .update(dadosSemCatalogo)
            .eq("id", id)
            .select();

        if (!errorSemCatalogo && dataSemCatalogo?.length) {
          console.warn(
            "catalogo_config ainda nao existe no Supabase; demais dados foram salvos sem o Catalogo."
          );

          return {
            data: dataSemCatalogo[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna catalogo_config ainda nao existe na tabela empresas. Crie a coluna JSONB para salvar o Catalogo.",
        },
      };
    }

    if (erroColunaCardapioConfig(error)) {
      if ("cardapio_config" in dados) {
        const dadosSemCardapio = { ...(dados as Record<string, unknown>) };
        delete dadosSemCardapio.cardapio_config;
        const { data: dataSemCardapio, error: errorSemCardapio } =
          await supabase
            .from("empresas")
            .update(dadosSemCardapio)
            .eq("id", id)
            .select();

        if (!errorSemCardapio && dataSemCardapio?.length) {
          console.warn(
            "cardapio_config ainda nao existe no Supabase; demais dados foram salvos sem o Cardapio Digital."
          );

          return {
            data: dataSemCardapio[0],
            error: null,
          };
        }
      }

      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna cardapio_config ainda não existe na tabela empresas. Crie a coluna JSONB para salvar o Cardápio Digital.",
        },
      };
    }

    if (erroColunaLandingPageConfig(error)) {
      return {
        data: null,
        error: {
          ...error,
          message:
            "A coluna landing_page_config ainda não existe na tabela empresas. Crie a coluna JSONB para salvar a Landing Page.",
        },
      };
    }

    return {
      data: null,
      error,
    };
  }

  const empresaAtualizada = Array.isArray(data) ? data[0] : data;

  if (!empresaAtualizada) {
    console.error("UPDATE empresas não afetou nenhuma linha:", {
      idUsado: id,
      slugUsado: dados.slug,
      payloadEnviado: dados,
    });

    return {
      data: null,
      error: {
        message:
          "Nenhuma empresa foi atualizada. Verifique o ID da empresa ou as permissões no Supabase.",
        code: "EMPRESA_UPDATE_EMPTY",
      },
    };
  }

  return {
    data: empresaAtualizada,
    error: null,
  };
}
