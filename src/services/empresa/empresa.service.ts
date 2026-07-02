import { supabase } from "../../lib/supabase";
import type { Empresa } from "../../models/Empresa";

export async function buscarEmpresaPorSlug(slug: string) {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("slug", slug)
    .single();

  return { data, error };
}

export async function buscarEmpresaPorId(id: string) {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function atualizarEmpresa(
  id: string,
  dados: Partial<Empresa>
) {
  const { data, error } = await supabase
    .from("empresas")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}