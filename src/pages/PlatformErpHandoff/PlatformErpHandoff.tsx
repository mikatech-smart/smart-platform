import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { supabase } from "../../lib/supabase";

export default function PlatformErpHandoff() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("handoff");
    if (!token || !slug) {
      setError("Acesso administrativo incompleto.");
      return;
    }

    let ativo = true;
    void (async () => {
      const { data, error: handoffError } = await supabase.functions.invoke("accept-platform-erp-handoff", {
        body: { token },
      });
      if (handoffError || !data?.data?.tokenHash) {
        if (ativo) setError(handoffError?.message || data?.error || "Acesso administrativo expirado.");
        return;
      }

      const { error: authError } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.data.tokenHash,
      });
      if (!ativo) return;
      if (authError) {
        setError(authError.message);
        return;
      }
      navigate(`/empresa/${encodeURIComponent(slug)}`, { replace: true });
    })();

    return () => {
      ativo = false;
    };
  }, [navigate, searchParams, slug]);

  return (
    <main className="public-pdv public-pdv--center">
      <section className="public-pdv-message">
        {error ? <><h1>Acesso administrativo indisponivel</h1><p>{error}</p></> : <p>Validando acesso administrativo...</p>}
      </section>
    </main>
  );
}
