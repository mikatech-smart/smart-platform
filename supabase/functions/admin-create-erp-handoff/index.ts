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

function createToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return response({ error: "Nao autenticado." }, 401);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );
    const { data: authData, error: authError } = await adminClient.auth.getUser(authorization.slice(7));
    if (authError || !authData.user) return response({ error: "Sessao invalida." }, 401);

    const { data: platformAdmin } = await adminClient
      .from("platform_admin_users")
      .select("auth_user_id")
      .eq("auth_user_id", authData.user.id)
      .eq("ativo", true)
      .maybeSingle();
    if (!platformAdmin) return response({ error: "Acesso de plataforma negado." }, 403);

    const { empresaId } = await request.json();
    if (typeof empresaId !== "string" || !empresaId) return response({ error: "Empresa obrigatoria." }, 400);

    const { data: empresa, error: empresaError } = await adminClient
      .from("empresas")
      .select("id, slug, nome, ativo")
      .eq("id", empresaId)
      .maybeSingle();
    if (empresaError || !empresa || !empresa.ativo) return response({ error: "Empresa nao encontrada ou inativa." }, 404);

    const rawToken = createToken();
    const { data: handoff, error: handoffError } = await adminClient
      .from("platform_erp_handoffs")
      .insert({ created_by: authData.user.id, empresa_id: empresa.id, token_hash: await hash(rawToken) })
      .select("id, expires_at")
      .single();
    if (handoffError || !handoff) return response({ error: handoffError?.message || "Handoff nao criado." }, 400);

    const erpUrl = (Deno.env.get("MIKAON_ERP_URL") || "https://erp.mikaon.com.br").replace(/\/$/, "");
    return response({
      data: {
        id: handoff.id,
        empresaId: empresa.id,
        empresaSlug: empresa.slug,
        empresaNome: empresa.nome,
        expiresAt: handoff.expires_at,
        url: `${erpUrl}/empresa/${encodeURIComponent(empresa.slug)}?handoff=${encodeURIComponent(rawToken)}`,
      },
    });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Erro inesperado." }, 500);
  }
});
