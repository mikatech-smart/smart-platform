import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
async function hash(value: string) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await request.json(); const nome = typeof body.nome === "string" ? body.nome.trim() : ""; const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""; const senha = typeof body.senha === "string" ? body.senha : ""; const rawToken = typeof body.token === "string" ? body.token.trim() : "";
    if (!nome || !email || !rawToken || senha.length < 8 || !/^\S+@\S+\.\S+$/.test(email)) return response({ error: "Informe nome, e-mail, convite e uma senha com ao menos 8 caracteres." }, 400);
    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: claimed, error: claimError } = await adminClient.rpc("claim_company_first_access_invite", { p_token_hash: await hash(rawToken) }); const invite = claimed?.[0];
    if (claimError || !invite) return response({ error: "Convite invalido, expirado ou ja utilizado." }, 400);
    const { data: createdAuth, error: authError } = await adminClient.auth.admin.createUser({ email, password: senha, email_confirm: true, user_metadata: { nome, primeiro_acesso: true, empresa_id: invite.empresa_id } });
    if (authError || !createdAuth.user) { await adminClient.rpc("release_company_first_access_invite", { p_invite_id: invite.invite_id, p_claim_id: invite.claim_id }); return response({ error: authError?.message || "Nao foi possivel criar o acesso." }, 400); }
    const { data: usuario, error: usuarioError } = await adminClient.from("erp_pdv_usuarios").insert({ empresa_id: invite.empresa_id, auth_user_id: createdAuth.user.id, nome, email, login: email, perfil: "administrador", modulo_inicial: "pdv", ativo: true }).select("id, empresa_id, nome, perfil, ativo").single();
    if (usuarioError || !usuario) { await adminClient.auth.admin.deleteUser(createdAuth.user.id); await adminClient.rpc("release_company_first_access_invite", { p_invite_id: invite.invite_id, p_claim_id: invite.claim_id }); return response({ error: usuarioError?.message || "Nao foi possivel vincular o administrador." }, 400); }
    const { data: completed, error: completeError } = await adminClient.rpc("complete_company_first_access_invite", { p_invite_id: invite.invite_id, p_claim_id: invite.claim_id });
    if (completeError || !completed) { await adminClient.auth.admin.deleteUser(createdAuth.user.id); await adminClient.from("erp_pdv_usuarios").delete().eq("id", usuario.id); await adminClient.rpc("release_company_first_access_invite", { p_invite_id: invite.invite_id, p_claim_id: invite.claim_id }); return response({ error: "Nao foi possivel concluir o convite." }, 400); }
    return response({ data: { empresaSlug: invite.empresa_slug, empresaNome: invite.empresa_nome } });
  } catch (error) { return response({ error: error instanceof Error ? error.message : "Erro inesperado." }, 500); }
});
