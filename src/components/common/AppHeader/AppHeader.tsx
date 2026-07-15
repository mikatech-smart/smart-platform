import type { ReactNode } from "react";

import "./AppHeader.css";

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export default function AppHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = "",
}: AppHeaderProps) {
  return (
    <header className={`app-header ${className}`.trim()}>
      <div className="app-header__copy">
        {eyebrow && <p className="app-header__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="app-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="app-header__actions">{actions}</div>}
    </header>
  );
}
