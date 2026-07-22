import { supabase } from "../../lib/supabase";

export type Collaborator = { id: string; nome: string; nome_exibicao: string; email: string; telefone: string; perfil: "administrador" | "vendedor" | "caixa" | "estoque"; permissoes: Record<string, boolean>; ativo: boolean; ultimo_acesso: string | null; auth_user_id: string | null };
export type CollaboratorInput = { id?: string; nome: string; nomeExibicao: string; email: string; telefone: string; senha?: string; perfil: Collaborator["perfil"]; permissoes: Record<string, boolean>; ativo: boolean };
export async function gerenciarColaborador(action: "list" | "create" | "update" | "delete", colaborador?: Partial<CollaboratorInput>) {
  const { data, error } = await supabase.functions.invoke("erp-manage-collaborator", { body: { action, colaborador } });
  if (error) return { data: null, error };
  return { data: (data?.data || null) as Collaborator | Collaborator[] | boolean | null, error: null };
}
