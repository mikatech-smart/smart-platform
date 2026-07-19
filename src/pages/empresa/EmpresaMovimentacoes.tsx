import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import { ErpPdvMovimentacao, ErpPdvMovimentacaoTipo, listarErpPdvMovimentacoes, listarErpPdvProdutos, registrarErpPdvMovimentacao, ErpPdvProduto } from "../../services/erpPdv/erpPdv.service";

type TipoManual = Exclude<ErpPdvMovimentacaoTipo, "venda">;

const tipoLabel: Record<TipoManual | "venda", string> = { entrada: "Entrada", saida: "Saída", ajuste: "Ajuste", venda: "Venda" };

export default function EmpresaMovimentacoes() {
  const { slug = "" } = useParams();
  const [empresaId, setEmpresaId] = useState("");
  const [produtos, setProdutos] = useState<ErpPdvProduto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<ErpPdvMovimentacao[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [tipo, setTipo] = useState<TipoManual>("entrada");
  const [quantidade, setQuantidade] = useState("1");
  const [motivo, setMotivo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar(id: string) {
    const [produtosResultado, movimentosResultado] = await Promise.all([listarErpPdvProdutos(id), listarErpPdvMovimentacoes(id)]);
    setProdutos(produtosResultado.data || []);
    setMovimentacoes(movimentosResultado.data || []);
  }

  useEffect(() => {
    void buscarEmpresaPorSlug(slug).then(async ({ data }) => {
      const id = data?.id || slug;
      setEmpresaId(id);
      await carregar(id);
    });
  }, [slug]);

  const produtoPorId = useMemo(() => new Map(produtos.map((produto) => [produto.id, produto])), [produtos]);
  const visiveis = useMemo(() => movimentacoes.filter((movimentacao) => {
    const produto = produtoPorId.get(movimentacao.produto_id);
    const correspondeTipo = filtroTipo === "todos" || movimentacao.tipo === filtroTipo;
    const termo = busca.trim().toLowerCase();
    const correspondeBusca = !termo || [produto?.nome || "", movimentacao.motivo, movimentacao.usuario_responsavel].join(" ").toLowerCase().includes(termo);
    return correspondeTipo && correspondeBusca;
  }), [busca, filtroTipo, movimentacoes, produtoPorId]);

  async function registrar() {
    setErro(""); setSucesso("");
    if (!produtoId) return setErro("Selecione um produto.");
    const valor = Number(quantidade.replace(",", "."));
    if (!Number.isFinite(valor) || valor <= 0) return setErro("Informe uma quantidade maior que zero.");
    setSalvando(true);
    try {
      const resultado = await registrarErpPdvMovimentacao({ empresaId, produtoId, tipo, quantidade: valor, motivo, observacao, usuarioResponsavel: "Administrador" });
      if (resultado.error || !resultado.data) throw resultado.error || new Error("Não foi possível registrar a movimentação.");
      setMovimentacoes((atuais) => [resultado.data!, ...atuais]);
      setQuantidade("1"); setMotivo(""); setObservacao(""); setSucesso("Movimentação registrada e saldo atualizado.");
      await carregar(empresaId);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível registrar a movimentação.");
    } finally { setSalvando(false); }
  }

  return <section className="space-y-6">
    <div><span className="empresa-kicker">ERP da empresa</span><h2 className="mt-2 text-2xl font-bold text-slate-900">Movimentações</h2><p className="mt-1 text-slate-500">Consulte o histórico e registre entradas, saídas e ajustes de estoque.</p></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm"><div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(0,1fr)_180px]"><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por produto, motivo ou usuário" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><select value={filtroTipo} onChange={(event) => setFiltroTipo(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2"><option value="todos">Todos os tipos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option><option value="ajuste">Ajustes</option><option value="venda">Vendas</option></select></div><div className="overflow-x-auto"><table className="min-w-[1050px] w-full table-fixed text-left text-sm"><colgroup><col className="w-[170px]" /><col className="w-[280px]" /><col className="w-[100px]" /><col className="w-[100px]" /><col className="w-[150px]" /><col className="w-[220px]" /><col className="w-[160px]" /></colgroup><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="whitespace-nowrap px-4 py-3">Data</th><th className="whitespace-nowrap px-4 py-3">Produto</th><th className="whitespace-nowrap px-4 py-3">Tipo</th><th className="whitespace-nowrap px-4 py-3 text-right">Quantidade</th><th className="whitespace-nowrap px-4 py-3 text-right">Saldo</th><th className="whitespace-nowrap px-4 py-3">Motivo</th><th className="whitespace-nowrap px-4 py-3">Usuário</th></tr></thead><tbody>{visiveis.map((movimentacao) => <tr key={movimentacao.id} className="border-t border-slate-100"><td className="whitespace-nowrap px-4 py-3">{new Date(movimentacao.created_at).toLocaleString("pt-BR")}</td><td className="overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 font-medium" title={produtoPorId.get(movimentacao.produto_id)?.nome || movimentacao.produto_id}>{produtoPorId.get(movimentacao.produto_id)?.nome || movimentacao.produto_id}</td><td className="px-4 py-3">{tipoLabel[movimentacao.tipo]}</td><td className="px-4 py-3 text-right">{movimentacao.quantidade}</td><td className="px-4 py-3 text-right">{movimentacao.estoque_anterior} → {movimentacao.estoque_posterior}</td><td className="overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3" title={movimentacao.motivo || "-"}>{movimentacao.motivo || "-"}</td><td className="overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3" title={movimentacao.usuario_responsavel || "-"}>{movimentacao.usuario_responsavel || "-"}</td></tr>)}</tbody></table>{!visiveis.length && <p className="p-8 text-center text-slate-500">Nenhuma movimentação encontrada.</p>}</div></div>
      <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold text-slate-900">Nova movimentação</h3><label className="block text-sm font-medium text-slate-700">Produto<select value={produtoId} onChange={(event) => setProdutoId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="">Selecione um produto</option>{produtos.filter((produto) => produto.ativo).map((produto) => <option key={produto.id} value={produto.id}>{produto.nome} · saldo {produto.estoque_atual}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Tipo<select value={tipo} onChange={(event) => setTipo(event.target.value as TipoManual)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"><option value="entrada">Entrada</option><option value="saida">Saída</option><option value="ajuste">Ajuste</option></select></label><label className="block text-sm font-medium text-slate-700">Quantidade<input type="number" min="0.01" step="0.01" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium text-slate-700">Motivo<input value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Ex.: correção de contagem" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-medium text-slate-700">Observação<textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><button type="button" disabled={salvando} onClick={() => void registrar()} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{salvando ? "Registrando..." : "Registrar movimentação"}</button>{sucesso && <p className="text-sm font-medium text-emerald-700">{sucesso}</p>}{erro && <p className="text-sm font-medium text-red-700">{erro}</p>}<p className="text-xs text-slate-500">Transferências ficam preparadas para uma etapa futura.</p></div>
    </div>
  </section>;
}
