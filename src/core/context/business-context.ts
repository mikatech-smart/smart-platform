import { BusinessContext } from "../types";

export function createBusinessContext(): BusinessContext {
  return {
    businessScore: 78,

    clients: 42,

    reviews: 18,

    nfcEnabled: true,

    wifiEnabled: true,

    whatsappEnabled: false,
  };
}