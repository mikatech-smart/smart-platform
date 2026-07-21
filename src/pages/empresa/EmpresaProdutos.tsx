import { useEffect, useMemo, useState, type FormEvent } from "react";
import { NavLink, useParams } from "react-router-dom";
import { canAccessPermission } from "../../auth/PermissionGuard";
import { useAuth } from "../../auth/AuthContext";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  alterarStatusErpPdvProduto,
  criarErpPdvCategoria,
  ErpPdvCategoria,
  ErpPdvFornecedor,
  ErpPdvProduto,
  garantirCategoriasPadraoErpPdv,
  listarErpPdvFornecedores,
  listarErpPdvProdutos,
  salvarErpPdvFornecedor,
  salvarErpPdvProduto,
} from "../../services/erpPdv/erpPdv.service";
import {
  EmpresaProdutoDetalhes,
  carregarProdutoCatalogo,
  listarProdutoDetalhes,
  salvarProdutoDetalhes,
  salvarProdutoCatalogo,
} from "./empresaAdminStorage";

type AbaProduto = "geral" | "comercial" | "estoque" | "fiscal" | "observacoes";
type Auxiliar = "categoria" | "marca" | "fabricante" | "fornecedor" | null;

type Form = {
  nome: string;
  nomeReduzido: string;
  sku: string;
  codigoBarras: string;
  unidade: string;
  categoriaId: string;
  marca: string;
  fabricante: string;
  descricaoComplementar: string;
  subcategoria: string;
  custo: string;
  custoMedio: string;
  margem: string;
  markup: string;
  precoVenda: string;
  precoAtacado: string;
  precoPromocional: string;
  comissao: string;
  estoqueAtual: string;
  estoqueMinimo: string;
  estoqueMaximo: string;
  localizacao: string;
  controlaEstoque: boolean;
  ncm: string;
  cest: string;
  cfopPadrao: string;
  origem: string;
  codigoFiscal: string;
  fornecedorPrincipalId: string;
  peso: string;
  altura: string;
  largura: string;
  comprimento: string;
  observacoes: string;
  ativo: boolean;
};

const vazio: Form = {
  nome: "", nomeReduzido: "", sku: "", codigoBarras: "", unidade: "un", categoriaId: "", marca: "", fabricante: "",
  descricaoComplementar: "", subcategoria: "", custo: "0", custoMedio: "0", margem: "0", markup: "0", precoVenda: "0",
  precoAtacado: "0", precoPromocional: "0", comissao: "0", estoqueAtual: "0", estoqueMinimo: "0", estoqueMaximo: "0",
  localizacao: "", controlaEstoque: true, ncm: "", cest: "", cfopPadrao: "", origem: "", codigoFiscal: "",
  fornecedorPrincipalId: "", peso: "0", altura: "0", largura: "0", comprimento: "0", observacoes: "", ativo: true,
};

const abas: Array<{ id: AbaProduto; label: string }> = [
  { id: "geral", label: "Geral" },
  { id: "comercial", label: "Comercial" },
  { id: "estoque", label: "Estoque" },
  { id: "fiscal", label: "Fiscal" },
  { id: "observacoes", label: "Observacoes" },
];

const numero = (valor: string) => Number(valor.replace(",", ".")) || 0;
const moeda = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function paraForm(produto: ErpPdvProduto, detalhe?: EmpresaProdutoDetalhes): Form {
  return {
    ...vazio,
    nome: produto.nome,
    sku: produto.sku,
    codigoBarras: produto.codigo_barras,
    unidade: produto.unidade,
    categoriaId: produto.categoria_id || "",
    marca: produto.marca,
    custo: String(produto.custo),
    custoMedio: detalhe?.custoMedio || String(produto.custo),
    precoVenda: String(produto.preco_venda),
    precoAtacado: String(produto.preco_atacado || 0),
    estoqueAtual: String(produto.estoque_atual),
    estoqueMinimo: String(produto.estoque_minimo),
    localizacao: produto.localizacao,
    ncm: produto.ncm,
    observacoes: produto.observacoes,
    ativo: produto.ativo,
    ...detalhe,
  };
}

export default function EmpresaProdutos() {
  const { slug = "" } = useParams();
  const { profile } = useAuth();
  const [empresaId, setEmpresaId] = useState("");
  const [produtos, setProdutos] = useState<ErpPdvProduto[]>([]);
  const [categorias, setCategorias] = useState<ErpPdvCategoria[]>([]);
  const [fornecedores, setFornecedores] = useState<ErpPdvFornecedor[]>([]);
  const [detalhes, setDetalhes] = useState<EmpresaProdutoDetalhes[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Form>(vazio);
  const [aba, setAba] = useState<AbaProduto>("geral");
  const [editandoId, setEditandoId] = useState("");
  const [visualizando, setVisualizando] = useState<ErpPdvProduto | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [auxiliar, setAuxiliar] = useState<Auxiliar>(null);
  const [auxiliarNome, setAuxiliarNome] = useState("");
  const [marcas, setMarcas] = useState<string[]>([]);
  const [fabricantes, setFabricantes] = useState<string[]>([]);
  const [codigoAutomatico, setCodigoAutomatico] = useState(false);

  async function carregar(id: string) {
    const [produtosResultado, categoriasResultado, fornecedoresResultado] = await Promise.all([
      listarErpPdvProdutos(id), garantirCategoriasPadraoErpPdv(id), listarErpPdvFornecedores(id),
    ]);
    setProdutos(produtosResultado.data || []);
    setCategorias(categoriasResultado.data || []);
    setFornecedores(fornecedoresResultado.data || []);
    setDetalhes(listarProdutoDetalhes(id));
    const catalogo = carregarProdutoCatalogo(id);
    setMarcas(catalogo.marcas);
    setFabricantes(catalogo.fabricantes);
    setCodigoAutomatico(catalogo.codigoAutomatico);
  }

  useEffect(() => {
    void buscarEmpresaPorSlug(slug).then(async ({ data }) => {
      const id = data?.id || slug;
      setEmpresaId(id);
      await carregar(id);
    });
  }, [slug]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase();
    if (!termo) return produtos;
    return produtos.filter((produto) => [produto.nome, produto.sku, produto.codigo_barras, produto.marca].join(" ").toLocaleLowerCase().includes(termo));
  }, [busca, produtos]);

  const margemCalculada = numero(form.precoVenda) > 0 ? ((numero(form.precoVenda) - numero(form.custo)) / numero(form.precoVenda)) * 100 : 0;
  const podeCriar = canAccessPermission("produto.criar", profile?.perfil);
  const podeEditar = canAccessPermission("produto.alterar", profile?.perfil);
  const podeInativar = canAccessPermission("produto.inativar", profile?.perfil);

  function novo() {
    setEditandoId(""); setVisualizando(null); setErro(""); setForm(vazio); setAba("geral");
  }

  function editar(produto: ErpPdvProduto) {
    setVisualizando(null); setErro(""); setEditandoId(produto.id); setForm(paraForm(produto, detalhes.find((item) => item.produtoId === produto.id))); setAba("geral");
  }

  function atualizar(campo: keyof Form, valor: string | boolean) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function proximoSku() {
    const maior = produtos.reduce((atual, produto) => Math.max(atual, Number(produto.sku) || 0), 0);
    return String(maior + 1).padStart(4, "0");
  }

  function alterarCodigoAutomatico(valor: boolean) {
    setCodigoAutomatico(valor);
    salvarProdutoCatalogo(empresaId, { marcas, fabricantes, codigoAutomatico: valor });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if ((editandoId && !podeEditar) || (!editandoId && !podeCriar)) return setErro("Voce nao possui permissao para salvar produtos.");
    const sku = codigoAutomatico && !editandoId ? proximoSku() : form.sku.trim();
    if (!sku) return setErro("Informe o codigo interno ou ative a geracao automatica.");
    if (!form.nome.trim()) return setErro("Informe o nome do produto.");
    if (!form.categoriaId) return setErro("Selecione uma categoria.");
    const codigoDuplicado = produtos.some((produto) => produto.id !== editandoId && produto.sku.trim().toLocaleLowerCase() === sku.toLocaleLowerCase());
    if (codigoDuplicado) return setErro("Ja existe um produto com este codigo interno.");
    const barras = form.codigoBarras.trim();
    if (barras && ![8, 12, 13, 14].includes(barras.length)) return setErro("O codigo de barras deve ter 8, 12, 13 ou 14 digitos.");
    if (barras && produtos.some((produto) => produto.id !== editandoId && produto.codigo_barras === barras)) return setErro("Ja existe um produto com este codigo de barras.");
    if ([form.custo, form.precoVenda, form.precoAtacado, form.precoPromocional, form.estoqueAtual, form.estoqueMinimo, form.estoqueMaximo].some((valor) => numero(valor) < 0)) return setErro("Valores de custo, preco e estoque nao podem ser negativos.");
    setSalvando(true);
    try {
      const resultado = await salvarErpPdvProduto({
        id: editandoId || undefined, empresaId, categoriaId: form.categoriaId, nome: form.nome, codigoBarras: barras, sku,
        marca: form.marca, custo: numero(form.custo), precoVenda: numero(form.precoVenda), precoAtacado: numero(form.precoAtacado),
        precoRevenda: 0, precoPersonalizado: 0, formacaoPrecoTipo: "manual", percentualPreco: 0, unidade: form.unidade,
        localizacao: form.localizacao, ncm: form.ncm, observacoes: form.observacoes, imagemUrl: "", estoqueAtual: numero(form.estoqueAtual), estoqueMinimo: numero(form.estoqueMinimo), ativo: form.ativo,
      });
      if (resultado.error || !resultado.data) throw resultado.error || new Error("Nao foi possivel salvar o produto.");
      const produto = resultado.data;
      const detalhe: EmpresaProdutoDetalhes = {
        produtoId: produto.id, descricaoComplementar: form.descricaoComplementar, subcategoria: form.subcategoria, fabricante: form.fabricante,
        estoqueMaximo: form.estoqueMaximo, controlaEstoque: form.controlaEstoque, precoPromocional: form.precoPromocional, custoMedio: form.custoMedio,
        margemLucro: String(margemCalculada), nomeReduzido: form.nomeReduzido, markup: form.markup, comissao: form.comissao, cest: form.cest,
        cfopPadrao: form.cfopPadrao, origem: form.origem, codigoFiscal: form.codigoFiscal, fornecedorPrincipalId: form.fornecedorPrincipalId,
        peso: form.peso, altura: form.altura, largura: form.largura, comprimento: form.comprimento,
      };
      salvarProdutoDetalhes(empresaId, [...detalhes.filter((item) => item.produtoId !== produto.id), detalhe]);
      setEditandoId(produto.id);
      await carregar(empresaId);
      setForm(paraForm(produto, detalhe));
      setErro("");
    } catch (cause) {
      setErro(cause instanceof Error ? cause.message : "Nao foi possivel salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(produto: ErpPdvProduto) {
    if (!podeInativar) return setErro("Voce nao possui permissao para alterar o status do produto.");
    const resultado = await alterarStatusErpPdvProduto({ empresaId, produtoId: produto.id, ativo: !produto.ativo });
    if (resultado.error) setErro(resultado.error.message); else await carregar(empresaId);
  }

  async function salvarAuxiliar(event: FormEvent) {
    event.preventDefault();
    const nome = auxiliarNome.trim();
    if (!auxiliar || !nome) return;
    if (auxiliar === "categoria") {
      const existente = categorias.find((item) => item.nome.trim().toLocaleLowerCase() === nome.toLocaleLowerCase());
      if (existente) atualizar("categoriaId", existente.id);
      else {
        const resultado = await criarErpPdvCategoria(empresaId, nome);
        if (resultado.error || !resultado.data) return setErro(resultado.error?.message || "Nao foi possivel criar a categoria.");
        setCategorias((atual) => [...atual, resultado.data!]);
        atualizar("categoriaId", resultado.data.id);
      }
    } else if (auxiliar === "marca" || auxiliar === "fabricante") {
      const lista = auxiliar === "marca" ? marcas : fabricantes;
      if (lista.some((item) => item.trim().toLocaleLowerCase() === nome.toLocaleLowerCase())) return setErro("Este cadastro ja existe para a empresa.");
      const atualizada = [...lista, nome].sort((a, b) => a.localeCompare(b));
      if (auxiliar === "marca") setMarcas(atualizada); else setFabricantes(atualizada);
      salvarProdutoCatalogo(empresaId, { marcas: auxiliar === "marca" ? atualizada : marcas, fabricantes: auxiliar === "fabricante" ? atualizada : fabricantes, codigoAutomatico });
      atualizar(auxiliar, nome);
    } else {
      const resultado = await salvarErpPdvFornecedor({
        empresaId, razaoSocial: nome, nomeFantasia: nome, cpfCnpj: "", inscricaoEstadual: "", contato: "",
        telefone: "", whatsapp: "", email: "", endereco: "", observacoes: "", ativo: true,
      });
      if (resultado.error || !resultado.data) return setErro(resultado.error?.message || "Nao foi possivel criar o fornecedor.");
      setFornecedores((atual) => [...atual, resultado.data!]);
      atualizar("fornecedorPrincipalId", resultado.data.id);
    }
    setAuxiliar(null); setAuxiliarNome(""); setErro("");
  }

  return <section className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><span className="empresa-kicker">ERP da empresa</span><h2 className="mt-2 text-2xl font-bold text-slate-900">Produtos</h2><p className="mt-1 text-slate-500">Cadastro profissional para PDV, compras e estoque.</p></div>
      <div className="flex flex-wrap gap-2"><NavLink to={`/empresa/${slug}/categorias`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Nova Categoria</NavLink><button type="button" onClick={novo} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Novo Produto</button></div>
    </div>

    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4"><label className="block text-sm font-semibold text-slate-700" htmlFor="buscar-produto">Pesquisa instantanea</label><input id="buscar-produto" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Nome, SKU, codigo interno ou codigo de barras" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" /><p className="mt-2 text-xs text-slate-500">{filtrados.length} produto(s) encontrado(s).</p></div>
      <div className="overflow-x-auto"><table className="min-w-[1120px] w-full table-fixed text-left text-sm"><colgroup><col className="w-[100px]" /><col className="w-[140px]" /><col className="w-[300px]" /><col className="w-[110px]" /><col className="w-[100px]" /><col className="w-[110px]" /><col className="w-[110px]" /><col className="w-[100px]" /><col className="w-[250px]" /></colgroup><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Codigo</th><th className="px-4 py-3">Barras</th><th className="px-4 py-3">Produto</th><th className="px-4 py-3 text-right">Estoque</th><th className="px-4 py-3 text-right">Min.</th><th className="px-4 py-3 text-right">Custo</th><th className="px-4 py-3 text-right">Varejo</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3">Acoes</th></tr></thead><tbody>{filtrados.map((produto) => <tr key={produto.id} className="border-t border-slate-100"><td className="px-4 py-3" title={produto.sku}>{produto.sku}</td><td className="px-4 py-3" title={produto.codigo_barras}>{produto.codigo_barras || "-"}</td><td className="overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 font-medium" title={produto.nome}>{produto.nome}</td><td className="px-4 py-3 text-right tabular-nums">{produto.estoque_atual}</td><td className="px-4 py-3 text-right tabular-nums">{produto.estoque_minimo}</td><td className="px-4 py-3 text-right tabular-nums">{moeda(produto.custo)}</td><td className="px-4 py-3 text-right tabular-nums">{moeda(produto.preco_venda)}</td><td className="px-4 py-3 text-center">{produto.ativo ? "Ativo" : "Inativo"}</td><td className="px-4 py-3"><div className="flex gap-2 whitespace-nowrap"><button type="button" onClick={() => setVisualizando(produto)} className="font-semibold text-slate-600">Visualizar</button><button type="button" onClick={() => editar(produto)} className="font-semibold text-emerald-700">Editar</button><button type="button" onClick={() => void alternar(produto)} className="font-semibold text-slate-500">{produto.ativo ? "Inativar" : "Ativar"}</button></div></td></tr>)}</tbody></table>{!filtrados.length && <p className="p-8 text-center text-slate-500">Nenhum produto encontrado.</p>}</div>
    </div>

    <form onSubmit={salvar} className="space-y-5 rounded-xl bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-900">{editandoId ? "Editar produto" : "Novo produto"}</h3><p className="mt-1 text-sm text-slate-500">Campos com * sao obrigatorios.</p></div><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.ativo} onChange={(event) => atualizar("ativo", event.target.checked)} /> Produto ativo</label></div>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">{abas.map((item) => <button key={item.id} type="button" onClick={() => setAba(item.id)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${aba === item.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500"}`}>{item.label}</button>)}</div>
      {aba === "geral" && <div className="grid gap-4 md:grid-cols-3"><Field label="Nome *" placeholder="Ex.: Papel A4" value={form.nome} onChange={(value) => atualizar("nome", value)} required /><Field label="Nome reduzido" placeholder="Nome curto para venda" value={form.nomeReduzido} onChange={(value) => atualizar("nomeReduzido", value)} /><div className="flex items-end gap-2"><div className="min-w-0 flex-1"><Field label="Codigo interno *" placeholder="Ex.: 0001" value={form.sku} onChange={(value) => atualizar("sku", value)} required disabled={codigoAutomatico && !editandoId} /></div><label className="mb-2 flex shrink-0 items-center gap-1 text-xs text-slate-600"><input type="checkbox" checked={codigoAutomatico} onChange={(event) => alterarCodigoAutomatico(event.target.checked)} /> Automatico</label></div><Field label="Codigo de barras" placeholder="GTIN, EAN8 ou EAN13" value={form.codigoBarras} onChange={(value) => atualizar("codigoBarras", value)} inputMode="numeric" /><SelectField label="Unidade *" value={form.unidade} onChange={(value) => atualizar("unidade", value)} options={[["un", "Unidade"], ["kg", "Quilograma"], ["m", "Metro"], ["cx", "Caixa"]]} required /><div className="flex items-end gap-2"><SelectField label="Categoria *" value={form.categoriaId} onChange={(value) => atualizar("categoriaId", value)} options={categorias.filter((item) => item.ativo).map((item) => [item.id, item.nome])} required /><QuickButton onClick={() => setAuxiliar("categoria")} label="Nova categoria" /></div><div className="flex items-end gap-2"><SelectField label="Marca" value={form.marca} onChange={(value) => atualizar("marca", value)} options={marcas.map((item) => [item, item])} /><QuickButton onClick={() => setAuxiliar("marca")} label="Cadastrar marca" /></div><div className="flex items-end gap-2"><SelectField label="Fabricante" value={form.fabricante} onChange={(value) => atualizar("fabricante", value)} options={fabricantes.map((item) => [item, item])} /><QuickButton onClick={() => setAuxiliar("fabricante")} label="Cadastrar fabricante" /></div><Field label="Subcategoria" placeholder="Subcategoria" value={form.subcategoria} onChange={(value) => atualizar("subcategoria", value)} /><Field label="Descricao complementar" placeholder="Informacao adicional" value={form.descricaoComplementar} onChange={(value) => atualizar("descricaoComplementar", value)} /></div>}
      {aba === "comercial" && <div className="grid gap-4 md:grid-cols-4"><Field label="Custo" type="number" min="0" step="0.01" value={form.custo} onChange={(value) => atualizar("custo", value)} /><Field label="Custo medio" type="number" min="0" step="0.01" value={form.custoMedio} onChange={(value) => atualizar("custoMedio", value)} /><Field label="Margem (%)" type="number" min="0" step="0.01" value={form.margem} onChange={(value) => atualizar("margem", value)} /><Field label="Markup" type="number" min="0" step="0.01" value={form.markup} onChange={(value) => atualizar("markup", value)} /><Field label="Preco varejo" type="number" min="0" step="0.01" value={form.precoVenda} onChange={(value) => atualizar("precoVenda", value)} /><Field label="Preco atacado" type="number" min="0" step="0.01" value={form.precoAtacado} onChange={(value) => atualizar("precoAtacado", value)} /><Field label="Preco promocional" type="number" min="0" step="0.01" value={form.precoPromocional} onChange={(value) => atualizar("precoPromocional", value)} /><Field label="Comissao (%)" type="number" min="0" step="0.01" value={form.comissao} onChange={(value) => atualizar("comissao", value)} /><div className="rounded-lg bg-slate-50 p-3 text-sm"><span className="block text-slate-500">Margem calculada</span><strong>{margemCalculada.toFixed(2)}%</strong></div></div>}
      {aba === "estoque" && <div className="grid gap-4 md:grid-cols-4"><Field label="Estoque atual" type="number" min="0" step="0.01" value={form.estoqueAtual} onChange={(value) => atualizar("estoqueAtual", value)} /><Field label="Estoque minimo" type="number" min="0" step="0.01" value={form.estoqueMinimo} onChange={(value) => atualizar("estoqueMinimo", value)} /><Field label="Estoque maximo" type="number" min="0" step="0.01" value={form.estoqueMaximo} onChange={(value) => atualizar("estoqueMaximo", value)} /><Field label="Localizacao" placeholder="Ex.: Prateleira A1" value={form.localizacao} onChange={(value) => atualizar("localizacao", value)} /><label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.controlaEstoque} onChange={(event) => atualizar("controlaEstoque", event.target.checked)} /> Controla estoque</label><div className="flex items-end gap-2 md:col-span-3"><SelectField label="Fornecedor principal" value={form.fornecedorPrincipalId} onChange={(value) => atualizar("fornecedorPrincipalId", value)} options={fornecedores.filter((item) => item.ativo).map((item) => [item.id, item.nome_fantasia || item.razao_social])} /><QuickButton onClick={() => setAuxiliar("fornecedor")} label="Vincular fornecedor" /></div></div>}
      {aba === "fiscal" && <div className="grid gap-4 md:grid-cols-4"><Field label="NCM" placeholder="Codigo NCM" value={form.ncm} onChange={(value) => atualizar("ncm", value)} /><Field label="CEST" value={form.cest} onChange={(value) => atualizar("cest", value)} /><Field label="CFOP padrao" value={form.cfopPadrao} onChange={(value) => atualizar("cfopPadrao", value)} /><Field label="Origem" value={form.origem} onChange={(value) => atualizar("origem", value)} /><Field label="Codigo fiscal" value={form.codigoFiscal} onChange={(value) => atualizar("codigoFiscal", value)} /><p className="md:col-span-4 text-sm text-slate-500">Campos preparados para a futura etapa fiscal. Nenhuma regra tributaria e aplicada nesta tela.</p></div>}
      {aba === "observacoes" && <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-slate-700">Observacoes internas<textarea value={form.observacoes} onChange={(event) => atualizar("observacoes", event.target.value)} placeholder="Anotacoes para a equipe" className="mt-1 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><div className="grid grid-cols-2 gap-3"><Field label="Peso" type="number" min="0" step="0.01" value={form.peso} onChange={(value) => atualizar("peso", value)} /><Field label="Altura" type="number" min="0" step="0.01" value={form.altura} onChange={(value) => atualizar("altura", value)} /><Field label="Largura" type="number" min="0" step="0.01" value={form.largura} onChange={(value) => atualizar("largura", value)} /><Field label="Comprimento" type="number" min="0" step="0.01" value={form.comprimento} onChange={(value) => atualizar("comprimento", value)} /></div></div>}
      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{erro}</p>}<div className="flex flex-wrap gap-2"><button type="submit" disabled={salvando} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{salvando ? "Salvando..." : "Salvar produto"}</button><button type="button" onClick={novo} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button></div>
    </form>

    {visualizando && <div className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold text-slate-900">Visualizacao do produto</h3><p className="text-sm text-slate-500">{visualizando.nome}</p></div><button type="button" onClick={() => setVisualizando(null)} className="font-semibold text-emerald-700">Fechar</button></div><div className="mt-4 grid gap-3 text-sm md:grid-cols-4"><p><strong>Codigo:</strong> {visualizando.sku}</p><p><strong>Barras:</strong> {visualizando.codigo_barras || "-"}</p><p><strong>Varejo:</strong> {moeda(visualizando.preco_venda)}</p><p><strong>Estoque:</strong> {visualizando.estoque_atual}</p><p><strong>Marca:</strong> {visualizando.marca || "-"}</p><p><strong>Unidade:</strong> {visualizando.unidade}</p><p><strong>NCM:</strong> {visualizando.ncm || "-"}</p><p><strong>Status:</strong> {visualizando.ativo ? "Ativo" : "Inativo"}</p></div></div>}
    {auxiliar && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={salvarAuxiliar} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-slate-900">Cadastro rapido</h3><p className="mt-1 text-sm text-slate-500">{auxiliar === "categoria" ? "Nova categoria" : auxiliar === "fornecedor" ? "Novo fornecedor" : `Novo ${auxiliar}`}</p></div><button type="button" onClick={() => setAuxiliar(null)} className="text-sm font-semibold text-slate-500">Fechar</button></div><Field label={auxiliar === "fornecedor" ? "Nome ou razao social *" : "Nome *"} placeholder="Informe o nome" value={auxiliarNome} onChange={setAuxiliarNome} required /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setAuxiliar(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button><button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Salvar e voltar</button></div></form></div>}
  </section>;
}

function Field({ label, value, onChange, type = "text", required = false, placeholder, disabled = false, min, step, inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; disabled?: boolean; min?: string; step?: string; inputMode?: "numeric" | "text" }) {
  return <label className="block min-w-0 text-sm font-medium text-slate-700">{label}<input type={type} required={required} disabled={disabled} min={min} step={step} inputMode={inputMode} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal disabled:bg-slate-100" /></label>;
}

function SelectField({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (value: string) => void; options: string[][]; required?: boolean }) {
  return <label className="block min-w-0 flex-1 text-sm font-medium text-slate-700">{label}<select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Selecione</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function QuickButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} title={label} aria-label={label} className="mb-0.5 rounded-lg border border-emerald-700 px-2 py-2 text-sm font-bold text-emerald-800">+</button>;
}
