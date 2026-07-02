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

  site: string;

  endereco: string;

  pix: string;

  wifi_nome: string;

  wifi_senha: string;

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

  site: "",

  endereco: "",

  pix: "",

  wifi_nome: "",

  wifi_senha: "",

  logo: "",

  banner: "",

  ativo: true,
};