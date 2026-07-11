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
  unidade: string;
  localizacao: string;
  ncm: string;
  observacoes: string;
  imagem_url: string;
  ativo: boolean;
  estoque_atual: number;
  estoque_minimo: number;
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
  unidade: string;
  localizacao: string;
  ncm: string;
  observacoes: string;
  imagemUrl: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
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
};

export type ErpPdvFormaPagamento =
  | "dinheiro"
  | "pix"
  | "debito"
  | "credito"
  | "outros";

export type ErpPdvVendaItemPayload = {
  produtoId: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
};

export type ErpPdvFinalizarVendaPayload = {
  empresaId: string;
  caixaId: string;
  operador: string;
  formaPagamento: ErpPdvFormaPagamento;
  itens: ErpPdvVendaItemPayload[];
};

export type ErpPdvVendaFinalizada = {
  id: string;
  numero: number;
  total: number;
  forma_pagamento: string;
  operador: string;
  finalizada_em: string;
  movimentacoes: ErpPdvMovimentacao[];
};

export type ErpPdvCaixaStatus = "aberto" | "fechado";

export type ErpPdvCaixa = {
  id: string;
  empresa_id: string;
  status: ErpPdvCaixaStatus;
  operador: string;
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
  unidade: string;
  localizacao?: string;
  ncm?: string;
  observacoes?: string;
  imagem_url?: string;
  ativo: boolean;
};

type ErpPdvEstoqueRow = {
  produto_id: string;
  quantidade_atual: number | string;
  estoque_minimo: number | string;
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
  created_at: string;
};

type ErpPdvVendaRow = {
  id: string;
  numero: number | string;
  total: number | string;
  forma_pagamento: string;
  operador?: string;
  finalizada_em: string;
};

type ErpPdvCaixaRow = {
  id: string;
  empresa_id: string;
  status: ErpPdvCaixaStatus;
  operador?: string;
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
  observacao?: string;
  created_at: string;
};

function toNumber(valor: number | string | null | undefined) {
  const numero =
    typeof valor === "number" ? valor : Number(String(valor || "0"));

  return Number.isFinite(numero) ? numero : 0;
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

function normalizarCaixa(row: ErpPdvCaixaRow): ErpPdvCaixa {
  return {
    id: row.id,
    empresa_id: row.empresa_id,
    status: row.status,
    operador: row.operador || "",
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
    observacao: row.observacao || "",
    created_at: row.created_at,
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

export async function salvarErpPdvProduto(payload: ErpPdvProdutoPayload) {
  const produtoPayload = {
    empresa_id: payload.empresaId,
    categoria_id: payload.categoriaId || null,
    nome: payload.nome.trim(),
    codigo_barras: payload.codigoBarras.trim(),
    sku: payload.sku.trim(),
    marca: payload.marca.trim(),
    custo: payload.custo,
    preco_venda: payload.precoVenda,
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
        quantidade_atual: payload.estoqueAtual,
        estoque_minimo: payload.estoqueMinimo,
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
      estoque_atual: payload.estoqueAtual,
      estoque_minimo: payload.estoqueMinimo,
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

export async function buscarErpPdvCaixaAberto(empresaId: string) {
  const { data, error } = await supabase
    .from("erp_pdv_caixas")
    .select(
      "id, empresa_id, status, operador, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
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
      aberto_em: agora,
      saldo_inicial: saldoInicial,
      saldo_final: saldoInicial,
      valor_informado: 0,
      diferenca: 0,
      updated_at: agora,
    })
    .select(
      "id, empresa_id, status, operador, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
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
      observacao: payload.observacao.trim(),
    })
    .select("id, empresa_id, caixa_id, tipo, valor, operador, observacao, created_at")
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
    .select("forma_pagamento, total")
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
    return {
      ...formas,
      [forma]: (formas[forma] || 0) + toNumber(venda.total),
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

export async function fecharErpPdvCaixa(payload: {
  empresaId: string;
  caixaId: string;
  valorInformado: number;
  observacao: string;
}) {
  const { data: caixaData, error: caixaError } = await supabase
    .from("erp_pdv_caixas")
    .select(
      "id, empresa_id, status, operador, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
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
      "id, empresa_id, status, operador, aberto_em, fechado_em, saldo_inicial, saldo_final, valor_informado, diferenca, observacao"
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
      operador,
      observacao: "",
      finalizada_em: agora,
      updated_at: agora,
    })
    .select("id, numero, total, forma_pagamento, operador, finalizada_em")
    .single();

  if (vendaError || !vendaData) {
    return {
      data: null,
      error: vendaError,
    };
  }

  const venda = vendaData as ErpPdvVendaRow;
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
      operador: venda.operador || operador,
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
