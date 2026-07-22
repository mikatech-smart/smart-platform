import { supabase } from "../../lib/supabase";

export type Collaborator = { id: string; nome: string; nome_exibicao: string; email: string; telefone: string; perfil: "administrador" | "vendedor" | "caixa" | "estoque"; permissoes: Record<string, boolean>; ativo: boolean; ultimo_acesso: string | null; auth_user_id: string | null };
export type CollaboratorInput = { id?: string; nome: string; nomeExibicao: string; email: string; telefone: string; senha?: string; perfil: Collaborator["perfil"]; permissoes: Record<string, boolean>; ativo: boolean };
export async function gerenciarColaborador(action: "list" | "create" | "update" | "delete", colaborador?: Partial<CollaboratorInput>) {
  const { data, error } = await supabase.functions.invoke("erp-manage-collaborator", { body: { action, colaborador } });
  if (error) {
    const context = (error as { context?: Response }).context;
    const status = context?.status;
    const body = context ? await context.clone().json().catch(() => null) as { message?: string; error?: string; stage?: string } | null : null;
    const message = body?.message || body?.error || error.message;
    return { data: null, error: new Error(`${body?.stage ? `[${body.stage}] ` : ""}${status ? `HTTP ${status}: ` : ""}${message}`) };
  }
  return { data: (data?.data || null) as Collaborator | Collaborator[] | boolean | null, error: null };
}
