import { Building2, Settings } from "lucide-react";

import { AppSidebar, type AppSidebarGroup } from "../../common/AppSidebar";

const groups: AppSidebarGroup[] = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", icon: Building2, label: "Empresas", end: true },
      { to: "/dashboard/configuracoes", icon: Settings, label: "Configurações" },
    ],
  },
];

interface SidebarProps {
  nomeEmpresa?: string;
  logoEmpresa?: string | null;
}

export default function Sidebar({ nomeEmpresa, logoEmpresa }: SidebarProps) {
  return (
    <AppSidebar
      nomeEmpresa={nomeEmpresa}
      logoEmpresa={logoEmpresa}
      groups={groups}
    />
  );
}
