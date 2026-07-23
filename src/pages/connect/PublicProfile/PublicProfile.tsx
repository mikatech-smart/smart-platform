import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Hero from "../../../components/connect/Hero";
import { buscarEmpresaPorSlug } from "../../../services/empresa/empresa.service";
import type { Empresa } from "../../../models/Empresa";

export default function PublicProfile() {
  const { slug } = useParams();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarEmpresa() {
      if (!slug) {
        setEmpresa(null);
        setLoading(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error) {
        console.error(error);
      }

      setEmpresa(data);
      setLoading(false);
    }

    carregarEmpresa();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Carregando...
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Empresa não encontrada.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <Hero
          cover={empresa.banner}
          logo={empresa.logo}
          companyName={empresa.nome}
          category={empresa.categoria}
          description={empresa.descricao}
          rating={4.9}
          reviews={128}
        />
      </div>
    </main>
  );
}
