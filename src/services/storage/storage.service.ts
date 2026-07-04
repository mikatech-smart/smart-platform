import { supabase } from "../../lib/supabase";

export async function uploadImagem(
  caminho: string,
  arquivo: File
) {
  const { error } = await supabase.storage
    .from("empresas")
    .upload(caminho, arquivo, {
      upsert: true,
    });

  if (error) throw error;

  return obterUrlPublica(caminho);
}

export function obterUrlPublica(caminho: string) {
  const { data } = supabase.storage
    .from("empresas")
    .getPublicUrl(caminho);

  return data.publicUrl;
}

export async function excluirImagem(caminho: string) {
  return supabase.storage
    .from("empresas")
    .remove([caminho]);
}
