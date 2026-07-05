import {
  Building2,
  Eye,
  MessageCircle,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import Sidebar from "../../components/dashboard/Sidebar";
import EmpresaForm from "../../components/dashboard/EmpresaForm";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import Empresas from "./Empresas";

type TelaDashboard = "dashboard" | "empresas" | "workspace";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<TelaDashboard>("dashboard");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
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
        activeView={activeView}
        onNavigate={(view) => setActiveView(view as TelaDashboard)}
      />

      <main className="flex-1">

        {/* Cabeçalho */}

        <header className="bg-white shadow-sm">

          <div className="px-10 py-8">

            <h1 className="text-4xl font-bold">
              Dashboard Mikatech
            </h1>

            <p className="text-gray-500 mt-2">
              Bem-vindo ao painel administrativo.
            </p>

          </div>

        </header>

        <div className="p-10">

          {activeView === "empresas" ? (
            <Empresas
              onSelecionarWorkspace={(slug) => {
                setWorkspaceSlug(slug);
              }}
              onNavigate={(view) => setActiveView(view as TelaDashboard)}
            />
          ) : (
            <>

          {/* Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <Eye
                size={34}
                className="text-blue-600 mb-4"
              />

              <p className="text-gray-500">
                Visitas
              </p>

              <h2 className="text-4xl font-bold mt-2">
                0
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <MessageCircle
                size={34}
                className="text-green-600 mb-4"
              />

              <p className="text-gray-500">
                Cliques WhatsApp
              </p>

              <h2 className="text-4xl font-bold mt-2">
                0
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <Star
                size={34}
                className="text-yellow-500 mb-4"
              />

              <p className="text-gray-500">
                Avaliação
              </p>

              <h2 className="text-4xl font-bold mt-2">
                4.9
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">

              <Building2
                size={34}
                className="text-purple-600 mb-4"
              />

              <p className="text-gray-500">
                Plano
              </p>

              <h2 className="text-4xl font-bold mt-2">
                Starter
              </h2>

            </div>

          </div>

          <EmpresaForm
            empresaInicialSlug={workspaceSlug || undefined}
            onEmpresaAtualChange={setEmpresaAtual}
          />

            </>
          )}

        </div>

      </main>

    </div>
  );
}
