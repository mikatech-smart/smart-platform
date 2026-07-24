import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";

const HANDOFF_LOCK_TTL_MS = 120_000;

function debugHandoff(event: string, details: Record<string, unknown> = {}) {
  console.info("[MIKAON HANDOFF DEBUG]", event, { ...details, at: new Date().toISOString() });
}

async function getHandoffKey(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 24);
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

export default function PlatformErpHandoff() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const startedRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("handoff");
    if (!token || !slug) {
      setError("Acesso administrativo incompleto.");
      return;
    }

    if (startedRef.current) {
      debugHandoff("chamada duplicada detectada", { tokenPresente: true, tentativa: "repetida" });
      return;
    }
    startedRef.current = true;

    let ativo = true;
    void (async () => {
      const handoffKey = await getHandoffKey(token);
      const lockKey = `mikaon:handoff-lock:${handoffKey}`;
      const consumedKey = `mikaon:handoff-consumed:${handoffKey}`;
      const attemptKey = `mikaon:handoff-attempt:${handoffKey}`;
      const previousAttempt = Number(sessionStorage.getItem(attemptKey) || "0");
      const attempt = previousAttempt + 1;
      sessionStorage.setItem(attemptKey, String(attempt));

      debugHandoff("início do consumo", { tokenPresente: true, tentativa: attempt === 1 ? 1 : "repetida" });
      if (localStorage.getItem(consumedKey)) {
        debugHandoff("handoff já consumido", { tokenPresente: true, tentativa: "repetida" });
        if (ativo) setError("Este acesso administrativo já foi utilizado.");
        return;
      }

      const now = Date.now();
      const currentLock = localStorage.getItem(lockKey);
      const currentLockTime = currentLock ? Number(currentLock.split(":")[0]) : 0;
      if (currentLockTime && now - currentLockTime < HANDOFF_LOCK_TTL_MS) {
        debugHandoff("chamada duplicada detectada", { tokenPresente: true, tentativa: "repetida" });
        if (ativo) setError("Este acesso administrativo já está sendo processado.");
        return;
      }

      const lockOwner = `${now}:${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(lockKey, lockOwner);
      if (localStorage.getItem(lockKey) !== lockOwner) {
        debugHandoff("chamada duplicada detectada", { tokenPresente: true, tentativa: "repetida" });
        if (ativo) setError("Este acesso administrativo já está sendo processado.");
        return;
      }

      debugHandoff("chamada enviada", { tokenPresente: true, tentativa: attempt === 1 ? 1 : "repetida" });
      const { data, error: handoffError } = await supabase.functions.invoke("accept-platform-erp-handoff", {
        body: { token },
      });
      const functionFailure = await readFunctionError(data, handoffError);
      debugHandoff("resposta da Function", {
        respostaHttp: functionFailure.status,
        etapa: functionFailure.step,
        motivo: functionFailure.reason,
      });
      if (handoffError || !data?.data?.tokenHash) {
        localStorage.removeItem(lockKey);
        if (ativo) setError(functionFailure.message ? `${functionFailure.reason}: ${functionFailure.message}` : functionFailure.reason);
        return;
      }

      const { error: authError } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.data.tokenHash,
      });
      if (!ativo) return;
      if (authError) {
        localStorage.removeItem(lockKey);
        setError(authError.message);
        return;
      }
      localStorage.setItem(consumedKey, new Date().toISOString());
      localStorage.removeItem(lockKey);
      debugHandoff("navegação concluída", { tokenPresente: false });
      navigate(location.pathname, { replace: true });
    })();

    return () => {
      ativo = false;
    };
  }, [location.pathname, navigate, searchParams, slug]);

  return (
    <main className="public-pdv public-pdv--center">
      <section className="public-pdv-message">
        {error ? <><h1>Acesso administrativo indisponivel</h1><p>{error}</p></> : <p>Validando acesso administrativo...</p>}
      </section>
    </main>
  );
}
