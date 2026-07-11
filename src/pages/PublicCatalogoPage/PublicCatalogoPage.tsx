import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
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

import "../PublicModulePage/PublicModulePage.css";
import "./PublicCatalogoPage.css";

type CatalogoCategoriaConfig = {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
};

type CatalogoProdutoConfig = {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  preco: string;
  imagemUrl: string;
  ativo: boolean;
};

type CatalogoConfig = {
  categorias: CatalogoCategoriaConfig[];
  produtos: CatalogoProdutoConfig[];
};

type EmpresaCatalogo = Empresa & {
  catalogo_config?: unknown;
  recursos_contratados?: {
    catalogo?: boolean;
  } | null;
  cor_principal?: string | null;
  cor_secundaria?: string | null;
  cor_botoes?: string | null;
  cor_texto_botoes?: string | null;
  cor_fundo_pagina?: string | null;
  cor_area_principal?: string | null;
};

const catalogoConfigPadrao: CatalogoConfig = {
  categorias: [],
  produtos: [],
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function normalizarCatalogoConfig(valor: unknown): CatalogoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return catalogoConfigPadrao;
  }

  const config = valor as Record<string, unknown>;
  const categorias = Array.isArray(config.categorias)
    ? config.categorias.slice(0, 30).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            id: `categoria-${indice + 1}`,
            nome: "",
            descricao: "",
            ativo: true,
          };
        }

        const categoria = item as Record<string, unknown>;

        return {
          id: texto(categoria.id) || `categoria-${indice + 1}`,
          nome: texto(categoria.nome),
          descricao: texto(categoria.descricao),
          ativo: typeof categoria.ativo === "boolean" ? categoria.ativo : true,
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
            ativo: true,
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
          ativo: typeof produto.ativo === "boolean" ? produto.ativo : true,
        };
      })
    : [];

  return { categorias, produtos };
}

function criarEstiloAparencia(empresa: EmpresaCatalogo): CSSProperties {
  const estilo = {} as CSSProperties & Record<string, string>;

  if (empresa.cor_principal) estilo["--catalog-primary"] = empresa.cor_principal;
  if (empresa.cor_secundaria) estilo["--catalog-secondary"] = empresa.cor_secundaria;
  if (empresa.cor_botoes) estilo["--catalog-button"] = empresa.cor_botoes;
  if (empresa.cor_texto_botoes) estilo["--catalog-button-text"] = empresa.cor_texto_botoes;
  if (empresa.cor_fundo_pagina) estilo["--catalog-background"] = empresa.cor_fundo_pagina;
  if (empresa.cor_area_principal) estilo["--catalog-surface"] = empresa.cor_area_principal;

  return estilo;
}

function criarSeoCatalogo(empresa: EmpresaCatalogo) {
  const titulo = `Catalogo de ${empresa.nome || "empresa"}`;
  const descricao = normalizeSeoDescription(
    empresa.descricao ||
      empresa.categoria ||
      `Veja o catalogo de ${empresa.nome || "esta empresa"} na MikaON.`
  );
  const url = getPublicUrl(`/catalogo/${empresa.slug}`);

  return {
    title: titulo,
    description: descricao,
    author: empresa.nome || "MikaON",
    keywords: createSeoKeywords([
      empresa.nome,
      empresa.categoria,
      "catalogo",
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
    manifestUrl: getManifestUrl(empresa.slug, "catalogo"),
    robots: "index,follow" as const,
    themeColor: empresa.cor_principal || empresa.cor_botoes || "",
    url,
  };
}

export default function PublicCatalogoPage() {
  const { slug } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaCatalogo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todos");

  useEffect(() => {
    async function carregarCatalogo() {
      if (!slug) {
        setCarregando(false);
        return;
      }

      const { data, error } = await buscarEmpresaPorSlug(slug);

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar catalogo publico:", error);
      }

      setEmpresa(data as EmpresaCatalogo | null);
      setCarregando(false);
    }

    carregarCatalogo();
  }, [slug]);

  useEffect(() => {
    if (!empresa) return;

    applySeoMetadata(criarSeoCatalogo(empresa));
  }, [empresa]);

  const catalogo = useMemo(
    () => normalizarCatalogoConfig(empresa?.catalogo_config),
    [empresa?.catalogo_config]
  );
  const categoriasAtivas = catalogo.categorias.filter(
    (categoria) => categoria.ativo
  );
  const categoriasAtivasIds = new Set(
    categoriasAtivas.map((categoria) => categoria.id)
  );
  const produtosAtivos = catalogo.produtos.filter(
    (produto) =>
      produto.ativo &&
      [produto.nome, produto.descricao, produto.preco, produto.imagemUrl].some(
        (valor) => valor.trim()
      )
  );
  const categoriasComConteudo = categoriasAtivas.filter((categoria) =>
    produtosAtivos.some(
      (produto) =>
        produto.categoriaId === categoria.id &&
        categoriasAtivasIds.has(produto.categoriaId)
    )
  );
  const possuiProdutosSemCategoria = produtosAtivos.some(
    (produto) => !produto.categoriaId
  );
  const termoBusca = buscaProduto.trim().toLocaleLowerCase("pt-BR");
  const produtosFiltrados = produtosAtivos.filter((produto) => {
    if (!termoBusca) return true;

    return [produto.nome, produto.descricao, produto.preco].some((valor) =>
      valor.toLocaleLowerCase("pt-BR").includes(termoBusca)
    );
  });
  const produtosSemCategoria = produtosFiltrados.filter(
    (produto) =>
      !produto.categoriaId &&
      (categoriaSelecionada === "todos" ||
        categoriaSelecionada === "sem-categoria")
  );
  const catalogoContratado =
    empresa?.recursos_contratados?.catalogo === true;
  const possuiConteudo =
    possuiProdutosSemCategoria || categoriasComConteudo.length > 0;
  const possuiResultadoFiltrado =
    produtosSemCategoria.length > 0 ||
    categoriasAtivas.some((categoria) => {
      if (
        categoriaSelecionada !== "todos" &&
        categoriaSelecionada !== categoria.id
      ) {
        return false;
      }

      return produtosFiltrados.some(
        (produto) => produto.categoriaId === categoria.id
      );
    });
  const whatsappOrcamento = (empresa?.whatsapp || empresa?.telefone || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
  const whatsappComPais = whatsappOrcamento
    ? whatsappOrcamento.startsWith("55")
      ? whatsappOrcamento
      : `55${whatsappOrcamento}`
    : "";

  function criarLinkOrcamento(produto: CatalogoProdutoConfig) {
    if (!whatsappComPais || !empresa) return "";

    const mensagem = [
      `Ola, gostaria de solicitar um orcamento para ${produto.nome || "um produto"} do catalogo de ${empresa.nome}.`,
      produto.preco ? `Preco informado: ${produto.preco}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `https://wa.me/${whatsappComPais}?text=${encodeURIComponent(mensagem)}`;
  }

  function rolarParaCategoria(categoriaId: string) {
    setCategoriaSelecionada(categoriaId);

    window.setTimeout(() => {
      const alvo =
        categoriaId === "todos"
          ? "catalogo-conteudo"
          : categoriaId === "sem-categoria"
            ? "catalogo-sem-categoria"
            : `catalogo-categoria-${categoriaId}`;

      document.getElementById(alvo)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  if (carregando) {
    return (
      <main className="public-catalogo public-catalogo--center">
        <p>Carregando catalogo...</p>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="public-catalogo public-catalogo--center">
        <section className="public-catalogo-message">
          <h1>Catalogo nao encontrado</h1>
          <p>Confira o link acessado ou tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  if (!catalogoContratado || !possuiConteudo) {
    return (
      <main
        className="public-catalogo public-catalogo--center"
        style={criarEstiloAparencia(empresa)}
      >
        <section className="public-catalogo-message">
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <h1>Catalogo indisponivel</h1>
          <p>{empresa.nome} ainda esta preparando o catalogo. Volte em breve.</p>
          <Link to={`/${empresa.slug}`}>Voltar para a pagina da empresa</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-catalogo" style={criarEstiloAparencia(empresa)}>
      <header className="public-catalogo-hero">
        <Link className="public-catalogo-brand" to={`/${empresa.slug}`}>
          {empresa.logo && <img src={empresa.logo} alt={empresa.nome} />}
          <span>{empresa.nome}</span>
        </Link>

        <div>
          <p>{empresa.categoria || "Catalogo"}</p>
          <h1>Catalogo</h1>
          {empresa.descricao && <span>{empresa.descricao}</span>}
        </div>
      </header>

      <section className="public-catalogo-tools" aria-label="Busca e filtros do catalogo">
        <label className="public-catalogo-search">
          <span>Buscar produto</span>
          <input
            type="search"
            value={buscaProduto}
            onChange={(event) => setBuscaProduto(event.target.value)}
            placeholder="Digite o nome, descricao ou preco"
          />
        </label>

        <div className="public-catalogo-filters" aria-label="Filtrar por categoria">
          <button
            type="button"
            className={categoriaSelecionada === "todos" ? "is-active" : ""}
            onClick={() => rolarParaCategoria("todos")}
          >
            Todos
          </button>

          {categoriasComConteudo.map((categoria) => (
            <button
              type="button"
              className={
                categoriaSelecionada === categoria.id ? "is-active" : ""
              }
              key={categoria.id}
              onClick={() => rolarParaCategoria(categoria.id)}
            >
              {categoria.nome || "Categoria"}
            </button>
          ))}

          {possuiProdutosSemCategoria && (
            <button
              type="button"
              className={
                categoriaSelecionada === "sem-categoria" ? "is-active" : ""
              }
              onClick={() => rolarParaCategoria("sem-categoria")}
            >
              Outros itens
            </button>
          )}
        </div>
      </section>

      <section className="public-catalogo-content" id="catalogo-conteudo">
        {categoriasAtivas.map((categoria) => {
          if (
            categoriaSelecionada !== "todos" &&
            categoriaSelecionada !== categoria.id
          ) {
            return null;
          }

          const produtosDaCategoria = produtosFiltrados.filter(
            (produto) => produto.categoriaId === categoria.id
          );

          if (produtosDaCategoria.length === 0) return null;

          return (
            <section
              className="public-catalogo-section"
              id={`catalogo-categoria-${categoria.id}`}
              key={categoria.id}
            >
              <div className="public-catalogo-section__heading">
                <h2>{categoria.nome || "Categoria"}</h2>
                {categoria.descricao && <p>{categoria.descricao}</p>}
              </div>

              <div className="public-catalogo-products">
                {produtosDaCategoria.map((produto) => (
                  <article className="public-catalogo-product" key={produto.id}>
                    {produto.imagemUrl && (
                      <img src={produto.imagemUrl} alt={produto.nome} />
                    )}

                    <div>
                      <h3>{produto.nome || "Produto"}</h3>
                      {produto.descricao && <p>{produto.descricao}</p>}
                      {produto.preco && <strong>{produto.preco}</strong>}
                      {whatsappComPais && (
                        <a
                          className="public-catalogo-product__quote"
                          href={criarLinkOrcamento(produto)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle aria-hidden="true" size={16} strokeWidth={2.4} />
                          Solicitar Orcamento
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {produtosSemCategoria.length > 0 && (
          <section className="public-catalogo-section" id="catalogo-sem-categoria">
            <div className="public-catalogo-section__heading">
              <h2>Outros itens</h2>
            </div>

            <div className="public-catalogo-products">
              {produtosSemCategoria.map((produto) => (
                <article className="public-catalogo-product" key={produto.id}>
                  {produto.imagemUrl && (
                    <img src={produto.imagemUrl} alt={produto.nome} />
                  )}

                  <div>
                    <h3>{produto.nome || "Produto"}</h3>
                    {produto.descricao && <p>{produto.descricao}</p>}
                    {produto.preco && <strong>{produto.preco}</strong>}
                    {whatsappComPais && (
                      <a
                        className="public-catalogo-product__quote"
                        href={criarLinkOrcamento(produto)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle aria-hidden="true" size={16} strokeWidth={2.4} />
                        Solicitar Orcamento
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!possuiResultadoFiltrado && (
          <section className="public-catalogo-empty">
            <h2>Nenhum item encontrado</h2>
            <p>Ajuste a busca ou selecione outra categoria.</p>
          </section>
        )}
      </section>
    </main>
  );
}
