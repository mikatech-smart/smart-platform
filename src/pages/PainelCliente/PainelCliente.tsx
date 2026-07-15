import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import EmpresaForm from "../../components/dashboard/EmpresaForm";
import Sidebar from "../../components/dashboard/Sidebar";
import { AppShell } from "../../components/common/AppShell";
import { BrandConfig } from "../../config/brand";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import type { Empresa } from "../../models/Empresa";

function recursoPainelClienteAtivo(empresa: Empresa) {
  const empresaComRecursos = empresa as Empresa & {
    recursos_contratados?: {
      painel_cliente?: unknown;
    } | null;
  };

  if (!empresaComRecursos.recursos_contratados) {
    return true;
  }

  return empresaComRecursos.recursos_contratados.painel_cliente !== false;
}

export default function PainelCliente() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarEmpresa() {
      if (!slug) {
        setErro("Informe o slug da empresa para acessar o painel.");
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error) {
        console.error("Erro ao carregar painel do cliente:", error);
        setErro("Não foi possível carregar esta empresa.");
        setCarregando(false);
        return;
      }

      if (!data) {
        setErro("Empresa não encontrada.");
        setCarregando(false);
        return;
      }

      setEmpresa(data);
      setCarregando(false);
    }

    carregarEmpresa();
  }, [slug]);

  if (carregando) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 p-4 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 text-slate-500 shadow-sm md:p-6">
          Carregando painel...
        </div>
      </main>
    );
  }

  if (erro || !empresa) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 p-4 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 text-slate-600 shadow-sm md:p-6">
          {erro || "Empresa não encontrada."}
        </div>
      </main>
    );
  }

  if (empresa.tipo !== "cliente") {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 p-4 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {empresa.nome || "Empresa"}
          </h1>

          <p className="mt-2 text-slate-600">
            Esta empresa é administrada pela {BrandConfig.developerCompany}.
          </p>
        </div>
      </main>
    );
  }

  if (!recursoPainelClienteAtivo(empresa)) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-slate-100 p-4 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-amber-600">
            Nao contratado
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Painel do Cliente indisponivel
          </h1>

          <p className="mt-2 text-slate-600">
            Este recurso nao esta ativo no plano contratado por {empresa.nome || "esta empresa"}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <AppShell
      sidebar={<Sidebar nomeEmpresa={empresa.nome} logoEmpresa={empresa.logo} />}
      title="Painel da Empresa"
      subtitle={`Edite as informações públicas de ${empresa.nome || "sua empresa"}.`}
      contentClassName="overflow-x-hidden p-4 md:p-10"
    >
      <div className="mx-auto max-w-6xl min-w-0 space-y-6">
        <EmpresaForm
          empresaInicialId={empresa.id}
          empresaInicialSlug={empresa.slug}
          modoCliente
        />
      </div>
    </AppShell>
  );
}
