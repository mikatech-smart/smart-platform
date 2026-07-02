import type { BusinessProfile } from "../models/business-profile";

export const business: BusinessProfile = {
  id: "1",

  slug: "mikatech",

  companyName: "MiKATECH",

  category: "service",

  description:
    "Especialistas em comunicação visual, brindes personalizados e soluções digitais para empresas.",

  logo:
    "https://placehold.co/200x200/png",

  cover:
    "https://placehold.co/1200x500/22C55E/FFFFFF?text=MiKA+Connect",

  phone: "(15) 99999-9999",

  email: "contato@mikatech.com.br",

  address:
    "Rua Estanislau Camargo Sampaio, 182 - Sorocaba/SP",

  openingHours:
    "Segunda à Sexta • 08:00 às 18:00",

  theme: "green",

  socials: {
    whatsapp: "https://wa.me/5515999999999",

    instagram: "https://instagram.com/mikatech1",

    facebook: "",

    website: "https://mikatech.com.br",
  },

  pix: {
    key: "pix@mikatech.com.br",

    holder: "MiKATECH",
  },

  google: {
    maps: "",

    reviews: "",
  },

  wifi: {
    enabled: true,

    network: "MiKATECH",

    password: "12345678",
  },

  active: true,

  createdAt: new Date(),

  updatedAt: new Date(),
};