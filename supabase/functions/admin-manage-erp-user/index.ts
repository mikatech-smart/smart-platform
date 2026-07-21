import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fields = "id, empresa_id, nome, nome_exibicao, email, telefone, perfil, funcoes, modulo_inicial, permissoes, ativo, created_at, updated_at";
const profiles = new Set(["administrador", "caixa", "estoque", "vendedor"]);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return response({ error: "Nao autenticado." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const token = authorization.slice("Bearer ".length);
    const { data: authData, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !authData.user) return response({ error: "Sessao invalida." }, 401);

    const { data: platformAdmin, error: platformError } = await adminClient
      .from("platform_admin_users")
      .select("auth_user_id, ativo")
      .eq("auth_user_id", authData.user.id)
      .eq("ativo", true)
      .maybeSingle();
    if (platformError || !platformAdmin) return response({ error: "Acesso de plataforma negado." }, 403);

    const body = await request.json();
    const action = body.action as string;
    const empresaId = body.empresaId as string;
    if (!empresaId) return response({ error: "Empresa obrigatoria." }, 400);

    const { data: empresa, error: empresaError } = await adminClient
      .from("empresas")
      .select("id")
      .eq("id", empresaId)
      .maybeSingle();
    if (empresaError || !empresa) return response({ error: "Empresa nao encontrada." }, 404);

    if (action === "list") {
      const { data, error } = await adminClient
        .from("erp_pdv_usuarios")
        .select(fields)
        .eq("empresa_id", empresaId)
        .order("ativo", { ascending: false })
        .order("nome", { ascending: true });
      return error ? response({ error: error.message }, 400) : response({ data: data || [] });
    }

    if (!["create", "update"].includes(action)) return response({ error: "Operacao invalida." }, 400);
    const input = body.usuario || {};
    const profile = input.perfil as string;
    if (!input.nome?.trim() || !input.email?.trim() || !profiles.has(profile)) {
      return response({ error: "Nome, e-mail e perfil valido sao obrigatorios." }, 400);
    }

    const values = {
      empresa_id: empresaId,
      nome: input.nome.trim(),
      nome_exibicao: input.nomeExibicao?.trim() || input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      telefone: input.telefone?.trim() || "",
      perfil: profile,
      funcoes: input.funcoes || [],
      modulo_inicial: input.moduloInicial?.trim() || "pdv",
      permissoes: input.permissoes || {},
      ativo: input.ativo !== false,
      updated_at: new Date().toISOString(),
    };

    if (action === "update") {
      if (!input.id) return response({ error: "Usuario obrigatorio para edicao." }, 400);
      const { data: existing, error: existingError } = await adminClient
        .from("erp_pdv_usuarios")
        .select("id, auth_user_id")
        .eq("id", input.id)
        .eq("empresa_id", empresaId)
        .maybeSingle();
      if (existingError || !existing) return response({ error: "Usuario nao encontrado." }, 404);
      if (input.senha && existing.auth_user_id) {
        const { error } = await adminClient.auth.admin.updateUserById(existing.auth_user_id, { password: input.senha });
        if (error) return response({ error: error.message }, 400);
      }
      const { data, error } = await adminClient.from("erp_pdv_usuarios").update(values).eq("id", input.id).eq("empresa_id", empresaId).select(fields).single();
      return error ? response({ error: error.message }, 400) : response({ data });
    }

    if (!input.senha || input.senha.length < 6) return response({ error: "A senha deve possuir ao menos 6 caracteres." }, 400);
    const { data: createdAuth, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: values.email,
      password: input.senha,
      email_confirm: true,
      user_metadata: { nome: values.nome },
    });
    if (createAuthError || !createdAuth.user) return response({ error: createAuthError?.message || "Nao foi possivel criar o usuario Auth." }, 400);

    const { data, error } = await adminClient.from("erp_pdv_usuarios").insert({ ...values, auth_user_id: createdAuth.user.id }).select(fields).single();
    if (error) {
      await adminClient.auth.admin.deleteUser(createdAuth.user.id);
      return response({ error: error.message }, 400);
    }
    return response({ data });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Erro inesperado." }, 500);
  }
});
