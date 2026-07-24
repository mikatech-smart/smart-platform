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

const diagnosticError = (step: string, reason: string, details: Record<string, unknown>, status: number) =>
  (() => {
    const payload = { step, reason, details };
    console.error("[handoff-diagnostic]", payload);
    return response(payload, status);
  })();

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
    const tokenHash = await hash(token.trim());
    const { data: candidate, error: candidateError } = await adminClient
      .from("platform_erp_handoffs")
      .select("empresa_id, created_by, expires_at, consumed_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (candidateError) {
      return diagnosticError(
        "lookup_handoff",
        "unexpected_error",
        { message: candidateError.message },
        500,
      );
    }
    if (!candidate) {
      return diagnosticError("lookup_handoff", "handoff_not_found", {}, 401);
    }
    if (candidate.consumed_at) {
      return diagnosticError(
        "validate_handoff",
        "handoff_already_consumed",
        {
          empresa_id: candidate.empresa_id,
          created_by: candidate.created_by,
          expires_at: candidate.expires_at,
          consumed_at: candidate.consumed_at,
        },
        401,
      );
    }
    if (candidate.expires_at <= now) {
      return diagnosticError(
        "validate_handoff",
        "handoff_expired",
        {
          empresa_id: candidate.empresa_id,
          created_by: candidate.created_by,
          expires_at: candidate.expires_at,
          consumed_at: candidate.consumed_at,
        },
        401,
      );
    }

    const { data: handoff, error: handoffError } = await adminClient
      .from("platform_erp_handoffs")
      .update({ consumed_at: now })
      .eq("token_hash", tokenHash)
      .is("consumed_at", null)
      .gt("expires_at", now)
      .select("created_by, empresa_id")
      .maybeSingle();
    if (handoffError || !handoff) {
      return diagnosticError(
        "claim_handoff",
        "handoff_already_consumed",
        {
          empresa_id: candidate.empresa_id,
          created_by: candidate.created_by,
          expires_at: candidate.expires_at,
          consumed_at: candidate.consumed_at,
          message: handoffError?.message,
        },
        401,
      );
    }

    const { data: platformAdmin, error: platformAdminError } = await adminClient
      .from("platform_admin_users")
      .select("auth_user_id, email, ativo")
      .eq("auth_user_id", handoff.created_by)
      .maybeSingle();
    if (platformAdminError) {
      return diagnosticError(
        "lookup_platform_admin",
        "unexpected_error",
        { created_by: handoff.created_by, message: platformAdminError.message },
        500,
      );
    }
    if (!platformAdmin) {
      return diagnosticError(
        "validate_platform_admin",
        "platform_admin_not_found",
        { created_by: handoff.created_by },
        403,
      );
    }
    if (!platformAdmin.ativo) {
      return diagnosticError(
        "validate_platform_admin",
        "platform_admin_inactive",
        { created_by: handoff.created_by, email: platformAdmin.email },
        403,
      );
    }

    const { data: empresa, error: empresaError } = await adminClient
      .from("empresas")
      .select("id, slug, ativo")
      .eq("id", handoff.empresa_id)
      .maybeSingle();
    if (empresaError) {
      return diagnosticError(
        "lookup_company",
        "unexpected_error",
        { empresa_id: handoff.empresa_id, message: empresaError.message },
        500,
      );
    }
    if (!empresa) {
      return diagnosticError(
        "validate_company",
        "company_not_found",
        { empresa_id: handoff.empresa_id },
        404,
      );
    }
    if (!empresa.ativo) {
      return diagnosticError(
        "validate_company",
        "company_inactive",
        { empresa_id: empresa.id, slug: empresa.slug, ativo: empresa.ativo },
        404,
      );
    }

    const { data: authUser, error: authUserError } = await adminClient.auth.admin.getUserById(platformAdmin.auth_user_id);
    if (authUserError) {
      return diagnosticError(
        "lookup_auth_user",
        "auth_lookup_failed",
        { created_by: platformAdmin.auth_user_id, message: authUserError.message },
        502,
      );
    }
    if (!authUser.user?.email) {
      return diagnosticError(
        "lookup_auth_user",
        "auth_user_not_found",
        { created_by: platformAdmin.auth_user_id },
        404,
      );
    }

    const { data: magicLink, error: magicLinkError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: authUser.user.email,
    });
    const sessionTokenHash = magicLink?.properties?.hashed_token;
    if (magicLinkError || !sessionTokenHash) {
      return diagnosticError(
        "generate_magic_link",
        "unexpected_error",
        { empresa_id: empresa.id, slug: empresa.slug, message: magicLinkError?.message },
        500,
      );
    }

    return response({ data: { tokenHash: sessionTokenHash, type: "magiclink", empresaId: empresa.id, empresaSlug: empresa.slug } });
  } catch (error) {
    return diagnosticError(
      "unexpected_error",
      "unexpected_error",
      { message: error instanceof Error ? error.message : "Erro inesperado." },
      500,
    );
  }
});
