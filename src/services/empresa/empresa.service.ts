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
