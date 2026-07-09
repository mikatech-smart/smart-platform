import { useRef, useState } from "react";

import { uploadImagem } from "../../../services/storage/storage.service";
import type { UploadImagemProps } from "./UploadImagem.types";
import "./UploadImagem.css";

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
  tipoArquivo = "imagem",
  accept,
  formatosPermitidos,
  pasta,
  onUpload,
  onSelecionar,
}: UploadImagemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const [imagemRemovida, setImagemRemovida] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const isAudio = tipoArquivo === "audio";
  const isBanner = !isAudio && titulo.toLowerCase().includes("banner");
  const placeholder = isBanner
    ? {
        tipo: "BANNER",
        tamanho: "1920 x 600 px",
        formato: "PNG - JPG - WEBP",
        detalhe: "Imagem horizontal.",
      }
    : isAudio
    ? {
        tipo: "AUDIO",
        tamanho: "MP3 - WAV - OGG - M4A",
        formato: formatosPermitidos || "Arquivo de audio",
        detalhe: "Player HTML5 na Landing Page.",
      }
    : {
        tipo: "LOGO",
        tamanho: "800 x 800 px",
        formato: "PNG com fundo transparente",
        detalhe: "Formato quadrado.",
      };
  const orientacao = isAudio
    ? "Formatos permitidos: MP3, WAV, OGG e M4A."
    : isBanner
    ? "Use imagem horizontal para melhor resultado."
    : "Recomendado: PNG com fundo transparente.";
  const previewClassName = isAudio
    ? "upload-imagem__audio-preview"
    : isBanner
    ? "upload-imagem__preview upload-imagem__preview--banner"
    : "upload-imagem__preview upload-imagem__preview--logo";
  const previewWrapperClassName = isAudio
    ? "upload-imagem__preview-box upload-imagem__preview-box--audio"
    : isBanner
    ? "upload-imagem__preview-box upload-imagem__preview-box--banner"
    : "upload-imagem__preview-box upload-imagem__preview-box--logo";
  const contentClassName = isAudio
    ? "upload-imagem__content upload-imagem__content--audio"
    : isBanner
    ? "upload-imagem__content upload-imagem__content--banner"
    : "upload-imagem__content upload-imagem__content--logo";

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

    const extensaoArquivo = arquivo.name.split(".").pop()?.toLowerCase() || "";

    if (
      isAudio &&
      !["mp3", "wav", "ogg", "m4a"].includes(extensaoArquivo)
    ) {
      alert("Formato invalido. Envie um arquivo MP3, WAV, OGG ou M4A.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    const url = URL.createObjectURL(arquivo);

    setPreviewLocal(url);
    setImagemRemovida(false);

    if (onUpload && pasta) {
      try {
        setEnviando(true);

        const extensao = arquivo.name.split(".").pop();

        const caminho = `${pasta}/${Date.now()}.${extensao}`;
        const urlPublica = await uploadImagem(caminho, arquivo);
        const urlPreview = adicionarVersaoImagem(urlPublica);

        setPreviewLocal(urlPreview);
        setImagemRemovida(false);

        await onUpload(urlPublica);
      } catch (error) {
        const mensagemErro = obterMensagemErroSupabase(error);

        console.error(
          "Erro ao enviar arquivo para o Supabase Storage:",
          error
        );

        alert(
          `Erro ao enviar arquivo para o Supabase Storage: ${mensagemErro}. Verifique se o bucket empresas existe no projeto Supabase correto.`
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
    <div className="upload-imagem border rounded-2xl p-3 bg-white shadow-sm">
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
        accept={accept || "image/png,image/jpeg,image/webp"}
        className="hidden"
        onChange={selecionarArquivo}
      />

      <div className={contentClassName}>
        <div className={previewWrapperClassName}>
          {preview && isAudio ? (
            <audio
              src={preview}
              controls
              className={previewClassName}
            >
              Seu navegador nao suporta audio HTML5.
            </audio>
          ) : preview ? (
            <img
              src={preview}
              alt={titulo}
              className={previewClassName}
            />
          ) : (
            <div className="upload-imagem__placeholder" aria-label={`Placeholder de ${titulo}`}>
              <strong>{placeholder.tipo}</strong>
              <span>{placeholder.tamanho}</span>
              <small>{placeholder.formato}</small>
              <em>{placeholder.detalhe}</em>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="upload-imagem__actions">
            <button
              type="button"
              onClick={abrirExplorador}
              disabled={enviando}
              className="upload-imagem__action-button upload-imagem__action-button--primary bg-green-600 hover:bg-green-700 text-white rounded-xl py-2"
            >
              {enviando ? "Enviando..." : "Alterar"}
            </button>

            <button
              type="button"
              onClick={removerImagem}
              disabled={enviando}
              className="upload-imagem__action-button px-4 rounded-xl border"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
