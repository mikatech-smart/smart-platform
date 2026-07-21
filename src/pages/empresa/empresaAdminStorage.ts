export type EmpresaColaborador = {
  id: string;
  empresaId: string;
  nome: string;
  cpf: string;
  telefone: string;
  celular: string;
  email: string;
  cargo: string;
  dataAdmissao: string;
  ativo: boolean;
  observacoes: string;
};

export type EmpresaUsuario = {
  id: string;
  empresaId: string;
  colaboradorId: string;
  login: string;
  perfil: "administrador" | "caixa" | "estoque";
  ativo: boolean;
  senhaHash: string;
};

export type EmpresaCliente = {
  id: string;
  empresaId: string;
  tipo: "pf" | "pj";
  nome: string;
  nomeFantasia: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  responsavel: string;
  telefone: string;
  celular: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  ativo: boolean;
  limiteCredito: string;
  observacoes: string;
};

export type EmpresaFornecedor = {
  id: string;
  empresaId: string;
  tipo: "pf" | "pj";
  nome: string;
  nomeFantasia: string;
  cpf: string;
  rg: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  responsavelComercial: string;
  telefone: string;
  celular: string;
  email: string;
  site: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;
  prazoPagamento: string;
  formaPagamento: string;
  limiteCredito: string;
  ativo: boolean;
  observacoes: string;
};

export type EmpresaPedidoCompraItem = {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
};

export type EmpresaPedidoCompra = {
  id: string;
  empresaId: string;
  fornecedorId: string;
  fornecedorNome: string;
  data: string;
  previsaoEntrega: string;
  numero: string;
  status: "aberto" | "aprovado" | "cancelado" | "finalizado";
  observacoes: string;
  itens: EmpresaPedidoCompraItem[];
  frete: number;
  outrasDespesas: number;
  descontoGeral: number;
};

export type EmpresaEntradaMercadoria = {
  id: string;
  empresaId: string;
  pedidoId: string;
  fornecedorNome: string;
  data: string;
  observacoes: string;
  itens: EmpresaPedidoCompraItem[];
};

export type EmpresaProdutoDetalhes = {
  produtoId: string;
  nomeReduzido: string;
  markup: string;
  comissao: string;
  descricaoComplementar: string;
  subcategoria: string;
  fabricante: string;
  estoqueMaximo: string;
  controlaEstoque: boolean;
  precoPromocional: string;
  custoMedio: string;
  margemLucro: string;
  cest: string;
  cfopPadrao: string;
  origem: string;
  codigoFiscal: string;
  fornecedorPrincipalId: string;
  peso: string;
  altura: string;
  largura: string;
  comprimento: string;
};

export type EmpresaProdutoCatalogo = {
  marcas: string[];
  fabricantes: string[];
  codigoAutomatico: boolean;
};

const colaboradoresKey = (empresaId: string) => `mikaon:empresa:${empresaId}:colaboradores`;
const usuariosKey = (empresaId: string) => `mikaon:empresa:${empresaId}:usuarios`;
const clientesKey = (empresaId: string) => `mikaon:empresa:${empresaId}:clientes`;
const fornecedoresKey = (empresaId: string) => `mikaon:empresa:${empresaId}:fornecedores`;
const pedidosCompraKey = (empresaId: string) => `mikaon:empresa:${empresaId}:pedidos-compra`;
const entradasMercadoriasKey = (empresaId: string) => `mikaon:empresa:${empresaId}:entradas-mercadorias`;
const produtoDetalhesKey = (empresaId: string) => `mikaon:empresa:${empresaId}:produto-detalhes`;
const produtoCatalogoKey = (empresaId: string) => `mikaon:empresa:${empresaId}:produto-catalogo`;

function ler<T>(key: string): T[] {
  try {
    const valor = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(valor) ? valor : [];
  } catch {
    return [];
  }
}

export function listarColaboradores(empresaId: string) {
  return ler<EmpresaColaborador>(colaboradoresKey(empresaId));
}

export function salvarColaboradores(empresaId: string, itens: EmpresaColaborador[]) {
  localStorage.setItem(colaboradoresKey(empresaId), JSON.stringify(itens));
}

export function listarUsuarios(empresaId: string) {
  return ler<EmpresaUsuario>(usuariosKey(empresaId));
}

export function salvarUsuarios(empresaId: string, itens: EmpresaUsuario[]) {
  localStorage.setItem(usuariosKey(empresaId), JSON.stringify(itens));
}

export function listarClientes(empresaId: string) {
  return ler<EmpresaCliente>(clientesKey(empresaId));
}

export function salvarClientes(empresaId: string, itens: EmpresaCliente[]) {
  localStorage.setItem(clientesKey(empresaId), JSON.stringify(itens));
}

export function listarFornecedores(empresaId: string) {
  return ler<EmpresaFornecedor>(fornecedoresKey(empresaId));
}

export function salvarFornecedores(empresaId: string, itens: EmpresaFornecedor[]) {
  localStorage.setItem(fornecedoresKey(empresaId), JSON.stringify(itens));
}

export function listarPedidosCompra(empresaId: string) {
  return ler<EmpresaPedidoCompra>(pedidosCompraKey(empresaId));
}

export function salvarPedidosCompra(empresaId: string, itens: EmpresaPedidoCompra[]) {
  localStorage.setItem(pedidosCompraKey(empresaId), JSON.stringify(itens));
}

export function listarEntradasMercadorias(empresaId: string) {
  return ler<EmpresaEntradaMercadoria>(entradasMercadoriasKey(empresaId));
}

export function salvarEntradasMercadorias(empresaId: string, itens: EmpresaEntradaMercadoria[]) {
  localStorage.setItem(entradasMercadoriasKey(empresaId), JSON.stringify(itens));
}

export function listarProdutoDetalhes(empresaId: string) {
  return ler<EmpresaProdutoDetalhes>(produtoDetalhesKey(empresaId));
}

export function salvarProdutoDetalhes(empresaId: string, itens: EmpresaProdutoDetalhes[]) {
  localStorage.setItem(produtoDetalhesKey(empresaId), JSON.stringify(itens));
}

export function carregarProdutoCatalogo(empresaId: string): EmpresaProdutoCatalogo {
  try {
    const valor = JSON.parse(localStorage.getItem(produtoCatalogoKey(empresaId)) || "null") as Partial<EmpresaProdutoCatalogo> | null;
    return {
      marcas: Array.isArray(valor?.marcas) ? valor!.marcas.filter(Boolean) : [],
      fabricantes: Array.isArray(valor?.fabricantes) ? valor!.fabricantes.filter(Boolean) : [],
      codigoAutomatico: valor?.codigoAutomatico === true,
    };
  } catch {
    return { marcas: [], fabricantes: [], codigoAutomatico: false };
  }
}

export function salvarProdutoCatalogo(empresaId: string, catalogo: EmpresaProdutoCatalogo) {
  localStorage.setItem(produtoCatalogoKey(empresaId), JSON.stringify(catalogo));
}

export async function hashSenha(senha: string) {
  const dados = new TextEncoder().encode(senha);
  const digest = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
