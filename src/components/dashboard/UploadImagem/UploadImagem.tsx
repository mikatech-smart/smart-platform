import { useRef, useState } from "react";

import { uploadImagem } from "../../../services/storage/storage.service";
import type { UploadImagemProps } from "./UploadImagem.types";

function obterMensagemErroSupabase(error: unknown) {
  if (error && typeof error === "object") {
    const supabaseError = error as {
      error?: string;
      message?: string;
      statusCode?: string | number;
    };

    return [
      supabaseError.message,
      supabaseError.error,
      supabaseError.statusCode
        ? `status ${supabaseError.statusCode}`
        : "",
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return String(error);
}

function adicionarVersaoImagem(url: string) {
  if (!url) return url;

  const separador = url.includes("?") ? "&" : "?";

  return `${url}${separador}v=${Date.now()}`;
}

export default function UploadImagem({
  titulo,
  imagem,
  pasta,
  onUpload,
  onSelecionar,
}: UploadImagemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const [imagemRemovida, setImagemRemovida] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const isBanner = titulo.toLowerCase().includes("banner");
  const orientacao = isBanner
    ? "Use imagem horizontal para melhor resultado."
    : "Recomendado: PNG com fundo transparente.";
  const previewClassName = isBanner
    ? "w-40 h-16 object-contain"
    : "w-24 h-24 object-contain";
  const previewWrapperClassName = isBanner
    ? "w-44 min-h-20"
    : "w-28 min-h-28";

  const preview = imagemRemovida
    ? ""
    : previewLocal ?? imagem ?? "";

  function abrirExplorador() {
    inputRef.current?.click();
  }

  async function removerImagem() {
    setPreviewLocal("");
    setImagemRemovida(true);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (!onUpload) return;

    try {
      setEnviando(true);
      await onUpload("");
    } catch (error) {
      const mensagemErro = obterMensagemErroSupabase(error);

      console.error("Erro ao remover imagem:", error);
      alert(`Erro ao remover imagem: ${mensagemErro}`);
    } finally {
      setEnviando(false);
    }
  }

  async function selecionarArquivo(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    const url = URL.createObjectURL(arquivo);

    setPreviewLocal(url);
    setImagemRemovida(false);

    if (onUpload && pasta) {
      try {
        setEnviando(true);

        const extensao = arquivo.name
          .split(".")
          .pop();

        const caminho = `${pasta}/${Date.now()}.${extensao}`;
        const urlPublica = await uploadImagem(
          caminho,
          arquivo
        );
        const urlPreview = adicionarVersaoImagem(urlPublica);

        setPreviewLocal(urlPreview);
        setImagemRemovida(false);

        await onUpload(urlPublica);
      } catch (error) {
        const mensagemErro = obterMensagemErroSupabase(error);

        console.error(
          "Erro ao enviar imagem para o Supabase Storage:",
          error
        );

        alert(
          `Erro ao enviar imagem para o Supabase Storage: ${mensagemErro}. Verifique se o bucket empresas existe no projeto Supabase correto.`
        );
      } finally {
        setEnviando(false);
      }

      return;
    }

    if (onSelecionar) {
      onSelecionar(arquivo);
    }
  }

  return (
    <div className="border rounded-2xl p-3 bg-white shadow-sm">
      <div className="mb-2">
        <h3 className="font-semibold text-base">
          {titulo}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {orientacao}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={selecionarArquivo}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className={`border-2 border-dashed rounded-xl p-2 bg-slate-50 flex items-center justify-center shrink-0 ${previewWrapperClassName}`}>
          {preview ? (
            <img
              src={preview}
              alt={titulo}
              className={previewClassName}
            />
          ) : (
            <div className="text-center text-xs text-gray-400">
              Nenhuma imagem
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={abrirExplorador}
              disabled={enviando}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2"
            >
              {enviando ? "Enviando..." : "Alterar"}
            </button>

            <button
              type="button"
              onClick={removerImagem}
              disabled={enviando}
              className="px-4 rounded-xl border"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
