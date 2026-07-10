import {
  Building2,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { BrandConfig } from "../../../config/brand";
import "./Sidebar.css";

const menu = [
  {
    to: "/dashboard",
    icon: Building2,
    title: "Empresas",
    end: true,
  },
  {
    to: "/dashboard/configuracoes",
    icon: Settings,
    title: "Configurações",
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
  const nomeWorkspace = nomeEmpresa || `${BrandConfig.platformName} Admin`;

  return (
    <aside className="dashboard-sidebar w-72 bg-white border-r min-h-screen shadow-sm">
      <div className="dashboard-sidebar__brand p-8">
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
              Painel Administrativo
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {BrandConfig.poweredByText}
            </p>
          </div>
        </div>
      </div>

      <nav className="dashboard-sidebar__nav px-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? "dashboard-sidebar__link w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 text-green-700 transition text-left mb-2"
                  : "dashboard-sidebar__link w-full flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition text-left mb-2"
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
