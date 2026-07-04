import { type ReactNode, useState } from "react";
import { Globe, MapPin, Star, Wifi } from "lucide-react";

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

function IconeWhatsApp() {
  return (
    <span className="public-empresa-brand-icon" aria-hidden="true">
      W
    </span>
  );
}

function IconeInstagram() {
  return (
    <span className="public-empresa-brand-icon" aria-hidden="true">
      I
    </span>
  );
}

function IconeTikTok() {
  return (
    <span className="public-empresa-brand-icon" aria-hidden="true">
      T
    </span>
  );
}

function IconeYouTube() {
  return (
    <span className="public-empresa-brand-icon" aria-hidden="true">
      Y
    </span>
  );
}

function IconeKwai() {
  return (
    <svg
      className="public-empresa-action-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8.2 6.1a3 3 0 1 1 5.6 1.5h2.1a3.2 3.2 0 0 1 3.2 3.2v4.6a3.2 3.2 0 0 1-3.2 3.2H7.7a3.2 3.2 0 0 1-3.2-3.2v-4.6a3.2 3.2 0 0 1 3.2-3.2h.9a3 3 0 0 1-.4-1.5Zm3 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-3.1 4.1a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm6.9 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ConteudoAcao({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <>
      <span className="public-empresa-action-icon-wrap">{icon}</span>
      <span>{label}</span>
    </>
  );
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
              <ConteudoAcao icon={<Wifi size={22} />} label="Wi-Fi" />
            </button>
          )}

          {whatsappLink && (
            <a
              className="public-empresa-action public-empresa-action--primary"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<IconeWhatsApp />} label="WhatsApp" />
            </a>
          )}

          {temPix && (
            <button
              className="public-empresa-action public-empresa-action--light"
              type="button"
              onClick={() => setPixAberto((aberto) => !aberto)}
              aria-expanded={pixAberto}
            >
              <ConteudoAcao icon={<span>PIX</span>} label="PIX" />
            </button>
          )}

          {googleReviewLink && (
            <a
              className="public-empresa-action public-empresa-action--google"
              href={googleReviewLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<Star size={22} />} label="Avaliar no Google" />
            </a>
          )}

          {instagramLink && (
            <a
              className="public-empresa-action"
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<IconeInstagram />} label="Instagram" />
            </a>
          )}

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            <ConteudoAcao icon={<IconeTikTok />} label="TikTok" />
          </button>

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            <ConteudoAcao icon={<IconeYouTube />} label="YouTube" />
          </button>

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            <ConteudoAcao icon={<IconeKwai />} label="Kwai" />
          </button>

          {siteLink && (
            <a
              className="public-empresa-action public-empresa-action--light"
              href={siteLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<Globe size={22} />} label="Site" />
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
          <div className="public-empresa-info-heading">
            <MapPin size={20} />
            <span>Endereco</span>
          </div>
          <p>
            {endereco}
          </p>
          <button
            className="public-empresa-map-button"
            type="button"
            disabled
          >
            Ver no mapa
          </button>
        </section>
      )}
    </>
  );
}
