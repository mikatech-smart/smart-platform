import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await request.json();
    if (typeof token !== "string" || !token.trim()) return response({ error: "Handoff invalido." }, 400);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const now = new Date().toISOString();
    const { data: handoff, error: handoffError } = await adminClient
      .from("platform_erp_handoffs")
      .update({ consumed_at: now })
      .eq("token_hash", await hash(token.trim()))
      .is("consumed_at", null)
      .gt("expires_at", now)
      .select("created_by, empresa_id")
      .maybeSingle();
    if (handoffError || !handoff) return response({ error: "Handoff expirado, invalido ou ja utilizado." }, 401);

    const { data: platformAdmin } = await adminClient
      .from("platform_admin_users")
      .select("auth_user_id, email")
      .eq("auth_user_id", handoff.created_by)
      .eq("ativo", true)
      .maybeSingle();
    if (!platformAdmin) return response({ error: "Administrador de plataforma inativo." }, 403);

    const { data: empresa } = await adminClient
      .from("empresas")
      .select("id, slug, ativo")
      .eq("id", handoff.empresa_id)
      .maybeSingle();
    if (!empresa?.ativo) return response({ error: "Empresa inativa ou inexistente." }, 404);

    const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(platformAdmin.auth_user_id);
    if (authUserError || !authUser.user?.email) return response({ error: "Administrador de plataforma nao encontrado." }, 404);

    const { data: magicLink, error: magicLinkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: authUser.user.email,
    });
    const tokenHash = magicLink?.properties?.hashed_token;
    if (magicLinkError || !tokenHash) return response({ error: magicLinkError?.message || "Sessao administrativa nao criada." }, 500);

    return response({ data: { tokenHash, type: "magiclink", empresaId: empresa.id, empresaSlug: empresa.slug } });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Erro inesperado." }, 500);
  }
});
