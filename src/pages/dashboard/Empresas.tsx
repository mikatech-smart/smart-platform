import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

type EmpresaResumo = {
  id: string;
  nome: string | null;
  slug: string | null;
  categoria: string | null;
  logo: string | null;
  ativo: boolean | null;
};

interface EmpresasProps {
  onSelecionarWorkspace: (slug: string) => void;
  onNavigate: (view: "workspace") => void;
}

export default function Empresas({
  onSelecionarWorkspace,
  onNavigate,
}: EmpresasProps) {
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [linkCopiado, setLinkCopiado] = useState("");

  const baseUrlPublica = (
    import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin
  ).replace(/\/$/, "");

  useEffect(() => {
    async function carregarEmpresas() {
      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,slug,categoria,logo,ativo")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar empresas:", error);
        setCarregando(false);
        return;
      }

      setEmpresas(data || []);
      setCarregando(false);
    }

    carregarEmpresas();
  }, []);

  async function copiarLink(link: string) {
    await navigator.clipboard.writeText(link);
    setLinkCopiado(link);

    window.setTimeout(() => {
      setLinkCopiado("");
    }, 2000);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Empresas
          </h2>

          <p className="mt-1 text-slate-500">
            Gerencie os workspaces cadastrados na Mikatech.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
        >
          + Nova Empresa
        </button>
      </div>

      {carregando ? (
        <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
          Carregando empresas...
        </div>
      ) : (
        <div className="grid gap-4">
          {empresas.map((empresa) => {
            const slug = empresa.slug || "";
            const linkPublico = slug ? `${baseUrlPublica}/${slug}` : "";

            return (
              <article
                key={empresa.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    {empresa.logo ? (
                      <img
                        src={empresa.logo}
                        alt={empresa.nome || "Empresa"}
                        className="h-16 w-16 rounded-2xl border object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-slate-50 font-bold text-slate-400">
                        {empresa.nome?.charAt(0) || "E"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-900">
                        {empresa.nome || "Empresa sem nome"}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {empresa.categoria || "Sem categoria"}
                      </p>

                      <p className="text-sm text-slate-500">
                        Slug: {slug || "-"}
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {empresa.ativo ? "Ativa" : "Teste"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[460px]">
                    <button
                      type="button"
                      disabled={!slug}
                      onClick={() => {
                        if (!slug) return;

                        onSelecionarWorkspace(slug);
                        onNavigate("workspace");
                      }}
                      className="rounded-xl bg-green-700 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Editar Workspace
                    </button>

                    <a
                      href={linkPublico || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border px-4 py-3 text-center font-bold text-slate-700"
                    >
                      Abrir Página Pública
                    </a>

                    <button
                      type="button"
                      disabled={!linkPublico}
                      onClick={() => copiarLink(linkPublico)}
                      className="rounded-xl border px-4 py-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Copiar Link
                    </button>
                  </div>
                </div>

                {linkCopiado === linkPublico && (
                  <p className="mt-3 text-sm font-semibold text-green-700">
                    Link copiado com sucesso.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
