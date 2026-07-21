import { Building2, ClipboardList, CreditCard, LayoutDashboard, Settings2, Tags } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandConfig } from "../config/brand";
import { useAuth } from "../auth/AuthContext";
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
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  async function sair() {
    sessionStorage.removeItem("mikaon:mock-login-role");
    sessionStorage.removeItem("mikaon:mock-login-slug");
    await signOut();
    navigate("/", { replace: true });
  }

  return <div className="master-shell"><aside className="master-sidebar"><div className="master-brand"><div className="master-brand-mark">M</div><div><strong>{BrandConfig.platformName}</strong><span>Painel Master</span></div></div><nav>{itens.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "master-nav-item is-active" : "master-nav-item"}><Icon size={18} /><span>{label}</span></NavLink>)}</nav></aside><main className="master-main"><header className="master-header"><div><span className="master-kicker">Plataforma SaaS</span><h1>Administracao da plataforma</h1></div><div className="master-user"><strong>{profile?.nome || "Administrador"}</strong><span>{profile?.perfil || "Plataforma"}</span><button type="button" onClick={() => void sair()}>Sair</button></div></header><div className="master-content"><Outlet /></div></main></div>;
}
