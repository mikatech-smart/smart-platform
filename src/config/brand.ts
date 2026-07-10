export const BrandConfig = {
  platformName: "MikaON",
  developerCompany: "Mikatech",
  primaryDomain: "mikaon.com.br",
  platformUrl: "https://mikaon.com.br",
  publicAppUrl: "https://smart.mikaon.com.br",
  defaultEmail: "contato@mikaon.com.br",
  poweredByText: "Powered by Mikatech",
  logo: "",
  favicon: "/favicon.svg",
} as const;

export type BrandConfigType = typeof BrandConfig;
