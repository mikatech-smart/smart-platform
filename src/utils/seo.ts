import { BrandConfig } from "../config/brand";

type MetaAttribute = "name" | "property";
type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLdObject = { [key: string]: JsonLdValue };

export type SeoMetadata = {
  title: string;
  description: string;
  url: string;
  image: string;
  author?: string;
  favicon?: string;
  jsonLd?: JsonLdObject;
  manifestUrl?: string;
  robots?: "index,follow" | "noindex,nofollow";
  themeColor?: string;
  type?: string;
  keywords?: string;
};

export type BusinessJsonLdInput = {
  name: string;
  description?: string | null;
  url: string;
  logo?: string | null;
  image?: string | null;
  category?: string | null;
  telephone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  sameAs?: Array<string | null | undefined>;
};

const DEFAULT_DESCRIPTION =
  "Conheca empresas, servicos e canais de contato publicados na MikaON.";

function getPublicBaseUrl() {
  return BrandConfig.publicAppUrl.replace(/\/$/, "");
}

export function getPublicUrl(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${getPublicBaseUrl()}${path}`;
}

export function getManifestUrl(slug: string, kind: "public" | "landing") {
  const params = new URLSearchParams({
    slug,
    kind,
  });

  return getPublicUrl(`/manifest.webmanifest?${params.toString()}`);
}

export function getInstitutionalShareImage() {
  const favicon = BrandConfig.pwaIcon512 || BrandConfig.favicon || "/favicon.svg";

  if (favicon.startsWith("http://") || favicon.startsWith("https://")) {
    return favicon;
  }

  return `${getPublicBaseUrl()}${favicon.startsWith("/") ? favicon : `/${favicon}`}`;
}

export function normalizeSeoText(value?: string | null, fallback = "") {
  return value?.trim() || fallback;
}

export function normalizeSeoDescription(value?: string | null) {
  const description = normalizeSeoText(value, DEFAULT_DESCRIPTION);

  return description.length > 180
    ? `${description.slice(0, 177).trim()}...`
    : description;
}

export function normalizeSeoImage(value?: string | null) {
  const image = value?.trim();

  if (!image) return getInstitutionalShareImage();
  if (image.startsWith("http://") || image.startsWith("https://")) return image;

  return `${getPublicBaseUrl()}${image.startsWith("/") ? image : `/${image}`}`;
}

function splitKeywordText(value?: string | null) {
  return cleanText(value)
    .split(/[\s,.;:/|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

export function createSeoKeywords(values: Array<string | null | undefined>) {
  const keywords = values
    .flatMap((value) => [cleanText(value), ...splitKeywordText(value)])
    .filter(Boolean);
  const uniqueKeywords = Array.from(
    new Set([
      BrandConfig.platformName,
      BrandConfig.publicAppUrl.replace(/^https?:\/\//, ""),
      ...keywords,
    ])
  );

  return uniqueKeywords.slice(0, 24).join(", ");
}

export function normalizeFavicon(value?: string | null) {
  return normalizeSeoImage(value || BrandConfig.favicon);
}

function cleanText(value?: string | null) {
  return value?.trim() || "";
}

function cleanUrl(value?: string | null) {
  const url = value?.trim() || "";

  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return `https://${url}`;
}

function compactObject<T extends JsonLdObject>(value: T): T {
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

export function createBusinessJsonLd(input: BusinessJsonLdInput): JsonLdObject {
  const address = cleanText(input.address);
  const telephone = cleanText(input.telephone) || cleanText(input.whatsapp);
  const sameAs = [
    cleanUrl(input.website),
    ...(input.sameAs || []).map((url) => cleanUrl(url)),
  ].filter(Boolean);
  const hasLocalBusinessSignals = Boolean(
    address || telephone || cleanText(input.category)
  );

  return compactObject({
    "@context": "https://schema.org",
    "@type": hasLocalBusinessSignals ? "LocalBusiness" : "Organization",
    name: cleanText(input.name) || BrandConfig.platformName,
    description: cleanText(input.description),
    url: input.url,
    logo: input.logo ? normalizeSeoImage(input.logo) : getInstitutionalShareImage(),
    image: normalizeSeoImage(input.image || input.logo),
    telephone,
    email: cleanText(input.email),
    address,
    sameAs,
  });
}

function normalizeThemeColor(value?: string | null) {
  const color = value?.trim();

  return color && /^#[0-9a-f]{3,8}$/i.test(color) ? color : "#064e3b";
}

function upsertMeta(attribute: MetaAttribute, key: string, content?: string) {
  const value = content?.trim() || "";
  const selector = `meta[${attribute}="${key}"]`;
  const current = document.head.querySelector<HTMLMetaElement>(selector);

  if (!value) {
    current?.remove();
    return;
  }

  const meta = current || document.createElement("meta");
  meta.setAttribute(attribute, key);
  meta.setAttribute("content", value);

  if (!current) {
    document.head.appendChild(meta);
  }
}

export function applyGoogleSiteVerification(content = BrandConfig.googleSiteVerification) {
  upsertMeta("name", "google-site-verification", content);
}

export function applyRobotsMetadata(content: SeoMetadata["robots"] = "index,follow") {
  upsertMeta("name", "robots", content);
}

function upsertCanonical(url: string) {
  const current = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  const link = current || document.createElement("link");

  link.setAttribute("rel", "canonical");
  link.setAttribute("href", url);

  if (!current) {
    document.head.appendChild(link);
  }
}

function serializeJsonLd(jsonLd: JsonLdObject) {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

function upsertJsonLd(jsonLd?: JsonLdObject) {
  const id = "schema-org-jsonld";
  const current = document.head.querySelector<HTMLScriptElement>(`#${id}`);

  if (!jsonLd || Object.keys(jsonLd).length === 0) {
    current?.remove();
    return;
  }

  const script = current || document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = serializeJsonLd(jsonLd);

  if (!current) {
    document.head.appendChild(script);
  }
}

function upsertLink(rel: string, href: string) {
  const current = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`
  );
  const link = current || document.createElement("link");

  link.setAttribute("rel", rel);
  link.setAttribute("href", href);

  if (!current) {
    document.head.appendChild(link);
  }
}

function getIconType(href: string) {
  const url = href.split("?")[0].toLowerCase();

  if (url.endsWith(".svg")) return "image/svg+xml";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".ico")) return "image/x-icon";

  return "image/png";
}

function upsertIcon(rel: "icon" | "shortcut icon" | "apple-touch-icon", href: string) {
  const current = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`
  );
  const link = current || document.createElement("link");

  link.setAttribute("rel", rel);
  link.setAttribute("href", href);

  if (rel !== "apple-touch-icon") {
    link.setAttribute("type", getIconType(href));
  } else {
    link.removeAttribute("type");
  }

  if (!current) {
    document.head.appendChild(link);
  }
}

export function applyFavicon(href?: string | null) {
  const hasCustomFavicon = Boolean(href?.trim());
  const favicon = normalizeFavicon(href);
  const shortcutIcon = hasCustomFavicon
    ? favicon
    : normalizeSeoImage(BrandConfig.shortcutIcon || BrandConfig.favicon);
  const appleTouchIcon = hasCustomFavicon
    ? favicon
    : normalizeSeoImage(BrandConfig.appleTouchIcon || BrandConfig.favicon);

  upsertIcon("icon", favicon);
  upsertIcon("shortcut icon", shortcutIcon);
  upsertIcon("apple-touch-icon", appleTouchIcon);
}

function applyWebAppMetadata(manifestUrl?: string, themeColor?: string | null) {
  if (manifestUrl) {
    upsertLink("manifest", manifestUrl);
  }

  upsertMeta("name", "theme-color", normalizeThemeColor(themeColor));
}

export function applySeoMetadata(metadata: SeoMetadata) {
  const title = normalizeSeoText(metadata.title, BrandConfig.platformName);
  const description = normalizeSeoDescription(metadata.description);
  const image = normalizeSeoImage(metadata.image);
  const type = metadata.type || "website";

  document.title = title;
  applyFavicon(metadata.favicon);
  applyWebAppMetadata(metadata.manifestUrl, metadata.themeColor);
  applyGoogleSiteVerification();
  applyRobotsMetadata(metadata.robots || "index,follow");
  upsertJsonLd(metadata.jsonLd);
  upsertCanonical(metadata.url);
  upsertMeta("name", "description", description);
  upsertMeta("name", "author", metadata.author || BrandConfig.platformName);
  upsertMeta(
    "name",
    "keywords",
    metadata.keywords || createSeoKeywords([metadata.title, metadata.description])
  );
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:url", metadata.url);
  upsertMeta("property", "og:type", type);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);
}
