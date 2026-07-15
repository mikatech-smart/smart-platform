import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { BrandConfig } from "../../../config/brand";
import "./AppSidebar.css";

export interface AppSidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface AppSidebarGroup {
  label?: string;
  items: AppSidebarItem[];
  defaultOpen?: boolean;
}

export interface AppSidebarProps {
  nomeEmpresa?: string;
  logoEmpresa?: string | null;
  groups: AppSidebarGroup[];
  footer?: ReactNode;
}

export default function AppSidebar({
  nomeEmpresa,
  logoEmpresa,
  groups,
  footer,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState(() =>
    groups.map((group) => group.defaultOpen !== false),
  );
  const nomeWorkspace = nomeEmpresa || `${BrandConfig.platformName} Admin`;

  function alternarGrupo(index: number) {
    setOpenGroups((current) =>
      current.map((isOpen, groupIndex) =>
        groupIndex === index ? !isOpen : isOpen,
      ),
    );
  }

  return (
    <aside className={`app-sidebar${collapsed ? " app-sidebar--collapsed" : ""}`}>
      <div className="app-sidebar__brand">
        {logoEmpresa ? (
          <img src={logoEmpresa} alt={nomeWorkspace} className="app-sidebar__logo" />
        ) : null}

        <div className="app-sidebar__brand-copy">
          <strong title={nomeWorkspace}>{nomeWorkspace}</strong>
          <span>Painel Administrativo</span>
          <small>{BrandConfig.poweredByText}</small>
        </div>

        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      <nav className="app-sidebar__nav" aria-label="Navegação administrativa">
        {groups.map((group, index) => (
          <section className="app-sidebar__group" key={group.label || index}>
            {!collapsed && group.label ? (
              <button
                type="button"
                className="app-sidebar__group-toggle"
                onClick={() => alternarGrupo(index)}
                aria-expanded={openGroups[index]}
              >
                <span>{group.label}</span>
                <ChevronDown
                  size={15}
                  className={openGroups[index] ? "" : "app-sidebar__chevron--closed"}
                />
              </button>
            ) : null}

            {openGroups[index] || collapsed ? (
              <div className="app-sidebar__items">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `app-sidebar__link${isActive ? " app-sidebar__link--active" : ""}`
                      }
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ) : null}
          </section>
        ))}
      </nav>

      {footer ? <div className="app-sidebar__footer">{footer}</div> : null}
    </aside>
  );
}
