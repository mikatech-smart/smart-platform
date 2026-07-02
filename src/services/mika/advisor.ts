export interface AdvisorMessage {
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
}

interface BusinessData {
  score: number;
  reviewsEnabled: boolean;
  whatsappEnabled: boolean;
  nfcEnabled: boolean;
  wifiEnabled: boolean;
}

export function getAdvisorMessage(
  business: BusinessData
): AdvisorMessage {

  // Score baixo
  if (business.score < 40) {
    return {
      title: "Sua empresa precisa de atenção",
      message:
        "Seu Business Score está baixo. Recomendamos ativar os módulos essenciais para aumentar sua presença digital.",
      priority: "high",
    };
  }

  // Reviews desligado
  if (!business.reviewsEnabled) {
    return {
      title: "Ative o Smart Reviews",
      message:
        "Empresas com avaliações frequentes aumentam a confiança dos clientes e conquistam mais vendas.",
      priority: "medium",
    };
  }

  // WhatsApp desligado
  if (!business.whatsappEnabled) {
    return {
      title: "Configure o WhatsApp IA",
      message:
        "Automatize atendimentos e responda seus clientes com muito mais rapidez.",
      priority: "medium",
    };
  }

  // NFC desligado
  if (!business.nfcEnabled) {
    return {
      title: "Ative o Smart NFC",
      message:
        "Facilite o acesso dos clientes aos seus serviços e aumente a interação com sua empresa.",
      priority: "medium",
    };
  }

  // Wi-Fi desligado
  if (!business.wifiEnabled) {
    return {
      title: "Ative o Wi-Fi Marketing",
      message:
        "Capture contatos automaticamente e fortaleça seu relacionamento com os clientes.",
      priority: "medium",
    };
  }

  // Tudo certo
  return {
    title: "Excelente trabalho!",
    message:
      "Sua empresa está bem configurada. Continue acompanhando os indicadores para manter um crescimento constante.",
    priority: "low",
  };
}