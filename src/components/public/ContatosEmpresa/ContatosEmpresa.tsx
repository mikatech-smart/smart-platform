import { useState } from "react";

import "./ContatosEmpresa.css";

interface ContatosEmpresaProps {
  whatsapp?: string | null;
  telefone?: string | null;
  instagram?: string | null;
  site?: string | null;
  endereco?: string | null;
  googleReviewUrl?: string | null;
  wifiNome?: string | null;
  wifiSenha?: string | null;
  pixNome?: string | null;
  pixChave?: string | null;
}

function criarLinkWhatsApp(telefone: string) {
  const numero = telefone.replace(/\D/g, "");

  if (!numero) return "";

  return `https://wa.me/${numero}`;
}

function criarLinkExterno(url: string) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

function criarLinkInstagram(instagram: string) {
  if (!instagram) return "";

  if (instagram.startsWith("http://") || instagram.startsWith("https://")) {
    return instagram;
  }

  const usuario = instagram.replace("@", "");

  return `https://instagram.com/${usuario}`;
}

function normalizarValor(valor?: string | null) {
  return valor?.trim() || "";
}

export default function ContatosEmpresa({
  whatsapp,
  telefone,
  instagram,
  site,
  endereco,
  googleReviewUrl,
  wifiNome,
  wifiSenha,
  pixNome,
  pixChave,
}: ContatosEmpresaProps) {
  const [wifiAberto, setWifiAberto] = useState(false);
  const [pixAberto, setPixAberto] = useState(false);
  const [feedback, setFeedback] = useState("");

  const whatsappLink = criarLinkWhatsApp(whatsapp || telefone || "");
  const instagramLink = criarLinkInstagram(instagram || "");
  const siteLink = criarLinkExterno(site || "");
  const googleReviewLink = criarLinkExterno(googleReviewUrl || "");
  const nomeWifi = normalizarValor(wifiNome);
  const senhaWifi = normalizarValor(wifiSenha);
  const nomePix = normalizarValor(pixNome);
  const chavePix = normalizarValor(pixChave);
  const temWifi = Boolean(nomeWifi || senhaWifi);
  const temPix = Boolean(chavePix);

  async function copiarTexto(texto: string) {
    if (!texto) return;

    await navigator.clipboard.writeText(texto);
    setFeedback("Copiado com sucesso");
  }

  return (
    <>
      <section className="public-empresa-section">
        <div className="public-empresa-actions">
          {temWifi && (
            <button
              className="public-empresa-action public-empresa-action--light"
              type="button"
              onClick={() => setWifiAberto((aberto) => !aberto)}
              aria-expanded={wifiAberto}
            >
              Wi-Fi
            </button>
          )}

          {whatsappLink && (
            <a
              className="public-empresa-action public-empresa-action--primary"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          )}

          {temPix && (
            <button
              className="public-empresa-action public-empresa-action--light"
              type="button"
              onClick={() => setPixAberto((aberto) => !aberto)}
              aria-expanded={pixAberto}
            >
              PIX
            </button>
          )}

          {googleReviewLink && (
            <a
              className="public-empresa-action public-empresa-action--google"
              href={googleReviewLink}
              target="_blank"
              rel="noreferrer"
            >
              Avaliar no Google
            </a>
          )}

          {instagramLink && (
            <a
              className="public-empresa-action"
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          )}

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            TikTok
          </button>

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            YouTube
          </button>

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            Kwai
          </button>

          {siteLink && (
            <a
              className="public-empresa-action public-empresa-action--light"
              href={siteLink}
              target="_blank"
              rel="noreferrer"
            >
              Site
            </a>
          )}
        </div>

        {wifiAberto && temWifi && (
          <div className="public-empresa-detail-card">
            <span>Wi-Fi</span>
            {nomeWifi && (
              <p>
                <strong>Nome da rede:</strong> {nomeWifi}
              </p>
            )}
            {senhaWifi && (
              <>
                <p>
                  <strong>Senha:</strong> {senhaWifi}
                </p>
                <button
                  className="public-empresa-copy-button"
                  type="button"
                  onClick={() => copiarTexto(senhaWifi)}
                >
                  Copiar senha do Wi-Fi
                </button>
              </>
            )}
          </div>
        )}

        {pixAberto && temPix && (
          <div className="public-empresa-detail-card">
            <span>PIX</span>
            {nomePix && (
              <p>
                <strong>Nome do recebedor:</strong> {nomePix}
              </p>
            )}
            <p>
              <strong>Chave PIX:</strong> {chavePix}
            </p>
            <button
              className="public-empresa-copy-button"
              type="button"
              onClick={() => copiarTexto(chavePix)}
            >
              Copiar chave PIX
            </button>
          </div>
        )}

        {feedback && (
          <p className="public-empresa-copy-feedback">{feedback}</p>
        )}
      </section>

      {endereco && (
        <section className="public-empresa-section public-empresa-info-card">
          <span>Endereco</span>
          <p>
            {endereco}
          </p>
        </section>
      )}
    </>
  );
}
