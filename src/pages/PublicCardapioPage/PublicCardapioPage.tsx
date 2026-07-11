import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";

import type { Empresa } from "../../models/Empresa";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  applySeoMetadata,
  createBusinessJsonLd,
  createSeoKeywords,
  getManifestUrl,
  getPublicUrl,
  normalizeSeoDescription,
} from "../../utils/seo";

import "./PublicCardapioPage.css";

type CardapioCategoriaConfig = {
  id: string;
  nome: string;
  descricao: string;
  visivel: boolean;
};

type CardapioProdutoConfig = {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  preco: string;
  imagemUrl: string;
  disponivel: boolean;
};

type CardapioConfig = {
  categorias: CardapioCategoriaConfig[];
  produtos: CardapioProdutoConfig[];
};

type EmpresaCardapio = Empresa & {
  cardapio_config?: unknown;
  recursos_contratados?: {
    cardapio_digital?: boolean;
  } | null;
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_area_principal?: string | null;
};

const cardapioConfigPadrao: CardapioConfig = {
  categorias: [],
  produtos: [],
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function normalizarCardapioConfig(valor: unknown): CardapioConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return cardapioConfigPadrao;
  }

  const config = valor as Record<string, unknown>;
  const categorias = Array.isArray(config.categorias)
    ? config.categorias.slice(0, 30).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            id: `categoria-${indice + 1}`,
            nome: "",
            descricao: "",
            visivel: true,
          };
        }

        const categoria = item as Record<string, unknown>;

        return {
          id: texto(categoria.id) || `categoria-${indice + 1}`,
          nome: texto(categoria.nome),
          descricao: texto(categoria.descricao),
          visivel:
            typeof categoria.visivel === "boolean" ? categoria.visivel : true,
        };
      })
    : [];
  const categoriaIds = new Set(categorias.map((categoria) => categoria.id));
  const produtos = Array.isArray(config.produtos)
    ? config.produtos.slice(0, 100).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            id: `produto-${indice + 1}`,
            categoriaId: "",
            nome: "",
            descricao: "",
            preco: "",
            imagemUrl: "",
            disponivel: true,
          };
        }

        const produto = item as Record<string, unknown>;
        const categoriaId = texto(produto.categoriaId);

        return {
          id: texto(produto.id) || `produto-${indice + 1}`,
          categoriaId: categoriaIds.has(categoriaId) ? categoriaId : "",
          nome: texto(produto.nome),
          descricao: texto(produto.descricao),
          preco: texto(produto.preco),
          imagemUrl: texto(produto.imagemUrl),
          disponivel:
            typeof produto.disponivel === "boolean" ? produto.disponivel : true,
        };
      })
    : [];

  return { categorias, produtos };
}

function criarEstiloAparencia(empresa: EmpresaCardapio): CSSProperties {
  const estilo = {} as CSSProperties & Record<string, string>;

  if (empresa.cor_principal) estilo["--menu-primary"] = empresa.cor_principal;
  if (empresa.cor_secundaria) estilo["--menu-secondary"] = empresa.cor_secundaria;
  if (empresa.cor_botoes) estilo["--menu-button"] = empresa.cor_botoes;
  if (empresa.cor_texto_botoes) estilo["--menu-button-text"] = empresa.cor_texto_botoes;
  if (empresa.cor_fundo_pagina) estilo["--menu-background"] = empresa.cor_fundo_pagina;
  if (empresa.cor_area_principal) estilo["--menu-surface"] = empresa.cor_area_principal;

  return estilo;
}

function criarSeoCardapio(empresa: EmpresaCardapio) {
  const titulo = `Cardapio de ${empresa.nome || "empresa"}`;
  const descricao = normalizeSeoDescription(
    empresa.descricao ||
      empresa.categoria ||
      `Veja o cardapio digital de ${empresa.nome || "esta empresa"} na MikaON.`
  );
  const url = getPublicUrl(`/cardapio/${empresa.slug}`);

  return {
    title: titulo,
    description: descricao,
    author: empresa.nome || "MikaON",
    keywords: createSeoKeywords([
      empresa.nome,
      empresa.categoria,
      "cardapio digital",
      "produtos",
    ]),
    image: empresa.banner || empresa.logo || "",
    favicon: empresa.logo || "",
    jsonLd: createBusinessJsonLd({
      name: empresa.nome || titulo,
      description: descricao,
      url,
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
    manifestUrl: getManifestUrl(empresa.slug, "cardapio"),
    robots: "index,follow" as const,
    themeColor: empresa.cor_principal || empresa.cor_botoes || "",
    url,
  };
}

export default function PublicCardapioPage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaCardapio | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarCardapio() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar cardapio publico:", error);
      }

      setEmpresa(data as EmpresaCardapio | null);
      setCarregando(false);
    }

    carregarCardapio();
  }, [slug]);

  useEffect(() => {
    if (!empresa) return;

    applySeoMetadata(criarSeoCardapio(empresa));
  }, [empresa]);

  const cardapio = useMemo(
    () => normalizarCardapioConfig(empresa?.cardapio_config),
    [empresa?.cardapio_config]
  );
  const categoriasVisiveis = cardapio.categorias.filter(
    (categoria) => categoria.visivel
  );
  const categoriasVisiveisIds = new Set(
    categoriasVisiveis.map((categoria) => categoria.id)
  );
  const produtosPreenchidos = cardapio.produtos.filter((produto) =>
    [produto.nome, produto.descricao, produto.preco, produto.imagemUrl].some(
      (valor) => valor.trim()
    )
  );
  const produtosSemCategoria = produtosPreenchidos.filter(
    (produto) => !produto.categoriaId
  );
  const cardapioContratado =
    empresa?.recursos_contratados?.cardapio_digital === true;
  const possuiConteudo =
    produtosSemCategoria.length > 0 ||
    categoriasVisiveis.some((categoria) =>
      produtosPreenchidos.some(
        (produto) =>
          produto.categoriaId === categoria.id &&
          categoriasVisiveisIds.has(produto.categoriaId)
      )
    );

  if (carregando) {
    return (
      <main className="public-cardapio public-cardapio--center">
        <p>Carregando cardapio...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-cardapio public-cardapio--center">
        <section className="public-cardapio-message">
          <h1>Cardapio nao encontrado</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  if (!cardapioContratado || !possuiConteudo) {
    return (
      <main className="public-cardapio public-cardapio--center" style={criarEstiloAparencia(empresa)}>
        <section className="public-cardapio-message">
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <h1>Cardapio indisponivel</h1>
          <p>
            {empresa.nome} ainda esta preparando o Cardapio Digital. Volte em breve.
          </p>
          <Link to={`/${empresa.slug}`}>Voltar para a pagina da empresa</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-cardapio" style={criarEstiloAparencia(empresa)}>
      <header className="public-cardapio-hero">
        <Link className="public-cardapio-brand" to={`/${empresa.slug}`}>
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <span>{empresa.nome}</span>
        </Link>

        <div>
          <p>{empresa.categoria || "Cardapio Digital"}</p>
          <h1>Cardapio Digital</h1>
          {empresa.descricao && <span>{empresa.descricao}</span>}
        </div>
      </header>

      <section className="public-cardapio-content">
        {categoriasVisiveis.map((categoria) => {
          const produtosDaCategoria = produtosPreenchidos.filter(
            (produto) => produto.categoriaId === categoria.id
          );

          if (produtosDaCategoria.length === 0) return null;

          return (
            <section className="public-cardapio-section" key={categoria.id}>
              <div className="public-cardapio-section__heading">
                <h2>{categoria.nome || "Categoria"}</h2>
                {categoria.descricao && <p>{categoria.descricao}</p>}
              </div>

              <div className="public-cardapio-products">
                {produtosDaCategoria.map((produto) => (
                  <article
                    className={`public-cardapio-product ${
                      produto.disponivel
                        ? ""
                        : "public-cardapio-product--sold-out"
                    }`}
                    key={produto.id}
                  >
                    {produto.imagemUrl && (
                      <img src={produto.imagemUrl} alt={produto.nome} />
                    )}

                    <div>
                      <div className="public-cardapio-product__title">
                        <h3>{produto.nome || "Produto"}</h3>
                        {!produto.disponivel && <span>Esgotado</span>}
                      </div>

                      {produto.descricao && <p>{produto.descricao}</p>}
                      {produto.preco && <strong>{produto.preco}</strong>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {produtosSemCategoria.length > 0 && (
          <section className="public-cardapio-section">
            <div className="public-cardapio-section__heading">
              <h2>Outros itens</h2>
            </div>

            <div className="public-cardapio-products">
              {produtosSemCategoria.map((produto) => (
                <article
                  className={`public-cardapio-product ${
                    produto.disponivel ? "" : "public-cardapio-product--sold-out"
                  }`}
                  key={produto.id}
                >
                  {produto.imagemUrl && (
                    <img src={produto.imagemUrl} alt={produto.nome} />
                  )}

                  <div>
                    <div className="public-cardapio-product__title">
                      <h3>{produto.nome || "Produto"}</h3>
                      {!produto.disponivel && <span>Esgotado</span>}
                    </div>

                    {produto.descricao && <p>{produto.descricao}</p>}
                    {produto.preco && <strong>{produto.preco}</strong>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
