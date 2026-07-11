export interface Empresa {
  id: string;

  nome: string;
  slug: string;

  categoria: string;
  tipo: string;

  descricao: string;

  telefone: string;
  whatsapp: string;

  email: string;

  instagram: string;
  tiktok?: string | null;
  youtube?: string | null;
  kwai?: string | null;

  facebook: string;

  site: string;

  endereco: string;
  horario_atendimento?: string | null;
  google_review_url?: string | null;

  pix: string;
  pix_nome?: string | null;
  pix_chave?: string | null;

  wifi_nome?: string | null;

  wifi_senha?: string | null;

  landing_page_config?: unknown;
  cardapio_config?: unknown;
  catalogo_config?: unknown;
  agendamento_config?: unknown;

  logo: string;

  banner: string;

  ativo: boolean;

  created_at?: string;

  updated_at?: string;
}

export const empresaInicial: Empresa = {
  id: "",

  nome: "",
  slug: "",

  categoria: "",
  tipo: "",

  descricao: "",

  telefone: "",
  whatsapp: "",

  email: "",

  instagram: "",
  tiktok: "",
  youtube: "",
  kwai: "",

  facebook: "",

  site: "",

  endereco: "",

  pix: "",
  pix_nome: "",
  pix_chave: "",

  wifi_nome: "",

  wifi_senha: "",

  logo: "",

  banner: "",

  ativo: true,
};
