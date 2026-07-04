export interface UploadImagemProps {
  titulo: string;
  imagem?: string;

  pasta?: string;
  onUpload?: (url: string) => Promise<void>;
  onSelecionar?: (arquivo: File) => void;
}
