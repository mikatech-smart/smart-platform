import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import PublicProfile from "../pages/connect/PublicProfile/PublicProfile";
import PublicEmpresaPage from "../pages/PublicEmpresaPage/PublicEmpresaPage";

import Dashboard from "../pages/dashboard/Dashboard";
import DashboardHome from "../pages/dashboard/DashboardHome";
import Publicar from "../pages/dashboard/Publicar";
import Empresas from "../pages/dashboard/Empresas";
import EmpresaForm from "../components/dashboard/EmpresaForm";

function EmpresasRoute() {
  const navigate = useNavigate();

  return (
    <Empresas
      onSelecionarWorkspace={(slug) => {
        sessionStorage.setItem("dashboardWorkspaceSlug", slug);
      }}
      onNavigate={(view) => {
        if (view === "workspace") {
          navigate("/dashboard/empresa");
        }
      }}
    />
  );
}

function WorkspaceRoute() {
  const slug = sessionStorage.getItem("dashboardWorkspaceSlug") || undefined;

  return (
    <EmpresaForm empresaInicialSlug={slug} />
  );
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

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        >
          <Route index element={<DashboardHome />} />

          <Route
            path="empresas"
            element={<EmpresasRoute />}
          />

          <Route
            path="empresa"
            element={<WorkspaceRoute />}
          />

          <Route
            path="publicar"
            element={<Publicar />}
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
