export type ThemeType =
  | "green"
  | "black"
  | "blue";

export type BusinessCategory =
  | "restaurant"
  | "store"
  | "office"
  | "workshop"
  | "clinic"
  | "beauty"
  | "service"
  | "other";

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  facebook: string;
  website: string;
}

export interface PixData {
  key: string;
  holder: string;
}

export interface GoogleData {
  maps: string;
  reviews: string;
}

export interface WifiData {
  enabled: boolean;
  network: string;
  password: string;
}

export interface BusinessProfile {
  id: string;

  slug: string;

  companyName: string;

  category: BusinessCategory;

  description: string;

  logo: string;

  cover: string;

  phone: string;

  email: string;

  address: string;

  openingHours: string;

  theme: ThemeType;

  socials: SocialLinks;

  pix: PixData;

  google: GoogleData;

  wifi: WifiData;

  active: boolean;

  createdAt: Date;

  updatedAt: Date;
}