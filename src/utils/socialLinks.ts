export type RedeSocial =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "kwai";

const segmentosTecnicos = new Set(["p", "reel", "reels", "tv", "channel", "c", "user"]);

export function normalizarUsuarioRedeSocial(valor: string) {
  const texto = valor.trim();
  if (!texto) return "";

  const semEspacos = texto.replace(/\s+/g, "");
  const pareceUrl =
    /^https?:\/\//i.test(semEspacos) ||
    /^www\./i.test(semEspacos) ||
    /(^|\.)instagram\.com/i.test(semEspacos) ||
    /(^|\.)facebook\.com/i.test(semEspacos) ||
    /(^|\.)tiktok\.com/i.test(semEspacos) ||
    /(^|\.)youtube\.com/i.test(semEspacos) ||
    /(^|\.)youtu\.be/i.test(semEspacos) ||
    /(^|\.)kwai\.com/i.test(semEspacos) ||
    /(^|\.)k\.kwai\.com/i.test(semEspacos);

  if (!pareceUrl) return semEspacos.replace(/^@+/, "").replace(/[?#].*$/, "");

  try {
    const url = new URL(
      /^https?:\/\//i.test(semEspacos) ? semEspacos : `https://${semEspacos}`
    );
    const partes = url.pathname.split("/").map((parte) => parte.trim()).filter(Boolean);
    const identificador = partes.find(
      (parte) => !segmentosTecnicos.has(parte.toLowerCase())
    );
    return (identificador || "").replace(/^@+/, "").replace(/[?#].*$/, "");
  } catch {
    return semEspacos.replace(/^@+/, "").replace(/[?#].*$/, "");
  }
}

export function criarLinkRedeSocial(rede: RedeSocial, valor: string) {
  const usuario = normalizarUsuarioRedeSocial(valor);
  if (!usuario) return "";

  const bases: Record<RedeSocial, string> = {
    instagram: "https://instagram.com/",
    tiktok: "https://www.tiktok.com/@",
    youtube: "https://www.youtube.com/@",
    facebook: "https://facebook.com/",
    kwai: "https://kwai.com/@",
  };

  return `${bases[rede]}${usuario}`;
}
