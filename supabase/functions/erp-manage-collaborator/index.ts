import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const profiles = new Set(["administrador", "vendedor", "caixa", "estoque"]);
const defaultPermissions: Record<string, string[]> = { administrador: ["usuarios.visualizar", "usuarios.criar", "usuarios.alterar", "usuarios.inativar"], gerente: ["usuarios.visualizar", "usuarios.criar", "usuarios.alterar", "usuarios.inativar"] };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
const failure = (stage: string, message: string, status = 400) => response({ success: false, stage, message }, status);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  let createdAuthId = "";
  let stage = "request";
  try {
    stage = "authenticate_request";
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return failure(stage, "Sessao obrigatoria.", 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return failure(stage, authError?.message || "Sessao invalida.", 401);
    stage = "load_caller";
    const { data: caller } = await admin.from("erp_pdv_usuarios").select("id, empresa_id, perfil, ativo, permissoes").eq("auth_user_id", authData.user.id).eq("ativo", true).maybeSingle();
    if (!caller || !["administrador", "gerente"].includes(caller.perfil)) return failure("authorize_caller", "Usuario nao autorizado para gerenciar colaboradores.", 403);
    const can = (permission: string) => permission in (caller.permissoes || {}) ? Boolean(caller.permissoes[permission]) : (defaultPermissions[caller.perfil] || []).includes(permission);
    const body = await request.json();
    const action = String(body.action || "list");
    const empresaId = caller.empresa_id;
    const requiredPermission = action === "list" ? "usuarios.visualizar" : action === "create" ? "usuarios.criar" : action === "delete" ? "usuarios.inativar" : "usuarios.alterar";
    if (!can(requiredPermission)) return failure("authorize_permission", `Permissao insuficiente: ${requiredPermission}.`, 403);
    if (action === "list") {
      const { data, error } = await admin.from("erp_pdv_usuarios").select("id, empresa_id, auth_user_id, nome, nome_exibicao, email, telefone, perfil, permissoes, ativo, created_at, updated_at").eq("empresa_id", empresaId).order("nome");
      if (error) return failure("list_collaborators", error.message);
      const rows = await Promise.all((data || []).map(async (item) => {
        const authUser = item.auth_user_id ? await admin.auth.admin.getUserById(item.auth_user_id) : null;
        return { ...item, ultimo_acesso: authUser?.data.user?.last_sign_in_at || null };
      }));
      return response({ data: rows });
    }
    const input = body.colaborador || {};
    if (action === "delete") {
      if (!input.id || input.id === caller.id) return failure("delete_collaborator", "Colaborador invalido.");
      const { data: target } = await admin.from("erp_pdv_usuarios").select("id, auth_user_id").eq("id", input.id).eq("empresa_id", empresaId).maybeSingle();
      if (!target) return failure("delete_collaborator", "Colaborador nao encontrado.", 404);
      const { error } = await admin.from("erp_pdv_usuarios").delete().eq("id", target.id).eq("empresa_id", empresaId);
      if (error) return failure("delete_collaborator", error.message);
      if (target.auth_user_id) await admin.auth.admin.deleteUser(target.auth_user_id);
      return response({ data: true });
    }
    if (!profiles.has(input.perfil) || !String(input.nome || "").trim() || !String(input.email || "").trim()) return failure("validate_payload", "Nome, e-mail e perfil sao obrigatorios.");
    const values = { nome: String(input.nome).trim(), nome_exibicao: String(input.nomeExibicao || input.nome).trim(), email: String(input.email).trim().toLowerCase(), telefone: String(input.telefone || "").trim(), perfil: input.perfil, permissoes: input.permissoes || {}, ativo: input.ativo !== false, updated_at: new Date().toISOString() };
    if (action === "update") {
      if (!input.id) return failure("update_collaborator", "Colaborador invalido.");
      const { data: target } = await admin.from("erp_pdv_usuarios").select("id, auth_user_id").eq("id", input.id).eq("empresa_id", empresaId).maybeSingle();
      if (!target) return failure("update_collaborator", "Colaborador nao encontrado.", 404);
      if (input.senha && target.auth_user_id) { stage = "update_auth_user"; const { error } = await admin.auth.admin.updateUserById(target.auth_user_id, { password: input.senha }); if (error) return failure(stage, error.message); }
      stage = "update_usuario";
      const { data, error } = await admin.from("erp_pdv_usuarios").update(values).eq("id", input.id).eq("empresa_id", empresaId).select().single();
      return error ? failure(stage, error.message) : response({ success: true, data });
    }
    if (action !== "create" || String(input.senha || "").length < 8) return failure("validate_payload", "A senha inicial deve possuir ao menos 8 caracteres.");
    stage = "create_auth_user";
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email: values.email, password: input.senha, email_confirm: true, user_metadata: { nome: values.nome, empresa_id: empresaId } });
    if (createError || !created.user) return failure(stage, createError?.message || "Nao foi possivel criar o acesso.");
    createdAuthId = created.user.id;
    stage = "insert_usuario";
    const { data, error } = await admin.from("erp_pdv_usuarios").insert({ ...values, empresa_id: empresaId, auth_user_id: createdAuthId, login: values.email, modulo_inicial: "pdv", funcoes: [] }).select().single();
    if (error) { stage = "rollback_auth_user"; await admin.auth.admin.deleteUser(createdAuthId); return failure("insert_usuario", error.message); }
    return response({ success: true, data });
  } catch (error) { return failure(stage, error instanceof Error ? error.message : "Erro inesperado.", 500); }
});
