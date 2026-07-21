import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "./AuthContext";

function LoadingAuth() {
  return <main className="public-pdv public-pdv--center">Validando sessao...</main>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session, profile } = useAuth();

  if (loading) return <LoadingAuth />;
  if (!session || !profile) return <Navigate to="/" replace />;
  return children;
}
