import { Fragment, useEffect, useState } from "react";

import EmpresaForm from "../../components/dashboard/EmpresaForm";
import {
  criarEmpresa as criarEmpresaService,
  excluirEmpresa as excluirEmpresaService,
  listarEmpresas,
} from "../../services/empresa/empresa.service";

type EmpresaResumo = {
  id: string;
  nome: string | null;
  slug: string | null;
  categoria: string | null;
  logo: string | null;
  ativo: boolean | null;
  tipo: string | null;
};

function gerarSlug(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tipoEhCliente(tipo?: string | null) {
  return tipo === "cliente";
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [linkCopiado, setLinkCopiado] = useState("");
  const [slugEmEdicao, setSlugEmEdicao] = useState("");
  const [mostrarNovaEmpresa, setMostrarNovaEmpresa] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoSlug, setNovoSlug] = useState("");
  const [novoSlugEditadoManualmente, setNovoSlugEditadoManualmente] =
    useState(false);
  const [novoTipo, setNovoTipo] = useState("");
  const [salvandoNovaEmpresa, setSalvandoNovaEmpresa] = useState(false);

  const baseUrlPublica = (
    import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin
  ).replace(/\/$/, "");

  async function carregarEmpresas() {
    const { data, error } = await listarEmpresas();

    if (error) {
      console.error("Erro ao carregar empresas:", error);
      setCarregando(false);
      return;
    }

    setEmpresas(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function copiarLink(link: string) {
    await navigator.clipboard.writeText(link);
    setLinkCopiado(link);

    window.setTimeout(() => {
      setLinkCopiado("");
    }, 2000);
  }

  async function criarEmpresa() {
    const slug = gerarSlug(novoSlug || novoNome);

    if (!novoNome || !slug) {
      alert("Informe o nome e o slug da empresa.");
      return;
    }

    try {
      setSalvandoNovaEmpresa(true);

      const { error } = await criarEmpresaService({
        nome: novoNome,
        slug,
        tipoGerenciamento: novoTipo,
      });

      if (error) {
        console.error("Erro completo ao criar empresa:", error);
        alert(
          error.message ||
            "Erro ao criar empresa. Verifique as permissoes do Admin no Supabase."
        );
        return;
      }

      setNovoNome("");
      setNovoSlug("");
      setNovoSlugEditadoManualmente(false);
      setNovoTipo("");
      setMostrarNovaEmpresa(false);
      setSlugEmEdicao("");
      await carregarEmpresas();
    } finally {
      setSalvandoNovaEmpresa(false);
    }
  }

  async function excluirEmpresa(id: string, nome?: string | null) {
    const confirmado = window.confirm(
      `Deseja realmente excluir a empresa ${nome || "selecionada"}?`
    );

    if (!confirmado) return;

    const { error } = await excluirEmpresaService(id);

    if (error) {
      console.error("Erro completo ao excluir empresa:", error);
      alert(error.message || "Erro ao excluir empresa.");
      return;
    }

    setSlugEmEdicao("");
    await carregarEmpresas();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Empresas
          </h2>

          <p className="mt-1 text-slate-500">
            Gerencie todas as empresas pelo painel administrativo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSlugEmEdicao("");
            setMostrarNovaEmpresa((valor) => !valor);
          }}
          className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
        >
          + Nova Empresa
        </button>
      </div>

      {mostrarNovaEmpresa && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Nova Empresa
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-medium">
                Nome
              </label>

              <input
                value={novoNome}
                onChange={(e) => {
                  const nome = e.target.value;

                  setNovoNome(nome);

                  if (!novoSlugEditadoManualmente) {
                    setNovoSlug(gerarSlug(nome));
                  }
                }}
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Slug
              </label>

              <input
                value={novoSlug}
                onChange={(e) => {
                  setNovoSlugEditadoManualmente(true);
                  setNovoSlug(gerarSlug(e.target.value));
                }}
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Tipo de gerenciamento
              </label>

              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full rounded-xl border bg-white p-3"
              >
                <option value="">
                  Selecione o tipo
                </option>

                <option value="mikatech">
                  Administrada pela Mikatech
                </option>

                <option value="cliente">
                  Cliente administra
                </option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={criarEmpresa}
            disabled={salvandoNovaEmpresa}
            className="mt-4 rounded-xl bg-green-700 px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {salvandoNovaEmpresa ? "Criando..." : "Criar Empresa"}
          </button>
        </div>
      )}

      {carregando ? (
        <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
          Carregando empresas...
        </div>
      ) : (
        <div className="grid gap-4">
          {empresas.map((empresa) => {
            const slug = empresa.slug || "";
            const linkPublico = slug ? `${baseUrlPublica}/${slug}` : "";
            const clienteAdministra = tipoEhCliente(empresa.tipo);

            return (
              <Fragment key={empresa.id}>
                <article className="rounded-2xl bg-white p-5 shadow-sm">
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

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {empresa.ativo ? "Ativa" : "Teste"}
                          </span>

                          <span
                            className={
                              clienteAdministra
                                ? "inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                                : "inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                            }
                          >
                            {clienteAdministra
                              ? "Cliente administra"
                              : "Administrada pela Mikatech"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[620px]">
                      <button
                        type="button"
                        disabled={!slug}
                        onClick={() => {
                          setMostrarNovaEmpresa(false);
                          setSlugEmEdicao(slug);
                        }}
                        className="rounded-xl bg-green-700 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Editar
                      </button>

                      <a
                        href={linkPublico || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border px-4 py-3 text-center font-bold text-slate-700"
                      >
                        Abrir pagina publica
                      </a>

                      <button
                        type="button"
                        disabled={!linkPublico}
                        onClick={() => copiarLink(linkPublico)}
                        className="rounded-xl border px-4 py-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Copiar link
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirEmpresa(empresa.id, empresa.nome)}
                        className="rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  {linkCopiado === linkPublico && (
                    <p className="mt-3 text-sm font-semibold text-green-700">
                      Link copiado com sucesso.
                    </p>
                  )}
                </article>

                {slugEmEdicao === slug && (
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Editar empresa
                        </h3>

                        <p className="text-slate-500">
                          Workspace administrativo da empresa selecionada.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSlugEmEdicao("")}
                        className="rounded-xl border px-4 py-2 font-bold text-slate-700"
                      >
                        Fechar
                      </button>
                    </div>

                    <EmpresaForm
                      empresaInicialSlug={slugEmEdicao}
                      onSalvar={() => {
                        setSlugEmEdicao("");
                        carregarEmpresas();
                      }}
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}
