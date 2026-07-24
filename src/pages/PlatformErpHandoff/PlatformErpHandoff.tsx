import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import {
  createHandoffAttemptId,
  getHandoffFingerprint,
  getHandoffTabId,
  traceHandoff,
} from "../../utils/handoffTrace";

const HANDOFF_LOCK_TTL_MS = 120_000;

function debugHandoff(event: string, details: Record<string, unknown> = {}) {
  console.info("[MIKAON HANDOFF DEBUG]", event, { ...details, at: new Date().toISOString() });
}

function debugJwt(event: string, details: Record<string, unknown> = {}) {
  console.info("[MIKAON JWT DEBUG]", event, {
    ...details,
    hostname: window.location.hostname,
    projectUrl: import.meta.env.VITE_SUPABASE_URL,
    at: new Date().toISOString(),
  });
}

async function readFunctionError(data: unknown, functionError: unknown) {
  let payload = data as { error?: string; step?: string; reason?: string; details?: { message?: string } } | null;
  let status: number | undefined;
  const context = (functionError as { context?: unknown } | null)?.context;

  if (context instanceof Response) {
    status = context.status;
    try {
      payload = await context.clone().json();
    } catch {
      // Keep the response already returned by the SDK when the body is not JSON.
    }
  }

  const reason = payload?.reason || payload?.error || "handoff_failed";
  const message = payload?.details?.message;
  return { status, step: payload?.step, reason, message };
}

type HandoffState = {
  state: "processing" | "consumed" | "failed";
  attemptId: string;
  updatedAt: number;
};

function readHandoffState(key: string): HandoffState | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as HandoffState;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

export default function PlatformErpHandoff() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("handoff");
    if (!token || !slug) {
      setError("Acesso administrativo incompleto.");
      return;
    }

    let ativo = true;
    const tabId = getHandoffTabId();
    const attemptId = createHandoffAttemptId();

    void (async () => {
      const handoffFingerprint = await getHandoffFingerprint(token);
      const stateKey = `mikaon:handoff-state:${handoffFingerprint}`;
      const lockKey = `mikaon:handoff-lock:${handoffFingerprint}`;
      const consumedKey = `mikaon:handoff-consumed:${handoffFingerprint}`;
      const traceFields = { attemptId, handoffFingerprint, companySlug: slug, tabId };

      traceHandoff("erp_page_mount", traceFields);
      debugHandoff("início do consumo", { tokenPresente: true, handoffFingerprint, attemptId });

      const previousState = readHandoffState(stateKey);
      if (previousState?.state === "consumed" || localStorage.getItem(consumedKey)) {
        traceHandoff("consume_request_failure", { ...traceFields, reason: "handoff_already_consumed" });
        if (ativo) setError("Este acesso administrativo já foi utilizado. Volte ao painel e gere um novo acesso.");
        return;
      }
      if (previousState?.state === "processing" && Date.now() - previousState.updatedAt < HANDOFF_LOCK_TTL_MS) {
        traceHandoff("consume_lock_acquired", { ...traceFields, resumed: true });
        const waitStartedAt = Date.now();
        while (Date.now() - waitStartedAt < HANDOFF_LOCK_TTL_MS) {
          await new Promise((resolve) => window.setTimeout(resolve, 100));
          const stateAfterWait = readHandoffState(stateKey);
          if (stateAfterWait?.state === "consumed" || localStorage.getItem(consumedKey)) {
            traceHandoff("consume_request_success", { ...traceFields, resumed: true });
            traceHandoff("redirect_start", { ...traceFields, resumed: true });
            if (ativo) {
              navigate(location.pathname, { replace: true });
              traceHandoff("redirect_success", { ...traceFields, resumed: true });
            }
            return;
          }
          if (stateAfterWait?.state === "failed") {
            traceHandoff("consume_request_failure", { ...traceFields, reason: "handoff_processing_failed", resumed: true });
            if (ativo) setError("O acesso administrativo falhou. Volte ao painel e gere um novo acesso.");
            return;
          }
        }
        traceHandoff("consume_request_failure", { ...traceFields, reason: "handoff_processing_timeout" });
        if (ativo) setError("Este acesso administrativo expirou durante o processamento.");
        return;
      }

      const currentLock = localStorage.getItem(lockKey);
      const currentLockTime = currentLock ? Number(currentLock.split(":")[0]) : 0;
      if (currentLockTime && Date.now() - currentLockTime < HANDOFF_LOCK_TTL_MS) {
        traceHandoff("consume_request_failure", { ...traceFields, reason: "handoff_processing_other_tab" });
        if (ativo) setError("Este acesso administrativo já está sendo processado.");
        return;
      }

      const state: HandoffState = { state: "processing", attemptId, updatedAt: Date.now() };
      sessionStorage.setItem(stateKey, JSON.stringify(state));
      sessionStorage.setItem("mikaon:handoff-active-attempt", JSON.stringify({ ...traceFields, startedAt: Date.now() }));
      const lockOwner = `${Date.now()}:${tabId}:${attemptId}`;
      localStorage.setItem(lockKey, lockOwner);
      if (localStorage.getItem(lockKey) !== lockOwner) {
        traceHandoff("consume_request_failure", { ...traceFields, reason: "consume_lock_lost" });
        if (ativo) setError("Este acesso administrativo já está sendo processado.");
        return;
      }
      traceHandoff("consume_lock_acquired", traceFields);

      // Remove the one-time credential before the first network request, including failures.
      window.history.replaceState(window.history.state, document.title, `${location.pathname}${location.hash}`);
      traceHandoff("handoff_url_removed", traceFields);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      debugJwt("sessão antes do handoff", {
        authorizationPresente: Boolean(sessionData.session?.access_token),
        bearerEnviado: Boolean(sessionData.session?.access_token),
        sessaoSupabaseEncontrada: Boolean(sessionData.session),
        usuarioAutenticadoEncontrado: Boolean(sessionData.session?.user),
        sessaoErro: sessionError?.message,
      });
      traceHandoff("consume_request_start", { ...traceFields, existingSession: Boolean(sessionData.session) });

      const { data, error: handoffError } = await supabase.functions.invoke("accept-platform-erp-handoff", {
        body: { token },
      });
      const functionFailure = await readFunctionError(data, handoffError);
      traceHandoff(
        handoffError || !data?.data?.tokenHash ? "consume_request_failure" : "consume_request_success",
        { ...traceFields, status: functionFailure.status, step: functionFailure.step, reason: functionFailure.reason },
      );
      debugHandoff("resposta da Function", {
        respostaHttp: functionFailure.status,
        etapa: functionFailure.step,
        motivo: functionFailure.reason,
        handoffFingerprint,
      });
      debugJwt("resposta da Edge Function", {
        authorizationPresente: Boolean(sessionData.session?.access_token),
        bearerEnviado: Boolean(sessionData.session?.access_token),
        sessaoSupabaseEncontrada: Boolean(sessionData.session),
        usuarioAutenticadoEncontrado: Boolean(sessionData.session?.user),
        respostaHttp: functionFailure.status,
        etapa: functionFailure.step,
        motivo: functionFailure.reason,
        erro: functionFailure.message,
      });
      if (handoffError || !data?.data?.tokenHash) {
        sessionStorage.removeItem("mikaon:handoff-active-attempt");
        sessionStorage.removeItem("mikaon:handoff-session-ready");
        sessionStorage.setItem(stateKey, JSON.stringify({ ...state, state: "failed", updatedAt: Date.now() } satisfies HandoffState));
        localStorage.removeItem(lockKey);
        if (ativo) setError(functionFailure.message ? `${functionFailure.reason}: ${functionFailure.message}` : functionFailure.reason);
        return;
      }

      traceHandoff("verify_otp_start", traceFields);
      debugJwt("início do verifyOtp", {
        authorizationPresente: Boolean(sessionData.session?.access_token),
        bearerEnviado: Boolean(sessionData.session?.access_token),
        sessaoSupabaseEncontrada: Boolean(sessionData.session),
        usuarioAutenticadoEncontrado: Boolean(sessionData.session?.user),
        tokenHashPresente: Boolean(data.data.tokenHash),
      });
      const { error: authError } = await supabase.auth.verifyOtp({ type: "email", token_hash: data.data.tokenHash });
      if (authError) {
        traceHandoff("verify_otp_failure", { ...traceFields, reason: authError.message });
        debugJwt("falha no verifyOtp", {
          authorizationPresente: Boolean(sessionData.session?.access_token),
          bearerEnviado: Boolean(sessionData.session?.access_token),
          sessaoSupabaseEncontrada: Boolean(sessionData.session),
          usuarioAutenticadoEncontrado: Boolean(sessionData.session?.user),
          jwtValido: false,
          pontoFalha: "supabase.auth.verifyOtp",
          erro: authError.message,
        });
        sessionStorage.removeItem("mikaon:handoff-active-attempt");
        sessionStorage.removeItem("mikaon:handoff-session-ready");
        sessionStorage.setItem(stateKey, JSON.stringify({ ...state, state: "failed", updatedAt: Date.now() } satisfies HandoffState));
        localStorage.removeItem(lockKey);
        if (ativo) setError(authError.message);
        return;
      }
      traceHandoff("verify_otp_success", traceFields);

      const { data: authenticatedSession } = await supabase.auth.getSession();
      if (authenticatedSession.session?.user) {
        traceHandoff("session_detected", { ...traceFields, userId: authenticatedSession.session.user.id });
        sessionStorage.setItem("mikaon:handoff-session-ready", authenticatedSession.session.user.id);
        window.dispatchEvent(new Event("mikaon:handoff-session-ready"));
      } else {
        traceHandoff("session_missing", traceFields);
        sessionStorage.removeItem("mikaon:handoff-active-attempt");
        sessionStorage.removeItem("mikaon:handoff-session-ready");
        sessionStorage.setItem(stateKey, JSON.stringify({ ...state, state: "failed", updatedAt: Date.now() } satisfies HandoffState));
        localStorage.removeItem(lockKey);
        if (ativo) setError("A sessão administrativa não ficou disponível. Volte ao painel e gere um novo acesso.");
        return;
      }
      debugJwt("verifyOtp concluído", {
        authorizationPresente: Boolean(authenticatedSession.session?.access_token),
        bearerEnviado: Boolean(authenticatedSession.session?.access_token),
        sessaoSupabaseEncontrada: Boolean(authenticatedSession.session),
        usuarioAutenticadoEncontrado: Boolean(authenticatedSession.session?.user),
        jwtValido: Boolean(authenticatedSession.session?.access_token),
        pontoFalha: null,
      });

      sessionStorage.setItem(stateKey, JSON.stringify({ ...state, state: "consumed", updatedAt: Date.now() } satisfies HandoffState));
      localStorage.setItem(consumedKey, new Date().toISOString());
      localStorage.removeItem(lockKey);
      traceHandoff("redirect_start", traceFields);
      debugHandoff("navegação concluída", { tokenPresente: false, handoffFingerprint });
      if (ativo) {
        navigate(location.pathname, { replace: true });
        traceHandoff("redirect_success", traceFields);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [location.hash, location.pathname, navigate, searchParams, slug]);

  return (
    <main className="public-pdv public-pdv--center">
      <section className="public-pdv-message">
        {error ? <><h1>Acesso administrativo indisponível</h1><p>{error}</p></> : <p>Validando acesso administrativo...</p>}
      </section>
    </main>
  );
}
