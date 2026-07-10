export const BrandConfig = {
  platformName: "MikaON",
  developerCompany: "Mikatech",
  primaryDomain: "mikaon.com.br",
  platformUrl: "https://mikaon.com.br",
  publicAppUrl: "https://smart.mikaon.com.br",
  defaultEmail: "contato@mikaon.com.br",
  poweredByText: "Powered by Mikatech",
  logo: "",
  favicon: "/favicon.svg?v=102",
  shortcutIcon: "/favicon.ico?v=102",
  appleTouchIcon: "/apple-touch-icon.png?v=102",
  maskIcon: "/mask-icon.svg?v=102",
  pwaIcon192: "/android-chrome-192x192.png?v=102",
  pwaIcon512: "/android-chrome-512x512.png?v=102",
} as const;

export type BrandConfigType = typeof BrandConfig;
