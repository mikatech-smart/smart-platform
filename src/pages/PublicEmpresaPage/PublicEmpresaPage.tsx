import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import type { Empresa } from "../../models/Empresa";
import HeroEmpresa from "../../components/public/HeroEmpresa/HeroEmpresa";
import InformacoesEmpresa from "../../components/public/InformacoesEmpresa/InformacoesEmpresa";
import ContatosEmpresa from "../../components/public/ContatosEmpresa/ContatosEmpresa";
import RodapeEmpresa from "../../components/public/RodapeEmpresa/RodapeEmpresa";

import "./PublicEmpresaPage.css";

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

  return (
    <main className="public-empresa-page">
      <section className="public-empresa-card">
        <HeroEmpresa
          banner={empresa.banner}
          logo={empresa.logo}
          nome={empresa.nome}
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
            endereco={empresa.endereco}
            horarioAtendimento={empresa.horario_atendimento}
            googleReviewUrl={empresa.google_review_url}
            wifiNome={empresa.wifi_nome}
            wifiSenha={empresa.wifi_senha}
            pixNome={empresa.pix_nome}
            pixChave={empresa.pix_chave || empresa.pix}
          />
        </div>
      </section>

      <RodapeEmpresa />
    </main>
  );
}
