import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getMockRole, hasRbacPermission, logAccessDenied, type RbacPermission } from "./rbac";

export function canAccessPermission(permission: RbacPermission, profile?: string | null) {
  return hasRbacPermission(profile || getMockRole(), permission);
}

export function RequirePermission({ permission, children }: { permission: RbacPermission; children: ReactNode }) {
  const location = useLocation();
  const { profile } = useAuth();
  if (!hasRbacPermission(profile?.perfil, permission, undefined, profile?.permissoes)) {
    logAccessDenied(permission, location.pathname);
    return <Navigate to=".." replace />;
  }
  return children;
}

export function PermissionGate({ permission, children, fallback = null }: { permission: RbacPermission; children: ReactNode; fallback?: ReactNode }) {
  const { profile } = useAuth();
  return canAccessPermission(permission, profile?.perfil) ? children : fallback;
}
