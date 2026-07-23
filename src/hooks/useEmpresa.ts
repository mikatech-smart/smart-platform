import { useEffect, useState } from "react";

import type { Empresa } from "../models/Empresa";

import {
  buscarEmpresaPorSlug,
  atualizarEmpresa,
} from "../services/empresa/empresa.service";

export function useEmpresa(slug?: string) {

  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!slug) {
        setEmpresa(null);
        setLoading(false);
        return;
      }

      const { data } = await buscarEmpresaPorSlug(slug);

      if (data) {

        setEmpresa(data);

      }

      setLoading(false);

    }

    carregar();

  }, [slug]);

  async function salvar() {

    if (!empresa) return;

    await atualizarEmpresa(empresa.id, empresa);

  }

  function alterarCampo(
    campo: keyof Empresa,
    valor: string
  ) {

    if (!empresa) return;

    setEmpresa({

      ...empresa,

      [campo]: valor,

    });

  }

  return {

    empresa,

    loading,

    salvar,

    alterarCampo,

  };

}
