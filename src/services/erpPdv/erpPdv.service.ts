import { supabase } from "../../lib/supabase";

export type ErpPdvCategoria = {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
};

export type ErpPdvProduto = {
  id: string;
  empresa_id: string;
  categoria_id: string | null;
  nome: string;
  codigo_barras: string;
  sku: string;
  marca: string;
  custo: number;
  preco_venda: number;
  preco_atacado: number;
  preco_revenda: number;
  preco_personalizado: number;
  formacao_preco_tipo: ErpPdvFormacaoPrecoTipo;
  percentual_preco: number;
  historico_precos: ErpPdvHistoricoPrecoItem[];
  unidade: string;
  localizacao: string;
  ncm: string;
  observacoes: string;
  imagem_url: string;
  ativo: boolean;
  estoque_atual: number;
  estoque_minimo: number;
};

export type ErpPdvFormacaoPrecoTipo = "manual" | "percentual_custo";

export type ErpPdvTabelaPreco = "varejo" | "atacado" | "revenda" | "personalizada";

export type ErpPdvHistoricoPrecoItem = {
  data: string;
  tabela: ErpPdvTabelaPreco;
  precoAnterior: number;
  precoNovo: number;
  origem: string;
};

export type ErpPdvPerfilUsuario =
  | "administrador"
  | "gerente"
  | "caixa"
  | "vendedor"
  | "estoque";

export type ErpPdvPermissao =
  | "tabela_varejo"
  | "tabela_atacado"
  | "tabela_revenda"
  | "produto_salvar"
  | "preco_alterar"
  | "desconto_aplicar"
  | "caixa_abrir_fechar"
  | "caixa_movimentar"
  | "venda_cancelar"
  | "devolucao_realizar"
  | "vale_troca_emitir"
  | "custo_lucro_consultar"
  | "relatorios_acessar";

export type ErpPdvUsuario = {
  id: string;
  empresa_id: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: ErpPdvPerfilUsuario;
  modulo_inicial: string;
  permissoes: Record<ErpPdvPermissao, boolean>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type ErpPdvUsuarioPayload = {
  id?: string;
  empresaId: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: ErpPdvPerfilUsuario;
  moduloInicial: string;
  permissoes: Record<ErpPdvPermissao, boolean>;
  ativo: boolean;
};

export type ErpPdvProdutoPayload = {
  id?: string;
  empresaId: string;
  categoriaId: string;
  nome: string;
  codigoBarras: string;
  sku: string;
  marca: string;
  custo: number;
  precoVenda: number;
  precoAtacado: number;
  precoRevenda: number;
  precoPersonalizado: number;
  formacaoPrecoTipo: ErpPdvFormacaoPrecoTipo;
  percentualPreco: number;
  unidade: string;
  localizacao: string;
  ncm: string;
  observacoes: string;
  imagemUrl: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
};

export type ErpPdvCliente = {
  id: string;
  empresa_id: string;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  observacoes: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type ErpPdvClientePayload = {
  id?: string;
  empresaId: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  observacoes: string;
  ativo: boolean;
};

export type ErpPdvFornecedor = {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cpf_cnpj: string;
  inscricao_estadual: string;
  contato: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  observacoes: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type ErpPdvFornecedorPayload = {
  id?: string;
  empresaId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cpfCnpj: string;
  inscricaoEstadual: string;
  contato: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  observacoes: string;
  ativo: boolean;
};

export type ErpPdvEntradaItemPayload = {
  produtoId: string;
  quantidade: number;
  custoUnitario: number;
  desconto: number;
  frete: number;
  outrasDespesas: number;
  codigoFornecedor?: string;
  gtin?: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  tributos?: Record<string, unknown>;
};

export type ErpPdvEntradaMercadoriaPayload = {
  empresaId: string;
  fornecedorId: string;
  numeroNota: string;
  chaveAcesso?: string;
  dataCompra: string;
  observacoes: string;
  origem?: "manual" | "xml_nfe";
  xmlUrl?: string;
  xmlStoragePath?: string;
  xmlResumo?: Record<string, unknown>;
  itens: ErpPdvEntradaItemPayload[];
};

export type ErpPdvEntradaItem = {
  id: string;
  produto_id: string;
  descricao: string;
  quantidade: number;
  custo_unitario: number;
  desconto: number;
  frete: number;
  outras_despesas: number;
  codigo_fornecedor: string;
  gtin: string;
  ncm: string;
  cfop: string;
  unidade: string;
  tributos: Record<string, unknown>;
  custo_total: number;
  estoque_anterior: number;
  estoque_posterior: number;
};

export type ErpPdvEntradaMercadoria = {
  id: string;
  fornecedor_id: string | null;
  fornecedor_nome: string;
  numero_nota: string;
  chave_acesso: string;
  data_compra: string;
  observacoes: string;
  origem: string;
  xml_url: string;
  xml_storage_path: string;
  xml_resumo: Record<string, unknown>;
  total_produtos: number;
  total_descontos: number;
  total_frete: number;
  total_outras_despesas: number;
  total_entrada: number;
  created_at: string;
  itens: ErpPdvEntradaItem[];
};

export type ErpPdvMovimentacaoTipo = "entrada" | "saida" | "ajuste" | "venda";

export type ErpPdvMovimentacao = {
  id: string;
  empresa_id: string;
  produto_id: string;
  tipo: ErpPdvMovimentacaoTipo;
  quantidade: number;
  estoque_anterior: number;
  estoque_posterior: number;
  origem: string;
  motivo: string;
  observacao: string;
  usuario_responsavel: string;
  created_at: string;
};

export type ErpPdvMovimentacaoPayload = {
  empresaId: string;
  produtoId: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  motivo: string;
  observacao: string;
  usuarioResponsavel: string;
  usuarioId?: string;
};

export type ErpPdvFormaPagamento =
  | "dinheiro"
  | "pix"
  | "debito"
  | "credito"
  | "vale_troca"
  | "outros";

export type ErpPdvVendaItemPayload = {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
};

export type ErpPdvPagamentoDetalhadoPayload = {
  forma: string;
  label: string;
  valor: number;
  parcelas?: number;
};

export type ErpPdvFinalizarVendaPayload = {
  empresaId: string;
  caixaId: string;
  clienteId?: string;
  clienteNome?: string;
  operador: string;
  operadorUsuarioId?: string;
  formaPagamento: ErpPdvFormaPagamento;
  valeTrocaId?: string;
  pagamentosDetalhados?: ErpPdvPagamentoDetalhadoPayload[];
  parcelasCredito?: number;
  valorRecebidoDinheiro?: number;
  troco?: number;
  itens: ErpPdvVendaItemPayload[];
};

export type ErpPdvVendaFinalizada = {
  id: string;
  numero: number;
  total: number;
  forma_pagamento: string;
  cliente_id: string | null;
  cliente_nome: string;
  operador: string;
  vale_troca_id: string | null;
  vale_troca_valor_utilizado: number;
  pagamento_complementar: number;
  finalizada_em: string;
  movimentacoes: ErpPdvMovimentacao[];
};

export type ErpPdvVendaBuscaItem = {
  id: string;
  produto_id: string | null;
  descricao: string;
  quantidade: number;
  quantidade_devolvida: number;
  quantidade_disponivel: number;
  preco_unitario: number;
  total: number;
};

export type ErpPdvVendaBusca = {
  id: string;
  numero: number;
  total: number;
  forma_pagamento: string;
  cliente_id: string | null;
  cliente_nome: string;
  operador: string;
  finalizada_em: string;
  historico_operacional: ErpPdvHistoricoOperacionalItem[];
  itens: ErpPdvVendaBuscaItem[];
};

export type ErpPdvHistoricoOperacionalItem = {
  data: string;
  tipo: string;
  descricao: string;
  valor?: number;
};

export type ErpPdvDevolucaoItemPayload = {
  vendaItemId: string;
  quantidade: number;
};

export type ErpPdvRegistrarDevolucaoPayload = {
  empresaId: string;
  vendaId: string;
  operador: string;
  operadorUsuarioId?: string;
  motivo: string;
  validadeDias: number;
  itens: ErpPdvDevolucaoItemPayload[];
};

export type ErpPdvValeTrocaStatus = "ativo" | "utilizado" | "expirado" | "cancelado";

export type ErpPdvValeTroca = {
  id: string;
  empresa_id: string;
  venda_origem_id: string | null;
  cliente_id: string | null;
  numero: number;
  cliente_nome: string;
  valor_original: number;
  saldo_restante: number;
  emitido_em: string;
  validade_em: string;
  status: ErpPdvValeTrocaStatus;
  observacao: string;
  historico: ErpPdvHistoricoOperacionalItem[];
  created_at: string;
  updated_at: string;
};

export type ErpPdvDevolucao = {
  id: string;
  numero: number;
  venda_id: string;
  vale_troca_id: string | null;
  tipo: "total" | "parcial";
  motivo: string;
  operador: string;
  cliente_nome: string;
  valor_devolvido: number;
  created_at: string;
};

export type ErpPdvTrocasResumo = {
  devolucoes: ErpPdvDevolucao[];
  vales: ErpPdvValeTroca[];
  totalDevolvido: number;
  totalValesEmitidos: number;
  totalValesEmAberto: number;
  totalValesUtilizados: number;
};

export type ErpPdvCaixaStatus = "aberto" | "fechado";

export type ErpPdvCaixa = {
  id: string;
  empresa_id: string;
  status: ErpPdvCaixaStatus;
  operador: string;
  operador_usuario_id: string | null;
  aberto_em: string;
  fechado_em: string | null;
  saldo_inicial: number;
  saldo_final: number;
  valor_informado: number;
  diferenca: number;
  observacao: string;
};

export type ErpPdvCaixaMovimentacaoTipo = "suprimento" | "sangria";

export type ErpPdvCaixaMovimentacao = {
  id: string;
  empresa_id: string;
  caixa_id: string;
  tipo: ErpPdvCaixaMovimentacaoTipo;
  valor: number;
  operador: string;
  operador_usuario_id: string | null;
  observacao: string;
  created_at: string;
};

export type ErpPdvCaixaResumo = {
  caixa: ErpPdvCaixa;
  vendasPorFormaPagamento: Record<string, number>;
  suprimentos: number;
  sangrias: number;
  totalVendas: number;
  totalEsperado: number;
  valorInformado: number;
  diferenca: number;
};

export type ErpPdvRelatorioFiltros = {
  dataInicio: string;
  dataFim: string;
  operador: string;
  clienteId: string;
  formaPagamento: string;
};

export type ErpPdvRelatorioItem = {
  id: string;
  venda_id: string;
  produto_id: string | null;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  custo_unitario: number;
  lucro_bruto: number;
};

export type ErpPdvRelatorioVenda = {
  id: string;
  numero: number;
  total: number;
  forma_pagamento: string;
  cliente_id: string | null;
  cliente_nome: string;
  operador: string;
  finalizada_em: string;
  itens: ErpPdvRelatorioItem[];
  quantidade_itens: number;
  lucro_bruto: number;
};

export type ErpPdvRelatorioAgrupado = {
  chave: string;
  label: string;
  quantidadeVendas: number;
  quantidadeItens: number;
  faturamento: number;
  lucroBruto: number;
};

export type ErpPdvRelatorioResumo = {
  vendas: ErpPdvRelatorioVenda[];
  totalVendas: number;
  faturamento: number;
  lucroBruto: number;
  ticketMedio: number;
  quantidadeItens: number;
  vendasHoje: number;
  faturamentoHoje: number;
  lucroHoje: number;
  estoqueCritico: ErpPdvProduto[];
  porOperador: ErpPdvRelatorioAgrupado[];
  porProduto: ErpPdvRelatorioAgrupado[];
  maisVendidos: ErpPdvRelatorioAgrupado[];
  porFormaPagamento: ErpPdvRelatorioAgrupado[];
};

type ErpPdvProdutoRow = {
  id: string;
  empresa_id: string;
  categoria_id: string | null;
  nome: string;
  codigo_barras: string;
  sku: string;
  marca?: string;
  custo: number | string;
  preco_venda: number | string;
  preco_atacado?: number | string;
  preco_revenda?: number | string;
  preco_personalizado?: number | string;
  formacao_preco_tipo?: string;
  percentual_preco?: number | string;
  historico_precos?: unknown;
  unidade: string;
  localizacao?: string;
  ncm?: string;
  observacoes?: string;
  imagem_url?: string;
  ativo: boolean;
};

type ErpPdvUsuarioRow = {
  id: string;
  empresa_id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  perfil?: ErpPdvPerfilUsuario;
  modulo_inicial?: string;
  permissoes?: Record<string, boolean> | null;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
};

type ErpPdvEstoqueRow = {
  produto_id: string;
  quantidade_atual: number | string;
  estoque_minimo: number | string;
};

type ErpPdvClienteRow = {
  id: string;
  empresa_id: string;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

type ErpPdvFornecedorRow = {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia?: string;
  cpf_cnpj?: string;
  inscricao_estadual?: string;
  contato?: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

type ErpPdvEntradaRow = {
  id: string;
  fornecedor_id?: string | null;
  fornecedor_nome?: string;
  numero_nota?: string;
  chave_acesso?: string;
  data_compra: string;
  observacoes?: string;
  origem?: string;
  xml_url?: string;
  xml_storage_path?: string;
  xml_resumo?: Record<string, unknown>;
  total_produtos: number | string;
  total_descontos: number | string;
  total_frete: number | string;
  total_outras_despesas: number | string;
  total_entrada: number | string;
  created_at: string;
};

type ErpPdvEntradaItemRow = {
  id: string;
  entrada_id: string;
  produto_id: string;
  descricao: string;
  quantidade: number | string;
  custo_unitario: number | string;
  desconto: number | string;
  frete: number | string;
  outras_despesas: number | string;
  codigo_fornecedor?: string;
  gtin?: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  tributos?: Record<string, unknown>;
  custo_total: number | string;
  estoque_anterior: number | string;
  estoque_posterior: number | string;
};

type ErpPdvMovimentacaoRow = {
  id: string;
  empresa_id: string;
  produto_id: string;
  tipo: ErpPdvMovimentacaoTipo;
  quantidade: number | string;
  estoque_anterior: number | string;
  estoque_posterior: number | string;
  origem?: string;
  motivo?: string;
  observacao?: string;
  usuario_responsavel?: string;
  erp_pdv_usuario_id?: string | null;
  created_at: string;
};

type ErpPdvVendaRow = {
  id: string;
  numero: number | string;
  total: number | string;
  forma_pagamento: string;
  cliente_id?: string | null;
  cliente_nome?: string;
  operador?: string;
  operador_usuario_id?: string | null;
  vale_troca_id?: string | null;
  vale_troca_valor_utilizado?: number | string;
  pagamento_complementar?: number | string;
  historico_operacional?: unknown;
  finalizada_em: string;
};

type ErpPdvVendaItemRow = {
  id: string;
  venda_id: string;
  produto_id?: string | null;
  descricao: string;
  quantidade: number | string;
  quantidade_devolvida?: number | string;
  preco_unitario: number | string;
  total: number | string;
};

type ErpPdvValeTrocaRow = {
  id: string;
  empresa_id: string;
  venda_origem_id?: string | null;
  cliente_id?: string | null;
  numero: number | string;
  cliente_nome?: string;
  valor_original: number | string;
  saldo_restante: number | string;
  emitido_em: string;
  validade_em: string;
  status: ErpPdvValeTrocaStatus;
  observacao?: string;
  historico?: unknown;
  created_at: string;
  updated_at: string;
};

type ErpPdvDevolucaoRow = {
  id: string;
  numero: number | string;
  venda_id: string;
  vale_troca_id?: string | null;
  tipo: "total" | "parcial";
  motivo: string;
  operador?: string;
  operador_usuario_id?: string | null;
  cliente_nome?: string;
  valor_devolvido: number | string;
  created_at: string;
};

type ErpPdvCaixaRow = {
  id: string;
  empresa_id: string;
  status: ErpPdvCaixaStatus;
  operador?: string;
  operador_usuario_id?: string | null;
  aberto_em?: string | null;
  fechado_em?: string | null;
  saldo_inicial: number | string;
  saldo_final: number | string;
  valor_informado?: number | string;
  diferenca?: number | string;
  observacao?: string;
};

type ErpPdvCaixaMovimentacaoRow = {
  id: string;
  empresa_id: string;
  caixa_id: string;
  tipo: ErpPdvCaixaMovimentacaoTipo;
  valor: number | string;
  operador?: string;
  operador_usuario_id?: string | null;
  observacao?: string;
  created_at: string;
};

function toNumber(valor: number | string | null | undefined) {
  const numero =
    typeof valor === "number" ? valor : Number(String(valor || "0"));

  return Number.isFinite(numero) ? numero : 0;
}

function normalizarFormacaoPrecoTipo(valor: string | undefined) {
  return valor === "percentual_custo" ? valor : "manual";
}

const erpPdvPermissoesLista: ErpPdvPermissao[] = [
  "tabela_varejo",
  "tabela_atacado",
  "tabela_revenda",
  "produto_salvar",
  "preco_alterar",
  "desconto_aplicar",
  "caixa_abrir_fechar",
  "caixa_movimentar",
  "venda_cancelar",
  "devolucao_realizar",
  "vale_troca_emitir",
  "custo_lucro_consultar",
  "relatorios_acessar",
];

function normalizarPermissoesUsuario(
  valor: Record<string, boolean> | null | undefined
) {
  return erpPdvPermissoesLista.reduce<Record<ErpPdvPermissao, boolean>>(
    (permissoes, permissao) => ({
      ...permissoes,
      [permissao]: Boolean(valor?.[permissao]),
    }),
    {} as Record<ErpPdvPermissao, boolean>
  );
}

function normalizarPerfilUsuario(valor: string | undefined): ErpPdvPerfilUsuario {
  return valor === "gerente" ||
    valor === "caixa" ||
    valor === "vendedor" ||
    valor === "estoque"
    ? valor
    : "administrador";
}

function normalizarHistoricoPrecos(valor: unknown): ErpPdvHistoricoPrecoItem[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .slice(0, 50)
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const historico = item as Record<string, unknown>;
      const tabela =
        historico.tabela === "atacado" ||
        historico.tabela === "revenda" ||
        historico.tabela === "personalizada"
          ? historico.tabela
          : "varejo";

      return {
        data: String(historico.data || ""),
        tabela,
        precoAnterior: toNumber(historico.precoAnterior as number | string),
        precoNovo: toNumber(historico.precoNovo as number | string),
        origem: String(historico.origem || "manual"),
      };
    })
    .filter((item): item is ErpPdvHistoricoPrecoItem => Boolean(item?.data));
}

function normalizarHistoricoOperacional(
  valor: unknown
): ErpPdvHistoricoOperacionalItem[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .slice(0, 100)
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const historico = item as Record<string, unknown>;
      const data = String(historico.data || "");
      const tipo = String(historico.tipo || "");
      const descricao = String(historico.descricao || "");

      if (!data || !tipo || !descricao) return null;

      const historicoNormalizado: ErpPdvHistoricoOperacionalItem = {
        data,
        tipo,
        descricao,
      };

      if (historico.valor !== undefined) {
        historicoNormalizado.valor = toNumber(
          historico.valor as number | string
        );
      }

      return historicoNormalizado;
    })
    .filter((item): item is ErpPdvHistoricoOperacionalItem => Boolean(item));
}

function normalizarUsuario(row: ErpPdvUsuarioRow): ErpPdvUsuario {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    nome: row.nome || "",
    email: row.email || "",
    telefone: row.telefone || "",
    perfil: normalizarPerfilUsuario(row.perfil),
    modulo_inicial: row.modulo_inicial || "pdv",
    permissoes: normalizarPermissoesUsuario(row.permissoes),
    ativo: row.ativo !== false,
    created_at: row.created_at || "",
    updated_at: row.updated_at || "",
  };
}

function normalizarProduto(
  row: ErpPdvProdutoRow,
  estoque?: ErpPdvEstoqueRow
): ErpPdvProduto {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    categoria_id: row.categoria_id,
    nome: row.nome || "",
    codigo_barras: row.codigo_barras || "",
    sku: row.sku || "",
    marca: row.marca || "",
    custo: toNumber(row.custo),
    preco_venda: toNumber(row.preco_venda),
    preco_atacado: toNumber(row.preco_atacado),
    preco_revenda: toNumber(row.preco_revenda),
    preco_personalizado: toNumber(row.preco_personalizado),
    formacao_preco_tipo: normalizarFormacaoPrecoTipo(row.formacao_preco_tipo),
    percentual_preco: toNumber(row.percentual_preco),
    historico_precos: normalizarHistoricoPrecos(row.historico_precos),
    unidade: row.unidade || "un",
    localizacao: row.localizacao || "",
    ncm: row.ncm || "",
    observacoes: row.observacoes || "",
    imagem_url: row.imagem_url || "",
    ativo: row.ativo,
    estoque_atual: toNumber(estoque?.quantidade_atual),
    estoque_minimo: toNumber(estoque?.estoque_minimo),
  };
}

function normalizarMovimentacao(
  row: ErpPdvMovimentacaoRow
): ErpPdvMovimentacao {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    produto_id: row.produto_id,
    tipo: row.tipo,
    quantidade: toNumber(row.quantidade),
    estoque_anterior: toNumber(row.estoque_anterior),
    estoque_posterior: toNumber(row.estoque_posterior),
    origem: row.origem || "manual",
    motivo: row.motivo || "",
    observacao: row.observacao || "",
    usuario_responsavel: row.usuario_responsavel || "",
    created_at: row.created_at,
  };
}

function normalizarCliente(row: ErpPdvClienteRow): ErpPdvCliente {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    nome: row.nome || "",
    cpf_cnpj: row.cpf_cnpj || "",
    telefone: row.telefone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    endereco: row.endereco || "",
    observacoes: row.observacoes || "",
    ativo: row.ativo,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizarFornecedor(row: ErpPdvFornecedorRow): ErpPdvFornecedor {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    razao_social: row.razao_social || "",
    nome_fantasia: row.nome_fantasia || "",
    cpf_cnpj: row.cpf_cnpj || "",
    inscricao_estadual: row.inscricao_estadual || "",
    contato: row.contato || "",
    telefone: row.telefone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    endereco: row.endereco || "",
    observacoes: row.observacoes || "",
    ativo: row.ativo,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizarEntradaItem(row: ErpPdvEntradaItemRow): ErpPdvEntradaItem {
  return {
    id: row.id,
    produto_id: row.produto_id,
    descricao: row.descricao || "",
    quantidade: toNumber(row.quantidade),
    custo_unitario: toNumber(row.custo_unitario),
    desconto: toNumber(row.desconto),
    frete: toNumber(row.frete),
    outras_despesas: toNumber(row.outras_despesas),
    codigo_fornecedor: row.codigo_fornecedor || "",
    gtin: row.gtin || "",
    ncm: row.ncm || "",
    cfop: row.cfop || "",
    unidade: row.unidade || "",
    tributos:
      row.tributos && typeof row.tributos === "object" && !Array.isArray(row.tributos)
        ? row.tributos
        : {},
    custo_total: toNumber(row.custo_total),
    estoque_anterior: toNumber(row.estoque_anterior),
    estoque_posterior: toNumber(row.estoque_posterior),
  };
}

function normalizarEntrada(
  row: ErpPdvEntradaRow,
  itens: ErpPdvEntradaItem[] = []
): ErpPdvEntradaMercadoria {
  return {
    id: row.id,
    fornecedor_id: row.fornecedor_id || null,
    fornecedor_nome: row.fornecedor_nome || "",
    numero_nota: row.numero_nota || "",
    chave_acesso: row.chave_acesso || "",
    data_compra: row.data_compra,
    observacoes: row.observacoes || "",
    origem: row.origem || "manual",
    xml_url: row.xml_url || "",
    xml_storage_path: row.xml_storage_path || "",
    xml_resumo:
      row.xml_resumo && typeof row.xml_resumo === "object" && !Array.isArray(row.xml_resumo)
        ? row.xml_resumo
        : {},
    total_produtos: toNumber(row.total_produtos),
    total_descontos: toNumber(row.total_descontos),
    total_frete: toNumber(row.total_frete),
    total_outras_despesas: toNumber(row.total_outras_despesas),
    total_entrada: toNumber(row.total_entrada),
    created_at: row.created_at,
    itens,
  };
}

function normalizarCaixa(row: ErpPdvCaixaRow): ErpPdvCaixa {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    status: row.status,
    operador: row.operador || "",
    operador_usuario_id: row.operador_usuario_id || null,
    aberto_em: row.aberto_em || "",
    fechado_em: row.fechado_em || null,
    saldo_inicial: toNumber(row.saldo_inicial),
    saldo_final: toNumber(row.saldo_final),
    valor_informado: toNumber(row.valor_informado),
    diferenca: toNumber(row.diferenca),
    observacao: row.observacao || "",
  };
}

function normalizarCaixaMovimentacao(
  row: ErpPdvCaixaMovimentacaoRow
): ErpPdvCaixaMovimentacao {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    caixa_id: row.caixa_id,
    tipo: row.tipo,
    valor: toNumber(row.valor),
    operador: row.operador || "",
    operador_usuario_id: row.operador_usuario_id || null,
    observacao: row.observacao || "",
    created_at: row.created_at,
  };
}

function normalizarValeTroca(row: ErpPdvValeTrocaRow): ErpPdvValeTroca {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    venda_origem_id: row.venda_origem_id || null,
    cliente_id: row.cliente_id || null,
    numero: toNumber(row.numero),
    cliente_nome: row.cliente_nome || "Consumidor nao identificado",
    valor_original: toNumber(row.valor_original),
    saldo_restante: toNumber(row.saldo_restante),
    emitido_em: row.emitido_em,
    validade_em: row.validade_em,
    status: row.status,
    observacao: row.observacao || "",
    historico: normalizarHistoricoOperacional(row.historico),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizarDevolucao(row: ErpPdvDevolucaoRow): ErpPdvDevolucao {
  return {
    id: row.id,
    numero: toNumber(row.numero),
    venda_id: row.venda_id,
    vale_troca_id: row.vale_troca_id || null,
    tipo: row.tipo,
    motivo: row.motivo,
    operador: row.operador || "",
    cliente_nome: row.cliente_nome || "Consumidor nao identificado",
    valor_devolvido: toNumber(row.valor_devolvido),
    created_at: row.created_at,
  };
}

export async function listarErpPdvUsuarios(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_usuarios")
    .select(
      "id, empresa_id, nome, email, telefone, perfil, modulo_inicial, permissoes, ativo, created_at, updated_at"
    )
    .eq("empresa_id", empresaId)
    .order("ativo", { ascending: false })
    .order("nome", { ascending: true });

  return {
    data: ((data || []) as ErpPdvUsuarioRow[]).map(normalizarUsuario),
    error,
  };
}

export async function salvarErpPdvUsuario(payload: ErpPdvUsuarioPayload) {
  if (!payload.nome.trim()) {
    return {
      data: null,
      error: new Error("Informe o nome do usuario do ERP/PDV."),
    };
  }

  const agora = new Date().toISOString();
  const usuarioPayload = {
    empresa_id: payload.empresaId,
    nome: payload.nome.trim(),
    email: payload.email.trim(),
    telefone: payload.telefone.trim(),
    perfil: payload.perfil,
    modulo_inicial: payload.moduloInicial.trim() || "pdv",
    permissoes: normalizarPermissoesUsuario(payload.permissoes),
    ativo: payload.ativo,
    updated_at: agora,
  };

  const query = payload.id
    ? supabase
        .from("erp_pdv_usuarios")
        .update(usuarioPayload)
        .eq("empresa_id", payload.empresaId)
        .eq("id", payload.id)
    : supabase.from("erp_pdv_usuarios").insert(usuarioPayload);

  const { data, error } = await query
    .select(
      "id, empresa_id, nome, email, telefone, perfil, modulo_inicial, permissoes, ativo, created_at, updated_at"
    )
    .single();

  return {
    data: data ? normalizarUsuario(data as ErpPdvUsuarioRow) : null,
    error,
  };
}

export async function listarErpPdvCategorias(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_categorias")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("ordem", { ascending: true })
    .order("nome", { ascending: true });

  return {
    data: (data || []) as ErpPdvCategoria[],
    error,
  };
}

export async function criarErpPdvCategoria(
  empresaId: string,
  nome: string,
  descricao = ""
) {
  const { data, error } = await supabase
    .from("erp_pdv_categorias")
    .insert({
      empresa_id: empresaId,
      nome: nome.trim(),
      descricao: descricao.trim(),
      ativo: true,
    })
    .select("*")
    .single();

  return {
    data: data as ErpPdvCategoria | null,
    error,
  };
}

export async function listarErpPdvProdutos(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_produtos")
    .select(
      `
        id,
        empresa_id,
        categoria_id,
        nome,
        codigo_barras,
        sku,
        marca,
        custo,
        preco_venda,
        preco_atacado,
        preco_revenda,
        preco_personalizado,
        formacao_preco_tipo,
        percentual_preco,
        historico_precos,
        unidade,
        localizacao,
        ncm,
        observacoes,
        imagem_url,
        ativo
      `
    )
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true });

  if (error) {
    return {
      data: [],
      error,
    };
  }

  const { data: estoqueData, error: estoqueError } = await supabase
    .from("erp_pdv_estoques")
    .select("produto_id, quantidade_atual, estoque_minimo")
    .eq("empresa_id", empresaId);

  if (estoqueError) {
    return {
      data: [],
      error: estoqueError,
    };
  }

  const estoquesPorProduto = new Map(
    ((estoqueData || []) as ErpPdvEstoqueRow[]).map((estoque) => [
      estoque.produto_id,
      estoque,
    ])
  );

  return {
    data: ((data || []) as ErpPdvProdutoRow[]).map((produto) =>
      normalizarProduto(produto, estoquesPorProduto.get(produto.id))
    ),
    error: null,
  };
}

export type ErpPdvProdutosPaginados = {
  data: ErpPdvProduto[];
  total: number;
  pagina: number;
  limite: number;
};

export async function listarErpPdvProdutosPaginado(
  empresaId: string,
  pagina = 1,
  limite = 25,
  busca = "",
  ordenacao: "nome" | "estoque" | "varejo" | "atacado" | "custo" = "nome"
) {
  const paginaSegura = Math.max(1, pagina);
  const limiteSeguro = Math.min(100, Math.max(1, limite));
  const inicio = (paginaSegura - 1) * limiteSeguro;
  const fim = inicio + limiteSeguro - 1;
  const colunaOrdenacao =
    ordenacao === "varejo"
      ? "preco_venda"
      : ordenacao === "atacado"
        ? "preco_atacado"
        : ordenacao === "estoque"
          ? "nome"
        : ordenacao;

  let consulta = supabase
    .from("erp_pdv_produtos")
    .select(
      `
        id, empresa_id, categoria_id, nome, codigo_barras, sku, marca, custo,
        preco_venda, preco_atacado, preco_revenda, preco_personalizado,
        formacao_preco_tipo, percentual_preco, historico_precos, unidade,
        localizacao, ncm, observacoes, imagem_url, ativo
      `,
      { count: "exact" }
    )
    .eq("empresa_id", empresaId)
    .order(colunaOrdenacao, { ascending: true })
    .range(inicio, fim);

  const termo = busca.trim();
  if (termo) {
    const valor = termo.replace(/[,()]/g, " ").trim();
    consulta = consulta.or(
      `nome.ilike.%${valor}%,sku.ilike.%${valor}%,codigo_barras.ilike.%${valor}%,marca.ilike.%${valor}%`
    );
  }

  const { data, count, error } = await consulta;
  if (error) {
    return { data: null, error };
  }

  const produtosPagina = (data || []) as ErpPdvProdutoRow[];
  const ids = produtosPagina.map((produto) => produto.id);
  const { data: estoqueData, error: estoqueError } = ids.length
    ? await supabase
        .from("erp_pdv_estoques")
        .select("produto_id, quantidade_atual, estoque_minimo")
        .eq("empresa_id", empresaId)
        .in("produto_id", ids)
    : { data: [], error: null };

  if (estoqueError) {
    return { data: null, error: estoqueError };
  }

  const estoquesPorProduto = new Map(
    ((estoqueData || []) as ErpPdvEstoqueRow[]).map((estoque) => [
      estoque.produto_id,
      estoque,
    ])
  );

  const resultado: ErpPdvProdutosPaginados = {
    data: produtosPagina.map((produto) =>
      normalizarProduto(produto, estoquesPorProduto.get(produto.id))
    ),
    total: count || 0,
    pagina: paginaSegura,
    limite: limiteSeguro,
  };

  return { data: resultado, error: null };
}

export async function listarErpPdvClientes(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_clientes")
    .select(
      "id, empresa_id, nome, cpf_cnpj, telefone, whatsapp, email, endereco, observacoes, ativo, created_at, updated_at"
    )
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("nome", { ascending: true })
    .limit(200);

  return {
    data: ((data || []) as ErpPdvClienteRow[]).map(normalizarCliente),
    error,
  };
}

export async function buscarErpPdvClientes(empresaId: string, termo: string) {
  const termoBusca = termo.trim();

  if (!termoBusca) {
    return listarErpPdvClientes(empresaId);
  }

  const termoLike = `%${termoBusca}%`;
  const { data, error } = await supabase
    .from("erp_pdv_clientes")
    .select(
      "id, empresa_id, nome, cpf_cnpj, telefone, whatsapp, email, endereco, observacoes, ativo, created_at, updated_at"
    )
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .or(
      `nome.ilike.${termoLike},cpf_cnpj.ilike.${termoLike},telefone.ilike.${termoLike}`
    )
    .order("nome", { ascending: true })
    .limit(20);

  return {
    data: ((data || []) as ErpPdvClienteRow[]).map(normalizarCliente),
    error,
  };
}

export async function salvarErpPdvCliente(payload: ErpPdvClientePayload) {
  if (!payload.nome.trim()) {
    return {
      data: null,
      error: new Error("Informe o nome do cliente."),
    };
  }

  const agora = new Date().toISOString();
  const clientePayload = {
    empresa_id: payload.empresaId,
    nome: payload.nome.trim(),
    cpf_cnpj: payload.cpfCnpj.trim(),
    telefone: payload.telefone.trim(),
    whatsapp: payload.whatsapp.trim(),
    email: payload.email.trim(),
    endereco: payload.endereco.trim(),
    observacoes: payload.observacoes.trim(),
    ativo: payload.ativo,
    updated_at: agora,
  };

  const query = payload.id
    ? supabase
        .from("erp_pdv_clientes")
        .update(clientePayload)
        .eq("id", payload.id)
        .eq("empresa_id", payload.empresaId)
    : supabase.from("erp_pdv_clientes").insert(clientePayload);

  const { data, error } = await query
    .select(
      "id, empresa_id, nome, cpf_cnpj, telefone, whatsapp, email, endereco, observacoes, ativo, created_at, updated_at"
    )
    .single();

  return {
    data: data ? normalizarCliente(data as ErpPdvClienteRow) : null,
    error,
  };
}

export async function listarErpPdvFornecedores(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_fornecedores")
    .select(
      "id, empresa_id, razao_social, nome_fantasia, cpf_cnpj, inscricao_estadual, contato, telefone, whatsapp, email, endereco, observacoes, ativo, created_at, updated_at"
    )
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("razao_social", { ascending: true })
    .limit(200);

  return {
    data: ((data || []) as ErpPdvFornecedorRow[]).map(normalizarFornecedor),
    error,
  };
}

export async function salvarErpPdvFornecedor(
  payload: ErpPdvFornecedorPayload
) {
  if (!payload.razaoSocial.trim()) {
    return {
      data: null,
      error: new Error("Informe a razao social do fornecedor."),
    };
  }

  const agora = new Date().toISOString();
  const fornecedorPayload = {
    empresa_id: payload.empresaId,
    razao_social: payload.razaoSocial.trim(),
    nome_fantasia: payload.nomeFantasia.trim(),
    cpf_cnpj: payload.cpfCnpj.trim(),
    inscricao_estadual: payload.inscricaoEstadual.trim(),
    contato: payload.contato.trim(),
    telefone: payload.telefone.trim(),
    whatsapp: payload.whatsapp.trim(),
    email: payload.email.trim(),
    endereco: payload.endereco.trim(),
    observacoes: payload.observacoes.trim(),
    ativo: payload.ativo,
    updated_at: agora,
  };

  const query = payload.id
    ? supabase
        .from("erp_pdv_fornecedores")
        .update(fornecedorPayload)
        .eq("id", payload.id)
        .eq("empresa_id", payload.empresaId)
    : supabase.from("erp_pdv_fornecedores").insert(fornecedorPayload);

  const { data, error } = await query
    .select(
      "id, empresa_id, razao_social, nome_fantasia, cpf_cnpj, inscricao_estadual, contato, telefone, whatsapp, email, endereco, observacoes, ativo, created_at, updated_at"
    )
    .single();

  return {
    data: data ? normalizarFornecedor(data as ErpPdvFornecedorRow) : null,
    error,
  };
}

export async function salvarErpPdvProduto(payload: ErpPdvProdutoPayload) {
  if (!payload.nome.trim()) {
    return {
      data: null,
      error: new Error("Informe o nome do produto."),
    };
  }

  if (toNumber(payload.precoVenda) < 0) {
    return {
      data: null,
      error: new Error("O preco de venda nao pode ser negativo."),
    };
  }

  if (toNumber(payload.estoqueAtual) < 0 || toNumber(payload.estoqueMinimo) < 0) {
    return {
      data: null,
      error: new Error("Estoque atual e estoque minimo nao podem ser negativos."),
    };
  }

  const produtoPayload = {
    empresa_id: payload.empresaId,
    categoria_id: payload.categoriaId || null,
    nome: payload.nome.trim(),
    codigo_barras: payload.codigoBarras.trim(),
    sku: payload.sku.trim(),
    marca: payload.marca.trim(),
    custo: payload.custo,
    preco_venda: payload.precoVenda,
    preco_atacado: payload.precoAtacado,
    preco_revenda: payload.precoRevenda,
    preco_personalizado: payload.precoPersonalizado,
    formacao_preco_tipo: payload.formacaoPrecoTipo,
    percentual_preco: payload.percentualPreco,
    unidade: payload.unidade.trim() || "un",
    localizacao: payload.localizacao.trim(),
    ncm: payload.ncm.trim(),
    observacoes: payload.observacoes.trim(),
    imagem_url: payload.imagemUrl.trim(),
    ativo: payload.ativo,
  };

  const query = payload.id
    ? supabase
        .from("erp_pdv_produtos")
        .update(productPayloadWithTimestamp(produtoPayload))
        .eq("id", payload.id)
        .eq("empresa_id", payload.empresaId)
    : supabase.from("erp_pdv_produtos").insert(produtoPayload);

  const { data: produtoData, error: produtoError } = await query
    .select("*")
    .single();

  if (produtoError || !produtoData) {
    return {
      data: null,
      error: produtoError,
    };
  }

  const produto = produtoData as ErpPdvProdutoRow;
  const { error: estoqueError } = await supabase
    .from("erp_pdv_estoques")
    .upsert(
      {
        empresa_id: payload.empresaId,
        produto_id: produto.id,
        quantidade_atual: Math.max(0, toNumber(payload.estoqueAtual)),
        estoque_minimo: Math.max(0, toNumber(payload.estoqueMinimo)),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "produto_id",
      }
    );

  if (estoqueError) {
    return {
      data: null,
      error: estoqueError,
    };
  }

  return {
    data: {
      ...normalizarProduto(produto),
      estoque_atual: Math.max(0, toNumber(payload.estoqueAtual)),
      estoque_minimo: Math.max(0, toNumber(payload.estoqueMinimo)),
    },
    error: null,
  };
}

export async function listarErpPdvMovimentacoes(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_movimentacoes")
    .select(
      `
        id,
        empresa_id,
        produto_id,
        tipo,
        quantidade,
        estoque_anterior,
        estoque_posterior,
        origem,
        motivo,
        observacao,
        usuario_responsavel,
        erp_pdv_usuario_id,
        created_at
      `
    )
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })
    .limit(300);

  return {
    data: ((data || []) as ErpPdvMovimentacaoRow[]).map(
      normalizarMovimentacao
    ),
    error,
  };
}

export async function listarErpPdvEntradas(empresaId: string) {
  const { data: entradasData, error: entradasError } = await supabase
    .from("erp_pdv_entradas")
    .select(
      "id, fornecedor_id, fornecedor_nome, numero_nota, chave_acesso, data_compra, observacoes, origem, xml_url, xml_storage_path, xml_resumo, total_produtos, total_descontos, total_frete, total_outras_despesas, total_entrada, created_at"
    )
    .eq("empresa_id", empresaId)
    .order("data_compra", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (entradasError) {
    return {
      data: [],
      error: entradasError,
    };
  }

  const entradasRows = (entradasData || []) as ErpPdvEntradaRow[];
  const entradaIds = entradasRows.map((entrada) => entrada.id);
  let itensRows: ErpPdvEntradaItemRow[] = [];

  if (entradaIds.length > 0) {
    const { data: itensData, error: itensError } = await supabase
      .from("erp_pdv_entrada_itens")
      .select(
        "id, entrada_id, produto_id, descricao, quantidade, custo_unitario, desconto, frete, outras_despesas, codigo_fornecedor, gtin, ncm, cfop, unidade, tributos, custo_total, estoque_anterior, estoque_posterior"
      )
      .eq("empresa_id", empresaId)
      .in("entrada_id", entradaIds);

    if (itensError) {
      return {
        data: [],
        error: itensError,
      };
    }

    itensRows = (itensData || []) as ErpPdvEntradaItemRow[];
  }

  const itensPorEntrada = new Map<string, ErpPdvEntradaItem[]>();
  itensRows.forEach((item) => {
    itensPorEntrada.set(item.entrada_id, [
      ...(itensPorEntrada.get(item.entrada_id) || []),
      normalizarEntradaItem(item),
    ]);
  });

  return {
    data: entradasRows.map((entrada) =>
      normalizarEntrada(entrada, itensPorEntrada.get(entrada.id) || [])
    ),
    error: null,
  };
}

export async function registrarErpPdvEntradaMercadorias(
  payload: ErpPdvEntradaMercadoriaPayload
) {
  const itens = payload.itens
    .map((item) => ({
      ...item,
      quantidade: toNumber(item.quantidade),
      custoUnitario: toNumber(item.custoUnitario),
      desconto: toNumber(item.desconto),
      frete: toNumber(item.frete),
      outrasDespesas: toNumber(item.outrasDespesas),
      codigoFornecedor: (item.codigoFornecedor || "").trim(),
      gtin: (item.gtin || "").trim(),
      ncm: (item.ncm || "").trim(),
      cfop: (item.cfop || "").trim(),
      unidade: (item.unidade || "").trim(),
      tributos: item.tributos || {},
    }))
    .filter((item) => item.produtoId && item.quantidade > 0);

  if (!payload.fornecedorId) {
    return {
      data: null,
      error: new Error("Selecione o fornecedor da entrada."),
    };
  }

  if (!payload.dataCompra) {
    return {
      data: null,
      error: new Error("Informe a data da compra."),
    };
  }

  if (!itens.length) {
    return {
      data: null,
      error: new Error("Adicione pelo menos um item na entrada."),
    };
  }

  const fornecedorResultado = await supabase
    .from("erp_pdv_fornecedores")
    .select("id, razao_social, nome_fantasia")
    .eq("empresa_id", payload.empresaId)
    .eq("id", payload.fornecedorId)
    .maybeSingle();

  if (fornecedorResultado.error || !fornecedorResultado.data) {
    return {
      data: null,
      error:
        fornecedorResultado.error ||
        new Error("Fornecedor nao encontrado para esta empresa."),
    };
  }

  const produtoIds = itens.map((item) => item.produtoId);
  const { data: produtosData, error: produtosError } = await supabase
    .from("erp_pdv_produtos")
    .select("id, nome, custo")
    .eq("empresa_id", payload.empresaId)
    .in("id", produtoIds);

  if (produtosError) {
    return {
      data: null,
      error: produtosError,
    };
  }

  const produtosPorId = new Map(
    ((produtosData || []) as Pick<ErpPdvProdutoRow, "id" | "nome" | "custo">[]).map(
      (produto) => [produto.id, produto]
    )
  );

  const { data: estoquesData, error: estoquesError } = await supabase
    .from("erp_pdv_estoques")
    .select("produto_id, quantidade_atual, estoque_minimo")
    .eq("empresa_id", payload.empresaId)
    .in("produto_id", produtoIds);

  if (estoquesError) {
    return {
      data: null,
      error: estoquesError,
    };
  }

  const estoquesPorProduto = new Map(
    ((estoquesData || []) as ErpPdvEstoqueRow[]).map((estoque) => [
      estoque.produto_id,
      estoque,
    ])
  );

  const totalProdutos = itens.reduce(
    (total, item) => total + item.quantidade * item.custoUnitario,
    0
  );
  const totalDescontos = itens.reduce((total, item) => total + item.desconto, 0);
  const totalFrete = itens.reduce((total, item) => total + item.frete, 0);
  const totalOutrasDespesas = itens.reduce(
    (total, item) => total + item.outrasDespesas,
    0
  );
  const totalEntrada =
    totalProdutos - totalDescontos + totalFrete + totalOutrasDespesas;
  const fornecedor = fornecedorResultado.data as {
    id: string;
    razao_social: string;
    nome_fantasia?: string;
  };
  const agora = new Date().toISOString();

  const { data: entradaData, error: entradaError } = await supabase
    .from("erp_pdv_entradas")
    .insert({
      empresa_id: payload.empresaId,
      fornecedor_id: fornecedor.id,
      fornecedor_nome: fornecedor.nome_fantasia || fornecedor.razao_social,
      numero_nota: payload.numeroNota.trim(),
      chave_acesso: (payload.chaveAcesso || "").trim(),
      data_compra: payload.dataCompra,
      observacoes: payload.observacoes.trim(),
      origem: payload.origem || "manual",
      xml_url: (payload.xmlUrl || "").trim(),
      xml_storage_path: (payload.xmlStoragePath || "").trim(),
      xml_resumo: payload.xmlResumo || {},
      total_produtos: totalProdutos,
      total_descontos: totalDescontos,
      total_frete: totalFrete,
      total_outras_despesas: totalOutrasDespesas,
      total_entrada: totalEntrada,
      updated_at: agora,
    })
    .select(
      "id, fornecedor_id, fornecedor_nome, numero_nota, chave_acesso, data_compra, observacoes, origem, xml_url, xml_storage_path, xml_resumo, total_produtos, total_descontos, total_frete, total_outras_despesas, total_entrada, created_at"
    )
    .single();

  if (entradaError || !entradaData) {
    return {
      data: null,
      error: entradaError,
    };
  }

  const entrada = entradaData as ErpPdvEntradaRow;
  const itensRegistrados: ErpPdvEntradaItem[] = [];
  const movimentacoes: ErpPdvMovimentacao[] = [];

  for (const item of itens) {
    const produto = produtosPorId.get(item.produtoId);
    if (!produto) {
      return {
        data: null,
        error: new Error("Produto da entrada nao encontrado."),
      };
    }

    const estoque = estoquesPorProduto.get(item.produtoId);
    const estoqueAnterior = toNumber(estoque?.quantidade_atual);
    const estoqueMinimo = toNumber(estoque?.estoque_minimo);
    const estoquePosterior = estoqueAnterior + item.quantidade;
    const custoTotal =
      item.quantidade * item.custoUnitario -
      item.desconto +
      item.frete +
      item.outrasDespesas;
    const custoMedio =
      estoquePosterior > 0
        ? (estoqueAnterior * toNumber(produto.custo) + custoTotal) /
          estoquePosterior
        : item.custoUnitario;

    const { data: itemData, error: itemError } = await supabase
      .from("erp_pdv_entrada_itens")
      .insert({
        empresa_id: payload.empresaId,
        entrada_id: entrada.id,
        produto_id: item.produtoId,
        descricao: produto.nome,
        quantidade: item.quantidade,
        custo_unitario: item.custoUnitario,
        desconto: item.desconto,
        frete: item.frete,
        outras_despesas: item.outrasDespesas,
        codigo_fornecedor: item.codigoFornecedor,
        gtin: item.gtin,
        ncm: item.ncm,
        cfop: item.cfop,
        unidade: item.unidade,
        tributos: item.tributos,
        custo_total: custoTotal,
        estoque_anterior: estoqueAnterior,
        estoque_posterior: estoquePosterior,
      })
      .select(
        "id, entrada_id, produto_id, descricao, quantidade, custo_unitario, desconto, frete, outras_despesas, codigo_fornecedor, gtin, ncm, cfop, unidade, tributos, custo_total, estoque_anterior, estoque_posterior"
      )
      .single();

    if (itemError || !itemData) {
      return {
        data: null,
        error: itemError,
      };
    }

    const { error: estoqueUpdateError } = await supabase
      .from("erp_pdv_estoques")
      .upsert(
        {
          empresa_id: payload.empresaId,
          produto_id: item.produtoId,
          quantidade_atual: estoquePosterior,
          estoque_minimo: estoqueMinimo,
          ultimo_custo: item.custoUnitario,
          custo_medio: custoMedio,
          updated_at: agora,
          ultima_movimentacao_em: agora,
        },
        {
          onConflict: "produto_id",
        }
      );

    if (estoqueUpdateError) {
      return {
        data: null,
        error: estoqueUpdateError,
      };
    }

    const { error: produtoUpdateError } = await supabase
      .from("erp_pdv_produtos")
      .update({
        custo: item.custoUnitario,
        updated_at: agora,
      })
      .eq("empresa_id", payload.empresaId)
      .eq("id", item.produtoId);

    if (produtoUpdateError) {
      return {
        data: null,
        error: produtoUpdateError,
      };
    }

    const { data: movimentacaoData, error: movimentacaoError } = await supabase
      .from("erp_pdv_movimentacoes")
      .insert({
        empresa_id: payload.empresaId,
        produto_id: item.produtoId,
        tipo: "entrada",
        quantidade: item.quantidade,
        estoque_anterior: estoqueAnterior,
        estoque_posterior: estoquePosterior,
        origem: "compra",
        motivo: payload.numeroNota.trim()
          ? `${payload.origem === "xml_nfe" ? "XML NF-e" : "Compra NF"} ${payload.numeroNota.trim()}`
          : "Entrada manual de mercadorias",
        observacao: payload.observacoes.trim(),
        usuario_responsavel: fornecedor.nome_fantasia || fornecedor.razao_social,
      })
      .select(
        "id, empresa_id, produto_id, tipo, quantidade, estoque_anterior, estoque_posterior, origem, motivo, observacao, usuario_responsavel, created_at"
      )
      .single();

    if (movimentacaoError || !movimentacaoData) {
      return {
        data: null,
        error: movimentacaoError,
      };
    }

    itensRegistrados.push(normalizarEntradaItem(itemData as ErpPdvEntradaItemRow));
    movimentacoes.push(
      normalizarMovimentacao(movimentacaoData as ErpPdvMovimentacaoRow)
    );
  }

  return {
    data: {
      entrada: normalizarEntrada(entrada, itensRegistrados),
      movimentacoes,
    },
    error: null,
  };
}

export async function buscarErpPdvCaixaAberto(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_caixas")
    .select(
      "id, empresa_id, status, operador, operador_usuario_id, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
    )
    .eq("empresa_id", empresaId)
    .eq("status", "aberto")
    .order("aberto_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    data: data ? normalizarCaixa(data as ErpPdvCaixaRow) : null,
    error,
  };
}

export async function abrirErpPdvCaixa(payload: {
  empresaId: string;
  operador: string;
  operadorUsuarioId?: string;
  saldoInicial: number;
}) {
  if (!payload.operador.trim()) {
    return {
      data: null,
      error: new Error("Informe o operador para abrir o caixa."),
    };
  }

  const caixaAberto = await buscarErpPdvCaixaAberto(payload.empresaId);
  if (caixaAberto.error) {
    return {
      data: null,
      error: caixaAberto.error,
    };
  }

  if (caixaAberto.data) {
    return {
      data: null,
      error: new Error("Ja existe um caixa aberto para esta empresa."),
    };
  }

  const agora = new Date().toISOString();
  const saldoInicial = toNumber(payload.saldoInicial);
  const { data, error } = await supabase
    .from("erp_pdv_caixas")
    .insert({
      empresa_id: payload.empresaId,
      status: "aberto",
      operador: payload.operador.trim(),
      operador_usuario_id: payload.operadorUsuarioId || null,
      aberto_em: agora,
      saldo_inicial: saldoInicial,
      saldo_final: saldoInicial,
      valor_informado: 0,
      diferenca: 0,
      updated_at: agora,
    })
    .select(
      "id, empresa_id, status, operador, operador_usuario_id, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
    )
    .single();

  return {
    data: data ? normalizarCaixa(data as ErpPdvCaixaRow) : null,
    error,
  };
}

export async function registrarErpPdvCaixaMovimentacao(payload: {
  empresaId: string;
  caixaId: string;
  tipo: ErpPdvCaixaMovimentacaoTipo;
  valor: number;
  operador: string;
  operadorUsuarioId?: string;
  observacao: string;
}) {
  const valor = toNumber(payload.valor);

  if (!payload.caixaId) {
    return {
      data: null,
      error: new Error("Abra um caixa antes de registrar movimentacoes."),
    };
  }

  if (valor <= 0) {
    return {
      data: null,
      error: new Error("Informe um valor maior que zero."),
    };
  }

  const { data, error } = await supabase
    .from("erp_pdv_caixa_movimentacoes")
    .insert({
      empresa_id: payload.empresaId,
      caixa_id: payload.caixaId,
      tipo: payload.tipo,
      valor,
      operador: payload.operador.trim(),
      operador_usuario_id: payload.operadorUsuarioId || null,
      observacao: payload.observacao.trim(),
    })
    .select("id, empresa_id, caixa_id, tipo, valor, operador, operador_usuario_id, observacao, created_at")
    .single();

  return {
    data: data
      ? normalizarCaixaMovimentacao(data as ErpPdvCaixaMovimentacaoRow)
      : null,
    error,
  };
}

export async function calcularErpPdvResumoCaixa(caixa: ErpPdvCaixa) {
  const { data: vendasData, error: vendasError } = await supabase
    .from("erp_pdv_vendas")
    .select("forma_pagamento, total, pagamento_complementar")
    .eq("empresa_id", caixa.empresa_id)
    .eq("caixa_id", caixa.id)
    .eq("status", "finalizada");

  if (vendasError) {
    return {
      data: null,
      error: vendasError,
    };
  }

  const { data: movimentacoesData, error: movimentacoesError } = await supabase
    .from("erp_pdv_caixa_movimentacoes")
    .select("tipo, valor")
    .eq("empresa_id", caixa.empresa_id)
    .eq("caixa_id", caixa.id);

  if (movimentacoesError) {
    return {
      data: null,
      error: movimentacoesError,
    };
  }

  const vendasPorFormaPagamento = (vendasData || []).reduce<
    Record<string, number>
  >((formas, venda) => {
    const forma = String(venda.forma_pagamento || "outros");
    const valorCaixa =
      forma === "vale_troca"
        ? toNumber(venda.pagamento_complementar)
        : toNumber(venda.total);

    return {
      ...formas,
      [forma]: (formas[forma] || 0) + valorCaixa,
    };
  }, {});
  const totalVendas = Object.values(vendasPorFormaPagamento).reduce(
    (total, valor) => total + valor,
    0
  );
  const suprimentos = (movimentacoesData || [])
    .filter((movimentacao) => movimentacao.tipo === "suprimento")
    .reduce((total, movimentacao) => total + toNumber(movimentacao.valor), 0);
  const sangrias = (movimentacoesData || [])
    .filter((movimentacao) => movimentacao.tipo === "sangria")
    .reduce((total, movimentacao) => total + toNumber(movimentacao.valor), 0);
  const totalEsperado =
    caixa.saldo_inicial + totalVendas + suprimentos - sangrias;
  const valorInformado =
    caixa.status === "aberto" ? totalEsperado : caixa.valor_informado;

  return {
    data: {
      caixa,
      vendasPorFormaPagamento,
      suprimentos,
      sangrias,
      totalVendas,
      totalEsperado,
      valorInformado,
      diferenca: valorInformado - totalEsperado,
    } as ErpPdvCaixaResumo,
    error: null,
  };
}

function adicionarAgrupamento(
  mapa: Map<string, ErpPdvRelatorioAgrupado>,
  chave: string,
  label: string,
  venda: ErpPdvRelatorioVenda,
  quantidadeItens = venda.quantidade_itens
) {
  const itemAtual =
    mapa.get(chave) || {
      chave,
      label,
      quantidadeVendas: 0,
      quantidadeItens: 0,
      faturamento: 0,
      lucroBruto: 0,
    };

  itemAtual.quantidadeVendas += 1;
  itemAtual.quantidadeItens += quantidadeItens;
  itemAtual.faturamento += venda.total;
  itemAtual.lucroBruto += venda.lucro_bruto;
  mapa.set(chave, itemAtual);
}

export async function gerarErpPdvRelatorioOperacional(
  empresaId: string,
  filtros: ErpPdvRelatorioFiltros
) {
  let vendasQuery = supabase
    .from("erp_pdv_vendas")
    .select(
      "id, numero, total, forma_pagamento, cliente_id, cliente_nome, operador, finalizada_em"
    )
    .eq("empresa_id", empresaId)
    .eq("status", "finalizada")
    .order("finalizada_em", { ascending: false })
    .limit(500);

  if (filtros.dataInicio) {
    vendasQuery = vendasQuery.gte(
      "finalizada_em",
      `${filtros.dataInicio}T00:00:00`
    );
  }

  if (filtros.dataFim) {
    vendasQuery = vendasQuery.lte(
      "finalizada_em",
      `${filtros.dataFim}T23:59:59`
    );
  }

  if (filtros.operador.trim()) {
    vendasQuery = vendasQuery.ilike("operador", `%${filtros.operador.trim()}%`);
  }

  if (filtros.clienteId && filtros.clienteId !== "todos") {
    if (filtros.clienteId === "sem_cliente") {
      vendasQuery = vendasQuery.is("cliente_id", null);
    } else {
      vendasQuery = vendasQuery.eq("cliente_id", filtros.clienteId);
    }
  }

  if (filtros.formaPagamento && filtros.formaPagamento !== "todos") {
    vendasQuery = vendasQuery.eq("forma_pagamento", filtros.formaPagamento);
  }

  const { data: vendasData, error: vendasError } = await vendasQuery;

  if (vendasError) {
    return {
      data: null,
      error: vendasError,
    };
  }

  const vendasRows = (vendasData || []) as ErpPdvVendaRow[];
  const vendaIds = vendasRows.map((venda) => venda.id);

  const { data: produtosData, error: produtosError } = await listarErpPdvProdutos(
    empresaId
  );

  if (produtosError) {
    return {
      data: null,
      error: produtosError,
    };
  }

  const produtosPorId = new Map(produtosData.map((produto) => [produto.id, produto]));

  let itensRows: ErpPdvVendaItemRow[] = [];

  if (vendaIds.length > 0) {
    const { data: itensData, error: itensError } = await supabase
      .from("erp_pdv_venda_itens")
      .select("id, venda_id, produto_id, descricao, quantidade, preco_unitario, total")
      .eq("empresa_id", empresaId)
      .in("venda_id", vendaIds);

    if (itensError) {
      return {
        data: null,
        error: itensError,
      };
    }

    itensRows = (itensData || []) as ErpPdvVendaItemRow[];
  }

  const itensPorVenda = new Map<string, ErpPdvRelatorioItem[]>();
  itensRows.forEach((item) => {
    const produto = item.produto_id
      ? produtosPorId.get(item.produto_id)
      : undefined;
    const quantidade = toNumber(item.quantidade);
    const total = toNumber(item.total);
    const custoUnitario = produto?.custo || 0;
    const itemNormalizado: ErpPdvRelatorioItem = {
      id: item.id,
      venda_id: item.venda_id,
      produto_id: item.produto_id || null,
      descricao: item.descricao || produto?.nome || "Produto",
      quantidade,
      preco_unitario: toNumber(item.preco_unitario),
      total,
      custo_unitario: custoUnitario,
      lucro_bruto: total - custoUnitario * quantidade,
    };

    itensPorVenda.set(item.venda_id, [
      ...(itensPorVenda.get(item.venda_id) || []),
      itemNormalizado,
    ]);
  });

  const vendas: ErpPdvRelatorioVenda[] = vendasRows.map((venda) => {
    const itens = itensPorVenda.get(venda.id) || [];
    const quantidadeItens = itens.reduce(
      (total, item) => total + item.quantidade,
      0
    );
    const lucroBruto = itens.reduce(
      (total, item) => total + item.lucro_bruto,
      0
    );

    return {
      id: venda.id,
      numero: toNumber(venda.numero),
      total: toNumber(venda.total),
      forma_pagamento: venda.forma_pagamento || "",
      cliente_id: venda.cliente_id || null,
      cliente_nome: venda.cliente_nome || "Consumidor nao identificado",
      operador: venda.operador || "",
      finalizada_em: venda.finalizada_em,
      itens,
      quantidade_itens: quantidadeItens,
      lucro_bruto: lucroBruto,
    };
  });

  const hoje = new Date().toISOString().slice(0, 10);
  const vendasHojeLista = vendas.filter((venda) =>
    venda.finalizada_em.startsWith(hoje)
  );
  const porOperador = new Map<string, ErpPdvRelatorioAgrupado>();
  const porProduto = new Map<string, ErpPdvRelatorioAgrupado>();
  const porFormaPagamento = new Map<string, ErpPdvRelatorioAgrupado>();

  vendas.forEach((venda) => {
    adicionarAgrupamento(
      porOperador,
      venda.operador || "sem_operador",
      venda.operador || "Sem operador",
      venda
    );
    adicionarAgrupamento(
      porFormaPagamento,
      venda.forma_pagamento || "sem_pagamento",
      venda.forma_pagamento || "Sem pagamento",
      venda
    );

    venda.itens.forEach((item) => {
      adicionarAgrupamento(
        porProduto,
        item.produto_id || item.descricao,
        item.descricao,
        {
          ...venda,
          total: item.total,
          lucro_bruto: item.lucro_bruto,
          quantidade_itens: item.quantidade,
        },
        item.quantidade
      );
    });
  });

  const faturamento = vendas.reduce((total, venda) => total + venda.total, 0);
  const lucroBruto = vendas.reduce(
    (total, venda) => total + venda.lucro_bruto,
    0
  );
  const quantidadeItens = vendas.reduce(
    (total, venda) => total + venda.quantidade_itens,
    0
  );
  const faturamentoHoje = vendasHojeLista.reduce(
    (total, venda) => total + venda.total,
    0
  );
  const lucroHoje = vendasHojeLista.reduce(
    (total, venda) => total + venda.lucro_bruto,
    0
  );

  return {
    data: {
      vendas,
      totalVendas: vendas.length,
      faturamento,
      lucroBruto,
      ticketMedio: vendas.length > 0 ? faturamento / vendas.length : 0,
      quantidadeItens,
      vendasHoje: vendasHojeLista.length,
      faturamentoHoje,
      lucroHoje,
      estoqueCritico: produtosData.filter(
        (produto) =>
          produto.ativo &&
          produto.estoque_minimo > 0 &&
          produto.estoque_atual <= produto.estoque_minimo
      ),
      porOperador: Array.from(porOperador.values()).sort(
        (a, b) => b.faturamento - a.faturamento
      ),
      porProduto: Array.from(porProduto.values()).sort(
        (a, b) => b.faturamento - a.faturamento
      ),
      maisVendidos: Array.from(porProduto.values())
        .sort((a, b) => b.quantidadeItens - a.quantidadeItens)
        .slice(0, 8),
      porFormaPagamento: Array.from(porFormaPagamento.values()).sort(
        (a, b) => b.faturamento - a.faturamento
      ),
    } as ErpPdvRelatorioResumo,
    error: null,
  };
}

export async function fecharErpPdvCaixa(payload: {
  empresaId: string;
  caixaId: string;
  valorInformado: number;
  observacao: string;
}) {
  const { data: caixaData, error: caixaError } = await supabase
    .from("erp_pdv_caixas")
    .select(
      "id, empresa_id, status, operador, operador_usuario_id, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
    )
    .eq("empresa_id", payload.empresaId)
    .eq("id", payload.caixaId)
    .single();

  if (caixaError || !caixaData) {
    return {
      data: null,
      error: caixaError,
    };
  }

  const caixa = normalizarCaixa(caixaData as ErpPdvCaixaRow);
  const resumoResultado = await calcularErpPdvResumoCaixa({
    ...caixa,
    valor_informado: toNumber(payload.valorInformado),
  });

  if (resumoResultado.error || !resumoResultado.data) {
    return {
      data: null,
      error: resumoResultado.error,
    };
  }

  const resumo = resumoResultado.data;
  const agora = new Date().toISOString();
  const { data, error } = await supabase
    .from("erp_pdv_caixas")
    .update({
      status: "fechado",
      fechado_em: agora,
      saldo_final: resumo.totalEsperado,
      valor_informado: toNumber(payload.valorInformado),
      diferenca: resumo.diferenca,
      observacao: payload.observacao.trim(),
      updated_at: agora,
    })
    .eq("empresa_id", payload.empresaId)
    .eq("id", payload.caixaId)
    .select(
      "id, empresa_id, status, operador, operador_usuario_id, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
    )
    .single();

  if (error || !data) {
    return {
      data: null,
      error,
    };
  }

  const caixaFechado = normalizarCaixa(data as ErpPdvCaixaRow);
  return {
    data: {
      ...resumo,
      caixa: caixaFechado,
      valorInformado: caixaFechado.valor_informado,
      diferenca: caixaFechado.diferenca,
    } as ErpPdvCaixaResumo,
    error: null,
  };
}

export async function registrarErpPdvMovimentacao(
  payload: ErpPdvMovimentacaoPayload
) {
  const quantidade = toNumber(payload.quantidade);

  if (quantidade <= 0) {
    return {
      data: null,
      error: new Error("Informe uma quantidade maior que zero."),
    };
  }

  const { data: estoqueData, error: estoqueError } = await supabase
    .from("erp_pdv_estoques")
    .select("produto_id, quantidade_atual, estoque_minimo")
    .eq("empresa_id", payload.empresaId)
    .eq("produto_id", payload.produtoId)
    .maybeSingle();

  if (estoqueError) {
    return {
      data: null,
      error: estoqueError,
    };
  }

  const estoqueAnterior = toNumber(
    (estoqueData as ErpPdvEstoqueRow | null)?.quantidade_atual
  );
  const estoqueMinimo = toNumber(
    (estoqueData as ErpPdvEstoqueRow | null)?.estoque_minimo
  );
  const estoquePosterior =
    payload.tipo === "entrada"
      ? estoqueAnterior + quantidade
      : payload.tipo === "saida"
      ? estoqueAnterior - quantidade
      : quantidade;

  if (estoquePosterior < 0) {
    return {
      data: null,
      error: new Error("A saida informada deixaria o estoque negativo."),
    };
  }

  const agora = new Date().toISOString();
  const { error: estoqueUpdateError } = await supabase
    .from("erp_pdv_estoques")
    .upsert(
      {
        empresa_id: payload.empresaId,
        produto_id: payload.produtoId,
        quantidade_atual: estoquePosterior,
        estoque_minimo: estoqueMinimo,
        updated_at: agora,
        ultima_movimentacao_em: agora,
      },
      {
        onConflict: "produto_id",
      }
    );

  if (estoqueUpdateError) {
    return {
      data: null,
      error: estoqueUpdateError,
    };
  }

  const { data: movimentacaoData, error: movimentacaoError } = await supabase
    .from("erp_pdv_movimentacoes")
    .insert({
      empresa_id: payload.empresaId,
      produto_id: payload.produtoId,
      tipo: payload.tipo,
      quantidade,
      estoque_anterior: estoqueAnterior,
      estoque_posterior: estoquePosterior,
      origem: "manual",
      motivo: payload.motivo.trim(),
      observacao: payload.observacao.trim(),
      usuario_responsavel: payload.usuarioResponsavel.trim(),
      erp_pdv_usuario_id: payload.usuarioId || null,
    })
    .select(
      `
        id,
        empresa_id,
        produto_id,
        tipo,
        quantidade,
        estoque_anterior,
        estoque_posterior,
        origem,
        motivo,
        observacao,
        usuario_responsavel,
        erp_pdv_usuario_id,
        created_at
      `
    )
    .single();

  if (movimentacaoError || !movimentacaoData) {
    return {
      data: null,
      error: movimentacaoError,
    };
  }

  return {
    data: normalizarMovimentacao(movimentacaoData as ErpPdvMovimentacaoRow),
    error: null,
  };
}

export async function buscarErpPdvVendasParaTroca(
  empresaId: string,
  filtros: {
    numero: string;
    cliente: string;
    documento: string;
    data: string;
    operador: string;
  }
) {
  let vendasQuery = supabase
    .from("erp_pdv_vendas")
    .select(
      "id, numero, total, forma_pagamento, cliente_id, cliente_nome, operador, vale_troca_id, vale_troca_valor_utilizado, pagamento_complementar, historico_operacional, finalizada_em"
    )
    .eq("empresa_id", empresaId)
    .eq("status", "finalizada")
    .order("finalizada_em", { ascending: false })
    .limit(50);

  if (filtros.numero.trim()) {
    vendasQuery = vendasQuery.eq("numero", filtros.numero.trim());
  }

  if (filtros.cliente.trim()) {
    vendasQuery = vendasQuery.ilike("cliente_nome", `%${filtros.cliente.trim()}%`);
  }

  if (filtros.data) {
    vendasQuery = vendasQuery
      .gte("finalizada_em", `${filtros.data}T00:00:00`)
      .lte("finalizada_em", `${filtros.data}T23:59:59`);
  }

  if (filtros.operador.trim()) {
    vendasQuery = vendasQuery.ilike("operador", `%${filtros.operador.trim()}%`);
  }

  const { data: vendasData, error: vendasError } = await vendasQuery;

  if (vendasError) {
    return {
      data: [],
      error: vendasError,
    };
  }

  let vendasRows = (vendasData || []) as ErpPdvVendaRow[];

  if (filtros.documento.trim()) {
    const documento = filtros.documento.trim();
    const clienteIds = vendasRows
      .map((venda) => venda.cliente_id)
      .filter((id): id is string => Boolean(id));

    if (clienteIds.length > 0) {
      const { data: clientesData, error: clientesError } = await supabase
        .from("erp_pdv_clientes")
        .select("id")
        .eq("empresa_id", empresaId)
        .in("id", clienteIds)
        .ilike("cpf_cnpj", `%${documento}%`);

      if (clientesError) {
        return {
          data: [],
          error: clientesError,
        };
      }

      const clientesEncontrados = new Set(
        (clientesData || []).map((cliente) => cliente.id)
      );
      vendasRows = vendasRows.filter((venda) =>
        venda.cliente_id ? clientesEncontrados.has(venda.cliente_id) : false
      );
    } else {
      vendasRows = [];
    }
  }

  const vendaIds = vendasRows.map((venda) => venda.id);
  let itensRows: ErpPdvVendaItemRow[] = [];

  if (vendaIds.length > 0) {
    const { data: itensData, error: itensError } = await supabase
      .from("erp_pdv_venda_itens")
      .select(
        "id, venda_id, produto_id, descricao, quantidade, quantidade_devolvida, preco_unitario, total"
      )
      .eq("empresa_id", empresaId)
      .in("venda_id", vendaIds);

    if (itensError) {
      return {
        data: [],
        error: itensError,
      };
    }

    itensRows = (itensData || []) as ErpPdvVendaItemRow[];
  }

  const itensPorVenda = new Map<string, ErpPdvVendaBuscaItem[]>();
  itensRows.forEach((item) => {
    const quantidade = toNumber(item.quantidade);
    const quantidadeDevolvida = toNumber(item.quantidade_devolvida);
    const itemNormalizado: ErpPdvVendaBuscaItem = {
      id: item.id,
      produto_id: item.produto_id || null,
      descricao: item.descricao,
      quantidade,
      quantidade_devolvida: quantidadeDevolvida,
      quantidade_disponivel: Math.max(0, quantidade - quantidadeDevolvida),
      preco_unitario: toNumber(item.preco_unitario),
      total: toNumber(item.total),
    };

    itensPorVenda.set(item.venda_id, [
      ...(itensPorVenda.get(item.venda_id) || []),
      itemNormalizado,
    ]);
  });

  return {
    data: vendasRows.map((venda) => ({
      id: venda.id,
      numero: toNumber(venda.numero),
      total: toNumber(venda.total),
      forma_pagamento: venda.forma_pagamento,
      cliente_id: venda.cliente_id || null,
      cliente_nome: venda.cliente_nome || "Consumidor nao identificado",
      operador: venda.operador || "",
      finalizada_em: venda.finalizada_em,
      historico_operacional: normalizarHistoricoOperacional(
        venda.historico_operacional
      ),
      itens: itensPorVenda.get(venda.id) || [],
    })) as ErpPdvVendaBusca[],
    error: null,
  };
}

export async function listarErpPdvValesTroca(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_vale_trocas")
    .select(
      "id, empresa_id, venda_origem_id, cliente_id, numero, cliente_nome, valor_original, saldo_restante, emitido_em, validade_em, status, observacao, historico, created_at, updated_at"
    )
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })
    .limit(100);

  return {
    data: ((data || []) as ErpPdvValeTrocaRow[]).map(normalizarValeTroca),
    error,
  };
}

export async function obterErpPdvResumoTrocas(empresaId: string) {
  const { data: devolucoesData, error: devolucoesError } = await supabase
    .from("erp_pdv_devolucoes")
    .select(
      "id, numero, venda_id, vale_troca_id, tipo, motivo, operador, operador_usuario_id, cliente_nome, valor_devolvido, created_at"
    )
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (devolucoesError) {
    return {
      data: null,
      error: devolucoesError,
    };
  }

  const valesResultado = await listarErpPdvValesTroca(empresaId);
  if (valesResultado.error) {
    return {
      data: null,
      error: valesResultado.error,
    };
  }

  const devolucoes = ((devolucoesData || []) as ErpPdvDevolucaoRow[]).map(
    normalizarDevolucao
  );
  const vales = valesResultado.data;

  return {
    data: {
      devolucoes,
      vales,
      totalDevolvido: devolucoes.reduce(
        (total, devolucao) => total + devolucao.valor_devolvido,
        0
      ),
      totalValesEmitidos: vales.reduce(
        (total, vale) => total + vale.valor_original,
        0
      ),
      totalValesEmAberto: vales
        .filter((vale) => vale.status === "ativo")
        .reduce((total, vale) => total + vale.saldo_restante, 0),
      totalValesUtilizados: vales.reduce(
        (total, vale) => total + (vale.valor_original - vale.saldo_restante),
        0
      ),
    } as ErpPdvTrocasResumo,
    error: null,
  };
}

export async function registrarErpPdvDevolucao(
  payload: ErpPdvRegistrarDevolucaoPayload
) {
  const itensSolicitados = payload.itens
    .map((item) => ({
      vendaItemId: item.vendaItemId,
      quantidade: toNumber(item.quantidade),
    }))
    .filter((item) => item.vendaItemId && item.quantidade > 0);

  if (!payload.vendaId) {
    return { data: null, error: new Error("Selecione uma venda.") };
  }

  if (!payload.motivo.trim()) {
    return { data: null, error: new Error("Informe o motivo da devolucao.") };
  }

  if (!itensSolicitados.length) {
    return { data: null, error: new Error("Selecione itens para devolver.") };
  }
  const { data: vendaData, error: vendaError } = await supabase
    .from("erp_pdv_vendas")
    .select(
      "id, numero, total, forma_pagamento, cliente_id, cliente_nome, operador, vale_troca_id, vale_troca_valor_utilizado, pagamento_complementar, historico_operacional, finalizada_em"
    )
    .eq("empresa_id", payload.empresaId)
    .eq("id", payload.vendaId)
    .eq("status", "finalizada")
    .single();

  if (vendaError || !vendaData) {
    return {
      data: null,
      error: vendaError || new Error("Venda nao encontrada."),
    };
  }

  const venda = vendaData as ErpPdvVendaRow;
  const vendaItemIds = itensSolicitados.map((item) => item.vendaItemId);
  const { data: itensData, error: itensError } = await supabase
    .from("erp_pdv_venda_itens")
    .select(
      "id, venda_id, produto_id, descricao, quantidade, quantidade_devolvida, preco_unitario, total"
    )
    .eq("empresa_id", payload.empresaId)
    .eq("venda_id", payload.vendaId)
    .in("id", vendaItemIds);

  if (itensError) {
    return { data: null, error: itensError };
  }

  const itensRows = (itensData || []) as ErpPdvVendaItemRow[];
  const itensPorId = new Map(itensRows.map((item) => [item.id, item]));
  const itensDevolvidos = itensSolicitados.map((solicitado) => {
    const item = itensPorId.get(solicitado.vendaItemId);
    if (!item) {
      throw new Error("Item da venda nao encontrado.");
    }

    const quantidadeOriginal = toNumber(item.quantidade);
    const quantidadeDevolvida = toNumber(item.quantidade_devolvida);
    const disponivel = quantidadeOriginal - quantidadeDevolvida;

    if (solicitado.quantidade > disponivel) {
      throw new Error(`Quantidade indisponivel para devolver ${item.descricao}.`);
    }

    return {
      item,
      quantidade: solicitado.quantidade,
      valor: solicitado.quantidade * toNumber(item.preco_unitario),
      quantidadeDevolvidaAtual: quantidadeDevolvida,
      quantidadeOriginal,
    };
  });

  const valorDevolvido = itensDevolvidos.reduce(
    (total, item) => total + item.valor,
    0
  );
  const tipo =
    itensDevolvidos.reduce((total, item) => total + item.quantidade, 0) ===
    itensRows.reduce((total, item) => total + toNumber(item.quantidade), 0)
      ? "total"
      : "parcial";
  const agora = new Date().toISOString();
  const validadeDias = Math.max(1, Math.min(365, toNumber(payload.validadeDias) || 30));
  const validade = new Date();
  validade.setDate(validade.getDate() + validadeDias);
  const validadeEm = validade.toISOString().slice(0, 10);
  const historicoVale: ErpPdvHistoricoOperacionalItem[] = [
    {
      data: agora,
      tipo: "emissao",
      descricao: `Vale-troca emitido pela devolucao da venda #${venda.numero}.`,
      valor: valorDevolvido,
    },
  ];

  const { data: valeData, error: valeError } = await supabase
    .from("erp_pdv_vale_trocas")
    .insert({
      empresa_id: payload.empresaId,
      venda_origem_id: payload.vendaId,
      cliente_id: venda.cliente_id || null,
      cliente_nome: venda.cliente_nome || "Consumidor nao identificado",
      valor_original: valorDevolvido,
      saldo_restante: valorDevolvido,
      emitido_em: agora,
      validade_em: validadeEm,
      status: "ativo",
      observacao: payload.motivo.trim(),
      historico: historicoVale,
      updated_at: agora,
    })
    .select(
      "id, empresa_id, venda_origem_id, cliente_id, numero, cliente_nome, valor_original, saldo_restante, emitido_em, validade_em, status, observacao, historico, created_at, updated_at"
    )
    .single();

  if (valeError || !valeData) {
    return { data: null, error: valeError };
  }

  const vale = normalizarValeTroca(valeData as ErpPdvValeTrocaRow);
  const { data: devolucaoData, error: devolucaoError } = await supabase
    .from("erp_pdv_devolucoes")
    .insert({
      empresa_id: payload.empresaId,
      venda_id: payload.vendaId,
      vale_troca_id: vale.id,
      tipo,
      motivo: payload.motivo.trim(),
      operador: payload.operador.trim(),
      operador_usuario_id: payload.operadorUsuarioId || null,
      cliente_nome: venda.cliente_nome || "Consumidor nao identificado",
      valor_devolvido: valorDevolvido,
    })
    .select(
      "id, numero, venda_id, vale_troca_id, tipo, motivo, operador, operador_usuario_id, cliente_nome, valor_devolvido, created_at"
    )
    .single();

  if (devolucaoError || !devolucaoData) {
    return { data: null, error: devolucaoError };
  }

  const devolucao = normalizarDevolucao(devolucaoData as ErpPdvDevolucaoRow);
  const movimentacoes: ErpPdvMovimentacao[] = [];

  await supabase.from("erp_pdv_vale_troca_movimentacoes").insert({
    empresa_id: payload.empresaId,
    vale_troca_id: vale.id,
    devolucao_id: devolucao.id,
    tipo: "emissao",
    valor: valorDevolvido,
    saldo_antes: 0,
    saldo_depois: valorDevolvido,
    observacao: payload.motivo.trim(),
  });

  for (const itemDevolvido of itensDevolvidos) {
    const item = itemDevolvido.item;
    await supabase.from("erp_pdv_devolucao_itens").insert({
      empresa_id: payload.empresaId,
      devolucao_id: devolucao.id,
      venda_item_id: item.id,
      produto_id: item.produto_id || null,
      descricao: item.descricao,
      quantidade: itemDevolvido.quantidade,
      preco_unitario: toNumber(item.preco_unitario),
      valor_total: itemDevolvido.valor,
    });

    await supabase
      .from("erp_pdv_venda_itens")
      .update({
        quantidade_devolvida:
          itemDevolvido.quantidadeDevolvidaAtual + itemDevolvido.quantidade,
      })
      .eq("empresa_id", payload.empresaId)
      .eq("id", item.id);

    if (!item.produto_id) continue;

    const { data: estoqueData, error: estoqueError } = await supabase
      .from("erp_pdv_estoques")
      .select("produto_id, quantidade_atual, estoque_minimo")
      .eq("empresa_id", payload.empresaId)
      .eq("produto_id", item.produto_id)
      .maybeSingle();

    if (estoqueError) return { data: null, error: estoqueError };

    const estoqueAnterior = toNumber(
      (estoqueData as ErpPdvEstoqueRow | null)?.quantidade_atual
    );
    const estoqueMinimo = toNumber(
      (estoqueData as ErpPdvEstoqueRow | null)?.estoque_minimo
    );
    const estoquePosterior = estoqueAnterior + itemDevolvido.quantidade;

    const { error: estoqueUpdateError } = await supabase
      .from("erp_pdv_estoques")
      .upsert(
        {
          empresa_id: payload.empresaId,
          produto_id: item.produto_id,
          quantidade_atual: estoquePosterior,
          estoque_minimo: estoqueMinimo,
          updated_at: agora,
          ultima_movimentacao_em: agora,
        },
        { onConflict: "produto_id" }
      );

    if (estoqueUpdateError) return { data: null, error: estoqueUpdateError };

    const { data: movimentacaoData, error: movimentacaoError } = await supabase
      .from("erp_pdv_movimentacoes")
      .insert({
        empresa_id: payload.empresaId,
        produto_id: item.produto_id,
        tipo: "entrada",
        quantidade: itemDevolvido.quantidade,
        estoque_anterior: estoqueAnterior,
        estoque_posterior: estoquePosterior,
        origem: "devolucao",
        motivo: `Devolucao venda #${venda.numero}`,
        observacao: payload.motivo.trim(),
        usuario_responsavel: payload.operador.trim(),
        erp_pdv_usuario_id: payload.operadorUsuarioId || null,
      })
      .select(
        "id, empresa_id, produto_id, tipo, quantidade, estoque_anterior, estoque_posterior, origem, motivo, observacao, usuario_responsavel, erp_pdv_usuario_id, created_at"
      )
      .single();

    if (movimentacaoError || !movimentacaoData) {
      return { data: null, error: movimentacaoError };
    }

    movimentacoes.push(
      normalizarMovimentacao(movimentacaoData as ErpPdvMovimentacaoRow)
    );
  }

  const historicoAtual = normalizarHistoricoOperacional(
    venda.historico_operacional
  );
  await supabase
    .from("erp_pdv_vendas")
    .update({
      historico_operacional: [
        {
          data: agora,
          tipo: "devolucao",
          descricao: `Devolucao ${tipo} registrada. Vale-troca #${vale.numero} emitido.`,
          valor: valorDevolvido,
        },
        ...historicoAtual,
      ],
      updated_at: agora,
    })
    .eq("empresa_id", payload.empresaId)
    .eq("id", payload.vendaId);

  return {
    data: {
      devolucao,
      vale,
      movimentacoes,
    },
    error: null,
  };
}

export async function finalizarErpPdvVenda(
  payload: ErpPdvFinalizarVendaPayload
) {
  const itens = payload.itens
    .map((item) => ({
      ...item,
      quantidade: toNumber(item.quantidade),
      precoUnitario: toNumber(item.precoUnitario),
    }))
    .filter((item) => item.produtoId && item.quantidade > 0);

  if (!itens.length) {
    return {
      data: null,
      error: new Error("Adicione pelo menos um item ao carrinho."),
    };
  }

  if (!payload.operador.trim()) {
    return {
      data: null,
      error: new Error("Informe o operador responsavel pela venda."),
    };
  }

  if (!payload.formaPagamento) {
    return {
      data: null,
      error: new Error("Selecione a forma de pagamento."),
    };
  }

  if (!payload.caixaId) {
    return {
      data: null,
      error: new Error("Abra um caixa antes de finalizar a venda."),
    };
  }

  const { data: caixaData, error: caixaError } = await supabase
    .from("erp_pdv_caixas")
    .select("id, status")
    .eq("empresa_id", payload.empresaId)
    .eq("id", payload.caixaId)
    .eq("status", "aberto")
    .maybeSingle();

  if (caixaError || !caixaData) {
    return {
      data: null,
      error:
        caixaError ||
        new Error("Abra um caixa antes de finalizar a venda."),
    };
  }

  const produtoIds = itens.map((item) => item.produtoId);
  const { data: estoqueData, error: estoqueError } = await supabase
    .from("erp_pdv_estoques")
    .select("produto_id, quantidade_atual, estoque_minimo")
    .eq("empresa_id", payload.empresaId)
    .in("produto_id", produtoIds);

  if (estoqueError) {
    return {
      data: null,
      error: estoqueError,
    };
  }

  const estoquesPorProduto = new Map(
    ((estoqueData || []) as ErpPdvEstoqueRow[]).map((estoque) => [
      estoque.produto_id,
      estoque,
    ])
  );

  for (const item of itens) {
    const estoqueAtual = toNumber(
      estoquesPorProduto.get(item.produtoId)?.quantidade_atual
    );

    if (item.quantidade > estoqueAtual) {
      return {
        data: null,
        error: new Error(
          `Estoque insuficiente para ${item.descricao || "produto"}.`
        ),
      };
    }
  }

  const subtotal = itens.reduce(
    (total, item) => total + item.quantidade * item.precoUnitario,
    0
  );
  const agora = new Date().toISOString();
  const operador = payload.operador.trim();
  let valeTroca: ErpPdvValeTroca | null = null;
  let valorValeUtilizado = 0;
  let pagamentoComplementar = subtotal;

  if (payload.valeTrocaId) {
    const { data: valeData, error: valeError } = await supabase
      .from("erp_pdv_vale_trocas")
      .select(
        "id, empresa_id, venda_origem_id, cliente_id, numero, cliente_nome, valor_original, saldo_restante, emitido_em, validade_em, status, observacao, historico, created_at, updated_at"
      )
      .eq("empresa_id", payload.empresaId)
      .eq("id", payload.valeTrocaId)
      .single();

    if (valeError || !valeData) {
      return {
        data: null,
        error: valeError || new Error("Vale-troca nao encontrado."),
      };
    }

    valeTroca = normalizarValeTroca(valeData as ErpPdvValeTrocaRow);

    if (valeTroca.status !== "ativo" || valeTroca.saldo_restante <= 0) {
      return {
        data: null,
        error: new Error("Vale-troca sem saldo disponivel."),
      };
    }

    if (valeTroca.validade_em < new Date().toISOString().slice(0, 10)) {
      return {
        data: null,
        error: new Error("Vale-troca vencido."),
      };
    }

    valorValeUtilizado = Math.min(subtotal, valeTroca.saldo_restante);
    pagamentoComplementar = Math.max(0, subtotal - valorValeUtilizado);
  }

  const pagamentosDetalhados = (payload.pagamentosDetalhados || [])
    .map((pagamento) => ({
      forma: pagamento.forma,
      label: pagamento.label,
      valor: toNumber(pagamento.valor),
      parcelas: pagamento.parcelas ? toNumber(pagamento.parcelas) : undefined,
    }))
    .filter((pagamento) => pagamento.valor > 0);
  const historicoPagamento = pagamentosDetalhados.length
    ? [
        {
          data: agora,
          tipo: "pagamento_profissional",
          descricao: pagamentosDetalhados
            .map((pagamento) =>
              `${pagamento.label}: ${pagamento.valor.toFixed(2)}${pagamento.parcelas ? ` (${pagamento.parcelas}x)` : ""}`
            )
            .join(" | "),
          pagamentos: pagamentosDetalhados,
          parcelasCredito: payload.parcelasCredito || null,
          valorRecebidoDinheiro: toNumber(payload.valorRecebidoDinheiro),
          troco: toNumber(payload.troco),
        },
      ]
    : [];
  const { data: vendaData, error: vendaError } = await supabase
    .from("erp_pdv_vendas")
    .insert({
      empresa_id: payload.empresaId,
      caixa_id: payload.caixaId,
      status: "finalizada",
      subtotal,
      desconto: 0,
      total: subtotal,
      forma_pagamento: payload.formaPagamento,
      vale_troca_id: valeTroca?.id || null,
      vale_troca_valor_utilizado: valorValeUtilizado,
      pagamento_complementar: pagamentoComplementar,
      cliente_id: payload.clienteId || null,
      cliente_nome: payload.clienteNome?.trim() || "Consumidor nao identificado",
      operador,
      operador_usuario_id: payload.operadorUsuarioId || null,
      observacao: [
        valeTroca
          ? `Vale-troca #${valeTroca.numero} utilizado. Complemento: ${pagamentoComplementar.toFixed(2)}`
          : "",
        historicoPagamento.length ? "Pagamento detalhado registrado." : "",
      ]
        .filter(Boolean)
        .join(" "),
      historico_operacional: [
        ...(valeTroca
          ? [
              {
                data: agora,
                tipo: "utilizacao_vale",
                descricao: `Vale-troca #${valeTroca.numero} utilizado na venda.`,
                valor: valorValeUtilizado,
              },
            ]
          : []),
        ...historicoPagamento,
      ],
      finalizada_em: agora,
      updated_at: agora,
    })
    .select(
      "id, numero, total, forma_pagamento, cliente_id, cliente_nome, operador, operador_usuario_id, vale_troca_id, vale_troca_valor_utilizado, pagamento_complementar, finalizada_em"
    )
    .single();

  if (vendaError || !vendaData) {
    return {
      data: null,
      error: vendaError,
    };
  }

  const venda = vendaData as ErpPdvVendaRow;

  if (valeTroca && valorValeUtilizado > 0) {
    const saldoAntes = valeTroca.saldo_restante;
    const saldoDepois = Math.max(0, saldoAntes - valorValeUtilizado);
    const historicoVale = [
      {
        data: agora,
        tipo: "utilizacao",
        descricao: `Vale utilizado na venda #${venda.numero}.`,
        valor: valorValeUtilizado,
      },
      ...valeTroca.historico,
    ];

    const { error: valeUpdateError } = await supabase
      .from("erp_pdv_vale_trocas")
      .update({
        saldo_restante: saldoDepois,
        status: saldoDepois > 0 ? "ativo" : "utilizado",
        historico: historicoVale,
        updated_at: agora,
      })
      .eq("empresa_id", payload.empresaId)
      .eq("id", valeTroca.id);

    if (valeUpdateError) {
      return { data: null, error: valeUpdateError };
    }

    const { error: valeMovError } = await supabase
      .from("erp_pdv_vale_troca_movimentacoes")
      .insert({
        empresa_id: payload.empresaId,
        vale_troca_id: valeTroca.id,
        venda_id: venda.id,
        tipo: "utilizacao",
        valor: valorValeUtilizado,
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        observacao: `Venda #${venda.numero}`,
      });

    if (valeMovError) {
      return { data: null, error: valeMovError };
    }
  }
  const itensPayload = itens.map((item) => ({
    empresa_id: payload.empresaId,
    venda_id: venda.id,
    produto_id: item.produtoId,
    descricao: item.descricao.trim(),
    quantidade: item.quantidade,
    preco_unitario: item.precoUnitario,
    desconto: 0,
    total: item.quantidade * item.precoUnitario,
  }));

  const { error: itensError } = await supabase
    .from("erp_pdv_venda_itens")
    .insert(itensPayload);

  if (itensError) {
    return {
      data: null,
      error: itensError,
    };
  }

  const movimentacoes: ErpPdvMovimentacao[] = [];

  for (const item of itens) {
    const estoqueAtual = estoquesPorProduto.get(item.produtoId);
    const estoqueAnterior = toNumber(estoqueAtual?.quantidade_atual);
    const estoqueMinimo = toNumber(estoqueAtual?.estoque_minimo);
    const estoquePosterior = estoqueAnterior - item.quantidade;

    const { error: estoqueUpdateError } = await supabase
      .from("erp_pdv_estoques")
      .upsert(
        {
          empresa_id: payload.empresaId,
          produto_id: item.produtoId,
          quantidade_atual: estoquePosterior,
          estoque_minimo: estoqueMinimo,
          updated_at: agora,
          ultima_movimentacao_em: agora,
        },
        {
          onConflict: "produto_id",
        }
      );

    if (estoqueUpdateError) {
      return {
        data: null,
        error: estoqueUpdateError,
      };
    }

    const { data: movimentacaoData, error: movimentacaoError } = await supabase
      .from("erp_pdv_movimentacoes")
      .insert({
        empresa_id: payload.empresaId,
        produto_id: item.produtoId,
        tipo: "venda",
        quantidade: item.quantidade,
        estoque_anterior: estoqueAnterior,
        estoque_posterior: estoquePosterior,
        origem: "venda",
        motivo: `Venda PDV #${venda.numero}`,
        observacao: item.descricao.trim(),
        usuario_responsavel: operador,
        erp_pdv_usuario_id: payload.operadorUsuarioId || null,
      })
      .select(
        `
          id,
          empresa_id,
          produto_id,
          tipo,
          quantidade,
          estoque_anterior,
          estoque_posterior,
          origem,
          motivo,
          observacao,
          usuario_responsavel,
          erp_pdv_usuario_id,
          created_at
        `
      )
      .single();

    if (movimentacaoError || !movimentacaoData) {
      return {
        data: null,
        error: movimentacaoError,
      };
    }

    movimentacoes.push(
      normalizarMovimentacao(movimentacaoData as ErpPdvMovimentacaoRow)
    );
  }

  return {
    data: {
      id: venda.id,
      numero: toNumber(venda.numero),
      total: toNumber(venda.total),
      forma_pagamento: venda.forma_pagamento,
      cliente_id: venda.cliente_id || null,
      cliente_nome: venda.cliente_nome || "Consumidor nao identificado",
      operador: venda.operador || operador,
      vale_troca_id: venda.vale_troca_id || null,
      vale_troca_valor_utilizado: toNumber(venda.vale_troca_valor_utilizado),
      pagamento_complementar: toNumber(venda.pagamento_complementar),
      finalizada_em: venda.finalizada_em,
      movimentacoes,
    } as ErpPdvVendaFinalizada,
    error: null,
  };
}

function productPayloadWithTimestamp<T extends Record<string, unknown>>(
  payload: T
) {
  return {
    ...payload,
    updated_at: new Date().toISOString(),
  };
}
