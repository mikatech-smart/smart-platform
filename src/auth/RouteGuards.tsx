import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";

import { mockLoginEnabled, useAuth } from "./AuthContext";
import { isErpEnvironment, isPlatformEnvironment } from "./RuntimeEnvironment";

function LoadingAuth() {
  return <main className="public-pdv public-pdv--center">Validando sessao...</main>;
}

function logGuardRedirect(destino: string, motivo: string, valores: Record<string, unknown>) {
  console.info("[MikaON PDV DEBUG] redirect", {
    destino,
    motivo,
    ...valores,
  });
}

export function RequireCompanyAuth({ children }: { children: ReactNode }) {
  const { slug } = useParams();
  const { loading, session, profile } = useAuth();

  if (isPlatformEnvironment()) {
    logGuardRedirect("/admin", "hostname de plataforma", { slug });
    return <Navigate to="/admin" replace />;
  }
  if (!isErpEnvironment()) {
    logGuardRedirect("/", "hostname nao e ERP", { slug });
    return <Navigate to="/" replace />;
  }
  if (mockLoginEnabled() && sessionStorage.getItem("mikaon:mock-login-role")) return children;
  if (loading) return <LoadingAuth />;
  if (!session || !profile) {
    const destino = `/pdv/${slug || "mikatech"}`;
    logGuardRedirect(destino, "sessao ou perfil ausente", {
      slug,
      sessao: Boolean(session),
      perfil: Boolean(profile),
    });
    return <Navigate to={destino} replace />;
  }
  if (!profile.empresaSlug) {
    logGuardRedirect("/admin", "perfil sem empresa", { slug, perfil: profile.perfil });
    return <Navigate to="/admin" replace />;
  }
  if (slug !== profile.empresaSlug) {
    const destino = `/empresa/${profile.empresaSlug}`;
    logGuardRedirect(destino, "slug da rota diferente do perfil", {
      slug,
      perfilEmpresaSlug: profile.empresaSlug,
    });
    return <Navigate to={destino} replace />;
  }
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
  if (isPlatformEnvironment()) {
    logGuardRedirect("/admin", "rota ERP acessada no hostname de plataforma", {
      pathname: window.location.pathname,
    });
    return <Navigate to="/admin" replace />;
  }
  if (!isErpEnvironment()) {
    logGuardRedirect("/", "rota ERP acessada fora do hostname ERP", {
      pathname: window.location.pathname,
    });
    return <Navigate to="/" replace />;
  }
  return children;
}
