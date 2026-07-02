export interface Cliente {

  // Identificação
  id: string;

  nome: string;

  whatsapp: string;

  // Informações opcionais
  empresa?: string;

  email?: string;

  cidade?: string;

  endereco?: string;

  aniversario?: string;

  observacao?: string;

  // Informações inteligentes
  origem?: "NFC" | "WhatsApp" | "Manual" | "Site" | "QR Code";

  status: "Ativo" | "Inativo";

  tags: string[];

  // Histórico
  dataCadastro: Date;

  ultimoAtendimento?: Date;

  ultimaCompra?: Date;

  quantidadeCompras: number;

  valorTotalCompras: number;

  // Relacionamento
  businessScore: number;

  reviews: number;

  ultimaCampanha?: Date;

  aceitaMarketing: boolean;

  // Controle
  criadoPor: string;

  atualizadoEm: Date;

}