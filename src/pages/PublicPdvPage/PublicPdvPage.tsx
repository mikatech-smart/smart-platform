import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLayoutEffect } from "react";
import type { FormEvent, MouseEvent } from "react";

import { DataGrid } from "../../components/common/DataGrid/DataGrid";
import {
  ProductPricingEditor,
  normalizeProductPricingValues,
  type ProductPricingValues,
} from "../../components/erp/ProductPricingEditor/ProductPricingEditor";
import { BrandConfig } from "../../config/brand";
import type { Empresa } from "../../models/Empresa";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  abrirErpPdvCaixa,
  buscarErpPdvCaixaAberto,
  obterFuncoesErpPdvUsuario,
  buscarErpPdvClientes,
  buscarErpPdvVendasParaTroca,
  calcularErpPdvResumoCaixa,
  alterarStatusErpPdvProduto,
  excluirErpPdvProduto,
  fecharErpPdvCaixa,
  finalizarErpPdvVenda,
  garantirCategoriasPadraoErpPdv,
  listarErpPdvMovimentacoes,
  listarErpPdvProdutos,
  listarErpPdvProdutosPaginado,
  listarErpPdvFornecedores,
  listarErpPdvUsuarios,
  listarErpPdvValesTroca,
  registrarErpPdvDevolucao,
  registrarErpPdvMovimentacao,
  salvarErpPdvProduto,
  type ErpPdvCaixa,
  type ErpPdvCaixaResumo,
  type ErpPdvCategoria,
  type ErpPdvCliente,
  type ErpPdvFornecedor,
  type ErpPdvFormaPagamento,
  type ErpPdvFuncaoColaborador,
  type ErpPdvMovimentacao,
  type ErpPdvMovimentacaoTipo,
  type ErpPdvPermissao,
  type ErpPdvProduto,
  type ErpPdvProdutoPayload,
  type ErpPdvTabelaPreco,
  type ErpPdvUsuario,
  type ErpPdvValeTroca,
  type ErpPdvVendaBusca,
} from "../../services/erpPdv/erpPdv.service";
import { applyRobotsMetadata } from "../../utils/seo";
import { mockLoginEnabled, useAuth } from "../../auth/AuthContext";
import { supabase } from "../../lib/supabase";
import { isErpEnvironment, isPlatformEnvironment } from "../../auth/RuntimeEnvironment";

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

type EstoqueProdutoForm = {
  id?: string;
  nome: string;
  categoriaId: string;
  codigoInterno: string;
  codigoBarras: string;
  marca: string;
  fabricante: string;
  fornecedorPrincipal: string;
  unidade: string;
  ncm: string;
  localizacao: string;
  custo: string;
  acrescimoVarejo: string;
  markupVarejo: string;
  precoVenda: string;
  acrescimoAtacado: string;
  markupAtacado: string;
  precoAtacado: string;
  estoqueAtual: string;
  estoqueMinimo: string;
  estoqueMaximo: string;
  observacoes: string;
  ativo: boolean;
};

type EstoqueMovimentacaoForm = {
  produtoId: string;
  tipo: Exclude<ErpPdvMovimentacaoTipo, "venda">;
  quantidade: string;
  motivo: string;
  observacao: string;
};

type PerfilSelecaoOperador = "administrador" | "caixa" | "vendedor";
type TabelaSelecaoVendedor = "varejo" | "atacado";

type EstoqueStatusFiltro =
  | "todos"
  | "ativos"
  | "inativos"
  | "com_estoque"
  | "sem_estoque"
  | "abaixo_minimo";

type EstoqueOrdenacao = "nome" | "estoque" | "varejo" | "atacado" | "custo";

type ProdutoObservacoesEstruturadas = {
  fabricante: string;
  fornecedorPrincipal: string;
  estoqueMaximo: string;
  observacoesLivres: string;
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

function criarUsuarioEstoqueMock(empresaId: string): ErpPdvUsuario {
  return {
    id: "mock-estoque-teste",
    empresa_id: empresaId,
    nome: "Estoquista Teste",
    nome_exibicao: "Estoquista Teste",
    email: "estoque@mock.local",
    telefone: "",
    perfil: "estoque",
    funcoes: [],
    modulo_inicial: "estoque",
    permissoes: {
      tabela_varejo: false,
      tabela_atacado: false,
      tabela_revenda: false,
      produto_salvar: true,
      preco_alterar: true,
      desconto_aplicar: false,
      caixa_abrir_fechar: false,
      caixa_movimentar: false,
      venda_cancelar: false,
      devolucao_realizar: false,
      vale_troca_emitir: false,
      custo_lucro_consultar: true,
      relatorios_acessar: false,
    },
    ativo: true,
    created_at: "",
    updated_at: "",
  };
}

function numero(valor: number | string | null | undefined) {
  const parsed = typeof valor === "number" ? valor : Number(String(valor || "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function campoNumericoValido(valor: string) {
  const texto = valor.trim().replace(",", ".");
  return texto === "" || Number.isFinite(Number(texto));
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dataHoraRelatorio(valor: string | null) {
  return valor ? new Date(valor).toLocaleString("pt-BR") : "-";
}

function diferencaRelatorio(valor: number) {
  if (Math.abs(valor) < 0.005) return "Sem divergência\nR$ 0,00";
  return valor > 0
    ? `Sobra: + R$ ${moeda(valor)}`
    : `Falta: - R$ ${moeda(Math.abs(valor))}`;
}

function situacaoRelatorio(valor: number) {
  if (Math.abs(valor) < 0.005) return "Caixa conferido sem divergências";
  return valor > 0
    ? `Caixa com sobra de R$ ${moeda(valor)}`
    : `Caixa com falta de R$ ${moeda(Math.abs(valor))}`;
}

function resumoFechamentoTexto(
  resumo: ErpPdvCaixaResumo,
  empresaNome: string,
  operadorNome: string,
  diferenca: number
) {
  const caixa = resumo.caixa;
  return [
    "RELATÓRIO DE FECHAMENTO DE CAIXA",
    `Empresa: ${empresaNome}`,
    `Operador: ${operadorNome}`,
    `Data: ${dataHoraRelatorio(caixa.fechado_em)}`,
    "",
    `Total vendido: R$ ${moeda(resumo.totalVendas)}`,
    `Dinheiro: R$ ${moeda(resumo.vendasPorFormaPagamento.dinheiro || 0)}`,
    `PIX: R$ ${moeda(resumo.vendasPorFormaPagamento.pix || 0)}`,
    `Débito: R$ ${moeda(resumo.vendasPorFormaPagamento.debito || 0)}`,
    `Crédito: R$ ${moeda(resumo.vendasPorFormaPagamento.credito || 0)}`,
    `Outros: R$ ${moeda(resumo.vendasPorFormaPagamento.outros || 0)}`,
    `Saldo inicial: R$ ${moeda(caixa.saldo_inicial)}`,
    `Suprimentos: R$ ${moeda(resumo.suprimentos)}`,
    `Sangrias: R$ ${moeda(resumo.sangrias)}`,
    `Valor esperado: R$ ${moeda(resumo.totalEsperado)}`,
    `Valor informado: R$ ${moeda(resumo.valorInformado)}`,
    `Situação: ${situacaoRelatorio(diferenca)}`,
  ].join("\n");
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

function formatarNumeroFormulario(valor: number) {
  return Number.isFinite(valor) ? String(valor) : "";
}

function parseProdutoObservacoesEstruturadas(
  observacoes: string
): ProdutoObservacoesEstruturadas {
  const linhas = observacoes
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
  const resultado: ProdutoObservacoesEstruturadas = {
    fabricante: "",
    fornecedorPrincipal: "",
    estoqueMaximo: "",
    observacoesLivres: "",
  };
  const livres: string[] = [];

  linhas.forEach((linha) => {
    const fabricante = linha.match(/^Fabricante:\s*(.+)$/i);
    if (fabricante) {
      resultado.fabricante = fabricante[1].trim();
      return;
    }

    const fornecedor = linha.match(/^Fornecedor principal:\s*(.+)$/i);
    if (fornecedor) {
      resultado.fornecedorPrincipal = fornecedor[1].trim();
      return;
    }

    const estoqueMaximo = linha.match(/^Estoque maximo:\s*(.+)$/i);
    if (estoqueMaximo) {
      resultado.estoqueMaximo = estoqueMaximo[1].trim();
      return;
    }

    livres.push(linha);
  });

  resultado.observacoesLivres = livres.join("\n");
  return resultado;
}

function montarProdutoObservacoesEstruturadas(form: EstoqueProdutoForm) {
  return [
    form.observacoes.trim(),
    form.fabricante.trim() ? `Fabricante: ${form.fabricante.trim()}` : "",
    form.fornecedorPrincipal.trim()
      ? `Fornecedor principal: ${form.fornecedorPrincipal.trim()}`
      : "",
    form.estoqueMaximo.trim() ? `Estoque maximo: ${form.estoqueMaximo.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function obterStatusProdutoEstoque(produto: ErpPdvProduto) {
  if (!produto.ativo) {
    return {
      label: "Inativo",
      className: "public-pdv-stock-status--muted",
    };
  }

  if (produto.estoque_atual <= 0) {
    return {
      label: "Sem estoque",
      className: "public-pdv-stock-status--danger",
    };
  }

  if (produto.estoque_minimo > 0 && produto.estoque_atual <= produto.estoque_minimo) {
    return {
      label: "Estoque baixo",
      className: "public-pdv-stock-status--warning",
    };
  }

  return {
    label: "Ativo",
    className: "public-pdv-stock-status--success",
  };
}

function criarProdutoEstoqueForm(produto?: ErpPdvProduto | null): EstoqueProdutoForm {
  if (!produto) {
    return {
      nome: "",
      categoriaId: "",
      codigoInterno: "",
      codigoBarras: "",
      marca: "",
      fabricante: "",
      fornecedorPrincipal: "",
      unidade: "un",
      ncm: "",
      localizacao: "",
      custo: "",
      acrescimoVarejo: "",
      markupVarejo: "",
      precoVenda: "",
      acrescimoAtacado: "",
      markupAtacado: "",
      precoAtacado: "",
      estoqueAtual: "0",
      estoqueMinimo: "0",
      estoqueMaximo: "",
      observacoes: "",
      ativo: true,
    };
  }

  const observacoesEstruturadas = parseProdutoObservacoesEstruturadas(
    produto.observacoes || ""
  );
  const pricing = normalizeProductPricingValues({
    custo: formatarNumeroFormulario(produto.custo),
    acrescimoVarejo: "",
    markupVarejo: "",
    precoVenda: produto.preco_venda ? String(produto.preco_venda) : "",
    acrescimoAtacado: "",
    markupAtacado: "",
    precoAtacado: produto.preco_atacado ? String(produto.preco_atacado) : "",
  });

  return {
    id: produto.id,
    nome: produto.nome,
    categoriaId: produto.categoria_id || "",
    codigoInterno: produto.sku,
    codigoBarras: produto.codigo_barras,
    marca: produto.marca || "",
    fabricante: observacoesEstruturadas.fabricante,
    fornecedorPrincipal: observacoesEstruturadas.fornecedorPrincipal,
    unidade: produto.unidade || "un",
    ncm: produto.ncm || "",
    localizacao: produto.localizacao || "",
    ...pricing,
    estoqueAtual: String(produto.estoque_atual),
    estoqueMinimo: String(produto.estoque_minimo),
    estoqueMaximo: observacoesEstruturadas.estoqueMaximo,
    observacoes: observacoesEstruturadas.observacoesLivres,
    ativo: produto.ativo,
  };
}

function criarMovimentacaoEstoqueForm(produtoId = ""): EstoqueMovimentacaoForm {
  return {
    produtoId,
    tipo: "entrada",
    quantidade: "",
    motivo: "",
    observacao: "",
  };
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

type PublicPdvPageProps = {
  modo?: "pdv" | "caixa";
};

export default function PublicPdvPage({ modo = "pdv" }: PublicPdvPageProps) {
  const { slug = "mikatech" } = useParams();
  const { session: authSession, loading: authLoading, profile: authProfile, signOut } = useAuth();
  const permitirMock = mockLoginEnabled();
  const [empresa, setEmpresa] = useState<EmpresaPdv | null>(null);
  const [produtos, setProdutos] = useState<ErpPdvProduto[]>([]);
  const [usuarios, setUsuarios] = useState<ErpPdvUsuario[]>([]);
  const [categorias, setCategorias] = useState<ErpPdvCategoria[]>([]);
  const [clientes, setClientes] = useState<ErpPdvCliente[]>([]);
  const [fornecedores, setFornecedores] = useState<ErpPdvFornecedor[]>([]);
  const [vales, setVales] = useState<ErpPdvValeTroca[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<ErpPdvMovimentacao[]>([]);
  const [caixa, setCaixa] = useState<ErpPdvCaixa | null>(null);
  const [resumoCaixa, setResumoCaixa] = useState<ErpPdvCaixaResumo | null>(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [operadorModalAberto, setOperadorModalAberto] = useState(true);
  const [loginEnviado, setLoginEnviado] = useState(false);
  const [loginUsuario, setLoginUsuario] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [perfilSelecaoOperador, setPerfilSelecaoOperador] =
    useState<PerfilSelecaoOperador | null>(null);
  const [tabelaSelecaoVendedor, setTabelaSelecaoVendedor] =
    useState<TabelaSelecaoVendedor | null>(null);
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
  const [estoqueBusca, setEstoqueBusca] = useState("");
  const [estoqueBuscaDebounced, setEstoqueBuscaDebounced] = useState("");
  const [estoqueStatusFiltro, setEstoqueStatusFiltro] =
    useState<EstoqueStatusFiltro>("todos");
  const [estoqueCategoriaFiltro, setEstoqueCategoriaFiltro] = useState("");
  const [estoqueMarcaFiltro, setEstoqueMarcaFiltro] = useState("");
  const [estoqueFornecedorFiltro, setEstoqueFornecedorFiltro] = useState("");
  const [estoqueOrdenacao, setEstoqueOrdenacao] =
    useState<EstoqueOrdenacao>("nome");
  const [estoquePagina, setEstoquePagina] = useState(1);
  const [estoqueItensPorPagina, setEstoqueItensPorPagina] = useState(25);
  const [produtosEstoquePaginaServidor, setProdutosEstoquePaginaServidor] =
    useState<ErpPdvProduto[]>([]);
  const [totalProdutosEstoqueServidor, setTotalProdutosEstoqueServidor] =
    useState(0);
  const [produtoEstoqueSelecionadoId, setProdutoEstoqueSelecionadoId] = useState("");
  const [menuContextoProduto, setMenuContextoProduto] = useState<{
    produto: ErpPdvProduto;
    x: number;
    y: number;
  } | null>(null);
  const [menuContextoPosicao, setMenuContextoPosicao] = useState({ x: 8, y: 8 });
  const menuContextoRef = useRef<HTMLDivElement>(null);
  const estoquePaginaConsultaIdRef = useRef(0);
  const [produtoEstoqueForm, setProdutoEstoqueForm] = useState<EstoqueProdutoForm>(criarProdutoEstoqueForm());
  const [movimentacaoEstoqueForm, setMovimentacaoEstoqueForm] =
    useState<EstoqueMovimentacaoForm>(criarMovimentacaoEstoqueForm());
  const [saldoInicial, setSaldoInicial] = useState("");
  const [valorFechamento, setValorFechamento] = useState("");
  const [relatorioFechamento, setRelatorioFechamento] = useState<ErpPdvCaixaResumo | null>(null);
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
  const [menuAberto, setMenuAberto] = useState(modo === "caixa");
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
  const diferencaFechamento = relatorioFechamento
    ? relatorioFechamento.valorInformado - relatorioFechamento.totalEsperado
    : 0;
  const erpContratado = empresa?.recursos_contratados?.erp_pdv === true;
  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo);
  const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
  const tabelaLiberada = obterTabelasLiberadas(usuarioAtual);
  const tabelaAtualLiberada = tabelaLiberada.some((item) => item.id === tabela);
  const sessaoOperadorKey = `mikaon:pdv:${slug}:operador`;
  const sessaoOperadorTabelaKey = `mikaon:pdv:${slug}:operador-tabela`;
  const vendasSuspensasKey = `mikaon:pdv:${slug}:vendas-suspensas`;
  const valesAtivos = vales.filter(
    (vale) =>
      vale.status === "ativo" &&
      vale.saldo_restante > 0 &&
      vale.validade_em >= new Date().toISOString().slice(0, 10)
  );
  const valeSelecionado = valesAtivos.find((vale) => vale.id === valeId) || null;
  const categoriasPorId = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria])),
    [categorias]
  );
  const usarPaginacaoServidorEstoque =
    pode(usuarioAtual, "produto_salvar") &&
    (!tabelaLiberada.length || usuarioAtual?.modulo_inicial === "estoque") &&
    estoqueStatusFiltro === "todos" &&
    estoqueOrdenacao !== "estoque" &&
    !estoqueCategoriaFiltro &&
    !estoqueMarcaFiltro &&
    !estoqueFornecedorFiltro;

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
  const marcasProdutos = useMemo(
    () =>
      Array.from(
        new Set(
          produtos
            .map((produto) => produto.marca.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [produtos]
  );
  const fornecedoresProdutos = useMemo(
    () =>
      Array.from(
        new Set(
          produtos
            .map(
              (produto) =>
                parseProdutoObservacoesEstruturadas(produto.observacoes).fornecedorPrincipal
            )
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [produtos]
  );
  const produtosEstoqueFiltrados = useMemo(() => {
    const termo = estoqueBuscaDebounced.trim().toLowerCase();
    const filtrados = produtos.filter((produto) => {
      const observacoesEstruturadas = parseProdutoObservacoesEstruturadas(
        produto.observacoes
      );
      const categoriaNome =
        categoriasPorId.get(produto.categoria_id || "")?.nome || "";
      const atendeBusca =
        !termo ||
        [
          produto.nome,
          produto.sku,
          produto.codigo_barras,
          categoriaNome,
          produto.marca,
          observacoesEstruturadas.fornecedorPrincipal,
          observacoesEstruturadas.fabricante,
        ].some((valor) => String(valor || "").toLowerCase().includes(termo));

      const atendeStatus =
        estoqueStatusFiltro === "todos" ||
        (estoqueStatusFiltro === "ativos" && produto.ativo) ||
        (estoqueStatusFiltro === "inativos" && !produto.ativo) ||
        (estoqueStatusFiltro === "com_estoque" && produto.estoque_atual > 0) ||
        (estoqueStatusFiltro === "sem_estoque" && produto.estoque_atual <= 0) ||
        (estoqueStatusFiltro === "abaixo_minimo" &&
          produto.estoque_minimo > 0 &&
          produto.estoque_atual <= produto.estoque_minimo);

      const atendeCategoria =
        !estoqueCategoriaFiltro || produto.categoria_id === estoqueCategoriaFiltro;
      const atendeMarca =
        !estoqueMarcaFiltro ||
        produto.marca.toLowerCase() === estoqueMarcaFiltro.toLowerCase();
      const atendeFornecedor =
        !estoqueFornecedorFiltro ||
        observacoesEstruturadas.fornecedorPrincipal.toLowerCase() ===
          estoqueFornecedorFiltro.toLowerCase();

      return (
        atendeBusca &&
        atendeStatus &&
        atendeCategoria &&
        atendeMarca &&
        atendeFornecedor
      );
    });

    return filtrados.sort((produtoA, produtoB) => {
      if (estoqueOrdenacao === "estoque") {
        return produtoB.estoque_atual - produtoA.estoque_atual;
      }
      if (estoqueOrdenacao === "varejo") {
        return produtoB.preco_venda - produtoA.preco_venda;
      }
      if (estoqueOrdenacao === "atacado") {
        return produtoB.preco_atacado - produtoA.preco_atacado;
      }
      if (estoqueOrdenacao === "custo") {
        return produtoB.custo - produtoA.custo;
      }
      return produtoA.nome.localeCompare(produtoB.nome);
    });
  }, [
    categoriasPorId,
    estoqueBuscaDebounced,
    estoqueCategoriaFiltro,
    estoqueFornecedorFiltro,
    estoqueMarcaFiltro,
    estoqueOrdenacao,
    estoqueStatusFiltro,
    produtos,
  ]);
  const totalPaginasEstoque = Math.max(
    1,
    Math.ceil(
      (usarPaginacaoServidorEstoque
        ? totalProdutosEstoqueServidor
        : produtosEstoqueFiltrados.length) / estoqueItensPorPagina
    )
  );
  const produtosEstoquePaginados = useMemo(() => {
    if (usarPaginacaoServidorEstoque) return produtosEstoquePaginaServidor;
    const paginaAtual = Math.min(estoquePagina, totalPaginasEstoque);
    const inicio = (paginaAtual - 1) * estoqueItensPorPagina;
    return produtosEstoqueFiltrados.slice(inicio, inicio + estoqueItensPorPagina);
  }, [
    estoqueItensPorPagina,
    estoquePagina,
    produtosEstoquePaginaServidor,
    produtosEstoqueFiltrados,
    totalPaginasEstoque,
    usarPaginacaoServidorEstoque,
  ]);
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
  const ehPerfilEstoque = usuarioAtual?.perfil === "estoque";
  const podeOperarEstoque = pode(usuarioAtual, "produto_salvar");
  const podeExcluirProduto =
    podeOperarEstoque &&
    (ehPerfilEstoque || usuarioAtual?.perfil === "administrador" || usuarioAtual?.perfil === "gerente");
  const movimentacoesVisiveisEstoque = ehPerfilEstoque
    ? movimentacoes.filter(
        (movimentacao) =>
          movimentacao.tipo !== "venda" && movimentacao.origem !== "venda"
      )
    : movimentacoes;
  const podeConsultarCustoLucro = pode(usuarioAtual, "custo_lucro_consultar");
  const podeAlterarPreco = pode(usuarioAtual, "preco_alterar");
  const podeOperarTrocas =
    pode(usuarioAtual, "devolucao_realizar") && pode(usuarioAtual, "vale_troca_emitir");
  const caixaIndependente = modo === "caixa";
  const temModuloOperacional = caixaIndependente
    ? podeOperarCaixa
    : podeOperarCaixa || podeVender || podeOperarTrocas || podeOperarEstoque;
  const exibirModuloEstoque =
    podeOperarEstoque &&
    (!podeVender ||
      usuarioAtual?.modulo_inicial === "estoque" ||
      usuarioAtual?.perfil === "administrador" ||
      usuarioAtual?.perfil === "gerente");
  const podeFinalizarVenda =
    Boolean(caixa) && carrinhoDetalhado.length > 0 && operador.trim().length > 0 && podeFinalizarPagamento && !salvando;
  const podeSuspenderVenda = carrinhoDetalhado.length > 0 && operador.trim().length > 0;
  const atalhosAjuda: AtalhoAjuda[] = [
    { tecla: "F2", descricao: "Focar busca de produto" },
    { tecla: "F4", descricao: "Concluir venda" },
    { tecla: "F6", descricao: "Focar cliente" },
    ...(tabelaLiberada.length > 0 && usuarioAtual?.perfil !== "vendedor"
      ? [{ tecla: "F7", descricao: "Focar tabela interna de preco" }]
      : []),
    { tecla: "F8", descricao: "Cancelar ou limpar venda" },
    { tecla: "F9", descricao: "Abrir ou fechar menu" },
    { tecla: "F10", descricao: "Entrar ou sair da tela cheia" },
    { tecla: "Esc", descricao: "Fechar ajuda, lista ou tela cheia" },
    { tecla: "Enter", descricao: "Adicionar produto ou confirmar acao" },
    { tecla: "↑ / ↓", descricao: "Navegar nos resultados da pesquisa" },
  ];

  const modoTelaCheiaAtivo = telaCheia || telaCheiaVisual;

  useLayoutEffect(() => {
    if (!menuContextoProduto || !menuContextoRef.current) return;

    const menu = menuContextoRef.current.getBoundingClientRect();
    const margem = 8;
    const espaco = 6;
    const x = Math.max(
      margem,
      Math.min(menuContextoProduto.x, window.innerWidth - menu.width - margem)
    );
    const abaixo = menuContextoProduto.y + espaco;
    const acima = menuContextoProduto.y - menu.height - espaco;
    const y =
      abaixo + menu.height <= window.innerHeight - margem
        ? abaixo
        : Math.max(margem, acima);

    setMenuContextoPosicao({ x, y });
  }, [menuContextoProduto]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEstoqueBuscaDebounced(estoqueBusca);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [estoqueBusca]);

  useEffect(() => {
    setEstoquePagina(1);
  }, [
    estoqueBuscaDebounced,
    estoqueCategoriaFiltro,
    estoqueFornecedorFiltro,
    estoqueItensPorPagina,
    estoqueMarcaFiltro,
    estoqueOrdenacao,
    estoqueStatusFiltro,
  ]);

  useEffect(() => {
    if (!tabelaLiberada.length) return;
    if (!tabelaLiberada.some((item) => item.id === tabela)) {
      setTabela(tabelaLiberada[0].id);
    }
  }, [tabela, tabelaLiberada]);

  useEffect(() => {
    if (estoquePagina > totalPaginasEstoque) {
      setEstoquePagina(totalPaginasEstoque);
    }
  }, [estoquePagina, totalPaginasEstoque]);

  useEffect(() => {
    if (!empresaId || !usarPaginacaoServidorEstoque) return;
    let ativo = true;
    const consultaId = ++estoquePaginaConsultaIdRef.current;
    void listarErpPdvProdutosPaginado(
      empresaId,
      estoquePagina,
      estoqueItensPorPagina,
      estoqueBuscaDebounced,
      estoqueOrdenacao
    ).then((resultado) => {
      if (!ativo || consultaId !== estoquePaginaConsultaIdRef.current || resultado.error || !resultado.data) return;
      setProdutosEstoquePaginaServidor(resultado.data.data);
      setTotalProdutosEstoqueServidor(resultado.data.total);
    });

    return () => {
      ativo = false;
    };
  }, [
    empresaId,
    estoqueBuscaDebounced,
    estoqueItensPorPagina,
    estoqueOrdenacao,
    estoquePagina,
    usarPaginacaoServidorEstoque,
  ]);

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
        categoriasResultado,
        clientesResultado,
        fornecedoresResultado,
        valesResultado,
        caixaResultado,
        movimentacoesResultado,
      ] = await Promise.all([
        listarErpPdvProdutos(empresaCarregada.id),
        listarErpPdvUsuarios(empresaCarregada.id),
        garantirCategoriasPadraoErpPdv(empresaCarregada.id),
        buscarErpPdvClientes(empresaCarregada.id, ""),
        listarErpPdvFornecedores(empresaCarregada.id),
        listarErpPdvValesTroca(empresaCarregada.id),
        buscarErpPdvCaixaAberto(empresaCarregada.id),
        listarErpPdvMovimentacoes(empresaCarregada.id),
      ]);

      if (produtosResultado.error) throw produtosResultado.error;
      if (usuariosResultado.error) throw usuariosResultado.error;
      if (categoriasResultado.error) throw categoriasResultado.error;
      if (clientesResultado.error) throw clientesResultado.error;
      if (fornecedoresResultado.error) throw fornecedoresResultado.error;
      if (valesResultado.error) throw valesResultado.error;
      if (caixaResultado.error) throw caixaResultado.error;
      if (movimentacoesResultado.error) throw movimentacoesResultado.error;

      setProdutos(produtosResultado.data);
      const usuariosSemMockEstoque = usuariosResultado.data.filter(
        (usuario) => usuario.nome !== "Estoquista Teste"
      );
      setUsuarios(
        permitirMock
          ? [...usuariosSemMockEstoque, criarUsuarioEstoqueMock(empresaCarregada.id)]
          : usuariosSemMockEstoque
      );
      setCategorias(categoriasResultado.data);
      setClientes(clientesResultado.data);
      setFornecedores(fornecedoresResultado.data);
      setVales(valesResultado.data);
      setCaixa(caixaResultado.data);
      setMovimentacoes(movimentacoesResultado.data);

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
    document.title = isPlatformEnvironment()
      ? `Painel Administrativo | ${BrandConfig.platformName}`
      : `ERP | ${BrandConfig.platformName}`;
    applyRobotsMetadata("noindex,nofollow");
    if (authLoading) return;
    if (isErpEnvironment() && authProfile) {
      window.location.assign(`/empresa/${authProfile.empresaSlug}`);
      return;
    }
    if (!authSession && !permitirMock) {
      setCarregando(false);
      return;
    }
    void carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authSession?.user.id, authProfile?.empresaSlug, permitirMock, slug]);

  useEffect(() => {
    if (!usuariosAtivos.length) return;

    const operadorSalvo = sessionStorage.getItem(sessaoOperadorKey);
    const usuarioSalvo = usuariosAtivos.find((usuario) => usuario.id === operadorSalvo);

    if (usuarioSalvo) {
      const tabelaSalva = sessionStorage.getItem(sessaoOperadorTabelaKey);
      const tabelaForcada =
        usuarioSalvo.perfil === "vendedor" &&
        (tabelaSalva === "varejo" || tabelaSalva === "atacado")
          ? tabelaSalva
          : undefined;
      selecionarUsuario(usuarioSalvo.id, tabelaForcada);
      setOperadorModalAberto(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessaoOperadorKey, sessaoOperadorTabelaKey, usuarios.length]);

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

  async function entrarNoAcessoTemporario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginUsuario.trim() || !loginSenha) {
      setFeedback("Informe o usuario e a senha para continuar.");
      return;
    }

    const loginInformado = loginUsuario.trim().toLocaleLowerCase();
    if (isPlatformEnvironment() && !loginUsuario.includes("@") && loginInformado !== "admin") {
      setFeedback("Acesso negado. Este ambiente e exclusivo da administracao da plataforma.");
      return;
    }
    if (isErpEnvironment() && loginInformado === "admin") {
      setFeedback("Acesso negado. O administrador da plataforma deve usar o ambiente administrativo.");
      return;
    }

    const loginReal = !permitirMock || loginUsuario.includes("@");
    if (loginReal) {
      setFeedback("");
      setCarregando(true);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginUsuario.trim(),
        password: loginSenha,
      });

      if (authError || !authData.user) {
        setCarregando(false);
        setFeedback(authError?.message || "Nao foi possivel autenticar o usuario.");
        return;
      }

      if (isPlatformEnvironment()) {
        const { data: platformAdmin, error: platformError } = await supabase
          .from("platform_admin_users")
          .select("id, ativo")
          .eq("auth_user_id", authData.user.id)
          .eq("ativo", true)
          .maybeSingle();

        if (platformError || !platformAdmin) {
          await signOut();
          setCarregando(false);
          setFeedback("Acesso negado. Usuario sem vinculo ativo com a plataforma.");
          return;
        }

        window.location.assign("/admin");
        return;
      }

      const { data: usuarioAutenticado, error: usuarioError } = await supabase
        .from("erp_pdv_usuarios")
        .select("id, empresa_id, nome, perfil, ativo")
        .eq("auth_user_id", authData.user.id)
        .eq("ativo", true)
        .maybeSingle();

      if (usuarioError || !usuarioAutenticado) {
        await signOut();
        setCarregando(false);
        setFeedback("Usuario autenticado sem vinculo ativo com uma empresa.");
        return;
      }

      const { data: empresaAutenticada, error: empresaError } = await supabase
        .from("empresas")
        .select("id, slug")
        .eq("id", usuarioAutenticado.empresa_id)
        .maybeSingle();

      if (empresaError || !empresaAutenticada) {
        await signOut();
        setCarregando(false);
        setFeedback("A empresa do usuario nao esta disponivel.");
        return;
      }

      if (isErpEnvironment()) {
        window.location.assign(`/empresa/${empresaAutenticada.slug}`);
        return;
      }

      if (empresaAutenticada.slug !== slug) {
        window.location.assign(`/pdv/${empresaAutenticada.slug}`);
        return;
      }

      setLoginEnviado(true);
      await carregarDados();
      setUsuarioId(usuarioAutenticado.id);
      setOperadorModalAberto(false);
      setCarregando(false);
      return;
    }

    if (permitirMock && loginUsuario.trim().toLowerCase() === "caixa" && loginSenha === "123456") {
      const usuarioCaixaMock = usuariosAtivos.find(
        (usuario) =>
          usuario.nome === "Caixa PDV Teste" &&
          obterFuncoesErpPdvUsuario(usuario).includes("caixa")
      );

      if (!usuarioCaixaMock) {
        setFeedback("O usuario mock Caixa PDV Teste nao esta disponivel nesta empresa.");
        return;
      }

      sessionStorage.setItem("mikaon:mock-login-role", "caixa");
      sessionStorage.setItem("mikaon:mock-login-slug", slug);
      if (isErpEnvironment()) {
        window.location.assign(`/empresa/${slug}`);
        return;
      }
      setFeedback("");
      setLoginEnviado(true);
      selecionarUsuario(usuarioCaixaMock.id);
      return;
    }

    if (permitirMock && loginUsuario.trim().toLowerCase() === "admin" && loginSenha === "123456") {
      if (!isPlatformEnvironment()) {
        setFeedback("Acesso negado. O administrador da plataforma deve usar admin.mikaon.com.br.");
        return;
      }
      sessionStorage.setItem("mikaon:mock-login-role", "administrador");
      sessionStorage.setItem("mikaon:mock-login-slug", slug);
      window.location.assign("/admin");
      return;
    }

    if (permitirMock && loginUsuario.trim().toLowerCase() === "estoque" && loginSenha === "123456") {
      const usuarioEstoqueMock = criarUsuarioEstoqueMock(empresaId);
      setUsuarios((atuais) =>
        atuais.some((usuario) => usuario.id === usuarioEstoqueMock.id)
          ? atuais
          : [...atuais, usuarioEstoqueMock]
      );

      sessionStorage.setItem("mikaon:mock-login-role", "estoque");
      sessionStorage.setItem("mikaon:mock-login-slug", slug);
      if (isErpEnvironment()) {
        window.location.assign(`/empresa/${slug}`);
        return;
      }
      setFeedback("");
      setLoginEnviado(true);
      selecionarUsuario(usuarioEstoqueMock.id, undefined, usuarioEstoqueMock);
      return;
    }

    setFeedback("Usuario ou senha invalidos.");
  }

  async function voltarAoLogin() {
    if (authSession) await signOut();
    sessionStorage.removeItem("mikaon:mock-login-role");
    sessionStorage.removeItem("mikaon:mock-login-slug");
    setUsuarioId("");
    setLoginEnviado(false);
    setPerfilSelecaoOperador(null);
    setTabelaSelecaoVendedor(null);
    setFeedback("");
  }

  function obterLabelModulo(usuario: ErpPdvUsuario) {
    return modulosIniciais[usuario.modulo_inicial] || "PDV";
  }

  function obterLabelsTabelas(usuario: ErpPdvUsuario) {
    const tabelas = obterTabelasLiberadas(usuario).map((item) => item.label);
    return tabelas.length ? tabelas.join(", ") : "Nenhuma tabela liberada";
  }

  function selecionarUsuario(
    id: string,
    tabelaForcada?: ErpPdvTabelaPreco,
    usuarioDireto?: ErpPdvUsuario
  ) {
    setUsuarioId(id);
    const usuario = usuarioDireto || usuarios.find((item) => item.id === id);
    if (!usuario) return;

    sessionStorage.setItem(sessaoOperadorKey, id);
    if (usuario.perfil === "vendedor" && tabelaForcada) {
      sessionStorage.setItem(sessaoOperadorTabelaKey, tabelaForcada);
    } else {
      sessionStorage.removeItem(sessaoOperadorTabelaKey);
    }
    setOperadorModalAberto(false);
    setFeedback("");
    setMenuAberto(false);

    const primeiraTabela = obterTabelasLiberadas(usuario)[0]?.id || "varejo";
    setTabela(tabelaForcada || primeiraTabela);
    void carregarCaixaDoOperador(usuario);

    window.setTimeout(() => {
      if (usuario.modulo_inicial === "trocas") {
        document.getElementById("pdv-trocas")?.scrollIntoView({ behavior: "smooth" });
      }
      if (usuario.modulo_inicial === "caixa") {
        document.getElementById("pdv-caixa")?.scrollIntoView({ behavior: "smooth" });
      }
      if (usuario.modulo_inicial === "estoque") {
        document.getElementById("pdv-estoque")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }

  async function carregarCaixaDoOperador(usuario: ErpPdvUsuario) {
    if (!empresaId) return;

    setCaixa(null);
    setResumoCaixa(null);
    setValorFechamento("");

    const resultado = await buscarErpPdvCaixaAberto(
      empresaId,
      usuario.perfil === "caixa" ? usuario.id : undefined
    );
    if (resultado.error) {
      setFeedback("Nao foi possivel verificar o caixa do operador.");
      return;
    }

    setCaixa(resultado.data);
    if (!resultado.data) {
      if (usuario.perfil === "caixa") {
        setFeedback("Abra seu caixa para iniciar a operacao.");
        setMenuAberto(true);
      }
      return;
    }

    const resumo = await calcularErpPdvResumoCaixa(resultado.data);
    if (resumo.error) {
      setFeedback("Nao foi possivel carregar o resumo do caixa.");
      return;
    }

    setResumoCaixa(resumo.data);
    setValorFechamento(String(resumo.data?.totalEsperado || ""));
  }

  function selecionarPerfilOperador(perfil: PerfilSelecaoOperador) {
    setPerfilSelecaoOperador(perfil);
    setTabelaSelecaoVendedor(null);

    if (perfil !== "vendedor") {
      const usuariosDoPerfil = usuariosAtivos.filter((usuario) =>
        perfil === "administrador"
          ? obterFuncoesErpPdvUsuario(usuario).includes("administrador")
          : obterFuncoesErpPdvUsuario(usuario).includes("caixa")
      );
      if (usuariosDoPerfil.length === 1) selecionarUsuario(usuariosDoPerfil[0].id);
    }
  }

  function selecionarTabelaVendedor(tabelaSelecionada: TabelaSelecaoVendedor) {
    setTabelaSelecaoVendedor(tabelaSelecionada);
    const funcao = tabelaSelecionada === "atacado" ? "vendedor_atacado" : "vendedor_varejo";
    const vendedores = usuariosAtivos.filter((usuario) =>
      obterFuncoesErpPdvUsuario(usuario).includes(funcao)
    );
    if (vendedores.length === 1) selecionarUsuario(vendedores[0].id, tabelaSelecionada);
  }

  function voltarSelecaoOperador() {
    if (perfilSelecaoOperador === "vendedor" && tabelaSelecaoVendedor) {
      setTabelaSelecaoVendedor(null);
      return;
    }

    setPerfilSelecaoOperador(null);
    setTabelaSelecaoVendedor(null);
  }

  function obterUsuariosDisponiveisParaSelecao() {
    if (!perfilSelecaoOperador) return [];

    if (perfilSelecaoOperador === "administrador") {
      return usuariosAtivos.filter(
        (usuario) => obterFuncoesErpPdvUsuario(usuario).includes("administrador")
      );
    }

    if (perfilSelecaoOperador === "caixa") {
      return usuariosAtivos.filter((usuario) => obterFuncoesErpPdvUsuario(usuario).includes("caixa"));
    }

    if (!tabelaSelecaoVendedor) return [];

    return usuariosAtivos.filter((usuario) => {
      const funcaoVendedor: ErpPdvFuncaoColaborador =
        tabelaSelecaoVendedor === "atacado" ? "vendedor_atacado" : "vendedor_varejo";
      return obterFuncoesErpPdvUsuario(usuario).includes(funcaoVendedor);
    });
  }

  function trocarOperador() {
    const possuiItensNoCarrinho = carrinho.some((item) => item.quantidade > 0);
    if (possuiItensNoCarrinho) {
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
    setCaixa(null);
    setResumoCaixa(null);
    setValorFechamento("");
    sessionStorage.removeItem(sessaoOperadorKey);
    sessionStorage.removeItem(sessaoOperadorTabelaKey);
    setPerfilSelecaoOperador(null);
    setTabelaSelecaoVendedor(null);
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
    const usuariosDisponiveis = obterUsuariosDisponiveisParaSelecao();
    const exibindoVendedores = perfilSelecaoOperador === "vendedor";
    const podeListarUsuarios =
      Boolean(perfilSelecaoOperador) &&
      (!exibindoVendedores || Boolean(tabelaSelecaoVendedor));

    return (
      <section className="public-pdv-operator-modal" aria-modal="true" role="dialog">
        <div className="public-pdv-operator-card">
          <span>{BrandConfig.platformName} ERP/PDV</span>
          <h2>{perfilSelecaoOperador ? "Selecione o operador" : "Selecione o perfil"}</h2>
          <p>
            {perfilSelecaoOperador
              ? "As permissoes carregadas seguem o perfil do operador escolhido."
              : "Escolha o tipo de acesso para continuar."}
          </p>

          {!perfilSelecaoOperador && (
            <div className="public-pdv-operator-profiles">
              <button
                type="button"
                className="public-pdv-operator-profile"
                onClick={() => selecionarPerfilOperador("administrador")}
              >
                Administrador
              </button>
              <button
                type="button"
                className="public-pdv-operator-profile"
                onClick={() => selecionarPerfilOperador("caixa")}
              >
                Caixa
              </button>
              <button
                type="button"
                className="public-pdv-operator-profile"
                onClick={() => selecionarPerfilOperador("vendedor")}
              >
                Vendedor
              </button>
            </div>
          )}

          {exibindoVendedores && !tabelaSelecaoVendedor && (
            <div className="public-pdv-operator-profiles">
              <button
                type="button"
                className="public-pdv-operator-profile"
                onClick={() => selecionarTabelaVendedor("varejo")}
              >
                Vendedor Varejo
              </button>
              <button
                type="button"
                className="public-pdv-operator-profile"
                onClick={() => selecionarTabelaVendedor("atacado")}
              >
                Vendedor Atacado
              </button>
            </div>
          )}

          {podeListarUsuarios && (
            <div className="public-pdv-operator-list">
              {usuariosDisponiveis.length > 0 ? (
                usuariosDisponiveis.map((usuario) => (
                <button
                  type="button"
                  key={usuario.id}
                  onClick={() =>
                    selecionarUsuario(
                      usuario.id,
                      perfilSelecaoOperador === "vendedor"
                        ? tabelaSelecaoVendedor || undefined
                        : undefined
                    )
                  }
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
                  Nenhum operador compativel foi encontrado para esta selecao.
                </p>
              )}
            </div>
          )}

          {perfilSelecaoOperador && (
            <button
              type="button"
              className="public-pdv-operator-back"
              onClick={voltarSelecaoOperador}
            >
              Voltar
            </button>
          )}

          {!perfilSelecaoOperador && loginEnviado && (
            <button type="button" className="public-pdv-operator-back" onClick={voltarAoLogin}>
              Voltar
            </button>
          )}
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

  function selecionarProdutoEstoque(produto: ErpPdvProduto) {
    setProdutoEstoqueSelecionadoId(produto.id);
    setProdutoEstoqueForm(criarProdutoEstoqueForm(produto));
    setMovimentacaoEstoqueForm(criarMovimentacaoEstoqueForm(produto.id));
  }

  function novoProdutoEstoque() {
    setProdutoEstoqueSelecionadoId("");
    setProdutoEstoqueForm(criarProdutoEstoqueForm());
    setMovimentacaoEstoqueForm(criarMovimentacaoEstoqueForm());
  }

  function atualizarCampoProdutoEstoque(
    campo: keyof EstoqueProdutoForm,
    valor: string | boolean
  ) {
    setProdutoEstoqueForm((atual) => {
      return { ...atual, [campo]: valor } as EstoqueProdutoForm;
    });
  }

  function atualizarPrecosProdutoEstoque(valores: ProductPricingValues) {
    setProdutoEstoqueForm((atual) => ({ ...atual, ...valores }));
  }

  async function salvarProdutoEstoque() {
    if (!empresaId || !podeOperarEstoque) return;
    if (!produtoEstoqueForm.nome.trim()) {
      setFeedbackOperacao({ tipo: "erro", texto: "Informe o nome do produto." });
      return;
    }
    const camposNumericos = [
      produtoEstoqueForm.custo,
      produtoEstoqueForm.acrescimoVarejo,
      produtoEstoqueForm.markupVarejo,
      produtoEstoqueForm.precoVenda,
      produtoEstoqueForm.acrescimoAtacado,
      produtoEstoqueForm.markupAtacado,
      produtoEstoqueForm.precoAtacado,
      produtoEstoqueForm.estoqueAtual,
      produtoEstoqueForm.estoqueMinimo,
      produtoEstoqueForm.estoqueMaximo,
    ];
    if (camposNumericos.some((valor) => !campoNumericoValido(valor))) {
      setFeedbackOperacao({ tipo: "erro", texto: "Informe valores numericos validos nos custos, precos e estoque." });
      return;
    }
    if (
      numero(produtoEstoqueForm.custo.replace(",", ".")) < 0 ||
      numero(produtoEstoqueForm.precoVenda.replace(",", ".")) < 0 ||
      numero(produtoEstoqueForm.precoAtacado.replace(",", ".")) < 0
    ) {
      setFeedbackOperacao({
        tipo: "erro",
        texto: "Custo e precos nao podem ser negativos.",
      });
      return;
    }
    if (
      numero(produtoEstoqueForm.estoqueAtual.replace(",", ".")) < 0 ||
      numero(produtoEstoqueForm.estoqueMinimo.replace(",", ".")) < 0 ||
      numero(produtoEstoqueForm.estoqueMaximo.replace(",", ".")) < 0
    ) {
      setFeedbackOperacao({
        tipo: "erro",
        texto: "Estoques atual, minimo e maximo nao podem ser negativos.",
      });
      return;
    }

    const payload: ErpPdvProdutoPayload = {
      id: produtoEstoqueForm.id,
      empresaId,
      categoriaId: produtoEstoqueForm.categoriaId,
      nome: produtoEstoqueForm.nome,
      codigoBarras: produtoEstoqueForm.codigoBarras,
      sku: produtoEstoqueForm.codigoInterno,
      marca: produtoEstoqueForm.marca,
      custo: numero(produtoEstoqueForm.custo.replace(",", ".")),
      precoVenda: numero(produtoEstoqueForm.precoVenda.replace(",", ".")),
      precoAtacado: numero(produtoEstoqueForm.precoAtacado.replace(",", ".")),
      precoRevenda: 0,
      precoPersonalizado: 0,
      formacaoPrecoTipo: "manual",
      percentualPreco: 0,
      unidade: produtoEstoqueForm.unidade || "un",
      localizacao: produtoEstoqueForm.localizacao,
      ncm: produtoEstoqueForm.ncm,
      observacoes: montarProdutoObservacoesEstruturadas(produtoEstoqueForm),
      imagemUrl: "",
      estoqueAtual: numero(produtoEstoqueForm.estoqueAtual.replace(",", ".")),
      estoqueMinimo: numero(produtoEstoqueForm.estoqueMinimo.replace(",", ".")),
      ativo: produtoEstoqueForm.ativo,
    };

    setSalvando(true);
    try {
      const resultado = await salvarErpPdvProduto(payload);
      if (resultado.error) throw resultado.error;
      if (!resultado.data) throw new Error("Produto nao retornado.");
      setProdutos((atuais) => {
        const existe = atuais.some((produto) => produto.id === resultado.data!.id);
        return (existe
          ? atuais.map((produto) => (produto.id === resultado.data!.id ? resultado.data! : produto))
          : [...atuais, resultado.data!]
        ).sort((a, b) => a.nome.localeCompare(b.nome));
      });
      setProdutosEstoquePaginaServidor((atuais) => {
        const existe = atuais.some((produto) => produto.id === resultado.data!.id);
        return existe
          ? atuais.map((produto) =>
              produto.id === resultado.data!.id ? resultado.data! : produto
            )
          : atuais;
      });
      selecionarProdutoEstoque(resultado.data);
      setFeedbackOperacao({ tipo: "sucesso", texto: "Produto salvo no estoque operacional." });
    } catch (error) {
      setFeedbackOperacao({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Nao foi possivel salvar o produto.",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function registrarMovimentacaoEstoque() {
    if (!empresaId || !podeOperarEstoque) return;
    if (!movimentacaoEstoqueForm.produtoId) {
      setFeedbackOperacao({ tipo: "erro", texto: "Selecione um produto para movimentar o estoque." });
      return;
    }

    setSalvando(true);
    try {
      const resultado = await registrarErpPdvMovimentacao({
        empresaId,
        produtoId: movimentacaoEstoqueForm.produtoId,
        tipo: movimentacaoEstoqueForm.tipo,
        quantidade: numero(movimentacaoEstoqueForm.quantidade.replace(",", ".")),
        motivo: movimentacaoEstoqueForm.motivo,
        observacao: movimentacaoEstoqueForm.observacao,
        usuarioResponsavel: operador || usuarioAtual?.nome || "Operador",
        usuarioId: usuarioAtual?.id,
      });
      if (resultado.error) throw resultado.error;
      if (!resultado.data) throw new Error("Movimentacao nao retornada.");
      setMovimentacoes((atuais) => [resultado.data!, ...atuais].slice(0, 30));
      setProdutos((atuais) =>
        atuais.map((produto) =>
          produto.id === resultado.data!.produto_id
            ? { ...produto, estoque_atual: resultado.data!.estoque_posterior }
            : produto
        )
      );
      setMovimentacaoEstoqueForm(criarMovimentacaoEstoqueForm(movimentacaoEstoqueForm.produtoId));
      setProdutoEstoqueForm((atual) =>
        atual.id === resultado.data!.produto_id
          ? { ...atual, estoqueAtual: String(resultado.data!.estoque_posterior) }
          : atual
      );
      setFeedbackOperacao({ tipo: "sucesso", texto: "Movimentacao de estoque registrada." });
    } catch (error) {
      setFeedbackOperacao({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Nao foi possivel registrar a movimentacao.",
      });
    } finally {
      setSalvando(false);
    }
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
        operadorUsuarioId: usuarioAtual?.id,
        valorInformado: numero(valorFechamento.replace(",", ".")),
        observacao: `Fechado por ${operador || "modo desenvolvimento"}`,
      });
      if (resultado.error) throw resultado.error;
      setRelatorioFechamento(resultado.data);
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

  function fecharMenuContextoProduto() {
    setMenuContextoProduto(null);
    setMenuContextoPosicao({ x: 8, y: 8 });
  }

  async function recarregarPaginaEstoqueServidor() {
    if (!empresaId || !usarPaginacaoServidorEstoque) return;
    const consultaId = ++estoquePaginaConsultaIdRef.current;
    const resultado = await listarErpPdvProdutosPaginado(
      empresaId,
      estoquePagina,
      estoqueItensPorPagina,
      estoqueBuscaDebounced,
      estoqueOrdenacao
    );
    if (consultaId !== estoquePaginaConsultaIdRef.current || resultado.error || !resultado.data) return;
    setProdutosEstoquePaginaServidor(resultado.data.data);
    setTotalProdutosEstoqueServidor(resultado.data.total);
  }

  function abrirAjudaAtalhos() {
    setMenuAberto(false);
    setAtalhosAberto(true);
  }

  async function excluirProdutoEstoque(produtoSelecionado?: ErpPdvProduto) {
    const produtoId = produtoSelecionado?.id || produtoEstoqueForm.id;
    const produtoNome = produtoSelecionado?.nome || produtoEstoqueForm.nome || "Produto";
    if (!empresaId || !produtoId || !podeExcluirProduto) return;

    const confirmar = window.confirm(
      `Deseja excluir o produto "${produtoNome}"?`
    );
    if (!confirmar) {
      fecharMenuContextoProduto();
      return;
    }

    fecharMenuContextoProduto();
    setSalvando(true);
    try {
      const resultado = await excluirErpPdvProduto({
        empresaId,
        produtoId,
      });
      if (resultado.error) throw resultado.error;

      setProdutos((atuais) => atuais.filter((produto) => produto.id !== produtoId));
      setProdutosEstoquePaginaServidor((atuais) =>
        atuais.filter((produto) => produto.id !== produtoId)
      );
      if (produtoEstoqueForm.id === produtoId) novoProdutoEstoque();
      void recarregarPaginaEstoqueServidor();
      fecharMenuContextoProduto();
      setFeedbackOperacao({ tipo: "sucesso", texto: "Produto excluido." });
    } catch (error) {
      fecharMenuContextoProduto();
      setFeedbackOperacao({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Nao foi possivel excluir o produto.",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatusProdutoEstoque(produto: ErpPdvProduto) {
    if (!empresaId || !podeExcluirProduto) return;
    const proximoStatus = !produto.ativo;
    const confirmar = window.confirm(
      `${proximoStatus ? "Reativar" : "Desativar"} o produto "${produto.nome}"?`
    );
    if (!confirmar) {
      fecharMenuContextoProduto();
      return;
    }

    fecharMenuContextoProduto();
    setSalvando(true);
    try {
      const resultado = await alterarStatusErpPdvProduto({
        empresaId,
        produtoId: produto.id,
        ativo: proximoStatus,
      });
      if (resultado.error) throw resultado.error;
      if (!resultado.data) throw new Error("Produto nao retornado.");
      estoquePaginaConsultaIdRef.current += 1;
      setProdutos((atuais) =>
        atuais.map((item) => (item.id === produto.id ? resultado.data! : item))
      );
      setProdutosEstoquePaginaServidor((atuais) =>
        atuais.map((item) => (item.id === produto.id ? resultado.data! : item))
      );
      if (produtoEstoqueForm.id === produto.id) selecionarProdutoEstoque(resultado.data);
      fecharMenuContextoProduto();
      setFeedbackOperacao({
        tipo: "sucesso",
        texto: proximoStatus ? "Produto reativado." : "Produto desativado.",
      });
    } catch (error) {
      fecharMenuContextoProduto();
      setFeedbackOperacao({
        tipo: "erro",
        texto: error instanceof Error ? error.message : "Nao foi possivel alterar o status do produto.",
      });
    } finally {
      setSalvando(false);
    }
  }

  function abrirMenuContextoProduto(produto: ErpPdvProduto, event: MouseEvent<HTMLTableRowElement>) {
    selecionarProdutoEstoque(produto);
    setMenuContextoProduto({
      produto,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function imprimirRelatorioFechamento() {
    const classe = "public-pdv-print-closing-report";
    const limpar = () => document.body.classList.remove(classe);
    document.body.classList.add(classe);
    window.addEventListener("afterprint", limpar, { once: true });
    window.print();
    window.setTimeout(limpar, 1500);
  }

  function compartilharRelatorioFechamento(canal: "email" | "whatsapp") {
    if (!relatorioFechamento) return;
    const operadorRelatorio = usuarioAtual?.nome || relatorioFechamento.caixa.operador || "Operador";
    const texto = resumoFechamentoTexto(
      relatorioFechamento,
      empresa?.nome || "Empresa",
      operadorRelatorio,
      diferencaFechamento
    );

    if (canal === "email") {
      const assunto = `Fechamento de caixa - ${empresa?.nome || "Empresa"}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`;
      return;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
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
    if (operadorModalAberto || !usuarioAtual || !podeVender || exibirModuloEstoque) return;
    const timer = window.setTimeout(() => buscaRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [exibirModuloEstoque, operadorModalAberto, usuarioAtual?.id, podeVender, produtos.length]);

  if (carregando) {
    return <main className="public-pdv public-pdv--center">Carregando PDV...</main>;
  }

  if ((!empresa || !erpContratado) && (authSession || permitirMock || loginEnviado)) {
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
        {!loginEnviado ? (
          <section className="public-pdv-login-shell" aria-label={isPlatformEnvironment() ? "Login da Plataforma" : "Login do ERP"}>
            <div className="public-pdv-login-brand">
              <img className="public-pdv-login-brand-logo" src="/mikaon-logo-official.jpg" alt="Logo MikaON" />
              <h1>{isPlatformEnvironment() ? "Painel Administrativo mikaON" : "Bem-vindo ao ERP mikaON"}</h1>
              <p>{isPlatformEnvironment() ? "Administracao da Plataforma" : "Acesse sua empresa"}</p>
            </div>
            <form className="public-pdv-login-form" onSubmit={entrarNoAcessoTemporario}>
              <div>
                <span className="public-pdv-login-kicker">{isPlatformEnvironment() ? "Acesso da plataforma" : "Acesso ao ERP"}</span>
                <h2>Entrar</h2>
                <p>Informe seus dados para continuar.</p>
              </div>
              <label>
                Usuário
                <input
                  type="text"
                  value={loginUsuario}
                  onChange={(event) => setLoginUsuario(event.target.value)}
                  autoComplete="username"
                  placeholder="Digite seu usuário"
                  autoFocus
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  value={loginSenha}
                  onChange={(event) => setLoginSenha(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                />
              </label>
              <button type="submit" className="public-pdv-login-submit">
                Entrar
              </button>
            </form>
          </section>
        ) : (
          renderModalOperador()
        )}
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
            <strong>{empresa?.nome}</strong>
          </div>
          <div>
            <span>Operador</span>
            <strong>{usuarioAtual.nome}</strong>
          </div>
          {!ehPerfilEstoque && (
            <div>
              <span>Caixa</span>
              <strong>{caixa ? "Aberto" : "Fechado"}</strong>
            </div>
          )}
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
          {ehPerfilEstoque ? (
            <div>
              <span>Módulo</span>
              <strong>Produtos / Estoque</strong>
            </div>
          ) : (
            <>
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
            </>
          )}
          <button type="button" onClick={() => setModoCompacto(false)}>
            {ehPerfilEstoque ? "Voltar ao Estoque" : "Voltar ao Caixa"}
          </button>
        </section>
      )}

      {menuAberto && (
        <aside className="public-pdv-secondary-menu" aria-label="Menu secundario do PDV">
          <div className="public-pdv-secondary-actions">
            {podeOperarCaixa && (
              <button
                type="button"
                disabled={
                  salvando ||
                  (!caixa && !operador.trim()) ||
                  !pode(usuarioAtual, "caixa_abrir_fechar")
                }
                onClick={caixa ? fecharCaixa : abrirCaixa}
              >
                {caixa ? "Fechar caixa" : "Abrir caixa"}
              </button>
            )}
            <button type="button" onClick={trocarOperador}>
              Trocar operador
            </button>
            <button type="button" onClick={alternarTelaCheia}>
              {modoTelaCheiaAtivo ? "Sair da tela cheia" : "Tela cheia"}
            </button>
            <button type="button" onClick={() => setModoCompacto((atual) => !atual)}>
              {modoCompacto ? "Voltar ao Caixa" : "Modo compacto"}
            </button>
            <button type="button" onClick={abrirAjudaAtalhos}>
              Ajuda de atalhos
            </button>
            <button type="button" onClick={() => void voltarAoLogin()}>
              Sair
            </button>
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
                </>
              ) : (
                <>
                  <label>Valor inicial</label>
                  <input value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} />
                </>
              )}
            </section>
          )}

          {!caixaIndependente && !ehPerfilEstoque && podeVender && (
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

          {!caixaIndependente && !ehPerfilEstoque && podeVender && (
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

          {!caixaIndependente && podeOperarTrocas && (
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
        disabled={usuarioAtual?.perfil === "vendedor"}
        onChange={(e) => {
          if (usuarioAtual?.perfil !== "vendedor") {
            setTabela(e.target.value as ErpPdvTabelaPreco);
          }
        }}
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
          <p>Este operador esta ativo, mas nao possui permissoes de caixa, venda, trocas ou produtos/estoque para esta tela.</p>
        </section>
      )}

      {exibirModuloEstoque && !caixaIndependente && (
        <section className="public-pdv-main-sale public-pdv-stock-layout" id="pdv-estoque">
          <section className="public-pdv-panel public-pdv-stock-products">
            <div className="public-pdv-section-title">
              <h2>Produtos / Estoque</h2>
              <small>
                {produtosEstoqueFiltrados.length} produto(s) | Pagina {Math.min(estoquePagina, totalPaginasEstoque)} de {totalPaginasEstoque}
              </small>
            </div>
            <div className="public-pdv-stock-toolbar">
              <input
                value={estoqueBusca}
                onChange={(e) => setEstoqueBusca(e.target.value)}
                placeholder="Nome, SKU, GTIN, codigo de barras, categoria, marca ou fornecedor"
              />
              <select
                value={estoqueStatusFiltro}
                onChange={(e) =>
                  setEstoqueStatusFiltro(e.target.value as EstoqueStatusFiltro)
                }
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
                <option value="com_estoque">Com estoque</option>
                <option value="sem_estoque">Sem estoque</option>
                <option value="abaixo_minimo">Abaixo do minimo</option>
              </select>
              <select
                value={estoqueCategoriaFiltro}
                onChange={(e) => setEstoqueCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              <select
                value={estoqueMarcaFiltro}
                onChange={(e) => setEstoqueMarcaFiltro(e.target.value)}
              >
                <option value="">Todas marcas</option>
                {marcasProdutos.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
              <select
                value={estoqueFornecedorFiltro}
                onChange={(e) => setEstoqueFornecedorFiltro(e.target.value)}
              >
                <option value="">Todos fornecedores</option>
                {fornecedoresProdutos.map((fornecedor) => (
                  <option key={fornecedor} value={fornecedor}>
                    {fornecedor}
                  </option>
                ))}
              </select>
              <select
                value={estoqueOrdenacao}
                onChange={(e) =>
                  setEstoqueOrdenacao(e.target.value as EstoqueOrdenacao)
                }
              >
                <option value="nome">Ordenar por nome</option>
                <option value="estoque">Ordenar por estoque</option>
                <option value="varejo">Ordenar por varejo</option>
                <option value="atacado">Ordenar por atacado</option>
                {podeConsultarCustoLucro && (
                  <option value="custo">Ordenar por custo</option>
                )}
              </select>
              <select
                value={String(estoqueItensPorPagina)}
                onChange={(e) => setEstoqueItensPorPagina(Number(e.target.value) || 25)}
              >
                <option value="25">25 por pagina</option>
                <option value="50">50 por pagina</option>
                <option value="100">100 por pagina</option>
              </select>
              <button type="button" onClick={novoProdutoEstoque}>Novo produto</button>
            </div>
            <div className="public-pdv-data-grid-scroll">
              <DataGrid<ErpPdvProduto>
                columns={[
                  { id: "codigo", label: "Codigo", width: "80px", headerClassName: "data-grid__cell--left", cellClassName: "data-grid__cell--left", render: (produto) => produto.sku || "-" },
                  { id: "barras", label: "Barras", width: "140px", headerClassName: "data-grid__cell--left", cellClassName: "data-grid__cell--left", render: (produto) => produto.codigo_barras || "-" },
                  {
                    id: "produto",
                    label: "Produto",
                    width: "340px",
                    headerClassName: "data-grid__cell--left",
                    cellClassName: "data-grid__cell--left public-pdv-data-grid-product",
                    render: (produto) => {
                      const categoriaNome = categoriasPorId.get(produto.categoria_id || "")?.nome || "Sem categoria";
                      const fornecedor = parseProdutoObservacoesEstruturadas(produto.observacoes).fornecedorPrincipal;
                      return (
                        <span title={`${produto.nome} | ${categoriaNome}${produto.marca ? ` | ${produto.marca}` : ""}${fornecedor ? ` | ${fornecedor}` : ""}`}>
                          {produto.nome}
                        </span>
                      );
                    },
                  },
                  { id: "estoque", label: "Estoque", width: "130px", headerClassName: "data-grid__cell--right", cellClassName: "data-grid__cell--right", render: (produto) => produto.estoque_atual },
                  { id: "minimo", label: "Min.", width: "100px", headerClassName: "data-grid__cell--right", cellClassName: "data-grid__cell--right", render: (produto) => produto.estoque_minimo },
                  { id: "custo", label: "Custo", width: "110px", headerClassName: "data-grid__cell--right", cellClassName: "data-grid__cell--right public-pdv-data-grid-money", render: (produto) => podeConsultarCustoLucro ? `R$ ${moeda(produto.custo)}` : "Oculto" },
                  { id: "varejo", label: "Varejo", width: "110px", headerClassName: "data-grid__cell--right", cellClassName: "data-grid__cell--right public-pdv-data-grid-money", render: (produto) => `R$ ${moeda(produto.preco_venda)}` },
                  { id: "atacado", label: "Atacado", width: "110px", headerClassName: "data-grid__cell--right", cellClassName: "data-grid__cell--right public-pdv-data-grid-money", render: (produto) => `R$ ${moeda(produto.preco_atacado || produto.preco_venda)}` },
                  {
                    id: "status",
                    label: "Status",
                    width: "100px",
                    headerClassName: "data-grid__cell--center",
                    cellClassName: "data-grid__cell--center",
                    render: (produto) => {
                      const statusProduto = obterStatusProdutoEstoque(produto);
                      return (
                        <span
                          className={`public-pdv-stock-status ${statusProduto.className}`}
                          aria-label={`Status: ${statusProduto.label}`}
                        >
                          {statusProduto.label}
                        </span>
                      );
                    },
                  },
                ]}
                rows={produtosEstoquePaginados}
                getRowId={(produto) => produto.id}
                selectedRowId={produtoEstoqueSelecionadoId}
                onRowClick={selecionarProdutoEstoque}
                onRowContextMenu={ehPerfilEstoque ? abrirMenuContextoProduto : undefined}
                emptyMessage="Nenhum produto encontrado."
              />
            </div>
            <div className="public-pdv-stock-pagination">
              <button
                type="button"
                onClick={() => setEstoquePagina((pagina) => Math.max(1, pagina - 1))}
                disabled={estoquePagina <= 1}
              >
                Anterior
              </button>
              <strong>
                {Math.min(estoquePagina, totalPaginasEstoque)} / {totalPaginasEstoque}
              </strong>
              <button
                type="button"
                onClick={() =>
                  setEstoquePagina((pagina) =>
                    Math.min(totalPaginasEstoque, pagina + 1)
                  )
                }
                disabled={estoquePagina >= totalPaginasEstoque}
              >
                Proxima
              </button>
            </div>
          </section>

          <section className="public-pdv-panel public-pdv-stock-editor">
            <div className="public-pdv-section-title">
              <h2>{produtoEstoqueForm.id ? "EDITAR PRODUTO" : "NOVO PRODUTO"}</h2>
              <small>
                {produtoEstoqueForm.id
                  ? `${produtoEstoqueForm.nome || "Produto"}${produtoEstoqueForm.codigoInterno ? ` | ${produtoEstoqueForm.codigoInterno}` : ""}`
                  : usuarioAtual.perfil === "estoque"
                  ? "Perfil estoque"
                  : obterLabelPerfil(usuarioAtual)}
              </small>
            </div>

            <div className="public-pdv-stock-editor-scroll">
              <section className="public-pdv-stock-section">
                <div className="public-pdv-stock-section-header">
                  <h3>Identificacao</h3>
                  <small>Base unica compartilhada com ERP e PDV</small>
                </div>
                <div className="public-pdv-stock-form public-pdv-stock-form--three-columns">
                  <label>
                    Nome
                    <input
                      value={produtoEstoqueForm.nome}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("nome", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Categoria
                    <select
                      value={produtoEstoqueForm.categoriaId}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("categoriaId", e.target.value)
                      }
                    >
                      <option value="">Sem categoria</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Unidade
                    <input
                      value={produtoEstoqueForm.unidade}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("unidade", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Codigo interno
                    <input
                      value={produtoEstoqueForm.codigoInterno}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("codigoInterno", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Codigo de barras / GTIN
                    <input
                      value={produtoEstoqueForm.codigoBarras}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("codigoBarras", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    NCM
                    <input
                      value={produtoEstoqueForm.ncm}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("ncm", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Marca
                    <input
                      value={produtoEstoqueForm.marca}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("marca", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Fabricante
                    <input
                      value={produtoEstoqueForm.fabricante}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("fabricante", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Fornecedor principal
                    <input
                      list="pdv-fornecedores"
                      value={produtoEstoqueForm.fornecedorPrincipal}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque(
                          "fornecedorPrincipal",
                          e.target.value
                        )
                      }
                    />
                    <datalist id="pdv-fornecedores">
                      {fornecedores.map((fornecedor) => (
                        <option
                          key={fornecedor.id}
                          value={fornecedor.nome_fantasia || fornecedor.razao_social}
                        />
                      ))}
                    </datalist>
                  </label>
                  <label className="public-pdv-stock-toggle">
                    <input
                      type="checkbox"
                      checked={produtoEstoqueForm.ativo}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("ativo", e.target.checked)
                      }
                    />
                    Produto ativo
                  </label>
                </div>
              </section>

              <ProductPricingEditor
                custo={produtoEstoqueForm.custo}
                acrescimoVarejo={produtoEstoqueForm.acrescimoVarejo}
                markupVarejo={produtoEstoqueForm.markupVarejo}
                precoVenda={produtoEstoqueForm.precoVenda}
                acrescimoAtacado={produtoEstoqueForm.acrescimoAtacado}
                markupAtacado={produtoEstoqueForm.markupAtacado}
                precoAtacado={produtoEstoqueForm.precoAtacado}
                canEditCost={podeConsultarCustoLucro && podeAlterarPreco}
                canEditPrices={podeAlterarPreco}
                onChange={atualizarPrecosProdutoEstoque}
              />
              {!podeConsultarCustoLucro && (
                <p className="public-pdv-stock-note">
                  Custo, margem e indicadores sensiveis ficam ocultos para este perfil.
                </p>
              )}

              <section className="public-pdv-stock-section">
                <div className="public-pdv-stock-section-header">
                  <h3>Estoque</h3>
                  <small>Saldo, minimo, maximo e localizacao</small>
                </div>
                <div className="public-pdv-stock-form public-pdv-stock-form--three-columns">
                  <label>
                    Estoque atual
                    <input
                      inputMode="decimal"
                      value={produtoEstoqueForm.estoqueAtual}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("estoqueAtual", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Estoque minimo
                    <input
                      inputMode="decimal"
                      value={produtoEstoqueForm.estoqueMinimo}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("estoqueMinimo", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Estoque maximo
                    <input
                      inputMode="decimal"
                      value={produtoEstoqueForm.estoqueMaximo}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("estoqueMaximo", e.target.value)
                      }
                    />
                  </label>
                  <label className="public-pdv-stock-form--full">
                    Localizacao
                    <input
                      value={produtoEstoqueForm.localizacao}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("localizacao", e.target.value)
                      }
                    />
                  </label>
                  <label className="public-pdv-stock-form--full">
                    Observacoes
                    <textarea
                      value={produtoEstoqueForm.observacoes}
                      onChange={(e) =>
                        atualizarCampoProdutoEstoque("observacoes", e.target.value)
                      }
                    />
                  </label>
                </div>
              </section>

              <div className="public-pdv-secondary-actions public-pdv-secondary-actions--compact">
                <button type="button" disabled={salvando} onClick={salvarProdutoEstoque}>
                  {produtoEstoqueForm.id ? "Salvar alterações" : "Salvar produto"}
                </button>
                {produtoEstoqueForm.id && podeExcluirProduto && (
                  <button className="public-pdv-stock-danger" type="button" disabled={salvando} onClick={() => void excluirProdutoEstoque()}>
                    Excluir produto
                  </button>
                )}
                <button type="button" onClick={novoProdutoEstoque}>
                  {produtoEstoqueForm.id ? "Cancelar edição" : "Limpar"}
                </button>
              </div>

              <section className="public-pdv-stock-section public-pdv-stock-movement" id="pdv-estoque-movimentacao">
                <div className="public-pdv-stock-section-header">
                  <h3>Movimentar estoque</h3>
                  <small>Entrada, saida e ajuste</small>
                </div>
                <div className="public-pdv-stock-form">
                  <label>
                    Produto
                    <select
                      value={movimentacaoEstoqueForm.produtoId}
                      onChange={(e) =>
                        setMovimentacaoEstoqueForm((atual) => ({
                          ...atual,
                          produtoId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione um produto</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tipo
                    <select
                      value={movimentacaoEstoqueForm.tipo}
                      onChange={(e) =>
                        setMovimentacaoEstoqueForm((atual) => ({
                          ...atual,
                          tipo: e.target.value as Exclude<ErpPdvMovimentacaoTipo, "venda">,
                        }))
                      }
                    >
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saida</option>
                      <option value="ajuste">Ajuste</option>
                    </select>
                  </label>
                  <label>
                    Quantidade
                    <input
                      inputMode="decimal"
                      value={movimentacaoEstoqueForm.quantidade}
                      onChange={(e) =>
                        setMovimentacaoEstoqueForm((atual) => ({
                          ...atual,
                          quantidade: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Motivo
                    <input
                      value={movimentacaoEstoqueForm.motivo}
                      onChange={(e) =>
                        setMovimentacaoEstoqueForm((atual) => ({
                          ...atual,
                          motivo: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="public-pdv-stock-form--full">
                    Observacao
                    <textarea
                      value={movimentacaoEstoqueForm.observacao}
                      onChange={(e) =>
                        setMovimentacaoEstoqueForm((atual) => ({
                          ...atual,
                          observacao: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <button type="button" disabled={salvando} onClick={registrarMovimentacaoEstoque}>
                  Registrar movimentacao
                </button>
              </section>

              <section className="public-pdv-stock-section public-pdv-stock-history" id="pdv-estoque-historico">
                <div className="public-pdv-stock-section-header">
                  <h3>Historico</h3>
                  <small>{movimentacoesVisiveisEstoque.length} movimentacao(oes)</small>
                </div>
                <div className="public-pdv-stock-history-list">
                  {movimentacoesVisiveisEstoque.length ? (
                    movimentacoesVisiveisEstoque.slice(0, 20).map((movimentacao) => {
                      const produto = produtosPorId.get(movimentacao.produto_id);
                      return (
                        <div key={movimentacao.id} className="public-pdv-stock-history-item">
                          <strong>{produto?.nome || "Produto"}</strong>
                          <span>
                            {movimentacao.tipo} · {movimentacao.quantidade} un.
                          </span>
                          <span>
                            Estoque: {movimentacao.estoque_anterior} →{" "}
                            {movimentacao.estoque_posterior}
                          </span>
                          <small>
                            {movimentacao.motivo || "Movimentacao manual"} · {movimentacao.usuario_responsavel || "Usuario nao identificado"} ·{" "}
                            {new Date(movimentacao.created_at).toLocaleString("pt-BR")}{movimentacao.observacao ? ` · ${movimentacao.observacao}` : ""}
                          </small>
                        </div>
                      );
                    })
                  ) : (
                    <p>Nenhuma movimentacao registrada.</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        </section>
      )}

      {ehPerfilEstoque && menuContextoProduto && (
        <div
          className="public-pdv-product-context-menu"
          ref={menuContextoRef}
          role="menu"
          style={{ left: menuContextoPosicao.x, top: menuContextoPosicao.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <strong>{menuContextoProduto.produto.nome}</strong>
          <button type="button" onClick={() => { selecionarProdutoEstoque(menuContextoProduto.produto); fecharMenuContextoProduto(); }}>
            Editar produto
          </button>
          <button type="button" onClick={() => { selecionarProdutoEstoque(menuContextoProduto.produto); fecharMenuContextoProduto(); document.getElementById("pdv-estoque-movimentacao")?.scrollIntoView({ behavior: "smooth" }); }}>
            Movimentar estoque
          </button>
          <button type="button" onClick={() => { selecionarProdutoEstoque(menuContextoProduto.produto); fecharMenuContextoProduto(); document.getElementById("pdv-estoque-historico")?.scrollIntoView({ behavior: "smooth" }); }}>
            Ver histórico
          </button>
          <button type="button" onClick={() => alterarStatusProdutoEstoque(menuContextoProduto.produto)}>
            {menuContextoProduto.produto.ativo ? "Desativar produto" : "Ativar produto"}
          </button>
          <button className="public-pdv-stock-danger" type="button" onClick={() => excluirProdutoEstoque(menuContextoProduto.produto)}>
            Excluir produto
          </button>
        </div>
      )}

      {podeVender && !exibirModuloEstoque && !caixaIndependente && (
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
                  placeholder="Nome, codigo interno ou codigo de barras"
                  aria-label="Buscar produto por nome, codigo interno ou codigo de barras"
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
                    <>
                      <div className="public-pdv-product-list-header" role="presentation">
                        <span>Código</span>
                        <span>Descrição</span>
                        <span>Estoque</span>
                        <span>Preço de venda</span>
                      </div>
                      {produtosEncontrados.map((produto, index) => (
                        <button
                          key={produto.id}
                          id={`produto-resultado-${produto.id}`}
                          type="button"
                          role="option"
                          aria-selected={index === resultadoSelecionadoIndex}
                          className={[
                            "public-pdv-product-result",
                            produtoAdicionadoId === produto.id ? "public-pdv-product-added" : "",
                            index === resultadoSelecionadoIndex ? "public-pdv-product-selected" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onMouseEnter={() => setResultadoSelecionadoIndex(index)}
                          onClick={() => adicionarProduto(produto)}
                        >
                          <span className="public-pdv-product-result-code">
                            {produto.sku || produto.codigo_barras || "-"}
                          </span>
                          <span className="public-pdv-product-result-description" title={produto.nome}>
                            {produto.nome}
                          </span>
                          <span className="public-pdv-product-result-stock">{produto.estoque_atual}</span>
                          <strong className="public-pdv-product-result-price">
                            R$ {moeda(obterPreco(produto, tabelaAtualLiberada ? tabela : "varejo"))}
                          </strong>
                        </button>
                      ))}
                    </>
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
                        <span>Unit. R$ {moeda(item.precoUnitario)}</span>
                        <strong>Total R$ {moeda(item.subtotal)}</strong>
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

      {relatorioFechamento && (
        <section className="public-pdv-closing-report-modal" aria-modal="true" role="dialog">
          <div className="public-pdv-closing-report-backdrop" />
          <div className="public-pdv-closing-report-dialog">
            <header className="public-pdv-closing-report-header">
              <div>
                <span>Fechamento de caixa</span>
                <h2>Relatório de Fechamento de Caixa</h2>
              </div>
              <div className="public-pdv-closing-report-actions">
                <button type="button" onClick={imprimirRelatorioFechamento}>Imprimir</button>
                <button type="button" onClick={() => compartilharRelatorioFechamento("email")}>E-mail</button>
                <button type="button" onClick={() => compartilharRelatorioFechamento("whatsapp")}>WhatsApp</button>
                <button type="button" onClick={() => setRelatorioFechamento(null)}>Fechar</button>
              </div>
            </header>

            <div className="public-pdv-closing-report-content">
              <section className="public-pdv-closing-report-section">
                <h3>Identificação</h3>
                <div className="public-pdv-closing-report-grid">
                  <div><span>Empresa</span><strong>{empresa?.nome || "-"}</strong></div>
                  <div><span>Operador</span><strong>{usuarioAtual?.nome || relatorioFechamento.caixa.operador || "Operador"}</strong></div>
                  <div><span>Número do Caixa</span><strong>Caixa PDV</strong></div>
                  <div><span>Data</span><strong>{dataHoraRelatorio(relatorioFechamento.caixa.fechado_em).split(" ")[0]}</strong></div>
                  <div><span>Hora de abertura</span><strong>{dataHoraRelatorio(relatorioFechamento.caixa.aberto_em).split(" ")[1] || "-"}</strong></div>
                  <div><span>Hora de fechamento</span><strong>{dataHoraRelatorio(relatorioFechamento.caixa.fechado_em).split(" ")[1] || "-"}</strong></div>
                </div>
              </section>

              <div className="public-pdv-closing-report-columns">
                <section className="public-pdv-closing-report-section">
                  <h3>Resumo Financeiro</h3>
                  <div className="public-pdv-closing-report-values">
                    <div><span>Saldo inicial</span><strong>R$ {moeda(relatorioFechamento.caixa.saldo_inicial)}</strong></div>
                    <div><span>Dinheiro</span><strong>R$ {moeda(relatorioFechamento.vendasPorFormaPagamento.dinheiro || 0)}</strong></div>
                    <div><span>PIX</span><strong>R$ {moeda(relatorioFechamento.vendasPorFormaPagamento.pix || 0)}</strong></div>
                    <div><span>Cartão débito</span><strong>R$ {moeda(relatorioFechamento.vendasPorFormaPagamento.debito || 0)}</strong></div>
                    <div><span>Cartão crédito</span><strong>R$ {moeda(relatorioFechamento.vendasPorFormaPagamento.credito || 0)}</strong></div>
                    <div><span>Voucher</span><strong>R$ {moeda(relatorioFechamento.vendasPorFormaPagamento.vale_troca || 0)}</strong></div>
                    <div><span>Outros</span><strong>R$ {moeda(relatorioFechamento.vendasPorFormaPagamento.outros || 0)}</strong></div>
                  </div>
                </section>

                <section className="public-pdv-closing-report-section">
                  <h3>Movimentações</h3>
                  <div className="public-pdv-closing-report-values">
                    <div><span>Suprimentos</span><strong>R$ {moeda(relatorioFechamento.suprimentos)}</strong></div>
                    <div><span>Sangrias</span><strong>R$ {moeda(relatorioFechamento.sangrias)}</strong></div>
                    <div><span>Estornos</span><strong>R$ 0,00</strong></div>
                    <div><span>Cancelamentos</span><strong>R$ 0,00</strong></div>
                    <div><span>Descontos</span><strong>R$ 0,00</strong></div>
                  </div>
                </section>
              </div>

              <div className="public-pdv-closing-report-columns">
                <section className="public-pdv-closing-report-section public-pdv-closing-report-totals">
                  <h3>Totais</h3>
                  <div className="public-pdv-closing-report-values">
                    <div><span>Total vendido</span><strong>R$ {moeda(relatorioFechamento.totalVendas)}</strong></div>
                    <div><span>Total recebido</span><strong>R$ {moeda(relatorioFechamento.totalVendas)}</strong></div>
                    <div><span>Valor esperado em dinheiro</span><strong>R$ {moeda(relatorioFechamento.totalEsperado)}</strong></div>
                  </div>
                </section>

                <section className="public-pdv-closing-report-section public-pdv-closing-report-check">
                  <h3>Conferência</h3>
                  <div className="public-pdv-closing-report-values">
                    <div><span>Valor informado pelo operador</span><strong>R$ {moeda(relatorioFechamento.valorInformado)}</strong></div>
                    <div><span>Diferença</span><strong className="public-pdv-closing-report-difference">{diferencaRelatorio(diferencaFechamento)}</strong></div>
                  </div>
                </section>
              </div>

              <section
                className={`public-pdv-closing-report-section public-pdv-closing-report-status public-pdv-closing-report-status--${
                  Math.abs(diferencaFechamento) < 0.005
                    ? "ok"
                    : diferencaFechamento > 0
                      ? "surplus"
                      : "shortage"
                }`}
              >
                <strong>{situacaoRelatorio(diferencaFechamento)}</strong>
              </section>
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
