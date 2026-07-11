const BRASIL_API_BASE_URL = "https://brasilapi.com.br/api";
const RECEITA_WS_BASE_URL = "https://www.receitaws.com.br/v1";

export type BrasilApiCnpj = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: string;
};

export type BrasilApiCep = {
  cep: string;
  erro?: boolean;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  endereco: string;
};

function limparDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function montarEndereco(partes: Array<string | null | undefined>) {
  return partes.filter(Boolean).join(" - ");
}

async function buscarJsonBrasilApi<T>(endpoint: string): Promise<T> {
  const resposta = await fetch(`${BRASIL_API_BASE_URL}${endpoint}`);

  if (!resposta.ok) {
    throw new Error("Nao foi possivel consultar os dados agora.");
  }

  return resposta.json() as Promise<T>;
}

async function buscarJsonReceitaWs<T>(endpoint: string): Promise<T> {
  const resposta = await fetch(`${RECEITA_WS_BASE_URL}${endpoint}`);

  if (!resposta.ok) {
    throw new Error("Nao foi possivel consultar os dados agora.");
  }

  return resposta.json() as Promise<T>;
}

function normalizarCnpjBrasilApi(dados: Record<string, unknown>, cnpj: string) {
  const logradouro = String(dados.logradouro || "");
  const numero = String(dados.numero || "");
  const complemento = String(dados.complemento || "");
  const bairro = String(dados.bairro || "");
  const municipio = String(dados.municipio || "");
  const uf = String(dados.uf || "");
  const cep = String(dados.cep || "");

  return {
    cnpj,
    razaoSocial: String(dados.razao_social || ""),
    nomeFantasia: String(dados.nome_fantasia || ""),
    inscricaoEstadual: "",
    telefone: String(dados.ddd_telefone_1 || dados.ddd_telefone_2 || ""),
    email: String(dados.email || ""),
    cep,
    endereco: montarEndereco([
      [logradouro, numero].filter(Boolean).join(", "),
      complemento,
      bairro,
      [municipio, uf].filter(Boolean).join(" - "),
      cep,
    ]),
  };
}

function normalizarCnpjReceitaWs(dados: Record<string, unknown>, cnpj: string) {
  const status = String(dados.status || "");

  if (status && status.toUpperCase() !== "OK") {
    throw new Error(String(dados.message || "CNPJ nao encontrado."));
  }

  const logradouro = String(dados.logradouro || "");
  const numero = String(dados.numero || "");
  const complemento = String(dados.complemento || "");
  const bairro = String(dados.bairro || "");
  const municipio = String(dados.municipio || "");
  const uf = String(dados.uf || "");
  const cep = limparDigitos(String(dados.cep || ""));

  return {
    cnpj,
    razaoSocial: String(dados.nome || ""),
    nomeFantasia: String(dados.fantasia || ""),
    inscricaoEstadual: "",
    telefone: String(dados.telefone || ""),
    email: String(dados.email || ""),
    cep,
    endereco: montarEndereco([
      [logradouro, numero].filter(Boolean).join(", "),
      complemento,
      bairro,
      [municipio, uf].filter(Boolean).join(" - "),
      cep,
    ]),
  };
}

export async function buscarCnpjBrasilApi(cnpj: string): Promise<BrasilApiCnpj> {
  const cnpjNumerico = limparDigitos(cnpj);

  if (cnpjNumerico.length !== 14) {
    throw new Error("Informe um CNPJ com 14 digitos.");
  }

  try {
    const dados = await buscarJsonBrasilApi<Record<string, unknown>>(
      `/cnpj/v1/${cnpjNumerico}`
    );

    return normalizarCnpjBrasilApi(dados, cnpjNumerico);
  } catch {
    const dados = await buscarJsonReceitaWs<Record<string, unknown>>(
      `/cnpj/${cnpjNumerico}`
    );

    return normalizarCnpjReceitaWs(dados, cnpjNumerico);
  }
}

export async function buscarCepBrasilApi(cep: string): Promise<BrasilApiCep> {
  const cepNumerico = limparDigitos(cep);

  if (cepNumerico.length !== 8) {
    throw new Error("Informe um CEP com 8 digitos.");
  }

  const dados = await buscarJsonBrasilApi<Record<string, unknown>>(
    `/cep/v2/${cepNumerico}`
  );
  const rua = String(dados.street || "");
  const bairro = String(dados.neighborhood || "");
  const cidade = String(dados.city || "");
  const estado = String(dados.state || "");

  return {
    cep: cepNumerico,
    rua,
    bairro,
    cidade,
    estado,
    endereco: montarEndereco([
      rua,
      bairro,
      [cidade, estado].filter(Boolean).join(" - "),
      cepNumerico,
    ]),
  };
}
