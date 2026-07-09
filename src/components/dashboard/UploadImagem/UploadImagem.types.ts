export interface UploadImagemProps {
  titulo: string;
  imagem?: string;
  tipoArquivo?: "imagem" | "audio";
  accept?: string;
  formatosPermitidos?: string;

  pasta?: string;
  onUpload?: (url: string) => Promise<void>;
  onSelecionar?: (arquivo: File) => void;
}
