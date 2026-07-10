import { useMemo, useState, type ReactNode } from "react";
import {
  Copy,
  Download,
  ExternalLink,
  Globe,
  Lock,
  QrCode,
  Radio,
  UserRound,
} from "lucide-react";

import { BrandConfig } from "../../../config/brand";
import "./QRCodeEmpresa.css";

interface QRCodeEmpresaProps {
  slug: string;
  nomeEmpresa?: string;
  landingPageContratada?: boolean;
  landingPagePublicada?: boolean;
}

type LinkCompartilhamentoId = "publico" | "painel" | "nfc" | "landing";

interface RecursoCompartilhamento {
  id: LinkCompartilhamentoId;
  titulo: string;
  descricao: string;
  rotuloUrl: string;
  url: string;
  icon: ReactNode;
  abrir?: boolean;
}

export default function QRCodeEmpresa({
  slug,
  nomeEmpresa,
  landingPageContratada = false,
  landingPagePublicada = false,
}: QRCodeEmpresaProps) {
  const [copiado, setCopiado] = useState<LinkCompartilhamentoId | null>(null);
  const [baixando, setBaixando] = useState(false);
  const baseUrlPublica = BrandConfig.publicAppUrl.replace(/\/$/, "");

  const publicUrl = useMemo(() => {
    return `${baseUrlPublica}/${slug}`;
  }, [baseUrlPublica, slug]);

  const painelClienteUrl = useMemo(() => {
    return `${baseUrlPublica}/painel/${slug}`;
  }, [baseUrlPublica, slug]);

  const landingPageUrl = useMemo(() => {
    return `${baseUrlPublica}/landing/${slug}`;
  }, [baseUrlPublica, slug]);

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

  const recursosCompartilhamento = useMemo<RecursoCompartilhamento[]>(
    () => [
      {
        id: "publico",
        titulo: "Página Pública",
        descricao: "Link principal para clientes acessarem a empresa.",
        rotuloUrl: "URL pública",
        url: publicUrl,
        icon: <Globe size={20} />,
        abrir: true,
      },
      {
        id: "painel",
        titulo: "Painel do Cliente",
        descricao: "Acesso direto para o cliente administrar a empresa.",
        rotuloUrl: "URL do painel",
        url: painelClienteUrl,
        icon: <UserRound size={20} />,
        abrir: true,
      },
      {
        id: "landing",
        titulo: "Landing Page",
        descricao: landingPagePublicada
          ? "Link publico da Landing Page publicada."
          : "Link preparado. Ao acessar, o cliente vera a mensagem de pagina nao publicada.",
        rotuloUrl: "URL da landing",
        url: landingPageUrl,
        icon: <Globe size={20} />,
        abrir: true,
      },
      {
        id: "nfc",
        titulo: "Link para NFC",
        descricao: "Grave este link na tag NFC para abrir a página pública.",
        rotuloUrl: "URL para gravação",
        url: publicUrl,
        icon: <Radio size={20} />,
      },
    ],
    [landingPagePublicada, landingPageUrl, painelClienteUrl, publicUrl]
  );

  async function copiarLink(tipo: LinkCompartilhamentoId, url: string) {
    await navigator.clipboard.writeText(url);

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
            Central de Compartilhamento
          </p>

          <h3>Central de Compartilhamento</h3>

          <p className="qr-code-empresa__subtitle">
            Cadastre o slug da empresa para liberar links, NFC e QR Code.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="qr-code-empresa">
      <div className="qr-code-empresa__header">
        <p className="qr-code-empresa__eyebrow">
          Central de Compartilhamento
        </p>

        <h3>Central de Compartilhamento</h3>

        <p className="qr-code-empresa__subtitle">
          Reúna os links e recursos usados em NFC, QR Code, atendimento e materiais impressos.
        </p>
      </div>

      <div className="qr-code-empresa__grid">
        {recursosCompartilhamento.map((recurso) => {
          if (recurso.id === "landing" && !landingPageContratada) {
            return null;
          }

          return (
          <section
            className={`qr-code-empresa__card ${
              recurso.id === "landing" ? "qr-code-empresa__card--landing" : ""
            }`}
            key={recurso.id}
          >
            <div className="qr-code-empresa__section-title">
              {recurso.icon}
              <h4>{recurso.titulo}</h4>
            </div>

            {recurso.id === "landing" && (
              <span
                className={`qr-code-empresa__status ${
                  landingPagePublicada
                    ? "qr-code-empresa__status--published"
                    : "qr-code-empresa__status--draft"
                }`}
              >
                {landingPagePublicada ? "Publicada" : "Não publicada"}
              </span>
            )}

            <p>{recurso.descricao}</p>

            <div className="qr-code-empresa__url-box">
              <span>{recurso.rotuloUrl}</span>
              <strong>{recurso.url}</strong>
            </div>

            <div className="qr-code-empresa__actions">
              {recurso.abrir && (
                <a
                  href={recurso.url}
                  target="_blank"
                  rel="noreferrer"
                  className="qr-code-empresa__button qr-code-empresa__button--primary"
                >
                  <ExternalLink size={18} />
                  Abrir
                </a>
              )}

              <button
                type="button"
                onClick={() => copiarLink(recurso.id, recurso.url)}
                className="qr-code-empresa__button"
              >
                <Copy size={18} />
                {recurso.id === "landing" ? "Copiar link" : "Copiar"}
              </button>
            </div>

            {copiado === recurso.id && (
              <p className="qr-code-empresa__feedback">
                Link copiado com sucesso.
              </p>
            )}
          </section>
          );
        })}

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
              {baixando ? "Baixando..." : "Baixar PNG"}
            </button>
          </div>
        </section>

        {!landingPageContratada && (
        <section className="qr-code-empresa__card qr-code-empresa__card--disabled">
          <div className="qr-code-empresa__section-title">
            <Lock size={20} />
            <h4>
              {landingPageContratada
                ? "Dominio Personalizado"
                : "Landing Page não contratada"}
            </h4>
          </div>

          <p>Recurso reservado para um módulo futuro.</p>
        </section>
        )}

        <section className="qr-code-empresa__card qr-code-empresa__card--disabled">
          <div className="qr-code-empresa__section-title">
            <Lock size={20} />
            <h4>Domínio Personalizado</h4>
          </div>

          <p>Recurso reservado para configuração futura de domínio próprio.</p>
        </section>
      </div>
    </section>
  );
}
