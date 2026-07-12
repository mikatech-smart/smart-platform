import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BrandConfig } from "../../config/brand";
import type { Empresa } from "../../models/Empresa";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  abrirErpPdvCaixa,
  buscarErpPdvCaixaAberto,
  buscarErpPdvClientes,
  buscarErpPdvVendasParaTroca,
  calcularErpPdvResumoCaixa,
  fecharErpPdvCaixa,
  finalizarErpPdvVenda,
  listarErpPdvProdutos,
  listarErpPdvUsuarios,
  listarErpPdvValesTroca,
  registrarErpPdvDevolucao,
  type ErpPdvCaixa,
  type ErpPdvCaixaResumo,
  type ErpPdvCliente,
  type ErpPdvFormaPagamento,
  type ErpPdvPermissao,
  type ErpPdvProduto,
  type ErpPdvTabelaPreco,
  type ErpPdvUsuario,
  type ErpPdvValeTroca,
  type ErpPdvVendaBusca,
} from "../../services/erpPdv/erpPdv.service";
import { applyRobotsMetadata } from "../../utils/seo";

import "./PublicPdvPage.css";

type EmpresaPdv = Empresa & {
  recursos_contratados?: {
    erp_pdv?: boolean;
  } | null;
};

type CarrinhoItem = {
  produtoId: string;
  quantidade: number;
};

type CarrinhoDetalhadoItem = {
  produto: ErpPdvProduto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

type PagamentosVenda = Partial<Record<ErpPdvFormaPagamento, string>>;

type FeedbackOperacao = {
  tipo: "sucesso" | "erro" | "info";
  texto: string;
};

type CupomVisualizacaoPagamento = {
  forma: string;
  valor: number;
  parcelas?: number;
};

type CupomVisualizacaoItem = {
  descricao: string;
  quantidade: number;
  subtotal: number;
};

type CupomVisualizacao = {
  empresaNome: string;
  empresaDocumento?: string;
  empresaEndereco?: string;
  numeroVenda: string;
  operador: string;
  cliente: string;
  criadoEm: string;
  itens: CupomVisualizacaoItem[];
  pagamentos: CupomVisualizacaoPagamento[];
  total: number;
  troco: number;
  complemento?: number;
};

type AtalhoAjuda = {
  tecla: string;
  descricao: string;
};

type ResumoVenda = {
  itens: CarrinhoDetalhadoItem[];
  quantidadeItens: number;
  subtotal: number;
  desconto: number;
  total: number;
  valoresPagamento: Record<ErpPdvFormaPagamento, number>;
  valorValeDisponivel: number;
  valorValeInformado: number;
  valorPago: number;
  restante: number;
  excesso: number;
  troco: number;
};

type VendaSuspensa = {
  id: string;
  criadaEm: string;
  operadorUsuarioId: string;
  operadorNome: string;
  clienteId?: string;
  clienteNome?: string;
  clienteBusca: string;
  tabela: ErpPdvTabelaPreco;
  formaPagamento: ErpPdvFormaPagamento;
  formasPagamentoSelecionadas?: ErpPdvFormaPagamento[];
  pagamentosVenda?: PagamentosVenda;
  parcelasCredito?: string;
  valeId: string;
  carrinho: CarrinhoItem[];
};

const formasPagamento: Array<{ id: ErpPdvFormaPagamento; label: string }> = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "pix", label: "PIX" },
  { id: "debito", label: "Debito" },
  { id: "credito", label: "Credito" },
  { id: "vale_troca", label: "Vale-Troca" },
  { id: "outros", label: "Outros" },
];

const tabelasPreco: Array<{ id: ErpPdvTabelaPreco; label: string; permissao: ErpPdvPermissao }> = [
  { id: "varejo", label: "Varejo", permissao: "tabela_varejo" },
  { id: "atacado", label: "Atacado", permissao: "tabela_atacado" },
  { id: "revenda", label: "Revenda", permissao: "tabela_revenda" },
  { id: "personalizada", label: "Personalizada", permissao: "preco_alterar" },
];

const perfisUsuario: Record<string, string> = {
  administrador: "Administrador",
  gerente: "Gerente",
  caixa: "Caixa",
  vendedor: "Vendedor",
  estoque: "Estoque",
};

const modulosIniciais: Record<string, string> = {
  pdv: "PDV",
  caixa: "Caixa",
  trocas: "Trocas",
  estoque: "Estoque",
  relatorios: "Relatorios",
};

function numero(valor: number | string | null | undefined) {
  const parsed = typeof valor === "number" ? valor : Number(String(valor || "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(valor: string) {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function gerarCupomTexto(cupom: CupomVisualizacao) {
  const clienteIdentificado = cupom.cliente && cupom.cliente !== "Consumidor final";
  return [
    cupom.empresaNome,
    "CUPOM NAO FISCAL",
    `Venda #${cupom.numeroVenda}`,
    `Data: ${new Date(cupom.criadoEm).toLocaleString("pt-BR")}`,
    `Operador: ${cupom.operador}`,
    clienteIdentificado ? `Cliente: ${cupom.cliente}` : "",
    cupom.empresaDocumento ? `Documento: ${cupom.empresaDocumento}` : "",
    cupom.empresaEndereco ? `Endereco: ${cupom.empresaEndereco}` : "",
    ...cupom.itens.map((item) => `${item.quantidade} x ${item.descricao} - R$ ${moeda(item.subtotal)}`),
    `Total: R$ ${moeda(cupom.total)}`,
    ...cupom.pagamentos.map((pagamento) =>
      `${pagamento.forma}: R$ ${moeda(pagamento.valor)}${pagamento.parcelas ? ` (${pagamento.parcelas}x)` : ""}`
    ),
    cupom.troco > 0 ? `Troco: R$ ${moeda(cupom.troco)}` : "",
    cupom.complemento ? `Complemento: R$ ${moeda(cupom.complemento)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizarTelefoneWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return "";
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return digitos;
}

function gerarCupomHtml(cupom: CupomVisualizacao) {
  const clienteIdentificado = cupom.cliente && cupom.cliente !== "Consumidor final";
  const itensHtml = cupom.itens
    .map(
      (item) => `
        <div class="receipt-row receipt-row--item">
          <span>${escapeHtml(item.descricao)}</span>
          <strong>${item.quantidade} x R$ ${moeda(item.subtotal / Math.max(item.quantidade, 1))}</strong>
        </div>
        <div class="receipt-row receipt-row--total-item">
          <span>${item.quantidade} un.</span>
          <strong>R$ ${moeda(item.subtotal)}</strong>
        </div>
      `
    )
    .join("");

  const pagamentosHtml = cupom.pagamentos
    .map(
      (pagamento) => `
        <div class="receipt-row">
          <span>${escapeHtml(pagamento.forma)}${pagamento.parcelas ? ` (${pagamento.parcelas}x)` : ""}</span>
          <strong>R$ ${moeda(pagamento.valor)}</strong>
        </div>
      `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Cupom nao fiscal #${escapeHtml(cupom.numeroVenda)}</title>
  <style>
    :root {
      color-scheme: light;
      --receipt-width: 80mm;
      --line: #d7dde6;
      --text: #0f172a;
      --muted: #475569;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef2f7;
      color: var(--text);
      font-family: "Courier New", monospace;
      padding: 24px;
    }
    .receipt-preview {
      margin: 0 auto;
      width: min(100%, 420px);
    }
    .receipt {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
      margin: 0 auto;
      padding: 18px 16px;
      width: var(--receipt-width);
      max-width: 100%;
    }
    .receipt--thermal-58 { --receipt-width: 58mm; }
    .receipt--thermal-80 { --receipt-width: 80mm; }
    .receipt__header,
    .receipt__section {
      border-bottom: 1px dashed var(--line);
      margin-bottom: 12px;
      padding-bottom: 12px;
    }
    .receipt__header:last-child,
    .receipt__section:last-child { border-bottom: 0; }
    .receipt__brand {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px;
      text-align: center;
    }
    .receipt__subtitle,
    .receipt__meta {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      text-align: center;
    }
    .receipt__section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin: 0 0 8px;
      text-transform: uppercase;
    }
    .receipt-row {
      align-items: baseline;
      display: flex;
      font-size: 12px;
      gap: 10px;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .receipt-row--item {
      font-weight: 700;
      margin-bottom: 2px;
    }
    .receipt-row--total-item {
      color: var(--muted);
      font-size: 11px;
      margin-bottom: 8px;
    }
    .receipt-row strong { white-space: nowrap; }
    .receipt__total {
      font-size: 18px;
      font-weight: 700;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .receipt-preview { width: auto; }
      .receipt {
        border: 0;
        border-radius: 0;
        box-shadow: none;
        padding: 0;
        width: 80mm;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-preview">
    <article class="receipt receipt--thermal-80">
      <header class="receipt__header">
        <h1 class="receipt__brand">${escapeHtml(cupom.empresaNome)}</h1>
        <p class="receipt__subtitle">Cupom nao fiscal</p>
        <p class="receipt__meta">Venda #${escapeHtml(cupom.numeroVenda)} | ${escapeHtml(
          new Date(cupom.criadoEm).toLocaleString("pt-BR")
        )}</p>
        <p class="receipt__meta">Operador: ${escapeHtml(cupom.operador)}</p>
        ${clienteIdentificado ? `<p class="receipt__meta">Cliente: ${escapeHtml(cupom.cliente)}</p>` : ""}
        ${cupom.empresaDocumento ? `<p class="receipt__meta">${escapeHtml(cupom.empresaDocumento)}</p>` : ""}
        ${cupom.empresaEndereco ? `<p class="receipt__meta">${escapeHtml(cupom.empresaEndereco)}</p>` : ""}
      </header>
      <section class="receipt__section">
        <h2 class="receipt__section-title">Itens</h2>
        ${itensHtml}
      </section>
      <section class="receipt__section">
        <h2 class="receipt__section-title">Pagamento</h2>
        ${pagamentosHtml}
        ${cupom.troco > 0 ? `<div class="receipt-row"><span>Troco</span><strong>R$ ${moeda(cupom.troco)}</strong></div>` : ""}
        ${cupom.complemento ? `<div class="receipt-row"><span>Complemento</span><strong>R$ ${moeda(cupom.complemento)}</strong></div>` : ""}
      </section>
      <section class="receipt__section">
        <div class="receipt-row receipt__total">
          <span>Total</span>
          <strong>R$ ${moeda(cupom.total)}</strong>
        </div>
      </section>
    </article>
  </div>
</body>
</html>`;
}

function obterPreco(produto: ErpPdvProduto, tabela: ErpPdvTabelaPreco) {
  if (tabela === "atacado") return produto.preco_atacado || produto.preco_venda;
  if (tabela === "revenda") return produto.preco_revenda || produto.preco_venda;
  if (tabela === "personalizada") {
    return produto.preco_personalizado || produto.preco_venda;
  }
  return produto.preco_venda;
}

function pode(usuario: ErpPdvUsuario | null, permissao: ErpPdvPermissao) {
  return Boolean(usuario?.permissoes[permissao]);
}

function obterTabelasLiberadas(usuario: ErpPdvUsuario | null) {
  return tabelasPreco.filter((item) => pode(usuario, item.permissao));
}

function calcularResumoVenda(params: {
  carrinho: CarrinhoItem[];
  produtosPorId: Map<string, ErpPdvProduto>;
  tabela: ErpPdvTabelaPreco;
  tabelaAtualLiberada: boolean;
  valeSelecionado: ErpPdvValeTroca | null;
  formasPagamentoSelecionadas: ErpPdvFormaPagamento[];
  pagamentosVenda: PagamentosVenda;
}): ResumoVenda {
  const {
    carrinho,
    produtosPorId,
    tabela,
    tabelaAtualLiberada,
    valeSelecionado,
    formasPagamentoSelecionadas,
    pagamentosVenda,
  } = params;

  const itens = carrinho
    .map((item) => {
      const produto = produtosPorId.get(item.produtoId);
      if (!produto) return null;
      const precoUnitario = obterPreco(produto, tabelaAtualLiberada ? tabela : "varejo");
      const quantidade = Math.max(0, numero(item.quantidade));
      return {
        produto,
        quantidade,
        precoUnitario,
        subtotal: precoUnitario * quantidade,
      };
    })
    .filter((item): item is CarrinhoDetalhadoItem => Boolean(item));

  const quantidadeItens = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const subtotal = itens.reduce((soma, item) => soma + item.subtotal, 0);
  const desconto = 0;
  const total = Math.max(0, subtotal - desconto);
  const valorValeDisponivel = valeSelecionado ? Math.min(total, valeSelecionado.saldo_restante) : 0;

  const valoresPagamento = formasPagamento.reduce(
    (acc, forma) => ({
      ...acc,
      [forma.id]: numero(String(pagamentosVenda[forma.id] || "").replace(",", ".")),
    }),
    {} as Record<ErpPdvFormaPagamento, number>
  );

  const valorValeInformado = formasPagamentoSelecionadas.includes("vale_troca")
    ? Math.min(numero(String(pagamentosVenda.vale_troca || "").replace(",", ".")), valorValeDisponivel)
    : 0;

  const valorPago = formasPagamentoSelecionadas.reduce((soma, forma) => {
    if (forma === "vale_troca") return soma + valorValeInformado;
    return soma + valoresPagamento[forma];
  }, 0);

  const restante = Math.max(0, total - valorPago);
  const excesso = Math.max(0, valorPago - total);
  const troco = valoresPagamento.dinheiro > 0 ? excesso : 0;

  return {
    itens,
    quantidadeItens,
    subtotal,
    desconto,
    total,
    valoresPagamento,
    valorValeDisponivel,
    valorValeInformado,
    valorPago,
    restante,
    excesso,
    troco,
  };
}

export default function PublicPdvPage() {
  const { slug = "" } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaPdv | null>(null);
  const [produtos, setProdutos] = useState<ErpPdvProduto[]>([]);
  const [usuarios, setUsuarios] = useState<ErpPdvUsuario[]>([]);
  const [clientes, setClientes] = useState<ErpPdvCliente[]>([]);
  const [vales, setVales] = useState<ErpPdvValeTroca[]>([]);
  const [caixa, setCaixa] = useState<ErpPdvCaixa | null>(null);
  const [resumoCaixa, setResumoCaixa] = useState<ErpPdvCaixaResumo | null>(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [operadorModalAberto, setOperadorModalAberto] = useState(true);
  const [busca, setBusca] = useState("");
  const [produtoAdicionadoId, setProdutoAdicionadoId] = useState("");
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [tabela, setTabela] = useState<ErpPdvTabelaPreco>("varejo");
  const [formaPagamento, setFormaPagamento] =
    useState<ErpPdvFormaPagamento>("dinheiro");
  const [formasPagamentoSelecionadas, setFormasPagamentoSelecionadas] =
    useState<ErpPdvFormaPagamento[]>(["dinheiro"]);
  const [pagamentosVenda, setPagamentosVenda] = useState<PagamentosVenda>({ dinheiro: "" });
  const [parcelasCredito, setParcelasCredito] = useState("1");
  const [valeId, setValeId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ErpPdvCliente | null>(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [valorFechamento, setValorFechamento] = useState("");
  const [cupom, setCupom] = useState<CupomVisualizacao | null>(null);
  const [vendasTroca, setVendasTroca] = useState<ErpPdvVendaBusca[]>([]);
  const [vendaTroca, setVendaTroca] = useState<ErpPdvVendaBusca | null>(null);
  const [motivoTroca, setMotivoTroca] = useState("");
  const [quantidadesTroca, setQuantidadesTroca] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackOperacao, setFeedbackOperacao] = useState<FeedbackOperacao | null>(null);
  const [resultadoSelecionadoIndex, setResultadoSelecionadoIndex] = useState(0);
  const [vendasSuspensas, setVendasSuspensas] = useState<VendaSuspensa[]>([]);
  const [modoCompacto, setModoCompacto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [atalhosAberto, setAtalhosAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [telaCheiaVisual, setTelaCheiaVisual] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);
  const clienteBuscaRef = useRef<HTMLInputElement>(null);
  const tabelaRef = useRef<HTMLSelectElement>(null);
  const cupomFrameRef = useRef<HTMLIFrameElement>(null);

  const usuarioAtual = usuarios.find((usuario) => usuario.id === usuarioId) || null;
  const operador = usuarioAtual?.nome || "";
  const empresaId = empresa?.id || "";
  const erpContratado = empresa?.recursos_contratados?.erp_pdv === true;
  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo);
  const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
  const tabelaLiberada = obterTabelasLiberadas(usuarioAtual);
  const tabelaAtualLiberada = tabelaLiberada.some((item) => item.id === tabela);
  const sessaoOperadorKey = `mikaon:pdv:${slug}:operador`;
  const vendasSuspensasKey = `mikaon:pdv:${slug}:vendas-suspensas`;
  const valesAtivos = vales.filter(
    (vale) =>
      vale.status === "ativo" &&
      vale.saldo_restante > 0 &&
      vale.validade_em >= new Date().toISOString().slice(0, 10)
  );
  const valeSelecionado = valesAtivos.find((vale) => vale.id === valeId) || null;

  const produtosEncontrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const ativos = produtos.filter((produto) => produto.ativo);
    if (!termo) return [];
    return ativos
      .filter((produto) =>
        [produto.nome, produto.sku, produto.codigo_barras].some((valor) =>
          String(valor || "").toLowerCase().includes(termo)
        )
      )
      .slice(0, 12);
  }, [busca, produtos]);

  const resultadoSelecionado = produtosEncontrados[resultadoSelecionadoIndex] || null;
  const cupomTexto = useMemo(() => (cupom ? gerarCupomTexto(cupom) : ""), [cupom]);
  const cupomHtml = useMemo(() => (cupom ? gerarCupomHtml(cupom) : ""), [cupom]);

  const resumoVenda = useMemo(
    () =>
      calcularResumoVenda({
        carrinho,
        produtosPorId,
        tabela,
        tabelaAtualLiberada,
        valeSelecionado,
        formasPagamentoSelecionadas,
        pagamentosVenda,
      }),
    [carrinho, formasPagamentoSelecionadas, pagamentosVenda, produtosPorId, tabela, tabelaAtualLiberada, valeSelecionado]
  );
  const carrinhoDetalhado = resumoVenda.itens;
  const quantidadeItensCarrinho = resumoVenda.quantidadeItens;
  const subtotalVenda = resumoVenda.subtotal;
  const descontoVenda = resumoVenda.desconto;
  const total = resumoVenda.total;
  const valoresPagamento = resumoVenda.valoresPagamento;
  const valorVale = resumoVenda.valorValeDisponivel;
  const valorValeInformado = resumoVenda.valorValeInformado;
  const totalPago = resumoVenda.valorPago;
  const valorRestantePagamento = resumoVenda.restante;
  const excessoPagamento = resumoVenda.excesso;
  const trocoPagamento = resumoVenda.troco;
  const pagamentoExatoOuComTroco = Math.abs(totalPago - total) < 0.01 || trocoPagamento > 0;
  const podeFinalizarPagamento = total > 0 && totalPago >= total && pagamentoExatoOuComTroco;
  const podeOperarCaixa = pode(usuarioAtual, "caixa_abrir_fechar");
  const podeVender = tabelaLiberada.length > 0;
  const podeOperarTrocas =
    pode(usuarioAtual, "devolucao_realizar") && pode(usuarioAtual, "vale_troca_emitir");
  const temModuloOperacional = podeOperarCaixa || podeVender || podeOperarTrocas;
  const podeFinalizarVenda =
    Boolean(caixa) && carrinhoDetalhado.length > 0 && operador.trim().length > 0 && podeFinalizarPagamento && !salvando;
  const podeSuspenderVenda = carrinhoDetalhado.length > 0 && operador.trim().length > 0;
  const atalhosAjuda: AtalhoAjuda[] = [
    { tecla: "F2", descricao: "Focar busca de produto" },
    { tecla: "F4", descricao: "Concluir venda" },
    { tecla: "F6", descricao: "Focar cliente" },
    ...(tabelaLiberada.length > 0 ? [{ tecla: "F7", descricao: "Focar tabela interna de preco" }] : []),
    { tecla: "F8", descricao: "Cancelar ou limpar venda" },
    { tecla: "F9", descricao: "Abrir ou fechar menu" },
    { tecla: "F10", descricao: "Entrar ou sair da tela cheia" },
    { tecla: "Esc", descricao: "Fechar ajuda, lista ou tela cheia" },
    { tecla: "Enter", descricao: "Adicionar produto ou confirmar acao" },
    { tecla: "↑ / ↓", descricao: "Navegar nos resultados da pesquisa" },
  ];

  const modoTelaCheiaAtivo = telaCheia || telaCheiaVisual;
  async function carregarDados() {
    if (!slug) return;
    setCarregando(true);
    setFeedback("");

    try {
      const { data, error } = await buscarEmpresaPorSlug(slug);
      if (error) throw error;
      if (!data) throw new Error("Empresa nao encontrada.");

      const empresaCarregada = data as EmpresaPdv;
      setEmpresa(empresaCarregada);

      if (!empresaCarregada.recursos_contratados?.erp_pdv) return;

      const [
        produtosResultado,
        usuariosResultado,
        clientesResultado,
        valesResultado,
        caixaResultado,
      ] = await Promise.all([
        listarErpPdvProdutos(empresaCarregada.id),
        listarErpPdvUsuarios(empresaCarregada.id),
        buscarErpPdvClientes(empresaCarregada.id, ""),
        listarErpPdvValesTroca(empresaCarregada.id),
        buscarErpPdvCaixaAberto(empresaCarregada.id),
      ]);

      if (produtosResultado.error) throw produtosResultado.error;
      if (usuariosResultado.error) throw usuariosResultado.error;
      if (clientesResultado.error) throw clientesResultado.error;
      if (valesResultado.error) throw valesResultado.error;
      if (caixaResultado.error) throw caixaResultado.error;

      setProdutos(produtosResultado.data);
      setUsuarios(usuariosResultado.data);
      setClientes(clientesResultado.data);
      setVales(valesResultado.data);
      setCaixa(caixaResultado.data);

      if (caixaResultado.data) {
        const resumo = await calcularErpPdvResumoCaixa(caixaResultado.data);
        if (resumo.error) throw resumo.error;
        setResumoCaixa(resumo.data);
        setValorFechamento(String(resumo.data?.totalEsperado || ""));
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel carregar o PDV.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    document.title = `PDV | ${BrandConfig.platformName}`;
    applyRobotsMetadata("noindex,nofollow");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!usuariosAtivos.length) return;

    const operadorSalvo = sessionStorage.getItem(sessaoOperadorKey);
    const usuarioSalvo = usuariosAtivos.find((usuario) => usuario.id === operadorSalvo);

    if (usuarioSalvo) {
      selecionarUsuario(usuarioSalvo.id);
      setOperadorModalAberto(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessaoOperadorKey, usuarios.length]);

  useEffect(() => {
    function aoAlterarTelaCheia() {
      setTelaCheia(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", aoAlterarTelaCheia);
    return () => document.removeEventListener("fullscreenchange", aoAlterarTelaCheia);
  }, []);

  useEffect(() => {
    try {
      const salvas = sessionStorage.getItem(vendasSuspensasKey);
      setVendasSuspensas(salvas ? JSON.parse(salvas) : []);
    } catch {
      setVendasSuspensas([]);
    }
  }, [vendasSuspensasKey]);

  useEffect(() => {
    setResultadoSelecionadoIndex(0);
  }, [busca, produtosEncontrados.length]);

  useEffect(() => {
    if (!feedbackOperacao) return;
    const timer = window.setTimeout(() => setFeedbackOperacao(null), 2600);
    return () => window.clearTimeout(timer);
  }, [feedbackOperacao]);

  useEffect(() => {
    if (!empresaId) return;

    const timer = window.setTimeout(async () => {
      try {
        const resultado = await buscarErpPdvClientes(empresaId, clienteBusca);
        if (resultado.error) throw resultado.error;
        setClientes(resultado.data);
      } catch {
        setFeedbackOperacao({ tipo: "erro", texto: "Nao foi possivel atualizar a busca de clientes." });
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [clienteBusca, empresaId]);

  function obterLabelPerfil(usuario: ErpPdvUsuario) {
    return perfisUsuario[usuario.perfil] || usuario.perfil;
  }

  function obterLabelModulo(usuario: ErpPdvUsuario) {
    return modulosIniciais[usuario.modulo_inicial] || "PDV";
  }

  function obterLabelsTabelas(usuario: ErpPdvUsuario) {
    const tabelas = obterTabelasLiberadas(usuario).map((item) => item.label);
    return tabelas.length ? tabelas.join(", ") : "Nenhuma tabela liberada";
  }

  function selecionarUsuario(id: string) {
    setUsuarioId(id);
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) return;

    sessionStorage.setItem(sessaoOperadorKey, id);
    setOperadorModalAberto(false);
    setFeedback("");

    const primeiraTabela = obterTabelasLiberadas(usuario)[0]?.id || "varejo";
    setTabela(primeiraTabela);

    window.setTimeout(() => {
      if (usuario.modulo_inicial === "trocas") {
        document.getElementById("pdv-trocas")?.scrollIntoView({ behavior: "smooth" });
      }
      if (usuario.modulo_inicial === "caixa") {
        document.getElementById("pdv-caixa")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }

  function trocarOperador() {
    if (carrinho.length > 0) {
      const confirmar = window.confirm(
        "Existe uma venda em andamento. Deseja cancelar o carrinho e trocar o operador?"
      );
      if (!confirmar) return;
    }

    setCarrinho([]);
    setCupom(null);
    setValeId("");
    setClienteSelecionado(null);
    setUsuarioId("");
    sessionStorage.removeItem(sessaoOperadorKey);
    setOperadorModalAberto(true);
    setFeedback("Selecione o operador para continuar.");
  }

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setTelaCheiaVisual(false);
        return;
      }

      if (telaCheiaVisual) {
        setTelaCheiaVisual(false);
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      setTelaCheiaVisual(true);
      setFeedback("Modo tela cheia aplicado dentro do navegador.");
    }
  }

  function cancelarVendaAtual() {
    if (!carrinhoDetalhado.length || !pode(usuarioAtual, "venda_cancelar")) return;
    setCarrinho([]);
    resetarPagamentoVenda();
    setFeedback("Venda cancelada antes da finalizacao.");
    setFeedbackOperacao({ tipo: "info", texto: "Venda limpa. Pronto para o proximo atendimento." });
  }

  function suspenderVendaAtual() {
    if (!podeSuspenderVenda || !usuarioAtual) return;
    const suspensa: VendaSuspensa = {
      id: String(Date.now()),
      criadaEm: new Date().toISOString(),
      operadorUsuarioId: usuarioAtual.id,
      operadorNome: usuarioAtual.nome,
      clienteId: clienteSelecionado?.id,
      clienteNome: clienteSelecionado?.nome,
      clienteBusca,
      tabela,
      formaPagamento,
      formasPagamentoSelecionadas,
      pagamentosVenda,
      parcelasCredito,
      valeId,
      carrinho,
    };

    persistirVendasSuspensas([suspensa, ...vendasSuspensas].slice(0, 12));
    setCarrinho([]);
    setClienteSelecionado(null);
    setClienteBusca("");
    resetarPagamentoVenda();
    setCupom(null);
    setFeedback("Venda suspensa. O caixa esta pronto para a proxima venda.");
    window.setTimeout(() => buscaRef.current?.focus(), 0);
  }

  function retomarVendaSuspensa(venda: VendaSuspensa) {
    if (carrinho.length > 0) {
      const confirmar = window.confirm("Existe uma venda em andamento. Deseja substitui-la pela venda suspensa?");
      if (!confirmar) return;
    }

    if (usuarios.some((usuario) => usuario.id === venda.operadorUsuarioId)) {
      setUsuarioId(venda.operadorUsuarioId);
      sessionStorage.setItem(sessaoOperadorKey, venda.operadorUsuarioId);
    }

    setCarrinho(venda.carrinho);
    setTabela(venda.tabela);
    setFormaPagamento(venda.formaPagamento);
    setFormasPagamentoSelecionadas(venda.formasPagamentoSelecionadas || [venda.formaPagamento]);
    setPagamentosVenda(venda.pagamentosVenda || { [venda.formaPagamento]: "" });
    setParcelasCredito(venda.parcelasCredito || "1");
    setValeId(venda.valeId);
    setClienteBusca(venda.clienteBusca);
    setClienteSelecionado(clientes.find((cliente) => cliente.id === venda.clienteId) || null);
    persistirVendasSuspensas(vendasSuspensas.filter((item) => item.id !== venda.id));
    setModoCompacto(false);
    setFeedback("Venda suspensa retomada.");
    window.setTimeout(() => buscaRef.current?.focus(), 0);
  }

  function excluirVendaSuspensa(id: string) {
    const confirmar = window.confirm("Deseja excluir esta venda suspensa?");
    if (!confirmar) return;
    persistirVendasSuspensas(vendasSuspensas.filter((item) => item.id !== id));
    setFeedback("Venda suspensa excluida.");
  }

  function renderModalOperador() {
    return (
      <section className="public-pdv-operator-modal" aria-modal="true" role="dialog">
        <div className="public-pdv-operator-card">
          <span>{BrandConfig.platformName} ERP/PDV</span>
          <h2>Selecione o operador</h2>
          <p>
            O acesso permanece sem senha nesta Sprint. As permissoes carregadas
            seguem o perfil do operador escolhido.
          </p>

          <div className="public-pdv-operator-list">
            {usuariosAtivos.length > 0 ? (
              usuariosAtivos.map((usuario) => (
                <button
                  type="button"
                  key={usuario.id}
                  onClick={() => selecionarUsuario(usuario.id)}
                  className="public-pdv-operator-option"
                >
                  <strong>{usuario.nome}</strong>
                  <small>{obterLabelPerfil(usuario)}</small>
                  <span>Tabelas: {obterLabelsTabelas(usuario)}</span>
                  <span>Modulo inicial: {obterLabelModulo(usuario)}</span>
                </button>
              ))
            ) : (
              <p className="public-pdv-operator-empty">
                Nenhum usuario ativo do ERP/PDV foi encontrado para esta empresa.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  function persistirVendasSuspensas(proximas: VendaSuspensa[]) {
    setVendasSuspensas(proximas);
    sessionStorage.setItem(vendasSuspensasKey, JSON.stringify(proximas));
  }

  function emitirFeedbackProduto(produto: ErpPdvProduto) {
    setProdutoAdicionadoId(produto.id);
    setFeedback(`Produto adicionado: ${produto.nome}`);
    window.setTimeout(() => setProdutoAdicionadoId(""), 700);

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audio = new AudioContextClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.03;
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.08);
    } catch {
      // Feedback sonoro opcional; navegadores podem bloquear audio sem interacao previa.
    }
  }

  function encontrarProdutoPorLeitura(termo: string) {
    const normalizado = termo.trim().toLowerCase();
    if (!normalizado) return null;
    return (
      produtos.find(
        (produto) =>
          produto.ativo &&
          [produto.codigo_barras, produto.sku].some((valor) => String(valor || "").toLowerCase() === normalizado)
      ) || null
    );
  }

  function adicionarProdutoPorBusca() {
    const termo = busca.trim();
    const produtoExato = encontrarProdutoPorLeitura(termo);
    const produto = produtoExato || resultadoSelecionado || produtosEncontrados[0];

    if (!produto) {
      setFeedbackOperacao({
        tipo: "erro",
        texto: termo ? `Produto ou codigo nao encontrado: ${termo}` : "Informe um produto ou codigo para adicionar.",
      });
      setBusca("");
      setResultadoSelecionadoIndex(0);
      window.setTimeout(() => buscaRef.current?.focus(), 0);
      return;
    }

    adicionarProduto(produto, 1);
  }

  function alterarQuantidadeProduto(produtoId: string, quantidade: number) {
    setCarrinho((itens) =>
      itens
        .map((item) => {
          if (item.produtoId !== produtoId) return item;
          const produto = produtosPorId.get(produtoId);
          const limite = produto?.estoque_atual || quantidade;
          return { ...item, quantidade: Math.max(0, Math.min(quantidade, limite)) };
        })
        .filter((item) => item.quantidade > 0)
    );
  }

  function adicionarProduto(produto: ErpPdvProduto, quantidade = 1) {
    if (!tabelaAtualLiberada) {
      setFeedback("Operador sem tabela de preco liberada para venda.");
      setFeedbackOperacao({ tipo: "erro", texto: "Tabela de preco nao liberada para este operador." });
      window.setTimeout(() => buscaRef.current?.focus(), 0);
      return;
    }

    if (produto.estoque_atual <= 0) {
      setFeedback("Produto esgotado.");
      setFeedbackOperacao({ tipo: "erro", texto: "Produto esgotado." });
      window.setTimeout(() => buscaRef.current?.focus(), 0);
      return;
    }

    setCarrinho((itens) => {
      const atual = itens.find((item) => item.produtoId === produto.id);
      if (atual) {
        return itens.map((item) =>
          item.produtoId === produto.id
            ? { ...item, quantidade: Math.min(item.quantidade + quantidade, produto.estoque_atual) }
            : item
        );
      }
      return [...itens, { produtoId: produto.id, quantidade: Math.min(quantidade, produto.estoque_atual) }];
    });
    setBusca("");
    setResultadoSelecionadoIndex(0);
    setFeedbackOperacao({ tipo: "sucesso", texto: `${produto.nome} adicionado ao carrinho.` });
    emitirFeedbackProduto(produto);
    window.setTimeout(() => buscaRef.current?.focus(), 0);
  }

  async function abrirCaixa() {
    if (!empresaId || !pode(usuarioAtual, "caixa_abrir_fechar")) return;
    setSalvando(true);
    try {
      const resultado = await abrirErpPdvCaixa({
        empresaId,
        operador,
        operadorUsuarioId: usuarioAtual?.id,
        saldoInicial: numero(saldoInicial.replace(",", ".")),
      });
      if (resultado.error) throw resultado.error;
      setCaixa(resultado.data);
      setSaldoInicial("");
      if (resultado.data) {
        const resumo = await calcularErpPdvResumoCaixa(resultado.data);
        if (resumo.error) throw resumo.error;
        setResumoCaixa(resumo.data);
      }
      setFeedback("Caixa aberto.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel abrir o caixa.");
    } finally {
      setSalvando(false);
    }
  }

  async function fecharCaixa() {
    if (!empresaId || !caixa || !pode(usuarioAtual, "caixa_abrir_fechar")) return;
    setSalvando(true);
    try {
      const resultado = await fecharErpPdvCaixa({
        empresaId,
        caixaId: caixa.id,
        valorInformado: numero(valorFechamento.replace(",", ".")),
        observacao: `Fechado por ${operador || "modo desenvolvimento"}`,
      });
      if (resultado.error) throw resultado.error;
      setResumoCaixa(resultado.data);
      setCaixa(null);
      setCarrinho([]);
      setFeedback("Caixa fechado.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel fechar o caixa.");
    } finally {
      setSalvando(false);
    }
  }

  function atualizarValorPagamento(forma: ErpPdvFormaPagamento, valor: string) {
    setPagamentosVenda((atuais) => ({ ...atuais, [forma]: valor }));
  }

  function alternarFormaPagamento(forma: ErpPdvFormaPagamento) {
    setFormaPagamento(forma);
    setFormasPagamentoSelecionadas((atuais) => {
      const jaSelecionada = atuais.includes(forma);
      if (jaSelecionada && atuais.length > 1) {
        setPagamentosVenda((valores) => ({ ...valores, [forma]: "" }));
        if (forma === "vale_troca") setValeId("");
        return atuais.filter((item) => item !== forma);
      }

      if (jaSelecionada) return atuais;

      const restante = Math.max(0, total - totalPago);
      setPagamentosVenda((valores) => ({
        ...valores,
        [forma]: restante > 0 ? String(restante.toFixed(2)) : valores[forma] || "",
      }));
      return [...atuais, forma];
    });
  }

  function resetarPagamentoVenda() {
    setFormaPagamento("dinheiro");
    setFormasPagamentoSelecionadas(["dinheiro"]);
    setPagamentosVenda({ dinheiro: "" });
    setParcelasCredito("1");
    setValeId("");
  }

  function fecharVisualizacaoCupom() {
    setCupom(null);
    window.setTimeout(() => buscaRef.current?.focus(), 0);
  }

  function abrirAjudaAtalhos() {
    setMenuAberto(false);
    setAtalhosAberto(true);
  }

  function imprimirCupom() {
    cupomFrameRef.current?.contentWindow?.print();
  }

  function prepararSalvarPdf() {
    setFeedbackOperacao({ tipo: "info", texto: "Salvar PDF preparado para a proxima etapa de impressao." });
  }

  function enviarCupomWhatsapp() {
    if (!cupom) return;

    try {
      const telefoneBase = clienteSelecionado?.whatsapp || clienteSelecionado?.telefone || "";
      const telefone = normalizarTelefoneWhatsapp(telefoneBase);
      const texto = gerarCupomTexto(cupom);
      const mensagem = `${texto}\n\nPowered by ${BrandConfig.developerCompany}`;
      const baseUrl = telefone ? `https://wa.me/${telefone}` : "https://wa.me/";
      const url = `${baseUrl}?text=${encodeURIComponent(mensagem)}`;
      const aberto = window.open(url, "_blank", "noopener,noreferrer");

      if (!aberto) {
        setFeedbackOperacao({ tipo: "info", texto: "WhatsApp bloqueado pelo navegador. Tente novamente." });
        return;
      }

      setFeedbackOperacao({
        tipo: "sucesso",
        texto: telefone ? "WhatsApp aberto com o numero do cliente." : "WhatsApp aberto para escolher o contato.",
      });
    } catch {
      setFeedbackOperacao({ tipo: "erro", texto: "Nao foi possivel abrir o WhatsApp agora." });
    }
  }

  async function finalizarVenda() {
    if (!empresaId || !caixa || !operador.trim()) return;
    if (!tabelaAtualLiberada) {
      setFeedback("Operador sem tabela de preco liberada para venda.");
      setFeedbackOperacao({ tipo: "erro", texto: "Operador sem tabela de preco liberada." });
      return;
    }

    if (formasPagamentoSelecionadas.includes("vale_troca") && !valeSelecionado) {
      setFeedback("Selecione um vale-troca ativo.");
      setFeedbackOperacao({ tipo: "erro", texto: "Selecione um vale-troca ativo." });
      return;
    }

    if (valorRestantePagamento > 0.009) {
      setFeedback(`Falta pagar R$ ${moeda(valorRestantePagamento)}.`);
      setFeedbackOperacao({ tipo: "erro", texto: `Falta pagar R$ ${moeda(valorRestantePagamento)}.` });
      return;
    }

    if (excessoPagamento > 0.009 && trocoPagamento <= 0) {
      setFeedback("Pagamento acima do total somente gera troco quando houver dinheiro.");
      setFeedbackOperacao({ tipo: "erro", texto: "Excesso sem dinheiro nao gera troco." });
      return;
    }

    const pagamentoFinal: ErpPdvFormaPagamento =
      formasPagamentoSelecionadas.length > 1 ? "outros" : formasPagamentoSelecionadas[0] || formaPagamento;
    const detalhesPagamento = formasPagamentoSelecionadas.map((forma) => ({
      forma,
      label: formasPagamento.find((item) => item.id === forma)?.label || forma,
      valor: forma === "vale_troca" ? valorValeInformado : valoresPagamento[forma],
      parcelas: forma === "credito" ? numero(parcelasCredito) : undefined,
    }));

    setSalvando(true);
    try {
      const resultado = await finalizarErpPdvVenda({
        empresaId,
        caixaId: caixa.id,
        clienteId: clienteSelecionado?.id,
        clienteNome: clienteSelecionado?.nome,
        operador,
        operadorUsuarioId: usuarioAtual?.id,
        formaPagamento: pagamentoFinal,
        valeTrocaId: formasPagamentoSelecionadas.includes("vale_troca") ? valeId : undefined,
        pagamentosDetalhados: detalhesPagamento,
        parcelasCredito: formasPagamentoSelecionadas.includes("credito") ? numero(parcelasCredito) : undefined,
        valorRecebidoDinheiro: valoresPagamento.dinheiro,
        troco: trocoPagamento,
        itens: carrinhoDetalhado.map((item) => ({
          produtoId: item.produto.id,
          descricao: item.produto.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      });
      if (resultado.error) throw resultado.error;
      if (!resultado.data) throw new Error("Venda nao retornada.");

      setCupom({
        empresaNome: empresa?.nome || "Empresa",
        empresaDocumento: undefined,
        empresaEndereco: empresa?.endereco || undefined,
        numeroVenda: String(resultado.data.numero),
        operador: resultado.data.operador,
        cliente: resultado.data.cliente_nome || "Consumidor final",
        criadoEm: resultado.data.finalizada_em || new Date().toISOString(),
        itens: carrinhoDetalhado.map((item) => ({
          descricao: item.produto.nome,
          quantidade: item.quantidade,
          subtotal: item.subtotal,
        })),
        pagamentos: detalhesPagamento.map((pagamento) => ({
          forma: pagamento.label,
          valor: pagamento.valor,
          parcelas: pagamento.parcelas,
        })),
        total: resultado.data.total,
        troco: trocoPagamento,
        complemento: resultado.data.pagamento_complementar || undefined,
      });
      setProdutos((atuais) =>
        atuais.map((produto) => {
          const mov = resultado.data?.movimentacoes.find(
            (item) => item.produto_id === produto.id
          );
          return mov ? { ...produto, estoque_atual: mov.estoque_posterior } : produto;
        })
      );
      setCarrinho([]);
      resetarPagamentoVenda();
      const valesAtualizados = await listarErpPdvValesTroca(empresaId);
      if (!valesAtualizados.error) setVales(valesAtualizados.data);
      const resumo = await calcularErpPdvResumoCaixa(caixa);
      if (!resumo.error) setResumoCaixa(resumo.data);
      setFeedback("Venda finalizada.");
      setFeedbackOperacao({ tipo: "sucesso", texto: "Pagamento concluido. Cupom aberto para conferencia." });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel finalizar.");
      setFeedbackOperacao({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Nao foi possivel finalizar.",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function buscarTrocas() {
    if (!empresaId || !pode(usuarioAtual, "devolucao_realizar")) return;
    const resultado = await buscarErpPdvVendasParaTroca(empresaId, {
      numero: "",
      cliente: clienteBusca,
      documento: "",
      data: "",
      operador: "",
    });
    if (resultado.error) {
      setFeedback(resultado.error.message);
      return;
    }
    setVendasTroca(resultado.data);
    setVendaTroca(resultado.data[0] || null);
  }

  async function registrarTroca() {
    if (!empresaId || !vendaTroca) return;
    if (!pode(usuarioAtual, "devolucao_realizar") || !pode(usuarioAtual, "vale_troca_emitir")) {
      setFeedback("Operador sem permissao para troca/vale-troca.");
      return;
    }
    const itens = vendaTroca.itens
      .map((item) => ({
        vendaItemId: item.id,
        quantidade: numero(quantidadesTroca[item.id]),
      }))
      .filter((item) => item.quantidade > 0);

    setSalvando(true);
    try {
      const resultado = await registrarErpPdvDevolucao({
        empresaId,
        vendaId: vendaTroca.id,
        operador,
        operadorUsuarioId: usuarioAtual?.id,
        motivo: motivoTroca,
        validadeDias: 30,
        itens,
      });
      if (resultado.error) throw resultado.error;
      if (resultado.data) setVales((atuais) => [resultado.data!.vale, ...atuais]);
      setMotivoTroca("");
      setQuantidadesTroca({});
      setFeedback("Troca registrada e vale-troca emitido.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel registrar a troca.");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    function aoPressionarTecla(evento: KeyboardEvent) {
      const alvo = evento.target as HTMLElement | null;

      if (evento.key === "F2") {
        evento.preventDefault();
        buscaRef.current?.focus();
        return;
      }

      if (evento.key === "F4") {
        evento.preventDefault();
        if (podeFinalizarVenda) void finalizarVenda();
        return;
      }

      if (evento.key === "F6") {
        evento.preventDefault();
        clienteBuscaRef.current?.focus();
        return;
      }

      if (evento.key === "F7") {
        evento.preventDefault();
        tabelaRef.current?.focus();
        return;
      }

      if (evento.key === "F8") {
        evento.preventDefault();
        cancelarVendaAtual();
        return;
      }

      if (evento.key === "F9") {
        evento.preventDefault();
        setMenuAberto((atual) => !atual);
        return;
      }

      if (evento.key === "F10") {
        evento.preventDefault();
        void alternarTelaCheia();
        return;
      }

      if (evento.key === "Escape") {
        if (alvo === buscaRef.current && busca.trim()) {
          evento.preventDefault();
          setBusca("");
          setResultadoSelecionadoIndex(0);
          return;
        }
        if (atalhosAberto) {
          evento.preventDefault();
          setAtalhosAberto(false);
          return;
        }
        if (menuAberto) {
          evento.preventDefault();
          setMenuAberto(false);
          return;
        }
        if (document.fullscreenElement) {
          evento.preventDefault();
          void document.exitFullscreen();
          return;
        }
        if (telaCheiaVisual) {
          evento.preventDefault();
          setTelaCheiaVisual(false);
        }
        return;
      }

      if (alvo === buscaRef.current) {
        if (evento.key === "ArrowDown" && produtosEncontrados.length > 0) {
          evento.preventDefault();
          setResultadoSelecionadoIndex((atual) => (atual + 1) % produtosEncontrados.length);
          return;
        }

        if (evento.key === "ArrowUp" && produtosEncontrados.length > 0) {
          evento.preventDefault();
          setResultadoSelecionadoIndex((atual) =>
            atual <= 0 ? produtosEncontrados.length - 1 : atual - 1
          );
          return;
        }

        if (evento.key === "Enter") {
          evento.preventDefault();
          adicionarProdutoPorBusca();
        }
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    atalhosAberto,
    busca,
    menuAberto,
    produtosEncontrados,
    podeFinalizarVenda,
    resultadoSelecionadoIndex,
    carrinhoDetalhado.length,
    usuarioAtual,
    telaCheiaVisual,
  ]);

  useEffect(() => {
    if (operadorModalAberto || !usuarioAtual || !podeVender) return;
    const timer = window.setTimeout(() => buscaRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [operadorModalAberto, usuarioAtual?.id, podeVender, produtos.length]);

  if (carregando) {
    return <main className="public-pdv public-pdv--center">Carregando PDV...</main>;
  }

  if (!empresa || !erpContratado) {
    return (
      <main className="public-pdv public-pdv--center">
        <section className="public-pdv-message">
          <h1>PDV nao disponivel</h1>
          <p>O ERP/PDV ainda nao esta ativo para esta empresa.</p>
          <Link to={`/${slug}`}>Voltar para pagina publica</Link>
        </section>
      </main>
    );
  }

  if (!usuarioAtual || operadorModalAberto) {
    return (
      <main className="public-pdv public-pdv--operator">
        {feedback && <div className="public-pdv-feedback">{feedback}</div>}
        {renderModalOperador()}
      </main>
    );
  }

  return (
    <main
      className={`public-pdv public-pdv--cashier ${menuAberto ? "public-pdv--menu-open" : ""} ${
        telaCheiaVisual ? "public-pdv--fullscreen" : ""
      } ${modoCompacto ? "public-pdv--compact" : ""}`}
    >
      <header className="public-pdv-header public-pdv-header--clean">
        <div className="public-pdv-topbar">
          <div>
            <span>Empresa</span>
            <strong>{empresa.nome}</strong>
          </div>
          <div>
            <span>Operador</span>
            <strong>{usuarioAtual.nome}</strong>
          </div>
          <div>
            <span>Caixa</span>
            <strong>{caixa ? "Aberto" : "Fechado"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{obterLabelPerfil(usuarioAtual)}</strong>
          </div>
        </div>
        <div className="public-pdv-header-actions">
          <button type="button" onClick={() => setMenuAberto((atual) => !atual)}>
            {menuAberto ? "Fechar menu" : "Menu"}
          </button>
        </div>
      </header>

      {feedback && <div className="public-pdv-feedback">{feedback}</div>}

      {modoCompacto && (
        <section className="public-pdv-panel public-pdv-compact-panel">
          <div>
            <span>Operador</span>
            <strong>{usuarioAtual.nome}</strong>
          </div>
          <div>
            <span>Caixa</span>
            <strong>{caixa ? "Aberto" : "Fechado"}</strong>
          </div>
          <div>
            <span>Itens</span>
            <strong>{quantidadeItensCarrinho}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>R$ {moeda(total)}</strong>
          </div>
          <button type="button" onClick={() => setModoCompacto(false)}>
            Voltar ao Caixa
          </button>
        </section>
      )}

      {menuAberto && (
        <aside className="public-pdv-secondary-menu" aria-label="Menu secundario do PDV">
          <div className="public-pdv-secondary-actions">
            <button type="button" onClick={abrirAjudaAtalhos}>
              Ajuda de atalhos
            </button>
            <button type="button" onClick={() => setModoCompacto((atual) => !atual)}>
              {modoCompacto ? "Voltar ao Caixa" : "Modo compacto"}
            </button>
            <button type="button" onClick={alternarTelaCheia}>
              {modoTelaCheiaAtivo ? "Sair da tela cheia" : "Tela cheia"}
            </button>
            <button type="button" onClick={trocarOperador}>
              Trocar operador
            </button>
            <Link to={`/${empresa.slug}`}>Pagina publica</Link>
          </div>

          {podeOperarCaixa && (
            <section className="public-pdv-secondary-panel" id="pdv-caixa">
              <h2>Caixa</h2>
              {caixa ? (
                <>
                  <p>Aberto por {caixa.operador}</p>
                  <strong>Esperado: R$ {moeda(resumoCaixa?.totalEsperado || 0)}</strong>
                  <label>Valor informado</label>
                  <input value={valorFechamento} onChange={(e) => setValorFechamento(e.target.value)} />
                  <button disabled={salvando || !pode(usuarioAtual, "caixa_abrir_fechar")} onClick={fecharCaixa}>
                    Fechar caixa
                  </button>
                </>
              ) : (
                <>
                  <label>Valor inicial</label>
                  <input value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} />
                  <button disabled={salvando || !operador.trim() || !pode(usuarioAtual, "caixa_abrir_fechar")} onClick={abrirCaixa}>
                    Abrir caixa
                  </button>
                </>
              )}
            </section>
          )}

          {podeVender && (
            <section className="public-pdv-secondary-panel">
              <h2>Acoes da venda</h2>
              <div className="public-pdv-secondary-actions public-pdv-secondary-actions--compact">
                <button
                  disabled={!carrinhoDetalhado.length || !pode(usuarioAtual, "venda_cancelar")}
                  onClick={cancelarVendaAtual}
                >
                  Cancelar venda
                </button>
                <button type="button" disabled={!podeSuspenderVenda} onClick={suspenderVendaAtual}>
                  Suspender venda
                </button>
              </div>
            </section>
          )}

          {podeVender && (
            <section className="public-pdv-secondary-panel public-pdv-suspended-sales">
              <div className="public-pdv-section-title">
                <h2>Vendas suspensas</h2>
                <small>{vendasSuspensas.length}</small>
              </div>
              {vendasSuspensas.length ? (
                vendasSuspensas.map((venda) => (
                  <div key={venda.id} className="public-pdv-suspended-sale">
                    <div>
                      <strong>{venda.clienteNome || "Consumidor nao identificado"}</strong>
                      <small>
                        {new Date(venda.criadaEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        {" | "}{venda.operadorNome}
                      </small>
                    </div>
                    <button type="button" onClick={() => retomarVendaSuspensa(venda)}>Retomar</button>
                    <button type="button" onClick={() => excluirVendaSuspensa(venda.id)}>Excluir</button>
                  </div>
                ))
              ) : (
                <p>Nenhuma venda suspensa.</p>
              )}
            </section>
          )}

          {podeOperarTrocas && (
            <section className="public-pdv-secondary-panel" id="pdv-trocas">
              <h2>Trocas autorizadas</h2>
              <button disabled={!pode(usuarioAtual, "devolucao_realizar")} onClick={buscarTrocas}>
                Buscar vendas
              </button>
              <div className="public-pdv-exchange">
                <select
                  value={vendaTroca?.id || ""}
                  onChange={(e) =>
                    setVendaTroca(vendasTroca.find((venda) => venda.id === e.target.value) || null)
                  }
                >
                  <option value="">Selecione uma venda</option>
                  {vendasTroca.map((venda) => (
                    <option key={venda.id} value={venda.id}>
                      #{venda.numero} - {venda.cliente_nome} - R$ {moeda(venda.total)}
                    </option>
                  ))}
                </select>
                {vendaTroca?.itens.map((item) => (
                  <label key={item.id}>
                    {item.descricao} ({item.quantidade_disponivel} disp.)
                    <input
                      value={quantidadesTroca[item.id] || ""}
                      onChange={(e) =>
                        setQuantidadesTroca((atuais) => ({
                          ...atuais,
                          [item.id]: e.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
                <textarea
                  value={motivoTroca}
                  onChange={(e) => setMotivoTroca(e.target.value)}
                  placeholder="Motivo da troca/devolucao"
                />
                <button
                  disabled={
                    salvando ||
                    !vendaTroca ||
                    !motivoTroca.trim() ||
                    !pode(usuarioAtual, "devolucao_realizar") ||
                    !pode(usuarioAtual, "vale_troca_emitir")
                  }
                  onClick={registrarTroca}
                >
                  Registrar troca e emitir vale
                </button>
              </div>
            </section>
          )}
        </aside>
      )}

      <select
        ref={tabelaRef}
        className="public-pdv-hidden-control"
        tabIndex={-1}
        aria-hidden="true"
        value={tabela}
        onChange={(e) => setTabela(e.target.value as ErpPdvTabelaPreco)}
      >
        {tabelaLiberada.length > 0 ? (
          tabelaLiberada.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))
        ) : (
          <option value="varejo">Sem tabela liberada</option>
        )}
      </select>

      {!temModuloOperacional && (
        <section className="public-pdv-panel public-pdv-empty-state">
          <h2>Nenhum modulo operacional liberado</h2>
          <p>Este operador esta ativo, mas nao possui permissoes de caixa, venda ou trocas para esta tela.</p>
        </section>
      )}

      {podeVender && (
        <section className="public-pdv-main-sale public-pdv-sale-layout">
          <div className="public-pdv-panel public-pdv-sale-flow">
            <section className="public-pdv-step public-pdv-step-client">
              <div className="public-pdv-section-title">
                <h2>Cliente</h2>
                <small>{clienteSelecionado?.nome || "Consumidor final"}</small>
              </div>
              <div className="public-pdv-inline">
                <input
                  ref={clienteBuscaRef}
                  value={clienteBusca}
                  onChange={(e) => setClienteBusca(e.target.value)}
                  placeholder="Nome, CPF/CNPJ ou telefone"
                />
              </div>
              <select
                value={clienteSelecionado?.id || ""}
                onChange={(e) =>
                  setClienteSelecionado(clientes.find((cliente) => cliente.id === e.target.value) || null)
                }
              >
                <option value="">Consumidor final</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </section>

            <section className="public-pdv-step public-pdv-step-product">
              <div className="public-pdv-section-title">
                <h2>Produto</h2>
                <small>Enter adiciona | leitor sequencial</small>
              </div>
              <div className="public-pdv-scan-row">
                <input
                  ref={buscaRef}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome, SKU, codigo ou GTIN"
                  aria-label="Buscar produto por nome, SKU, codigo ou GTIN"
                  aria-activedescendant={resultadoSelecionado ? `produto-resultado-${resultadoSelecionado.id}` : undefined}
                  aria-controls="pdv-produtos-resultados"
                  aria-expanded={Boolean(busca.trim())}
                />
              </div>
              {busca.trim() && (
                <div
                  id="pdv-produtos-resultados"
                  className="public-pdv-product-list public-pdv-search-results"
                  role="listbox"
                >
                  {produtosEncontrados.length ? (
                    produtosEncontrados.map((produto, index) => (
                      <button
                        key={produto.id}
                        id={`produto-resultado-${produto.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === resultadoSelecionadoIndex}
                        className={[
                          produtoAdicionadoId === produto.id ? "public-pdv-product-added" : "",
                          index === resultadoSelecionadoIndex ? "public-pdv-product-selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onMouseEnter={() => setResultadoSelecionadoIndex(index)}
                        onClick={() => adicionarProduto(produto)}
                      >
                        {produto.imagem_url ? (
                          <img src={produto.imagem_url} alt={produto.nome} />
                        ) : (
                          <span className="public-pdv-product-placeholder">Sem foto</span>
                        )}
                        <span>{produto.nome}</span>
                        <small>SKU: {produto.sku || produto.codigo_barras || "-"}</small>
                        <small>Estoque: {produto.estoque_atual}</small>
                        <strong>R$ {moeda(obterPreco(produto, tabelaAtualLiberada ? tabela : "varejo"))}</strong>
                      </button>
                    ))
                  ) : (
                    <div className="public-pdv-no-results">Nenhum produto encontrado.</div>
                  )}
                </div>
              )}

              {feedbackOperacao && (
                <div className={`public-pdv-operation-feedback public-pdv-operation-feedback--${feedbackOperacao.tipo}`}>
                  {feedbackOperacao.texto}
                </div>
              )}
            </section>

            <section className="public-pdv-step public-pdv-step-cart">
              <div className="public-pdv-section-title">
                <h2>Carrinho</h2>
                <small>{quantidadeItensCarrinho} item(ns)</small>
              </div>
              <div className="public-pdv-cart-lines">
                {carrinhoDetalhado.length ? (
                  carrinhoDetalhado.map((item) => (
                    <div key={item.produto.id} className="public-pdv-cart-item">
                      <div className="public-pdv-cart-item-main">
                        <strong title={item.produto.nome}>{item.produto.nome}</strong>
                      </div>
                      <div className="public-pdv-cart-item-meta">
                        <strong>R$ {moeda(item.subtotal)}</strong>
                      </div>
                      <div className="public-pdv-qty-controls">
                        <button type="button" onClick={() => alterarQuantidadeProduto(item.produto.id, item.quantidade - 1)}>
                          -
                        </button>
                        <input
                          aria-label={`Quantidade de ${item.produto.nome}`}
                          className="public-pdv-qty-input"
                          inputMode="numeric"
                          title={`Quantidade de ${item.produto.nome}`}
                          value={item.quantidade}
                          onChange={(e) => alterarQuantidadeProduto(item.produto.id, numero(e.target.value))}
                        />
                        <button type="button" onClick={() => alterarQuantidadeProduto(item.produto.id, item.quantidade + 1)}>
                          +
                        </button>
                      </div>
                      <button
                        className="public-pdv-cart-remove"
                        type="button"
                        aria-label={`Remover ${item.produto.nome}`}
                        title={`Remover ${item.produto.nome}`}
                        onClick={() =>
                          setCarrinho((itens) =>
                            itens.filter((linha) => linha.produtoId !== item.produto.id)
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="public-pdv-empty-cart">Carrinho vazio</div>
                )}
              </div>
            </section>
          </div>

          <aside className="public-pdv-panel public-pdv-checkout">
            <section className="public-pdv-checkout-summary">
              <h2>Resumo</h2>
              <div className="public-pdv-cart-summary">
                <div>
                  <span>Itens</span>
                  <strong>{quantidadeItensCarrinho}</strong>
                </div>
                <div>
                  <span>Subtotal</span>
                  <strong>R$ {moeda(subtotalVenda)}</strong>
                </div>
                <div>
                  <span>Desconto</span>
                  <strong>R$ {moeda(descontoVenda)}</strong>
                </div>
                <div>
                  <span>Restante</span>
                  <strong>R$ {moeda(valorRestantePagamento)}</strong>
                </div>
                <div className="public-pdv-cart-total-row">
                  <span>Total</span>
                  <strong>R$ {moeda(total)}</strong>
                </div>
              </div>
            </section>

            <section className="public-pdv-checkout-payment">
              <h2>Pagamento</h2>
              <div className="public-pdv-payment-buttons">
                {formasPagamento.map((forma) => (
                  <button
                    key={forma.id}
                    type="button"
                    className={formasPagamentoSelecionadas.includes(forma.id) ? "public-pdv-payment-active" : ""}
                    onClick={() => alternarFormaPagamento(forma.id)}
                  >
                    {forma.label}
                  </button>
                ))}
              </div>

              <div className="public-pdv-payment-grid">
                {formasPagamentoSelecionadas.map((forma) => {
                  const config = formasPagamento.find((item) => item.id === forma);
                  return (
                    <div key={forma} className="public-pdv-payment-entry">
                      <label>{config?.label || forma}</label>
                      {forma === "vale_troca" ? (
                        <div className="public-pdv-payment-fields">
                          <select value={valeId} onChange={(e) => setValeId(e.target.value)}>
                            <option value="">Selecione o vale</option>
                            {valesAtivos.map((vale) => (
                              <option key={vale.id} value={vale.id}>
                                #{vale.numero} - {vale.cliente_nome} - R$ {moeda(vale.saldo_restante)}
                              </option>
                            ))}
                          </select>
                          <input
                            value={pagamentosVenda.vale_troca || ""}
                            onChange={(e) => atualizarValorPagamento("vale_troca", e.target.value)}
                            placeholder={`Disponivel: R$ ${moeda(valorVale)}`}
                            inputMode="decimal"
                          />
                        </div>
                      ) : (
                        <input
                          value={pagamentosVenda[forma] || ""}
                          onChange={(e) => atualizarValorPagamento(forma, e.target.value)}
                          placeholder="0,00"
                          inputMode="decimal"
                        />
                      )}

                      {forma === "dinheiro" && (
                        <div className="public-pdv-cash-change">
                          <span>Total: R$ {moeda(total)}</span>
                          <span>Recebido: R$ {moeda(valoresPagamento.dinheiro)}</span>
                          <strong>Troco: R$ {moeda(trocoPagamento)}</strong>
                        </div>
                      )}

                      {forma === "credito" && (
                        <div className="public-pdv-installments">
                          <span>Parcelamento</span>
                          <select value={parcelasCredito} onChange={(e) => setParcelasCredito(e.target.value)}>
                            {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((parcela) => (
                              <option key={parcela} value={parcela}>{parcela}x</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="public-pdv-payment-balance">
                <span>Pago: R$ {moeda(totalPago)}</span>
                <strong>{valorRestantePagamento > 0 ? `Falta R$ ${moeda(valorRestantePagamento)}` : trocoPagamento ? `Troco R$ ${moeda(trocoPagamento)}` : excessoPagamento > 0.009 ? "Excesso sem troco" : "Pagamento completo"}</strong>
              </div>
            </section>

            <button
              className="public-pdv-finalize"
              disabled={!podeFinalizarVenda}
              onClick={finalizarVenda}
            >
              Concluir pagamento
            </button>
          </aside>
        </section>
      )}

      {cupom && (
        <section className="public-pdv-receipt-modal" aria-modal="true" role="dialog">
          <div className="public-pdv-receipt-backdrop" onClick={fecharVisualizacaoCupom} />
          <div className="public-pdv-receipt-dialog">
            <header className="public-pdv-receipt-header">
              <div>
                <span>Cupom nao fiscal</span>
                <h2>Venda #{cupom.numeroVenda}</h2>
              </div>
              <button type="button" onClick={fecharVisualizacaoCupom}>
                Fechar
              </button>
            </header>

            <div className="public-pdv-receipt-layout">
              <iframe
                ref={cupomFrameRef}
                className="public-pdv-receipt-frame"
                srcDoc={cupomHtml}
                title={`Cupom da venda ${cupom.numeroVenda}`}
              />

              <aside className="public-pdv-receipt-sidebar">
                <h3>Resumo do cupom</h3>
                <pre>{cupomTexto}</pre>
                <div className="public-pdv-receipt-actions">
                  <button type="button" onClick={imprimirCupom}>
                    Imprimir
                  </button>
                  <button type="button" onClick={enviarCupomWhatsapp}>
                    Enviar por WhatsApp
                  </button>
                  <button type="button" onClick={prepararSalvarPdf}>
                    Salvar PDF
                  </button>
                  <button type="button" onClick={fecharVisualizacaoCupom}>
                    Fechar
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {atalhosAberto && (
        <section className="public-pdv-shortcuts-modal" aria-modal="true" role="dialog">
          <div className="public-pdv-shortcuts-backdrop" onClick={() => setAtalhosAberto(false)} />
          <div className="public-pdv-shortcuts-dialog">
            <header className="public-pdv-shortcuts-header">
              <div>
                <span>PDV MikaON</span>
                <h2>Ajuda de atalhos</h2>
              </div>
              <button type="button" onClick={() => setAtalhosAberto(false)}>
                Fechar
              </button>
            </header>

            <div className="public-pdv-shortcuts-grid">
              {atalhosAjuda.map((atalho) => (
                <div key={atalho.tecla} className="public-pdv-shortcut-item">
                  <strong>{atalho.tecla}</strong>
                  <span>{atalho.descricao}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
