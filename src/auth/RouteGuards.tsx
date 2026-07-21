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

  if (isPlatformEnvironment()) return <Navigate to="/admin" replace />;
  if (mockLoginEnabled() && sessionStorage.getItem("mikaon:mock-login-role")) return children;
  if (loading) return <LoadingAuth />;
  if (!session || !profile) return <Navigate to={`/pdv/${slug || "mikatech"}`} replace />;
  if (!profile.empresaSlug) return <Navigate to="/admin" replace />;
  if (slug !== profile.empresaSlug) return <Navigate to={`/empresa/${profile.empresaSlug}`} replace />;
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
  return children;
}
