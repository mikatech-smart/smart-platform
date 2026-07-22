import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import FirstAccessPage from "../pages/FirstAccessPage/FirstAccessPage";

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
import EmpresaMovimentacoes from "../pages/empresa/EmpresaMovimentacoes";
import EmpresaImpressoras from "../pages/empresa/EmpresaImpressoras";
import EmpresaConfiguracoes from "../pages/empresa/EmpresaConfiguracoes";
import EmpresaCanais from "../pages/empresa/EmpresaCanais";
import EmpresaColaboradores from "../pages/empresa/EmpresaColaboradores";
import EmpresaLinks from "../pages/empresa/EmpresaLinks";
import { RequireCompanyAuth, RequireErpEnvironment, RequirePlatformAuth } from "../auth/RouteGuards";
import { RequirePermission } from "../auth/PermissionGuard";
import { getRuntimeEnvironment } from "../auth/RuntimeEnvironment";

function RuntimeEntry() {
  return getRuntimeEnvironment() === "legacy" ? <PublicProfile /> : <PublicPdvPage />;
}

function RouterDebug() {
  const { pathname } = useLocation();

  useEffect(() => {
    const empresaPdv = pathname.match(/^\/empresa\/([^/]+)\/(pdv|caixa)$/);
    const pdvPublico = pathname.match(/^\/pdv\/([^/]+)$/);
    const componenteSelecionado = empresaPdv || pdvPublico ? "PublicPdvPage" : "outro";
    const modoSolicitado = empresaPdv?.[2] === "caixa" ? "caixa" : "pdv";
    const slug = empresaPdv?.[1] || pdvPublico?.[1] || null;

    console.info("[MikaON PDV DEBUG] router", {
      rotaAtual: pathname,
      pathname,
      slugRecebido: slug,
      componenteSelecionado,
      modoSolicitado: componenteSelecionado === "PublicPdvPage" ? modoSolicitado : null,
    });
  }, [pathname]);

  return null;
}

function MockCaixaRouteGuard({ children }: { children: ReactNode }) {
  const mockRole = sessionStorage.getItem("mikaon:mock-login-role");
  const slug = sessionStorage.getItem("mikaon:mock-login-slug") || "mikatech";

  if (mockRole === "caixa" || mockRole === "estoque") {
    console.info("[MikaON PDV DEBUG] redirect", {
      destino: `/pdv/${slug}`,
      motivo: "MockCaixaRouteGuard redirecionou operador para rota PDV",
      mockRole,
      slug,
    });
    return <Navigate to={`/pdv/${slug}`} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouterDebug />
      <Routes>

        {/* Página pública */}
        <Route
          path="/"
          element={<RuntimeEntry />}
        />

        <Route
          path="/connect/:slug"
          element={<RuntimeEntry />}
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
          element={<RequireErpEnvironment><PublicPdvPage /></RequireErpEnvironment>}
        />
        <Route path="/primeiro-acesso" element={<FirstAccessPage />} />

        <Route path="/admin" element={<RequirePlatformAuth><MasterLayout /></RequirePlatformAuth>}>
          <Route index element={<MasterHome />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="planos" element={<MasterPlaceholder title="Planos" />} />
          <Route path="assinaturas" element={<MasterPlaceholder title="Assinaturas" />} />
          <Route path="configuracoes" element={<MasterPlaceholder title="Configurações da Plataforma" />} />
          <Route path="auditoria" element={<MasterPlaceholder title="Auditoria" />} />
        </Route>

        <Route path="/empresa/:slug" element={<RequireCompanyAuth><EmpresaLayout /></RequireCompanyAuth>}>
          <Route index element={<EmpresaHome />} />
          <Route path="produtos" element={<RequirePermission permission="produto.visualizar"><EmpresaProdutos /></RequirePermission>} />
          <Route path="categorias" element={<RequirePermission permission="produto.visualizar"><EmpresaCategorias /></RequirePermission>} />
          <Route path="pdv" element={<RequirePermission permission="venda.criar"><PublicPdvPage /></RequirePermission>} />
          <Route path="caixa" element={<RequirePermission permission="caixa.abrir"><PublicPdvPage modo="caixa" /></RequirePermission>} />
          <Route path="movimentacoes" element={<RequirePermission permission="estoque.movimentar"><EmpresaMovimentacoes /></RequirePermission>} />
          <Route path="impressoras" element={<RequirePermission permission="empresa.configurar"><EmpresaImpressoras /></RequirePermission>} />
          <Route path="configuracoes" element={<RequirePermission permission="empresa.configurar"><EmpresaConfiguracoes /></RequirePermission>} />
          <Route path="canais" element={<RequirePermission permission="empresa.configurar"><EmpresaCanais /></RequirePermission>} />
          <Route path="colaboradores" element={<RequirePermission permission="usuarios.visualizar"><EmpresaColaboradores /></RequirePermission>} />
          <Route path="links" element={<RequirePermission permission="empresa.visualizar"><EmpresaLinks /></RequirePermission>} />
        </Route>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequirePlatformAuth>
              <MockCaixaRouteGuard>
                <Dashboard />
              </MockCaixaRouteGuard>
            </RequirePlatformAuth>
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
