import { Boxes, LayoutDashboard, Settings2, Tags, Waypoints } from "lucide-react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { buscarEmpresaPorSlug } from "../services/empresa/empresa.service";
import { useAuth } from "../auth/AuthContext";
import "./EmpresaLayout.css";

export default function EmpresaLayout() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [empresa, setEmpresa] = useState<{ nome: string; logo?: string | null }>({ nome: slug });

  useEffect(() => {
    void buscarEmpresaPorSlug(slug).then(({ data }) => {
      if (data) setEmpresa({ nome: data.nome || slug, logo: data.logo });
    });
  }, [slug]);

  const itens = [
    [`/empresa/${slug}`, "Dashboard", LayoutDashboard, true, undefined],
    [`/empresa/${slug}/produtos`, "Produtos", Boxes, false],
    [`/empresa/${slug}/categorias`, "Categorias", Tags, false],
    [`/empresa/${slug}/configuracoes`, "Configurações", Settings2, false],
    [`/empresa/${slug}/canais`, "Canais públicos", Waypoints, false],
  ] as const;

  async function sair() {
    sessionStorage.removeItem("mikaon:mock-login-role");
    sessionStorage.removeItem("mikaon:mock-login-slug");
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="empresa-shell">
      <aside className="empresa-sidebar">
        <div className="empresa-brand">
          {empresa.logo ? <img src={empresa.logo} alt={empresa.nome} /> : <div className="empresa-brand-mark">M</div>}
          <div><strong>{empresa.nome}</strong><span>ERP da empresa</span></div>
        </div>
        <nav>{itens.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "empresa-nav-item is-active" : "empresa-nav-item"}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      </aside>
      <main className="empresa-main">
        <header className="empresa-header">
          <div><span className="empresa-kicker">Empresa ativa</span><h1>{empresa.nome}</h1></div>
          <div className="empresa-user"><strong>{profile?.nome || "Usuário"}</strong><span>Perfil: {profile?.perfil || "Empresa"}</span></div>
          <button type="button" className="empresa-user-menu" onClick={() => void sair()} aria-label="Sair do ERP">Sair</button>
        </header>
        <div className="empresa-content"><Outlet /></div>
      </main>
    </div>
  );
}
