import {
  ArrowDownUp,
  Banknote,
  Boxes,
  LayoutDashboard,
  Link2,
  Monitor,
  Printer,
  Settings2,
  Tags,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

export type EmpresaRouteKey =
  | "dashboard"
  | "produtos"
  | "categorias"
  | "pdv"
  | "caixa"
  | "estoque"
  | "movimentacoes"
  | "impressoras"
  | "configuracoes"
  | "canais"
  | "colaboradores"
  | "links";

export type EmpresaRoute = {
  key: EmpresaRouteKey;
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  end?: boolean;
};

export function getEmpresaRoutes(slug: string): EmpresaRoute[] {
  const base = `/empresa/${slug}`;

  return [
    { key: "dashboard", label: "Dashboard", to: base, icon: LayoutDashboard, end: true },
    { key: "produtos", label: "Produtos", to: `${base}/produtos`, icon: Boxes },
    { key: "categorias", label: "Categorias", to: `${base}/categorias`, icon: Tags },
    { key: "pdv", label: "PDV", to: `${base}/pdv`, icon: Monitor },
    { key: "caixa", label: "Caixa", to: `${base}/caixa`, icon: Banknote },
    { key: "estoque", label: "Estoque", to: `${base}/estoque`, icon: Boxes },
    { key: "movimentacoes", label: "Movimentacoes", to: `${base}/movimentacoes`, icon: ArrowDownUp },
    { key: "impressoras", label: "Impressoras", to: `${base}/impressoras`, icon: Printer },
    { key: "configuracoes", label: "Configuracoes", to: `${base}/configuracoes`, icon: Settings2 },
    { key: "canais", label: "Canais publicos", to: `${base}/canais`, icon: Waypoints },
    { key: "colaboradores", label: "Colaboradores", to: `${base}/colaboradores`, icon: Users, permission: "usuarios.visualizar" },
    { key: "links", label: "Links", to: `${base}/links`, icon: Link2 },
  ];
}
