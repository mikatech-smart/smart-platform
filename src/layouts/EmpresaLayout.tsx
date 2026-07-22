import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { buscarEmpresaPorSlug } from "../services/empresa/empresa.service";
import { useAuth } from "../auth/AuthContext";
import { hasRbacPermission, type RbacPermission } from "../auth/rbac";
import { getEmpresaRoutes } from "../navigation/empresaRoutes";
import "./EmpresaLayout.css";

export default function EmpresaLayout() {
  const { slug = "" } = useParams(); const navigate = useNavigate(); const { profile, signOut } = useAuth();
  const [empresa, setEmpresa] = useState<{ nome: string; logo?: string | null }>({ nome: slug });
  useEffect(() => { void buscarEmpresaPorSlug(slug).then(({ data }) => { if (data) setEmpresa({ nome: data.nome || slug, logo: data.logo }); }); }, [slug]);
  const itens = getEmpresaRoutes(slug);
  async function sair() { sessionStorage.removeItem("mikaon:mock-login-role"); sessionStorage.removeItem("mikaon:mock-login-slug"); await signOut(); navigate("/", { replace: true }); }
  return <div className="empresa-shell"><aside className="empresa-sidebar"><div className="empresa-brand">{empresa.logo ? <img src={empresa.logo} alt={empresa.nome} /> : <div className="empresa-brand-mark">M</div>}<div><strong>{empresa.nome}</strong><span>ERP da empresa</span></div></div><nav>{itens.map(({ to, label, icon: Icon, end, permission }) => permission && !hasRbacPermission(profile?.perfil, permission as RbacPermission, undefined, profile?.permissoes) ? null : <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "empresa-nav-item is-active" : "empresa-nav-item"}><Icon size={18} /><span>{label}</span></NavLink>)}</nav></aside><main className="empresa-main"><header className="empresa-header"><div><span className="empresa-kicker">Empresa ativa</span><h1>{empresa.nome}</h1></div><div className="empresa-user"><strong>{profile?.nome || "Usuário"}</strong><span>Perfil: {profile?.perfil || "Empresa"}</span></div><button type="button" className="empresa-user-menu" onClick={() => void sair()} aria-label="Sair do ERP">Sair</button></header><div className="empresa-content"><Outlet /></div></main></div>;
}
