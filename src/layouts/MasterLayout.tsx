import { Building2, ClipboardList, CreditCard, LayoutDashboard, Settings2, Tags } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { BrandConfig } from "../config/brand";
import "./MasterLayout.css";

const itens = [
  ["/admin", "Dashboard", LayoutDashboard, true],
  ["/admin/empresas", "Empresas", Building2, false],
  ["/admin/planos", "Planos", Tags, false],
  ["/admin/assinaturas", "Assinaturas", CreditCard, false],
  ["/admin/configuracoes", "Configurações da Plataforma", Settings2, false],
  ["/admin/auditoria", "Auditoria", ClipboardList, false],
] as const;

export default function MasterLayout() {
  return <div className="master-shell"><aside className="master-sidebar"><div className="master-brand"><div className="master-brand-mark">M</div><div><strong>{BrandConfig.platformName}</strong><span>Painel Master</span></div></div><nav>{itens.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "master-nav-item is-active" : "master-nav-item"}><Icon size={18} /><span>{label}</span></NavLink>)}</nav></aside><main className="master-main"><header className="master-header"><div><span className="master-kicker">Plataforma SaaS</span><h1>Administração da plataforma</h1></div><div className="master-user"><strong>Administrador</strong><span>MiKATECH</span></div></header><div className="master-content"><Outlet /></div></main></div>;
}
