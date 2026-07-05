import { type ReactNode, useState } from "react";
import {
  Globe,
  MapPin,
  MapPinned,
  Star,
  Wifi,
} from "lucide-react";

import "./ContatosEmpresa.css";

interface ContatosEmpresaProps {
  nome: string;
  whatsapp?: string | null;
  telefone?: string | null;
  email?: string | null;
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

function WhatsAppIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M16 3.8A12.1 12.1 0 0 0 5.7 22.2L4.2 28l5.9-1.5A12.1 12.1 0 1 0 16 3.8Zm0 21.9c-2 0-3.9-.6-5.5-1.7l-.4-.2-3.5.9.9-3.4-.2-.4A9.8 9.8 0 1 1 16 25.7Z"
        fill="#25D366"
      />
      <path
        d="M21.7 18.3c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-.3-.2-1.4-.5-2.7-1.7-1-1-1.7-2.1-1.9-2.4-.2-.3 0-.5.1-.7.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="instagram-gradient" x1="5" y1="28" x2="27" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F58529" />
          <stop offset="0.45" stopColor="#DD2A7B" />
          <stop offset="1" stopColor="#8134AF" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="22" height="22" rx="7" fill="url(#instagram-gradient)" />
      <circle cx="16" cy="16" r="5.2" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <circle cx="22.2" cy="9.8" r="1.7" fill="#ffffff" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M19.2 6.1h3.2c.4 2.6 1.9 4.3 4.4 4.8v3.3a8.9 8.9 0 0 1-4.3-1.4v7.5c0 4.2-2.9 6.9-6.8 6.9-3.8 0-6.5-2.5-6.5-5.9 0-3.7 3-6.2 7.1-6.1v3.5c-1.9-.1-3.3.8-3.3 2.5 0 1.5 1.2 2.5 2.8 2.5 1.8 0 3-1.1 3-3.3V6.1Z" fill="#111111" />
      <path d="M17.7 7.7v11.1c-.5-.1-.9-.2-1.4-.2-1.9-.1-3.3.8-3.3 2.5 0 .4.1.7.2 1a2.6 2.6 0 0 1-2.1-2.6c0-1.7 1.4-2.6 3.3-2.5.5 0 1 .1 1.4.2V7.7h1.9Z" fill="#25F4EE" />
      <path d="M22.4 6.1c.4 2.6 1.9 4.3 4.4 4.8v1.8c-2.6-.4-4.8-2.1-5.8-4.5V6.1h1.4Z" fill="#FE2C55" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4.5" y="8.5" width="23" height="15" rx="4" fill="#FF0000" />
      <path d="m14.1 12.3 7.1 3.7-7.1 3.7v-7.4Z" fill="#ffffff" />
    </svg>
  );
}

function KwaiIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M10.3 7.1a4 4 0 1 1 6.6 3h3.7a4.3 4.3 0 0 1 4.3 4.3v5.2a4.3 4.3 0 0 1-4.3 4.3h-11a4.3 4.3 0 0 1-4.3-4.3v-5.2a4.3 4.3 0 0 1 4.3-4.3h1.3a4 4 0 0 1-.6-3Zm3.6 2.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Zm-4 5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm9.4 0a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Zm5.2.4 3.1-1.8v7.8l-3.1-1.8v-4.2Z"
        fill="#FF6A00"
      />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M16 3.7 28.3 16 16 28.3 3.7 16 16 3.7Z"
        fill="#32BCAD"
      />
      <path
        d="M12.3 12.1a2.6 2.6 0 0 1 3.7 0l2.1 2.1a1.3 1.3 0 0 0 1.9 0l1.6-1.6 2.2 2.2-1.6 1.6a4.5 4.5 0 0 1-6.3 0l-2.1-2.1a.7.7 0 0 0-1 0l-3.7 3.7-2.2-2.2 5.4-3.7Z"
        fill="#ffffff"
        opacity="0.95"
      />
      <path
        d="m9.1 18 3.7 3.7a.7.7 0 0 0 1 0l2.1-2.1a4.5 4.5 0 0 1 6.3 0l1.6 1.6-2.2 2.2-1.6-1.6a1.3 1.3 0 0 0-1.9 0L16 23.9a2.6 2.6 0 0 1-3.7 0l-5.4-3.7L9.1 18Z"
        fill="#ffffff"
        opacity="0.95"
      />
    </svg>
  );
}

function SalvarContatoIcon() {
  return (
    <svg className="public-empresa-brand-svg" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="7" y="4" width="18" height="24" rx="5" fill="#1F3D36" opacity="0.12" />
      <path
        d="M16 15.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8.1c.8-3.5 3.5-5.6 7-5.6s6.2 2.1 7 5.6"
        fill="none"
        stroke="#1F3D36"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M24.5 18v6.5M21.3 21.2h6.4"
        fill="none"
        stroke="#1F3D36"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConteudoAcao({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: string;
}) {
  return (
    <>
      <span className={`public-empresa-action-icon-wrap public-empresa-action-icon-wrap--${tone}`}>
        {icon}
      </span>
      <span>{label}</span>
    </>
  );
}

export default function ContatosEmpresa({
  nome,
  whatsapp,
  telefone,
  email,
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
  const [feedbackWifi, setFeedbackWifi] = useState("");
  const [feedbackPix, setFeedbackPix] = useState("");

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

  async function copiarTexto(texto: string, tipo: "wifi" | "pix") {
    if (!texto) return;

    await navigator.clipboard.writeText(texto);

    if (tipo === "wifi") {
      setFeedbackWifi("Senha copiada");
      setFeedbackPix("");
      return;
    }

    setFeedbackPix("Chave PIX copiada");
    setFeedbackWifi("");
  }

  function formatarVCardTexto(valor: string) {
    return valor
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function salvarContato() {
    const telefoneContato = whatsapp || telefone || "";
    const linhas = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${formatarVCardTexto(nome)}`,
      `ORG:${formatarVCardTexto(nome)}`,
      telefoneContato ? `TEL;TYPE=CELL:${telefoneContato.replace(/\D/g, "")}` : "",
      email ? `EMAIL:${formatarVCardTexto(email)}` : "",
      site ? `URL:${criarLinkExterno(site)}` : "",
      endereco ? `ADR;TYPE=WORK:;;${formatarVCardTexto(endereco)};;;;` : "",
      "END:VCARD",
    ].filter(Boolean);

    const arquivo = new Blob([linhas.join("\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${nome || "contato"}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <section className="public-empresa-section">
        <div className="public-empresa-actions">
          {temWifi && (
            <div className="public-empresa-action-shell">
              <button
                className="public-empresa-action public-empresa-action--light"
                type="button"
                onClick={() => setWifiAberto((aberto) => !aberto)}
                aria-expanded={wifiAberto}
              >
                <ConteudoAcao icon={<Wifi size={26} />} label="Wi-Fi" tone="wifi" />
              </button>

              {wifiAberto && (
                <div className="public-empresa-inline-detail">
                  {nomeWifi && (
                    <p>
                      <strong>Rede:</strong> {nomeWifi}
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
                        onClick={() => copiarTexto(senhaWifi, "wifi")}
                      >
                        Copiar senha
                      </button>
                    </>
                  )}
                  {feedbackWifi && (
                    <p className="public-empresa-copy-feedback">{feedbackWifi}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {whatsappLink && (
            <a
              className="public-empresa-action public-empresa-action--whatsapp"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<WhatsAppIcon />} label="WhatsApp" tone="whatsapp" />
            </a>
          )}

          {temPix && (
            <div className="public-empresa-action-shell">
              <button
                className="public-empresa-action public-empresa-action--light"
                type="button"
                onClick={() => setPixAberto((aberto) => !aberto)}
                aria-expanded={pixAberto}
              >
                <ConteudoAcao
                  icon={<PixIcon />}
                  label="PIX"
                  tone="pix"
                />
              </button>

              {pixAberto && (
                <div className="public-empresa-inline-detail">
                  {nomePix && (
                    <p>
                      <strong>Recebedor:</strong> {nomePix}
                    </p>
                  )}
                  <p>
                    <strong>Chave PIX:</strong> {chavePix}
                  </p>
                  <button
                    className="public-empresa-copy-button"
                    type="button"
                    onClick={() => copiarTexto(chavePix, "pix")}
                  >
                    Copiar chave PIX
                  </button>
                  {feedbackPix && (
                    <p className="public-empresa-copy-feedback">{feedbackPix}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            className="public-empresa-action public-empresa-action--light"
            type="button"
            onClick={salvarContato}
          >
            <ConteudoAcao icon={<SalvarContatoIcon />} label="Salvar contato" tone="contact" />
          </button>

          {googleReviewLink && (
            <a
              className="public-empresa-action public-empresa-action--google"
              href={googleReviewLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao
                icon={<Star size={26} />}
                label="Avaliar no Google"
                tone="google"
              />
            </a>
          )}

          {instagramLink && (
            <a
              className="public-empresa-action"
              href={instagramLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<InstagramIcon />} label="Instagram" tone="instagram" />
            </a>
          )}

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            <ConteudoAcao icon={<TikTokIcon />} label="TikTok" tone="tiktok" />
          </button>

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            <ConteudoAcao icon={<YouTubeIcon />} label="YouTube" tone="youtube" />
          </button>

          <button
            className="public-empresa-action public-empresa-action--placeholder"
            type="button"
            disabled
          >
            <ConteudoAcao icon={<KwaiIcon />} label="Kwai" tone="kwai" />
          </button>

          {siteLink && (
            <a
              className="public-empresa-action public-empresa-action--light"
              href={siteLink}
              target="_blank"
              rel="noreferrer"
            >
              <ConteudoAcao icon={<Globe size={26} />} label="Site" tone="site" />
            </a>
          )}
        </div>
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
            <MapPinned size={18} />
            Ver no mapa
          </button>
        </section>
      )}
    </>
  );
}
