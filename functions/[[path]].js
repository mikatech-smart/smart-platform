const PUBLIC_APP_URL = "https://smart.mikaon.com.br";
const DEFAULT_TITLE = "MikaON";
const DEFAULT_DESCRIPTION =
  "MikaON conecta empresas, servicos e canais de contato em paginas publicas inteligentes.";
const DEFAULT_IMAGE = `${PUBLIC_APP_URL}/favicon.svg`;

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value = "", max = 180) {
  const text = stripHtml(value);

  return text.length > max ? `${text.slice(0, max - 3).trim()}...` : text;
}

function absoluteImage(value = "") {
  const image = String(value).trim();

  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  return `${PUBLIC_APP_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function getRequestRoute(pathname) {
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  if (parts.length === 1) {
    return { kind: "public", slug: parts[0] };
  }

  if (parts.length === 2 && parts[0] === "landing") {
    return { kind: "landing", slug: parts[1] };
  }

  return null;
}

async function getEmpresa(env, slug) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const params = new URLSearchParams({
    select: "nome,slug,descricao,logo,banner,landing_page_config",
    slug: `eq.${slug}`,
    limit: "1",
  });
  const response = await fetch(
    `${env.VITE_SUPABASE_URL}/rest/v1/empresas?${params.toString()}`,
    {
      headers: {
        apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    }
  );

  if (!response.ok) return null;

  const rows = await response.json();

  return rows[0] || null;
}

function getLandingConfig(empresa) {
  const config = empresa?.landing_page_config;

  if (!config || typeof config !== "object") return {};

  return config.versaoPublicada && typeof config.versaoPublicada === "object"
    ? { ...config, ...config.versaoPublicada }
    : config;
}

function buildMetadata(route, empresa) {
  const landing = route.kind === "landing" ? getLandingConfig(empresa) : {};
  const landingSeo = landing.seo || {};
  const landingHero = landing.hero || {};
  const title =
    (route.kind === "landing" &&
      (landingSeo.titulo || landingHero.titulo || empresa?.nome)) ||
    empresa?.nome ||
    DEFAULT_TITLE;
  const description = truncate(
    (route.kind === "landing" &&
      (landingSeo.descricao || empresa?.descricao || landingHero.subtitulo)) ||
      empresa?.descricao ||
      empresa?.categoria ||
      DEFAULT_DESCRIPTION
  );
  const image = absoluteImage(
    (route.kind === "landing" &&
      (landingSeo.imagemCompartilhamento ||
        empresa?.banner ||
        landingHero.imagemDestaque ||
        empresa?.logo)) ||
      empresa?.banner ||
      empresa?.logo ||
      ""
  );
  const url =
    route.kind === "landing"
      ? `${PUBLIC_APP_URL}/landing/${route.slug}`
      : `${PUBLIC_APP_URL}/${route.slug}`;

  return { title, description, image, url };
}

function injectMetadata(html, metadata) {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const image = escapeHtml(metadata.image);
  const url = escapeHtml(metadata.url);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join("\n    ");

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace("</head>", `    ${tags}\n  </head>`);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const route = getRequestRoute(url.pathname);
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!route || !contentType.includes("text/html")) {
    return response;
  }

  const empresa = await getEmpresa(context.env, route.slug);
  const metadata = buildMetadata(route, empresa);
  const html = injectMetadata(await response.text(), metadata);
  const headers = new Headers(response.headers);

  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
