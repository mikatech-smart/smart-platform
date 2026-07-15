import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../../components/dashboard/Sidebar";
import { AppShell } from "../../components/common/AppShell";
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
    <AppShell
      sidebar={
        <Sidebar
          nomeEmpresa={empresaAtual?.nome}
          logoEmpresa={empresaAtual?.logo}
        />
      }
      title={`Dashboard ${BrandConfig.platformName}`}
      subtitle="Bem-vindo ao painel administrativo."
      contentClassName="p-10"
    >
      <Outlet />
    </AppShell>
  );
}
