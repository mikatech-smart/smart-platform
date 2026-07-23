import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import { hasRbacPermission, type RbacPermission, type RbacCustomPermissions } from "./rbac";
import { isPlatformEnvironment } from "./RuntimeEnvironment";

export type AuthProfile = {
  id: string;
  empresaId: string | null;
  empresaSlug: string | null;
  empresaNome: string | null;
  nome: string;
  perfil: string;
  ativo: boolean;
  permissoes: RbacCustomPermissions;
};

type AuthContextValue = {
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  error: string;
  signOut: () => Promise<void>;
  can: (permission: RbacPermission) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function logAuthDiagnostic(event: string, data: Record<string, unknown>) {
  console.info("[MikaON AUTH DIAGNOSTIC]", event, data);
}

async function carregarPerfil(session: Session | null): Promise<AuthProfile | null> {
  if (!session?.user.id) return null;

  if (isPlatformEnvironment()) {
    const { data: admin, error: adminError } = await supabase
      .from("platform_admin_users")
      .select("id, email, nome, role, ativo")
      .eq("auth_user_id", session.user.id)
      .eq("ativo", true)
      .maybeSingle();

    if (adminError) throw adminError;
    logAuthDiagnostic("platform lookup", {
      authUserId: session.user.id,
      email: session.user.email || null,
      found: Boolean(admin),
      active: admin?.ativo ?? null,
      role: admin?.role ?? null,
    });
    if (!admin) return null;
    return {
      id: admin.id,
      empresaId: null,
      empresaSlug: null,
      empresaNome: null,
      nome: admin.nome || admin.email,
      perfil: "global_admin",
      ativo: admin.ativo,
      permissoes: {},
    };
  }

  const { data: globalAdmin, error: globalAdminError } = await supabase
    .from("platform_admin_users")
    .select("id, email, nome, role, ativo")
    .eq("auth_user_id", session.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (globalAdminError) throw globalAdminError;
  logAuthDiagnostic("erp global-admin lookup", {
    authUserId: session.user.id,
    email: session.user.email || null,
    found: Boolean(globalAdmin),
    active: globalAdmin?.ativo ?? null,
    role: globalAdmin?.role ?? null,
  });
  if (globalAdmin) {
    return {
      id: globalAdmin.id,
      empresaId: null,
      empresaSlug: null,
      empresaNome: null,
      nome: globalAdmin.nome || globalAdmin.email,
      perfil: "global_admin",
      ativo: globalAdmin.ativo,
      permissoes: {},
    };
  }

  const { data: usuario, error: usuarioError } = await supabase
    .from("erp_pdv_usuarios")
    .select("id, empresa_id, nome, perfil, ativo, permissoes")
    .eq("auth_user_id", session.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (usuarioError) throw usuarioError;
  logAuthDiagnostic("erp user lookup", {
    authUserId: session.user.id,
    email: session.user.email || null,
    found: Boolean(usuario),
    erpUserId: usuario?.id ?? null,
    empresaId: usuario?.empresa_id ?? null,
    perfil: usuario?.perfil ?? null,
    active: usuario?.ativo ?? null,
  });
  if (!usuario) return null;

  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .select("id, slug, nome")
    .eq("id", usuario.empresa_id)
    .maybeSingle();

  if (empresaError) throw empresaError;
  if (!empresa) return null;

  return {
    id: usuario.id,
    empresaId: usuario.empresa_id,
    empresaSlug: empresa.slug,
    empresaNome: empresa.nome,
    nome: usuario.nome,
    perfil: usuario.perfil,
    ativo: usuario.ativo,
    permissoes: (usuario.permissoes || {}) as RbacCustomPermissions,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function sincronizar(nextSession: Session | null) {
      if (!mounted) return;
      setSession(nextSession);
      setError("");

      if (!nextSession) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const nextProfile = await carregarPerfil(nextSession);
        if (!mounted) return;
        if (!nextProfile) {
          await supabase.auth.signOut();
          setProfile(null);
          setError("O usuario autenticado nao possui vinculo ativo.");
          return;
        }
        logAuthDiagnostic("resolved profile", {
          authUserId: nextSession.user.id,
          email: nextSession.user.email || null,
          profileId: nextProfile.id,
          perfil: nextProfile.perfil,
          empresaId: nextProfile.empresaId,
          empresaSlug: nextProfile.empresaSlug,
          ativo: nextProfile.ativo,
        });
        setProfile(nextProfile);
      } catch (cause) {
        if (!mounted) return;
        await supabase.auth.signOut();
        setProfile(null);
        setError(cause instanceof Error ? cause.message : "Nao foi possivel validar o usuario.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void supabase.auth.getSession().then(({ data }) => sincronizar(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void sincronizar(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      error,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      can: (permission) => hasRbacPermission(profile?.perfil, permission, undefined, profile?.permissoes),
    }),
    [error, loading, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}

export function mockLoginEnabled() {
  return import.meta.env.VITE_ENABLE_MOCK_LOGIN === "true";
}
