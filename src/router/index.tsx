import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicProfile from "../pages/connect/PublicProfile/PublicProfile";

import Dashboard from "../pages/dashboard/Dashboard";
import DashboardHome from "../pages/dashboard/DashboardHome";
import Empresa from "../pages/dashboard/Empresa";
import Publicar from "../pages/dashboard/Publicar";

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
            path="empresa"
            element={<Empresa />}
          />

          <Route
            path="publicar"
            element={<Publicar />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}