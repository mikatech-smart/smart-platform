import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/dashboard/Sidebar";
import { BrandConfig } from "../../config/brand";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";

export default function Dashboard() {
  const [empresaAtual, setEmpresaAtual] = useState<{
    nome: string;
    logo?: string | null;
  } | null>(null);

  useEffect(() => {
    async function carregarEmpresaAtual() {
      const { data, error } = await buscarEmpresaPorSlug("mikatech");

      if (error) {
        console.error("Erro ao carregar branding da empresa:", error);
        return;
      }

      if (!data) return;

      setEmpresaAtual({
        nome: data.nome || "",
        logo: data.logo || "",
      });
    }

    carregarEmpresaAtual();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        nomeEmpresa={empresaAtual?.nome}
        logoEmpresa={empresaAtual?.logo}
      />

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
