import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicProfile from "../pages/connect/PublicProfile/PublicProfile";
import PublicEmpresaPage from "../pages/PublicEmpresaPage/PublicEmpresaPage";

import Dashboard from "../pages/dashboard/Dashboard";
import Empresas from "../pages/dashboard/Empresas";
import Configuracoes from "../pages/dashboard/Configuracoes";
import PainelCliente from "../pages/PainelCliente/PainelCliente";

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
