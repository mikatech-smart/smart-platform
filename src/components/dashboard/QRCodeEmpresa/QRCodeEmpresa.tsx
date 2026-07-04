import { useMemo, useState } from "react";
import { Copy, ExternalLink, QrCode, Radio } from "lucide-react";

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

  const publicUrl = useMemo(() => {
    const baseUrl =
      import.meta.env.VITE_PUBLIC_APP_URL ||
      window.location.origin;

    return `${baseUrl.replace(/\/$/, "")}/${slug}`;
  }, [slug]);

  async function copiarLink(tipo: "link" | "nfc") {
    await navigator.clipboard.writeText(publicUrl);

    setCopiado(tipo);

    window.setTimeout(() => {
      setCopiado(null);
    }, 2500);
  }

  return (
    <section className="qr-code-empresa">
      <div className="qr-code-empresa__header">
        <p className="qr-code-empresa__eyebrow">
          Compartilhamento
        </p>

        <h3>Centro de Compartilhamento</h3>

        <p className="qr-code-empresa__subtitle">
          Utilize este link em QR Codes, Tags NFC, redes sociais e materiais impressos.
        </p>
      </div>

      <div className="qr-code-empresa__grid">
        <section className="qr-code-empresa__card qr-code-empresa__card--main">
          <div>
            <h4>Pagina Publica</h4>
            <p>Compartilhe este link com seus clientes.</p>
          </div>

          <div className="qr-code-empresa__url-box">
            <span>URL publica</span>
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
              Abrir Pagina
            </a>

            <button
              type="button"
              onClick={() => copiarLink("link")}
              className="qr-code-empresa__button"
            >
              <Copy size={18} />
              Copiar Link
            </button>
          </div>

          {copiado === "link" && (
            <p className="qr-code-empresa__feedback">
              Link copiado com sucesso
            </p>
          )}
        </section>

        <section className="qr-code-empresa__card">
          <div className="qr-code-empresa__section-title">
            <Radio size={20} />
            <h4>NFC</h4>
          </div>

          <p>
            Grave este mesmo link em uma Tag NFC para abrir automaticamente a página da empresa.
          </p>

          <button
            type="button"
            onClick={() => copiarLink("nfc")}
            className="qr-code-empresa__button qr-code-empresa__button--wide"
          >
            <Copy size={18} />
            Copiar Link para NFC
          </button>

          {copiado === "nfc" && (
            <p className="qr-code-empresa__feedback">
              Link copiado com sucesso
            </p>
          )}
        </section>

        <section className="qr-code-empresa__card qr-code-empresa__qr-card">
          <div className="qr-code-empresa__section-title">
            <QrCode size={20} />
            <h4>QR Code</h4>
          </div>

          <div className="qr-code-empresa__placeholder">
            <div className="qr-code-empresa__placeholder-box">
              <QrCode size={42} />
              <strong>QR CODE</strong>
              <span>(em breve)</span>
            </div>

            <p>
              Na próxima atualização será possível gerar e baixar o QR Code automaticamente.
            </p>

            {nomeEmpresa && (
              <small>{nomeEmpresa}</small>
            )}
          </div>
        </section>

        <div className="qr-code-empresa__future">
          <span>
            Preparado para QR Code, Download PNG, Download SVG, NFC, compartilhar e analytics.
          </span>
        </div>
      </div>
    </section>
  );
}
