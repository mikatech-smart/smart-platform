import { BrandConfig } from "../config/brand";

type MetaAttribute = "name" | "property";

export type SeoMetadata = {
  title: string;
  description: string;
  url: string;
  image: string;
  favicon?: string;
  manifestUrl?: string;
  themeColor?: string;
  type?: string;
  keywords?: string;
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
  const favicon = BrandConfig.favicon || "/favicon.svg";

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

export function normalizeFavicon(value?: string | null) {
  return normalizeSeoImage(value || BrandConfig.favicon);
}

function normalizeThemeColor(value?: string | null) {
  const color = value?.trim();

  return color && /^#[0-9a-f]{3,8}$/i.test(color) ? color : "#166534";
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
  const favicon = normalizeFavicon(href);

  upsertIcon("icon", favicon);
  upsertIcon("shortcut icon", favicon);
  upsertIcon("apple-touch-icon", favicon);
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
  upsertCanonical(metadata.url);
  upsertMeta("name", "description", description);
  upsertMeta("name", "keywords", metadata.keywords);
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
