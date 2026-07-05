import {
  Building2,
  LayoutDashboard,
  Send,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menu = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    to: "/dashboard/empresas",
    icon: Building2,
    title: "Empresa",
  },
  {
    to: "/dashboard/empresa",
    icon: Building2,
    title: "Workspace",
  },
  {
    to: "/dashboard/publicar",
    icon: Send,
    title: "Publicar",
  },
];

interface SidebarProps {
  nomeEmpresa?: string;
  logoEmpresa?: string | null;
}

export default function Sidebar({
  nomeEmpresa,
  logoEmpresa,
}: SidebarProps) {
  const nomeWorkspace = nomeEmpresa || "Empresa";

  return (
    <aside className="w-72 bg-white border-r min-h-screen shadow-sm">
      <div className="p-8">
        <div className="flex items-center gap-3">
          {logoEmpresa && (
            <img
              src={logoEmpresa}
              alt={nomeWorkspace}
              className="h-12 w-12 rounded-xl border object-cover"
            />
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-green-600">
              {nomeWorkspace}
            </h1>

            <p className="text-gray-500 mt-1">
              Workspace da Empresa
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Powered by Mika Connect
            </p>
          </div>
        </div>
      </div>

      <nav className="px-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                isActive
                  ? "w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 text-green-700 transition text-left mb-2"
                  : "w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition text-left mb-2"
              }
            >
              <Icon size={22} />

              <span className="font-medium">
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
