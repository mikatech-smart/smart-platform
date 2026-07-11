import { supabase } from "../../lib/supabase";

const BUCKET_EMPRESAS = "empresas";
const PUBLIC_STORAGE_SEGMENT = `/storage/v1/object/public/${BUCKET_EMPRESAS}/`;
const LIMITE_LISTAGEM_STORAGE = 1000;
const PROFUNDIDADE_MAXIMA_STORAGE = 6;

export type StorageResumoEmpresa = {
  empresa: string;
  arquivos: number;
  bytes: number;
};

export type StorageResumo = {
  bucket: string;
  arquivos: number;
  bytes: number;
  porEmpresa: StorageResumoEmpresa[];
  atualizadoEm: string;
  avisoPlanoGratuito: string;
};

export async function uploadImagem(
  caminho: string,
  arquivo: File
) {
  const { error } = await supabase.storage
    .from(BUCKET_EMPRESAS)
    .upload(caminho, arquivo, {
      upsert: true,
    });

  if (error) throw error;

  return obterUrlPublica(caminho);
}

export function obterUrlPublica(caminho: string) {
  const { data } = supabase.storage
    .from(BUCKET_EMPRESAS)
    .getPublicUrl(caminho);

  return data.publicUrl;
}

export function normalizarCaminhoStorage(valor: string) {
  const caminhoOuUrl = valor.trim();

  if (!caminhoOuUrl) return "";

  const removerParametros = (texto: string) => texto.split("?")[0];

  try {
    const url = new URL(caminhoOuUrl);
    const indiceSegmento = url.pathname.indexOf(PUBLIC_STORAGE_SEGMENT);

    if (indiceSegmento >= 0) {
      return decodeURIComponent(
        removerParametros(
          url.pathname.slice(indiceSegmento + PUBLIC_STORAGE_SEGMENT.length)
        )
      );
    }
  } catch {
    return decodeURIComponent(removerParametros(caminhoOuUrl));
  }

  return decodeURIComponent(removerParametros(caminhoOuUrl));
}

export async function excluirImagem(caminhoOuUrl: string) {
  const caminho = normalizarCaminhoStorage(caminhoOuUrl);

  if (!caminho) {
    return { data: [], error: null };
  }

  const resultado = await supabase.storage
    .from(BUCKET_EMPRESAS)
    .remove([caminho]);

  if (resultado.error) return resultado;

  const partes = caminho.split("/").filter(Boolean);
  const nomeArquivo = partes.pop();
  const pasta = partes.join("/");

  if (!nomeArquivo) return resultado;

  const { data, error } = await supabase.storage
    .from(BUCKET_EMPRESAS)
    .list(pasta, {
      limit: LIMITE_LISTAGEM_STORAGE,
      search: nomeArquivo,
    });

  if (error) return { data: resultado.data, error };

  const arquivoAindaExiste = (data || []).some(
    (item) => item.name === nomeArquivo && isArquivoStorage(item)
  );

  if (arquivoAindaExiste) {
    return {
      data: resultado.data,
      error: new Error(
        `O arquivo "${caminho}" nao foi removido do Storage.`
      ),
    };
  }

  return resultado;
}

function obterEmpresaDoCaminho(caminho: string) {
  const partes = caminho.split("/").filter(Boolean);

  if (partes.length === 0) return "raiz";

  const prefixosComEmpresa = new Set([
    "landing-page",
    "cardapio",
    "catalogo",
    "agendamento",
    "wifi",
    "fidelidade",
    "empresas",
  ]);

  if (prefixosComEmpresa.has(partes[0]) && partes[1]) {
    return partes[1];
  }

  return partes[0];
}

function isArquivoStorage(item: { id?: string | null; metadata?: unknown }) {
  if (item.id) return true;

  if (!item.metadata || typeof item.metadata !== "object") {
    return false;
  }

  const metadata = item.metadata as Record<string, unknown>;
  return Boolean(metadata.mimetype || metadata.size);
}

async function listarArquivosStorage(
  pasta = "",
  profundidade = 0
): Promise<Array<{ caminho: string; bytes: number }>> {
  const { data, error } = await supabase.storage
    .from(BUCKET_EMPRESAS)
    .list(pasta, {
      limit: LIMITE_LISTAGEM_STORAGE,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) throw error;

  const arquivos: Array<{ caminho: string; bytes: number }> = [];

  for (const item of data || []) {
    const caminho = pasta ? `${pasta}/${item.name}` : item.name;

    if (isArquivoStorage(item)) {
      const metadata =
        item.metadata && typeof item.metadata === "object"
          ? (item.metadata as Record<string, unknown>)
          : {};
      const bytes =
        typeof metadata.size === "number" && Number.isFinite(metadata.size)
          ? metadata.size
          : 0;

      arquivos.push({ caminho, bytes });
      continue;
    }

    if (profundidade < PROFUNDIDADE_MAXIMA_STORAGE) {
      const arquivosFilhos = await listarArquivosStorage(
        caminho,
        profundidade + 1
      );
      arquivos.push(...arquivosFilhos);
    }
  }

  return arquivos;
}

export async function obterResumoStorageEmpresas(): Promise<StorageResumo> {
  const arquivos = await listarArquivosStorage();
  const porEmpresaMap = new Map<string, StorageResumoEmpresa>();

  for (const arquivo of arquivos) {
    const empresa = obterEmpresaDoCaminho(arquivo.caminho);
    const resumoAtual =
      porEmpresaMap.get(empresa) || {
        empresa,
        arquivos: 0,
        bytes: 0,
      };

    resumoAtual.arquivos += 1;
    resumoAtual.bytes += arquivo.bytes;
    porEmpresaMap.set(empresa, resumoAtual);
  }

  const porEmpresa = [...porEmpresaMap.values()].sort(
    (empresaA, empresaB) => empresaB.bytes - empresaA.bytes
  );

  return {
    bucket: BUCKET_EMPRESAS,
    arquivos: arquivos.length,
    bytes: arquivos.reduce((total, arquivo) => total + arquivo.bytes, 0),
    porEmpresa,
    atualizadoEm: new Date().toISOString(),
    avisoPlanoGratuito:
      "Resumo estimado a partir dos arquivos acessiveis no bucket. Limites e quota total do plano gratuito devem ser conferidos no painel do Supabase.",
  };
}
