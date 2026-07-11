const PUBLIC_APP_URL = "https://smart.mikaon.com.br";
const DEFAULT_TITLE = "MikaON";
const DEFAULT_DESCRIPTION =
  "MikaON conecta empresas, servicos e canais de contato em paginas publicas inteligentes.";
const ASSET_VERSION = "102";
const DEFAULT_IMAGE = `${PUBLIC_APP_URL}/android-chrome-512x512.png?v=${ASSET_VERSION}`;
const DEFAULT_FAVICON = `${PUBLIC_APP_URL}/favicon.svg?v=${ASSET_VERSION}`;
const DEFAULT_SHORTCUT_ICON = `${PUBLIC_APP_URL}/favicon.ico?v=${ASSET_VERSION}`;
const DEFAULT_APPLE_TOUCH_ICON = `${PUBLIC_APP_URL}/apple-touch-icon.png?v=${ASSET_VERSION}`;
const DEFAULT_PWA_ICON_192 = `${PUBLIC_APP_URL}/android-chrome-192x192.png?v=${ASSET_VERSION}`;
const DEFAULT_PWA_ICON_512 = `${PUBLIC_APP_URL}/android-chrome-512x512.png?v=${ASSET_VERSION}`;
const DEFAULT_THEME_COLOR = "#064e3b";
const DEFAULT_BACKGROUND_COLOR = "#ffffff";
const SITEMAP_MAX_URLS = 50000;
const HTML_CACHE_CONTROL = "no-cache";
const REVALIDATE_CACHE_CONTROL = "public, max-age=0, must-revalidate";
const LONG_CACHE_CONTROL = "public, max-age=31536000, immutable";
const PERFORMANCE_RESOURCE_ORIGINS = [
  "https://zujfoqjmuzvdqilaxlhb.supabase.co",
  "https://www.google.com",
  "https://wa.me",
  "https://instagram.com",
  "https://facebook.com",
  "https://tiktok.com",
  "https://youtube.com",
  "https://kwai.com",
];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJsonScript(value = {}) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSlug(value = "") {
  return String(value).trim().replace(/^\/+|\/+$/g, "");
}

function isPrivateSlug(slug = "") {
  return [
    "admin",
    "api",
    "dashboard",
    "login",
    "manifest.webmanifest",
    "painel",
    "robots.txt",
    "sitemap.xml",
  ].includes(slug.toLowerCase());
}

function isPrivatePath(pathname = "") {
  return /^\/(admin|api|dashboard|login|painel)(\/|$)/i.test(pathname);
}

function truncate(value = "", max = 180) {
  const text = stripHtml(value);

  return text.length > max ? `${text.slice(0, max - 3).trim()}...` : text;
}

function splitKeywordText(value = "") {
  return stripHtml(value)
    .split(/[\s,.;:/|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function buildKeywords(values = []) {
  const keywords = values
    .flatMap((value) => [stripHtml(value || ""), ...splitKeywordText(value || "")])
    .filter(Boolean);
  const uniqueKeywords = Array.from(
    new Set([
      DEFAULT_TITLE,
      PUBLIC_APP_URL.replace(/^https?:\/\//, ""),
      ...keywords,
    ])
  );

  return uniqueKeywords.slice(0, 24).join(", ");
}

function getDnsPrefetchHref(origin = "") {
  return String(origin).replace(/^https?:/, "");
}

function buildResourceHints() {
  return PERFORMANCE_RESOURCE_ORIGINS.flatMap((origin) => [
    `<link rel="dns-prefetch" href="${escapeHtml(getDnsPrefetchHref(origin))}" />`,
    `<link rel="preconnect" href="${escapeHtml(origin)}" />`,
  ]).join("\n    ");
}

function removeResourceHints(html = "") {
  return html
    .replace(/<link\s+rel="dns-prefetch"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="preconnect"[^>]*>\s*/gi, "");
}

function applySecurityHeaders(headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );

  return headers;
}

function applyCacheControl(headers, value) {
  headers.set("Cache-Control", value);

  return headers;
}

function isLongCacheAsset(pathname = "", contentType = "") {
  return (
    pathname.startsWith("/assets/") ||
    /\.(?:avif|css|gif|ico|jpe?g|js|mjs|png|svg|webp|woff2?)$/i.test(pathname) ||
    /^(?:font|image)\//i.test(contentType) ||
    /(?:javascript|text\/css)/i.test(contentType)
  );
}

function absoluteImage(value = "") {
  const image = String(value).trim();

  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  return `${PUBLIC_APP_URL}${image.startsWith("/") ? image : `/${image}`}`;
}

function absoluteUrl(value = "") {
  const url = String(value).trim();

  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return `https://${url}`;
}

function normalizeCanonicalUrl(value = "/") {
  try {
    const url = new URL(String(value || "/").trim(), PUBLIC_APP_URL);
    const pathname = url.pathname || "/";
    const canonicalPath =
      pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

    return `${PUBLIC_APP_URL}${canonicalPath}`;
  } catch {
    return `${PUBLIC_APP_URL}/`;
  }
}

function compactObject(value = {}) {
  Object.keys(value).forEach((key) => {
    const current = value[key];

    if (
      current === "" ||
      current === null ||
      current === undefined ||
      (Array.isArray(current) && current.length === 0)
    ) {
      delete value[key];
    }
  });

  return value;
}

function getIconType(value = "") {
  const url = String(value).split("?")[0].toLowerCase();

  if (url.endsWith(".svg")) return "image/svg+xml";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".ico")) return "image/x-icon";

  return "image/png";
}

function normalizeColor(value = "", fallback = DEFAULT_THEME_COLOR) {
  const color = String(value).trim();

  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

function getRequestRoute(pathname) {
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

  if (parts[0] && isPrivateSlug(parts[0])) {
    return null;
  }

  if (parts.length === 1) {
    return { kind: "public", slug: parts[0] };
  }

  if (parts.length === 2 && parts[0] === "landing") {
    return { kind: "landing", slug: parts[1] };
  }

  if (parts.length === 2 && parts[0] === "cardapio") {
    return { kind: "cardapio", slug: parts[1] };
  }

  if (parts.length === 2 && parts[0] === "catalogo") {
    return { kind: "catalogo", slug: parts[1] };
  }

  return null;
}

async function getEmpresa(env, slug) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }

  const params = new URLSearchParams({
    select: "*",
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

async function getEmpresasParaSitemap(env) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    select: "slug,ativo,landing_page_config,recursos_contratados,cardapio_config,catalogo_config",
    ativo: "eq.true",
    order: "slug.asc",
    limit: "10000",
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

  if (!response.ok) return [];

  return response.json();
}

function getLandingConfig(empresa) {
  const config = empresa?.landing_page_config;

  if (!config || typeof config !== "object") return {};

  return config.versaoPublicada && typeof config.versaoPublicada === "object"
    ? { ...config, ...config.versaoPublicada }
    : config;
}

function isLandingPagePublicada(empresa) {
  const config = empresa?.landing_page_config;
  const publicada = config?.versaoPublicada || config;

  return Boolean(publicada?.publicada);
}

function isCardapioPublicado(empresa) {
  if (empresa?.recursos_contratados?.cardapio_digital !== true) {
    return false;
  }

  const produtos = empresa?.cardapio_config?.produtos;

  if (!Array.isArray(produtos)) return false;

  return produtos.some((produto) =>
    [
      produto?.nome,
      produto?.descricao,
      produto?.observacoes,
      produto?.preco,
      produto?.imagemUrl,
    ].some((valor) => String(valor || "").trim())
  );
}

function isCatalogoPublicado(empresa) {
  if (empresa?.recursos_contratados?.catalogo !== true) {
    return false;
  }

  const produtos = empresa?.catalogo_config?.produtos;

  if (!Array.isArray(produtos)) return false;

  return produtos.some((produto) => {
    const ativo = typeof produto?.ativo === "boolean" ? produto.ativo : true;

    return (
      ativo &&
      [
        produto?.nome,
        produto?.descricao,
        produto?.preco,
        produto?.imagemUrl,
      ].some((valor) => String(valor || "").trim())
    );
  });
}

function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api",
    "Disallow: /dashboard",
    "Disallow: /login",
    "Disallow: /painel",
    "Disallow: /connect",
    "Disallow: /manifest.webmanifest",
    "",
    `Sitemap: ${PUBLIC_APP_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

function buildSitemapXml(empresas = []) {
  const urls = [];

  for (const empresa of empresas) {
    const slug = normalizeSlug(empresa?.slug);

    if (!slug || isPrivateSlug(slug)) continue;

    urls.push(`${PUBLIC_APP_URL}/${encodeURIComponent(slug)}`);

    if (isLandingPagePublicada(empresa)) {
      urls.push(`${PUBLIC_APP_URL}/landing/${encodeURIComponent(slug)}`);
    }

    if (isCardapioPublicado(empresa)) {
      urls.push(`${PUBLIC_APP_URL}/cardapio/${encodeURIComponent(slug)}`);
    }

    if (isCatalogoPublicado(empresa)) {
      urls.push(`${PUBLIC_APP_URL}/catalogo/${encodeURIComponent(slug)}`);
    }

    if (urls.length >= SITEMAP_MAX_URLS) break;
  }

  const items = urls
    .slice(0, SITEMAP_MAX_URLS)
    .map(
      (loc) => [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        "    <changefreq>weekly</changefreq>",
        "  </url>",
      ].join("\n")
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items,
    "</urlset>",
    "",
  ].join("\n");
}

function getGoogleSiteVerification(env = {}) {
  return (
    env.GOOGLE_SITE_VERIFICATION ||
    env.VITE_GOOGLE_SITE_VERIFICATION ||
    ""
  ).trim();
}

function injectBaseRobotsMetadata(html, { googleSiteVerification = "", robots = "index,follow" } = {}) {
  const content = String(googleSiteVerification || "").trim();
  const robotsContent = robots === "noindex,nofollow" ? robots : "index,follow";
  const tags = [
    buildResourceHints(),
    `<meta name="author" content="${escapeHtml(DEFAULT_TITLE)}" />`,
    `<meta name="keywords" content="${escapeHtml(
      buildKeywords([DEFAULT_TITLE, DEFAULT_DESCRIPTION])
    )}" />`,
    `<meta name="robots" content="${escapeHtml(robotsContent)}" />`,
    content
      ? `<meta name="google-site-verification" content="${escapeHtml(content)}" />`
      : "",
  ].join("\n    ");
  const cleanHtml = removeResourceHints(html)
    .replace(/<meta\s+name="google-site-verification"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="author"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="keywords"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, "");

  return cleanHtml.replace("</head>", `    ${tags}\n  </head>`);
}

function buildJsonLd(metadata, empresa) {
  const sameAs = [
    empresa?.site,
    empresa?.instagram,
    empresa?.facebook,
    empresa?.tiktok,
    empresa?.youtube,
    empresa?.kwai,
  ]
    .map((url) => absoluteUrl(url))
    .filter(Boolean);
  const address = stripHtml(empresa?.endereco || "");
  const telephone = stripHtml(empresa?.telefone || empresa?.whatsapp || "");
  const hasLocalBusinessSignals = Boolean(
    address || telephone || stripHtml(empresa?.categoria || "")
  );

  return compactObject({
    "@context": "https://schema.org",
    "@type": hasLocalBusinessSignals ? "LocalBusiness" : "Organization",
    name: stripHtml(empresa?.nome || metadata.title || DEFAULT_TITLE),
    description: metadata.description,
    url: metadata.url,
    logo: absoluteImage(empresa?.logo || DEFAULT_FAVICON),
    image: metadata.image,
    telephone,
    email: stripHtml(empresa?.email || ""),
    address,
    sameAs,
  });
}

function buildMetadata(route, empresa) {
  const landing = route.kind === "landing" ? getLandingConfig(empresa) : {};
  const landingSeo = landing.seo || {};
  const landingHero = landing.hero || {};
  const title =
    (route.kind === "landing" &&
      (landingSeo.titulo || landingHero.titulo || empresa?.nome)) ||
    (route.kind === "cardapio" &&
      `Cardapio de ${empresa?.nome || DEFAULT_TITLE}`) ||
    (route.kind === "catalogo" &&
      `Catalogo de ${empresa?.nome || DEFAULT_TITLE}`) ||
    empresa?.nome ||
    DEFAULT_TITLE;
  const description = truncate(
    (route.kind === "landing" &&
      (landingSeo.descricao || empresa?.descricao || landingHero.subtitulo)) ||
      (route.kind === "cardapio" &&
        (empresa?.descricao || empresa?.categoria || "Cardapio Digital")) ||
      (route.kind === "catalogo" &&
        (empresa?.descricao || empresa?.categoria || "Catalogo")) ||
      empresa?.descricao ||
      empresa?.categoria ||
      DEFAULT_DESCRIPTION
  );
  const keywords = buildKeywords([
    route.kind === "landing" ? landingSeo.palavrasChave : "",
    empresa?.nome,
    empresa?.categoria,
    empresa?.descricao,
    empresa?.endereco,
    empresa?.site,
    landingHero.titulo,
    landingHero.subtitulo,
    landing?.sobre?.titulo,
    landing?.sobre?.texto,
  ]);
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
  const hasCustomLogo = Boolean(empresa?.logo);
  const favicon = absoluteImage(empresa?.logo || DEFAULT_FAVICON);
  const themeColor = normalizeColor(
    empresa?.cor_principal || empresa?.cor_botoes || ""
  );
  const backgroundColor = normalizeColor(
    empresa?.cor_fundo_pagina || empresa?.cor_fundo_hero || "",
    DEFAULT_BACKGROUND_COLOR
  );
  const robots =
    route.kind === "landing" && !isLandingPagePublicada(empresa)
      ? "noindex,nofollow"
      : route.kind === "cardapio" && !isCardapioPublicado(empresa)
        ? "noindex,nofollow"
      : route.kind === "catalogo" && !isCatalogoPublicado(empresa)
        ? "noindex,nofollow"
      : "index,follow";
  const url =
    route.kind === "landing"
      ? normalizeCanonicalUrl(`/landing/${route.slug}`)
      : route.kind === "cardapio"
        ? normalizeCanonicalUrl(`/cardapio/${route.slug}`)
      : route.kind === "catalogo"
        ? normalizeCanonicalUrl(`/catalogo/${route.slug}`)
      : normalizeCanonicalUrl(`/${route.slug}`);

  const manifestUrl = `${PUBLIC_APP_URL}/manifest.webmanifest?${new URLSearchParams({
    slug: route.slug,
    kind: route.kind,
  }).toString()}`;
  const metadata = {
    title,
    description,
    author: stripHtml(empresa?.nome || DEFAULT_TITLE),
    keywords,
    image,
    favicon,
    shortcutIcon: hasCustomLogo ? favicon : DEFAULT_SHORTCUT_ICON,
    appleTouchIcon: hasCustomLogo ? favicon : DEFAULT_APPLE_TOUCH_ICON,
    manifestIcons: hasCustomLogo
      ? [favicon, favicon]
      : [DEFAULT_PWA_ICON_192, DEFAULT_PWA_ICON_512],
    url,
    manifestUrl,
    robots,
    themeColor,
    backgroundColor,
    route,
  };

  return {
    ...metadata,
    jsonLd: buildJsonLd(metadata, empresa),
  };
}

function buildManifest(metadata) {
  const shortName =
    metadata.title.length > 12
      ? metadata.title.slice(0, 12).trim()
      : metadata.title;
  const icon192 = metadata.manifestIcons?.[0] || metadata.favicon;
  const icon512 = metadata.manifestIcons?.[1] || icon192;
  const startPath =
    metadata.route.kind === "landing"
      ? `/landing/${metadata.route.slug}`
      : metadata.route.kind === "cardapio"
        ? `/cardapio/${metadata.route.slug}`
      : metadata.route.kind === "catalogo"
        ? `/catalogo/${metadata.route.slug}`
      : `/${metadata.route.slug}`;

  return {
    name: metadata.title,
    short_name: shortName || DEFAULT_TITLE,
    description: metadata.description,
    start_url: startPath,
    scope: startPath,
    display: "standalone",
    theme_color: metadata.themeColor,
    background_color: metadata.backgroundColor,
    icons: [
      {
        src: icon192,
        sizes: "192x192",
        type: getIconType(icon192),
        purpose: "any",
      },
      {
        src: icon512,
        sizes: "512x512",
        type: getIconType(icon512),
        purpose: "any maskable",
      },
    ],
  };
}

function injectMetadata(html, metadata) {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const image = escapeHtml(metadata.image);
  const favicon = escapeHtml(metadata.favicon || DEFAULT_FAVICON);
  const faviconType = escapeHtml(getIconType(metadata.favicon || DEFAULT_FAVICON));
  const shortcutIcon = escapeHtml(metadata.shortcutIcon || favicon);
  const shortcutIconType = escapeHtml(getIconType(metadata.shortcutIcon || favicon));
  const appleTouchIcon = escapeHtml(metadata.appleTouchIcon || favicon);
  const url = escapeHtml(normalizeCanonicalUrl(metadata.url));
  const tags = [
    `<title>${title}</title>`,
    buildResourceHints(),
    `<link rel="icon" type="${faviconType}" href="${favicon}" />`,
    `<link rel="shortcut icon" type="${shortcutIconType}" href="${shortcutIcon}" />`,
    `<link rel="apple-touch-icon" href="${appleTouchIcon}" />`,
    `<link rel="manifest" href="${escapeHtml(metadata.manifestUrl)}" />`,
    `<meta name="description" content="${description}" />`,
    `<meta name="author" content="${escapeHtml(metadata.author || DEFAULT_TITLE)}" />`,
    `<meta name="keywords" content="${escapeHtml(
      metadata.keywords || buildKeywords([metadata.title, metadata.description])
    )}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots || "index,follow")}" />`,
    `<meta name="theme-color" content="${escapeHtml(metadata.themeColor)}" />`,
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
    metadata.jsonLd
      ? `<script id="schema-org-jsonld" type="application/ld+json">${escapeJsonScript(
          metadata.jsonLd
        )}</script>`
      : "",
    metadata.googleSiteVerification
      ? `<meta name="google-site-verification" content="${escapeHtml(
          metadata.googleSiteVerification
        )}" />`
      : "",
  ].join("\n    ");

  return removeResourceHints(html)
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<link\s+rel="icon"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="shortcut icon"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="apple-touch-icon"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="manifest"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="google-site-verification"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="author"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="keywords"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="theme-color"[^>]*>\s*/gi, "")
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, "")
    .replace(
      /<script\s+id="schema-org-jsonld"\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi,
      ""
    )
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace("</head>", `    ${tags}\n  </head>`);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/robots.txt") {
    return new Response(buildRobotsTxt(), {
      headers: applySecurityHeaders(
        new Headers({
          "content-type": "text/plain; charset=utf-8",
          "cache-control": REVALIDATE_CACHE_CONTROL,
        })
      ),
    });
  }

  if (url.pathname === "/sitemap.xml") {
    const empresas = await getEmpresasParaSitemap(context.env);

    return new Response(buildSitemapXml(empresas), {
      headers: applySecurityHeaders(
        new Headers({
          "content-type": "application/xml; charset=utf-8",
          "cache-control": REVALIDATE_CACHE_CONTROL,
        })
      ),
    });
  }

  if (url.pathname === "/manifest.webmanifest") {
    const slug = url.searchParams.get("slug") || "";
    const kindParam = url.searchParams.get("kind");
    const kind =
      kindParam === "landing" || kindParam === "cardapio" || kindParam === "catalogo"
        ? kindParam
        : "public";
    const empresa = slug ? await getEmpresa(context.env, slug) : null;
    const route = { kind, slug };
    const metadata = buildMetadata(route, empresa);

    return new Response(JSON.stringify(buildManifest(metadata)), {
      headers: applySecurityHeaders(
        new Headers({
          "content-type": "application/manifest+json; charset=utf-8",
          "cache-control": REVALIDATE_CACHE_CONTROL,
        })
      ),
    });
  }

  const route = getRequestRoute(url.pathname);
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  const googleSiteVerification = getGoogleSiteVerification(context.env);

  if (!route || !contentType.includes("text/html")) {
    if (!contentType.includes("text/html")) {
      if (!isLongCacheAsset(url.pathname, contentType)) {
        return response;
      }

      const headers = new Headers(response.headers);

      applyCacheControl(headers, LONG_CACHE_CONTROL);
      applySecurityHeaders(headers);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    const html = injectBaseRobotsMetadata(await response.text(), {
      googleSiteVerification,
      robots: isPrivatePath(url.pathname) ? "noindex,nofollow" : "index,follow",
    });
    const headers = new Headers(response.headers);

    headers.set("content-type", "text/html; charset=utf-8");
    applyCacheControl(headers, HTML_CACHE_CONTROL);
    applySecurityHeaders(headers);

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const empresa = await getEmpresa(context.env, route.slug);
  const metadata = {
    ...buildMetadata(route, empresa),
    googleSiteVerification,
  };
  const html = injectMetadata(await response.text(), metadata);
  const headers = new Headers(response.headers);

  headers.set("content-type", "text/html; charset=utf-8");
  applyCacheControl(headers, HTML_CACHE_CONTROL);
  applySecurityHeaders(headers);

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
