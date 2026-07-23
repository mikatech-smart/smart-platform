import { supabase } from "../../lib/supabase";
export type CompanyInvite = { id: string; empresaId: string; empresaNome: string; expiresAt: string; url: string };
export async function criarConvitePrimeiroAcesso(empresaId: string) { const { data, error } = await supabase.functions.invoke("admin-create-company-invite", { body: { empresaId } }); return { data: (data?.data || null) as CompanyInvite | null, error }; }
export async function verificarAdministradorPrimeiroAcesso(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_usuarios")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("perfil", "administrador")
    .eq("ativo", true)
    .limit(1);

  return { possuiAdministrador: Boolean(data?.length), error };
}
export async function aceitarConvitePrimeiroAcesso(payload: { token: string; nome: string; email: string; senha: string }) {
  const { data, error } = await supabase.functions.invoke("accept-company-invite", { body: payload });
  if (!error) return { data: data?.data as { empresaSlug: string; empresaNome: string } | null, error: null };

  const context = (error as { context?: Response }).context;
  let message = error.message;
  let status = context?.status;
  if (context) {
    const body = await context.clone().json().catch(() => null) as { error?: string; message?: string } | null;
    message = body?.error || body?.message || message;
  }

  return {
    data: null,
    error: new Error(`${status ? `HTTP ${status}: ` : ""}${message}`),
  };
}
