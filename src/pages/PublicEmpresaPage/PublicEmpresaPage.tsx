import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";

import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import type { Empresa } from "../../models/Empresa";
import HeroEmpresa from "../../components/public/HeroEmpresa/HeroEmpresa";
import InformacoesEmpresa from "../../components/public/InformacoesEmpresa/InformacoesEmpresa";
import ContatosEmpresa from "../../components/public/ContatosEmpresa/ContatosEmpresa";
import RodapeEmpresa from "../../components/public/RodapeEmpresa/RodapeEmpresa";
import {
  applySeoMetadata,
  createBusinessJsonLd,
  getManifestUrl,
  getPublicUrl,
  normalizeSeoDescription,
} from "../../utils/seo";

import "./PublicEmpresaPage.css";

type AparenciaEmpresa = Empresa & {
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_fundo_hero?: string | null;
  cor_area_principal?: string | null;
  tipo_fundo?: string | null;
  gradiente_inicio?: string | null;
  gradiente_fim?: string | null;
  gradiente_direcao?: string | null;
};

const diasSemana = [
  { label: "Segunda", chave: "segunda" },
  { label: "Terça", chave: "terca" },
  { label: "Quarta", chave: "quarta" },
  { label: "Quinta", chave: "quinta" },
  { label: "Sexta", chave: "sexta" },
  { label: "Sábado", chave: "sabado" },
  { label: "Domingo", chave: "domingo" },
];

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarPeriodo(inicio: number, fim: number) {
  const primeiro = diasSemana[inicio].label;
  const ultimo = diasSemana[fim].label;

  if (inicio === fim) return primeiro;
  if (fim === inicio + 1) return `${primeiro} e ${ultimo}`;

  return `${primeiro} a ${ultimo}`;
}

function agruparHorarioAtendimento(horarioAtendimento?: string | null) {
  if (!horarioAtendimento?.trim()) return [];

  const horariosPorDia = diasSemana.map(() => "Fechado");

  horarioAtendimento.split("\n").forEach((linha) => {
    const linhaNormalizada = normalizarTexto(linha);
    const diaIndex = diasSemana.findIndex((dia) =>
      linhaNormalizada.startsWith(dia.chave)
    );
    const horario = linha.match(/(\d{2}:\d{2}).+?(\d{2}:\d{2})/);

    if (diaIndex < 0 || !horario) return;

    horariosPorDia[diaIndex] = `${horario[1]} às ${horario[2]}`;
  });

  const grupos: Array<{ dias: string; horario: string }> = [];
  let inicioGrupo = 0;

  for (let index = 1; index <= horariosPorDia.length; index += 1) {
    if (horariosPorDia[index] === horariosPorDia[inicioGrupo]) continue;

    grupos.push({
      dias: formatarPeriodo(inicioGrupo, index - 1),
      horario: horariosPorDia[inicioGrupo],
    });
    inicioGrupo = index;
  }

  return grupos;
}

function criarGoogleMapsUrl(endereco?: string | null) {
  const enderecoCompleto = endereco?.trim();

  if (!enderecoCompleto) return "";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    enderecoCompleto
  )}`;
}

function obterDirecaoGradiente(direcao?: string | null) {
  if (direcao === "horizontal") return "90deg";
  if (direcao === "diagonal") return "135deg";

  return "180deg";
}

function criarEstiloAparencia(empresa: Empresa): CSSProperties {
  const aparencia = empresa as AparenciaEmpresa;
  const estilo = {} as CSSProperties & Record<string, string>;
  const corPrincipal = aparencia.cor_principal?.trim();
  const corSecundaria = aparencia.cor_secundaria?.trim();
  const corBotoes = aparencia.cor_botoes?.trim();
  const corTextoBotoes = aparencia.cor_texto_botoes?.trim();
  const corFundoPagina = aparencia.cor_fundo_pagina?.trim();
  const corFundoHero = aparencia.cor_fundo_hero?.trim();
  const corAreaPrincipal = aparencia.cor_area_principal?.trim();
  const gradienteInicio = aparencia.gradiente_inicio?.trim();
  const gradienteFim = aparencia.gradiente_fim?.trim();

  function aplicarVariavel(nome: string, valor?: string) {
    if (valor) {
      estilo[nome] = valor;
    }
  }

  aplicarVariavel("--mc-primary", corPrincipal);
  aplicarVariavel("--mc-text", corPrincipal);
  aplicarVariavel("--mc-secondary", corSecundaria);
  aplicarVariavel("--mc-accent", corSecundaria);
  aplicarVariavel("--mc-button-background", corBotoes);
  aplicarVariavel("--mc-button-text", corTextoBotoes);
  aplicarVariavel("--mc-background", corFundoPagina);
  aplicarVariavel("--mc-background-soft", corFundoPagina);
  aplicarVariavel("--mc-hero-background", corFundoHero || corFundoPagina);
  aplicarVariavel("--mc-content-background", corAreaPrincipal);
  aplicarVariavel("--mc-card", corAreaPrincipal);
  aplicarVariavel("--mc-surface", corAreaPrincipal);

  if (corPrincipal) {
    estilo["--mc-border"] =
      `color-mix(in srgb, ${corPrincipal} 16%, transparent)`;
    estilo["--mc-border-strong"] =
      `color-mix(in srgb, ${corPrincipal} 28%, transparent)`;
  }

  if (
    aparencia.tipo_fundo === "gradiente" &&
    gradienteInicio &&
    gradienteFim
  ) {
    estilo["--mc-page-background"] =
      `linear-gradient(${obterDirecaoGradiente(aparencia.gradiente_direcao)}, ${gradienteInicio} 0%, ${gradienteFim} 100%)`;
  } else {
    aplicarVariavel("--mc-page-background", corFundoPagina);
  }

  return estilo;
}

function criarSeoPaginaPublica(empresa: Empresa) {
  const aparencia = empresa as AparenciaEmpresa;
  const titulo = empresa.nome || "Empresa MikaON";
  const descricao = normalizeSeoDescription(
    empresa.descricao ||
      empresa.categoria ||
      `Conheca ${titulo} na MikaON.`
  );
  const slugPublico = empresa.slug || "";
  const urlPublica = getPublicUrl(`/${slugPublico}`);

  return {
    title: titulo,
    description: descricao,
    image: empresa.banner || empresa.logo || "",
    favicon: empresa.logo || "",
    jsonLd: createBusinessJsonLd({
      name: titulo,
      description: descricao,
      url: urlPublica,
      logo: empresa.logo,
      image: empresa.banner || empresa.logo,
      category: empresa.categoria,
      telephone: empresa.telefone,
      whatsapp: empresa.whatsapp,
      email: empresa.email,
      address: empresa.endereco,
      website: empresa.site,
      sameAs: [
        empresa.instagram,
        empresa.facebook,
        empresa.tiktok,
        empresa.youtube,
        empresa.kwai,
      ],
    }),
    manifestUrl: getManifestUrl(slugPublico, "public"),
    themeColor: aparencia.cor_principal || aparencia.cor_botoes || "",
    url: urlPublica,
  };
}

export default function PublicEmpresaPage() {
  const { slug } = useParams();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarEmpresa() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar empresa pública:", error);
      }

      setEmpresa(data);
      setCarregando(false);
    }

    carregarEmpresa();
  }, [slug]);

  useEffect(() => {
    if (!empresa) return;

    applySeoMetadata(criarSeoPaginaPublica(empresa));
  }, [empresa]);

  if (carregando) {
    return (
      <main className="public-empresa-page public-empresa-page--center">
          <p>Carregando empresa...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-empresa-page public-empresa-page--center">
        <section className="public-empresa-empty">
          <h1>Empresa não encontrada</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  const horariosAgrupados = agruparHorarioAtendimento(
    empresa.horario_atendimento
  );
  const googleMapsUrl = criarGoogleMapsUrl(empresa.endereco);
  const estiloAparencia = criarEstiloAparencia(empresa);

  return (
    <main className="public-empresa-page" style={estiloAparencia}>
      <section className="public-empresa-card">
        <HeroEmpresa
          banner={empresa.banner}
          logo={empresa.logo}
          nome={empresa.nome}
          logoExibicao={
            (empresa as Empresa & {
              logo_exibicao?: "normal" | "small" | "hidden" | "pequeno" | "oculto";
            })
              .logo_exibicao || "normal"
          }
          corFundoHero={
            (empresa as AparenciaEmpresa).cor_fundo_hero ||
            (empresa as AparenciaEmpresa).cor_fundo_pagina
          }
        />

        <div className="public-empresa-content">
          <section className="public-empresa-profile-card">
            <InformacoesEmpresa
              nome={empresa.nome}
              descricao={empresa.descricao}
            />
          </section>

          <ContatosEmpresa
            nome={empresa.nome}
            whatsapp={empresa.whatsapp}
            telefone={empresa.telefone}
            email={empresa.email}
            instagram={empresa.instagram}
            tiktok={empresa.tiktok}
            youtube={empresa.youtube}
            kwai={empresa.kwai}
            site={empresa.site}
            googleReviewUrl={empresa.google_review_url}
            wifiNome={empresa.wifi_nome}
            wifiSenha={empresa.wifi_senha}
            pixNome={empresa.pix_nome}
            pixChave={empresa.pix_chave || empresa.pix}
          />

          {empresa.endereco && (
            <section className="public-empresa-section public-empresa-address-card">
              <div className="public-empresa-address-heading">
                <span>Endereço</span>
              </div>

              <p>{empresa.endereco}</p>

              {googleMapsUrl && (
                <a
                  className="public-empresa-map-link"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver no mapa
                </a>
              )}
            </section>
          )}

          {horariosAgrupados.length > 0 && (
            <section className="public-empresa-section public-empresa-hours-card">
              <div className="public-empresa-hours-heading">
                <span>Horário de atendimento</span>
              </div>

              <div className="public-empresa-hours-list">
                {horariosAgrupados.map((grupo) => (
                  <div
                    className="public-empresa-hours-row"
                    key={`${grupo.dias}-${grupo.horario}`}
                  >
                    <span>{grupo.dias}</span>
                    <strong>{grupo.horario}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <RodapeEmpresa />
    </main>
  );
}
