import { Fragment, useEffect, useState } from "react";

import EmpresaForm from "../../components/dashboard/EmpresaForm";
import { BrandConfig } from "../../config/brand";
import {
  criarEmpresa as criarEmpresaService,
  excluirEmpresa as excluirEmpresaService,
  listarEmpresas,
} from "../../services/empresa/empresa.service";
import {
  criarConvitePrimeiroAcesso,
  verificarAdministradorPrimeiroAcesso,
  type CompanyInvite,
} from "../../services/empresa/companyInvite.service";

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

function obterTipoGerenciamento(tipo?: string | null) {
  return tipoEhCliente(tipo)
    ? "Cliente administra"
    : `Administrada pela ${BrandConfig.developerCompany}`;
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState<EmpresaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [linkCopiado, setLinkCopiado] = useState("");
  const [empresaIdEmEdicao, setEmpresaIdEmEdicao] = useState("");
  const [mostrarNovaEmpresa, setMostrarNovaEmpresa] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoSlug, setNovoSlug] = useState("");
  const [novoSlugEditadoManualmente, setNovoSlugEditadoManualmente] =
    useState(false);
  const [novoTipo, setNovoTipo] = useState("");
  const [salvandoNovaEmpresa, setSalvandoNovaEmpresa] = useState(false);
  const [conviteGerado, setConviteGerado] = useState<CompanyInvite | null>(null);
  const [conviteEmpresaId, setConviteEmpresaId] = useState("");
  const [empresasComAdministrador, setEmpresasComAdministrador] = useState<Record<string, boolean>>({});

  const baseUrlPublica = (BrandConfig.publicAppUrl || window.location.origin).replace(
    /\/$/,
    ""
  );
  const termoBusca = busca.trim().toLowerCase();
  const empresasFiltradas = termoBusca
    ? empresas.filter((empresa) => {
        const camposBusca = [
          empresa.nome,
          empresa.slug,
          empresa.categoria,
          empresa.tipo,
          obterTipoGerenciamento(empresa.tipo),
        ];

        return camposBusca.some((campo) =>
          (campo || "").toLowerCase().includes(termoBusca)
        );
      })
    : empresas;

  async function carregarEmpresas() {
    const { data, error } = await listarEmpresas();

    if (error) {
      console.error("Erro ao carregar empresas:", error);
      setCarregando(false);
      return;
    }

    const empresasCarregadas = data || [];
    setEmpresas(empresasCarregadas);
    const status = await Promise.all(
      empresasCarregadas.map(async (empresa) => {
        const resultado = await verificarAdministradorPrimeiroAcesso(empresa.id);
        return [empresa.id, resultado.error ? false : resultado.possuiAdministrador] as const;
      })
    );
    setEmpresasComAdministrador(Object.fromEntries(status));
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

  async function gerarConvite(empresaId: string) {
    setConviteEmpresaId(empresaId);
    setConviteGerado(null);
    const { data, error } = await criarConvitePrimeiroAcesso(empresaId);
    setConviteEmpresaId("");
    if (error || !data) return alert(error?.message || "Nao foi possivel gerar o convite.");
    setConviteGerado(data);
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
        tipoGerenciamento: novoTipo || "mikatech",
      });

      if (error) {
        console.error("Erro completo ao criar empresa:", error);
        alert(
          error.message ||
            "Erro ao criar empresa. Verifique as permissões do Admin no Supabase."
        );
        return;
      }

      setNovoNome("");
      setNovoSlug("");
      setNovoSlugEditadoManualmente(false);
      setNovoTipo("");
      setMostrarNovaEmpresa(false);
      setEmpresaIdEmEdicao("");
      await carregarEmpresas();
    } finally {
      setSalvandoNovaEmpresa(false);
    }
  }

  async function excluirEmpresa(id: string) {
    const confirmado = window.confirm(
      "Tem certeza que deseja excluir esta empresa? Esta ação não poderá ser desfeita."
    );

    if (!confirmado) return;

    const { error } = await excluirEmpresaService(id);

    if (error) {
      console.error("Erro completo ao excluir empresa:", error);
      alert(error.message || "Erro ao excluir empresa.");
      return;
    }

    setEmpresaIdEmEdicao("");
    await carregarEmpresas();
  }

  return (
    <section className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="min-w-0">
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
            setEmpresaIdEmEdicao("");
            setMostrarNovaEmpresa((valor) => !valor);
          }}
          className="rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
        >
          + Nova Empresa
        </button>
      </div>

      {mostrarNovaEmpresa && (
        <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <h3 className="text-lg font-bold text-slate-900">
            Nova Empresa
          </h3>

          <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-3">
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
                  Administrada pela {BrandConfig.developerCompany}
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
        <div className="grid min-w-0 gap-3">
          <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Buscar empresas
            </label>

            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Busque por nome, slug, categoria ou tipo"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              {empresasFiltradas.length} de {empresas.length} empresas
            </p>
          </div>

          {empresasFiltradas.map((empresa) => {
            const slug = empresa.slug || "";
            const linkErp = slug ? `${BrandConfig.erpUrl}/empresa/${slug}` : "";
            const linkPublico = slug ? `${baseUrlPublica}/${slug}` : "";
            const clienteAdministra = tipoEhCliente(empresa.tipo);
            const tipoGerenciamento = obterTipoGerenciamento(empresa.tipo);

            return (
              <Fragment key={empresa.id}>
                <article className="min-w-0 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {empresa.logo ? (
                        <img
                          src={empresa.logo}
                          alt={empresa.nome || "Empresa"}
                          className="h-12 w-12 rounded-xl border object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-slate-50 font-bold text-slate-400">
                          {empresa.nome?.charAt(0) || "E"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {empresa.nome || "Empresa sem nome"}
                        </h3>

                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>{empresa.categoria || "Sem categoria"}</span>
                          <span>Slug: {slug || "-"}</span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                            {empresa.ativo ? "Ativa" : "Teste"}
                          </span>

                          <span
                            className={
                              clienteAdministra
                                ? "inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700"
                                : "inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700"
                            }
                          >
                            {tipoGerenciamento}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarNovaEmpresa(false);
                          setEmpresaIdEmEdicao(empresa.id);
                        }}
                        className="min-w-0 rounded-xl bg-green-700 px-3 py-2 text-sm font-bold text-white"
                      >
                        Editar
                      </button>

                      <a
                        href={linkErp || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 rounded-xl border px-3 py-2 text-center text-sm font-bold text-slate-700"
                      >
                        Acessar ERP
                      </a>

                      <a
                        href={slug ? `${BrandConfig.erpUrl.replace(/\/$/, "")}/pdv/${slug}` : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-center text-sm font-bold text-green-800"
                      >
                        Abrir PDV
                      </a>

                      <button
                        type="button"
                        disabled={!slug}
                        onClick={() => copiarLink(`${BrandConfig.erpUrl.replace(/\/$/, "")}/pdv/${slug}`)}
                        className="min-w-0 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Copiar link do PDV
                      </button>

                      <button
                        type="button"
                        disabled={!linkPublico}
                        onClick={() => copiarLink(linkPublico)}
                        className="min-w-0 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Copiar link
                      </button>

                      {empresasComAdministrador[empresa.id] !== true && (
                        <button type="button" disabled={conviteEmpresaId === empresa.id} onClick={() => void gerarConvite(empresa.id)} className="min-w-0 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-800 disabled:opacity-50">
                          {conviteEmpresaId === empresa.id ? "Gerando..." : "Primeiro acesso"}
                        </button>
                      )}

                    </div>
                  </div>

                  {linkCopiado === linkPublico && (
                    <p className="mt-3 text-sm font-semibold text-green-700">
                      Link copiado com sucesso.
                    </p>
                  )}

                  {/* O convite gerado é exibido dentro do detalhe da empresa. */}
                  {conviteGerado?.empresaId === empresa.id && empresaIdEmEdicao !== empresa.id && (
                    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-bold text-green-900">Convite de primeiro acesso gerado</p>
                      <p className="mt-1 break-all text-xs text-green-800">Válido até {new Date(conviteGerado.expiresAt).toLocaleString("pt-BR")}</p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={conviteGerado.url} className="min-w-0 flex-1 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs" /><button type="button" onClick={() => void copiarLink(conviteGerado.url)} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white">Copiar convite</button></div>
                    </div>
                  )}
                </article>

                {empresaIdEmEdicao === empresa.id && (
                  <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm md:p-6">
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
                        onClick={() => setEmpresaIdEmEdicao("")}
                        className="rounded-xl border px-4 py-2 font-bold text-slate-700"
                      >
                        Fechar
                      </button>
                    </div>

                    {empresasComAdministrador[empresa.id] !== true && (
                      <section className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                        <h4 className="font-bold text-green-950">Primeiro Acesso</h4>
                        <p className="mt-1 text-sm text-green-800">
                          Gere um convite para o administrador criar o acesso ERP desta empresa.
                        </p>
                        <button
                          type="button"
                          disabled={conviteEmpresaId === empresa.id}
                          onClick={() => void gerarConvite(empresa.id)}
                          className="mt-3 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                        >
                          {conviteEmpresaId === empresa.id ? "Gerando..." : "Gerar convite de primeiro acesso"}
                        </button>
                        {conviteGerado?.empresaId === empresa.id && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-semibold text-green-900">Convite gerado. Válido até {new Date(conviteGerado.expiresAt).toLocaleString("pt-BR")}</p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input readOnly value={conviteGerado.url} className="min-w-0 flex-1 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs" />
                              <button type="button" onClick={() => void copiarLink(conviteGerado.url)} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-bold text-white">Copiar convite</button>
                            </div>
                          </div>
                        )}
                      </section>
                    )}

                    <EmpresaForm
                      empresaInicialId={empresa.id}
                      empresaInicialSlug={slug}
                      onExcluir={() => excluirEmpresa(empresa.id)}
                      onSalvar={() => {
                        setEmpresaIdEmEdicao("");
                        carregarEmpresas();
                      }}
                    />
                  </div>
                )}
              </Fragment>
            );
          })}

          {empresasFiltradas.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-sm font-medium text-slate-500 shadow-sm">
              Nenhuma empresa encontrada para essa busca.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
