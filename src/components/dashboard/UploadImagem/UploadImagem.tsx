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
  const [nome, setNome] = useState("");
  const [peso, setPeso] = useState("");
  const [tipo, setTipo] = useState("");
  const [resolucao, setResolucao] = useState("");
  const [qualidade, setQualidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  const preview = imagemRemovida
    ? ""
    : previewLocal ?? imagem ?? "";

  function abrirExplorador() {
    inputRef.current?.click();
  }

  function removerImagem() {
    setPreviewLocal("");
    setImagemRemovida(true);
    setNome("");
    setPeso("");
    setTipo("");
    setResolucao("");
    setQualidade("");
  }

  async function selecionarArquivo(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    const url = URL.createObjectURL(arquivo);

    setPreviewLocal(url);
    setImagemRemovida(false);

    setNome(arquivo.name);

    setPeso(
      `${(arquivo.size / 1024).toFixed(1)} KB`
    );

    setTipo(arquivo.type);

    const img = new Image();

    img.onload = () => {
      setResolucao(
        `${img.width} x ${img.height}px`
      );

      if (img.width >= 1000) {
        setQualidade("🟢 Excelente");
      } else if (img.width >= 600) {
        setQualidade("🟡 Boa");
      } else {
        setQualidade("🔴 Baixa");
      }
    };

    img.src = url;

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

        setPreviewLocal(urlPublica);
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
    <div className="border rounded-2xl p-6 bg-white shadow-sm">

      <h3 className="font-semibold text-lg mb-4">
        {titulo}
      </h3>

      <div className="border-2 border-dashed rounded-xl p-4">

        {preview ? (
          <img
            src={preview}
            alt={titulo}
            className="w-full h-52 object-contain"
          />
        ) : (
          <div className="h-52 flex items-center justify-center text-gray-400">
            Nenhuma imagem
          </div>
        )}

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={selecionarArquivo}
      />

      <div className="mt-5 space-y-1 text-sm">

        <div>
          <strong>Arquivo:</strong> {nome || "-"}
        </div>

        <div>
          <strong>Tipo:</strong> {tipo || "-"}
        </div>

        <div>
          <strong>Tamanho:</strong> {peso || "-"}
        </div>

        <div>
          <strong>Resolução:</strong> {resolucao || "-"}
        </div>

        <div>
          <strong>Qualidade:</strong> {qualidade || "-"}
        </div>

      </div>

      <div className="flex gap-3 mt-6">

        <button
          type="button"
          onClick={abrirExplorador}
          disabled={enviando}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3"
        >
          {enviando ? "Enviando..." : "Selecionar imagem"}
        </button>

        <button
          type="button"
          onClick={removerImagem}
          className="px-5 rounded-xl border"
        >
          Remover
        </button>

      </div>

    </div>
  );
}
