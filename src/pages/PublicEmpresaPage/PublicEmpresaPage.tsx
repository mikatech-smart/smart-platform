import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import type { Empresa } from "../../models/Empresa";
import HeroEmpresa from "../../components/public/HeroEmpresa/HeroEmpresa";
import InformacoesEmpresa from "../../components/public/InformacoesEmpresa/InformacoesEmpresa";
import ContatosEmpresa from "../../components/public/ContatosEmpresa/ContatosEmpresa";
import RodapeEmpresa from "../../components/public/RodapeEmpresa/RodapeEmpresa";

import "./PublicEmpresaPage.css";

const diasSemana = [
  { label: "Segunda", chave: "segunda" },
  { label: "Terca", chave: "terca" },
  { label: "Quarta", chave: "quarta" },
  { label: "Quinta", chave: "quinta" },
  { label: "Sexta", chave: "sexta" },
  { label: "Sabado", chave: "sabado" },
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

    horariosPorDia[diaIndex] = `${horario[1]} as ${horario[2]}`;
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
        console.error("Erro ao carregar empresa publica:", error);
      }

      setEmpresa(data);
      setCarregando(false);
    }

    carregarEmpresa();
  }, [slug]);

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
          <h1>Empresa nao encontrada</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  const horariosAgrupados = agruparHorarioAtendimento(
    empresa.horario_atendimento
  );
  const googleMapsUrl = criarGoogleMapsUrl(empresa.endereco);

  return (
    <main className="public-empresa-page">
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
        />

        <div className="public-empresa-content">
          <section className="public-empresa-profile-card">
            <InformacoesEmpresa
              nome={empresa.nome}
              categoria={empresa.categoria}
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
                <span>Endereco</span>
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
                <span>Horario de atendimento</span>
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
