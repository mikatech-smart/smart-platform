import { supabase } from "../../lib/supabase";
import type { Empresa } from "../../models/Empresa";

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
    .select("id,nome,slug,categoria,logo,ativo,tipo")
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
  const { data, error } = await supabase
    .from("empresas")
    .update(dados)
    .eq("id", id)
    .select();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data || data.length === 0) {
    console.error("UPDATE empresas nao afetou nenhuma linha:", {
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
