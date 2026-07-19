import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";

import PublicProfile from "../pages/connect/PublicProfile/PublicProfile";
import PublicEmpresaPage from "../pages/PublicEmpresaPage/PublicEmpresaPage";
import PublicLandingPage from "../pages/PublicLandingPage/PublicLandingPage";
import PublicCardapioPage from "../pages/PublicCardapioPage/PublicCardapioPage";
import PublicCatalogoPage from "../pages/PublicCatalogoPage/PublicCatalogoPage";
import PublicAgendamentoPage from "../pages/PublicAgendamentoPage/PublicAgendamentoPage";
import PublicWifiMarketingPage from "../pages/PublicWifiMarketingPage/PublicWifiMarketingPage";
import PublicFidelidadePage from "../pages/PublicFidelidadePage/PublicFidelidadePage";
import PublicPdvPage from "../pages/PublicPdvPage/PublicPdvPage";

import Dashboard from "../pages/dashboard/Dashboard";
import Empresas from "../pages/dashboard/Empresas";
import Configuracoes from "../pages/dashboard/Configuracoes";
import PainelCliente from "../pages/PainelCliente/PainelCliente";
import MasterLayout from "../layouts/MasterLayout";
import MasterHome from "../pages/admin/MasterHome";
import MasterPlaceholder from "../pages/admin/MasterPlaceholder";
import EmpresaLayout from "../layouts/EmpresaLayout";
import EmpresaHome from "../pages/empresa/EmpresaHome";
import EmpresaProdutos from "../pages/empresa/EmpresaProdutos";
import EmpresaCategorias from "../pages/empresa/EmpresaCategorias";

function MockCaixaRouteGuard({ children }: { children: ReactNode }) {
  const mockRole = sessionStorage.getItem("mikaon:mock-login-role");
  const slug = sessionStorage.getItem("mikaon:mock-login-slug") || "mikatech";

  if (mockRole === "caixa" || mockRole === "estoque") {
    return <Navigate to={`/pdv/${slug}`} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página pública */}
        <Route
          path="/"
          element={<PublicProfile />}
        />

        <Route
          path="/connect/:slug"
          element={<PublicProfile />}
        />

        <Route
          path="/landing/:slug"
          element={<PublicLandingPage />}
        />

        <Route
          path="/cardapio/:slug"
          element={<PublicCardapioPage />}
        />

        <Route
          path="/catalogo/:slug"
          element={<PublicCatalogoPage />}
        />

        <Route
          path="/agendamento/:slug"
          element={<PublicAgendamentoPage />}
        />

        <Route
          path="/wifi/:slug"
          element={<PublicWifiMarketingPage />}
        />

        <Route
          path="/fidelidade/:slug"
          element={<PublicFidelidadePage />}
        />

        <Route
          path="/pdv/:slug"
          element={<PublicPdvPage />}
        />

        <Route path="/admin" element={<MasterLayout />}>
          <Route index element={<MasterHome />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="planos" element={<MasterPlaceholder title="Planos" />} />
          <Route path="assinaturas" element={<MasterPlaceholder title="Assinaturas" />} />
          <Route path="configuracoes" element={<MasterPlaceholder title="Configurações da Plataforma" />} />
          <Route path="auditoria" element={<MasterPlaceholder title="Auditoria" />} />
        </Route>

        <Route path="/empresa/:slug" element={<EmpresaLayout />}>
          <Route index element={<EmpresaHome />} />
          <Route path="produtos" element={<EmpresaProdutos />} />
          <Route path="categorias" element={<EmpresaCategorias />} />
        </Route>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <MockCaixaRouteGuard>
              <Dashboard />
            </MockCaixaRouteGuard>
          }
        >
          <Route index element={<Empresas />} />

          <Route
            path="empresas"
            element={<Empresas />}
          />

          <Route
            path="configuracoes"
            element={<Configuracoes />}
          />

        </Route>

        <Route path="/painel">
          <Route index element={<PainelCliente />} />

          <Route
            path=":slug"
            element={<PainelCliente />}
          />
        </Route>

        <Route
          path="/:slug"
          element={<PublicEmpresaPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}
