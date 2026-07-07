import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import EmpresaForm from "../../components/dashboard/EmpresaForm";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import type { Empresa } from "../../models/Empresa";

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
        setErro("Nao foi possivel carregar esta empresa.");
        setCarregando(false);
        return;
      }

      if (!data) {
        setErro("Empresa nao encontrada.");
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
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
          Carregando painel...
        </div>
      </main>
    );
  }

  if (erro || !empresa) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
          {erro || "Empresa nao encontrada."}
        </div>
      </main>
    );
  }

  if (empresa.tipo !== "cliente") {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            {empresa.nome || "Empresa"}
          </h1>

          <p className="mt-2 text-slate-600">
            Esta empresa e administrada pela Mikatech.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Painel da Empresa
          </h1>

          <p className="mt-2 text-slate-500">
            Edite as informacoes publicas de {empresa.nome || "sua empresa"}.
          </p>
        </header>

        <EmpresaForm
          empresaInicialId={empresa.id}
          empresaInicialSlug={empresa.slug}
          modoCliente
        />
      </div>
    </main>
  );
}
