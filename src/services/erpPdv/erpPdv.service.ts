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

function productPayloadWithTimestamp<T extends Record<string, unknown>>(
  payload: T
) {
  return {
    ...payload,
    updated_at: new Date().toISOString(),
  };
}
