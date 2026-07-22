import { supabase } from "../../lib/supabase";
export type CompanyInvite = { id: string; empresaId: string; empresaNome: string; expiresAt: string; url: string };
export async function criarConvitePrimeiroAcesso(empresaId: string) { const { data, error } = await supabase.functions.invoke("admin-create-company-invite", { body: { empresaId } }); return { data: (data?.data || null) as CompanyInvite | null, error }; }
export async function aceitarConvitePrimeiroAcesso(payload: { token: string; nome: string; email: string; senha: string }) { const { data, error } = await supabase.functions.invoke("accept-company-invite", { body: payload }); return { data: data?.data as { empresaSlug: string; empresaNome: string } | null, error }; }
