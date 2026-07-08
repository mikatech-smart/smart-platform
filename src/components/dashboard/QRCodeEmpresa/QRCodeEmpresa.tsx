import { useMemo, useState } from "react";
import { Copy, Download, ExternalLink, QrCode, Radio } from "lucide-react";

import "./QRCodeEmpresa.css";

interface QRCodeEmpresaProps {
  slug: string;
  nomeEmpresa?: string;
}

export default function QRCodeEmpresa({
  slug,
  nomeEmpresa,
}: QRCodeEmpresaProps) {
  const [copiado, setCopiado] = useState<"link" | "nfc" | null>(null);
  const [baixando, setBaixando] = useState(false);

  const publicUrl = useMemo(() => {
    return `https://smart.mikatech.com.br/${slug}`;
  }, [slug]);

  const qrCodeUrl = useMemo(() => {
    const parametros = new URLSearchParams({
      size: "720x720",
      margin: "24",
      data: publicUrl,
    });

    return `https://api.qrserver.com/v1/create-qr-code/?${parametros.toString()}`;
  }, [publicUrl]);

  const nomeArquivo = useMemo(() => {
    const nome = (nomeEmpresa || slug || "empresa")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `qrcode-${nome || "empresa"}.png`;
  }, [nomeEmpresa, slug]);

  async function copiarLink(tipo: "link" | "nfc") {
    await navigator.clipboard.writeText(publicUrl);

    setCopiado(tipo);

    window.setTimeout(() => {
      setCopiado(null);
    }, 2500);
  }

  async function baixarQRCode() {
    try {
      setBaixando(true);

      const resposta = await fetch(qrCodeUrl);

      if (!resposta.ok) {
        throw new Error("Não foi possível gerar o arquivo PNG do QR Code.");
      }

      const blob = await resposta.blob();
      const urlTemporaria = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = urlTemporaria;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(urlTemporaria);
    } catch (error) {
      console.error("Erro ao baixar QR Code:", error);
      window.open(qrCodeUrl, "_blank", "noreferrer");
    } finally {
      setBaixando(false);
    }
  }

  if (!slug) {
    return (
      <section className="qr-code-empresa">
        <div className="qr-code-empresa__header">
          <p className="qr-code-empresa__eyebrow">
            NFC e QR Code
          </p>

          <h3>NFC e QR Code</h3>

          <p className="qr-code-empresa__subtitle">
            Cadastre o slug da empresa para gerar o QR Code.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="qr-code-empresa">
      <div className="qr-code-empresa__header">
        <p className="qr-code-empresa__eyebrow">
          NFC e QR Code
        </p>

        <h3>NFC e QR Code</h3>

        <p className="qr-code-empresa__subtitle">
          Gere o acesso da página pública para NFC, displays, placas, balcão e materiais impressos.
        </p>
      </div>

      <div className="qr-code-empresa__grid">
        <section className="qr-code-empresa__card qr-code-empresa__card--main">
          <div>
            <h4>Link público da empresa</h4>
            <p>Compartilhe este link com seus clientes.</p>
          </div>

          <div className="qr-code-empresa__url-box">
            <span>URL pública</span>
            <strong>{publicUrl}</strong>
          </div>

          <div className="qr-code-empresa__actions">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="qr-code-empresa__button qr-code-empresa__button--primary"
            >
              <ExternalLink size={18} />
              Abrir Página
            </a>

            <button
              type="button"
              onClick={() => copiarLink("link")}
              className="qr-code-empresa__button"
            >
              <Copy size={18} />
              Copiar link
            </button>
          </div>

          {copiado === "link" && (
            <p className="qr-code-empresa__feedback">
              Link copiado com sucesso.
            </p>
          )}
        </section>

        <section className="qr-code-empresa__card">
          <div className="qr-code-empresa__section-title">
            <Radio size={20} />
            <h4>NFC</h4>
          </div>

          <p>
            Grave este link na tag NFC para direcionar o cliente à página pública.
          </p>

          <button
            type="button"
            onClick={() => copiarLink("nfc")}
            className="qr-code-empresa__button qr-code-empresa__button--wide"
          >
            <Copy size={18} />
            Copiar link para NFC
          </button>

          {copiado === "nfc" && (
            <p className="qr-code-empresa__feedback">
              Link copiado com sucesso.
            </p>
          )}
        </section>

        <section className="qr-code-empresa__card qr-code-empresa__qr-card">
          <div className="qr-code-empresa__section-title">
            <QrCode size={20} />
            <h4>QR Code</h4>
          </div>

          <div className="qr-code-empresa__qr-content">
            <div className="qr-code-empresa__qr-box">
              <img
                src={qrCodeUrl}
                alt={`QR Code da página pública de ${nomeEmpresa || "empresa"}`}
              />
            </div>

            <p>
              Use o QR Code no display, placa, balcão ou material impresso.
            </p>

            {nomeEmpresa && (
              <small>{nomeEmpresa}</small>
            )}

            <button
              type="button"
              onClick={baixarQRCode}
              disabled={baixando}
              className="qr-code-empresa__button qr-code-empresa__button--wide"
            >
              <Download size={18} />
              {baixando ? "Baixando..." : "Baixar QR Code"}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
