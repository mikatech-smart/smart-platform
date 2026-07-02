export type AgentPriority =
  | "low"
  | "medium"
  | "high";

export interface AgentResponse {
  agent: string;

  title: string;

  message: string;

  priority: AgentPriority;
}

export interface BusinessContext {
  businessScore: number;

  clients: number;

  reviews: number;

  nfcEnabled: boolean;

  wifiEnabled: boolean;

  whatsappEnabled: boolean;
}