import { supabase } from "../../lib/supabase";

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
  dados: Record<string, any>
) {
  const { data, error } = await supabase
    .from("empresas")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  return {
    data,
    error,
  };
}