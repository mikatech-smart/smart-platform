import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { mockLoginEnabled, useAuth } from "./AuthContext";
import { isErpEnvironment, isPlatformEnvironment } from "./RuntimeEnvironment";

function LoadingAuth() {
  return <main className="public-pdv public-pdv--center">Validando sessao...</main>;
}

export function RequireCompanyAuth({ children }: { children: ReactNode }) {
  const { slug } = useParams();
  const { loading, session, profile } = useAuth();

  const logAuthorization = (result: string, reason: string) => {
    console.info("[MIKAON AUTH DEBUG] authorization", {
      userId: session?.user.id || null,
      email: session?.user.email || null,
      perfil: profile?.perfil || null,
      empresaSlug: profile?.empresaSlug || null,
      empresaId: profile?.empresaId || null,
      isPlatformAdmin: profile?.perfil === "global_admin",
      global_admin: profile?.perfil === "global_admin",
      urlSlug: slug || null,
      result,
      reason,
    });
  };

  if (isPlatformEnvironment()) return <Navigate to="/admin" replace />;
  if (!isErpEnvironment()) return <Navigate to="/" replace />;
  if (mockLoginEnabled() && sessionStorage.getItem("mikaon:mock-login-role")) return children;
  if (loading) {
    logAuthorization("pending", "auth_context_loading");
    return <LoadingAuth />;
  }
  if (!session || !profile) {
    logAuthorization("blocked", "missing_session_or_profile");
    return <Navigate to={slug ? `/pdv/${slug}` : "/"} replace />;
  }
  if (profile.perfil === "global_admin") {
    logAuthorization("allowed", "global_admin");
    return children;
  }
  if (!profile.empresaSlug) {
    logAuthorization("blocked", "profile_without_company_slug");
    return <Navigate to="/admin" replace />;
  }
  if (slug !== profile.empresaSlug) {
    logAuthorization("blocked", "url_slug_does_not_match_profile_slug");
    return <main className="public-pdv public-pdv--center">Acesso nao autorizado para esta empresa.</main>;
  }
  logAuthorization("allowed", "company_slug_matches_profile");
  return children;
}

export function RequirePlatformAuth({ children }: { children: ReactNode }) {
  const { loading, session, profile } = useAuth();

  if (isErpEnvironment()) return <Navigate to="/" replace />;
  if (mockLoginEnabled() && sessionStorage.getItem("mikaon:mock-login-role") === "administrador") return children;
  if (loading) return <LoadingAuth />;
  if (!session || !profile || profile.perfil !== "global_admin") {
    return <main className="public-pdv public-pdv--center">Acesso de plataforma negado.</main>;
  }
  return children;
}

export function RequireErpEnvironment({ children }: { children: ReactNode }) {
  if (isPlatformEnvironment()) return <Navigate to="/admin" replace />;
  if (!isErpEnvironment()) return <Navigate to="/" replace />;
  return children;
}
