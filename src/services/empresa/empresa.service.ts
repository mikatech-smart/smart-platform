import { supabase } from "../../lib/supabase";
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

type CrmClienteConfig = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  observacoes: string;
  tags: string[];
  status: "prospect" | "ativo" | "inativo";
  origem?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};

type CrmConfig = {
  clientes: CrmClienteConfig[];
};

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

function normalizarCrmConfig(valor: unknown): CrmConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { clientes: [] };
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
          origem: typeof cliente.origem === "string" ? cliente.origem : "",
          criadoEm: typeof cliente.criadoEm === "string" ? cliente.criadoEm : "",
          atualizadoEm:
            typeof cliente.atualizadoEm === "string"
              ? cliente.atualizadoEm
              : "",
        };
      })
    : [];

  return { clientes };
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
  const leadBase: CrmClienteConfig = {
    id: `lead-${Date.now()}`,
    nome: normalizarContatoLead(payload.nome) || "Lead sem nome",
    telefone: normalizarContatoLead(payload.telefone),
    email: normalizarContatoLead(payload.email),
    observacoes: normalizarContatoLead(payload.observacoes),
    tags,
    status: payload.status || "prospect",
    origem: payload.origem,
    criadoEm: agora,
    atualizadoEm: agora,
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
                origem: mesclarOrigemLead(cliente.origem, payload.origem),
                criadoEm: cliente.criadoEm || leadBase.criadoEm,
                atualizadoEm: agora,
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
  const { data: sessao } = await supabase.auth.getSession();
  const userId = sessao.session?.user.id;
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

  async function inserirEmpresa(payload: Record<string, unknown>) {
    return supabase
      .from("empresas")
      .insert(payload)
      .select()
      .single();
  }

  const primeiraTentativa = userId
    ? await inserirEmpresa({
        ...dadosEmpresa,
        user_id: userId,
      })
    : await inserirEmpresa(dadosEmpresa);

  if (!primeiraTentativa.error) {
    return {
      data: primeiraTentativa.data,
      error: null,
    };
  }

  const erroPrimeiraTentativa = primeiraTentativa.error;
  const colunaUserIdNaoExiste =
    erroPrimeiraTentativa.code === "PGRST204" ||
    erroPrimeiraTentativa.message
      ?.toLowerCase()
      .includes("user_id");

  if (userId && colunaUserIdNaoExiste) {
    const { data, error } = await inserirEmpresa(dadosEmpresa);

    return {
      data,
      error,
    };
  }

  const erroRls =
    erroPrimeiraTentativa.message
      ?.toLowerCase()
      .includes("row-level security") ||
    erroPrimeiraTentativa.message
      ?.toLowerCase()
      .includes("rls");

  if (erroRls && !userId) {
    return {
      data: null,
      error: {
        ...erroPrimeiraTentativa,
        message:
          "Insert bloqueado pela RLS do Supabase: o Admin precisa estar autenticado para criar empresas.",
      },
    };
  }

  return {
    data: null,
    error: erroPrimeiraTentativa,
  };
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

  const { data, error } = await supabase
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
    linhasAfetadas: data?.length ?? 0,
  });

  if (error) {
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
        const { fidelidade_config: _fidelidadeConfig, ...dadosSemFidelidade } =
          dados as Record<string, unknown>;
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
        const {
          wifi_marketing_config: _wifiMarketingConfig,
          ...dadosSemWifiMarketing
        } = dados as Record<string, unknown>;
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
        const {
          agendamento_config: _agendamentoConfig,
          ...dadosSemAgendamento
        } = dados as Record<string, unknown>;
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
        const { catalogo_config: _catalogoConfig, ...dadosSemCatalogo } =
          dados as Record<string, unknown>;
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
        const { cardapio_config: _cardapioConfig, ...dadosSemCardapio } =
          dados as Record<string, unknown>;
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

  if (!data || data.length === 0) {
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
    data: data[0],
    error: null,
  };
}
