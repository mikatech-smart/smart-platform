export interface HeaderEmpresaProps {
  nome: string;
  categoria: string;
  logo?: string | null;
  banner?: string | null;
  publicado?: boolean;
  ultimaAtualizacao?: string;
  onPublicar?: () => void;
}