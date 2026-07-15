import type { ReactNode } from "react";

import { AppHeader } from "../AppHeader";
import "./AppShell.css";

export interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function AppShell({
  children,
  sidebar,
  header,
  title,
  subtitle,
  eyebrow,
  actions,
  breadcrumb,
  className = "",
  contentClassName = "",
}: AppShellProps) {
  return (
    <div className={`app-shell ${className}`.trim()}>
      {sidebar ? <aside className="app-shell__sidebar">{sidebar}</aside> : null}
      <div className="app-shell__main">
        {header || title ? (
          header || (
            <AppHeader
              title={title || ""}
              subtitle={subtitle}
              eyebrow={eyebrow}
              actions={actions}
            />
          )
        ) : null}
        {breadcrumb ? (
          <nav className="app-shell__breadcrumb" aria-label="Navegação estrutural">
            {breadcrumb}
          </nav>
        ) : null}
        <main className={`app-shell__content ${contentClassName}`.trim()}>
          {children}
        </main>
      </div>
    </div>
  );
}
