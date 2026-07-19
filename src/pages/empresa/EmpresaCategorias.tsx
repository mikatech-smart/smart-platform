import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  alterarStatusErpPdvCategoria,
  atualizarErpPdvCategoria,
  garantirCategoriasPadraoErpPdv,
  type ErpPdvCategoria,
  criarErpPdvCategoria,
} from "../../services/erpPdv/erpPdv.service";

type CategoriaForm = { id: string; nome: string; descricao: string; ativo: boolean };

const vazio: CategoriaForm = { id: "", nome: "", descricao: "", ativo: true };

function normalizarNome(valor: string) {
  return valor.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export default function EmpresaCategorias() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [empresaId, setEmpresaId] = useState("");
  const [categorias, setCategorias] = useState<ErpPdvCategoria[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<CategoriaForm>(vazio);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const inicializado = useRef(false);

  async function carregar(id: string) {
    setCarregando(true);
    const resultado = await garantirCategoriasPadraoErpPdv(id);
    setCategorias(resultado.data || []);
    setCarregando(false);
    if (resultado.error) setErro(resultado.error.message);
  }

  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;
    void (async () => {
      const resultado = await buscarEmpresaPorSlug(slug);
      if (!resultado.data) {
        setErro("Empresa não encontrada.");
        setCarregando(false);
        return;
      }
      setEmpresaId(resultado.data.id);
      await carregar(resultado.data.id);
    })();
  }, [slug]);

  const visiveis = useMemo(() => {
    const termo = normalizarNome(busca);
    if (!termo) return categorias;
    return categorias.filter((categoria) =>
      normalizarNome(`${categoria.nome} ${categoria.descricao}`).includes(termo)
    );
  }, [busca, categorias]);

  function editar(categoria: ErpPdvCategoria) {
    setForm({ id: categoria.id, nome: categoria.nome, descricao: categoria.descricao, ativo: categoria.ativo });
    setErro("");
    setAberto(true);
  }

  function nova() {
    setForm(vazio);
    setErro("");
    setAberto(true);
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    const nome = form.nome.trim().replace(/\s+/g, " ");
    if (!nome) return setErro("Informe o nome da categoria.");
    const duplicada = categorias.some(
      (categoria) => categoria.id !== form.id && normalizarNome(categoria.nome) === normalizarNome(nome)
    );
    if (duplicada) return setErro("Já existe uma categoria com este nome nesta empresa.");

    setSalvando(true);
    const resultado = form.id
      ? await atualizarErpPdvCategoria({ empresaId, categoriaId: form.id, nome, descricao: form.descricao, ativo: form.ativo })
      : await criarErpPdvCategoria(empresaId, nome, form.descricao);
    setSalvando(false);
    if (resultado.error) return setErro(resultado.error.message);
    setAberto(false);
    await carregar(empresaId);
  }

  async function alternar(categoria: ErpPdvCategoria) {
    const resultado = await alterarStatusErpPdvCategoria({ empresaId, categoriaId: categoria.id, ativo: !categoria.ativo });
    if (resultado.error) setErro(resultado.error.message);
    else await carregar(empresaId);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div><span className="empresa-kicker">ERP da empresa</span><h2 className="mt-2 text-2xl font-bold text-slate-900">Categorias</h2><p className="mt-1 text-slate-500">Organize os produtos da empresa por categoria.</p></div>
        <button type="button" onClick={nova} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Nova Categoria</button>
      </div>
      <div className="empresa-card space-y-4">
        <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar categoria" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}
        <div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead><tbody>{visiveis.map((categoria) => <tr key={categoria.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{categoria.nome}</td><td className="px-4 py-3">{categoria.descricao || "-"}</td><td className="px-4 py-3">{categoria.ativo ? "Ativa" : "Inativa"}</td><td className="px-4 py-3"><div className="flex gap-3 whitespace-nowrap"><button type="button" onClick={() => editar(categoria)} className="font-semibold text-emerald-700">Editar</button><button type="button" onClick={() => void alternar(categoria)} className="font-semibold text-slate-600">{categoria.ativo ? "Inativar" : "Ativar"}</button></div></td></tr>)}</tbody></table>{!carregando && !visiveis.length && <p className="p-8 text-center text-slate-500">Nenhuma categoria encontrada.</p>}{carregando && <p className="p-8 text-center text-slate-500">Carregando categorias...</p>}</div>
      </div>
      {aberto && <div className="empresa-card max-w-2xl"><form className="space-y-4" onSubmit={salvar}><div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-900">{form.id ? "Editar categoria" : "Nova categoria"}</h3><button type="button" onClick={() => setAberto(false)} className="font-semibold text-slate-500">Cancelar</button></div><label className="block text-sm font-medium text-slate-700">Nome da Categoria *<input autoFocus value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium text-slate-700">Descrição<textarea value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.ativo} onChange={(event) => setForm({ ...form, ativo: event.target.checked })} /> Ativa</label>{erro && <p className="text-sm font-medium text-red-700">{erro}</p>}<button type="submit" disabled={salvando} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">{salvando ? "Salvando..." : "Salvar"}</button></form></div>}
      <button type="button" onClick={() => navigate(`/empresa/${slug}/produtos`)} className="font-semibold text-slate-600">Voltar para Produtos</button>
    </div>
  );
}
