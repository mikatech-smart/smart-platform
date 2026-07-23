import { Outlet } from "react-router-dom";

import Sidebar from "../../components/dashboard/Sidebar";
import { BrandConfig } from "../../config/brand";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="px-10 py-8">
            <h1 className="text-4xl font-bold">
              Dashboard {BrandConfig.platformName}
            </h1>

            <p className="text-gray-500 mt-2">
              Bem-vindo ao painel administrativo.
            </p>
          </div>
        </header>

        <div className="p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
